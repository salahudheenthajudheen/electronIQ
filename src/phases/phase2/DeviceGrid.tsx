import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useXpToast } from '@/hooks/useXpToast'
import { DEVICE_EXPLANATIONS } from './deviceData'

const DEVICES = [
  { id: 'mobile', name: 'Mobile Phone', icon: '📱', description: 'Touchscreen device' },
  { id: 'led', name: 'LED Display', icon: '🖥️', description: 'Light emitting screen' },
  { id: 'crt_tv', name: 'CRT TV', icon: '📺', description: 'Old television set' },
  { id: 'xray', name: 'X-ray Machine', icon: '🔬', description: 'Medical imaging' },
  { id: 'battery', name: 'Battery', icon: '🔋', description: 'Power source' },
  { id: 'microscope', name: 'Electron Microscope', icon: '🔬', description: 'High magnification' },
]

const ROLE_OPTIONS = ['Signal carrier', 'Energy source', 'Display component']

const CORRECT_ANSWERS: Record<string, string> = {
  mobile: 'Signal carrier',
  led: 'Display component',
  crt_tv: 'Display component',
  xray: 'Energy source',
  battery: 'Energy source',
  microscope: 'Display component',
}

interface DeviceGridProps {
  studentId: string
  onProgressChange: (completed: number) => void
}

export function DeviceGrid({ studentId, onProgressChange }: DeviceGridProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ device: string; correct: boolean } | null>(null)
  const [showExplanation, setShowExplanation] = useState<string | null>(null)
  const { awardAndToast } = useXpToast()

  const handleSelect = async (deviceId: string, role: string) => {
    const correct = CORRECT_ANSWERS[deviceId] === role

    await supabase.from('tag_activity').insert({
      student_id: studentId,
      device_id: deviceId,
      selected_role: role,
      correct,
    })

    setFeedback({ device: deviceId, correct })

    if (correct) {
      const newCompleted = new Set(completed)
      newCompleted.add(deviceId)
      setCompleted(newCompleted)
      onProgressChange(newCompleted.size)
      await awardAndToast(studentId, 15, 2, `${DEVICES.find(d => d.id === deviceId)?.name} tagged correctly!`)
      setShowExplanation(deviceId)
    }

    setTimeout(() => {
      setFeedback(null)
      setSelectedDevice(null)
      if (correct) {
        setShowExplanation(null)
      }
    }, 1500)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {DEVICES.map(device => (
          <motion.button
            key={device.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedDevice(device.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              completed.has(device.id)
                ? 'border-accent bg-accent/10'
                : 'border-surface bg-surface/50 hover:border-primary/50'
            }`}
          >
            <span className="text-3xl">{device.icon}</span>
            <h3 className="mt-2 font-semibold text-text-primary">{device.name}</h3>
            <p className="text-sm text-text-muted">{device.description}</p>
          </motion.button>
        ))}
      </div>

      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="w-full max-w-md rounded-t-2xl bg-surface p-6"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {DEVICES.find(d => d.id === selectedDevice)?.name}
            </h3>
            <p className="text-text-muted mb-4">What role do electrons play in this device?</p>
            {ROLE_OPTIONS.map(role => (
              <button
                key={role}
                onClick={() => handleSelect(selectedDevice, role)}
                className="w-full rounded-lg border border-primary/20 px-4 py-3 mb-2 text-text-primary hover:bg-primary/10 transition-all"
              >
                {role}
              </button>
            ))}
            <button
              onClick={() => setSelectedDevice(null)}
              className="w-full text-text-muted py-2"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4"
        >
          <h4 className="font-semibold text-accent mb-1">
            {DEVICES.find(d => d.id === showExplanation)?.name}
          </h4>
          <p className="text-sm text-text-muted">
            {DEVICE_EXPLANATIONS[showExplanation]?.explanation}
          </p>
        </motion.div>
      )}

      {feedback && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-white ${
          feedback.correct ? 'bg-accent' : 'bg-red-500'
        }`}>
          {feedback.correct ? '\u2713 Correct!' : '\u2717 Wrong!'}
        </div>
      )}
    </div>
  )
}
