import { useCallback } from 'react'
import { awardXP } from '@/lib/xp'

export function useXpToast() {
  const showToast = useCallback((message: string, xp: number) => {
    window.dispatchEvent(new CustomEvent('xp-toast', { detail: { message, xp } }))
  }, [])

  const awardAndToast = useCallback(async (studentId: string, amount: number, phase: number, message: string) => {
    await awardXP(studentId, amount, phase)
    showToast(message, amount)
  }, [showToast])

  return { showToast, awardAndToast }
}
