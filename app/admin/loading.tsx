import { ReactNode } from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      {/* Premium glowing loader */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
      </div>
      <p className="text-zinc-500 text-sm font-medium animate-pulse">Cargando administrador...</p>
    </div>
  )
}
