const tones = { white: 'bg-white', yellow: 'bg-[#FEF08A]', green: 'bg-[#D1FAE5]', pink: 'bg-[#FECDD3]', purple: 'bg-[#DDD6FE]' }

export function Card({ tone = 'white', className = '', as: Element = 'section', children, ...props }) {
  return <Element className={`border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6 ${tones[tone] || tones.white} ${className}`} {...props}>{children}</Element>
}
