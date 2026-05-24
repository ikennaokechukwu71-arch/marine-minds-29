'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { OceanBackground } from '@/components/ui/OceanBackground'
import { BubbleField } from '@/components/ui/BubbleField'
import { getDailyMarineFact } from '@/lib/utils'

export default function LandingPage() {
  const fact = getDailyMarineFact()

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <OceanBackground />
      <BubbleField />

      {/* Hero */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--cyan)' }}
        >
          🌊 Department of Aquaculture &amp; Fisheries Management
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="gradient-text font-syne font-extrabold leading-none mb-4"
          style={{ fontSize: 'clamp(56px, 10vw, 110px)', backgroundSize: '200% 200%' }}
        >
          Marine<br />Minds 29
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-ocean-secondary text-lg leading-relaxed mb-10 max-w-md mx-auto"
        >
          One ocean. One crew. The most aquatic class to ever graduate from this department.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          <Link href="/auth/login" className="btn-primary">
            Dive In 🌊
          </Link>
          <Link href="/auth/signup" className="btn-glass">
            Join the Crew
          </Link>
        </motion.div>

        {/* Marine Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-14 p-5 rounded-2xl text-left"
          style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
        >
          <p className="section-eyebrow mb-2">🐠 Daily Marine Fact</p>
          <p className="text-sm text-ocean-secondary leading-relaxed">{fact}</p>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-ocean-muted tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.4), transparent)' }}
        />
      </motion.div>
    </main>
  )
}
