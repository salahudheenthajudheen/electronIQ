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
import { Award, Flame, Trophy, ArrowRight, LogOut, Menu, X, Atom, Microscope, Hash, Radiation, Orbit, Layers, Sparkles, Sigma, Shapes, Squirrel as Square, Orbit as OrbitIcon, Zap } from 'lucide-react'
import { modulesData } from '@/data/moduleData'

const ICONS = [Atom, Microscope, Hash, Radiation, Orbit, Layers, Sparkles, Sigma, Shapes, Square, OrbitIcon, Zap]

const MODULE_CONFIG = modulesData.map((m, i) => ({
  id: m.id,
  name: m.shortTitle,
  fullTitle: m.title,
  path: m.id === 1 ? '/student/phase1' : `/student/module/${m.id}/phase/1`,
  color: m.color,
  icon: ICONS[i] || Atom,
  description: m.description,
}))

export function StudentDashboard() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()
  const { t } = useTranslation()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [myXp, setMyXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [badges, setBadges] = useState<string[]>([])
  const [xpHistory, setXpHistory] = useState<any[]>([])
  const [moduleProgress, setModuleProgress] = useState<Record<number, number>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile) return

    const [lbRes, badgesRes, eventsRes, progressRes] = await Promise.all([
      supabase.from('leaderboard').select('*').eq('student_id', profile.id).single(),
      supabase.from('badges').select('badge_type').eq('student_id', profile.id),
      supabase.from('events').select('created_at, metadata').eq('student_id', profile.id)
        .eq('event_type', 'xp_earned').order('created_at', { ascending: true }).limit(7),
      supabase.from('phase_progress').select('module_id, phase, status').eq('student_id', profile.id),
    ])

    if (lbRes.data) { setMyXp(lbRes.data.total_xp); setStreak(lbRes.data.streak_days) }
    if (badgesRes.data) setBadges(badgesRes.data.map(b => b.badge_type))

    const history = eventsRes.data?.map((e, i) => ({
      day: `Day ${i + 1}`,
      xp: (e.metadata as any)?.amount || 0,
    })) || []
    setXpHistory(history)

    const topRes = await supabase.from('leaderboard').select('*, profiles(name)').order('total_xp', { ascending: false }).limit(5)
    if (topRes.data) setLeaderboard(topRes.data)

    // Compute module progress
    if (progressRes.data) {
      const byModule: Record<number, { done: number; total: number }> = {}
      progressRes.data.forEach((p: any) => {
        if (!byModule[p.module_id]) byModule[p.module_id] = { done: 0, total: 4 }
        if (p.status === 'completed') byModule[p.module_id].done++
      })
      const pct: Record<number, number> = {}
      Object.entries(byModule).forEach(([mod, v]) => { pct[parseInt(mod)] = Math.round((v.done / v.total) * 100) })
      setModuleProgress(pct)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/register')
  }

  if (!profile) return null

  const sidebar = (
    <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:flex lg:relative lg:w-64 bg-surface/30 border-r border-surface p-6 flex-col`}>
      {sidebarOpen && (
        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 lg:hidden text-text-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex flex-col items-center mb-8">
        <Avatar seed={profile.avatar_seed} size={80} />
        <h2 className="text-lg font-bold text-text-primary mt-3">{profile.name}</h2>
        <Badge variant="outline" className="mt-1 capitalize">{profile.role}</Badge>
      </div>
      <div className="space-y-4 flex-1">
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
      <button onClick={handleSignOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-text-muted hover:text-text-primary hover:bg-surface/50 transition-all mt-auto">
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </aside>
  )

  return (
    <div className="min-h-screen bg-space">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface/30 border-b border-surface">
        <img src="/logo.svg" alt="ElectronIQ" className="w-8 h-8" />
        <h1 className="text-lg font-bold text-text-primary font-display">{t('dashboard')}</h1>
        <button onClick={() => setSidebarOpen(true)} className="text-text-muted hover:text-text-primary">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {sidebar}

      <main className="lg:ml-64 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="hidden lg:block">
            <h1 className="text-3xl font-bold text-text-primary font-display mb-2">{t('dashboard')}</h1>
            <p className="text-sm text-text-muted mb-8">Class 11 Chemistry — ARCS Learning Modules</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {MODULE_CONFIG.map(mod => {
              const Icon = mod.icon
              const progress = moduleProgress[mod.id] || 0
              return (
                <Card key={mod.id} className="hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(mod.path)}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: mod.color + '20', color: mod.color }}>
                        Module {mod.id}
                      </span>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all" />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: mod.color + '15' }}>
                        <Icon className="h-5 w-5" style={{ color: mod.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-1 leading-tight">{mod.name}</h3>
                        <Progress value={progress} className="h-1.5 mb-1" />
                        <div className="flex justify-between text-xs text-text-muted">
                          <span>{progress}%</span>
                          <span>4 phases</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary text-base sm:text-lg">XP History (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={xpHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="xp" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary text-base sm:text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  {t('leaderboard')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.length === 0 && <p className="text-xs text-text-muted text-center py-4">No data yet</p>}
                  {leaderboard.map((entry, i) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg bg-surface/30 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? 'bg-yellow-500 text-black' :
                          i === 1 ? 'bg-gray-400 text-black' :
                          i === 2 ? 'bg-amber-700 text-white' :
                          'bg-surface text-text-muted'
                        }`}>{i + 1}</span>
                        <span className="text-text-primary truncate">{entry.profiles?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-accent font-bold shrink-0">{entry.total_xp} XP</span>
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
