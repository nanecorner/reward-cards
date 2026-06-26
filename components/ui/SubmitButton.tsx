'use client'

import { useFormStatus } from 'react-dom'
import { ReactNode } from 'react'

interface SubmitButtonProps {
  children: ReactNode
  className?: string
  loadingText?: string
}

export function SubmitButton({ 
  children, 
  className = '', 
  loadingText = 'Procesando...' 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed ${className}`}
    >
      {pending && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      )}
      <span className="flex items-center justify-center gap-2">{pending ? loadingText : children}</span>
    </button>
  )
}
