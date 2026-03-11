import { useState } from 'react'

interface StarRatingProps {
  /** Середній рейтинг для відображення (1–5), може бути null */
  value: number | null
  /** Кількість голосів (опційно) */
  count?: number
  /** Чи можна вибирати рейтинг */
  interactive?: boolean
  /** Callback при виборі рейтингу (тільки якщо interactive) */
  onChange?: (value: number) => void
  /** Розмір: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export default function StarRating({
  value,
  count = 0,
  interactive = false,
  onChange,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const displayValue = interactive && hover !== null ? hover : (value ?? 0)
  const sc = sizeClasses[size]

  const handleClick = (v: number) => {
    if (interactive && onChange) onChange(v)
  }

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      <div className="flex items-center gap-0.5" role={interactive ? 'group' : undefined} aria-label={value != null ? `Рейтинг: ${value} з 5` : 'Немає рейтингу'}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              className={`${sc} shrink-0 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-[#0d0d12] disabled:cursor-default ${
                interactive ? 'cursor-pointer hover:opacity-100' : 'cursor-default'
              } ${filled ? 'text-amber-400' : 'text-slate-300 dark:text-white/20'}`}
              onMouseEnter={() => interactive && setHover(star)}
              onMouseLeave={() => interactive && setHover(null)}
              onClick={() => handleClick(star)}
              aria-label={`${star} зірок`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={sc}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )
        })}
      </div>
      {(count > 0 || (value != null && value > 0)) && (
        <span className="ml-1 text-xs text-slate-500 dark:text-gray-500">
          {value != null ? value.toFixed(1) : '—'}
          {count > 0 && <span className="ml-0.5">({count})</span>}
        </span>
      )}
    </div>
  )
}
