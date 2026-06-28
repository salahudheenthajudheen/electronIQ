import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Users, Activity, LogOut } from 'lucide-react'

export function TeacherPanel() {
  const { signOut } = useAuthStore()
  const [students, setStudents] = useState<any[]>([])
  const [hypotheses, setHypotheses] = useState<any[]>([])
  const [frozen, setFrozen] = useState(false)

  useEffect(() => {
    loadStudents()
    loadHypotheses()

    const channel = supabase.channel('hypothesis-feed')
    channel.on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'hypothesis_entries' },
      (payload) => {
        setHypotheses(prev => [payload.new as any, ...prev].slice(0, 20))
      }
    ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, leaderboard(total_xp, streak_days), phase_progress(*)')
      .eq('role', 'student')
    if (data) setStudents(data)
  }

  const loadHypotheses = async () => {
    const { data } = await supabase
      .from('hypothesis_entries')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setHypotheses(data)
  }

  const toggleFreeze = async () => {
    setFrozen(!frozen)
    const channel = supabase.channel('teacher-controls')
    channel.send({
      type: 'broadcast',
      event: 'freeze',
      payload: { frozen: !frozen },
    })
  }

  const consolidateHypotheses = () => {
    const channel = supabase.channel('hypothesis-feed')
    channel.send({
      type: 'broadcast',
      event: 'consolidation',
      payload: { text: 'Review the class hypotheses above and discuss what you observe.' },
    })
  }

  const totalStudents = students.length
  const avgCompletion = students.length > 0
    ? Math.round(students.filter(s => s.phase_progress?.some((p: any) => p.status === 'completed')).length / students.length * 100)
    : 0

  return (
    <div className="min-h-screen bg-space p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-display">Teacher Panel</h1>
          <div className="flex items-center gap-3">
            <Button onClick={toggleFreeze} variant={frozen ? 'destructive' : 'outline'}>
              {frozen ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {frozen ? 'Unfreeze Screens' : 'Freeze Screens'}
            </Button>
            <button
              onClick={() => { signOut(); window.location.href = '/admin/login' }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-text-muted hover:text-text-primary hover:bg-surface/50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-text-primary">{totalStudents}</p>
                <p className="text-sm text-text-muted">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-text-primary">{avgCompletion}%</p>
                <p className="text-sm text-text-muted">Avg Completion</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <span className="text-2xl">{hypotheses.length}</span>
              <div>
                <p className="text-2xl font-bold text-text-primary">{hypotheses.length}</p>
                <p className="text-sm text-text-muted">Hypotheses Submitted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-text-primary">Live Class View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {students.map(student => (
                <div key={student.id} className="rounded-lg border border-surface bg-surface/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      student.phase_progress?.some((p: any) => p.status === 'in_progress') ? 'bg-accent' :
                      student.phase_progress?.some((p: any) => p.status === 'completed') ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-text-primary text-sm font-medium">{student.name}</span>
                  </div>
                  <p className="text-xs text-text-muted">Total XP: {student.leaderboard?.total_xp || 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-text-primary">Hypothesis Feed</CardTitle>
            <Button size="sm" onClick={consolidateHypotheses}>Reveal Consolidation</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {hypotheses.map(h => (
                <div key={h.id} className="rounded-lg bg-surface/30 p-3 border border-surface">
                  <p className="text-text-primary text-sm">{h.text}</p>
                  <p className="text-xs text-text-muted mt-1">— {h.profiles?.name || 'Unknown'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
