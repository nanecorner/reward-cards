'use client'

import { Scanner } from '@yudiel/react-qr-scanner'
import { useState } from 'react'
import { QrCode, RefreshCcw } from 'lucide-react'

export function QRScanner() {
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = (text: string) => {
    if (text && !scannedData) {
      setScannedData(text)
      
      // In a real app we'd parse the token from the URL, or if the QR just contains the token
      // We will assume the QR contains the full URL like http://.../client/[token]
      try {
        const url = new URL(text)
        const pathParts = url.pathname.split('/')
        const token = pathParts[pathParts.length - 1]
        
        if (token) {
           // Redirect to the API or an intermediate page to confirm the visit
           window.location.href = `/admin/scan/confirm?token=${token}`
        } else {
           setError('Formato de código QR inválido.')
        }
      } catch (e) {
        setError('URL de código QR inválida.')
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm p-3 rounded-xl">
          {error}
        </div>
      )}
      
      {!scannedData ? (
        <div className="rounded-3xl overflow-hidden border border-zinc-800 glass shadow-2xl relative">
          <div className="absolute inset-0 z-10 pointer-events-none border-[4px] border-primary/50 m-12 rounded-2xl"></div>
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0) {
                 handleScan(result[0].rawValue)
              }
            }}
            onError={(err) => setError(err.message)}
            components={{
              audio: true,
              torch: true,
              countDown: true,
              finder: true
            }}
          />
        </div>
      ) : (
        <div className="text-center p-8 glass border border-zinc-800 rounded-3xl">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Procesando Escaneo...</h3>
          <p className="text-zinc-400 mb-6">Por favor espera mientras verificamos al cliente.</p>
          <button 
            onClick={() => { setScannedData(null); setError(null); }}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <RefreshCcw className="w-4 h-4" /> Escanear de Nuevo
          </button>
        </div>
      )}
    </div>
  )
}
