import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { getToolDetail, updateTool, refreshReadme, setToolRating } from '../api/tools'
import type { ToolDetailResponse } from '../api/tools'
import type { ToolCategory } from '../types/arsenal'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { CATEGORIES } from '../data/mockTools'
import StarRating from '../components/StarRating/StarRating'

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== 'Всі') as ToolCategory[]

interface EditDraft {
  name: string; description: string; category: ToolCategory; license: string
  icon: string; tags: string[]; githubUrl: string; officialUrl: string; downloadUrl: string
}

function toolToDraft(tool: ToolDetailResponse): EditDraft {
  return { name: tool.name, description: tool.description, category: tool.category as ToolCategory, license: tool.license ?? '', icon: tool.icon, tags: [...tool.tags], githubUrl: tool.github_url ?? '', officialUrl: tool.official_url ?? '', downloadUrl: tool.download_url ?? '' }
}

const catChipColors: Record<string, string> = {
  osint: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'аналітика': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'комунікації': 'bg-green-500/20 text-green-400 border-green-500/30',
  'безпека': 'bg-red-500/20 text-red-400 border-red-500/30',
  'моніторинг': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const editInput = 'font-inherit text-[0.9375rem] px-2.5 py-1.5 border border-blue-500/50 rounded-lg bg-white dark:bg-[#12121a] text-slate-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition'
const editInputSm = `${editInput} w-full max-w-sm text-[0.8125rem]`

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [tool, setTool] = useState<ToolDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EditDraft | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [aboutEditing, setAboutEditing] = useState(false)
  const [aboutDraft, setAboutDraft] = useState('')
  const [aboutSaving, setAboutSaving] = useState(false)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)

  const loadTool = useCallback(() => {
    if (!id) return; setLoading(true)
    getToolDetail(id).then(setTool).catch(() => setError('Інструмент не знайдено')).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadTool() }, [loadTool])

  const isOwner = !!(user && tool && tool.owner_id === user.id)
  const startEdit = () => { if (!tool) return; setDraft(toolToDraft(tool)); setTagInput(''); setEditing(true) }
  const cancelEdit = () => { setEditing(false); setDraft(null); setTagInput('') }

  const handleSave = async () => {
    if (!id || !draft) return; setSaving(true)
    try {
      await updateTool(id, { name: draft.name, description: draft.description, category: draft.category, icon: draft.icon, tags: draft.tags, license: draft.license, githubUrl: draft.githubUrl, officialUrl: draft.officialUrl, downloadUrl: draft.downloadUrl })
      setEditing(false); setDraft(null); loadTool()
    } catch { /* interceptor */ } finally { setSaving(false) }
  }

  const handleRefreshReadme = async () => {
    if (!id) return; setRefreshing(true)
    try { setTool(await refreshReadme(id)) } catch { /* ignore */ } finally { setRefreshing(false) }
  }

  const startAboutEdit = () => { if (!tool) return; setAboutDraft(tool.about_content ?? ''); setAboutEditing(true) }
  const cancelAboutEdit = () => { setAboutEditing(false) }
  const handleSaveAbout = async () => {
    if (!id) return; setAboutSaving(true)
    try {
      await updateTool(id, { aboutContent: aboutDraft || null })
      setAboutEditing(false)
      loadTool()
    } catch { /* interceptor */ } finally { setAboutSaving(false) }
  }

  const addTag = () => {
    if (!draft) return; const val = tagInput.trim().toLowerCase()
    if (val && !draft.tags.includes(val)) setDraft({ ...draft, tags: [...draft.tags, val] })
    setTagInput('')
  }
  const removeTag = (tag: string) => { if (!draft) return; setDraft({ ...draft, tags: draft.tags.filter((t) => t !== tag) }) }

  const handleSetRating = async (value: number) => {
    if (!id) return
    setRatingSubmitting(true)
    try {
      const updated = await setToolRating(id, value)
      setTool((prev) => prev ? { ...prev, average_rating: updated.average_rating, rating_count: updated.rating_count, user_rating: updated.user_rating } : null)
    } catch { /* interceptor */ } finally { setRatingSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl p-8 flex flex-col gap-4">
          <div className="w-1/2 h-7 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div className="w-4/5 h-4 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div className="w-full h-24 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl p-12 text-center">
          <span className="text-4xl block mb-3">{'\u26A0\uFE0F'}</span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-4">{error || 'Інструмент не знайдено'}</h2>
          <Link to="/arsenal" className="text-blue-500 dark:text-blue-400 font-medium no-underline hover:underline">Повернутися до арсеналу</Link>
        </div>
      </div>
    )
  }

  const githubRepo = tool.github_url?.match(/github\.com\/([^/]+\/[^/]+)/)?.[1]
  const hasReadme = !!tool.readme_content
  const d = draft!
  const catCls = catChipColors[tool.category.toLowerCase()] ?? 'bg-blue-500/20 text-blue-400 border-blue-500/30'

  const headBtn = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg border border-slate-300 dark:border-white/10 bg-transparent text-slate-600 dark:text-gray-400 no-underline cursor-pointer transition hover:bg-slate-100 dark:hover:bg-white/5 hover:border-blue-500/30 hover:text-blue-500 dark:hover:text-blue-400'

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/arsenal" className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 no-underline text-sm font-medium mb-5 hover:underline">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Назад до арсеналу
      </Link>

      {/* Top card */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-3 max-sm:flex-col">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            {editing ? (
              <>
                <input className={`${editInput} w-12 text-center text-2xl p-1`} value={d.icon} onChange={(e) => setDraft({ ...d, icon: e.target.value })} maxLength={4} />
                <input className={`${editInput} text-xl font-bold flex-1 min-w-0`} value={d.name} onChange={(e) => setDraft({ ...d, name: e.target.value })} placeholder="Назва інструменту" />
              </>
            ) : (
              <>
                <span className="text-3xl leading-none">{tool.icon}</span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100 m-0 leading-tight">{tool.name}</h1>
              </>
            )}
            {tool.is_published && <span className="inline-flex items-center px-2 py-0.5 text-[0.6875rem] font-semibold rounded-full bg-green-500 text-white whitespace-nowrap">Опубліковано</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0 max-sm:self-start">
            {isOwner && !editing && (
              <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg bg-blue-600 border-blue-600 text-white cursor-pointer transition hover:opacity-90" onClick={startEdit}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Редагувати
              </button>
            )}
            {editing && (
              <>
                <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg bg-green-500 text-white cursor-pointer transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleSave} disabled={saving}>{saving ? 'Збереження...' : 'Зберегти'}</button>
                <button type="button" className={headBtn} onClick={cancelEdit}>Скасувати</button>
              </>
            )}
            {!editing && tool.official_url && (
              <a href={tool.official_url} target="_blank" rel="noopener noreferrer" className={headBtn}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M9 1h6m0 0v6m0-6L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Відвідати сайт
              </a>
            )}
            {!editing && tool.github_url && (
              <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 no-underline cursor-pointer transition hover:bg-slate-300 dark:hover:bg-white/15">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {editing ? (
          <textarea className={`${editInput} w-full resize-y min-h-16 mb-5 leading-relaxed`} value={d.description} onChange={(e) => setDraft({ ...d, description: e.target.value })} placeholder="Опис інструменту" rows={3} />
        ) : (
          <p className="text-[0.9375rem] text-slate-500 dark:text-gray-500 leading-relaxed m-0 mb-5">{tool.description || 'Опис відсутній'}</p>
        )}

        {/* Rating */}
        {!editing && (
          <div className="mb-5 pb-5 border-b border-slate-200 dark:border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Рейтинг</span>
              <StarRating
                value={tool.average_rating ?? null}
                count={tool.rating_count ?? 0}
                size="md"
              />
            </div>
          </div>
        )}

        {/* My rating — окремий блок для авторизованих */}
        {!editing && user && tool.is_published && (
          <div className="mb-5 pb-5 border-b border-slate-200 dark:border-white/5">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Мій рейтинг</span>
              <p className="text-sm text-slate-500 dark:text-gray-500 m-0">Оберіть кількість зірочок від 1 до 5. Можна змінити в будь-який час.</p>
              <StarRating
                value={tool.user_rating ?? null}
                interactive
                onChange={handleSetRating}
                size="md"
              />
              {ratingSubmitting && <span className="text-xs text-slate-500 dark:text-gray-500">Збереження...</span>}
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="bg-slate-50 dark:bg-[#0b0b12] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex flex-col gap-3 mb-5">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Категорія</span>
            {editing ? (
              <select className={`${editInput} text-[0.8125rem] py-1 w-auto`} value={d.category} onChange={(e) => setDraft({ ...d, category: e.target.value as ToolCategory })}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <div className="flex flex-wrap gap-1"><span className={`inline-block text-[0.8125rem] font-medium px-2.5 py-0.5 rounded-md border ${catCls}`}>{tool.category}</span></div>
            )}
          </div>
          {/* Tags */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Теги</span>
            {editing ? (
              <div className="flex flex-wrap gap-1.5 p-1.5 border border-blue-500/50 rounded-lg bg-white dark:bg-[#12121a] min-h-9 items-center max-w-md focus-within:ring-2 focus-within:ring-blue-500/20">
                {d.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/30">
                    {tag}
                    <button type="button" className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-500/20 text-[0.7rem]" onClick={() => removeTag(tag)}>{'\u00D7'}</button>
                  </span>
                ))}
                <input className="flex-1 min-w-24 border-none outline-none bg-transparent text-[0.8125rem] text-slate-900 dark:text-gray-100 p-0.5" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }} placeholder="Додати тег..." />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {tool.tags.length > 0
                  ? tool.tags.map((tag) => <span key={tag} className="inline-block text-[0.8125rem] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5">{tag}</span>)
                  : <span className="text-[0.8125rem] text-slate-500 dark:text-gray-500 italic">Немає тегів</span>
                }
              </div>
            )}
          </div>
          {/* License */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Ліцензія</span>
            {editing ? (
              <input className={editInputSm} value={d.license} onChange={(e) => setDraft({ ...d, license: e.target.value })} placeholder="MIT, GPL, ..." />
            ) : (
              <div className="flex flex-wrap gap-1">
                {tool.license ? <span className="inline-block text-[0.8125rem] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5">{tool.license}</span> : <span className="text-[0.8125rem] text-slate-500 dark:text-gray-500 italic">Не вказано</span>}
              </div>
            )}
          </div>
          {/* URLs (edit only) */}
          {editing && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">GitHub URL</span>
                <input className={editInputSm} type="url" value={d.githubUrl} onChange={(e) => setDraft({ ...d, githubUrl: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Офіційний сайт</span>
                <input className={editInputSm} type="url" value={d.officialUrl} onChange={(e) => setDraft({ ...d, officialUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wide">Завантаження</span>
                <input className={editInputSm} type="url" value={d.downloadUrl} onChange={(e) => setDraft({ ...d, downloadUrl: e.target.value })} placeholder="https://..." />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/5 max-sm:flex-col max-sm:items-start">
          <span className="inline-flex items-center gap-1 text-[0.8125rem] text-slate-500 dark:text-gray-500">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6h12M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            {new Date(tool.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {tool.download_url && !editing && (
            <a href={tool.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg bg-green-500 text-white no-underline hover:opacity-90 transition">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Завантажити
            </a>
          )}
        </div>
      </div>

      {/* About card */}
      <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl p-6 pb-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-gray-100 m-0 mb-0.5">Про інструмент</h2>
            <p className="text-sm text-slate-500 dark:text-gray-500 m-0">Огляд, можливості та документація</p>
          </div>
          {isOwner && !aboutEditing && (
            <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/30 transition shrink-0" onClick={startAboutEdit}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Редагувати
            </button>
          )}
        </div>

        <div className="py-6">
          {aboutEditing ? (
            <div className="mb-6">
              <textarea
                className={`${editInput} w-full min-h-[120px] resize-y mb-3`}
                value={aboutDraft}
                onChange={(e) => setAboutDraft(e.target.value)}
                placeholder="Додайте опис: огляд інструменту, можливості, примітки. Текст буде показано вище за README."
                rows={5}
              />
              <div className="flex gap-2">
                <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-lg bg-green-500 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleSaveAbout} disabled={aboutSaving}>
                  {aboutSaving ? 'Збереження...' : 'Зберегти'}
                </button>
                <button type="button" className={headBtn} onClick={cancelAboutEdit}>Скасувати</button>
              </div>
            </div>
          ) : (
            <>
              {tool.about_content && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-[#0b0b12] border border-slate-200 dark:border-white/5">
                  <div className="text-[0.9375rem] text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{tool.about_content}</div>
                </div>
              )}
            </>
          )}

          {!aboutEditing && hasReadme && (
            <div className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden mt-0">
              <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 dark:bg-[#0b0b12] border-b border-slate-200 dark:border-white/5 text-slate-800 dark:text-gray-200">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2h12a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <h3 className="text-[0.9375rem] font-semibold m-0">README</h3>
                {githubRepo && <span className="ml-auto text-xs text-slate-500 dark:text-gray-500 font-mono">{githubRepo}</span>}
                {isOwner && tool.github_url && (
                  <button type="button" className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/30 transition ml-2 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleRefreshReadme} disabled={refreshing}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8a7 7 0 0113.5-2.5M15 8a7 7 0 01-13.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M14.5 2v3.5H11M1.5 14v-3.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {refreshing ? 'Оновлення...' : 'Оновити README'}
                  </button>
                )}
              </div>
              <div className={`readme-prose ${theme === 'dark' ? 'readme-prose--dark' : ''} p-5 bg-slate-50 dark:bg-[#0b0b12]`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tool.readme_content!) }} />
            </div>
          )}

          {!aboutEditing && !hasReadme && isOwner && tool.github_url && (
            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
              <p className="text-[0.9375rem] text-slate-500 dark:text-gray-500 mb-3">README ще не завантажено з GitHub</p>
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleRefreshReadme} disabled={refreshing}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8a7 7 0 0113.5-2.5M15 8a7 7 0 01-13.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M14.5 2v3.5H11M1.5 14v-3.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {refreshing ? 'Завантаження...' : 'Завантажити README з GitHub'}
              </button>
            </div>
          )}

          {!aboutEditing && !hasReadme && !(isOwner && tool.github_url) && !tool.about_content && (
            <p className="text-[0.9375rem] text-slate-500 dark:text-gray-500 text-center py-8 m-0">Документація ще не додана.</p>
          )}
          {!aboutEditing && !hasReadme && !(isOwner && tool.github_url) && tool.about_content && (
            <p className="text-[0.9375rem] text-slate-500 dark:text-gray-500 text-center py-4 m-0">README ще не завантажено. Додайте посилання на GitHub та натисніть «Оновити README».</p>
          )}
        </div>
      </div>
    </div>
  )
}
