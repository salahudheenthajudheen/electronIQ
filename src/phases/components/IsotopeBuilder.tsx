import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const ELEMENT_DATA: Record<number, { sym: string; name: string }> = {
  1: { sym: 'H', name: 'Hydrogen' }, 2: { sym: 'He', name: 'Helium' },
  6: { sym: 'C', name: 'Carbon' }, 7: { sym: 'N', name: 'Nitrogen' },
  8: { sym: 'O', name: 'Oxygen' }, 17: { sym: 'Cl', name: 'Chlorine' },
  18: { sym: 'Ar', name: 'Argon' }, 19: { sym: 'K', name: 'Potassium' },
  20: { sym: 'Ca', name: 'Calcium' }, 26: { sym: 'Fe', name: 'Iron' },
  29: { sym: 'Cu', name: 'Copper' }, 30: { sym: 'Zn', name: 'Zinc' },
  35: { sym: 'Br', name: 'Bromine' }, 47: { sym: 'Ag', name: 'Silver' },
  53: { sym: 'I', name: 'Iodine' }, 79: { sym: 'Au', name: 'Gold' },
  82: { sym: 'Pb', name: 'Lead' }, 92: { sym: 'U', name: 'Uranium' },
}

type Particle = { type: 'p' | 'n'; angle: number; dist: number }

export default function IsotopeBuilder() {
  const [protons, setProtons] = useState(6)
  const [neutrons, setNeutrons] = useState(6)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)

  const element = ELEMENT_DATA[protons]
  const massNum = protons + neutrons

  // Find isobars: elements with same mass number
  const possibleIsobars = Object.entries(ELEMENT_DATA)
    .filter(([z]) => parseInt(z) !== protons)
    .map(([z, el]) => ({ z: parseInt(z), ...el }))
    .filter(el => el.z + (neutrons - protons + (el.z - protons)) === massNum)

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

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2 + 10
      const nucRadius = Math.min(20 + Math.min(protons + neutrons, 40) * 0.4, 50)

      // Grid
      ctx.strokeStyle = '#ffffff05'
      ctx.lineWidth = 1
      for (let i = 0; i < w; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke() }
      for (let i = 0; i < h; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke() }

      // Nucleus background
      const nucGrad = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, nucRadius)
      nucGrad.addColorStop(0, '#1e293b')
      nucGrad.addColorStop(0.7, '#0f172a')
      nucGrad.addColorStop(1, '#1e293b')
      ctx.beginPath()
      ctx.arc(cx, cy, nucRadius, 0, Math.PI * 2)
      ctx.fillStyle = nucGrad
      ctx.fill()
      ctx.strokeStyle = '#ffffff20'
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw nucleons
      const t = Date.now() / 2000
      const particles: Particle[] = []
      for (let i = 0; i < protons; i++) {
        particles.push({
          type: 'p',
          angle: (i / protons) * Math.PI * 2 + t * 0.5,
          dist: 5 + (i % Math.max(Math.floor(nucRadius / 6), 1)) * 6,
        })
      }
      for (let i = 0; i < neutrons; i++) {
        particles.push({
          type: 'n',
          angle: (i / neutrons) * Math.PI * 2 + t * 0.3 + 1,
          dist: 5 + (i % Math.max(Math.floor(nucRadius / 6), 1)) * 6,
        })
      }

      particles.forEach(p => {
        const px = cx + Math.cos(p.angle) * Math.min(p.dist, nucRadius - 4)
        const py = cy + Math.sin(p.angle) * Math.min(p.dist, nucRadius - 4)
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = p.type === 'p' ? '#ff6b6b' : '#6c63ff'
        ctx.fill()
        ctx.fillStyle = '#ffffff80'
        ctx.font = '5px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.type, px, py + 0.5)
      })

      // Electron shells (simplified)
      const shells = [2, 8, 8, 2]
      let remaining = protons
      const shellRadii = [28, 50, 74, 98]
      shells.forEach((cap, i) => {
        const fill = Math.min(remaining, cap)
        remaining -= fill
        const r = shellRadii[i] + nucRadius

        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = '#ffffff10'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])

        // Electrons
        for (let e = 0; e < fill; e++) {
          const angle = (e / fill) * Math.PI * 2 + t * 0.4 * (i + 1)
          const ex = cx + Math.cos(angle) * r
          const ey = cy + Math.sin(angle) * r
          ctx.beginPath()
          ctx.arc(ex, ey, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#00d4aa'
          ctx.fill()
        }
      })

      // Information overlay
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(8, 8, 170, 58)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`Element: ${element?.sym || '?'} (Z=${protons})`, 14, 24)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px monospace'
      ctx.fillText(`Protons: ${protons}  |  Neutrons: ${neutrons}`, 14, 40)
      ctx.fillText(`Mass Number: ${massNum}`, 14, 55)

      // Classification
      const nDiff = neutrons - protons
      let classification = 'Stable'
      let col = '#00d4aa'
      if (nDiff > 4 || nDiff < -2) { classification = 'Radioactive'; col = '#ff6b6b' }
      else if (nDiff > 2) { classification = 'Unstable'; col = '#f59e0b' }

      ctx.fillStyle = col
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(classification, w - 14, 24)

      if (protons > 0) {
        const isoLabel = `${element?.sym}-${massNum}`
        ctx.fillStyle = '#ffffff50'
        ctx.font = '10px monospace'
        ctx.textAlign = 'right'
        ctx.fillText(isoLabel, w - 14, 40)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [protons, neutrons, element, massNum])

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Isotope & Isobar Builder</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Protons (Z)</span>
              <span className="text-red-400 font-bold">{protons}</span>
            </div>
            <input type="range" min={1} max={92} value={protons}
              onChange={e => setProtons(parseInt(e.target.value))}
              className="w-full accent-red-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Neutrons (N)</span>
              <span className="text-primary font-bold">{neutrons}</span>
            </div>
            <input type="range" min={0} max={146} value={neutrons}
              onChange={e => setNeutrons(parseInt(e.target.value))}
              className="w-full accent-primary" />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 340 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Element</span>
            <p className="text-text-primary font-bold">{element?.name || 'Unknown'} ({element?.sym || '?'})</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2 text-center">
            <span className="text-text-muted">Isotope</span>
            <p className="text-primary font-bold">{element?.sym || '?'}-{massNum}</p>
          </div>
          <div className="rounded-lg bg-warning/5 p-2 text-center">
            <span className="text-text-muted">Mass Number</span>
            <p className="text-warning font-bold">{massNum}</p>
          </div>
        </div>

        {possibleIsobars.length > 0 && (
          <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
            <p className="text-xs font-semibold text-accent mb-1">⚠ Isobars Found!</p>
            <p className="text-xs text-text-secondary">
              Atoms with same mass number ({massNum}) but different elements:
              {possibleIsobars.map(ib => ` ${ib.sym} (Z=${ib.z})`).join(', ')}
            </p>
          </div>
        )}

        {neutrons === 0 && (
          <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2 text-xs text-red-400">
            ⚠ An atom must have at least some neutrons to be stable (except H-1)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
