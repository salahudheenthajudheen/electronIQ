import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const QUESTIONS = [
  {
    id: 'q1',
    question: 'What property of cathode rays was discovered using the cathode ray tube experiment?',
    options: ['They are positively charged', 'They are negatively charged', 'They have no charge', 'They are neutral'],
    correct: 1,
  },
  {
    id: 'q2',
    question: 'What happens to the electron beam when a magnetic field is applied perpendicular to its path?',
    options: ['It speeds up', 'It deflects', 'It stops', 'It splits into two'],
    correct: 1,
  },
  {
    id: 'q3',
    question: 'Which scientist is credited with the discovery of the electron through cathode ray experiments?',
    options: ['Ernest Rutherford', 'J.J. Thomson', 'Niels Bohr', 'James Chadwick'],
    correct: 1,
  },
]

interface WorksheetSectionProps {
  studentId: string
  onComplete: () => void
}

export function WorksheetSection({ studentId, onComplete }: WorksheetSectionProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    for (const [qId, answerIdx] of Object.entries(answers)) {
      const question = QUESTIONS.find(q => q.id === qId)
      if (question) {
        await supabase.from('worksheet_answers').insert({
          student_id: studentId,
          question_id: qId,
          answer_text: question.options[answerIdx],
          is_correct: answerIdx === question.correct,
        })
      }
    }
    setSubmitted(true)
    onComplete()
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <h3 className="text-accent text-xl font-bold mb-2">Worksheet Complete!</h3>
        <p className="text-text-muted">Great work completing the consolidation questions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">Consolidation Questions</h2>
      {QUESTIONS.map((q, qi) => (
        <div key={q.id} className="rounded-xl border border-surface bg-surface/30 p-4">
          <p className="text-text-primary mb-3">{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                className={`w-full text-left rounded-lg border px-4 py-2 transition-all ${
                  answers[q.id] === oi
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface text-text-muted hover:border-primary/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < 3}
        className="w-full"
      >
        Submit Answers
      </Button>
    </div>
  )
}
