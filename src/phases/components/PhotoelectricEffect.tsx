import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const H = 6.626e-34
const C = 3e8
const EV_CONVERT = 1.602e-19

const METALS = [
  { name: 'Sodium', workFunction: 2.28, color: '#ffd93d' },
  { name: 'Potassium', workFunction: 2.30, color: '#6c63ff' },
  { name: 'Calcium', workFunction: 2.87, color: '#00d4aa' },
  { name: 'Copper', workFunction: 4.70, color: '#ff6b6b' },
  { name: 'Silver', workFunction: 4.73, color: '#94a3b8' },
  { name: 'Platinum', workFunction: 6.35, color: '#f59e0b' },
]

export default function PhotoelectricEffect() {
  const [metalIdx, setMetalIdx] = useState(0)
  const [frequency, setFrequency] = useState(500)
  const [intensity, setIntensity] = useState(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const electronsRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([])

  const metal = METALS[metalIdx]
  const freqHz = frequency * 1e12
  const photonEnergy = H * freqHz
  const photonEnergyEV = photonEnergy / EV_CONVERT
  const thresholdFreq = (metal.workFunction * EV_CONVERT) / H
  const thresholdFreqTHz = thresholdFreq / 1e12
  const canEject = photonEnergyEV >= metal.workFunction
  const keMax = canEject ? photonEnergyEV - metal.workFunction : 0
  const wavelength = C / freqHz

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

      // Metal surface
      const surfaceY = h * 0.55
      const grad = ctx.createLinearGradient(0, surfaceY, 0, h)
      grad.addColorStop(0, metal.color + '60')
      grad.addColorStop(0.1, metal.color + '30')
      grad.addColorStop(1, '#0a0e1a')
      ctx.fillStyle = grad
      ctx.fillRect(0, surfaceY, w, h - surfaceY)
      ctx.strokeStyle = metal.color + '80'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, surfaceY)
      ctx.lineTo(w, surfaceY)
      ctx.stroke()

      ctx.fillStyle = '#ffffff40'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(metal.name, w / 2, surfaceY - 6)

      // Light waves (photons) coming from left
      const numWaves = Math.floor(intensity / 10) + 2
      const t = Date.now() / 1500

      for (let i = 0; i < numWaves; i++) {
        const phase = t + i * (w / numWaves) * 0.02
        const x = ((phase * 50) % (w * 0.45))

        // Wave
        ctx.beginPath()
        const waveAmp = 12 + intensity * 0.15
        for (let dx = 0; dx < 30; dx++) {
          const wx = x + dx
          const wy = surfaceY - 20 + Math.sin(dx * 0.5 + t * 3) * waveAmp * 0.3
          if (dx === 0) ctx.moveTo(wx, wy)
          else ctx.lineTo(wx, wy)
        }
        ctx.strokeStyle = `rgba(255, 217, 61, ${0.2 + intensity * 0.005})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Photon particle
        if (i % 2 === 0) {
          ctx.beginPath()
          ctx.arc(x + 15, surfaceY - 20, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 217, 61, ${0.3 + intensity * 0.005})`
          ctx.fill()
        }
      }

      // Emitted electrons
      if (canEject) {
        const ejectRate = canEject ? intensity * 0.03 * keMax : 0
        if (Math.random() < ejectRate * 0.02) {
          electronsRef.current.push({
            x: w * 0.45 + Math.random() * 30,
            y: surfaceY,
            vx: 0.5 + Math.random() * keMax * 2,
            vy: -(0.5 + Math.random() * keMax * 2),
            life: 1,
          })
        }
      }

      electronsRef.current = electronsRef.current.filter(e => {
        e.x += e.vx * 0.8
        e.y += e.vy * 0.8
        e.vy += 0.02
        e.life -= 0.004

        if (e.life > 0) {
          ctx.beginPath()
          ctx.arc(e.x, e.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 212, 170, ${e.life})`
          ctx.fill()
          ctx.shadowColor = '#00d4aa'
          ctx.shadowBlur = 6 * e.life
          ctx.beginPath()
          ctx.arc(e.x, e.y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${e.life})`
          ctx.fill()
          ctx.shadowBlur = 0
          return true
        }
        return false
      })

      // Info overlay
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(8, 8, 175, 52)
      ctx.fillStyle = canEject ? '#00d4aa' : '#ff6b6b'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(canEject ? '● Electrons ejected!' : '● No ejection', 14, 24)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px monospace'
      ctx.fillText(`f = ${frequency.toFixed(0)} THz`, 14, 38)
      ctx.fillText(`λ = ${(wavelength * 1e9).toFixed(0)} nm`, 14, 52)

      // Energy display
      ctx.fillStyle = '#1e293b80'
      ctx.fillRect(w - 155, 8, 147, canEject ? 68 : 38)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`E = ${photonEnergyEV.toFixed(2)} eV`, w - 12, 22)
      ctx.fillText(`φ = ${metal.workFunction.toFixed(2)} eV`, w - 12, 36)
      ctx.fillText(`f₀ = ${thresholdFreqTHz.toFixed(0)} THz`, w - 12, 50)
      if (canEject) {
        ctx.fillStyle = '#00d4aa'
        ctx.font = 'bold 9px monospace'
        ctx.fillText(`KEₘₐₓ = ${keMax.toFixed(2)} eV`, w - 12, 64)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [metalIdx, frequency, intensity, canEject, keMax, metal, freqHz, photonEnergyEV, thresholdFreqTHz, wavelength])

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Photoelectric Effect Simulator</h3>
        <p className="text-xs text-text-muted">E = hν — Adjust frequency, intensity, and metal to observe the photoelectric effect</p>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Metal:</span>
            <select value={metalIdx} onChange={e => setMetalIdx(parseInt(e.target.value))}
              className="bg-surface/50 border border-surface rounded-lg px-2 py-1 text-sm text-text-primary">
              {METALS.map((m, i) => (
                <option key={i} value={i}>{m.name} (φ = {m.workFunction} eV)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Frequency (THz)</span>
              <span className="text-warning">{frequency.toFixed(0)}</span>
            </div>
            <input type="range" min={100} max={1500} value={frequency}
              onChange={e => setFrequency(parseInt(e.target.value))}
              className="w-full accent-warning" />
            <div className="flex justify-between text-xs text-text-muted">
              <span>f₀ = {thresholdFreqTHz.toFixed(0)} THz</span>
              <span>Threshold</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Intensity</span>
              <span className="text-warning">{intensity}%</span>
            </div>
            <input type="range" min={5} max={100} value={intensity}
              onChange={e => setIntensity(parseInt(e.target.value))}
              className="w-full accent-warning" />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-surface" style={{ height: 300 }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`rounded-lg p-2 text-center ${canEject ? 'bg-accent/10' : 'bg-red-500/10'}`}>
            <span className="text-text-muted">Photon Energy</span>
            <p className={`font-bold ${canEject ? 'text-accent' : 'text-red-400'}`}>{photonEnergyEV.toFixed(2)} eV</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Work Function</span>
            <p className="text-text-primary font-bold">{metal.workFunction.toFixed(2)} eV</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-2 text-center">
            <span className="text-text-muted">Threshold f₀</span>
            <p className="text-text-primary font-bold">{thresholdFreqTHz.toFixed(0)} THz</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${canEject ? 'bg-accent/10' : 'bg-surface/30'}`}>
            <span className="text-text-muted">KE<sub>max</sub></span>
            <p className={`font-bold ${canEject ? 'text-accent' : 'text-text-muted'}`}>
              {canEject ? `${keMax.toFixed(3)} eV` : '0 eV'}
            </p>
          </div>
        </div>

        {!canEject && frequency > thresholdFreqTHz * 0.5 && (
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-2 text-xs text-warning">
            ⚠ Frequency must exceed threshold ({thresholdFreqTHz.toFixed(0)} THz) to eject electrons. Current: {frequency.toFixed(0)} THz
          </div>
        )}
      </CardContent>
    </Card>
  )
}
