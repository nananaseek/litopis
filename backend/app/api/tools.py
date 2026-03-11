import logging
import re
from datetime import UTC, datetime, timedelta

import httpx
from beanie import PydanticObjectId
from beanie.operators import In
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user, get_current_user_optional
from app.core.events import broadcast
from app.models.favorite import ToolFavorite
from app.models.rating import ToolRating
from app.models.tool import Tool
from app.models.user import User
from app.schemas.tool import ToolCreate, ToolDetailResponse, ToolResponse, ToolRatingSet, ToolUpdate, MyToolsResponse, LibraryResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tools", tags=["tools"])

_GITHUB_REPO_RE = re.compile(r"github\.com/([^/]+/[^/#?]+)")


def _tool_to_response(
    tool: Tool,
    user_rating: int | None = None,
    is_favorited: bool | None = None,
) -> ToolResponse:
    return ToolResponse(
        id=str(tool.id),
        name=tool.name,
        description=tool.description,
        category=tool.category,
        icon=tool.icon,
        tags=tool.tags,
        license=tool.license,
        github_url=str(tool.github_url) if tool.github_url else None,
        official_url=str(tool.official_url) if tool.official_url else None,
        download_url=str(tool.download_url) if tool.download_url else None,
        is_published=tool.is_published,
        owner_id=str(tool.owner_id),
        created_at=tool.created_at,
        updated_at=tool.updated_at,
        average_rating=getattr(tool, "average_rating", None),
        rating_count=getattr(tool, "rating_count", 0) or 0,
        user_rating=user_rating,
        is_favorited=is_favorited,
    )


async def _fetch_github_readme(github_url: str) -> str | None:
    match = _GITHUB_REPO_RE.search(str(github_url))
    if not match:
        logger.warning("GitHub URL regex did not match: %s", github_url)
        return None
    repo = match.group(1).rstrip("/")
    api_url = f"https://api.github.com/repos/{repo}/readme"
    headers = {"Accept": "application/vnd.github.html+json"}
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(api_url, headers=headers)
            if resp.status_code == 200:
                logger.info("Fetched README via GitHub API for %s", repo)
                return resp.text
            logger.warning("GitHub API returned %s for %s", resp.status_code, repo)
    except Exception as exc:
        logger.error("Failed to fetch README for %s: %s", repo, exc)
    return None


async def _recalculate_tool_rating(tool_id: PydanticObjectId) -> None:
    """Оновлює average_rating та rating_count для інструменту."""
    tool = await Tool.get(tool_id)
    if tool is None:
        return
    ratings = await ToolRating.find(ToolRating.tool_id == tool_id).to_list()
    if not ratings:
        await tool.set({Tool.average_rating: None, Tool.rating_count: 0, Tool.updated_at: datetime.now(UTC)})
        return
    total = sum(r.value for r in ratings)
    count = len(ratings)
    avg = round(total / count, 1)
    await tool.set({Tool.average_rating: avg, Tool.rating_count: count, Tool.updated_at: datetime.now(UTC)})


async def _get_own_tool(tool_id: str, user: User) -> Tool:
    try:
        oid = PydanticObjectId(tool_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний ID")
    tool = await Tool.get(oid)
    if tool is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Інструмент не знайдено")
    if tool.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ заборонено")
    return tool


@router.get("/my", response_model=MyToolsResponse)
async def get_my_tools(
    user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: str | None = Query(None, description="Фільтр по категорії"),
    search: str | None = Query(None, description="Пошук по назві, опису, тегах"),
):
    query = Tool.find(Tool.owner_id == user.id)
    if category:
        query = query.find(Tool.category == category)
    if search:
        query = query.find(
            {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"tags": {"$regex": search, "$options": "i"}},
                ]
            }
        )
    total = await query.count()
    tools = await query.sort(-Tool.created_at).skip(skip).limit(limit).to_list()
    if not tools:
        return MyToolsResponse(items=[], total=total)
    tool_ids = [t.id for t in tools]
    favs = await ToolFavorite.find(
        ToolFavorite.user_id == user.id,
        In(ToolFavorite.tool_id, tool_ids),
    ).to_list()
    fav_ids = {f.tool_id for f in favs}
    items = [_tool_to_response(t, is_favorited=t.id in fav_ids) for t in tools]
    return MyToolsResponse(items=items, total=total)


@router.post("/", response_model=ToolResponse, status_code=status.HTTP_201_CREATED)
async def create_tool(data: ToolCreate, user: User = Depends(get_current_user)):
    now = datetime.now(UTC)
    readme = None
    if data.github_url:
        readme = await _fetch_github_readme(str(data.github_url))
    tool = Tool(
        **data.model_dump(),
        readme_content=readme,
        owner_id=user.id,
        is_published=False,
        created_at=now,
        updated_at=now,
    )
    await tool.insert()
    return _tool_to_response(tool)


@router.get("/library/stats")
async def get_library_stats():
    """Кількість опублікованих інструментів: всього та нових (доданих за останні 5 днів)."""
    total = await Tool.find(Tool.is_published == True).count()  # noqa: E712
    cutoff = datetime.now(UTC) - timedelta(days=5)
    new = await Tool.find(
        Tool.is_published == True,  # noqa: E712
        Tool.created_at >= cutoff,
    ).count()
    return {"total": total, "new": new}


@router.get("/library", response_model=LibraryResponse)
async def get_library(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: str | None = Query(None),
    search: str | None = Query(None),
    tag: str | None = Query(None),
    min_rating: int | None = Query(None, ge=1, le=5, description="Мінімальний середній рейтинг (1-5)"),
    user: User | None = Depends(get_current_user_optional),
):
    query = Tool.find(Tool.is_published == True)  # noqa: E712
    if category:
        query = query.find(Tool.category == category)
    if tag:
        query = query.find({"tags": tag})
    if search:
        query = query.find(
            {"$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$regex": search, "$options": "i"}},
            ]}
        )
    if min_rating is not None:
        query = query.find(Tool.average_rating >= float(min_rating))
    total = await query.count()
    tools = await query.sort(-Tool.created_at).skip(skip).limit(limit).to_list()
    user_ratings_map: dict[str, int] = {}
    fav_ids: set[PydanticObjectId] = set()
    if user and tools:
        tool_ids = [t.id for t in tools]
        ratings = await ToolRating.find(
            In(ToolRating.tool_id, tool_ids),
            ToolRating.user_id == user.id,
        ).to_list()
        for r in ratings:
            user_ratings_map[str(r.tool_id)] = r.value
        favs = await ToolFavorite.find(
            ToolFavorite.user_id == user.id,
            In(ToolFavorite.tool_id, tool_ids),
        ).to_list()
        fav_ids = {f.tool_id for f in favs}
    items = [
        _tool_to_response(t, user_ratings_map.get(str(t.id)), is_favorited=t.id in fav_ids if user else None)
        for t in tools
    ]
    return LibraryResponse(items=items, total=total)


@router.get("/favorites", response_model=list[ToolResponse])
async def get_favorites(
    user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """Список інструментів, доданих у улюблені поточним користувачем."""
    favs = (
        await ToolFavorite.find(ToolFavorite.user_id == user.id)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    if not favs:
        return []
    tool_ids = [f.tool_id for f in favs]
    tools = await Tool.find(In(Tool.id, tool_ids)).to_list()
    tools_by_id = {t.id: t for t in tools}
    fav_ids = set(tool_ids)
    return [
        _tool_to_response(tools_by_id[tid], is_favorited=True)
        for tid in tool_ids
        if tid in tools_by_id
    ]


@router.post("/{tool_id}/favorite", response_model=ToolResponse)
async def add_favorite(tool_id: str, user: User = Depends(get_current_user)):
    """Додати інструмент у улюблені."""
    try:
        oid = PydanticObjectId(tool_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний ID")
    tool = await Tool.get(oid)
    if tool is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Інструмент не знайдено")
    existing = await ToolFavorite.find_one(
        ToolFavorite.user_id == user.id,
        ToolFavorite.tool_id == oid,
    )
    if existing:
        return _tool_to_response(tool, is_favorited=True)
    await ToolFavorite(user_id=user.id, tool_id=oid).insert()
    return _tool_to_response(tool, is_favorited=True)


@router.delete("/{tool_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(tool_id: str, user: User = Depends(get_current_user)):
    """Прибрати інструмент з улюблених."""
    try:
        oid = PydanticObjectId(tool_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний ID")
    fav = await ToolFavorite.find_one(
        ToolFavorite.user_id == user.id,
        ToolFavorite.tool_id == oid,
    )
    if fav:
        await fav.delete()
    return None


@router.get("/detail/{tool_id}", response_model=ToolDetailResponse)
async def get_tool_detail(
    tool_id: str,
    user: User | None = Depends(get_current_user_optional),
):
    """Public detail page — accessible for published tools or by owner."""
    try:
        oid = PydanticObjectId(tool_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний ID")
    tool = await Tool.get(oid)
    if tool is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Інструмент не знайдено")

    user_rating = None
    is_favorited = None
    if user:
        rating_doc = await ToolRating.find_one(
            ToolRating.tool_id == oid,
            ToolRating.user_id == user.id,
        )
        if rating_doc:
            user_rating = rating_doc.value
        fav = await ToolFavorite.find_one(ToolFavorite.user_id == user.id, ToolFavorite.tool_id == oid)
        is_favorited = fav is not None
    resp = _tool_to_response(tool, user_rating, is_favorited=is_favorited)
    return ToolDetailResponse(
        **resp.model_dump(),
        readme_content=tool.readme_content,
        about_content=tool.about_content,
    )


@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: str, user: User = Depends(get_current_user)):
    tool = await _get_own_tool(tool_id, user)
    fav = await ToolFavorite.find_one(ToolFavorite.user_id == user.id, ToolFavorite.tool_id == tool.id)
    return _tool_to_response(tool, is_favorited=fav is not None)


@router.put("/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: str,
    data: ToolUpdate,
    user: User = Depends(get_current_user),
):
    tool = await _get_own_tool(tool_id, user)
    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        new_gh = update_data.get("github_url")
        old_gh = str(tool.github_url) if tool.github_url else None
        if new_gh is not None and str(new_gh) != old_gh:
            update_data["readme_content"] = await _fetch_github_readme(str(new_gh)) if new_gh else None
        update_data["updated_at"] = datetime.now(UTC)
        await tool.set(update_data)
    await broadcast({"type": "tool_updated", "tool_id": tool_id, "owner_id": str(user.id)})
    return _tool_to_response(tool)


@router.patch("/{tool_id}/refresh-readme", response_model=ToolDetailResponse)
async def refresh_readme(tool_id: str, user: User = Depends(get_current_user)):
    tool = await _get_own_tool(tool_id, user)
    readme = None
    if tool.github_url:
        readme = await _fetch_github_readme(str(tool.github_url))
    await tool.set({Tool.readme_content: readme, Tool.updated_at: datetime.now(UTC)})
    resp = _tool_to_response(tool)
    return ToolDetailResponse(
        **resp.model_dump(),
        readme_content=readme,
        about_content=tool.about_content,
    )


@router.patch("/{tool_id}/publish", response_model=ToolResponse)
async def publish_tool(tool_id: str, user: User = Depends(get_current_user)):
    tool = await _get_own_tool(tool_id, user)
    await tool.set({Tool.is_published: True, Tool.updated_at: datetime.now(UTC)})
    await broadcast({"type": "tool_published", "tool_id": tool_id})
    return _tool_to_response(tool)


@router.patch("/{tool_id}/unpublish", response_model=ToolResponse)
async def unpublish_tool(tool_id: str, user: User = Depends(get_current_user)):
    tool = await _get_own_tool(tool_id, user)
    await tool.set({Tool.is_published: False, Tool.updated_at: datetime.now(UTC)})
    await broadcast({"type": "tool_unpublished", "tool_id": tool_id})
    return _tool_to_response(tool)


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(tool_id: str, user: User = Depends(get_current_user)):
    tool = await _get_own_tool(tool_id, user)
    await tool.delete()
    await broadcast({"type": "tool_deleted", "tool_id": tool_id, "owner_id": str(user.id)})


@router.put("/{tool_id}/rating", response_model=ToolResponse)
async def set_tool_rating(
    tool_id: str,
    data: ToolRatingSet,
    user: User = Depends(get_current_user),
):
    """Встановити або оновити рейтинг інструменту (1–5). Дозволено лише для опублікованих інструментів."""
    try:
        oid = PydanticObjectId(tool_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний ID")
    tool = await Tool.get(oid)
    if tool is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Інструмент не знайдено")
    if not tool.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Рейтинг можна ставити лише для опублікованих інструментів",
        )
    existing = await ToolRating.find_one(
        ToolRating.tool_id == oid,
        ToolRating.user_id == user.id,
    )
    if existing:
        existing.value = data.value
        await existing.save()
    else:
        rating = ToolRating(tool_id=oid, user_id=user.id, value=data.value)
        await rating.insert()
    await _recalculate_tool_rating(oid)
    tool = await Tool.get(oid)
    assert tool is not None
    return _tool_to_response(tool, data.value)
