import { Link } from 'react-router-dom'
import type { ToolResponse } from '../../api/tools'
import StarRating from '../StarRating/StarRating'

interface ToolCardProps {
  tool: ToolResponse
  isOwner?: boolean
  onPublish?: () => void
  onUnpublish?: () => void
  onDelete?: () => void
}

const catColors: Record<string, string> = {
  osint: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'аналітика': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'комунікації': 'bg-green-500/20 text-green-400 border-green-500/30',
  'безпека': 'bg-red-500/20 text-red-400 border-red-500/30',
  'моніторинг': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function ToolCard({ tool, isOwner, onPublish, onUnpublish, onDelete }: ToolCardProps) {
  const catCls = catColors[tool.category.toLowerCase()] ?? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  const btnBase = 'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-opacity hover:opacity-90'

  return (
    <article className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-slate-300 dark:hover:border-white/10">
      <div className="flex items-start gap-3">
        <span className="text-[1.75rem] leading-none shrink-0">{tool.icon}</span>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-[1.0625rem] font-semibold leading-tight m-0">
            <Link to={`/tools/${tool.id}`} className="text-slate-900 dark:text-gray-100 no-underline hover:text-blue-500 dark:hover:text-blue-400 hover:underline">
              {tool.name}
            </Link>
          </h3>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md w-fit border ${catCls}`}>
            {tool.category}
          </span>
        </div>
      </div>
      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tool.tags.map((tag) => (
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
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {tool.github_url && (
          <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className={`${btnBase} bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/15`}>GitHub</a>
        )}
        {tool.official_url && (
          <a href={tool.official_url} target="_blank" rel="noopener noreferrer" className={`${btnBase} bg-blue-600 text-white`}>Сайт</a>
        )}
        {isOwner && !tool.is_published && onPublish && (
          <button type="button" className={`${btnBase} bg-green-500 text-white`} onClick={onPublish}>Опублікувати</button>
        )}
        {isOwner && tool.is_published && onUnpublish && (
          <button type="button" className={`${btnBase} bg-amber-500 text-white`} onClick={onUnpublish}>Зняти</button>
        )}
        {isOwner && onDelete && (
          <button type="button" className={`${btnBase} bg-red-500 text-white`} onClick={onDelete}>Видалити</button>
        )}
      </div>
    </article>
  )
}
