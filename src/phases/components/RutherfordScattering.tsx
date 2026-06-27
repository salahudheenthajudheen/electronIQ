import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Particle {
  x: number; y: number; vx: number; vy: number;
  deflected: boolean; bounced: boolean; alpha: number;
}

export default function RutherfordScattering() {
  const [speed, setSpeed] = useState<'low' | 'medium' | 'high'>('medium')
  const [thickness, setThickness] = useState<'thin' | 'thick'>('thin')
  const [stats, setStats] = useState({ straight: 0, deflected: 0, bounced: 0, total: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number>(0)
  const firingRef = useRef(false)

  const speedMap = { low: 1.5, medium: 3, high: 5 }
  const speedVal = speedMap[speed]

  const createParticle = useCallback((_w: number, h: number): Particle => ({
    x: 20, y: 80 + Math.random() * (h - 160),
    vx: speedVal * (0.9 + Math.random() * 0.2),
    vy: 0,
    deflected: false, bounced: false, alpha: 1,
  }), [speedVal])

  const fireBurst = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.getBoundingClientRect().width
    const h = canvas.getBoundingClientRect().height
    firingRef.current = true
    const newParticles: Particle[] = []
    for (let i = 0; i < 30; i++) {
      newParticles.push(createParticle(w, h))
    }
    particlesRef.current = [...particlesRef.current, ...newParticles]
    setTimeout(() => { firingRef.current = false }, 500)
  }, [createParticle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let straight = 0, deflected = 0, bounced = 0

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width, h = rect.height
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      // Gold foil
      const foilX = w * 0.6, foilW = thickness === 'thin' ? 6 : 14
      ctx.fillStyle = '#f0c040'
      ctx.shadowColor = '#f0c04040'
      ctx.shadowBlur = 10
      ctx.fillRect(foilX - foilW / 2, 0, foilW, h)
      ctx.shadowBlur = 0
      ctx.fillStyle = '#ffffff15'
      ctx.fillRect(foilX - foilW / 2 - 2, 0, 2, h)
      ctx.fillRect(foilX + foilW / 2, 0, 2, h)

      // Label
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Gold Foil', foilX, 18)

      // Particles
      straight = 0; deflected = 0; bounced = 0
      const particles = particlesRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // Check collision with foil
        if (Math.abs(p.x - foilX) < foilW / 2 + 4 && p.y > 20 && p.y < h - 20) {
          const rand = Math.random()
          if (rand < (thickness === 'thick' ? 0.06 : 0.02)) {
            // Strong deflection / bounce
            p.vx = -p.vx * (0.4 + Math.random() * 0.6)
            p.vy += (Math.random() - 0.5) * 2
            p.bounced = true
          } else if (rand < (thickness === 'thick' ? 0.12 : 0.06)) {
            // Slight deflection
            p.vy += (Math.random() - 0.5) * 1.5
            p.deflected = true
          }
        }

        // Count
        if (p.bounced) bounced++
        else if (p.deflected) deflected++
        else straight++

        // Draw
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 4)
        if (p.bounced) {
          gradient.addColorStop(0, '#ff6b6b')
          gradient.addColorStop(1, '#ff6b6b00')
        } else if (p.deflected) {
          gradient.addColorStop(0, '#ffd93d')
          gradient.addColorStop(1, '#ffd93d00')
        } else {
          gradient.addColorStop(0, '#6c63ff')
          gradient.addColorStop(1, '#6c63ff00')
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2)
        ctx.strokeStyle = p.bounced ? '#ff6b6b40' : p.deflected ? '#ffd93d40' : '#6c63ff40'
        ctx.lineWidth = 1
        ctx.stroke()

        // Remove off-screen particles
        if (p.x > w + 20 || p.x < -20 || p.y > h + 20 || p.y < -20) {
          particles.splice(i, 1)
        }
      }

      setStats({ straight, deflected, bounced, total: straight + deflected + bounced })

      // Legend
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(10, h - 60, 130, 50)
      ctx.font = '11px monospace'
      ctx.fillStyle = '#6c63ff'
      ctx.fillText(`● Straight: ${straight}`, 18, h - 42)
      ctx.fillStyle = '#ffd93d'
      ctx.fillText(`● Deflected: ${deflected}`, 18, h - 28)
      ctx.fillStyle = '#ff6b6b'
      ctx.fillText(`● Bounced: ${bounced}`, 18, h - 14)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [speed, thickness])

  const total = stats.straight + stats.deflected + stats.bounced
  const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) : '0.0'

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Rutherford α-Particle Scattering</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Speed:</span>
            {(['low', 'medium', 'high'] as const).map(s => (
              <Button key={s} size="sm" variant={speed === s ? 'default' : 'outline'}
                onClick={() => setSpeed(s)}>{s}</Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Foil:</span>
            {(['thin', 'thick'] as const).map(t => (
              <Button key={t} size="sm" variant={thickness === t ? 'default' : 'outline'}
                onClick={() => setThickness(t)}>{t}</Button>
            ))}
          </div>
          <Button size="sm" onClick={fireBurst} disabled={firingRef.current}>
            Fire α-particles
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 320 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-lg bg-primary/5 p-2">
            <span className="text-primary font-bold">{pct(stats.straight)}%</span>
            <p className="text-text-muted mt-0.5">Passed Straight</p>
          </div>
          <div className="rounded-lg bg-warning/5 p-2">
            <span className="text-warning font-bold">{pct(stats.deflected)}%</span>
            <p className="text-text-muted mt-0.5">Slightly Deflected</p>
          </div>
          <div className="rounded-lg bg-red-500/5 p-2">
            <span className="text-red-400 font-bold">{pct(stats.bounced)}%</span>
            <p className="text-text-muted mt-0.5">Strongly Deflected</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
