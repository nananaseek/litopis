import asyncio
import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.events import subscribe, unsubscribe

router = APIRouter()


@router.websocket("/ws/tools")
async def tools_ws(websocket: WebSocket):
    await websocket.accept()
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()

    async def on_event(event: dict[str, Any]) -> None:
        await queue.put(event)

    await subscribe(on_event)
    try:
        while True:
            event = await queue.get()
            await websocket.send_text(json.dumps(event))
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        await unsubscribe(on_event)
