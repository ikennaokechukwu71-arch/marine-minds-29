'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { OceanBackground } from '@/components/ui/OceanBackground'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient() as any
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      // Create student profile
      await supabase
  .from('students')
  .insert([
    {
      user_id: data?.user?.id || '',
      full_name: form.fullName || '',
    }
  ] as any)
      toast.success('Welcome to Marine Minds 29! Check your email to verify. 🌊')
      router.push('/auth/login')
    }
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <OceanBackground />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-syne text-3xl font-extrabold gradient-text-static mb-2">Join the Crew</h1>
          <p className="text-ocean-secondary text-sm">Create your Marine Minds 29 profile</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Tobechukwu Okafor' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@university.edu.ng' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '8+ characters' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-ocean-secondary mb-2 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                className="input-glass"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={set(key)}
                required
              />
            </div>
          ))}
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Creating profile...' : 'Join Marine Minds 29 🌊'}
          </button>
        </form>

        <p className="text-sm text-ocean-secondary text-center mt-6">
          Already in?{' '}
          <Link href="/auth/login" className="gradient-text-static font-semibold hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
