import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ToolResponse } from '../../api/tools'
import * as toolsApi from '../../api/tools'
import StarRating from '../StarRating/StarRating'

interface ToolCardProps {
  tool: ToolResponse
  isOwner?: boolean
  onPublish?: () => void
  onUnpublish?: () => void
  onDeleteRequest?: (id: string, name: string) => void
  onFavoriteChange?: (toolId: string, isFavorited: boolean) => void
}

const catColors: Record<string, string> = {
  osint: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'аналітика': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'комунікації': 'bg-green-500/20 text-green-400 border-green-500/30',
  'безпека': 'bg-red-500/20 text-red-400 border-red-500/30',
  'моніторинг': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function ToolCard({ tool, isOwner, onPublish, onUnpublish, onDeleteRequest, onFavoriteChange }: ToolCardProps) {
  const navigate = useNavigate()
  const [favorited, setFavorited] = useState(!!tool.is_favorited)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  useEffect(() => { setFavorited(!!tool.is_favorited) }, [tool.is_favorited])
  const catCls = catColors[tool.category.toLowerCase()] ?? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  const btnBase = 'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-90'

  const goToTool = () => navigate(`/tools/${tool.id}`)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (favoriteLoading) return
    setFavoriteLoading(true)
    try {
      if (favorited) {
        await toolsApi.removeFavorite(tool.id)
        setFavorited(false)
        onFavoriteChange?.(tool.id, false)
      } else {
        await toolsApi.addFavorite(tool.id)
        setFavorited(true)
        onFavoriteChange?.(tool.id, true)
      }
    } catch { /* interceptor */ } finally { setFavoriteLoading(false) }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToTool}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToTool() } }}
      className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-slate-300 dark:hover:border-white/10 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span className="text-[1.75rem] leading-none shrink-0">{tool.icon}</span>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-[1.0625rem] font-semibold leading-tight m-0">
            <Link to={`/tools/${tool.id}`} className="text-slate-900 dark:text-gray-100 no-underline hover:text-blue-500 dark:hover:text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>
              {tool.name}
            </Link>
          </h3>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md w-fit border ${catCls}`}>
            {tool.category}
          </span>
        </div>
      </div>
      {Array.isArray(tool.tags) && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(tool.tags || []).map((tag) => (
            <span key={tag} className="text-[0.6875rem] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 border border-slate-200 dark:border-white/5">{tag}</span>
          ))}
        </div>
      )}
      <p className="text-sm text-slate-500 dark:text-gray-500 m-0 leading-relaxed">{tool.description}</p>
      <StarRating value={tool.average_rating ?? null} count={tool.rating_count ?? 0} size="sm" />
      <div className="flex flex-wrap gap-2 text-[0.8125rem] text-slate-500 dark:text-gray-500">
        {tool.license && <span>Ліцензія: {tool.license}</span>}
        {tool.is_published && <span className="text-green-400 font-medium">Опубліковано</span>}
      </div>
      <div className="flex flex-wrap gap-2 mt-auto pt-1" onClick={(e) => e.stopPropagation()}>
        <button type="button" className={`w-9 h-9 flex items-center justify-center rounded-lg border transition shrink-0 ${favorited ? 'bg-red-500/15 border-red-500/30 text-red-500 dark:text-red-400' : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'}`} onClick={handleFavoriteClick} disabled={favoriteLoading} title={favorited ? 'Прибрати з улюблених' : 'Додати в улюблені'} aria-label={favorited ? 'Прибрати з улюблених' : 'Додати в улюблені'}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"><path d="M8 12.5l-.6-.5C3.5 8.5 2 6.5 2 4.5 2 3 3.5 2 5 2c1.2 0 2.3.6 3 1.5.7-.9 1.8-1.5 3-1.5 1.5 0 3 1 3 2.5 0 2-1.5 4-5.4 7.5l-.6.5z"/></svg>
        </button>
        {tool.github_url && (
          <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className={`${btnBase} bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/15`}>GitHub</a>
        )}
        {tool.official_url && (
          <a href={tool.official_url} target="_blank" rel="noopener noreferrer" className={`${btnBase} bg-blue-600 text-white`}>Сайт</a>
        )}
        {tool.download_url && (
          <a href={tool.download_url} target="_blank" rel="noopener noreferrer" className={`${btnBase} bg-green-500 text-white`}>Завантажити</a>
        )}
        {isOwner && !tool.is_published && onPublish && (
          <button type="button" className={`${btnBase} bg-green-500 text-white`} onClick={onPublish}>Опублікувати</button>
        )}
        {isOwner && tool.is_published && onUnpublish && (
          <button type="button" className={`${btnBase} bg-amber-500 text-white`} onClick={onUnpublish}>Зняти</button>
        )}
        {isOwner && onDeleteRequest && (
          <button
            type="button"
            className={`${btnBase} bg-red-500 text-white`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDeleteRequest(tool.id, tool.name)
            }}
          >
            Видалити
          </button>
        )}
      </div>
    </article>
  )
}
