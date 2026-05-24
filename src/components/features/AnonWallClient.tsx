'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { getMessageTypeColor, getMessageTypeEmoji, timeAgo } from '@/lib/utils'
import type { AnonMessage } from '@/types/database'

type MsgType = 'confession' | 'compliment' | 'secret' | 'funny' | 'secret_admirer'

const MSG_TYPES: { value: MsgType; label: string; emoji: string }[] = [
  { value: 'confession', label: 'Confession', emoji: '🌑' },
  { value: 'compliment', label: 'Compliment', emoji: '💙' },
  { value: 'secret', label: 'Secret', emoji: '🔮' },
  { value: 'funny', label: 'Funny', emoji: '😂' },
  { value: 'secret_admirer', label: 'Secret Admirer', emoji: '💘' },
]

const FILTER_OPTIONS = ['All', 'Confession', 'Compliment', 'Secret', 'Funny', 'Secret Admirer']

interface Props {
  messages: AnonMessage[]
  featuredMessage: AnonMessage | null
  userReactions: { message_id: string; reaction_type: string }[]
  userId: string
}

export function AnonWallClient({ messages: initial, featuredMessage, userReactions, userId }: Props) {
  const supabase = createClient() as any
  const [messages, setMessages] = useState(initial)
  const [reactions, setReactions] = useState(userReactions)
  const [text, setText] = useState('')
  const [msgType, setMsgType] = useState<MsgType>('confession')
  const [posting, setPosting] = useState(false)
  const [filter, setFilter] = useState('All')

  const filtered = messages.filter(m =>
    filter === 'All' ? true : m.message_type === filter.toLowerCase().replace(' ', '_')
  )

  async function postMessage() {
    if (!text.trim()) { toast.error('Write something first...'); return }
    if (text.trim().length < 10) { toast.error('Message too short. Say more!'); return }
    setPosting(true)
    const { error } = await supabase.from('anonymous_messages').insert({
      content: text.trim(),
      message_type: msgType,
      is_approved: false,
    })
    if (error) {
      toast.error('Could not post message.')
    } else {
      toast.success('🌊 Posted! Awaiting approval from class reps.')
      setText('')
    }
    setPosting(false)
  }

  async function toggleReaction(messageId: string, reactionType: 'like' | 'laugh' | 'fire') {
    const existing = reactions.find(r => r.message_id === messageId && r.reaction_type === reactionType)
    const countKey = reactionType === 'like' ? 'likes_count' : reactionType === 'laugh' ? 'laughs_count' : 'fire_count'

    if (existing) {
      await supabase.from('reactions').delete()
        .match({ user_id: userId, message_id: messageId, reaction_type: reactionType })
      setReactions(r => r.filter(x => !(x.message_id === messageId && x.reaction_type === reactionType)))
      setMessages(ms => ms.map(m => m.id === messageId ? { ...m, [countKey]: m[countKey] - 1 } : m))
    } else {
      await supabase.from('reactions').insert({ user_id: userId, message_id: messageId, reaction_type: reactionType })
      setReactions(r => [...r, { message_id: messageId, reaction_type: reactionType }])
      setMessages(ms => ms.map(m => m.id === messageId ? { ...m, [countKey]: m[countKey] + 1 } : m))
    }
  }

  function hasReacted(messageId: string, type: string) {
    return reactions.some(r => r.message_id === messageId && r.reaction_type === type)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-eyebrow">Anonymous Wall</p>
        <h1 className="section-heading">What's in the Deep 🌑</h1>
        <p className="section-sub">Confessions, compliments, secrets, laughs. All 100% anonymous.</p>
      </motion.div>

      {/* Featured */}
      {featuredMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6"
          style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.07),rgba(0,255,204,0.07))', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          <p className="section-eyebrow mb-3">⭐ Message of the Day</p>
          <p className="text-base leading-relaxed font-medium">{featuredMessage.content}</p>
          <div className="flex items-center gap-3 mt-4">
            <span className={`badge border ${getMessageTypeColor(featuredMessage.message_type)} text-xs`}>
              {getMessageTypeEmoji(featuredMessage.message_type)} {featuredMessage.message_type}
            </span>
            <span className="text-xs text-ocean-muted">{timeAgo(featuredMessage.created_at)}</span>
          </div>
        </motion.div>
      )}

      {/* Post Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <p className="text-sm font-semibold text-ocean-secondary mb-4">Post something anonymously</p>
        <textarea
          className="input-glass min-h-[100px] resize-none mb-4"
          placeholder="Type your message... nobody will know it's you."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap mb-4">
          {MSG_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setMsgType(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                msgType === t.value
                  ? getMessageTypeColor(t.value)
                  : 'border-glass text-ocean-muted hover:text-white'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={postMessage} disabled={posting}>
          {posting ? 'Posting...' : '🌊 Post Anonymously'}
        </button>
        <p className="text-xs text-ocean-muted mt-3">Posts are reviewed by class reps before going live.</p>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === opt ? 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' : 'border-glass text-ocean-muted hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Messages Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 flex flex-col"
            >
              <span className={`badge border ${getMessageTypeColor(msg.message_type)} text-xs mb-3 self-start`}>
                {getMessageTypeEmoji(msg.message_type)} {msg.message_type.replace('_', ' ')}
              </span>
              <p className="text-sm leading-relaxed flex-1 mb-4">{msg.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ocean-muted">{timeAgo(msg.created_at)}</span>
                <div className="flex gap-1.5">
                  {(['like', 'laugh', 'fire'] as const).map(r => {
                    const emojis = { like: '❤️', laugh: '😂', fire: '🔥' }
                    const counts = { like: msg.likes_count, laugh: msg.laughs_count, fire: msg.fire_count }
                    return (
                      <button
                        key={r}
                        className={`reaction-btn ${hasReacted(msg.id, r) ? 'active' : ''}`}
                        onClick={() => toggleReaction(msg.id, r)}
                      >
                        {emojis[r]} {counts[r]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-ocean-muted">
          <p className="text-4xl mb-4">🌊</p>
          <p>No messages here yet. Be the first to make a wave.</p>
        </div>
      )}
    </div>
  )
}
