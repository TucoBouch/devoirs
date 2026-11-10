// L'historique est commun aux exercices : chaque quiz porte l'identifiant de son exercice (`ex`).
// Les quiz enregistrés avant l'arrivée du second exercice n'en ont pas : ce sont des quiz de verbes.
import { configSummary, exerciseOf, HISTORY_SIZE } from './quiz.js'
import { accordSummary } from './accords.js'

export const EXERCISES = [
  { id: 'verbes', label: 'Révision des verbes', icon: 'pen' },
  { id: 'accords', label: 'Féminin et pluriel', icon: 'book' },
]

// On garde les 10 derniers quiz de chaque exercice
export function capHistory(list) {
  const count = {}
  return list.filter((h) => {
    const ex = exerciseOf(h)
    count[ex] = (count[ex] ?? 0) + 1
    return count[ex] <= HISTORY_SIZE
  })
}

export function entrySummary(entry, named = false) {
  if (exerciseOf(entry) === 'accords') return accordSummary(entry.config)
  return (named ? 'Verbes · ' : '') + configSummary(entry.config)
}
