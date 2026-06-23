import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Award, Flame, Trophy, ArrowRight } from 'lucide-react'

const PHASES = [
  { id: 1, name: 'Attention: CRT Lab', path: '/student/phase1', color: '#6C63FF' },
  { id: 2, name: 'Relevance: Electron Spotter', path: '/student/phase2', color: '#00D4AA' },
  { id: 3, name: 'Confidence: Virtual Lab', path: '/student/phase3', color: '#F59E0B' },
  { id: 4, name: 'Satisfaction: Story & Escape', path: '/student/phase4', color: '#FF6B9D' },
]

export function StudentDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { t } = useTranslation()
  const [phaseProgress, setPhaseProgress] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [myXp, setMyXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [badges, setBadges] = useState<string[]>([])
  const [xpHistory, setXpHistory] = useState<any[]>([])

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile) return

    const [progressRes, lbRes, badgesRes, eventsRes] = await Promise.all([
      supabase.from('phase_progress').select('*').eq('student_id', profile.id),
      supabase.from('leaderboard').select('*').eq('student_id', profile.id).single(),
      supabase.from('badges').select('badge_type').eq('student_id', profile.id),
      supabase.from('events').select('created_at, metadata').eq('student_id', profile.id)
        .eq('event_type', 'xp_earned').order('created_at', { ascending: true }).limit(7),
    ])

    if (progressRes.data) setPhaseProgress(progressRes.data)
    if (lbRes.data) { setMyXp(lbRes.data.total_xp); setStreak(lbRes.data.streak_days) }
    if (badgesRes.data) setBadges(badgesRes.data.map(b => b.badge_type))
    
    const history = eventsRes.data?.map((e, i) => ({
      day: `Day ${i + 1}`,
      xp: (e.metadata as any)?.amount || 0,
    })) || []
    setXpHistory(history)

    const topRes = await supabase.from('leaderboard').select('*, profiles(name)').order('total_xp', { ascending: false }).limit(5)
    if (topRes.data) setLeaderboard(topRes.data)
  }

  const getPhaseStatus = (phaseId: number) => {
    const p = phaseProgress.find(pp => pp.phase === phaseId)
    if (!p) return { completion: 0, timeSpent: 0 }
    return {
      completion: p.status === 'completed' ? 100 : p.status === 'in_progress' ? 50 : 0,
      timeSpent: p.time_spent_seconds || 0,
    }
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-space">
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface/30 border-r border-surface p-6 hidden lg:block">
        <div className="flex flex-col items-center mb-8">
          <Avatar seed={profile.avatar_seed} size={80} />
          <h2 className="text-lg font-bold text-text-primary mt-3">{profile.name}</h2>
          <Badge variant="outline" className="mt-1 capitalize">{profile.role}</Badge>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-surface/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">{t('xp')}</span>
              <span className="text-accent font-bold">{myXp} XP</span>
            </div>
            <Progress value={(myXp % 1000) / 10} />
            <p className="text-xs text-text-muted mt-1">{Math.floor(myXp / 1000) * 1000} → {(Math.floor(myXp / 1000) + 1) * 1000} XP</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-surface/50 p-3">
            <Flame className="w-5 h-5 text-warning" />
            <span className="text-text-primary font-semibold">{streak} {t('streak')}</span>
          </div>

          <div>
            <h3 className="text-sm text-text-muted mb-2">{t('badges')}</h3>
            <div className="flex flex-wrap gap-2">
              {badges.length === 0 && <span className="text-xs text-text-muted">No badges yet</span>}
              {badges.map(badge => (
                <Badge key={badge} variant="secondary" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {badge.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary font-display mb-8">{t('dashboard')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {PHASES.map(phase => {
              const status = getPhaseStatus(phase.id)
              return (
                <Card key={phase.id} className="hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(phase.path)}>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-text-muted">Phase {phase.id}</span>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{phase.name}</h3>
                    <Progress value={status.completion} className="mb-2" />
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>{status.completion}% complete</span>
                      <span>{Math.floor(status.timeSpent / 60)}m spent</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary text-lg">XP History (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={xpHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="xp" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  {t('leaderboard')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg bg-surface/30 p-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500 text-black' :
                          i === 1 ? 'bg-gray-400 text-black' :
                          i === 2 ? 'bg-amber-700 text-white' :
                          'bg-surface text-text-muted'
                        }`}>{i + 1}</span>
                        <span className="text-text-primary">{entry.profiles?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-accent font-bold">{entry.total_xp} XP</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
