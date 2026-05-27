'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

type Category = 'academic' | 'fieldtrip' | 'social' | 'graduation' | 'misc'

const CATEGORIES: { value: Category | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🌊' },
  { value: 'academic', label: 'Academic', emoji: '📚' },
  { value: 'fieldtrip', label: 'Field Trips', emoji: '🌿' },
  { value: 'social', label: 'Social', emoji: '🎉' },
  { value: 'graduation', label: 'Graduation', emoji: '🎓' },
  { value: 'misc', label: 'Misc', emoji: '📷' },
]

interface Upload {
  id: string
  image_url: string
  caption: string | null
  category: Category
  likes_count: number
  created_at: string
  students?: { full_name: string; nickname: string | null } | null
}

interface Props {
  uploads: Upload[]
  userId: string
}

export function GalleryClient({ uploads, userId }: Props) {
  const supabase = createClient() as any
  const [items, setItems] = useState(uploads)
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [lightbox, setLightbox] = useState<Upload | null>(null)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = items.filter(u => filter === 'all' || u.category === filter)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB.'); return }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `gallery/${userId}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file)
    if (uploadError) { toast.error('Upload failed.'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
    const { error } = await supabase.from('gallery_uploads').insert({
      uploaded_by: userId, image_url: publicUrl, caption, category, is_approved: false,
    })
    if (error) { toast.error('Could not save photo.') }
    else { toast.success('📸 Photo submitted for approval!'); setCaption('') }
    setUploading(false)
  }

  async function likePhoto(id: string) {
    await supabase.rpc('increment_gallery_like', { upload_id: id })
    setItems(its => its.map(i => i.id === id ? { ...i, likes_count: i.likes_count + 1 } : i))
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-eyebrow">Class Memories</p>
        <h1 className="section-heading">The Memory Bank 📸</h1>
        <p className="section-sub">Every moment. Every laugh. Every late-night fish lab session.</p>
      </motion.div>

      {/* Upload — only show for logged in users */}
      {userId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <p className="text-sm font-semibold text-ocean-secondary mb-4">Add a memory to the bank</p>
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[160px]">
              <input
                className="input-glass"
                placeholder="Caption (optional)"
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </div>
            <select
              className="input-glass w-auto"
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading...' : '📸 Upload Photo'}
            </button>
          </div>
          <p className="text-xs text-ocean-muted mt-2">Photos are reviewed by class reps before going public.</p>
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === c.value ? 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' : 'border-glass text-ocean-muted hover:text-white'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      {filtered.length > 0 ? (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden"
              onClick={() => setLightbox(item)}
            >
              <div className="relative">
                <img
                  src={item.image_url}
                  alt={item.caption ?? 'Class memory'}
                  className="w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-ocean-deep/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {item.caption && <p className="text-sm font-medium text-white">{item.caption}</p>}
                  <p className="text-xs text-white/60 mt-1">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-ocean-muted">
          <p className="text-4xl mb-4">📸</p>
          <p>No memories here yet. Be the first to add one.</p>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(20px)' }}
            onClick={e => { if (e.target === e.currentTarget) setLightbox(null) }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
            >
              <button
                className="absolute -top-12 right-0 text-white/60 hover:text-white text-2xl"
                onClick={() => setLightbox(null)}
              >✕</button>
              <div className="relative rounded-2xl overflow-hidden mb-4">
                <img
                  src={lightbox.image_url}
                  alt={lightbox.caption ?? ''}
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {lightbox.caption && <p className="font-semibold text-base">{lightbox.caption}</p>}
                  <p className="text-sm text-ocean-muted">{timeAgo(lightbox.created_at)}</p>
                </div>
                {userId && (
                  <button className="btn-glass text-sm" onClick={() => likePhoto(lightbox.id)}>
                    ❤️ {lightbox.likes_count}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
