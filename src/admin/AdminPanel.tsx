import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Award, Zap, TrendingUp, Brain, LogOut } from 'lucide-react'

export function AdminPanel() {
  const { signOut } = useAuthStore()
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgCompletion: 0,
    avgXp: 0,
    mostEarnedBadge: '',
  })
  const [dailyActive, setDailyActive] = useState<any[]>([])
  const [phaseCompletion, setPhaseCompletion] = useState<any[]>([])
  const [engagementSummary, setEngagementSummary] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadStats()
    loadStudents()
  }, [])

  const loadStats = async () => {
    const [profilesRes, progressRes, lbRes, badgesRes, eventsRes] = await Promise.all([
      supabase.from('profiles').select('id').eq('role', 'student'),
      supabase.from('phase_progress').select('status'),
      supabase.from('leaderboard').select('total_xp'),
      supabase.from('badges').select('badge_type'),
      supabase.from('events').select('created_at'),
    ])

    const totalStudents = profilesRes.data?.length || 0
    const completed = progressRes.data?.filter(p => p.status === 'completed').length || 0
    const totalXp = lbRes.data?.reduce((sum: number, l: any) => sum + (l.total_xp || 0), 0) || 0
    const badges = badgesRes.data?.map(b => b.badge_type) || []
    const mostCommon = badges.length > 0
      ? badges.sort((a, b) => badges.filter(v => v === a).length - badges.filter(v => v === b).length).pop()
      : ''

    setStats({
      totalStudents,
      avgCompletion: totalStudents > 0 ? Math.round(completed / totalStudents * 100) : 0,
      avgXp: totalStudents > 0 ? Math.round(totalXp / totalStudents) : 0,
      mostEarnedBadge: mostCommon || 'None',
    })

    const dailyMap: Record<string, number> = {}
    eventsRes.data?.forEach(e => {
      const day = new Date(e.created_at).toLocaleDateString()
      dailyMap[day] = (dailyMap[day] || 0) + 1
    })
    setDailyActive(Object.entries(dailyMap).slice(-30).map(([day, count]) => ({ day, count })))

    const phasesData: { phase: string; completion: number }[] = []
    for (let i = 1; i <= 4; i++) {
      const phaseProgress = progressRes.data?.filter((p: any) => p.phase === i) || []
      const done = phaseProgress.filter(p => p.status === 'completed').length
      phasesData.push({
        phase: `Phase ${i}`,
        completion: totalStudents > 0 ? Math.round(done / totalStudents * 100) : 0,
      })
    }
    setPhaseCompletion(phasesData)

    const classData = { totalStudents, avgCompletion: stats.avgCompletion, avgXp: stats.avgXp, mostEarnedBadge: mostCommon }
    const { data: summaryData } = await supabase.functions.invoke('engagement-summary', {
      body: { admin_id: (await supabase.auth.getUser()).data.user?.id, class_data_json: JSON.stringify(classData) },
    })
    if (summaryData?.summary) setEngagementSummary(summaryData.summary)
  }

  const loadStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, leaderboard(total_xp, phase_xp), badges(badge_type), phase_progress(*)')
      .eq('role', 'student')
      .order('name')
    if (data) setStudents(data)
  }

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.section?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-space p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-display">Admin Panel</h1>
          <button
            onClick={() => { signOut(); window.location.href = '/login' }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-text-muted hover:text-text-primary hover:bg-surface/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalStudents}</p>
                <p className="text-sm text-text-muted">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.avgCompletion}%</p>
                <p className="text-sm text-text-muted">Avg Completion</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.avgXp}</p>
                <p className="text-sm text-text-muted">Avg XP</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <Award className="w-8 h-8 text-pink-400" />
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.mostEarnedBadge}</p>
                <p className="text-sm text-text-muted">Most Earned Badge</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {engagementSummary && (
          <Card className="mb-8 border-accent/20">
            <CardContent className="flex items-start gap-4">
              <Brain className="w-6 h-6 text-accent mt-1" />
              <div>
                <p className="text-sm text-text-muted mb-1">AI Engagement Summary</p>
                <p className="text-text-primary">{engagementSummary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-text-primary">Daily Active Students (30 days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyActive}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-text-primary">Phase Completion Rates</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={phaseCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="phase" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="completion" fill="#00D4AA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-text-primary">Student Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="Search by name or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-surface bg-space px-4 py-2 text-text-primary mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface">
                    <th className="text-left py-2 text-text-muted">Name</th>
                    <th className="text-left py-2 text-text-muted">Section</th>
                    <th className="text-left py-2 text-text-muted">Phase Progress</th>
                    <th className="text-left py-2 text-text-muted">XP</th>
                    <th className="text-left py-2 text-text-muted">Badges</th>
                    <th className="text-left py-2 text-text-muted">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => {}}
                      className="border-b border-surface/50 hover:bg-surface/30 cursor-pointer"
                    >
                      <td className="py-2 text-text-primary">{s.name}</td>
                      <td className="py-2 text-text-muted">{s.section}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(p => {
                            const progress = s.phase_progress?.find((pp: any) => pp.phase === p)
                            const done = progress?.status === 'completed'
                            return (
                              <span key={p} className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                                done ? 'bg-accent text-black' : 'bg-surface text-text-muted'
                              }`}>{p}</span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="py-2 text-accent font-medium">{s.leaderboard?.total_xp || 0}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {s.badges?.slice(0, 3).map((b: any) => (
                            <span key={b.badge_type} className="text-xs text-text-muted">{b.badge_type.replace(/_/g, ' ')}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 text-text-muted text-xs">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
