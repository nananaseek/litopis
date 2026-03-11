interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary' | 'default'
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const confirmCls =
    variant === 'danger'
      ? 'px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition'
      : variant === 'primary'
        ? 'px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition'
        : 'px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-white/15 transition'

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#12121a] rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-md p-6 mx-4 animate-[slideUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 m-0">{title}</h2>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white text-xl transition"
            onClick={onClose}
            aria-label="Закрити"
          >
            {'\u00D7'}
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-gray-400 m-0 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button type="button" className={confirmCls} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
