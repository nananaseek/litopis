import { useState, useEffect, useRef } from 'react'

/** easeOutQuart: швидко на початку, повільно в кінці */
function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4
}

interface CountUpProps {
  /** Цільове значення; null = показувати "—" без анімації */
  value: number | null
  /** Тривалість анімації в мс */
  duration?: number
  /** Форматер для відображення (наприклад для "5+", "100+") */
  format?: (n: number) => string
  className?: string
}

export default function CountUp({
  value,
  duration = 500,
  format = (n) => String(Math.round(n)),
  className = '',
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef<{ start: number; target: number } | null>(null)

  useEffect(() => {
    if (value === null) {
      setDisplayValue(0)
      return
    }

    const target = value
    startRef.current = { start: performance.now(), target }

    const tick = (now: number) => {
      const state = startRef.current
      if (!state) return
      const elapsed = now - state.start
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(t)
      const current = state.target * eased
      setDisplayValue(current)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayValue(state.target)
        startRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  if (value === null) {
    return <span className={className}>—</span>
  }

  return <span className={className}>{format(displayValue)}</span>
}
