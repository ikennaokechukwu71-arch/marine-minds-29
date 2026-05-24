'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import type { Student } from '@/types/database'

interface Props {
  students: Student[]
  currentUserId: string
}

export function DirectoryClient({ students, currentUserId }: Props) {
  const supabase = createClient() as any
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Student | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ nickname: '', bio: '', favorite_quote: '', instagram_url: '', twitter_url: '', linkedin_url: '' })
  const [saving, setSaving] = useState(false)

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(query.toLowerCase()) ||
    (s.nickname ?? '').toLowerCase().includes(query.toLowerCase())
  )

  function openProfile(s: Student) {
    setSelected(s)
    setEditing(false)
    setEditForm({
      nickname: s.nickname ?? '',
      bio: s.bio ?? '',
      favorite_quote: s.favorite_quote ?? '',
      instagram_url: s.instagram_url ?? '',
      twitter_url: s.twitter_url ?? '',
      linkedin_url: s.linkedin_url ?? '',
    })
  }

  async function saveProfile() {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase
      .from('students')
      .update({ ...editForm, updated_at: new Date().toISOString() })
      .eq('user_id', currentUserId)
    if (error) {
      toast.error('Could not save profile.')
    } else {
      toast.success('Profile updated! 🌊')
      setEditing(false)
      // Optimistic update
      setSelected(s => s ? { ...s, ...editForm } : s)
    }
    setSaving(false)
  }

  async function likeProfile(studentId: string) {
    const { error } = await supabase.from('profile_likes').insert({
      liker_id: currentUserId,
      liked_student_id: studentId,
    })
    if (!error) toast.success('❤️ Liked!')
  }

  const isOwnProfile = selected?.user_id === currentUserId

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-eyebrow">Marine Minds 29</p>
        <h1 className="section-heading">Meet the Crew 🌊</h1>
        <p className="section-sub mb-6">Your legendary classmates, in all their aquatic glory.</p>

        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            className="input-glass flex-1 min-w-[200px]"
            placeholder="Search by name or nickname..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn-glass" onClick={() => setQuery('')}>Clear</button>
        </div>
      </motion.div>

      {/* Count */}
      <p className="text-sm text-ocean-muted">{filtered.length} of {students.length} crew members</p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-5 text-center cursor-pointer"
            onClick={() => openProfile(s)}
          >
            <Avatar name={s.full_name} src={s.avatar_url} size="lg" className="mx-auto mb-3" />
            <p className="font-syne font-bold text-sm mb-1 truncate">{s.full_name}</p>
            {s.nickname && <p className="text-xs gradient-text-static mb-2">{s.nickname}</p>}
            <p className="text-xs text-ocean-muted line-clamp-2 leading-relaxed">
              {s.bio ?? 'No bio yet.'}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,11,24,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card p-8 w-full max-w-md relative"
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-ocean-muted hover:text-white transition-colors"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
                onClick={() => setSelected(null)}
              >✕</button>

              <Avatar name={selected.full_name} src={selected.avatar_url} size="xl"
                className="mx-auto mb-4 ring-4 ring-cyan-400/30 shadow-[0_0_30px_rgba(0,212,255,0.3)]" />

              {!editing ? (
                <>
                  <h2 className="font-syne text-2xl font-extrabold text-center mb-1">{selected.full_name}</h2>
                  {selected.nickname && <p className="text-center gradient-text-static font-semibold mb-4">✦ {selected.nickname}</p>}
                  {selected.favorite_quote && (
                    <blockquote className="text-sm text-ocean-secondary italic border-l-2 border-cyan-400/50 pl-4 mb-4 leading-relaxed">
                      "{selected.favorite_quote}"
                    </blockquote>
                  )}
                  {selected.bio && <p className="text-sm text-ocean-secondary leading-relaxed mb-5">{selected.bio}</p>}

                  <div className="flex gap-2 justify-center flex-wrap mb-4">
                    {selected.instagram_url && <a href={selected.instagram_url} target="_blank" className="btn-glass text-xs py-2 px-3">📸 Instagram</a>}
                    {selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" className="btn-glass text-xs py-2 px-3">💼 LinkedIn</a>}
                    {selected.twitter_url && <a href={selected.twitter_url} target="_blank" className="btn-glass text-xs py-2 px-3">🐦 Twitter</a>}
                  </div>

                  <div className="flex gap-2">
                    {!isOwnProfile && (
                      <button onClick={() => likeProfile(selected.id)} className="btn-glass flex-1 text-sm">❤️ Like</button>
                    )}
                    {isOwnProfile && (
                      <button onClick={() => setEditing(true)} className="btn-primary flex-1 text-sm">✏️ Edit My Profile</button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-syne text-xl font-bold text-center mb-5">Edit Your Profile</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Nickname', key: 'nickname', placeholder: 'The Barracuda' },
                      { label: 'Bio', key: 'bio', placeholder: 'Tell the crew who you are...' },
                      { label: 'Favorite Quote', key: 'favorite_quote', placeholder: '"The sea is everything..."' },
                      { label: 'Instagram URL', key: 'instagram_url', placeholder: 'https://instagram.com/...' },
                      { label: 'Twitter URL', key: 'twitter_url', placeholder: 'https://twitter.com/...' },
                      { label: 'LinkedIn URL', key: 'linkedin_url', placeholder: 'https://linkedin.com/in/...' },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs text-ocean-muted uppercase tracking-wider mb-1">{label}</label>
                        <input
                          className="input-glass"
                          placeholder={placeholder}
                          value={editForm[key as keyof typeof editForm]}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button className="btn-glass flex-1" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn-primary flex-1" onClick={saveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
