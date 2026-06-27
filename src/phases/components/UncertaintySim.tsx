import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function UncertaintySim() {
  const [precision, setPrecision] = useState(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width, h = rect.height
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)

      phaseRef.current += 0.03

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      // Position uncertainty (narrow wave packet = precise position)
      const posSigma = (100 - precision) / 100 * 60 + 10 // 10 to 70
      const momSigma = precision / 100 * 60 + 10

      const cx = w / 2, cy = h * 0.35

      // Position wave packet
      for (let x = 0; x < w; x++) {
        const envelope = Math.exp(-(((x - cx) / posSigma) ** 2))
        const wave = Math.sin((x - cx) * 0.08 + phaseRef.current)
        const y = cy + envelope * wave * 40

        ctx.fillStyle = `rgba(108, 99, 255, ${envelope * 0.3})`
        ctx.fillRect(x, cy - envelope * 40, 1, envelope * 80)

        if (x === 0) ctx.beginPath()
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#6c63ff'
      ctx.lineWidth = 2
      ctx.shadowColor = '#6c63ff60'
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0

      // Position label
      ctx.fillStyle = '#6c63ff'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Position Wave Packet', cx, 18)

      // Position uncertainty marker
      ctx.strokeStyle = '#6c63ff40'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(cx - posSigma, cy + 45)
      ctx.lineTo(cx + posSigma, cy + 45)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#6c63ff'
      ctx.font = '9px monospace'
      ctx.fillText(`Δx ≈ ${(posSigma / 10).toFixed(1)}`, cx, cy + 60)

      // Momentum distribution (bottom)
      const momCy = h * 0.75
      const momCx = w / 2

      // Bell curve for momentum
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const dist = (x - momCx) / momSigma
        const y = momCy - Math.exp(-dist * dist * 0.5) * 50
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#ff6b9d'
      ctx.lineWidth = 2
      ctx.shadowColor = '#ff6b9d60'
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0

      // Fill under curve
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const dist = (x - momCx) / momSigma
        const y = momCy - Math.exp(-dist * dist * 0.5) * 50
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.lineTo(w, momCy)
      ctx.lineTo(0, momCy)
      ctx.closePath()
      ctx.fillStyle = '#ff6b9d15'
      ctx.fill()

      // Momentum label
      ctx.fillStyle = '#ff6b9d'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Momentum Distribution', cx, h - 10)

      // Momentum uncertainty marker
      ctx.strokeStyle = '#ff6b9d40'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(momCx - momSigma, momCy - 55)
      ctx.lineTo(momCx + momSigma, momCy - 55)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#ff6b9d'
      ctx.font = '9px monospace'
      ctx.fillText(`Δp ≈ ${(momSigma / 10).toFixed(1)}`, cx, momCy - 60)

      // Product display
      const product = (posSigma / 10) * (momSigma / 10)
      const minProduct = 0.53 // ℏ/2 in these units
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(w / 2 - 80, cy + 70, 160, 24)
      ctx.fillStyle = product >= minProduct ? '#ffd93d' : '#ff6b6b'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`Δx · Δp ≈ ${product.toFixed(2)}  (≥ ${minProduct.toFixed(2)})`, cx, cy + 86)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [precision])

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Heisenberg Uncertainty Principle</h3>
        <p className="text-xs text-text-muted">Δx · Δp ≥ ℏ/2 — You cannot know both position and momentum exactly</p>
        <div>
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Position Precision →</span>
            <span>{precision}%</span>
          </div>
          <input type="range" min={5} max={95} value={precision}
            onChange={e => setPrecision(parseInt(e.target.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>Δx small (precise position)</span>
            <span>Δp small (precise momentum)</span>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 380 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
