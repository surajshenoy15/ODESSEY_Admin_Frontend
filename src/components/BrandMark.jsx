import { Trophy } from 'lucide-react'
import { cn } from '../utils/format'

export default function BrandMark({ compact = false, inverse = false, className }) {
  return <div className={cn('flex items-center gap-3', className)} aria-label="BNMIT ODYSSEY">
    <div className={cn('relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[15px] border shadow-lg', inverse ? 'border-white/10 bg-white/10' : 'border-brand-900/10 bg-brand-950')}>
      <span className="absolute inset-x-0 bottom-0 h-2 bg-logo-orange" />
      <Trophy className="relative z-10 h-5 w-5 text-white" aria-hidden="true" />
    </div>
    {!compact ? <div className="min-w-0 leading-tight"><p className={cn('truncate font-display text-base font-black tracking-[-0.035em]', inverse ? 'text-white' : 'text-brand-950')}>BNMIT ODYSSEY</p><p className={cn('mt-1 truncate text-[9px] font-extrabold uppercase tracking-[0.16em]', inverse ? 'text-white/45' : 'text-slate-500')}>Event operations centre</p></div> : null}
  </div>
}
