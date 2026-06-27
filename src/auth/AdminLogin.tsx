import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function AdminLogin() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      const profile = useAuthStore.getState().profile
      if (profile?.role === 'admin') navigate('/admin')
      else if (profile?.role === 'teacher') navigate('/teacher')
      else { setError('Access denied. Admin or Teacher account required.'); useAuthStore.getState().signOut() }
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-space flex flex-col items-center justify-center p-4">
      <img src="/logo.svg" alt="ElectronIQ" className="w-16 h-16 mb-4 opacity-60" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Staff Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border border-surface bg-space px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-md border border-surface bg-space px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            <p className="text-center text-xs text-text-muted">
              <button type="button" onClick={() => navigate('/register')}
                className="hover:text-primary transition-colors">Back to Student Registration</button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
