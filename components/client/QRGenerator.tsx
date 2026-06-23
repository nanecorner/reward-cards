'use client'

import { QRCodeSVG } from 'qrcode.react'

export function QRGenerator({ value, size = 256 }: { value: string, size?: number }) {
  return (
    <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
      <QRCodeSVG 
        value={value} 
        size={size}
        level="Q"
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  )
}
