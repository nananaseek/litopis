import { useState } from 'react'
import type { ToolFormData, ToolCategory } from '../../types/arsenal'
import { CATEGORIES } from '../../data/mockTools'
import * as toolsApi from '../../api/tools'

const VALID_CATEGORIES = CATEGORIES.filter((c) => c !== 'Всі') as ToolCategory[]
const DEFAULT_ICON = '\u{1F527}'

interface ImportToolsModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

type ImportResult = {
  imported: number
  failed: number
  errors: string[]
}

function normalizeItem(raw: Record<string, unknown>): ToolFormData | null {
  const get = (...keys: string[]): string => {
    for (const k of keys) {
      const v = raw[k]
      if (v != null && v !== '') return String(v).trim()
    }
    return ''
  }
  const getArr = (camel: string, snake: string): string[] => {
    const v = raw[camel] ?? raw[snake]
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean)
    return []
  }
  const name = get('name')
  const githubUrl = get('githubUrl', 'github_url', 'github')
  const officialUrl = get('officialUrl', 'official_url')
  if (!name) return null
  if (!githubUrl && !officialUrl) return null

  let category = (get('category') || 'OSINT') as string
  if (!VALID_CATEGORIES.includes(category as ToolCategory)) category = 'OSINT'

  return {
    name,
    description: get('description') || '',
    category: category as ToolCategory,
    license: get('license') || '',
    icon: get('icon') || DEFAULT_ICON,
    tags: getArr('tags', 'tags'),
    githubUrl: githubUrl || '',
    officialUrl: officialUrl || '',
    downloadUrl: get('downloadUrl', 'download_url') || '',
  }
}

function validateAndNormalize(
  arr: unknown[]
): { items: ToolFormData[]; error: string | null } {
  if (!Array.isArray(arr)) {
    return { items: [], error: 'JSON має бути масивом об’єктів' }
  }
  const items: ToolFormData[] = []
  for (let i = 0; i < arr.length; i++) {
    const raw = arr[i]
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      return { items: [], error: `Елемент ${i + 1}: очікується об’єкт` }
    }
    const item = normalizeItem(raw as Record<string, unknown>)
    if (!item) {
      return {
        items: [],
        error: `Елемент ${i + 1}: потрібні name та хоча б одне з github / githubUrl або officialUrl`,
      }
    }
    items.push(item)
  }
  return { items, error: null }
}

const textareaCls =
  'w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#12121a] text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition font-mono resize-y min-h-[200px]'

export default function ImportToolsModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportToolsModalProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleClose = () => {
    setJsonInput('')
    setParseError(null)
    setResult(null)
    onClose()
  }

  const handleImport = async () => {
    setParseError(null)
    setResult(null)

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonInput.trim() || '[]')
    } catch (e) {
      setParseError('Невірний JSON. Перевірте синтаксис.')
      return
    }

    const { items, error } = validateAndNormalize(
      Array.isArray(parsed) ? parsed : [parsed]
    )
    if (error) {
      setParseError(error)
      return
    }
    if (items.length === 0) {
      setParseError('Немає жодного коректного інструмента для імпорту.')
      return
    }

    setImporting(true)
    const errors: string[] = []
    let imported = 0

    for (let i = 0; i < items.length; i++) {
      try {
        await toolsApi.createTool(items[i])
        imported++
      } catch (e) {
        const msg =
          e && typeof e === 'object' && 'response' in e && e.response && typeof e.response === 'object' && 'data' in e.response
            ? String((e.response as { data?: unknown }).data ?? (e as Error).message)
            : (e as Error).message
        errors.push(`Інструмент ${i + 1} («${items[i].name}»): ${msg}`)
      }
    }

    setResult({
      imported,
      failed: errors.length,
      errors: errors.length > 0 ? errors : [],
    })
    setImporting(false)

    if (imported > 0 && onImportComplete) {
      onImportComplete()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 mx-4 animate-[slideUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">
            Імпортувати інструменти
          </h2>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white text-xl transition"
            onClick={handleClose}
            aria-label="Закрити"
          >
            {'\u00D7'}
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-gray-500 mb-3">
          Вставте JSON-масив інструментів. У кожного об’єкта обов’язкові: name та
          хоча б одне з github / githubUrl або officialUrl.
        </p>

        <textarea
          className={textareaCls}
          placeholder={'[\n  { "name": "OSINT Framework", "description": "...", "category": "OSINT", "license": "MIT", "github": "https://github.com/...", "icon": "🔍", "downloadUrl": "https://..." }\n]'}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          disabled={importing}
        />

        {parseError && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-3">
            {parseError}
          </p>
        )}

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-[#0b0b12] border border-slate-200 dark:border-white/10">
            <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Імпортовано {result.imported} з {result.imported + result.failed}
              {result.failed > 0 && ` (помилок: ${result.failed})`}
            </p>
            {result.errors.length > 0 && (
              <ul className="text-xs text-red-400 mt-2 space-y-1 list-disc list-inside">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            onClick={handleClose}
          >
            {result ? 'Закрити' : 'Скасувати'}
          </button>
          {!result && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={importing}
              onClick={handleImport}
            >
              {importing ? 'Імпорт...' : 'Імпортувати'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
