import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const H = 6.626e-34
const ME = 9.11e-31

export default function DeBroglieSim() {
  const [mass, setMass] = useState(1)
  const [velocity, setVelocity] = useState(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const phaseRef = useRef(0)

  const massKg = mass * ME
  const wavelength = H / (massKg * velocity * 1e6)
  const wavelengthNm = wavelength * 1e9

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

      phaseRef.current += 0.05

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = '#ffffff05'
      ctx.lineWidth = 1
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke()
      }
      for (let i = 0; i < h; i += 30) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke()
      }

      const cx = w / 2
      const cy = h / 2
      const visWavelength = Math.max(wavelengthNm * 3, 30)
      const visWavelengthClamped = Math.min(visWavelength, w * 0.6)
      const amplitude = h * 0.2

      // Wave
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const y = cy + Math.sin((x / visWavelengthClamped) * Math.PI * 2 + phaseRef.current) * amplitude * Math.exp(-(((x - w / 2) / (w * 0.3)) ** 2))
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#6c63ff'
      ctx.lineWidth = 2
      ctx.shadowColor = '#6c63ff60'
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0

      // Particle
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 10)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.4, '#6c63ff')
      grad.addColorStop(1, '#6c63ff00')
      ctx.fillStyle = grad
      ctx.fill()

      ctx.shadowColor = '#6c63ff'
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#6c63ff'
      ctx.fill()
      ctx.shadowBlur = 0

      // Labels
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Particle (electron)', cx, 20)
      ctx.fillText('Matter Wave (ψ)', cx, h - 15)

      // Wavelength markers
      if (wavelengthNm > 0.01) {
        ctx.strokeStyle = '#ffd93d40'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        const wl = Math.min(Math.max(wavelengthNm * 5, 40), w * 0.4)
        ctx.beginPath()
        ctx.moveTo(cx - wl / 2, 25)
        ctx.lineTo(cx + wl / 2, 25)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#ffd93d'
        ctx.font = '9px monospace'
        ctx.fillText(`λ = ${wavelengthNm.toFixed(3)} nm`, cx, 40)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [mass, velocity, wavelengthNm])

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">de Broglie Matter Wave Visualizer</h3>
        <p className="text-xs text-text-muted">λ = h / (m × v) &nbsp; | &nbsp; m = mass × m<sub>e</sub></p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Mass multiplier (× m<sub>e</sub>)</span>
              <span>{mass.toFixed(1)}</span>
            </div>
            <input type="range" min={0.1} max={10} step={0.1} value={mass}
              onChange={e => setMass(parseFloat(e.target.value))}
              className="w-full accent-primary" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Velocity (× 10⁶ m/s)</span>
              <span>{velocity}</span>
            </div>
            <input type="range" min={5} max={200} step={1} value={velocity}
              onChange={e => setVelocity(parseInt(e.target.value))}
              className="w-full accent-primary" />
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 260 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-lg bg-surface/30 p-2">
            <span className="text-text-muted">Mass</span>
            <p className="text-text-primary font-mono">{(massKg * 1000).toExponential(2)} kg</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2">
            <span className="text-text-muted">de Broglie λ</span>
            <p className="text-primary font-bold font-mono">{wavelengthNm.toFixed(4)} nm</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-2">
            <span className="text-text-muted">Velocity</span>
            <p className="text-text-primary font-mono">{velocity} × 10⁶ m/s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
