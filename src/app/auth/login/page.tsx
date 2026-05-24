'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { OceanBackground } from '@/components/ui/OceanBackground'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back, Marine Mind 🌊')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <OceanBackground />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-syne text-3xl font-extrabold gradient-text-static mb-2">Welcome Back</h1>
          <p className="text-ocean-secondary text-sm">Sign in to Marine Minds 29</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ocean-secondary mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              className="input-glass"
              placeholder="you@university.edu.ng"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ocean-secondary mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="input-glass"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Diving in...' : 'Sign In 🌊'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-ocean-muted hover:text-cyan-400 transition-colors"
          >
            Forgot password?
          </Link>
          <p className="text-sm text-ocean-secondary">
            New here?{' '}
            <Link href="/auth/signup" className="gradient-text-static font-semibold hover:opacity-80 transition-opacity">
              Join the crew
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
