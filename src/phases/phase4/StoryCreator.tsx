import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useXpToast } from '@/hooks/useXpToast'
import { useTranslation } from 'react-i18next'
import { Sparkles, Send } from 'lucide-react'

const STORY_OPTIONS = [
  { id: 'cosmic_trip', title: 'Cosmic Trip', description: 'Journey of an electron through the universe' },
  { id: 'thomson_discovery', title: "Thomson's Discovery", description: 'Script about J.J. Thomson discovering the electron' },
  { id: 'cathode_ray', title: 'Cathode Ray Explorer', description: 'Explain cathode ray characteristics through story' },
]

interface StoryCreatorProps {
  studentId: string
  language: string
  onSubmitted?: () => void
}

export function StoryCreator({ studentId, language, onSubmitted }: StoryCreatorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { t } = useTranslation()
  const { awardAndToast } = useXpToast()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your story here...' }),
    ],
    editorProps: {
      attributes: {
        class: 'min-h-[300px] px-4 py-3 text-text-primary focus:outline-none prose prose-invert max-w-none',
      },
    },
  })

  const handleSuggest = async () => {
    if (!editor || !selectedOption) return
    setAiLoading(true)
    const draftText = editor.getText()
    
    const { data } = await supabase.functions.invoke('story-assistant', {
      body: { student_id: studentId, language, draft_text: draftText, option_type: selectedOption },
    })
    
    if (data?.suggestion) {
      setAiSuggestion(data.suggestion)
    }
    setAiLoading(false)
  }

  const acceptSuggestion = () => {
    if (editor && aiSuggestion) {
      editor.commands.insertContent(' ' + aiSuggestion)
      setAiSuggestion('')
    }
  }

  const handleSubmit = async () => {
    if (!editor || !selectedOption) return
    const content = editor.getJSON()
    
    await supabase.from('story_drafts').insert({
      student_id: studentId,
      option_type: selectedOption,
      content_json: content,
      submitted_at: new Date().toISOString(),
    })
    
    await awardAndToast(studentId, 100, 4, 'Story submitted! +100 XP')
    setSubmitted(true)
    onSubmitted?.()
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-accent mb-2">Story Submitted!</h2>
        <p className="text-text-muted">Your creative story has been saved. Check your badges!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedOption ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className="rounded-xl border border-surface bg-surface/50 p-6 text-left hover:border-primary/50 transition-all hover:bg-primary/5"
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">{opt.title}</h3>
              <p className="text-sm text-text-muted">{opt.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">
              {STORY_OPTIONS.find(o => o.id === selectedOption)?.title}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
              Change option
            </Button>
          </div>

          <div className="rounded-xl border border-surface bg-surface/30">
            <EditorContent editor={editor} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSuggest} disabled={aiLoading} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              {aiLoading ? 'Thinking...' : t('suggestNext')}
            </Button>
          </div>

          {aiSuggestion && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="text-accent text-sm mb-2">AI Suggestion:</p>
              <p className="text-text-primary">{aiSuggestion}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={acceptSuggestion}>Accept</Button>
                <Button size="sm" variant="ghost" onClick={() => setAiSuggestion('')}>Dismiss</Button>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {t('submitStory')}
          </Button>
        </div>
      )}
    </div>
  )
}
