'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/dashboard',             label: 'Home',      icon: '🏠' },
  { href: '/dashboard/directory',   label: 'Crew',      icon: '🌊' },
  { href: '/dashboard/confessions', label: 'Anon Wall', icon: '🌑' },
  { href: '/dashboard/polls',       label: 'Polls',     icon: '🗳️'  },
  { href: '/dashboard/gallery',     label: 'Gallery',   icon: '📸' },
  { href: '/dashboard/events',      label: 'Events',    icon: '📅' },
]

interface Props {
  user: User | null
  student: { full_name: string; nickname: string | null; avatar_url: string | null; is_admin: boolean } | null
}

export function DashboardNav({ user, student }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient() as any
  const [onlineCount, setOnlineCount] = useState(23)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 12) + 18)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isGuest = !user
  const name = student?.full_name ?? user?.email ?? 'Guest'

  return (
    <>
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-syne text-lg font-extrabold gradient-text-static">
            Marine Minds 29
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'text-cyan-400'
                    : 'text-ocean-secondary hover:text-white hover:bg-white/5',
                )}
              >
                {item.label}
              </Link>
            ))}
            {student?.is_admin && (
              <Link
                href="/dashboard/admin"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === '/dashboard/admin'
                    ? 'text-cyan-400'
                    : 'text-ocean-secondary hover:text-white hover:bg-white/5',
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="online-dot" />
              <span className="text-xs text-ocean-secondary">{onlineCount} online</span>
            </div>

            {/* Guest: show login button */}
            {isGuest ? (
              <Link href="/auth/login" className="btn-primary text-xs py-2 px-4 hidden md:block">
                Sign In
              </Link>
            ) : (
              /* Profile dropdown - desktop */
              <div className="relative hidden md:block">
                <button onClick={() => setProfileOpen(o => !o)}>
                  <Avatar name={name} src={student?.avatar_url} size="sm" className="cursor-pointer hover:ring-2 hover:ring-cyan-400/50 transition-all" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-52 glass-card p-2 shadow-2xl"
                      style={{ zIndex: 200 }}
                    >
                      <div className="px-3 py-2 border-b border-glass mb-1">
                        <p className="text-sm font-semibold truncate">{name}</p>
                        <p className="text-xs text-ocean-muted truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard/directory"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ocean-secondary hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => setProfileOpen(false)}
                      >
                        ✦ Edit Profile
                      </Link>
                      {student?.is_admin && (
                        <Link
                          href="/dashboard/admin"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ocean-secondary hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setProfileOpen(false)}
                        >
                          🛡️ Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        ↩ Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileMenuOpen(o => !o)}
            >
              <span className={cn('block w-5 h-0.5 bg-white transition-all', mobileMenuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-white transition-all', mobileMenuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-white transition-all', mobileMenuOpen && '-rotate-45 -translate-y-2')} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 nav-glass border-t border-glass md:hidden"
          >
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-glass">
                <Avatar name={name} src={student?.avatar_url} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-ocean-muted">{isGuest ? 'Browsing as guest' : user?.email}</p>
                </div>
              </div>

              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === item.href ? 'text-cyan-400 bg-cyan-400/10' : 'text-ocean-secondary hover:text-white hover:bg-white/5',
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              {student?.is_admin && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === '/dashboard/admin' ? 'text-cyan-400 bg-cyan-400/10' : 'text-ocean-secondary hover:text-white hover:bg-white/5',
                  )}
                >
                  <span>🛡️</span> Admin
                </Link>
              )}

              {isGuest ? (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-cyan-400 hover:bg-cyan-400/10 transition-all"
                >
                  <span>🌊</span> Sign In
                </Link>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <span>↩</span> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 nav-glass md:hidden">
        <div className="flex items-center justify-around px-2 h-16">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all',
                pathname === item.href ? 'text-cyan-400' : 'text-ocean-muted',
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all',
              mobileMenuOpen ? 'text-cyan-400' : 'text-ocean-muted',
            )}
          >
            <span className="text-lg leading-none">☰</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {(profileOpen || mobileMenuOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setProfileOpen(false); setMobileMenuOpen(false) }} />
      )}
    </>
  )
}
