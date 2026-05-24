import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Get initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/** Format a date relative to now */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/** Format event date nicely */
export function formatEventDate(date: string): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d, yyyy')
}

/** Get gradient colors for avatars based on name */
export function getAvatarGradient(name: string): string {
  const gradients = [
    'from-cyan-400 to-teal-400',
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-emerald-400 to-teal-400',
    'from-orange-400 to-pink-400',
    'from-violet-400 to-purple-400',
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}

/** Get color class for message type */
export function getMessageTypeColor(type: string): string {
  const colors: Record<string, string> = {
    confession:     'text-pink-400 border-pink-400/30 bg-pink-400/10',
    compliment:     'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    secret:         'text-purple-400 border-purple-400/30 bg-purple-400/10',
    funny:          'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    secret_admirer: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  }
  return colors[type] ?? colors.confession
}

/** Get emoji for message type */
export function getMessageTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    confession:     '🌑',
    compliment:     '💙',
    secret:         '🔮',
    funny:          '😂',
    secret_admirer: '💘',
  }
  return emojis[type] ?? '🌊'
}

/** Marine facts for daily rotation */
export const MARINE_FACTS = [
  "Octopuses have three hearts, blue blood, and can edit their own RNA to adapt to temperature changes.",
  "The ocean produces over 50% of the Earth's oxygen — more than all rainforests combined.",
  "A group of fish is called a school, but a group of catfish is called a clowder.",
  "Clownfish can change sex — all are born male, and the dominant one becomes female.",
  "The deepest point in the ocean — the Challenger Deep — is deeper than Everest is tall.",
  "Sea otters hold hands while sleeping so they don't drift apart. They call this 'rafting'.",
  "Sharks have been around longer than trees — they predate forests by 50 million years.",
  "A single tiger shrimp can live up to 5 years and is one of the most commercially valuable aquaculture species in West Africa.",
  "Tilapia is one of the most efficient feed converters in aquaculture, needing only 1.6kg of feed per 1kg of growth.",
  "Nigeria is the largest fish consumer in Sub-Saharan Africa, yet imports over 700,000 tonnes annually — the gap is your career opportunity.",
]

/** Get today's marine fact */
export function getDailyMarineFact(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return MARINE_FACTS[dayOfYear % MARINE_FACTS.length]
}

/** Check if today is a birthday */
export function isBirthdayToday(birthday: string | null): boolean {
  if (!birthday) return false
  const b = new Date(birthday)
  const today = new Date()
  return b.getMonth() === today.getMonth() && b.getDate() === today.getDate()
}

/** Days until next birthday */
export function daysUntilBirthday(birthday: string | null): number {
  if (!birthday) return -1
  const today = new Date()
  const b = new Date(birthday)
  const next = new Date(today.getFullYear(), b.getMonth(), b.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next.getTime() - today.getTime()) / 86400000)
}
