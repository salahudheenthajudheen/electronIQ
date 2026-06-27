import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { generateAvatarSeed } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function Register() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { setProfile } = useAuthStore()

  const [name, setName] = useState('')
  const [section, setSection] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [language, setLanguage] = useState<'en' | 'ml'>('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${Date.now()}@student.local`,
        password: 'student123',
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('Could not create user')

      const avatarSeed = generateAvatarSeed(name)

      const { error: insertError } = await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        name,
        section,
        roll_no: rollNo,
        role: 'student',
        language,
        avatar_seed: avatarSeed,
      })
      if (insertError) throw insertError

      const profile = {
        id: signUpData.user.id,
        name,
        section,
        roll_no: rollNo,
        role: 'student' as const,
        language,
        avatar_seed: avatarSeed,
      }

      setProfile(profile)
      i18n.changeLanguage(language)
      navigate('/student/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-space flex flex-col items-center justify-center p-4">
      <img src="/logo.svg" alt="ElectronIQ" className="w-20 h-20 mb-4" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome to ElectronIQ!</CardTitle>
          <p className="text-center text-sm text-text-muted mt-1">Enter your details to start learning Class 11 Chemistry</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">{t('name')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-md border border-surface bg-space px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">{t('section')}</label>
              <input type="text" value={section} onChange={e => setSection(e.target.value)}
                className="w-full rounded-md border border-surface bg-space px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="A" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">{t('rollNo')}</label>
              <input type="text" value={rollNo} onChange={e => setRollNo(e.target.value)}
                className="w-full rounded-md border border-surface bg-space px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="01" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">{t('preferredLanguage')}</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setLanguage('en')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    language === 'en' ? 'border-primary bg-primary/10 text-primary' : 'border-surface text-text-muted hover:text-text-primary'
                  }`}>{t('english')}</button>
                <button type="button" onClick={() => setLanguage('ml')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    language === 'ml' ? 'border-primary bg-primary/10 text-primary' : 'border-surface text-text-muted hover:text-text-primary'
                  }`}>{t('malayalam')}</button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Start Learning'}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-text-muted">
            <span className="opacity-50">Staff? </span>
            <button type="button" onClick={() => navigate('/admin/login')}
              className="hover:text-primary transition-colors underline underline-offset-2 decoration-dotted">
              Admin / Teacher Login
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
