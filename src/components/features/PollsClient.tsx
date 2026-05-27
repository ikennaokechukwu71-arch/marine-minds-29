'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface PollOption { id: string; option_text: string; votes_count: number }
interface Poll { id: string; question: string; total_votes: number; is_active: boolean; poll_options: PollOption[] }
interface Props {
  polls: Poll[]
  userVotes: { poll_id: string; option_id: string }[]
  userId: string
}

export function PollsClient({ polls: initial, userVotes: initialVotes, userId }: Props) {
  const supabase = createClient() as any
  const [polls, setPolls] = useState(initial)
  const [userVotes, setUserVotes] = useState(initialVotes)
  const [voting, setVoting] = useState<string | null>(null)

  function hasVoted(pollId: string) {
    return userVotes.some(v => v.poll_id === pollId)
  }
  function votedOption(pollId: string) {
    return userVotes.find(v => v.poll_id === pollId)?.option_id
  }

  async function castVote(pollId: string, optionId: string) {
    if (!userId) { toast.error('Sign in to vote.'); return }
    if (voting) return

    const previousOptionId = votedOption(pollId)
    const isSameOption = previousOptionId === optionId
    if (isSameOption) return

    setVoting(optionId)

    if (previousOptionId) {
      await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', userId)
      await supabase.rpc('decrement_poll_vote', { option_id: previousOptionId, poll_id: pollId })
    }

    const { error } = await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, option_id: optionId, user_id: userId })

    if (error) {
      toast.error('Could not cast vote.')
      console.error('Vote error:', error)
    } else {
      await supabase.rpc('increment_poll_vote', { option_id: optionId, poll_id: pollId })

      setUserVotes(v => {
        const filtered = v.filter(x => x.poll_id !== pollId)
        return [...filtered, { poll_id: pollId, option_id: optionId }]
      })

      setPolls(ps => ps.map(p => {
        if (p.id !== pollId) return p
        const totalDelta = previousOptionId ? 0 : 1
        const newOptions = p.poll_options.map(o => {
          if (o.id === optionId) return { ...o, votes_count: o.votes_count + 1 }
          if (o.id === previousOptionId) return { ...o, votes_count: Math.max(o.votes_count - 1, 0) }
          return o
        })
        return { ...p, total_votes: p.total_votes + totalDelta, poll_options: newOptions }
      }))

      toast.success(previousOptionId ? '✦ Vote changed!' : '✦ Vote counted!')
    }
    setVoting(null)
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-eyebrow">Class Polls</p>
        <h1 className="section-heading">Cast Your Vote 🗳️</h1>
        <p className="section-sub">Anonymous class polls. Your vote shapes the narrative.</p>
      </motion.div>

      <div className="space-y-6">
        {polls.map((poll, pi) => {
          const voted = hasVoted(poll.id)
          const showResults = voted || !userId
          const myVote = votedOption(poll.id)
          const total = poll.total_votes > 0 ? poll.total_votes : 0

          return (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.08 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="font-syne font-bold text-lg">{poll.question}</h2>
                {!poll.is_active && (
                  <span className="badge text-ocean-muted bg-glass border border-glass text-xs flex-shrink-0">Closed</span>
                )}
              </div>
              <p className="text-xs text-ocean-muted mb-5">
                {total.toLocaleString()} {total === 1 ? 'vote' : 'votes'} cast
                {voted ? ' · Tap to change vote' : poll.is_active ? ' · Tap to vote' : ''}
              </p>

              <div className="space-y-3">
                {poll.poll_options.map(opt => {
                  const pct = total > 0 ? Math.round((opt.votes_count / total) * 100) : 0
                  const isMyVote = myVote === opt.id
                  const isDisabled = !poll.is_active || voting !== null || !userId

                  return (
                    <button
                      key={opt.id}
                      disabled={isDisabled}
                      onClick={() => castVote(poll.id, opt.id)}
                      className="w-full text-left relative rounded-xl overflow-hidden transition-all group"
                      style={{
                        padding: '12px 16px',
                        border: `1px solid ${isMyVote ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        background: isMyVote ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)',
                        cursor: isDisabled ? 'default' : 'pointer',
                      }}
                    >
                      {/* Vote bar */}
                      {showResults && total > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="absolute inset-0 rounded-xl"
                          style={{ background: isMyVote ? 'linear-gradient(90deg,rgba(0,212,255,0.12),rgba(0,255,204,0.08))' : 'linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))' }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-sm font-medium">{opt.option_text}</span>
                        {showResults ? (
                          <div className="flex items-center gap-2">
                            {isMyVote && <span className="text-cyan-400 text-xs font-semibold">✓ Your vote</span>}
                            <span className="font-syne font-bold text-sm" style={{ color: isMyVote ? 'var(--cyan)' : 'var(--text-muted)' }}>
                              {pct}%
                            </span>
                          </div>
                        ) : (
                          poll.is_active && userId && (
                            <span className="text-xs text-ocean-muted group-hover:text-cyan-400 transition-colors">
                              {voting === opt.id ? '...' : 'Vote →'}
                            </span>
                          )
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {!userId && poll.is_active && (
                <p className="text-xs text-ocean-muted mt-3 text-center">Sign in to vote</p>
              )}
            </motion.div>
          )
        })}
      </div>

      {polls.length === 0 && (
        <div className="text-center py-16 text-ocean-muted">
          <p className="text-4xl mb-4">🗳️</p>
          <p>No polls yet. Class reps will add some soon.</p>
        </div>
      )}
    </div>
  )
}