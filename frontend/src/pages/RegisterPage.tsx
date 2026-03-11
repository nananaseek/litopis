import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { addFavorite } from '../api/tools'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as { from?: string; addFavoriteToolId?: string } | undefined) ?? {}
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Паролі не співпадають')
      return
    }
    if (password.length < 6) {
      setError('Пароль має бути не менше 6 символів')
      return
    }
    setSubmitting(true)
    try {
      await register(username, email, password)
      if (state.addFavoriteToolId) {
        try {
          await addFavorite(state.addFavoriteToolId)
        } catch {
          // ігноруємо помилку додавання в улюблені
        }
      }
      navigate(state.from ?? '/arsenal', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Помилка реєстрації'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-blue-900/40'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <form className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-md shadow-sm dark:bg-slate-800 dark:border-slate-700" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold text-slate-800 text-center mb-6 dark:text-slate-100">Реєстрація</h1>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 dark:bg-red-900/30 dark:text-red-400">{error}</p>}
        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="reg-user" className="text-sm font-medium text-slate-600 dark:text-slate-300">Ім&apos;я користувача</label>
          <input id="reg-user" type="text" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="reg-email" className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
          <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="reg-pass" className="text-sm font-medium text-slate-600 dark:text-slate-300">Пароль</label>
          <input id="reg-pass" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 mb-6">
          <label htmlFor="reg-confirm" className="text-sm font-medium text-slate-600 dark:text-slate-300">Підтвердіть пароль</label>
          <input id="reg-confirm" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} />
        </div>
        <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={submitting}>
          {submitting ? 'Реєстрація...' : 'Зареєструватися'}
        </button>
        <p className="text-sm text-center text-slate-500 mt-4 dark:text-slate-400">
          Вже є акаунт? <Link to="/login" state={state} className="text-blue-600 font-medium no-underline hover:underline dark:text-blue-400">Увійти</Link>
        </p>
      </form>
    </div>
  )
}
