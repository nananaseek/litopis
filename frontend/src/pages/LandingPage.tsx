import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLibrary } from '../api/tools'
import type { ToolResponse } from '../api/tools'

const CATEGORIES = ['OSINT', 'Аналітика', 'Комунікації', 'Безпека', 'Моніторинг'] as const

const catColors: Record<string, string> = {
  osint: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'аналітика': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'комунікації': 'bg-green-500/20 text-green-400 border-green-500/30',
  'безпека': 'bg-red-500/20 text-red-400 border-red-500/30',
  'моніторинг': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function LandingPage() {
  const [tools, setTools] = useState<ToolResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLibrary({ limit: 6 })
      .then(setTools)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalTools = tools.length
  const totalCategories = new Set(tools.map((t) => t.category)).size

  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b0b12]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg no-underline">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </span>
            Літопис
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#tools" className="text-sm text-gray-400 hover:text-white transition no-underline">Інструменти</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition no-underline">Можливості</a>
            <a href="#categories" className="text-sm text-gray-400 hover:text-white transition no-underline">Категорії</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition no-underline">Увійти</Link>
            <Link to="/register" className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition no-underline">Реєстрація</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            Платформа для аналітиків та дослідників
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-5">
            Ваш арсенал{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              OSINT інструментів
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Збирайте, організовуйте та діліться найкращими інструментами для розвідки з відкритих джерел. Створюйте свій арсенал та публікуйте для спільноти.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition no-underline text-sm shadow-lg shadow-blue-600/25">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              Почати безкоштовно
            </Link>
            <a href="#tools" className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:bg-white/5 hover:border-gray-500 transition no-underline text-sm">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              Переглянути інструменти
            </a>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map((c) => (
                <span key={c} className="w-7 h-7 rounded-full border-2 border-[#0b0b12] flex items-center justify-center text-[0.6rem] font-bold text-white" style={{ background: c }}>{c[1].toUpperCase()}</span>
              ))}
            </div>
            <span className="flex items-center gap-1">
              <span className="text-yellow-400 flex gap-px">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</span>
              Використовується аналітиками
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            { value: `${totalTools || '—'}`, label: 'Інструментів', color: 'text-blue-400' },
            { value: `${totalCategories || '—'}`, label: 'Категорій', color: 'text-purple-400' },
            { value: '500+', label: 'Аналітиків', color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: '🔄', title: 'Останні інструменти', desc: 'Нещодавно додані', link: 'Дивитись інструменти', count: `${totalTools} інстр.` },
            { icon: '⭐', title: 'Рекомендовані', desc: 'Обрані спільнотою', link: 'Дивитись рекомендації', count: 'Курація' },
            { icon: '📂', title: 'Категорії', desc: 'Організований каталог', link: 'Переглянути категорії', count: `${CATEGORIES.length} категорій` },
          ].map((card) => (
            <div key={card.title} className="bg-[#12121a] border border-white/5 rounded-xl p-5 hover:border-white/10 transition group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-2xl block mb-1">{card.icon}</span>
                  <h3 className="text-base font-semibold text-gray-100">{card.title}</h3>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
                <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded">{card.count}</span>
              </div>
              <a href="#tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-400 transition no-underline group-hover:text-blue-400">
                {card.link}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Tools */}
      <section id="tools" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-500 mb-1">Опубліковані інструменти</p>
            <h2 className="text-2xl font-bold text-gray-100">Останні інструменти</h2>
          </div>
          <Link to="/login" className="text-sm text-gray-400 hover:text-blue-400 transition no-underline flex items-center gap-1">
            Переглянути всі
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#12121a] border border-white/5 rounded-xl p-5 animate-pulse">
                <div className="w-2/3 h-5 bg-gray-800 rounded mb-3" />
                <div className="w-full h-3 bg-gray-800 rounded mb-2" />
                <div className="w-4/5 h-3 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-16 bg-[#12121a] border border-dashed border-white/10 rounded-xl">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Поки що немає інструментів</h3>
            <p className="text-sm text-gray-500">Зареєструйтеся та додайте перший інструмент!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => {
              const tagCls = catColors[tool.category.toLowerCase()] ?? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              return (
                <div key={tool.id} className="bg-[#12121a] border border-white/5 rounded-xl p-5 flex flex-col gap-3 hover:border-white/10 transition group">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none shrink-0">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-100 leading-tight mb-1">{tool.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[0.6875rem] font-medium px-1.5 py-0.5 rounded border ${tagCls}`}>{tool.category}</span>
                        {tool.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[0.6875rem] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {tool.license && <span>Ліцензія: {tool.license}</span>}
                    {tool.github_url && (
                      <span className="flex items-center gap-0.5">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                        GitHub
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto pt-1">
                    <Link to="/login" className="flex-1 py-1.5 text-center text-[0.8125rem] font-medium bg-white/5 rounded-lg text-gray-300 no-underline hover:bg-white/10 transition">Переглянути</Link>
                    <Link to="/login" className="flex-1 py-1.5 text-center text-[0.8125rem] font-medium bg-blue-600/20 text-blue-400 rounded-lg no-underline hover:bg-blue-600/30 transition">Деталі</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="mb-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-500 mb-1">Організований каталог</p>
          <h2 className="text-2xl font-bold text-gray-100">Категорії інструментів</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const count = tools.filter((t) => t.category === cat).length
            const colorMap: Record<string, string> = {
              OSINT: 'border-blue-500/30 hover:bg-blue-500/10',
              'Аналітика': 'border-indigo-500/30 hover:bg-indigo-500/10',
              'Комунікації': 'border-green-500/30 hover:bg-green-500/10',
              'Безпека': 'border-red-500/30 hover:bg-red-500/10',
              'Моніторинг': 'border-amber-500/30 hover:bg-amber-500/10',
            }
            return (
              <div key={cat} className={`bg-[#12121a] border rounded-xl p-4 text-center transition cursor-default ${colorMap[cat] ?? 'border-white/5'}`}>
                <div className="text-lg font-bold text-gray-200">{cat}</div>
                <div className="text-xs text-gray-500 mt-1">{count} інстр.</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Why Choose */}
      <section id="features" className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1l2.35 4.76L16 6.47l-4 3.9.94 5.5L8 13.24l-4.94 2.63.94-5.5-4-3.9 5.65-.71L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              Чому Літопис
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3">Створено для професіоналів</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Точність, надійність та інновації у кожному дослідженні</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="3" stroke="#3b82f6" strokeWidth="1.5"/><path d="M8 9h8M8 13h5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                title: 'Єдина платформа',
                desc: 'Усі інструменти, колекції та аналітика в одному місці з зручним пошуком.',
                bg: 'bg-blue-500/10',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M1 12a11 11 0 0121.5-4M23 12a11 11 0 01-21.5 4" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 4v4h-4M2 20v-4h4" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Постійні оновлення',
                desc: 'README автоматично синхронізується з GitHub. Актуальна документація завжди.',
                bg: 'bg-purple-500/10',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#22c55e" strokeWidth="1.5"/><path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                title: 'Спільнота аналітиків',
                desc: 'Діліться інструментами, створюйте публічну бібліотеку для команди та колег.',
                bg: 'bg-green-500/10',
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#12121a] border border-white/5 rounded-xl p-6 text-center hover:border-white/10 transition">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mx-auto mb-4`}>{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12121a] via-[#151520] to-[#12121a] border border-white/5 px-6 py-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,130,246,0.12),transparent)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              Готові розпочати?
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Почніть досліджувати{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">сьогодні</span>
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Приєднуйтесь до спільноти аналітиків, які використовують Літопис для ефективних OSINT-досліджень.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition no-underline text-sm shadow-lg shadow-blue-600/25">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                Створити акаунт
              </Link>
              <a href="#tools" className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:bg-white/5 hover:border-gray-500 transition no-underline text-sm">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                Переглянути каталог
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5l-8 8L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Безкоштовно
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5l-8 8L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Без кредитної картки
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5l-8 8L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Приватний каталог
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#08080e]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 2l5 2 5-2v11l-5 2-5-2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                </span>
                Літопис
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">Ваш каталог OSINT інструментів. Збирайте, організовуйте та діліться з колегами.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Інструменти</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 list-none p-0 m-0">
                <li><a href="#tools" className="hover:text-gray-300 transition no-underline">Всі інструменти</a></li>
                <li><a href="#tools" className="hover:text-gray-300 transition no-underline">Популярні</a></li>
                <li><a href="#categories" className="hover:text-gray-300 transition no-underline">Категорії</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Платформа</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 list-none p-0 m-0">
                <li><Link to="/register" className="hover:text-gray-300 transition no-underline">Реєстрація</Link></li>
                <li><Link to="/login" className="hover:text-gray-300 transition no-underline">Вхід</Link></li>
                <li><a href="#features" className="hover:text-gray-300 transition no-underline">Можливості</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Спільнота</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 list-none p-0 m-0">
                <li><a href="#" className="hover:text-gray-300 transition no-underline">Telegram</a></li>
                <li><a href="#" className="hover:text-gray-300 transition no-underline">GitHub</a></li>
                <li><a href="#" className="hover:text-gray-300 transition no-underline">Signal</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5 text-xs text-gray-600">
            <span>&copy; 2026 Літопис. Всі права захищені.</span>
            <span>Зроблено в Україні 🇺🇦</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
