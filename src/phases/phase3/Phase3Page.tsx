import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { awardXP, XP_VALUES } from '@/lib/xp'
import { useTranslation } from 'react-i18next'
import { PredictionModal } from './PredictionModal'
import { ObservationTable } from './ObservationTable'
import { DeflectionChart } from './DeflectionChart'
import { WorksheetSection } from './WorksheetSection'
import { HintButton } from './HintButton'

type TrialRecord = {
  id: string
  voltage: string
  pressure: string
  mag_field: boolean
  elec_field: boolean
  prediction: string
  correct: boolean
  created_at: string
}

const VOLTAGES = ['low', 'medium', 'high'] as const
const PRESSURES = ['low', 'medium', 'high'] as const

function computeDeflection(voltage: string, pressure: string, magField: boolean, elecField: boolean): number {
  const v = VOLTAGES.indexOf(voltage as typeof VOLTAGES[number])
  const p = PRESSURES.indexOf(pressure as typeof PRESSURES[number])
  let deflection = 0
  if (magField) deflection += (3 - v) * 15
  if (elecField) deflection += (3 - v) * 12
  deflection -= p * 3
  return Math.max(0, deflection)
}

function isCorrectPrediction(prediction: string, magField: boolean, elecField: boolean): boolean {
  const hasField = magField || elecField
  if (hasField) {
    return prediction === 'Beam bends upward' || prediction === 'Beam bends downward'
  }
  return prediction === 'No change in beam'
}

const beamColor = (deflection: number) => {
  if (deflection > 40) return '#00D4AA'
  if (deflection > 20) return '#6C63FF'
  return '#F59E0B'
}

function CRTVisualization({ voltage, pressure, magField, elecField }: {
  voltage: string; pressure: string; magField: boolean; elecField: boolean
}) {
  const deflection = computeDeflection(voltage, pressure, magField, elecField)
  const vIdx = VOLTAGES.indexOf(voltage as typeof VOLTAGES[number])
  const beamLength = 120 + vIdx * 20
  const beamY = 80 - deflection * 0.6

  return (
    <svg viewBox="0 0 240 160" className="w-full max-w-xs mx-auto">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={beamColor(deflection)} stopOpacity="0.6" />
          <stop offset="100%" stopColor={beamColor(deflection)} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="10" y="20" width="220" height="120" rx="60" fill="none" stroke="#334155" strokeWidth="2" />

      <rect x="10" y="55" width="18" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <circle cx="19" cy="80" r="6" fill="#F59E0B" opacity="0.8" />

      <line x1="28" y1="80" x2={28 + beamLength} y2={beamY} stroke={beamColor(deflection)} strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="80" x2={28 + beamLength} y2={beamY} stroke={beamColor(deflection)} strokeWidth="8" strokeLinecap="round" opacity="0.3" />

      <circle cx={28 + beamLength} cy={beamY} r="8" fill="url(#glow)" />
      <circle cx={28 + beamLength} cy={beamY} r="3" fill={beamColor(deflection)} />

      {magField && (
        <text x="180" y="40" fill="#6C63FF" fontSize="10" fontWeight="bold">B</text>
      )}
      {elecField && (
        <text x="180" y="130" fill="#00D4AA" fontSize="10" fontWeight="bold">E</text>
      )}

      <text x="160" y="150" fill="#94a3b8" fontSize="8">Deflection: {deflection.toFixed(0)}</text>
    </svg>
  )
}

export function Phase3Page() {
  const { t } = useTranslation()
  const { user, profile } = useAuthStore()
  const {
    voltage, pressure, magField, elecField,
    setVoltage, setPressure, setMagField, setElecField,
    trials, loadTrials, loadHintCoins,
  } = useGameStore()

  const [showPrediction, setShowPrediction] = useState(false)
  const [currentPrediction, setCurrentPrediction] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<{ correct: boolean; explanation?: string } | null>(null)
  const [showWorksheet, setShowWorksheet] = useState(false)

  const studentId = user?.id || profile?.id || ''

  useEffect(() => {
    if (studentId) {
      loadTrials(studentId)
      loadHintCoins(studentId)
    }
  }, [studentId])

  const typedTrials = trials as TrialRecord[]
  const trialCount = typedTrials.filter(t => !t.mag_field && !t.elec_field).length

  const chartData = useMemo(() => {
    return VOLTAGES.map(v => ({
      variable: v,
      deflection: computeDeflection(v, pressure, false, false),
    }))
  }, [pressure])

  const handleStartTrial = () => {
    setCurrentPrediction(null)
    setLastResult(null)
    setShowPrediction(true)
  }

  const handlePredict = async (prediction: string) => {
    setCurrentPrediction(prediction)
    setShowPrediction(false)
    setSubmitting(true)

    const correct = isCorrectPrediction(prediction, magField, elecField)

    if (studentId) {
      const { data: trialData, error } = await supabase
        .from('sim_trials')
        .insert({
          student_id: studentId,
          phase: 3,
          voltage,
          pressure,
          mag_field: magField,
          elec_field: elecField,
          prediction,
          correct,
        })
        .select()
        .maybeSingle()

      if (!error && trialData) {
        await awardXP(studentId, XP_VALUES.SIM_TRIAL, 3)
        if (correct) {
          await awardXP(studentId, XP_VALUES.CORRECT_PREDICTION_BONUS, 3)
        }
        await loadTrials(studentId)
      }
    }

    let explanation: string | undefined
    if (!correct && studentId) {
      const { data: microData } = await supabase.functions.invoke('micro-explanation', {
        body: {
          student_id: studentId,
          voltage,
          pressure,
          mag_field: magField,
          elec_field: elecField,
          prediction,
          language: profile?.language || 'en',
        },
      })
      explanation = microData?.explanation
    }

    setLastResult({ correct, explanation })
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-space p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Phase 3: Virtual CRT Lab</h1>
          <p className="text-text-muted text-sm">
            Trial {Math.min(trialCount + 1, 9)} of 9 — {t('predict')} the beam behavior, then observe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-surface bg-surface/30 p-4 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">CRT Simulation</h2>
            <CRTVisualization voltage={voltage} pressure={pressure} magField={magField} elecField={elecField} />

            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">{t('voltage')}</label>
                <div className="flex gap-2">
                  {VOLTAGES.map(v => (
                    <Button
                      key={v}
                      variant={voltage === v ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVoltage(v)}
                    >
                      {t(v)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1">{t('pressure')}</label>
                <div className="flex gap-2">
                  {PRESSURES.map(p => (
                    <Button
                      key={p}
                      variant={pressure === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPressure(p)}
                    >
                      {t(p)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={magField}
                    onChange={e => setMagField(e.target.checked)}
                    className="rounded border-surface bg-surface text-primary"
                  />
                  {t('magneticField')}
                </label>
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={elecField}
                    onChange={e => setElecField(e.target.checked)}
                    className="rounded border-surface bg-surface text-primary"
                  />
                  {t('electricField')}
                </label>
              </div>
            </div>

            <Button
              onClick={handleStartTrial}
              disabled={submitting || trialCount >= 9}
              className="w-full"
            >
              {submitting ? t('loading') : trialCount >= 9 ? 'All Trials Complete' : `${t('trial')} ${trialCount + 1}: ${t('predict')}`}
            </Button>
          </div>

          <div className="rounded-xl border border-surface bg-surface/30 p-4 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Deflection Analysis</h2>
            <DeflectionChart data={chartData} />
            <p className="text-xs text-text-muted text-center">
              Deflection angle vs voltage (current pressure: {pressure})
            </p>
          </div>
        </div>

        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${
              lastResult.correct
                ? 'border-accent/30 bg-accent/5'
                : 'border-red-400/30 bg-red-400/5'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-bold ${lastResult.correct ? 'text-accent' : 'text-red-400'}`}>
                  {lastResult.correct ? t('correct') : t('wrong')}
                </h3>
                <p className="text-text-muted text-sm mt-1">
                  Prediction: {currentPrediction}
                </p>
                {lastResult.explanation && (
                  <div className="mt-2 p-3 rounded-lg bg-surface/50 border border-surface">
                    <p className="text-text-primary text-sm">{lastResult.explanation}</p>
                  </div>
                )}
              </div>
              {trialCount < 9 && (
                <Button variant="outline" size="sm" onClick={handleStartTrial}>
                  Next Trial
                </Button>
              )}
            </div>
          </motion.div>
        )}

        <div className="rounded-xl border border-surface bg-surface/30 p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Observation Log</h2>
          <ObservationTable trials={typedTrials} />
        </div>

        {typedTrials.length > 0 && studentId && (
          <div className="rounded-xl border border-surface bg-surface/30 p-4">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Need a Hint?</h2>
            <div className="flex gap-2">
              <HintButton
                studentId={studentId}
                questionContext="Explain the deflection of electron beam in CRT"
                language={profile?.language || 'en'}
                tier={1}
                onHintReceived={() => {}}
              />
              <HintButton
                studentId={studentId}
                questionContext="Explain the deflection of electron beam in CRT"
                language={profile?.language || 'en'}
                tier={2}
                onHintReceived={() => {}}
              />
            </div>
          </div>
        )}
        {typedTrials.length > 0 && !studentId && (
          <div className="rounded-xl border border-surface bg-surface/30 p-4 text-center">
            <p className="text-sm text-text-muted">Register to unlock hints and track your progress</p>
          </div>
        )}

        {trialCount >= 9 && !showWorksheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button onClick={() => setShowWorksheet(true)} className="w-full" size="lg">
              Start Consolidation Worksheet
            </Button>
          </motion.div>
        )}

        {showWorksheet && studentId && (
          <div className="rounded-xl border border-surface bg-surface/30 p-4">
            <WorksheetSection studentId={studentId} onComplete={() => {}} />
          </div>
        )}
        {showWorksheet && !studentId && (
          <div className="rounded-xl border border-surface bg-surface/30 p-4 text-center">
            <p className="text-sm text-text-muted">Register to access the consolidation worksheet</p>
          </div>
        )}
      </motion.div>

      {showPrediction && (
        <PredictionModal
          onPredict={handlePredict}
          voltage={voltage}
          pressure={pressure}
          magField={magField}
          elecField={elecField}
        />
      )}
    </div>
  )
}
