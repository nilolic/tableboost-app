"use client"
import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
export default function QRWithLogo({ url, logoUrl, size=600 }: { url: string, logoUrl?: string|null, size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState("")
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    QRCode.toCanvas(canvas, url, { errorCorrectionLevel: 'H', margin: 2, width: size, color: { dark: '#000', light: '#FFF' } }, async (err) => {
      if (err) return
      if (logoUrl) {
        try {
          const img = new Image()
          if (!logoUrl.startsWith('data:')) img.crossOrigin = "anonymous"
          img.src = logoUrl
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
          const logoSize = size * 0.22
          const x = (size - logoSize) / 2
          const y = (size - logoSize) / 2
          const pad = 12
          ctx.fillStyle = "#FFFFFF"
          ctx.fillRect(x-pad, y-pad, logoSize+pad*2, logoSize+pad*2)
          ctx.strokeStyle = "#e5e5e5"
          ctx.lineWidth = 2
          ctx.strokeRect(x-pad, y-pad, logoSize+pad*2, logoSize+pad*2)
          ctx.drawImage(img, x, y, logoSize, logoSize)
        } catch {}
      }
      setDataUrl(canvas.toDataURL("image/png"))
    })
  }, [url, logoUrl, size])
  return <><canvas ref={canvasRef} className="hidden" />{dataUrl? <img src={dataUrl} alt="QR" className="w-full aspect-square rounded-xl" /> : <div className="w-full aspect-square bg-zinc-100 animate-pulse rounded-xl" />}</>
}
