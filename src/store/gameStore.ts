import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface GameState {
  currentPhase: number
  voltage: 'low' | 'medium' | 'high'
  pressure: 'low' | 'medium' | 'high'
  magField: boolean
  elecField: boolean
  hintCoins: number
  trials: any[]
  setVoltage: (v: 'low' | 'medium' | 'high') => void
  setPressure: (p: 'low' | 'medium' | 'high') => void
  setMagField: (b: boolean) => void
  setElecField: (b: boolean) => void
  setPhase: (phase: number) => void
  setHintCoins: (n: number) => void
  loadTrials: (studentId: string) => Promise<void>
  loadHintCoins: (studentId: string) => Promise<void>
}

export const useGameStore = create<GameState>((set) => ({
  currentPhase: 1,
  voltage: 'medium',
  pressure: 'medium',
  magField: false,
  elecField: false,
  hintCoins: 3,
  trials: [],

  setVoltage: (voltage) => set({ voltage }),
  setPressure: (pressure) => set({ pressure }),
  setMagField: (magField) => set({ magField }),
  setElecField: (elecField) => set({ elecField }),
  setPhase: (currentPhase) => set({ currentPhase }),
  setHintCoins: (hintCoins) => set({ hintCoins }),

  loadTrials: async (studentId) => {
    const { data } = await supabase
      .from('sim_trials')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    if (data) set({ trials: data })
  },

  loadHintCoins: async (studentId) => {
    const { data } = await supabase
      .from('leaderboard')
      .select('total_xp')
      .eq('student_id', studentId)
      .single()
    if (data) {
      const coins = Math.floor(data.total_xp / 100) + 3
      set({ hintCoins: Math.min(coins, 20) })
    }
  },
}))
