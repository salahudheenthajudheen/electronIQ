import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import CRTScene from './CRTScene'
import { HypothesisBuilder } from './HypothesisBuilder'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Zap, Gauge, Magnet, Waves, RefreshCw, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const voltageOptions = [
  { value: 'low' as const, label: 'Low', icon: Zap },
  { value: 'medium' as const, label: 'Medium', icon: Zap },
  { value: 'high' as const, label: 'High', icon: Zap },
]

const pressureOptions = [
  { value: 'low' as const, label: 'Low', icon: Gauge },
  { value: 'medium' as const, label: 'Medium', icon: Gauge },
  { value: 'high' as const, label: 'High', icon: Gauge },
]

export function Phase1Page() {
  const {
    voltage, setVoltage,
    pressure, setPressure,
    magField, setMagField,
    elecField, setElecField,
  } = useGameStore()

  const profile = useAuthStore(s => s.profile)
  const [xp, setXp] = useState(0)

  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('leaderboard')
      .select('total_xp')
      .eq('student_id', profile.id)
      .single()
      .then(({ data }) => {
        if (data) setXp(data.total_xp)
      })
  }, [profile?.id])

  const handleReset = () => {
    setVoltage('medium')
    setPressure('medium')
    setMagField(false)
    setElecField(false)
  }

  return (
    <div className="min-h-screen bg-space text-text-primary">
      <header className="sticky top-0 z-50 bg-space/80 backdrop-blur-lg border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/student/dashboard'}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-display font-bold">Phase 1: CRT Simulator</h1>
              <p className="text-xs text-text-muted">Explore the Cathode Ray Tube</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1.5 text-sm px-3 py-1.5">
            <Flame className="h-4 w-4 text-warning" />
            <span>{xp} XP</span>
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Card className="relative overflow-hidden border-surface/50">
          <CardContent className="p-0">
            <CRTScene
              voltage={voltage}
              pressure={pressure}
              magField={magField}
              elecField={elecField}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                Voltage
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {voltageOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={voltage === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVoltage(value)}
                    className={cn(
                      voltage === value && '!bg-warning !text-black hover:!bg-warning/90'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-accent" />
                Gas Pressure
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {pressureOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={pressure === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPressure(value)}
                    className={cn(
                      pressure === value && '!bg-accent !text-black hover:!bg-accent/90'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Magnet className="h-4 w-4 text-primary" />
                Fields
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Magnet className="h-3.5 w-3.5 text-blue-400" />
                    Magnetic
                  </span>
                  <button
                    role="switch"
                    aria-checked={magField}
                    onClick={() => setMagField(!magField)}
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      magField ? 'bg-blue-500' : 'bg-surface'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                      magField && 'translate-x-4'
                    )} />
                  </button>
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Waves className="h-3.5 w-3.5 text-orange-400" />
                    Electric
                  </span>
                  <button
                    role="switch"
                    aria-checked={elecField}
                    onClick={() => setElecField(!elecField)}
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      elecField ? 'bg-orange-500' : 'bg-surface'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                      elecField && 'translate-x-4'
                    )} />
                  </button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <h3 className="text-sm font-semibold mb-3">Actions</h3>
              <Button variant="outline" onClick={handleReset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardContent>
          </Card>
        </div>

        {profile?.id && <HypothesisBuilder studentId={profile.id} />}
      </main>
    </div>
  )
}
