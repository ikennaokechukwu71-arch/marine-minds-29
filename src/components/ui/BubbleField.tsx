'use client'

import { useEffect, useRef } from 'react'

export function BubbleField() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const bubbles: HTMLDivElement[] = []
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div')
      const size = Math.random() * 40 + 8
      b.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;
        border-radius:50%;
        background:rgba(0,212,255,0.04);
        border:1px solid rgba(0,212,255,0.08);
        animation:bubbleRise ${Math.random() * 14 + 10}s linear ${Math.random() * 15}s infinite;
        pointer-events:none;
      `
      container.appendChild(b)
      bubbles.push(b)
    }
    return () => bubbles.forEach(b => b.remove())
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  )
}
