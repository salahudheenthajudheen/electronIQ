import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ShapeType = 's' | 'px' | 'py' | 'pz' | 'dxy' | 'dxz' | 'dyz' | 'dx2y2' | 'dz2'

const SHAPE_INFO: Record<ShapeType, { label: string; shape: string; orientations: number }> = {
  's': { label: 's orbital (l=0)', shape: 'Spherical', orientations: 1 },
  'px': { label: 'px orbital (l=1, m=-1)', shape: 'Dumbbell along x-axis', orientations: 3 },
  'py': { label: 'py orbital (l=1, m=0)', shape: 'Dumbbell along y-axis', orientations: 3 },
  'pz': { label: 'pz orbital (l=1, m=+1)', shape: 'Dumbbell along z-axis', orientations: 3 },
  'dxy': { label: 'dxy (l=2, m=-2)', shape: 'Cloverleaf in xy-plane', orientations: 5 },
  'dxz': { label: 'dxz (l=2, m=-1)', shape: 'Cloverleaf in xz-plane', orientations: 5 },
  'dyz': { label: 'dyz (l=2, m=0)', shape: 'Cloverleaf in yz-plane', orientations: 5 },
  'dx2y2': { label: 'dx²-y² (l=2, m=+2)', shape: 'Cloverleaf on axes', orientations: 5 },
  'dz2': { label: 'dz² (l=2, m=+1)', shape: 'Dumbbell with ring', orientations: 5 },
}

export default function OrbitalShapes() {
  const [shape, setShape] = useState<ShapeType>('s')
  const [rotate, setRotate] = useState(true)
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

      if (rotate) rotRef.current += 0.008
      const rot = rotRef.current

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2

      // Draw 3D-like axes
      const drawAxes = () => {
        ctx.strokeStyle = '#ffffff15'
        ctx.lineWidth = 1
        const aLen = 80
        ;[
          [cx - aLen, cy, cx + aLen, cy],
          [cx, cy - aLen, cx, cy + aLen],
        ].forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        })
        ctx.fillStyle = '#ffffff30'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('x', cx + aLen + 8, cy + 3)
        ctx.fillText('y', cx, cy - aLen - 8)
      }

      drawAxes()

      const info = SHAPE_INFO[shape]
      const isS = shape === 's'
      const isP = ['px', 'py', 'pz'].includes(shape)
      const isD = ['dxy', 'dxz', 'dyz', 'dx2y2', 'dz2'].includes(shape)

      if (isS) {
        // 3D sphere effect with gradient
        const r = 60
        const grad = ctx.createRadialGradient(cx - 15, cy - 15, 0, cx, cy, r)
        grad.addColorStop(0, '#6c63ff60')
        grad.addColorStop(0.6, '#6c63ff30')
        grad.addColorStop(1, '#6c63ff00')
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.strokeStyle = '#6c63ff80'
        ctx.lineWidth = 2
        ctx.stroke()

        // Highlight
        const hGrad = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx - 20, cy - 20, 25)
        hGrad.addColorStop(0, '#ffffff30')
        hGrad.addColorStop(1, '#ffffff00')
        ctx.beginPath()
        ctx.arc(cx - 20, cy - 20, 25, 0, Math.PI * 2)
        ctx.fillStyle = hGrad
        ctx.fill()
      }

      if (isP) {
        // 3D dumbbell
        const angles: { angle: number; sign: number; col: string }[] = []
        const baseCol = '#6c63ff'
        const negCol = '#ff6b9d'

        if (shape === 'px') {
          angles.push({ angle: rot, sign: 1, col: baseCol })
          angles.push({ angle: rot + Math.PI, sign: -1, col: negCol })
        } else if (shape === 'py') {
          angles.push({ angle: Math.PI / 2 + rot, sign: 1, col: baseCol })
          angles.push({ angle: -Math.PI / 2 + rot, sign: -1, col: negCol })
        } else {
          angles.push({ angle: -Math.PI / 2, sign: 1, col: baseCol })
          angles.push({ angle: Math.PI / 2, sign: -1, col: negCol })
        }

        angles.forEach(({ angle, sign, col }) => {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(angle)

          // Lobe
          ctx.beginPath()
          ctx.ellipse(50, 0, 45, 25, 0, 0, Math.PI * 2)
          ctx.fillStyle = col + '30'
          ctx.fill()
          ctx.strokeStyle = col + '80'
          ctx.lineWidth = 2
          ctx.stroke()

          // Sign
          ctx.fillStyle = col
          ctx.font = 'bold 16px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(sign > 0 ? '+' : '−', 50, 0)

          ctx.restore()
        })
      }

      if (isD) {
        // d orbital — cloverleaf
        const col = '#f59e0b'
        const negCol = '#00d4aa'
        const rotOffset = shape === 'dxy' ? Math.PI / 4 : shape === 'dx2y2' ? 0 : shape === 'dxz' ? 0 : shape === 'dyz' ? Math.PI / 4 : 0

        if (shape === 'dz2') {
          // Special: dumbbell with ring
          ctx.save()
          ctx.translate(cx, cy)
          // Vertical lobes
          ;[1, -1].forEach(sign => {
            ctx.beginPath()
            ctx.ellipse(0, sign * 55, 25, 40, 0, 0, Math.PI * 2)
            ctx.fillStyle = col + '30'
            ctx.fill()
            ctx.strokeStyle = col + '80'
            ctx.lineWidth = 2
            ctx.stroke()
          })
          // Ring
          ctx.beginPath()
          ctx.ellipse(0, 0, 35, 20, 0, 0, Math.PI * 2)
          ctx.strokeStyle = negCol + '60'
          ctx.lineWidth = 2
          ctx.setLineDash([3, 3])
          ctx.stroke()
          ctx.setLineDash([])
          ctx.restore()
        } else {
          // Four-lobed cloverleaf
          const baseAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2]
          const offset = rotOffset + rot * 0.3
          baseAngles.forEach((baseAngle, i) => {
            const angle = baseAngle + offset
            ctx.save()
            ctx.translate(cx, cy)
            ctx.rotate(angle)

            ctx.beginPath()
            ctx.ellipse(45, 0, 40, 20, 0, 0, Math.PI * 2)
            ctx.fillStyle = (i % 2 === 0 ? col : negCol) + '30'
            ctx.fill()
            ctx.strokeStyle = (i % 2 === 0 ? col : negCol) + '80'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.fillStyle = i % 2 === 0 ? col : negCol
            ctx.font = 'bold 12px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(i % 2 === 0 ? '+' : '−', 45, 0)

            ctx.restore()
          })
        }
      }

      // Info overlay
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(info.label, cx, 18)

      ctx.fillStyle = '#ffffff50'
      ctx.font = '10px monospace'
      ctx.fillText(`Shape: ${info.shape}  |  Orientations: ${info.orientations}`, cx, h - 10)

      // Axis labels for d orbitals
      if (isD && shape !== 'dz2') {
        ctx.fillStyle = '#ffffff20'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(shape.toUpperCase(), cx, 30)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [shape, rotate])

  const shapeGroups: { label: string; keys: ShapeType[] }[] = [
    { label: 's', keys: ['s'] },
    { label: 'p', keys: ['px', 'py', 'pz'] },
    { label: 'd', keys: ['dxy', 'dxz', 'dyz', 'dx2y2', 'dz2'] },
  ]

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Orbital Shapes 3D Viewer</h3>
        <div className="flex flex-wrap gap-1">
          {shapeGroups.map(g => (
            <div key={g.label} className="flex items-center gap-1 mr-2">
              <span className="text-xs text-text-muted mr-1">{g.label}:</span>
              {g.keys.map(k => (
                <Button key={k} size="sm" variant={shape === k ? 'default' : 'outline'}
                  onClick={() => setShape(k)} className="text-xs px-2">
                  {k.replace(g.label, '') || g.label}
                </Button>
              ))}
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-text-muted">
          <input type="checkbox" checked={rotate} onChange={e => setRotate(e.target.checked)}
            className="accent-primary" />
          Auto-rotate
        </label>
        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 360 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
