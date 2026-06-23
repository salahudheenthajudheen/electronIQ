import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface PredictionModalProps {
  onPredict: (prediction: string) => void
  voltage: string
  pressure: string
  magField: boolean
  elecField: boolean
}

const OPTIONS = [
  'Beam bends upward',
  'Beam bends downward',
  'No change in beam',
  'Intensity increases',
]

export function PredictionModal({ onPredict, voltage, pressure, magField, elecField }: PredictionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-surface p-6 border border-primary/20"
      >
        <h2 className="text-xl font-bold text-text-primary mb-2">Predict the Outcome</h2>
        <p className="text-text-muted mb-4 text-sm">
          Voltage: {voltage} | Pressure: {pressure} | Mag: {magField ? 'ON' : 'OFF'} | Elec: {elecField ? 'ON' : 'OFF'}
        </p>
        <p className="text-text-primary mb-4">What will happen to the electron beam?</p>
        <div className="space-y-2">
          {OPTIONS.map(opt => (
            <Button
              key={opt}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onPredict(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export const PREDICTION_OPTIONS = OPTIONS
