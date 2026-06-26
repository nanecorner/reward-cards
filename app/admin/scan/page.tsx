import { QRScanner } from '@/components/admin/QRScanner'
import { QrCode } from 'lucide-react'

export default function ScanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <div>
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Escanear Tarjeta</h1>
        <p className="opacity-70">Posiciona el código QR del cliente dentro del recuadro para registrar su visita.</p>
      </div>

      <div className="pt-8">
        <QRScanner />
      </div>
    </div>
  )
}
