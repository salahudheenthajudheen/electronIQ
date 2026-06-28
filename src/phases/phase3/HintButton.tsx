import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useTranslation } from 'react-i18next'

interface HintButtonProps {
  studentId: string
  questionContext: string
  language: string
  tier: number
  onHintReceived: (hint: string) => void
}

export function HintButton({ studentId, questionContext, language, tier, onHintReceived }: HintButtonProps) {
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const { t } = useTranslation()

  const requestHint = async () => {
    if (!studentId) return
    setLoading(true)
    const { data } = await supabase.functions.invoke('hint-generator', {
      body: { student_id: studentId, tier, language, question_context: questionContext },
    })
    if (data?.hint) {
      setHint(data.hint)
      onHintReceived(data.hint)
    }
    setLoading(false)
  }

  return (
    <div>
      <Button
        variant={tier === 1 ? 'outline' : 'secondary'}
        size="sm"
        onClick={requestHint}
        disabled={loading}
      >
        {loading ? 'Loading...' : `${t('hint')} ${tier} (${tier === 1 ? '-5' : '-15'} XP)`}
      </Button>
      {hint && (
        <p className="mt-2 text-sm text-accent italic">{hint}</p>
      )}
    </div>
  )
}
