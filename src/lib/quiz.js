// Construction d'un quiz à partir de la banque de questions, et correction des réponses.
import bank from '../data/questions.json'
import {
  getVerb, conjugate, splitForm, pronoun, needsAgreement, tenseLabel,
  formChoices, endingChoices, compare, shuffle,
} from './conjugation.js'

export const ANSWER_TYPES = [
  { id: 'qcm_form', label: 'Choisir le verbe', hint: 'Le bon verbe parmi 4 propositions' },
  { id: 'qcm_end', label: 'Choisir la terminaison', hint: 'La bonne fin de mot parmi 4 propositions' },
  { id: 'text_end', label: 'Écrire la terminaison', hint: 'Taper seulement la fin du verbe' },
  { id: 'text_form', label: 'Écrire le verbe', hint: 'Taper le verbe en entier' },
]
export const QUESTION_TYPES = [
  { id: 'pronoun', label: 'Pronom et verbe', hint: 'Un pronom et un verbe à conjuguer' },
  { id: 'sentence', label: 'Phrase à compléter', hint: 'Une phrase avec accord à respecter' },
]
export const COUNTS = [10, 20, 30, 40, 50, 100]
export const REWORK_QUIZZES = 3
export const HISTORY_SIZE = 10

export const defaultConfig = () => ({
  tenses: ['present'],
  answerTypes: ['qcm_form'],
  questionTypes: ['pronoun', 'sentence'],
  count: 10,
  rework: false,
})

const isEnding = (t) => t === 'qcm_end' || t === 'text_end'
const isChoice = (t) => t === 'qcm_form' || t === 'qcm_end'
export const isTyped = (t) => t === 'text_end' || t === 'text_form'

const PERSON_LABEL = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles']

// Verbes (avec leur temps) fautifs dans les derniers quiz
export function troubleSpots(history) {
  const seen = new Map()
  for (const entry of history.slice(0, REWORK_QUIZZES)) {
    for (const m of entry.mistakes ?? []) seen.set(`${m.v}|${m.t}`, { v: m.v, t: m.t })
  }
  return [...seen.values()]
}
export const troubleVerbs = (history) => [...new Set(troubleSpots(history).map((s) => s.v))]

// Prépare une question complète, avec ses propositions, prête à être affichée
function prepare(q, questionType, answerType) {
  const verb = getVerb(q.v)
  const sp = splitForm(verb, q.t, q.p, q.g)
  const item = {
    id: q.id, v: q.v, t: q.t, p: q.p, g: q.g, a: q.a, pre: q.pre, post: q.post,
    qt: questionType, at: answerType,
    pr: pronoun(q.p, q.g, q.a),
    agree: needsAgreement(verb, q.t),
  }
  if (sp) { item.stem = sp.stem; item.end = sp.end }
  if (answerType === 'qcm_form') item.choices = formChoices(verb, q.t, q.p, q.g)
  if (answerType === 'qcm_end') item.choices = endingChoices(q.t, sp.end)
  return item
}

export function buildQuiz(config, history = []) {
  const tenses = new Set(config.tenses)
  const typed = config.answerTypes
  const usable = bank
    .filter((q) => tenses.has(q.t))
    .filter((q) => typed.some((a) => !isEnding(a)) || splitForm(getVerb(q.v), q.t, q.p, q.g))

  const wrong = config.rework ? troubleSpots(history) : []
  const wrongVerbs = new Set(wrong.map((s) => s.v))
  const exact = new Set(wrong.map((s) => `${s.v}|${s.t}`))

  const picked = []
  const taken = new Set()
  if (wrongVerbs.size) {
    const target = Math.min(Math.ceil(config.count * 0.4), usable.length)
    const candidates = shuffle(usable.filter((q) => wrongVerbs.has(q.v)))
    candidates.sort((x, y) => Number(exact.has(`${y.v}|${y.t}`)) - Number(exact.has(`${x.v}|${x.t}`)))
    for (const q of candidates.slice(0, target)) { picked.push(q); taken.add(q.id) }
  }
  let rest = shuffle(usable.filter((q) => !taken.has(q.id)))
  while (picked.length < config.count) {
    if (!rest.length) rest = shuffle(usable)
    picked.push(rest.pop())
  }

  const qTypes = config.questionTypes
  const items = shuffle(picked.slice(0, config.count)).map((q, i) => {
    const verb = getVerb(q.v)
    const canEnd = !!splitForm(verb, q.t, q.p, q.g)
    const allowed = typed.filter((a) => !isEnding(a) || canEnd)
    // alterne les types de réponse et de question, avec une part de hasard
    const at = allowed[(i + Math.floor(Math.random() * allowed.length)) % allowed.length]
    const qt = qTypes[(i + Math.floor(Math.random() * qTypes.length)) % qTypes.length]
    return prepare(q, qt, at)
  })
  return items
}

// ---- Libellés -----------------------------------------------------------------------------

export const personLabel = (p) => PERSON_LABEL[p]
export const fullAnswer = (item) => `${item.pr}${item.pr.endsWith('’') || item.pr.endsWith("'") ? '' : ' '}${item.a}`
export const expectedFor = (item) => (isEnding(item.at) ? item.end : item.a)

// ---- Correction ---------------------------------------------------------------------------

export function evaluate(item, given) {
  const text = String(given ?? '').trim()
  let verdict
  if (isChoice(item.at)) verdict = text === expectedFor(item) ? 'exact' : 'wrong'
  else {
    verdict = compare(text, expectedFor(item))
    if (verdict === 'wrong' && item.at === 'text_end') {
      // la forme entière a été tapée : on l'accepte, avec une remarque
      const whole = compare(text, item.a)
      if (whole !== 'wrong') verdict = 'whole'
    }
  }
  return { given: text, verdict, correct: verdict !== 'wrong' }
}

export function explain(item) {
  const label = tenseLabel(item.t)
  if (item.agree) {
    const gender = item.g === 'f' ? 'féminin' : 'masculin'
    const number = item.p >= 3 ? 'pluriel' : 'singulier'
    return `Avec l’auxiliaire être, le participe passé s’accorde avec le sujet (${gender} ${number}).`
  }
  if (item.t === 'passe_compose') {
    return `Passé composé : auxiliaire ${getVerb(item.v).aux} au présent + participe passé « ${getVerb(item.v).pp} ».`
  }
  if (item.end) return `${label}, avec « ${PERSON_LABEL[item.p]} » : la terminaison est -\u2060${item.end}.`
  return null
}

const ENCOURAGE = ['Bravo !', 'Exact !', 'Bien joué !', 'Parfait !', 'Très bien !']
export const praise = (n) => ENCOURAGE[n % ENCOURAGE.length]

export function scoreMessage(score, total) {
  const r = total ? score / total : 0
  if (r === 1) return 'Sans faute, bravo !'
  if (r >= 0.9) return 'Excellent travail !'
  if (r >= 0.7) return 'Très bien, continue comme ça !'
  if (r >= 0.5) return 'Bon travail, tu progresses !'
  return 'Courage, on s’entraîne et ça viendra !'
}

// Réponse corrigée de l'enfant, mise en forme pour la revue des erreurs
export function mistakeView(m) {
  const q = bank.find((x) => x.id === m.id)
  if (!q) return null
  const item = prepare(q, m.qt, m.at)
  return { ...item, given: m.given }
}

// Découpe l'énoncé en morceaux : ce qui précède le trou, le début du verbe déjà donné, ce qui suit
export function promptParts(item) {
  const ending = isEnding(item.at)
  const stem = ending ? item.stem : ''
  if (item.qt === 'sentence') return { lead: item.pre, stem, tail: item.post, ending }
  const pr = item.pr
  return { lead: pr.endsWith('’') || pr.endsWith("'") ? pr : `${pr} `, stem, tail: '', ending }
}

// Pour "je / tu / nous / vous" avec être : le genre ne se lit pas dans le pronom
export function genderTag(item) {
  if (item.qt !== 'pronoun' || !item.agree || ![0, 1, 3, 4].includes(item.p)) return null
  return item.g === 'f' ? 'au féminin' : 'au masculin'
}

export const configSummary = (config) =>
  `${config.tenses.map(tenseLabel).join(', ')} · ${config.count} questions`

export { conjugate }
