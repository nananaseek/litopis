import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../ThemeToggle/ThemeToggle'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const currentTime = new Date().toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-[#0b0b12] dark:text-gray-100">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 bg-slate-100/90 dark:bg-[#0b0b12]/90 backdrop-blur border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6">
          <Link to="/arsenal" className="inline-flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base no-underline">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </span>
            Літопис
          </Link>
          <div className="flex items-center gap-2">
            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors" title="Пошук" aria-label="Пошук">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
            <ThemeToggle />
            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors" title="Налаштування" aria-label="Налаштування">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors" title="Сповіщення" aria-label="Сповіщення">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6a4 4 0 018 0v3l1 2H3l1-2V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2"/></svg>
            </button>
            <span className="w-px h-6 bg-slate-300 dark:bg-white/10" />
            <button type="button" className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-gray-400 bg-slate-200 dark:bg-white/5 rounded-md hover:bg-slate-300 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors" title="Мова">UA</button>
            <span className="w-px h-6 bg-slate-300 dark:bg-white/10" />
            <div className="flex items-center gap-2 ml-1">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center">{user?.username?.[0]?.toUpperCase() ?? 'U'}</div>
              <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{user?.username ?? 'User'}</span>
            </div>
            <button type="button" className="px-3 py-1.5 text-sm font-medium border border-slate-300 dark:border-white/10 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 dark:hover:border-red-500/30 transition-colors" onClick={handleLogout} title="Вийти">
              Вийти
            </button>
            <span className="text-sm font-medium text-slate-500 dark:text-gray-500 ml-0.5">{currentTime}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
