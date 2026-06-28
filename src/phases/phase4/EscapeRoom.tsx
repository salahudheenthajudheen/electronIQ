import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useXpToast } from '@/hooks/useXpToast'
import { useGameStore } from '@/store/gameStore'
import { Lock, Unlock, Coins, Trophy } from 'lucide-react'

const ROOMS = [
  {
    id: 1, name: 'CRT Basics',
    questions: [
      { q: 'What does CRT stand for?', options: ['Cathode Ray Tube', 'Current Resistance Transformer', 'Charge Reaction Terminal', 'Circuit Relay Transmitter'], correct: 0 },
      { q: 'Who discovered cathode rays?', options: ['J.J. Thomson', 'Michael Faraday', 'Heinrich Hertz', 'William Crookes'], correct: 3 },
    ],
  },
  {
    id: 2, name: 'Cathode Rays',
    questions: [
      { q: 'Cathode rays travel in:', options: ['Straight lines', 'Curved paths', 'Zigzag pattern', 'Circular motion'], correct: 0 },
      { q: 'What charge do cathode rays carry?', options: ['Positive', 'Negative', 'Neutral', 'Both positive and negative'], correct: 1 },
    ],
  },
  {
    id: 3, name: 'Thomson\'s Experiment',
    questions: [
      { q: 'What did Thomson measure to determine the charge-to-mass ratio?', options: ['Deflection in magnetic field', 'Deflection in electric field', 'Both magnetic and electric deflection', 'Speed of particles'], correct: 2 },
      { q: 'Thomson\'s experiment used:', options: ['A prism', 'A cathode ray tube', 'A gold foil', 'A cloud chamber'], correct: 1 },
    ],
  },
  {
    id: 4, name: 'Electron Properties',
    questions: [
      { q: 'The charge of an electron is approximately:', options: ['-1.6 × 10⁻¹⁹ C', '-1.6 × 10¹⁹ C', '+1.6 × 10⁻¹⁹ C', '0 C'], correct: 0 },
      { q: 'The mass of an electron is approximately:', options: ['9.1 × 10⁻³¹ kg', '9.1 × 10⁻²⁷ kg', '1.67 × 10⁻²⁷ kg', '1.67 × 10⁻³¹ kg'], correct: 0 },
    ],
  },
  {
    id: 5, name: 'Applications',
    questions: [
      { q: 'Which device uses a beam of electrons to create images?', options: ['LED TV', 'CRT TV', 'LCD Monitor', 'Plasma TV'], correct: 1 },
      { q: 'Electron microscopes use electrons because they have:', options: ['Shorter wavelength than light', 'Longer wavelength than light', 'Higher energy than light', 'Lower cost than light'], correct: 0 },
    ],
  },
]

interface EscapeRoomProps {
  studentId: string
  onComplete: () => void
}

export function EscapeRoom({ studentId, onComplete }: EscapeRoomProps) {
  const [currentRoom, setCurrentRoom] = useState<number | null>(null)
  const [completedRooms, setCompletedRooms] = useState<Set<number>>(new Set())
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [roomCorrect, setRoomCorrect] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [allComplete, setAllComplete] = useState(false)
  const { hintCoins, setHintCoins } = useGameStore()
  const { awardAndToast } = useXpToast()

  const handleAnswer = async (answerIndex: number) => {
    if (!currentRoom) return
    const room = ROOMS.find(r => r.id === currentRoom)!
    const question = room.questions[currentQuestion]
    const correct = answerIndex === question.correct

    if (studentId) {
      await supabase.from('quiz_attempts').insert({
        student_id: studentId,
        room_number: currentRoom,
        question_id: `room${currentRoom}_q${currentQuestion}`,
        answer: question.options[answerIndex],
        correct,
      })
    }

    if (correct) {
      const newCorrect = roomCorrect + 1
      setRoomCorrect(newCorrect)
      
      if (currentQuestion < room.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
      } else {
        // Room complete
        const newCompleted = new Set(completedRooms)
        newCompleted.add(currentRoom)
        setCompletedRooms(newCompleted)
        setShowResult(true)
        
        if (studentId) {
          await awardAndToast(studentId, 50, 4, `${room.name} cleared! +50 XP`)
        }
        
        if (newCompleted.size === 5) {
          setAllComplete(true)
          if (studentId) {
            await awardAndToast(studentId, 200, 4, 'Escape Room Complete! +200 XP')
          }
          onComplete()
        }
      }
    } else {
      setShowResult(true)
    }
  }

  const useHintCoin = () => {
    if (hintCoins > 0) {
      setHintCoins(hintCoins - 1)
    }
  }

  const closeResult = () => {
    setShowResult(false)
    setCurrentQuestion(0)
    setRoomCorrect(0)
    setCurrentRoom(null)
  }

  if (allComplete) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
        <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-accent mb-2">Escape Complete!</h2>
        <p className="text-text-muted">You've conquered all 5 rooms!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary">Escape Room</h2>
        <div className="flex items-center gap-2 text-warning">
          <Coins className="w-5 h-5" />
          <span className="font-bold">{hintCoins}</span>
        </div>
      </div>

      {!currentRoom ? (
        <div className="grid grid-cols-5 gap-3">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => {
                setCurrentRoom(room.id)
                setCurrentQuestion(0)
                setRoomCorrect(0)
              }}
              disabled={completedRooms.has(room.id) || (room.id > 1 && !completedRooms.has(room.id - 1))}
              className={`aspect-square rounded-xl border p-4 flex flex-col items-center justify-center transition-all ${
                completedRooms.has(room.id)
                  ? 'border-accent bg-accent/10'
                  : room.id > 1 && !completedRooms.has(room.id - 1)
                  ? 'border-surface bg-surface/20 opacity-50'
                  : 'border-surface bg-surface/50 hover:border-primary/50 hover:bg-primary/10'
              }`}
            >
              {completedRooms.has(room.id) ? (
                <Unlock className="w-8 h-8 text-accent" />
              ) : (
                <Lock className="w-8 h-8 text-text-muted" />
              )}
              <span className="text-xs text-text-muted mt-2">{room.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border border-surface bg-surface/30 p-6"
            >
              <div className="flex justify-between mb-4">
                <span className="text-text-muted text-sm">
                  Room {currentRoom} — Question {currentQuestion + 1}/2
                </span>
                <Button variant="ghost" size="sm" onClick={() => useHintCoin()} disabled={hintCoins <= 0}>
                  Use hint coin ({hintCoins})
                </Button>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {ROOMS.find(r => r.id === currentRoom)?.questions[currentQuestion].q}
              </h3>
              <div className="space-y-2">
                {ROOMS.find(r => r.id === currentRoom)?.questions[currentQuestion].options.map((opt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAnswer(i)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border p-6 text-center"
            >
              {roomCorrect >= 2 ? (
                <div>
                  <Unlock className="w-12 h-12 text-accent mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-accent mb-2">Door Unlocked!</h3>
                  <p className="text-text-muted mb-4">You answered both questions correctly.</p>
                </div>
              ) : (
                <div>
                  <Lock className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-red-400 mb-2">Try Again</h3>
                  <p className="text-text-muted mb-4">You need both answers correct to unlock the door.</p>
                </div>
              )}
              <Button onClick={closeResult}>Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
