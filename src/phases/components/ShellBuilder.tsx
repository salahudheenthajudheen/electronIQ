import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const ELEMENTS: { name: string; symbol: string; config: number[] }[] = [
  { name: 'Hydrogen', symbol: 'H', config: [1] },
  { name: 'Helium', symbol: 'He', config: [2] },
  { name: 'Lithium', symbol: 'Li', config: [2, 1] },
  { name: 'Carbon', symbol: 'C', config: [2, 4] },
  { name: 'Nitrogen', symbol: 'N', config: [2, 5] },
  { name: 'Neon', symbol: 'Ne', config: [2, 8] },
  { name: 'Sodium', symbol: 'Na', config: [2, 8, 1] },
  { name: 'Magnesium', symbol: 'Mg', config: [2, 8, 2] },
  { name: 'Aluminium', symbol: 'Al', config: [2, 8, 3] },
  { name: 'Silicon', symbol: 'Si', config: [2, 8, 4] },
  { name: 'Phosphorus', symbol: 'P', config: [2, 8, 5] },
  { name: 'Sulfur', symbol: 'S', config: [2, 8, 6] },
  { name: 'Chlorine', symbol: 'Cl', config: [2, 8, 7] },
  { name: 'Argon', symbol: 'Ar', config: [2, 8, 8] },
  { name: 'Potassium', symbol: 'K', config: [2, 8, 8, 1] },
  { name: 'Calcium', symbol: 'Ca', config: [2, 8, 8, 2] },
]

const SHELL_LABELS = ['K', 'L', 'M', 'N']
const SHELL_CAPS = [2, 8, 18, 32]
const SHELL_COLORS = ['#6c63ff', '#00d4aa', '#f59e0b', '#ff6b9d']

export default function ShellBuilder() {
  const [elementIdx, setElementIdx] = useState(2)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)

  const element = ELEMENTS[elementIdx]
  const config = element.config

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

      const cx = w / 2 - 40, cy = h / 2 + 5
      const maxR = Math.min(w, h) * 0.38

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      // Shells
      for (let i = 0; i < config.length; i++) {
        const r = ((i + 1) / 4) * maxR + 20
        const fill = config[i]
        const cap = SHELL_CAPS[i]
        const angleStep = (Math.PI * 2) / Math.max(fill, 1)
        const t = Date.now() / 2000

        // Shell circle
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = SHELL_COLORS[i] + '40'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Shell label
        ctx.fillStyle = '#94a3b8'
        ctx.font = '10px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(`${SHELL_LABELS[i]} (n=${i + 1}): ${fill}e⁻`, cx + r + 8, cy + 3)

        // Capacity bar
        const barW = 60
        ctx.fillStyle = '#ffffff10'
        ctx.fillRect(cx + r + 8, cy + 8, barW, 4)
        ctx.fillStyle = SHELL_COLORS[i]
        ctx.fillRect(cx + r + 8, cy + 8, barW * (fill / cap), 4)

        // Electrons on shell
        for (let e = 0; e < fill; e++) {
          const angle = angleStep * e + t * (0.5 - i * 0.1)
          const ex = cx + Math.cos(angle) * r
          const ey = cy + Math.sin(angle) * r

          ctx.beginPath()
          ctx.arc(ex, ey, 4, 0, Math.PI * 2)
          ctx.fillStyle = SHELL_COLORS[i]
          ctx.fill()
          ctx.shadowColor = SHELL_COLORS[i]
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(ex, ey, 2, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // Nucleus
      const nucGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 14)
      nucGrad.addColorStop(0, '#ff6b6b')
      nucGrad.addColorStop(1, '#991111')
      ctx.beginPath()
      ctx.arc(cx, cy, 12, 0, Math.PI * 2)
      ctx.fillStyle = nucGrad
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 8px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${element.symbol}`, cx, cy + 3)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [elementIdx])

  const totalElectrons = config.reduce((a, b) => a + b, 0)

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Virtual Shell Builder</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-muted">Element:</span>
          <select
            value={elementIdx}
            onChange={e => setElementIdx(parseInt(e.target.value))}
            className="bg-surface/50 border border-surface rounded-lg px-3 py-1.5 text-sm text-text-primary"
          >
            {ELEMENTS.map((el, i) => (
              <option key={i} value={i}>
                {el.symbol} - {el.name} ({el.config.join(', ')})
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 320 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Element</span>
            <p className="text-text-primary font-bold">{element.name} ({element.symbol})</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Total e⁻</span>
            <p className="text-text-primary font-bold">{totalElectrons}</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Shells filled</span>
            <p className="text-text-primary font-bold">{config.length}</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Formula</span>
            <p className="text-text-primary font-bold">2n²</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
