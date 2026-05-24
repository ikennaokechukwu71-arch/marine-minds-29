'use client'

export function OceanBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, #041830 0%, #020b18 60%, #010810 100%)',
        }}
      />

      {/* Glow orbs */}
      <div
        className="ocean-glow-orb"
        style={{
          width: 600,
          height: 400,
          background: 'radial-gradient(circle, #00d4ff, transparent)',
          top: '5%',
          left: '-10%',
          animationDelay: '0s',
          animationDuration: '9s',
        }}
      />
      <div
        className="ocean-glow-orb"
        style={{
          width: 500,
          height: 350,
          background: 'radial-gradient(circle, #0af5c8, transparent)',
          bottom: '15%',
          right: '-5%',
          animationDelay: '3s',
          animationDuration: '11s',
        }}
      />
      <div
        className="ocean-glow-orb"
        style={{
          width: 350,
          height: 300,
          background: 'radial-gradient(circle, #0044ff, transparent)',
          top: '50%',
          left: '45%',
          animationDelay: '5s',
          animationDuration: '8s',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
