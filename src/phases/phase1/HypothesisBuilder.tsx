import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { awardXP } from '@/lib/xp'
import { Send, Loader2 } from 'lucide-react'

interface Hypothesis {
  id: string
  student_id: string
  content: string
  section: string
  created_at: string
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'dare', 'ought', 'used', 'this', 'that', 'these', 'those', 'it', 'its',
  'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'i', 'me', 'my', 'not', 'no', 'nor', 'so', 'if',
  'then', 'than', 'too', 'very', 'just', 'about', 'also', 'more',
])

function getWordFrequencies(hypotheses: Hypothesis[]): { word: string; count: number }[] {
  const freq: Record<string, number> = {}

  for (const h of hypotheses) {
    const words = h.content
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))

    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }))
}

export function HypothesisBuilder({ studentId }: { studentId: string }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const profile = useAuthStore(s => s.profile)
  const section = profile?.section || 'default'

  useEffect(() => {
    supabase
      .from('hypothesis_entries')
      .select('*')
      .eq('section', section)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setHypotheses(data)
      })

    const channel = supabase
      .channel(`hypothesis-feed-${section}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'hypothesis_entries',
        filter: `section=eq.${section}`,
      }, (payload) => {
        const newHyp = payload.new as Hypothesis
        setHypotheses(prev => [newHyp, ...prev].slice(0, 5))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [section])

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)

    const { error } = await supabase.from('hypothesis_entries').insert({
      student_id: studentId,
      content: text.trim(),
      section,
    })

    if (!error) {
      awardXP(studentId, 20, 1)
      setText('')
    }

    setSubmitting(false)
  }

  const wordCloud = useMemo(() => getWordFrequencies(hypotheses), [hypotheses])
  const maxCount = Math.max(...wordCloud.map(w => w.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Hypothesis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="What do you think will happen when..."
            className="flex-1 rounded-md border border-surface bg-space px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleSubmit} disabled={!text.trim() || submitting}>
            {submitting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
            <span className="ml-1 hidden sm:inline">Submit</span>
          </Button>
        </div>

        {hypotheses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Recent Hypotheses
            </h4>
            {hypotheses.map(h => (
              <p
                key={h.id}
                className="text-sm text-text-primary bg-space/50 rounded-md px-3 py-2"
              >
                {h.content}
              </p>
            ))}
          </div>
        )}

        {wordCloud.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Word Cloud
            </h4>
            <div className="flex flex-wrap gap-2 items-center">
              {wordCloud.map(({ word, count }) => {
                const size = 12 + (count / maxCount) * 20
                return (
                  <span
                    key={word}
                    className="inline-block transition-all"
                    style={{
                      fontSize: `${size}px`,
                      opacity: 0.5 + (count / maxCount) * 0.5,
                    }}
                  >
                    {word}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
