import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type OrbitalType = '1s' | '2s' | '2px' | '2py' | '2pz' | '3s'

const ORBITAL_INFO: Record<OrbitalType, { n: number; l: number; label: string; shape: string }> = {
  '1s': { n: 1, l: 0, label: '1s (n=1, l=0)', shape: 'Spherical' },
  '2s': { n: 2, l: 0, label: '2s (n=2, l=0)', shape: 'Spherical with node' },
  '2px': { n: 2, l: 1, label: '2px (n=2, l=1, m=-1)', shape: 'Dumbbell (x-axis)' },
  '2py': { n: 2, l: 1, label: '2py (n=2, l=1, m=0)', shape: 'Dumbbell (y-axis)' },
  '2pz': { n: 2, l: 1, label: '2pz (n=2, l=1, m=+1)', shape: 'Dumbbell (z-axis)' },
  '3s': { n: 3, l: 0, label: '3s (n=3, l=0)', shape: 'Spherical with 2 nodes' },
}

export default function OrbitalExplorer() {
  const [orbital, setOrbital] = useState<OrbitalType>('1s')
  const [showProb, setShowProb] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const rotRef = useRef(0)

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

      rotRef.current += 0.005
      const rot = rotRef.current

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2

      // Draw orbital based on type
      const info = ORBITAL_INFO[orbital]
      const isS = orbital.endsWith('s')
      const isP = orbital.startsWith('2p')

      if (isS) {
        // s orbital — spherical
        const r = orbital === '1s' ? 50 : orbital === '2s' ? 80 : 110
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0, showProb ? '#6c63ff80' : '#6c63ff40')
        grad.addColorStop(0.5, showProb ? '#6c63ff40' : '#6c63ff20')
        grad.addColorStop(1, '#6c63ff00')
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Outline
        ctx.strokeStyle = '#6c63ff60'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Node circles for 2s, 3s
        if (orbital === '2s') {
          ctx.beginPath()
          ctx.arc(cx, cy, 25, 0, Math.PI * 2)
          ctx.strokeStyle = '#ffffff30'
          ctx.lineWidth = 1
          ctx.setLineDash([2, 2])
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = '#94a3b8'
          ctx.font = '9px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('Node', cx, cy - 30)
        }
        if (orbital === '3s') {
          ;[25, 60].forEach(rn => {
            ctx.beginPath()
            ctx.arc(cx, cy, rn, 0, Math.PI * 2)
            ctx.strokeStyle = '#ffffff30'
            ctx.lineWidth = 1
            ctx.setLineDash([2, 2])
            ctx.stroke()
            ctx.setLineDash([])
          })
        }

        // Probability dots
        if (showProb) {
          for (let i = 0; i < 800; i++) {
            const angle = Math.random() * Math.PI * 2
            const dist = Math.random() * r
            const px = cx + Math.cos(angle) * dist
            const py = cy + Math.sin(angle) * dist
            const density = 1 - dist / r
            if (Math.random() < density * 0.5) {
              ctx.fillStyle = `rgba(108, 99, 255, ${density * 0.5})`
              ctx.fillRect(px, py, 1.5, 1.5)
            }
          }
        }
      }

      if (isP) {
        // p orbital — dumbbell
        const len = 90
        const width = 35

        const drawLobe = (angle: number, sign: number) => {
          const cos = Math.cos(angle + rot * 0.5)
          const sin = Math.sin(angle + rot * 0.5)
          const lx = cx + cos * len * 0.6
          const ly = cy + sin * len * 0.6

          ctx.save()
          ctx.translate(lx, ly)
          ctx.rotate(angle)

          // Lobe
          ctx.beginPath()
          ctx.ellipse(0, 0, len * 0.5, width, 0, 0, Math.PI * 2)
          const col = sign > 0 ? 'rgba(108, 99, 255' : 'rgba(255, 107, 157'
          ctx.fillStyle = col + (showProb ? '40' : '25') + ')'
          ctx.fill()
          ctx.strokeStyle = col + '60)'
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Sign label
          ctx.fillStyle = col + '80)'
          ctx.font = 'bold 14px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(sign > 0 ? '+' : '−', 0, 0)

          ctx.restore()
        }

        // Draw lobes along appropriate axis
        const axes: { angle: number; sign: number }[] = []
        if (orbital === '2px') {
          axes.push({ angle: 0, sign: 1 }, { angle: Math.PI, sign: -1 })
        } else if (orbital === '2py') {
          axes.push({ angle: Math.PI / 2, sign: 1 }, { angle: -Math.PI / 2, sign: -1 })
        } else {
          // 2pz - show as vertical
          axes.push({ angle: -Math.PI / 2, sign: 1 }, { angle: Math.PI / 2, sign: -1 })
        }

        // Probability dots around lobes
        if (showProb) {
          axes.forEach(({ angle }) => {
            const cos = Math.cos(angle)
            const sin = Math.sin(angle)
            const lx = cx + cos * len * 0.6
            const ly = cy + sin * len * 0.6
            for (let i = 0; i < 300; i++) {
              const dist = (0.3 + Math.random() * 0.7) * len * 0.5
              const spread = (Math.random() - 0.5) * width * 1.2
              const px = lx + cos * dist + (-sin) * spread
              const py = ly + sin * dist + cos * spread
              const density = 1 - Math.abs(dist) / (len * 0.5)
              if (Math.random() < density * 0.4) {
                ctx.fillStyle = `rgba(108, 99, 255, ${density * 0.4})`
                ctx.fillRect(px, py, 1.5, 1.5)
              }
            }
          })
        }

        axes.forEach(a => drawLobe(a.angle, a.sign))

        // Nucleus
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff40'
        ctx.fill()
      }

      // Labels
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(info.label, cx, 18)

      ctx.fillStyle = '#ffffff60'
      ctx.font = '10px monospace'
      ctx.fillText(`Shape: ${info.shape}`, cx, h - 12)

      // Quantum numbers table
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(10, 30, 90, 50)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`n = ${info.n}`, 16, 46)
      ctx.fillText(`l = ${info.l}`, 16, 60)
      ctx.fillText(`Orbital: ${isS ? 's' : 'p'}`, 16, 74)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [orbital, showProb])

  const orbitals: OrbitalType[] = ['1s', '2s', '3s', '2px', '2py', '2pz']

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Virtual Orbital Explorer</h3>
        <div className="flex flex-wrap gap-2">
          {orbitals.map(o => (
            <Button key={o} size="sm" variant={orbital === o ? 'default' : 'outline'}
              onClick={() => setOrbital(o)}>
              {o}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-text-muted">
          <input type="checkbox" checked={showProb} onChange={e => setShowProb(e.target.checked)}
            className="accent-primary" />
          Show probability density
        </label>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 320 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
