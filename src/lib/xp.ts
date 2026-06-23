import { supabase } from './supabase'

export const XP_VALUES = {
  HYPOTHESIS_SUBMITTED: 20,
  HYPOTHESIS_UPVOTED: 10,
  DEVICE_TAGGED_CORRECT: 15,
  PADLET_UPLOAD: 25,
  SIM_TRIAL: 10,
  CORRECT_PREDICTION_BONUS: 25,
  WORKSHEET_ANSWER: 20,
  HINT_TIER_1_PENALTY: -5,
  HINT_TIER_2_PENALTY: -15,
  ESCAPE_ROOM_CLEARED: 50,
  ESCAPE_ROOM_COMPLETE: 200,
  STORY_SUBMITTED: 100,
  DAILY_STREAK_MULTIPLIER: 30,
}

export const BADGE_TYPES = {
  FIRST_HYPOTHESIS: 'first_hypothesis',
  CONNECTION: 'connection',
  PREDICTOR: 'predictor',
  LAB_MASTER: 'lab_master',
  STORYTELLER: 'storyteller',
  ELECTRON_EXPLORER: 'electron_explorer',
  TOP_OF_CLASS: 'top_of_class',
} as const

export const BADGE_RARITY: Record<string, 'common' | 'rare' | 'legendary'> = {
  first_hypothesis: 'common',
  connection: 'common',
  predictor: 'rare',
  lab_master: 'rare',
  storyteller: 'rare',
  electron_explorer: 'legendary',
  top_of_class: 'legendary',
}

export async function awardXP(studentId: string, amount: number, phase: number) {
  const { data: lb } = await supabase
    .from('leaderboard')
    .select('total_xp, phase_xp')
    .eq('student_id', studentId)
    .single()

  const phaseXp = { ...(lb?.phase_xp || {}), [phase]: (lb?.phase_xp?.[phase] || 0) + amount }

  await supabase.from('leaderboard').upsert({
    student_id: studentId,
    total_xp: (lb?.total_xp || 0) + amount,
    phase_xp: phaseXp,
  })

  await supabase.from('events').insert({
    student_id: studentId,
    event_type: 'xp_earned',
    metadata: { amount, phase },
  })
}
