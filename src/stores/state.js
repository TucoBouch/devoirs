// État global de l'app, sauvegardé dans le localStorage : on retrouve l'écran exact au retour.
import { reactive, watch } from 'vue'
import { load, save, clear } from '../lib/storage.js'
import { createNav } from '../lib/nav.js'
import {
  buildQuiz, evaluate, defaultConfig, troubleVerbs, HISTORY_SIZE, COUNTS, ANSWER_TYPES, QUESTION_TYPES,
} from '../lib/quiz.js'
import { TENSES } from '../lib/conjugation.js'

// Huit couvre-cahiers. `color` reprend la teinte claire de styles/tokens.css : elle sert aux pastilles de choix.
export const ACCENTS = [
  { id: 'indigo', label: 'Indigo', color: '#2f3d9c' },
  { id: 'violet', label: 'Violet', color: '#7a3fb0' },
  { id: 'rose', label: 'Rose', color: '#c4306f' },
  { id: 'orange', label: 'Orange', color: '#e6720f' },
  { id: 'jaune', label: 'Jaune', color: '#f2c012' },
  { id: 'vert', label: 'Vert', color: '#1b7f48' },
  { id: 'turquoise', label: 'Turquoise', color: '#0b7a80' },
  { id: 'bleu', label: 'Bleu', color: '#1f68b8' },
]

const sanitizeConfig = (c) => {
  const base = defaultConfig()
  const keep = (list, valid, fallback) => {
    const out = Array.isArray(list) ? list.filter((x) => valid.includes(x)) : []
    return out.length ? out : fallback
  }
  return {
    tenses: keep(c?.tenses, TENSES.map((t) => t.id), base.tenses),
    answerTypes: keep(c?.answerTypes, ANSWER_TYPES.map((t) => t.id), base.answerTypes),
    questionTypes: keep(c?.questionTypes, QUESTION_TYPES.map((t) => t.id), base.questionTypes),
    count: COUNTS.includes(c?.count) ? c.count : base.count,
    rework: !!c?.rework,
  }
}

const savedSettings = load('settings', {})
export const state = reactive({
  settings: {
    theme: ['light', 'dark', 'auto'].includes(savedSettings.theme) ? savedSettings.theme : 'auto',
    accent: ACCENTS.some((a) => a.id === savedSettings.accent) ? savedSettings.accent : 'indigo',
    textSize: savedSettings.textSize === 'large' ? 'large' : 'normal',
  },
  history: load('history', []),
  config: sanitizeConfig(load('config', null)),
  route: load('route', { name: 'verbes' }),
  quiz: load('quiz', null),
})

// Les écrans qui n'ont plus de données retombent sur un écran sûr (ex. quiz abandonné, historique vidé)
function validate(route) {
  const r = route && typeof route.name === 'string' ? route : { name: 'verbes' }
  if (r.name === 'quiz') return state.quiz ? { name: 'quiz' } : { name: 'verbes' }
  if (r.name === 'resultat' || r.name === 'revue') {
    const found = state.history.some((h) => h.id === r.id)
    return found ? { name: r.name, id: r.id } : { name: r.name === 'revue' ? 'historique' : 'verbes' }
  }
  return ['verbes', 'historique', 'reglages'].includes(r.name) ? { name: r.name } : { name: 'verbes' }
}

export const nav = createNav(state, validate)

// ---- Sauvegarde ---------------------------------------------------------------------------
let timer
const persistAll = () => {
  save('settings', state.settings)
  save('history', state.history)
  save('config', state.config)
  save('route', state.route)
  if (state.quiz) save('quiz', state.quiz)
  else clear('quiz')
}
watch(() => [state.settings, state.history, state.config, state.route, state.quiz], () => {
  clearTimeout(timer)
  timer = setTimeout(persistAll, 120)
}, { deep: true })
window.addEventListener('pagehide', persistAll)
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persistAll())

// ---- Réglages d'affichage -------------------------------------------------------------------
const dark = window.matchMedia('(prefers-color-scheme: dark)')
export function applyAppearance() {
  const { theme, accent, textSize } = state.settings
  const resolved = theme === 'auto' ? (dark.matches ? 'dark' : 'light') : theme
  const root = document.documentElement
  root.dataset.theme = resolved
  root.dataset.accent = accent
  root.dataset.size = textSize
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = resolved === 'dark' ? '#14112a' : '#fffefb'
}
watch(() => state.settings, applyAppearance, { deep: true })
dark.addEventListener?.('change', applyAppearance)

// ---- Quiz -----------------------------------------------------------------------------------
export const reworkVerbs = () => troubleVerbs(state.history)

export function startQuiz() {
  if (!reworkVerbs().length) state.config.rework = false
  const items = buildQuiz(state.config, state.history)
  state.quiz = {
    items,
    index: 0,
    results: [],
    phase: 'ask',
    draft: '',
    config: JSON.parse(JSON.stringify(state.config)),
    startedAt: Date.now(),
  }
  nav.go({ name: 'quiz' })
}

export const currentItem = () => (state.quiz ? state.quiz.items[state.quiz.index] : null)

export function submitAnswer(given) {
  const q = state.quiz
  if (!q || q.phase !== 'ask') return
  const item = q.items[q.index]
  const res = evaluate(item, given)
  q.results.push(res)
  q.phase = 'feedback'
}

export function nextQuestion() {
  const q = state.quiz
  if (!q || q.phase !== 'feedback') return
  if (q.index + 1 < q.items.length) {
    q.index += 1
    q.phase = 'ask'
    q.draft = ''
    return
  }
  finishQuiz()
}

function finishQuiz() {
  const q = state.quiz
  const mistakes = []
  let accents = 0
  q.items.forEach((item, i) => {
    const r = q.results[i]
    if (!r.correct) mistakes.push({ id: item.id, v: item.v, t: item.t, qt: item.qt, at: item.at, given: r.given })
    else if (r.verdict === 'accent') accents += 1
  })
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    config: q.config,
    total: q.items.length,
    score: q.items.length - mistakes.length,
    accents,
    marks: q.results.map((r) => (r.correct ? '1' : '0')).join(''),
    mistakes,
  }
  state.history = [entry, ...state.history].slice(0, HISTORY_SIZE)
  state.quiz = null
  nav.go({ name: 'resultat', id: entry.id }, { replace: true })
}

export function abandonQuiz() {
  state.quiz = null
}

export function clearHistory() {
  state.history = []
  state.config.rework = false
}

export function resetEverything() {
  ;['settings', 'history', 'config', 'route', 'quiz'].forEach(clear)
  location.hash = ''
  location.reload()
}
