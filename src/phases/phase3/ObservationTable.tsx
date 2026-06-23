import { useState } from 'react'

interface Trial {
  id: string
  voltage: string
  pressure: string
  mag_field: boolean
  elec_field: boolean
  prediction: string
  correct: boolean
  explanation?: string
}

interface ObservationTableProps {
  trials: Trial[]
}

export function ObservationTable({ trials }: ObservationTableProps) {
  const [explanations, setExplanations] = useState<Record<string, string>>({})

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface">
            <th className="text-left py-2 px-3 text-text-muted">#</th>
            <th className="text-left py-2 px-3 text-text-muted">Voltage</th>
            <th className="text-left py-2 px-3 text-text-muted">Pressure</th>
            <th className="text-left py-2 px-3 text-text-muted">Fields</th>
            <th className="text-left py-2 px-3 text-text-muted">Prediction</th>
            <th className="text-left py-2 px-3 text-text-muted">Result</th>
            <th className="text-left py-2 px-3 text-text-muted">Your Explanation</th>
          </tr>
        </thead>
        <tbody>
          {trials.slice(0, 9).map((t, i) => (
            <tr key={t.id} className="border-b border-surface/50">
              <td className="py-2 px-3 text-text-muted">{i + 1}</td>
              <td className="py-2 px-3 text-text-primary capitalize">{t.voltage}</td>
              <td className="py-2 px-3 text-text-primary capitalize">{t.pressure}</td>
              <td className="py-2 px-3 text-text-primary">
                {[t.mag_field && 'M', t.elec_field && 'E'].filter(Boolean).join(', ') || 'None'}
              </td>
              <td className="py-2 px-3 text-text-primary">{t.prediction}</td>
              <td className="py-2 px-3">
                <span className={t.correct ? 'text-accent' : 'text-red-400'}>
                  {t.correct ? 'Correct' : 'Wrong'}
                </span>
              </td>
              <td className="py-2 px-3">
                <textarea
                  className="w-full bg-transparent border border-surface rounded px-2 py-1 text-text-primary text-xs"
                  rows={2}
                  placeholder="Explain what happened (min. 10 words)..."
                  value={explanations[t.id] || ''}
                  onChange={e => setExplanations(prev => ({ ...prev, [t.id]: e.target.value }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
