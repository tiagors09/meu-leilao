export function Input({ className = '', label, error, id, ...props }) {
  const inputId = id || props.name
  return <label htmlFor={inputId} className="block text-sm font-extrabold text-black">
    {label && <span className="mb-1.5 block">{label}</span>}
    <input id={inputId} className={`w-full border-2 border-black bg-white px-3.5 py-3 font-semibold text-black outline-none placeholder:font-medium placeholder:text-slate-500 focus:bg-[#DDD6FE] focus:ring-2 focus:ring-black ${error ? 'bg-[#FECDD3]' : ''} ${className}`} {...props} />
    {error && <span className="mt-1 block text-xs font-bold text-rose-800">{error}</span>}
  </label>
}
