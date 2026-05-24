'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { getMessageTypeEmoji, getMessageTypeColor, timeAgo } from '@/lib/utils'
import type { AnonMessage } from '@/types/database'

interface Stats {
  totalStudents: number
  totalMessages: number
  pendingCount: number
  flaggedCount: number
}

interface Announcement {
  id: string
  title: string
  content: string
  is_pinned: boolean
  created_at: string
}

interface Props {
  pendingMessages: AnonMessage[]
  flaggedMessages: AnonMessage[]
  pendingGallery: { id: string; image_url: string; caption: string | null; created_at: string }[]
  recentSignups: { full_name: string; email?: string; created_at: string }[]
  announcements: Announcement[]
  stats: Stats
}

type Tab = 'overview' | 'messages' | 'gallery' | 'announcements' | 'signups'

export function AdminClient({ pendingMessages: initPending, flaggedMessages: initFlagged, pendingGallery: initGallery, recentSignups, announcements: initAnnouncements, stats }: Props) {
  const supabase = createClient() as any
  const [tab, setTab] = useState<Tab>('overview')
  const [pending, setPending] = useState(initPending)
  const [flagged, setFlagged] = useState(initFlagged)
  const [gallery, setGallery] = useState(initGallery)
  const [announcements, setAnnouncements] = useState(initAnnouncements)
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', event_type: 'academic', location: '' })
  const [newAnnounce, setNewAnnounce] = useState({ title: '', content: '', is_pinned: false })
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] })
  const [posting, setPosting] = useState(false)

  async function approveMessage(id: string) {
    await supabase.from('anonymous_messages').update({ is_approved: true }).eq('id', id)
    setPending(p => p.filter(m => m.id !== id))
    toast.success('✓ Message approved and published.')
  }
  async function rejectMessage(id: string) {
    await supabase.from('anonymous_messages').delete().eq('id', id)
    setPending(p => p.filter(m => m.id !== id))
    setFlagged(f => f.filter(m => m.id !== id))
    toast.success('✕ Message deleted.')
  }
  async function approvePhoto(id: string) {
    await supabase.from('gallery_uploads').update({ is_approved: true }).eq('id', id)
    setGallery(g => g.filter(u => u.id !== id))
    toast.success('📸 Photo approved.')
  }

  async function postAnnouncement() {
    if (!newAnnounce.title || !newAnnounce.content) { toast.error('Fill in title and content.'); return }
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('announcements').insert({ ...newAnnounce, created_by: user?.id ?? '' }).select().single()
    if (error) { toast.error('Could not post announcement.'); setPosting(false); return }
    toast.success('📢 Announcement posted!')
    setAnnouncements(a => [data, ...a])
    setNewAnnounce({ title: '', content: '', is_pinned: false })
    setPosting(false)
  }

  async function deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(a => a.filter(x => x.id !== id))
    toast.success('Announcement deleted.')
  }

  async function postEvent() {
    if (!newEvent.title || !newEvent.event_date) { toast.error('Fill in title and date.'); return }
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').insert({ ...newEvent, created_by: user?.id ?? '' })
    toast.success('📅 Event added!')
    setNewEvent({ title: '', description: '', event_date: '', event_type: 'academic', location: '' })
    setPosting(false)
  }

  async function postPoll() {
    const validOptions = newPoll.options.filter(o => o.trim())
    if (!newPoll.question.trim()) { toast.error('Enter a question.'); return }
    if (validOptions.length < 2) { toast.error('Add at least 2 options.'); return }
    setPosting(true)
    const { data: poll, error } = await supabase
      .from('polls')
      .insert({ question: newPoll.question.trim(), is_active: true, total_votes: 0 })
      .select()
      .single()
    if (error || !poll) { toast.error('Could not create poll.'); setPosting(false); return }
    await supabase.from('poll_options').insert(
      validOptions.map(o => ({ poll_id: poll.id, option_text: o.trim(), votes_count: 0 }))
    )
    toast.success('🗳️ Poll created!')
    setNewPoll({ question: '', options: ['', ''] })
    setPosting(false)
  }

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'messages', label: '🌑 Messages', badge: pending.length },
    { key: 'gallery', label: '📸 Gallery', badge: gallery.length },
    { key: 'announcements', label: '📢 Announcements', badge: announcements.length },
    { key: 'signups', label: '👥 Signups' },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-eyebrow">Admin Panel</p>
        <h1 className="section-heading">Class Rep Dashboard 🛡️</h1>
        <p className="section-sub">Moderate content, manage the crew, keep the ocean clean.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              tab === t.key ? 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' : 'border-glass text-ocean-secondary hover:text-white'
            }`}
          >
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: stats.totalStudents, label: 'Students', color: 'text-cyan-400' },
              { num: stats.totalMessages, label: 'Total Messages', color: 'text-green-400' },
              { num: stats.pendingCount, label: 'Pending Posts', color: 'text-yellow-400' },
              { num: stats.flaggedCount, label: 'Flagged', color: 'text-pink-400' },
            ].map(({ num, label, color }) => (
              <div key={label} className="glass-card p-5 text-center">
                <div className={`font-syne font-extrabold text-4xl ${color}`}>{num}</div>
                <div className="text-xs text-ocean-muted mt-1 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Post Announcement */}
          <div className="glass-card p-6">
            <p className="font-syne font-bold text-base mb-4">📢 Post Announcement</p>
            <div className="space-y-3">
              <input className="input-glass" placeholder="Title" value={newAnnounce.title} onChange={e => setNewAnnounce(a => ({ ...a, title: e.target.value }))} />
              <textarea className="input-glass min-h-[80px] resize-none" placeholder="Message content..." value={newAnnounce.content} onChange={e => setNewAnnounce(a => ({ ...a, content: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-ocean-secondary cursor-pointer">
                <input type="checkbox" checked={newAnnounce.is_pinned} onChange={e => setNewAnnounce(a => ({ ...a, is_pinned: e.target.checked }))} />
                Pin announcement
              </label>
              <button className="btn-primary" onClick={postAnnouncement} disabled={posting}>
                {posting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>

          {/* Add Event */}
          <div className="glass-card p-6">
            <p className="font-syne font-bold text-base mb-4">📅 Add Event</p>
            <div className="space-y-3">
              <input className="input-glass" placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent(ev => ({ ...ev, title: e.target.value }))} />
              <textarea className="input-glass min-h-[60px] resize-none" placeholder="Description (optional)" value={newEvent.description} onChange={e => setNewEvent(ev => ({ ...ev, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" className="input-glass" value={newEvent.event_date} onChange={e => setNewEvent(ev => ({ ...ev, event_date: e.target.value }))} />
                <select className="input-glass" value={newEvent.event_type} onChange={e => setNewEvent(ev => ({ ...ev, event_type: e.target.value }))}>
                  {['academic', 'social', 'fieldtrip', 'exam', 'graduation'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <input className="input-glass" placeholder="Location (optional)" value={newEvent.location} onChange={e => setNewEvent(ev => ({ ...ev, location: e.target.value }))} />
              <button className="btn-primary" onClick={postEvent} disabled={posting}>
                {posting ? 'Saving...' : 'Add Event'}
              </button>
            </div>
          </div>

          {/* Create Poll */}
          <div className="glass-card p-6">
            <p className="font-syne font-bold text-base mb-4">🗳️ Create Poll</p>
            <div className="space-y-3">
              <input className="input-glass" placeholder="Poll question..." value={newPoll.question} onChange={e => setNewPoll(p => ({ ...p, question: e.target.value }))} />
              {newPoll.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input-glass"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => setNewPoll(p => ({ ...p, options: p.options.map((o, j) => j === i ? e.target.value : o) }))}
                  />
                  {newPoll.options.length > 2 && (
                    <button className="btn-danger px-3" onClick={() => setNewPoll(p => ({ ...p, options: p.options.filter((_, j) => j !== i) }))}>✕</button>
                  )}
                </div>
              ))}
              <button className="btn-glass text-sm w-full" onClick={() => setNewPoll(p => ({ ...p, options: [...p.options, ''] }))}>
                + Add Option
              </button>
              <button className="btn-primary" onClick={postPoll} disabled={posting}>
                {posting ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending Messages */}
      {tab === 'messages' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="font-syne font-bold text-lg">{pending.length} Pending Messages</p>
          {pending.length === 0 && (
            <div className="text-center py-12 text-ocean-muted glass-card">
              <p className="text-4xl mb-3">✅</p>
              <p>All clear! No pending messages.</p>
            </div>
          )}
          <AnimatePresence>
            {pending.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30, height: 0 }}
                className="glass-card p-5"
              >
                <div className="flex items-start gap-4">
                  <span className={`badge border ${getMessageTypeColor(msg.message_type)} text-xs flex-shrink-0`}>
                    {getMessageTypeEmoji(msg.message_type)} {msg.message_type}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-ocean-secondary leading-relaxed mb-3">{msg.content}</p>
                    <p className="text-xs text-ocean-muted mb-3">{timeAgo(msg.created_at)}</p>
                    <div className="flex gap-2">
                      <button className="btn-success" onClick={() => approveMessage(msg.id)}>✓ Approve</button>
                      <button className="btn-danger" onClick={() => rejectMessage(msg.id)}>✕ Delete</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {flagged.length > 0 && (
            <>
              <p className="font-syne font-bold text-base mt-6 text-pink-400">🚩 Flagged Content ({flagged.length})</p>
              {flagged.map(msg => (
                <div key={msg.id} className="glass-card p-5" style={{ borderColor: 'rgba(255,107,157,0.3)' }}>
                  <p className="text-sm text-ocean-secondary mb-3">{msg.content}</p>
                  <button className="btn-danger" onClick={() => rejectMessage(msg.id)}>✕ Delete</button>
                </div>
              ))}
            </>
          )}
        </motion.div>
      )}

      {/* Gallery Moderation */}
      {tab === 'gallery' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="font-syne font-bold text-lg">{gallery.length} Pending Photos</p>
          {gallery.length === 0 ? (
            <div className="text-center py-12 text-ocean-muted glass-card">
              <p className="text-4xl mb-3">✅</p>
              <p>No photos pending review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="glass-card overflow-hidden">
                  <img src={item.image_url} alt="" className="w-full h-40 object-cover" />
                  <div className="p-3">
                    {item.caption && <p className="text-xs text-ocean-secondary mb-2 truncate">{item.caption}</p>}
                    <div className="flex gap-2">
                      <button className="btn-success text-xs flex-1" onClick={() => approvePhoto(item.id)}>✓ Approve</button>
                      <button className="btn-danger text-xs flex-1" onClick={async () => {
                        await supabase.from('gallery_uploads').delete().eq('id', item.id)
                        setGallery(g => g.filter(u => u.id !== item.id))
                        toast.success('Photo deleted.')
                      }}>✕ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Announcements Tab */}
      {tab === 'announcements' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="font-syne font-bold text-lg">{announcements.length} Announcements</p>
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-ocean-muted glass-card">
              <p className="text-4xl mb-3">📢</p>
              <p>No announcements yet.</p>
            </div>
          ) : (
            <AnimatePresence>
              {announcements.map(a => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-syne font-bold text-base">{a.title}</h3>
                      {a.is_pinned && (
                        <span className="badge text-cyan-400 bg-cyan-400/10 border border-cyan-400/20">📌 Pinned</span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      className="btn-danger text-xs flex-shrink-0 px-3 py-1.5"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <p className="text-sm text-ocean-secondary leading-relaxed mb-3">{a.content}</p>
                  <p className="text-xs text-ocean-muted">{a.created_at ? format(new Date(a.created_at), 'MMM d, yyyy · h:mm a') : ''}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* Recent Signups */}
      {tab === 'signups' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="font-syne font-bold text-lg">Recent Signups</p>
          {recentSignups.length === 0 && (
            <div className="text-center py-12 text-ocean-muted glass-card">
              <p className="text-4xl mb-3">👥</p>
              <p>No signups yet.</p>
            </div>
          )}
          {recentSignups.map((s, i) => (
            <div key={i} className="glass-card flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center font-syne font-bold text-ocean-deep text-sm flex-shrink-0">
                {(s.full_name ?? '?').split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{s.full_name}</p>
                {s.email && <p className="text-xs text-ocean-muted">{s.email}</p>}
                <p className="text-xs text-ocean-muted">{timeAgo(s.created_at)}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
