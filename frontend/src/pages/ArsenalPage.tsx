import { useState, useMemo, useEffect, useCallback } from 'react'
import AddToolModal from '../components/AddToolModal/AddToolModal'
import ToolCard from '../components/ToolCard/ToolCard'
import type { ToolFormData } from '../types/arsenal'
import { CATEGORIES } from '../data/mockTools'
import * as toolsApi from '../api/tools'
import type { ToolResponse } from '../api/tools'
import { useToolsWS } from '../hooks/useToolsWS'

type TabId = 'my' | 'library' | 'favorites'

export default function ArsenalPage() {
  const [activeTab, setActiveTab] = useState<TabId>('my')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Всі')
  const [minRating, setMinRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('popularity')
  const [modalOpen, setModalOpen] = useState(false)
  const [myTools, setMyTools] = useState<ToolResponse[]>([])
  const [libraryTools, setLibraryTools] = useState<ToolResponse[]>([])
  const [favoriteTools, setFavoriteTools] = useState<ToolResponse[]>([])
  const [libraryStats, setLibraryStats] = useState<{ total: number; new: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 9

  const loadMyTools = useCallback(async () => {
    setLoading(true)
    try { setMyTools(await toolsApi.getMyTools()) } catch { /* interceptor */ } finally { setLoading(false) }
  }, [])

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    try {
      const params: { category?: string; search?: string; min_rating?: number } = {}
      if (categoryFilter !== 'Всі') params.category = categoryFilter
      if (search) params.search = search
      if (minRating != null) params.min_rating = minRating
      setLibraryTools(await toolsApi.getLibrary(params))
      const stats = await toolsApi.getLibraryStats()
      setLibraryStats(stats)
    } catch { /* interceptor */ } finally { setLoading(false) }
  }, [categoryFilter, search, minRating])

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    try { setFavoriteTools(await toolsApi.getFavorites()) } catch { /* interceptor */ } finally { setLoading(false) }
  }, [])

  useToolsWS(useCallback(() => { loadLibrary() }, [loadLibrary]), activeTab === 'library')

  useEffect(() => {
    if (activeTab === 'my') loadMyTools()
    else if (activeTab === 'library') loadLibrary()
    else loadFavorites()
  }, [activeTab, loadMyTools, loadLibrary, loadFavorites])

  const tools = activeTab === 'my' ? myTools : activeTab === 'library' ? libraryTools : favoriteTools

  const filteredTools = useMemo(() => {
    let list = tools.filter((t) => {
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'Всі' || t.category === categoryFilter
      return activeTab === 'library' || activeTab === 'favorites' ? matchSearch && matchCategory : matchSearch && matchCategory
    })
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [tools, search, categoryFilter, sortBy, activeTab])

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / pageSize))
  const paginatedTools = useMemo(() => filteredTools.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredTools, currentPage, pageSize])

  const handleSaveTool = async (data: ToolFormData) => { await toolsApi.createTool(data); await loadMyTools() }
  const handlePublish = async (id: string) => { await toolsApi.publishTool(id); await loadMyTools() }
  const handleUnpublish = async (id: string) => { await toolsApi.unpublishTool(id); await loadMyTools() }
  const handleDelete = async (id: string) => { await toolsApi.deleteTool(id); await loadMyTools() }
  const handleFavoriteChange = useCallback(() => {
    if (activeTab === 'my') loadMyTools()
    else if (activeTab === 'library') loadLibrary()
    else loadFavorites()
  }, [activeTab, loadMyTools, loadLibrary, loadFavorites])

  const tabBase = 'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer'
  const tabActive = 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
  const tabInactive = 'border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-gray-300 hover:border-slate-400 dark:hover:border-white/20'

  const filterBase = 'px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer'
  const filterActive = 'bg-blue-600 border-blue-600 text-white'
  const filterInactive = 'border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-gray-300'

  const pageBtn = 'min-w-9 h-9 px-2 text-sm font-medium border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#12121a] text-slate-700 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-400 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#12121a]'

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-gray-100 m-0 mb-1">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            </span>
            Арсенал
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-500 m-0">Каталог інструментів та утиліт</p>
        </div>
        {activeTab === 'my' && (
          <button type="button" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition shrink-0 shadow-lg shadow-green-500/20" onClick={() => setModalOpen(true)}>
            <span className="text-lg leading-none">+</span>
            Додати інструмент
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button type="button" className={`${tabBase} ${activeTab === 'my' ? tabActive : tabInactive}`} onClick={() => { setActiveTab('my'); setCurrentPage(1) }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Мій арсенал
        </button>
        <button type="button" className={`${tabBase} ${activeTab === 'library' ? tabActive : tabInactive}`} onClick={() => { setActiveTab('library'); setCurrentPage(1) }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          Бібліотека
        </button>
        <button type="button" className={`${tabBase} ${activeTab === 'favorites' ? tabActive : tabInactive}`} onClick={() => { setActiveTab('favorites'); setCurrentPage(1) }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"><path d="M8 12.5l-.6-.5C3.5 8.5 2 6.5 2 4.5 2 3 3.5 2 5 2c1.2 0 2.3.6 3 1.5.7-.9 1.8-1.5 3-1.5 1.5 0 3 1 3 2.5 0 2-1.5 4-5.4 7.5l-.6.5z"/></svg>
          Улюблені
        </button>
      </div>

      {/* Stats (library only) */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 text-center"><span className="text-2xl font-bold block text-blue-600 dark:text-blue-400">{libraryStats?.total ?? libraryTools.length}</span><span className="text-xs text-slate-500 dark:text-gray-500">Всі інструменти</span></div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 text-center"><span className="text-2xl font-bold block text-green-600 dark:text-green-400">{libraryStats?.new ?? '—'}</span><span className="text-xs text-slate-500 dark:text-gray-500">Нові</span></div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex-1 max-w-lg relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500 pointer-events-none">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </span>
          <input
            type="search"
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#12121a] text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            placeholder={activeTab === 'my' ? 'Пошук у моєму арсеналі...' : 'Пошук інструментів'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="w-9 h-9 flex items-center justify-center border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#12121a] text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/30 transition" title="Фільтри">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M4 8h8M6 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          <select className="px-3 py-2 text-sm border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#12121a] text-slate-700 dark:text-gray-300 cursor-pointer hover:border-slate-400 dark:hover:border-white/20 focus:border-blue-500/50 outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popularity">За популярністю</option>
            <option value="name">За назвою</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map((cat) => (
          <button key={cat} type="button" className={`${filterBase} ${categoryFilter === cat ? filterActive : filterInactive}`} onClick={() => { setCategoryFilter(cat); setCurrentPage(1) }}>{cat}</button>
        ))}
      </div>
      {activeTab === 'library' && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-500 dark:text-gray-500">Рейтинг:</span>
          {[null, 1, 2, 3, 4, 5].map((r) => (
            <button
              key={r ?? 'all'}
              type="button"
              className={`${filterBase} ${minRating === r ? filterActive : filterInactive}`}
              onClick={() => { setMinRating(r); setCurrentPage(1) }}
            >
              {r == null ? 'Всі' : `${r}+ зірок`}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-gray-500 mb-4">Знайдено: {filteredTools.length} інструментів</p>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 rounded-xl">
          <p className="text-sm text-slate-500 dark:text-gray-500">Завантаження...</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#12121a] border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
          <span className="block mb-4 opacity-60">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto"><circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 dark:text-gray-600"/><path d="M30 30l10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-slate-400 dark:text-gray-600"/><path d="M14 20h12M20 14v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-500 dark:text-gray-500"/></svg>
          </span>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-2">Нічого не знайдено</h3>
          <p className="text-sm text-slate-500 dark:text-gray-500 m-0">
            {activeTab === 'my' ? 'Додайте свій перший інструмент кнопкою «Додати інструмент».' : activeTab === 'favorites' ? 'Додайте інструменти в улюблені кнопкою-сердечком на картці.' : 'Поки що немає опублікованих інструментів.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {paginatedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} isOwner={activeTab === 'my'} onPublish={() => handlePublish(tool.id)} onUnpublish={() => handleUnpublish(tool.id)} onDelete={() => handleDelete(tool.id)} onFavoriteChange={handleFavoriteChange} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-8 justify-end">
              <button type="button" className={pageBtn} disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>&lt;</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} type="button" className={`${pageBtn} ${currentPage === page ? '!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
              ))}
              <button type="button" className={pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>&gt;</button>
              <span className="text-sm text-slate-500 dark:text-gray-500 ml-2">Сторінка {currentPage} з {totalPages}</span>
            </div>
          )}
        </>
      )}

      <AddToolModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTool} />
    </div>
  )
}
