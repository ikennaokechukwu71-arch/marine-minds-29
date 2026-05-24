import Image from 'next/image'
import { getInitials, getAvatarGradient } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const gradient = getAvatarGradient(name)
  const initials = getInitials(name)
  const sizeClass = sizes[size]

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeClass, className)}>
        <Image src={src} alt={name} fill className="object-cover" sizes="96px" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-syne font-extrabold flex-shrink-0',
        `bg-gradient-to-br ${gradient}`,
        'text-ocean-deep',
        sizeClass,
        className,
      )}
    >
      {initials}
    </div>
  )
}
