import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ORBITAL_ORDER: { label: string; n: number; l: number; capacity: number }[] = [
  { label: '1s', n: 1, l: 0, capacity: 2 },
  { label: '2s', n: 2, l: 0, capacity: 2 },
  { label: '2p', n: 2, l: 1, capacity: 6 },
  { label: '3s', n: 3, l: 0, capacity: 2 },
  { label: '3p', n: 3, l: 1, capacity: 6 },
  { label: '4s', n: 4, l: 0, capacity: 2 },
  { label: '3d', n: 3, l: 2, capacity: 10 },
  { label: '4p', n: 4, l: 1, capacity: 6 },
]

const ELEMENT_NAMES: Record<number, string> = {
  1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
  11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar',
  19: 'K', 20: 'Ca', 21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe',
  27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn',
}

export default function ElectronFillingLab() {
  const [electrons, setElectrons] = useState(0)

  let remaining = electrons
  const usedConfig: { label: string; count: number; config: string }[] = []

  // Auto-fill following rules
  for (const orb of ORBITAL_ORDER) {
    const take = Math.min(remaining, orb.capacity)
    const boxes = orb.capacity / 2

    if (take > 0) {
      // Fill singly first (Hund's), then pair
      const singleCount = Math.min(take, boxes)
      const pairCount = Math.max(0, take - boxes)

      const eConfig: string[] = []
      for (let i = 0; i < singleCount; i++) eConfig.push('↑')
      for (let i = 0; i < pairCount; i++) eConfig.push('↓')

      usedConfig.push({
        label: orb.label,
        count: take,
        config: eConfig.join(' '),
      })
    }
    remaining -= take
  }

  const currentElement = ELEMENT_NAMES[electrons] || `Z=${electrons}`

  const violations: string[] = []
  // Check Pauli
  for (const uc of usedConfig) {
    if (uc.count > (ORBITAL_ORDER.find(o => o.label === uc.label)?.capacity || 0)) {
      violations.push(`${uc.label}: exceeds capacity (Pauli Exclusion)`)
    }
  }

  const canAdd = electrons < 30
  const canRemove = electrons > 0

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Virtual Electron Filling Lab</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setElectrons(Math.max(0, electrons - 1))} disabled={!canRemove}>
              −
            </Button>
            <span className="text-lg font-bold text-primary w-8 text-center">{electrons}</span>
            <Button size="sm" onClick={() => setElectrons(Math.min(30, electrons + 1))} disabled={!canAdd}>
              +
            </Button>
          </div>
          <span className="text-sm text-text-muted">Element: <strong className="text-text-primary">{currentElement}</strong></span>
          <Button size="sm" variant="outline" onClick={() => setElectrons(0)}>Reset</Button>
        </div>
        <div className="rounded-lg border border-surface p-4 space-y-1.5 bg-surface/10">
          <p className="text-xs text-text-muted mb-2 font-semibold">Orbital Filling Order (Aufbau)</p>
          {ORBITAL_ORDER.map(orb => {
            const uc = usedConfig.find(u => u.label === orb.label)
            const count = uc?.count || 0
            const isFull = count >= orb.capacity
            const isPart = count > 0 && !isFull
            const boxes = orb.capacity / 2

            return (
              <div key={orb.label} className="flex items-center gap-3">
                <span className="w-8 text-xs font-mono text-text-muted">{orb.label}</span>
                <div className="flex gap-1">
                  {Array.from({ length: boxes }, (_, i) => {
                    const hasUp = count > i
                    const hasDown = count > i + boxes
                    return (
                      <div key={i} className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-mono ${
                        isFull ? 'border-accent bg-accent/10' :
                        isPart ? 'border-primary bg-primary/5' :
                        'border-surface bg-surface/20'
                      }`}>
                        {hasUp ? '↑' : hasDown ? '↓' : ''}
                      </div>
                    )
                  })}
                </div>
                <span className={`text-xs ${isFull ? 'text-accent' : isPart ? 'text-primary' : 'text-text-muted'}`}>
                  {count > 0 ? `${count}e⁻` : 'empty'}
                </span>
              </div>
            )
          })}
        </div>

        {electrons > 0 && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs font-semibold text-text-primary mb-1">
              Electronic Configuration of {currentElement} (Z={electrons})
            </p>
            <p className="text-sm font-mono text-primary">
              {usedConfig.filter(u => u.count > 0).map(u => `${u.label}${u.count}`).join(' ')}
            </p>
            {violations.length > 0 && (
              <div className="mt-2 text-xs text-red-400">
                {violations.map((v, i) => <p key={i}>⚠ {v}</p>)}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-text-muted space-y-1">
          <p><strong>Rules applied:</strong></p>
          <p>• <strong>Aufbau:</strong> Fill lowest energy orbitals first (1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p)</p>
          <p>• <strong>Pauli:</strong> Each orbital box holds max 2 electrons with opposite spins</p>
          <p>• <strong>Hund:</strong> Fill each box singly before pairing</p>
        </div>
      </CardContent>
    </Card>
  )
}
