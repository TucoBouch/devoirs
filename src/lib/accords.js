// L'exercice « Féminin et pluriel » : construction d'un quiz à partir de la banque, libellés et explications.
// Chaque phrase de la banque a un trou, un mot de départ « (voisin) » et la réponse attendue « voisine ».
// Le quiz réutilise la correction du quiz des verbes : les types de réponse portent les mêmes identifiants.
import bank from '../data/accords.json'
import { shuffle } from './conjugation.js'
import { RULES } from './accord-rules.js'
import { COUNTS, REWORK_QUIZZES, exerciseOf } from './quiz.js'

export const SKILLS = [
  { id: 'f', label: 'Féminin', hint: 'un ami → une amie' },
  { id: 'p', label: 'Pluriel', hint: 'un cheval → des chevaux' },
]
export const NATURES = [
  { id: 'nom', label: 'Noms', hint: 'voisin, bijou, cheval…' },
  { id: 'adj', label: 'Adjectifs', hint: 'heureux, original, gros…' },
]
export const ACCORD_ANSWERS = [
  { id: 'qcm_form', label: 'Choisir le mot', hint: 'La bonne forme parmi 4 propositions' },
  { id: 'text_form', label: 'Écrire le mot', hint: 'Taper le mot en entier' },
]
export { COUNTS }

export const defaultAccords = () => ({
  skills: ['f', 'p'],
  natures: ['nom', 'adj'],
  answerTypes: ['qcm_form'],
  count: 10,
  rework: false,
})

// Règles ratées dans les derniers quiz de cet exercice (ex. « -eur → -euse »)
export function troubleRules(history) {
  const seen = new Set()
  const recent = history.filter((h) => exerciseOf(h) === 'accords').slice(0, REWORK_QUIZZES)
  for (const entry of recent) for (const m of entry.mistakes ?? []) if (RULES[m.r]) seen.add(m.r)
  return [...seen]
}
export const ruleSkill = (rule) => rule[0]

function prepare(q, answerType) {
  const item = { id: q.id, k: q.k, n: q.n, w: q.w, a: q.a, r: q.r, pre: q.pre, post: q.post, at: answerType }
  if (answerType === 'qcm_form') item.choices = shuffle([q.a, ...q.d])
  return item
}

export function buildAccords(config, history = []) {
  const skills = new Set(config.skills)
  const natures = new Set(config.natures)
  const usable = bank.filter((q) => skills.has(q.k) && natures.has(q.n))

  const weak = new Set(config.rework ? troubleRules(history).filter((r) => skills.has(ruleSkill(r))) : [])
  const picked = []
  const taken = new Set()
  const words = new Set()
  // un mot n'est posé qu'une fois par quiz tant que la banque le permet
  const take = (q) => {
    if (taken.has(q.id)) return false
    taken.add(q.id)
    words.add(`${q.k}|${q.w}`)
    picked.push(q)
    return true
  }
  const fresh = (q) => !taken.has(q.id) && !words.has(`${q.k}|${q.w}`)

  if (weak.size) {
    const target = Math.min(Math.ceil(config.count * 0.4), usable.length)
    for (const q of shuffle(usable.filter((x) => weak.has(x.r)))) {
      if (picked.length >= target) break
      if (fresh(q)) take(q)
    }
  }
  const pool = shuffle(usable)
  for (const q of pool) if (picked.length < config.count && fresh(q)) take(q)
  for (const q of pool) if (picked.length < config.count) take(q)
  // une banque plus petite que le quiz : on la reprend depuis le début
  while (picked.length < config.count) picked.push(pool[picked.length % pool.length])

  const types = config.answerTypes
  return shuffle(picked.slice(0, config.count)).map((q, i) =>
    prepare(q, types[(i + Math.floor(Math.random() * types.length)) % types.length]),
  )
}

// ---- Libellés -------------------------------------------------------------------------------------------

export const accordTitle = (item) => (item.k === 'f' ? 'Au féminin' : 'Au pluriel')
export const accordTag = (item) => (item.n === 'adj' ? 'adjectif' : 'nom')
export const accordHelp = (item) => {
  const form = item.k === 'f' ? 'au féminin' : 'au pluriel'
  return item.at === 'qcm_form' ? `Choisis le mot ${form}.` : `Écris le mot ${form}.`
}
export const accordParts = (item) => ({ lead: item.pre, stem: '', tail: item.post, ending: false })

export function explainAccord(item) {
  const rule = RULES[item.r]
  if (!rule) return null
  return item.w === item.a ? rule.text : `${item.w} → ${item.a} : ${rule.text}`
}

// Une erreur à revoir : la phrase en entier, la réponse de l'élève barrée et la bonne forme
export function accordMistake(m) {
  const skill = m.k === 'f' ? 'Féminin' : 'Pluriel'
  return {
    key: `${m.id}-${m.given}`,
    lead: m.pre,
    tail: m.post,
    given: m.given,
    right: m.a,
    pills: [`${skill} · ${m.n === 'adj' ? 'adjectif' : 'nom'}`, RULES[m.r]?.short].filter(Boolean),
  }
}

export function accordSummary(config) {
  const skills = SKILLS.filter((s) => config.skills.includes(s.id))
  const head = skills.length === 2 ? 'Féminin et pluriel' : skills[0]?.label ?? 'Féminin et pluriel'
  const natures = NATURES.filter((n) => config.natures.includes(n.id)).map((n) => n.label.toLowerCase())
  return `${head} · ${natures.join(', ')} · ${config.count} questions`
}
