'use client'

import { motion } from 'framer-motion'
import { format, isPast } from 'date-fns'
import type { Event } from '@/types/database'

const TYPE_COLORS: Record<string, string> = {
  academic:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  social:     'text-green-400 bg-green-400/10 border-green-400/20',
  fieldtrip:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  exam:       'text-pink-400 bg-pink-400/10 border-pink-400/20',
  graduation: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

interface Props {
  upcoming: Event[]
  past: Event[]
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const d = new Date(event.event_date)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card flex gap-5 p-5"
    >
      <div
        className="text-center min-w-[56px] flex-shrink-0 rounded-xl py-3 px-2"
        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
      >
        <div className="font-syne font-extrabold text-2xl text-cyan-400">{format(d, 'd')}</div>
        <div className="text-[10px] text-ocean-muted uppercase tracking-wider">{format(d, 'MMM')}</div>
      </div>
      <div className="flex-1">
        <h3 className="font-syne font-bold text-base mb-1">{event.title}</h3>
        {event.description && <p className="text-sm text-ocean-secondary leading-relaxed mb-2">{event.description}</p>}
        {event.location && <p className="text-xs text-ocean-muted mb-2">📍 {event.location}</p>}
        <span className={`badge border ${TYPE_COLORS[event.event_type] ?? TYPE_COLORS.academic} text-xs`}>
          {event.event_type}
        </span>
      </div>
    </motion.div>
  )
}

export function EventsClient({ upcoming, past }: Props) {
  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-eyebrow">What's Next</p>
        <h1 className="section-heading">Events & Calendar 📅</h1>
        <p className="section-sub">From lectures to late-night hangouts — don't miss a beat.</p>
      </motion.div>

      <div>
        <h2 className="font-syne font-bold text-xl mb-4 gradient-text-static">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-ocean-muted glass-card">
            <p className="text-4xl mb-3">📅</p>
            <p>No upcoming events. Class reps will post soon.</p>
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-syne font-bold text-xl mb-4 text-ocean-secondary">Past Events</h2>
          <div className="space-y-4 opacity-60">
            {past.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}
