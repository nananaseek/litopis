import { useState, useEffect } from 'react'
import type { ToolFormData, ToolCategory } from '../../types/arsenal'
import { CATEGORIES } from '../../data/mockTools'

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== 'Всі') as ToolCategory[]

interface AddToolModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ToolFormData) => Promise<void> | void
  initialData?: ToolFormData
  editMode?: boolean
}

const defaultForm: ToolFormData = {
  name: '',
  description: '',
  category: 'OSINT',
  license: '',
  icon: '\u{1F527}',
  tags: [],
  githubUrl: '',
  officialUrl: '',
  downloadUrl: '',
}

const inputCls = 'w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-[#12121a] text-gray-100 placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition'

export default function AddToolModal({ isOpen, onClose, onSave, initialData, editMode }: AddToolModalProps) {
  const [form, setForm] = useState<ToolFormData>(defaultForm)
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && initialData) {
      setForm(initialData)
    } else if (isOpen) {
      setForm(defaultForm)
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.githubUrl && !form.officialUrl) {
      setError('Потрібно вказати GitHub URL або офіційний сайт')
      return
    }
    setSubmitting(true)
    try {
      await onSave(form)
      if (!editMode) setForm(defaultForm)
      onClose()
    } catch {
      setError('Помилка при збереженні')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!editMode) setForm(defaultForm)
    setTagInput('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]" onClick={handleClose}>
      <div className="bg-[#12121a] rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 mx-4 animate-[slideUp_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-100">{editMode ? 'Редагувати інструмент' : 'Додати інструмент у мій арсенал'}</h2>
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white text-xl transition" onClick={handleClose} aria-label="Закрити">{'\u00D7'}</button>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-name" className="text-sm font-medium text-gray-400">Назва *</label>
            <input id="tool-name" type="text" required placeholder="Наприклад: theHarvester" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-desc" className="text-sm font-medium text-gray-400">Опис</label>
            <textarea id="tool-desc" rows={3} placeholder="Короткий опис інструменту" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${inputCls} resize-y min-h-16`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-category" className="text-sm font-medium text-gray-400">Категорія</label>
            <select id="tool-category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ToolCategory }))} className={inputCls}>
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-license" className="text-sm font-medium text-gray-400">Ліцензія</label>
            <input id="tool-license" type="text" placeholder="MIT, GPL, ..." value={form.license} onChange={(e) => setForm((p) => ({ ...p, license: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-tags" className="text-sm font-medium text-gray-400">Теги</label>
            <div className="flex flex-wrap gap-1.5 p-2 border border-white/10 rounded-lg bg-[#0b0b12] min-h-9 items-center focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/30">
                  {tag}
                  <button type="button" className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-500/20 text-[0.7rem]" onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))} aria-label={`Видалити тег ${tag}`}>{'\u00D7'}</button>
                </span>
              ))}
              <input
                id="tool-tags" type="text"
                placeholder={form.tags.length === 0 ? 'Додайте тег та натисніть Enter' : ''}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const val = tagInput.trim().toLowerCase()
                    if (val && !form.tags.includes(val)) setForm((p) => ({ ...p, tags: [...p.tags, val] }))
                    setTagInput('')
                  }
                }}
                className="flex-1 min-w-24 border-none outline-none bg-transparent text-sm text-gray-100 p-0.5"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Іконка (емодзі)</label>
            <button type="button" className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 text-2xl flex items-center justify-center hover:bg-white/10 transition" onClick={() => setForm((p) => ({ ...p, icon: '\u{1F527}' }))} title="Іконка">{form.icon}</button>
          </div>
          <fieldset className="border border-white/10 rounded-lg p-4">
            <legend className="text-sm font-medium text-gray-400 px-1">Посилання (потрібно хоча б одне *)</legend>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tool-github" className="text-sm text-gray-500">GitHub</label>
                <input id="tool-github" type="url" placeholder="https://github.com/..." value={form.githubUrl} onChange={(e) => setForm((p) => ({ ...p, githubUrl: e.target.value }))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tool-official" className="text-sm text-gray-500">Офіційний сайт</label>
                <input id="tool-official" type="url" placeholder="https://..." value={form.officialUrl} onChange={(e) => setForm((p) => ({ ...p, officialUrl: e.target.value }))} className={inputCls} />
              </div>
            </div>
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tool-download" className="text-sm font-medium text-gray-400">Посилання на завантаження (необов&apos;язково)</label>
            <input id="tool-download" type="url" placeholder="https://..." value={form.downloadUrl} onChange={(e) => setForm((p) => ({ ...p, downloadUrl: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition" onClick={handleClose}>Скасувати</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={submitting}>
              {submitting ? 'Збереження...' : editMode ? 'Оновити' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
