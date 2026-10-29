const tones = { green: 'bg-[#D1FAE5]', yellow: 'bg-[#FEF08A]', pink: 'bg-[#FECDD3]', purple: 'bg-[#DDD6FE]', white: 'bg-white' }

export function Badge({ tone = 'purple', className = '', children, ...props }) {
  return <span className={`inline-flex items-center gap-2 border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-wide text-black ${tones[tone] || tones.purple} ${className}`} {...props}>{children}</span>
}
