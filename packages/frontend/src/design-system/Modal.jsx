import { useEffect } from 'react'
import { Button } from './Button'

export function Modal({ open, onClose, title, eyebrow, children }) {
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md border-2 border-black bg-[#FDFBF7] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4"><div>{eyebrow && <p className="text-xs font-black uppercase tracking-[0.2em]">{eyebrow}</p>}<h2 className="mt-2 text-2xl font-black">{title}</h2></div><Button tone="white" className="size-10 shrink-0 p-0" aria-label="Fechar" onClick={onClose}>×</Button></div>
      {children}
    </section>
  </div>
}
