'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { getAvatarGradient, getInitials } from '@/lib/utils'
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
  const [editForm, setEditForm] = useState({ full_name: '', nickname: '', bio: '', favorite_quote: '', instagram_url: '', twitter_url: '', linkedin_url: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(query.toLowerCase()) ||
    (s.nickname ?? '').toLowerCase().includes(query.toLowerCase())
  )

  function openProfile(s: Student) {
    setSelected(s)
    setEditing(false)
    setAvatarPreview(null)
    setEditForm({
      full_name: s.full_name ?? '',
      nickname: s.nickname ?? '',
      bio: s.bio ?? '',
      favorite_quote: s.favorite_quote ?? '',
      instagram_url: s.instagram_url ?? '',
      twitter_url: s.twitter_url ?? '',
      linkedin_url: s.linkedin_url ?? '',
    })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image too large. Max 2MB.'); return }
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${currentUserId}.${ext}`
    const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file, { upsert: true })
    if (uploadError) { toast.error('Avatar upload failed.'); setUploadingAvatar(false); return }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
    const { error } = await supabase.from('students').update({ avatar_url: publicUrl }).eq('user_id', currentUserId)
    if (error) {
      toast.error('Could not save avatar.')
    } else {
      setAvatarPreview(publicUrl)
      setSelected(s => s ? { ...s, avatar_url: publicUrl } : s)
      toast.success('Profile photo updated! 🌊')
    }
    setUploadingAvatar(false)
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
      setSelected(s => s ? { ...s, ...editForm } : s)
      // Refresh page to update name in nav
      if (editForm.full_name !== selected?.full_name) window.location.reload()
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

      <p className="text-sm text-ocean-muted">{filtered.length} of {students.length} crew members</p>

      {/* Portrait Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((s, i) => {
          const gradient = getAvatarGradient(s.full_name)
          const initials = getInitials(s.full_name)
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group cursor-pointer rounded-2xl overflow-hidden relative"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(6,32,64,0.4)' }}
              onClick={() => openProfile(s)}
            >
              {/* Portrait Image Area */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                {s.avatar_url ? (
                  <Image
                    src={s.avatar_url}
                    alt={s.full_name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="200px"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                    <span className="font-syne font-extrabold text-3xl text-ocean-deep opacity-60">{initials}</span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep via-ocean-deep/20 to-transparent" />
              </div>

              {/* Name area */}
              <div className="p-3">
                <p className="font-syne font-bold text-sm truncate">{s.full_name}</p>
                {s.nickname
                  ? <p className="text-xs gradient-text-static truncate">{s.nickname}</p>
                  : <p className="text-xs text-ocean-muted truncate">{s.bio ?? 'No bio yet.'}</p>
                }
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,11,24,0.85)', backdropFilter: 'blur(16px)' }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-sm relative overflow-hidden rounded-3xl"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(6,22,50,0.97)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)' }}
                onClick={() => setSelected(null)}
              >✕</button>

              {!editing ? (
                <>
                  {/* Full portrait image */}
                  <div className="relative w-full aspect-[4/5]">
                    {selected.avatar_url ? (
                      <Image
                        src={selected.avatar_url}
                        alt={selected.full_name}
                        fill
                        className="object-cover object-top"
                        sizes="400px"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getAvatarGradient(selected.full_name)}`}>
                        <span className="font-syne font-extrabold text-6xl text-ocean-deep opacity-40">
                          {getInitials(selected.full_name)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,22,50,0.97)] via-[rgba(6,22,50,0.2)] to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="font-syne text-2xl font-extrabold">{selected.full_name}</h2>
                      {selected.nickname && <p className="gradient-text-static font-semibold text-sm">✦ {selected.nickname}</p>}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    {selected.favorite_quote && (
                      <blockquote className="text-sm text-ocean-secondary italic border-l-2 border-cyan-400/50 pl-4 leading-relaxed">
                        "{selected.favorite_quote}"
                      </blockquote>
                    )}
                    {selected.bio && (
                      <p className="text-sm text-ocean-secondary leading-relaxed">{selected.bio}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {selected.instagram_url && <a href={selected.instagram_url} target="_blank" className="btn-glass text-xs py-2 px-3">📸 Instagram</a>}
                      {selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" className="btn-glass text-xs py-2 px-3">💼 LinkedIn</a>}
                      {selected.twitter_url && <a href={selected.twitter_url} target="_blank" className="btn-glass text-xs py-2 px-3">🐦 Twitter</a>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      {!isOwnProfile && (
                        <button onClick={() => likeProfile(selected.id)} className="btn-glass flex-1 text-sm">❤️ Like</button>
                      )}
                      {isOwnProfile && (
                        <button onClick={() => setEditing(true)} className="btn-primary flex-1 text-sm">✏️ Edit My Profile</button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8">
                  <h2 className="font-syne text-xl font-bold text-center mb-5">Edit Your Profile</h2>

                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer rounded-2xl overflow-hidden w-32 h-32" onClick={() => avatarRef.current?.click()}>
                      {(avatarPreview ?? selected.avatar_url) ? (
                        <Image
                          src={avatarPreview ?? selected.avatar_url ?? ''}
                          alt={selected.full_name}
                          fill
                          className="object-cover object-top"
                          sizes="128px"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getAvatarGradient(selected.full_name)}`}>
                          <span className="font-syne font-extrabold text-3xl text-ocean-deep opacity-60">{getInitials(selected.full_name)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs">{uploadingAvatar ? 'Uploading...' : '📷 Change'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-ocean-muted mt-2">Click to change · Max 2MB</p>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Full Name', key: 'full_name', placeholder: 'Your full name' },
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
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
