import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getModule } from '@/data/moduleData'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft, ArrowRight, Lightbulb, Link2, Target, Award,
  CheckCircle2, HelpCircle, BookOpen, Beaker, PenTool,
  Puzzle, MessageSquare, BarChart3, Users,
} from 'lucide-react'
import type { Activity } from '@/data/moduleData'
import { getSimulation } from './components'

const ARCS_META = {
  1: { icon: Lightbulb, label: 'Attention', desc: 'Capture curiosity' },
  2: { icon: Link2, label: 'Relevance', desc: 'Connect to real life' },
  3: { icon: Target, label: 'Confidence', desc: 'Build belief in success' },
  4: { icon: Award, label: 'Satisfaction', desc: 'Reinforce achievement' },
}

export default function ModulePhasePage() {
  const { moduleId, phaseNum } = useParams()
  const navigate = useNavigate()
  const mid = parseInt(moduleId || '1')
  const pn = parseInt(phaseNum || '1') as 1 | 2 | 3 | 4

  // Module 1 uses existing interactive pages — redirect
  if (mid === 1) {
    const phasePath = `/student/phase${pn}`
    navigate(phasePath, { replace: true })
    return null
  }

  const mod = getModule(mid)
  if (!mod) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Module not found</h1>
          <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const phase = mod.phases.find(p => p.phase === pn)
  if (!phase) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Phase not found</h1>
          <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const arcs = ARCS_META[pn]
  const prevPhase = pn > 1 ? (pn - 1) as 1 | 2 | 3 | 4 : null
  const nextPhase = pn < 4 ? (pn + 1) as 1 | 2 | 3 | 4 : null

  return (
    <div className="min-h-screen bg-space text-text-primary">
      <header className="sticky top-0 z-50 bg-space/80 backdrop-blur-lg border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost" size="icon"
              onClick={() => navigate('/student/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-display font-bold">{mod.title}</h1>
              <p className="text-xs text-text-muted">Module {mod.id}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1.5 text-sm px-3 py-1.5">
            <arcs.icon className="h-4 w-4" />
            <span>Phase {pn}: {arcs.label}</span>
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Phase header */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <arcs.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold mb-1">Phase {pn}: {arcs.label}</h2>
                <p className="text-sm text-text-muted">{arcs.desc}</p>
                <p className="text-sm text-text-secondary mt-2">{phase.objective}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        {phase.activities.map((activity, i) => (
          <ActivityRenderer key={i} activity={activity} index={i} moduleId={mid} phaseNum={pn} />
        ))}

        {/* Consolidation */}
        {phase.consolidation.length > 0 && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-accent flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4" />
                Consolidation
              </h3>
              <ul className="space-y-2">
                {phase.consolidation.map((c, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Phase navigation */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-4 border-t border-surface">
          <div>
            {prevPhase ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/student/module/${mid}/phase/${prevPhase}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Phase {prevPhase}: {ARCS_META[prevPhase].label}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/student/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
          </div>
          <div>
            {nextPhase ? (
              <Button
                onClick={() => navigate(`/student/module/${mid}/phase/${nextPhase}`)}
              >
                Phase {nextPhase}: {ARCS_META[nextPhase].label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/student/dashboard')}
              >
                Complete Module
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ActivityRenderer({ activity, moduleId, phaseNum }: { activity: Activity; index: number; moduleId: number; phaseNum: number }) {
  switch (activity.type) {
    case 'text':
      return <TextActivity activity={activity} />
    case 'discussion':
      return <DiscussionActivity activity={activity} />
    case 'poll':
      return <PollActivity activity={activity} />
    case 'table':
      return <TableActivity activity={activity} />
    case 'analogy':
      return <AnalogyActivity activity={activity} />
    case 'concept-map':
      return <ConceptMapActivity activity={activity} />
    case 'quiz':
      return <QuizActivity activity={activity} />
    case 'simulation':
      return <SimulationActivity activity={activity} moduleId={moduleId} phaseNum={phaseNum} />
    case 'project':
      return <ProjectActivity activity={activity} />
    case 'escape-room':
      return <EscapeRoomActivity activity={activity} />
    case 'badge':
      return <BadgeActivity activity={activity} />
    case 'debate':
      return <DebateActivity activity={activity} />
    case 'video':
      return <VideoActivity activity={activity} />
    case 'think-pair-share':
      return <ThinkPairShareActivity activity={activity} />
    case 'qr-code':
      return <QrCodeActivity activity={activity} />
    case 'peer-teaching':
      return <PeerTeachingActivity activity={activity} />
    case 'h5p':
      return <H5PActivity activity={activity} />
    case 'passport':
      return <PassportActivity activity={activity} />
    case 'investigation':
      return <InvestigationActivity activity={activity} />
    case 'mystery-cards':
      return <MysteryCardsActivity activity={activity} />
    default:
      return <TextActivity activity={activity} />
  }
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text-primary text-base flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  )
}

function Questions({ questions }: { questions?: string[] }) {
  if (!questions?.length) return null
  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Questions</p>
      {questions.map((q, i) => (
        <div key={i} className="flex items-start gap-2 text-sm text-text-secondary bg-surface/30 rounded-lg p-3">
          <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>{q}</span>
        </div>
      ))}
    </div>
  )
}

function Items({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function TextActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      <Items items={activity.items} />
      <Questions questions={activity.questions} />
    </Section>
  )
}

function DiscussionActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={MessageSquare} title={activity.title}>
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
        <p className="text-sm text-text-secondary italic">"{activity.content}"</p>
      </div>
      <Questions questions={activity.questions} />
    </Section>
  )
}

function PollActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BarChart3} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function TableActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      {activity.tableData && (
        <div className="overflow-x-auto rounded-lg border border-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50">
                {activity.tableData.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2.5 text-text-primary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activity.tableData.rows.map((row, i) => (
                <tr key={i} className="border-t border-surface">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 text-text-secondary">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function AnalogyActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Link2} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      {activity.analogies && (
        <div className="overflow-x-auto rounded-lg border border-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50">
                <th className="text-left px-4 py-2.5 text-text-primary font-semibold">Concept</th>
                <th className="text-left px-4 py-2.5 text-text-primary font-semibold">Analogy</th>
              </tr>
            </thead>
            <tbody>
              {activity.analogies.map((a, i) => (
                <tr key={i} className="border-t border-surface">
                  <td className="px-4 py-2 text-text-secondary font-medium">{a.left}</td>
                  <td className="px-4 py-2 text-text-secondary">{a.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function ConceptMapActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={PenTool} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      <Items items={activity.items} />
      <Questions questions={activity.questions} />
    </Section>
  )
}

function QuizActivity({ activity }: { activity: Activity }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  const handleAnswer = (qIdx: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [qIdx]: answer }))
  }

  const checkAnswer = (qIdx: number) => {
    setRevealed(prev => ({ ...prev, [qIdx]: true }))
  }

  return (
    <Section icon={HelpCircle} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      {activity.quizQuestions?.map((q, i) => (
        <div key={i} className="rounded-lg border border-surface p-4 space-y-3">
          <p className="text-sm font-medium text-text-primary">{i + 1}. {q.question}</p>
          {q.options ? (
            <div className="space-y-2">
              {q.options.map((opt, j) => (
                <label
                  key={j}
                  className={`flex items-center gap-3 rounded-lg p-3 text-sm cursor-pointer transition-colors ${
                    answers[i] === opt
                      ? revealed[i]
                        ? opt === q.answer
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                        : 'bg-primary/10 border border-primary/30'
                      : 'bg-surface/30 border border-surface hover:bg-surface/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`quiz-${i}`}
                    value={opt}
                    checked={answers[i] === opt}
                    onChange={() => handleAnswer(i, opt)}
                    className="sr-only"
                  />
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[i] === opt ? 'border-primary' : 'border-text-muted'
                  }`}>
                    {answers[i] === opt && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              placeholder="Type your answer..."
              value={answers[i] || ''}
              onChange={e => handleAnswer(i, e.target.value)}
              className="w-full rounded-lg bg-surface/30 border border-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          )}
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => checkAnswer(i)}>
              Check Answer
            </Button>
            {revealed[i] && (
              <span className="text-sm text-accent flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Answer: {q.answer}
              </span>
            )}
          </div>
        </div>
      ))}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function SimulationActivity({ activity, moduleId, phaseNum }: { activity: Activity; moduleId: number; phaseNum: number }) {
  const SimComponent = getSimulation(moduleId, phaseNum)
  if (SimComponent) {
    return (
      <Section icon={Beaker} title={activity.title}>
        <SimComponent />
        <Questions questions={activity.questions} />
      </Section>
    )
  }
  return (
    <Section icon={Beaker} title={activity.title}>
      <div className="rounded-xl bg-surface/30 border border-primary/10 p-6 flex flex-col items-center gap-4">
        <Beaker className="h-12 w-12 text-primary/40" />
        <p className="text-sm text-text-secondary text-center">{activity.content}</p>
      </div>
      <Questions questions={activity.questions} />
    </Section>
  )
}

function ProjectActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={PenTool} title={activity.title}>
      {activity.content && (
        <div className="rounded-lg bg-surface/20 border border-surface p-4">
          <p className="text-sm text-text-secondary whitespace-pre-line">{activity.content}</p>
        </div>
      )}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function EscapeRoomActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Puzzle} title={activity.title}>
      <div className="rounded-xl bg-warning/5 border border-warning/20 p-5">
        <div className="flex items-center gap-3 mb-3">
          <Puzzle className="h-6 w-6 text-warning" />
          <span className="text-sm font-semibold text-warning">Escape Room Challenge</span>
        </div>
        <p className="text-sm text-text-secondary mb-3">{activity.content}</p>
        {activity.quizQuestions?.map((q, i) => (
          <div key={i} className="text-sm text-text-primary mb-2">
            <span className="text-warning">Clue {i + 1}:</span> {q.question}
            <span className="text-accent ml-2">→ {q.answer}</span>
          </div>
        ))}
        <Questions questions={activity.questions} />
      </div>
    </Section>
  )
}

function BadgeActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Award} title={activity.title}>
      <div className="rounded-xl bg-accent/5 border border-accent/20 p-5 flex items-center gap-4">
        <Award className="h-10 w-10 text-accent shrink-0" />
        <p className="text-sm text-text-secondary">{activity.content}</p>
      </div>
    </Section>
  )
}

function DebateActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Users} title={activity.title}>
      <div className="rounded-lg bg-surface/20 border border-surface p-4">
        <p className="text-sm text-text-secondary mb-3">{activity.content}</p>
        <div className="flex gap-3">
          <Badge variant="secondary">Group A: Pro</Badge>
          <Badge variant="outline">Group B: Con</Badge>
        </div>
      </div>
      <Questions questions={activity.questions} />
    </Section>
  )
}

function VideoActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      <div className="rounded-xl bg-surface/30 border border-primary/10 p-6 flex flex-col items-center gap-3">
        <div className="w-full aspect-video rounded-lg bg-surface/50 flex items-center justify-center">
          <span className="text-text-muted text-sm">Video content</span>
        </div>
      </div>
      {activity.content && <p className="text-sm text-text-secondary mt-2">{activity.content}</p>}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function ThinkPairShareActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Users} title={activity.title}>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary">Think</Badge>
        <Badge variant="secondary">Pair</Badge>
        <Badge variant="secondary">Share</Badge>
      </div>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function QrCodeActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      <Items items={activity.items} />
    </Section>
  )
}

function PeerTeachingActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Users} title={activity.title}>
      <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
        <p className="text-sm text-text-secondary">{activity.content}</p>
      </div>
    </Section>
  )
}

function H5PActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      <div className="rounded-xl bg-surface/30 border border-primary/10 p-6 flex flex-col items-center gap-3">
        <span className="text-sm font-semibold text-text-muted">H5P Interactive Activity</span>
        {activity.content && <p className="text-sm text-text-secondary text-center">{activity.content}</p>}
      </div>
      <Questions questions={activity.questions} />
    </Section>
  )
}

function PassportActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      <Items items={activity.items} />
    </Section>
  )
}

function InvestigationActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={Beaker} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      {activity.tableData && (
        <div className="overflow-x-auto rounded-lg border border-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50">
                {activity.tableData.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2.5 text-text-primary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activity.tableData.rows.map((row, i) => (
                <tr key={i} className="border-t border-surface">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 text-text-secondary">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Questions questions={activity.questions} />
    </Section>
  )
}

function MysteryCardsActivity({ activity }: { activity: Activity }) {
  return (
    <Section icon={BookOpen} title={activity.title}>
      {activity.content && <p className="text-sm text-text-secondary">{activity.content}</p>}
      {activity.tableData && (
        <div className="overflow-x-auto rounded-lg border border-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50">
                {activity.tableData.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2.5 text-text-primary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activity.tableData.rows.map((row, i) => (
                <tr key={i} className="border-t border-surface">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 text-text-secondary">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Questions questions={activity.questions} />
    </Section>
  )
}
