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
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-[#0b0b12] dark:text-gray-100">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 bg-slate-100/90 dark:bg-[#0b0b12]/90 backdrop-blur border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base no-underline">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </span>
            Літопис
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
