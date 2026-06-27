import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ConfigCase {
  element: string
  z: number
  expected: string
  actual: string
  reason: string
  dCount: number
  sCount: number
}

const CASES: ConfigCase[] = [
  {
    element: 'Chromium (Cr)',
    z: 24,
    expected: '[Ar] 3d⁴ 4s²',
    actual: '[Ar] 3d⁵ 4s¹',
    reason: 'Half-filled d⁵ subshell provides extra stability through exchange energy and symmetrical distribution.',
    dCount: 5,
    sCount: 1,
  },
  {
    element: 'Copper (Cu)',
    z: 29,
    expected: '[Ar] 3d⁹ 4s²',
    actual: '[Ar] 3d¹⁰ 4s¹',
    reason: 'Completely filled d¹⁰ subshell provides maximum stability through exchange energy and spherical symmetry.',
    dCount: 10,
    sCount: 1,
  },
  {
    element: 'Molybdenum (Mo)',
    z: 42,
    expected: '[Kr] 4d⁴ 5s²',
    actual: '[Kr] 4d⁵ 5s¹',
    reason: 'Similar to chromium — half-filled d⁵ subshell stability.',
    dCount: 5,
    sCount: 1,
  },
  {
    element: 'Silver (Ag)',
    z: 47,
    expected: '[Kr] 4d⁹ 5s²',
    actual: '[Kr] 4d¹⁰ 5s¹',
    reason: 'Similar to copper — completely filled d¹⁰ subshell stability.',
    dCount: 10,
    sCount: 1,
  },
]

export default function ConfigBuilder() {
  const [selected, setSelected] = useState(0)
  const [view, setView] = useState<'compare' | 'diagram'>('compare')
  const cs = CASES[selected]

  const renderOrbitalDiagram = (dCount: number, sCount: number, label: string, highlight?: string) => {
    const dBoxes = 5
    const sBoxes = 1
    const dSingles = Math.min(dCount, dBoxes)
    const dPairs = Math.max(0, dCount - dBoxes)
    const sSingles = Math.min(sCount, sBoxes)
    const sPairs = Math.max(0, sCount - sBoxes)

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted">{label}</p>
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-xs text-text-muted mr-2">4s</span>
            {Array.from({ length: sBoxes }, (_, i) => (
              <span key={i} className={`inline-flex w-8 h-8 rounded border items-center justify-center text-sm font-mono mx-0.5 ${
                highlight === 's' ? 'border-accent bg-accent/10' : 'border-surface bg-surface/20'
              }`}>
                {i < sSingles ? '↑' : i < sSingles + sPairs ? '↓' : ''}
              </span>
            ))}
          </div>
          <div>
            <span className="text-xs text-text-muted mr-2">3d</span>
            {Array.from({ length: dBoxes }, (_, i) => (
              <span key={i} className={`inline-flex w-8 h-8 rounded border items-center justify-center text-sm font-mono mx-0.5 ${
                highlight === 'd' ? 'border-accent bg-accent/10' : 'border-surface bg-surface/20'
              }`}>
                {i < dSingles ? '↑' : i < dSingles + dPairs ? '↓' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Electronic Configuration — Stability Exceptions</h3>
        <div className="flex flex-wrap gap-2">
          {CASES.map((c, i) => (
            <Button key={i} size="sm" variant={selected === i ? 'default' : 'outline'}
              onClick={() => setSelected(i)}>
              {c.element.split(' ')[0]}
            </Button>
          ))}
        </div>

        <div className="rounded-lg border border-surface p-4 space-y-3 bg-surface/10">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-text-primary">{cs.element} (Z={cs.z})</h4>
            <div className="flex gap-1">
              <Button size="sm" variant={view === 'compare' ? 'default' : 'outline'} onClick={() => setView('compare')}>
                Compare
              </Button>
              <Button size="sm" variant={view === 'diagram' ? 'default' : 'outline'} onClick={() => setView('diagram')}>
                Diagram
              </Button>
            </div>
          </div>

          {view === 'compare' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                <p className="text-xs text-red-400 font-semibold mb-2">Expected Configuration</p>
                <p className="text-lg font-mono text-red-300">{cs.expected}</p>
                <p className="text-xs text-text-muted mt-2">What Aufbau principle predicts</p>
              </div>
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                <p className="text-xs text-accent font-semibold mb-2">Actual Configuration</p>
                <p className="text-lg font-mono text-accent">{cs.actual}</p>
                <p className="text-xs text-text-muted mt-2">What is observed experimentally</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {renderOrbitalDiagram(
                CASES.find(c => c.element === cs.element && c.expected === cs.expected)?.dCount ?? 4,
                CASES.find(c => c.element === cs.element && c.expected === cs.expected)?.sCount ?? 2,
                'Expected (Aufbau)'
              )}
              {renderOrbitalDiagram(cs.dCount, cs.sCount, 'Actual (observed)', 'd')}
            </div>
          )}

          <div className="rounded-lg bg-warning/5 border border-warning/10 p-3">
            <p className="text-xs text-warning font-semibold mb-1">Why this happens?</p>
            <p className="text-sm text-text-secondary">{cs.reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-surface/30 p-3 text-center">
            <span className="text-text-muted">Half-filled d subshell</span>
            <p className="text-accent font-bold text-lg">d⁵</p>
            <p className="text-text-muted">Special stability from exchange energy</p>
          </div>
          <div className="rounded-lg bg-surface/30 p-3 text-center">
            <span className="text-text-muted">Fully-filled d subshell</span>
            <p className="text-accent font-bold text-lg">d¹⁰</p>
            <p className="text-text-muted">Maximum stability from symmetry</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
