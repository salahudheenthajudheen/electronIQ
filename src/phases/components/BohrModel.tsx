import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BohrModel() {
  const [excited, setExcited] = useState(false)
  const [showLine, setShowLine] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const electronAngle = useRef(0)
  const animRef = useRef(0)

  const handleExcite = () => {
    if (!excited) {
      setExcited(true)
      setShowLine(false)
      setTimeout(() => setShowLine(true), 800)
    } else {
      setExcited(false)
      setShowLine(true)
    }
  }

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

      const cx = w / 2, cy = h / 2 + 10
      const maxR = Math.min(w, h) * 0.35

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

      // Energy levels (orbits)
      const orbits = [1, 2, 3, 4]
      const radii = orbits.map(n => (n / 4) * maxR + 20)

      orbits.forEach((n, idx) => {
        const r = radii[idx]
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = '#ffffff20'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Label
        ctx.fillStyle = '#94a3b8'
        ctx.font = '10px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(`n=${n}`, cx + r + 6, cy + 3)
      })

      // Nucleus
      const nucGrad = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, 16)
      nucGrad.addColorStop(0, '#ff6b6b')
      nucGrad.addColorStop(1, '#cc3333')
      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fillStyle = nucGrad
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('p⁺', cx, cy + 3)

      // Electron
      electronAngle.current += excited ? 0.03 : 0.015
      const electronR = excited ? radii[2] : radii[0]
      const ex = cx + Math.cos(electronAngle.current) * electronR
      const ey = cy + Math.sin(electronAngle.current) * electronR

      const elGrad = ctx.createRadialGradient(ex - 2, ey - 2, 0, ex, ey, 6)
      elGrad.addColorStop(0, '#6c63ff')
      elGrad.addColorStop(1, '#6c63ff00')
      ctx.beginPath()
      ctx.arc(ex, ey, 5, 0, Math.PI * 2)
      ctx.fillStyle = elGrad
      ctx.fill()
      // Glow
      ctx.shadowColor = '#6c63ff'
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(ex, ey, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#6c63ff'
      ctx.fill()
      ctx.shadowBlur = 0

      // Energy level labels
      ctx.fillStyle = '#ffffff60'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(excited ? 'Excited State' : 'Ground State', cx, 18)
      ctx.fillText(excited ? 'n=3' : 'n=1', cx, h - 10)

      // Spectral line
      if (showLine && excited) {
        const lineY = h - 40
        ctx.strokeStyle = '#ffd93d'
        ctx.lineWidth = 2
        ctx.shadowColor = '#ffd93d80'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(cx - 60, lineY)
        ctx.lineTo(cx + 60, lineY)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#ffd93d'
        ctx.font = '9px monospace'
        ctx.fillText('Spectral line emitted (656 nm)', cx, lineY - 6)
      }

      // Energy diagram (right side)
      const edX = w - 70
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(edX - 25, 20, 50, h - 50)
      const levels = [1, 2, 3, 4]
      levels.forEach((n) => {
        const y = 30 + (h - 70) * (1 - n / 5)
        ctx.fillStyle = n === (excited ? 3 : 1) ? '#6c63ff40' : '#ffffff15'
        ctx.fillRect(edX - 20, y, 40, 18)
        ctx.fillStyle = n === (excited ? 3 : 1) ? '#6c63ff' : '#94a3b8'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`n=${n}`, edX, y + 13)
      })

      // Transition arrow
      if (excited) {
        ctx.strokeStyle = '#ffd93d'
        ctx.lineWidth = 2
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(edX + 25, 30 + (h - 70) * (1 - 1 / 5))
        ctx.lineTo(edX + 25, 30 + (h - 70) * (1 - 3 / 5))
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#ffd93d'
        ctx.font = '8px monospace'
        ctx.fillText('E = hν', edX + 42, (30 + (h - 70) * (1 - 1 / 5) + 30 + (h - 70) * (1 - 3 / 5)) / 2 + 3)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [excited, showLine])

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Bohr Model of Hydrogen Atom</h3>
        <div className="flex gap-3">
          <Button size="sm" onClick={handleExcite}>
            {excited ? 'De-excite Electron' : 'Excite Electron'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setExcited(false); setShowLine(false) }}>
            Reset
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 340 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="text-xs text-text-muted space-y-1">
          <p>• Click "Excite Electron" to move the electron from n=1 (ground state) to n=3 (excited state)</p>
          {showLine && <p>• When the electron falls back, it emits a photon (spectral line at 656 nm)</p>}
        </div>
      </CardContent>
    </Card>
  )
}
