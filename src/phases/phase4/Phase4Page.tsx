import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { StoryCreator } from './StoryCreator'
import { EscapeRoom } from './EscapeRoom'
import { Certificate } from './Certificate'
import { supabase } from '@/lib/supabase'

export function Phase4Page() {
  const { profile } = useAuthStore()
  const [storyDone, setStoryDone] = useState(false)
  const [escapeDone, setEscapeDone] = useState(false)
  const [schoolName, setSchoolName] = useState('School')

  useEffect(() => {
    supabase.from('admin_settings').select('value').eq('key', 'school_name').single()
      .then(({ data }) => {
        if (data?.value) setSchoolName(data.value as string)
      })
  }, [])

  if (!profile) return null

  return (
    <div className="min-h-screen bg-space p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-text-primary font-display">Phase 4: Satisfaction</h1>
          <p className="text-text-muted">Create your story and escape the lab!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`rounded-xl border p-4 ${storyDone ? 'border-accent bg-accent/5' : 'border-surface bg-surface/30'}`}>
            <span className="text-xl">{storyDone ? '✅' : '📝'}</span>
            <p className="text-text-primary font-semibold mt-1">Story Creator</p>
            <p className="text-text-muted text-sm">{storyDone ? 'Completed' : 'In progress'}</p>
          </div>
          <div className={`rounded-xl border p-4 ${escapeDone ? 'border-accent bg-accent/5' : 'border-surface bg-surface/30'}`}>
            <span className="text-xl">{escapeDone ? '✅' : '🧩'}</span>
            <p className="text-text-primary font-semibold mt-1">Escape Room</p>
            <p className="text-text-muted text-sm">{escapeDone ? 'Completed' : 'In progress'}</p>
          </div>
        </div>

        <StoryCreator studentId={profile.id} language={profile.language} onSubmitted={() => setStoryDone(true)} />
        
        <EscapeRoom studentId={profile.id} onComplete={() => setEscapeDone(true)} />

        {storyDone && escapeDone && (
          <div className="rounded-xl border border-accent/20 bg-surface/50 p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Congratulations!</h2>
            <Certificate studentName={profile.name} schoolName={schoolName} />
          </div>
        )}
      </div>
    </div>
  )
}
