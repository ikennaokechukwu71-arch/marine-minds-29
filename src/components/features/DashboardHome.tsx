'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Avatar } from '@/components/ui/Avatar'
import { getDailyMarineFact, formatEventDate } from '@/lib/utils'
import type { Student, Announcement, Event } from '@/types/database'

const QUOTES = [
  { text: "The ocean stirs the heart, inspires the imagination and brings eternal joy to the soul.", author: "Robert Wylie" },
  { text: "The sea, once it casts its spell, holds one in its net of wonder forever.", author: "Jacques Cousteau" },
  { text: "We are tied to the ocean. And when we go back to the sea — we are going back from whence we came.", author: "JFK" },
  { text: "The cure for anything is salt water — sweat, tears, or the sea.", author: "Isak Dinesen" },
]

const EVENT_TYPE_COLORS: Record<string, string> = {
  academic:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  social:     'text-green-400 bg-green-400/10 border-green-400/20',
  fieldtrip:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  exam:       'text-pink-400 bg-pink-400/10 border-pink-400/20',
  graduation: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

interface Props {
  stats: { students: number; messages: number; gallery: number }
  topStudents: Partial<Student>[]
  announcements: Partial<Announcement>[]
  upcomingEvents: Partial<Event>[]
  birthdaysToday: { full_name: string; nickname: string | null }[]
}

function useCountUp(target: number, duration = 2000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const pct = Math.min(1, (Date.now() - start) / duration)
      const eased = 1 - Math.pow(1 - pct, 3)
      setVal(Math.floor(eased * target))
      if (pct >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

export function DashboardHome({ stats, topStudents, announcements, upcomingEvents, birthdaysToday }: Props) {
  const fact = getDailyMarineFact()
  const today = new Date()
  const dayIndex = Math.floor(today.getTime() / 86400000) % QUOTES.length
  const quote = QUOTES[dayIndex]

  const sCount = useCountUp(stats.students, 2000)
  const mCount = useCountUp(stats.messages, 2500)
  const gCount = useCountUp(stats.gallery, 1800)

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400', 'text-ocean-secondary', 'text-ocean-secondary']

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center pt-6"
      >
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)' }}>
          🌊 Department of Aquaculture &amp; Fisheries Management
        </div>
        <h1 className="font-syne font-extrabold gradient-text leading-none mb-3"
          style={{ fontSize: 'clamp(42px,7vw,80px)', backgroundSize: '200% 200%' }}>
          Marine Minds 29
        </h1>
        <p className="text-ocean-secondary text-lg">One ocean. One crew. One legacy.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6 grid grid-cols-3 gap-4 text-center"
      >
        {[
          { num: sCount, label: 'Classmates', icon: '🌊' },
          { num: mCount, label: 'Anon Messages', icon: '🌑' },
          { num: gCount, label: 'Memories', icon: '📸' },
        ].map(({ num, label, icon }) => (
          <div key={label}>
            <div className="font-syne text-3xl md:text-4xl font-extrabold gradient-text-static">{num.toLocaleString()}</div>
            <div className="text-xs text-ocean-muted uppercase tracking-widest mt-1">{icon} {label}</div>
          </div>
        ))}
      </motion.div>

      {/* Birthdays */}
      {birthdaysToday.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 flex items-center gap-4"
          style={{ border: '1px solid rgba(255,107,157,0.3)', background: 'linear-gradient(135deg,rgba(255,107,157,0.07),rgba(180,138,255,0.07))' }}
        >
          <span className="text-4xl">🎂</span>
          <div>
            <h3 className="font-semibold text-base mb-1">
              Happy Birthday, {birthdaysToday.map(b => b.nickname ?? b.full_name).join(' & ')}! 🎉
            </h3>
            <p className="text-sm text-ocean-secondary">From all of Marine Minds 29 — may your fish always thrive!</p>
          </div>
        </motion.div>
      )}

      {/* Quote + Fact */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
          style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(0,255,204,0.06))' }}
        >
          <p className="section-eyebrow mb-3">💬 Quote of the Day</p>
          <p className="font-syne text-lg font-semibold leading-snug mb-3">"{quote.text}"</p>
          <p className="text-sm text-ocean-muted">— {quote.author}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <p className="section-eyebrow mb-3">🐠 Daily Marine Fact</p>
          <p className="text-sm text-ocean-secondary leading-relaxed">{fact}</p>
        </motion.div>
      </div>

      {/* Leaderboard */}
      {topStudents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="section-eyebrow mb-2">🏆 Class Leaderboard</p>
          <h2 className="section-heading mb-1">Top of the Tank</h2>
          <p className="section-sub mb-5">Who's making the most waves?</p>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.id} className="glass-card flex items-center gap-4 p-4 hover:border-cyan-400/30 transition-all">
                <span className={`font-syne font-extrabold text-xl min-w-[28px] ${rankColors[i]}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Avatar name={s.full_name ?? ''} src={s.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.full_name}</p>
                  <p className="text-xs text-ocean-muted">{s.nickname ?? 'No nickname yet'}</p>
                </div>
                <span className="font-syne font-bold text-lg gradient-text-static">{(s.likes_count ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <p className="section-eyebrow mb-4">📢 Announcements</p>
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-syne font-bold text-base">{a.title}</h3>
                  {a.is_pinned && (
                    <span className="badge text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 flex-shrink-0">📌 Pinned</span>
                  )}
                </div>
                <p className="text-sm text-ocean-secondary leading-relaxed">{a.content}</p>
                <p className="text-xs text-ocean-muted mt-3">{a.created_at ? format(new Date(a.created_at), 'MMM d, yyyy') : ''}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <p className="section-eyebrow mb-4">📅 Upcoming Events</p>
          <div className="space-y-3">
            {upcomingEvents.map(ev => (
              <div key={ev.id} className="glass-card flex gap-4 p-4">
                <div className="text-center min-w-[52px] p-2 rounded-xl"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                  <div className="font-syne font-extrabold text-xl text-cyan-400">
                    {ev.event_date ? format(new Date(ev.event_date), 'd') : '—'}
                  </div>
                  <div className="text-[10px] text-ocean-muted uppercase tracking-wide">
                    {ev.event_date ? format(new Date(ev.event_date), 'MMM') : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{ev.title}</h3>
                  <p className="text-xs text-ocean-secondary leading-relaxed">{ev.description}</p>
                  <span className={`inline-block mt-2 badge border ${EVENT_TYPE_COLORS[ev.event_type ?? 'academic']}`}>
                    {ev.event_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
