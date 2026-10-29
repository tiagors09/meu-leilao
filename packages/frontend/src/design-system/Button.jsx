const tones = {
  yellow: 'bg-[#FEF08A]',
  green: 'bg-[#D1FAE5]',
  pink: 'bg-[#FECDD3]',
  purple: 'bg-[#DDD6FE]',
  white: 'bg-white',
  black: 'bg-black text-white',
}

export function Button({ tone = 'yellow', className = '', type = 'button', as: Element = 'button', children, ...props }) {
  const elementProps = Element === 'button' ? { type, ...props } : props
  return <Element className={`inline-flex items-center justify-center gap-2 border-2 border-black px-4 py-2.5 font-extrabold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${tones[tone] || tones.yellow} ${className}`} {...elementProps}>{children}</Element>
}
