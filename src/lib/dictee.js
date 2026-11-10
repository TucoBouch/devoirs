// L'exercice « Dictée » : choix d'un texte dans la banque, découpage en groupes de mots pour la lecture,
// correction mot à mot tolérante (majuscules, ponctuation, option pour les accents).
import bank from '../data/dictees.json'
import { normalize } from './conjugation.js'

export const LENGTHS = [
  { value: 1, label: '1 phrase' },
  { value: 2, label: '2 phrases' },
  { value: 3, label: '3 phrases' },
]
export const ACCENT_MODES = [
  { id: 'strict', label: 'Accents exigés', hint: 'Un accent oublié ou faux est une faute' },
  { id: 'tolerant', label: 'Accents tolérés', hint: 'Un accent oublié est compté juste, avec une remarque' },
]
export const READ_MODES = [
  { id: 'groups', label: 'Par groupes de mots', hint: 'Comme en classe : en entier, puis groupe par groupe, puis en entier' },
  { id: 'whole', label: 'En une seule fois', hint: 'La dictée est lue en entier, autant de fois que tu veux' },
]
// Vitesse de la voix : la plage utile de la synthèse de l'iPad est étroite (0,9 et 0,6 sonnent presque pareil)
export const SPEEDS = [
  { value: 'normal', label: 'Normale', rate: 0.9 },
  { value: 'slow', label: 'Lente', rate: 0.5 },
  { value: 'slower', label: 'Très lente', rate: 0.3 },
]
export const rateOf = (speed) => SPEEDS.find((s) => s.value === speed)?.rate ?? 0.9

export const defaultDictees = () => ({
  tenses: ['present'],
  maxSentences: 3,
  accents: 'strict',
  mode: 'groups',
  speed: 'slow',
  voice: '',
  punct: false,
  seen: [], // dictées déjà posées : on n'en repose pas une avant d'avoir fait le tour
})

export const MAX_SEEN = 3000

// ---- Choix de la dictée ------------------------------------------------------------------------------

export const poolFor = (config) => bank.filter((d) => config.tenses.includes(d.t) && d.n <= config.maxSentences)

export function pickDictee(config) {
  const pool = poolFor(config)
  if (!pool.length) return null
  const seen = new Set(config.seen)
  const fresh = pool.filter((d) => !seen.has(d.id))
  const list = fresh.length ? fresh : pool // tout a été vu : on recommence
  return list[Math.floor(Math.random() * list.length)]
}

// ---- Lecture par groupes -----------------------------------------------------------------------------

// Mots devant lesquels on peut couper un groupe trop long
const BREAK_BEFORE = new Set([
  'de', 'du', 'des', 'à', 'au', 'aux', 'dans', 'sur', 'sous', 'avec', 'pour', 'par', 'et', 'ou', 'mais', 'qui', 'que', 'où',
  'quand', 'car', 'puis', 'pendant', 'vers', 'comme', 'sans', 'en', 'devant', 'derrière', 'entre', 'jusqu\'à', 'depuis',
])
// Un mot qui appelle son complément : on ne coupe pas juste après (« près | du ruisseau »)
const NO_BREAK_AFTER = new Set([
  'près', 'loin', 'autour', 'face', 'côté', 'bord', 'pied', 'milieu', 'haut', 'bas', 'dessus', 'dessous', 'travers', 'long',
  'cause', 'force', 'bout', 'fond', 'cœur', 'sommet', 'quelques', 'beaucoup', 'plein', 'peu', 'assez', 'trop',
])
const GROUP_MAX = 7

function splitLong(words) {
  const parts = Math.ceil(words.length / 5)
  const size = words.length / parts
  const cuts = []
  for (let k = 1; k < parts; k++) {
    const ideal = Math.round(k * size)
    let best = ideal
    for (let d = 0; d <= 2; d++) {
      const spot = [ideal - d, ideal + d].find((i) => i > (cuts.at(-1) ?? 0) + 1 && i < words.length - 1 && BREAK_BEFORE.has(words[i].toLowerCase()) && !NO_BREAK_AFTER.has(words[i - 1].toLowerCase().replace(/[,;.]$/, '')))
      if (spot) { best = spot; break }
    }
    cuts.push(best)
  }
  const out = []
  let from = 0
  for (const c of [...cuts, words.length]) { out.push(words.slice(from, c).join(' ')); from = c }
  return out
}

// Les groupes que l'on dicte : on coupe aux virgules et aux points, puis les segments trop longs en morceaux de 4 à 6 mots
export function groupsOf(text) {
  const clean = text.replace(/[  ]/g, ' ')
  const chunks = (clean.match(/[^,;.!?…:]+[,;.!?…:]?/g) ?? [clean]).map((s) => s.trim()).filter(Boolean)
  const out = []
  for (const chunk of chunks) {
    const words = chunk.split(/\s+/)
    if (words.length <= GROUP_MAX) out.push(chunk)
    else out.push(...splitLong(words))
  }
  // un mot seul est rattaché au groupe suivant (« Soudain, » + la suite)
  const merged = []
  for (let i = 0; i < out.length; i++) {
    if (out[i].split(/\s+/).length === 1 && i < out.length - 1 && !/[.!?…]$/.test(out[i])) {
      merged.push(`${out[i]} ${out[i + 1]}`)
      i++
    } else merged.push(out[i])
  }
  return merged
}

// À voix haute, comme le maître : « virgule », « point »
export function withPunctuation(group) {
  return group
    .replace(/,/g, ' virgule')
    .replace(/;/g, ' point-virgule')
    .replace(/:/g, ' deux-points')
    .replace(/\.$/, ' point')
    .replace(/\?$/, ' point d’interrogation')
    .replace(/!$/, ' point d’exclamation')
    .replace(/…$/, ' points de suspension')
}

// ---- Correction --------------------------------------------------------------------------------------

const PUNCT = /[.,;:!?…«»"“”()—–]/g
// Texte à plat : espaces insécables en espaces, apostrophes droites, et une espace après la ponctuation collée au mot suivant
// (« soir,les » vaut « soir, les ») : les espaces autour de la ponctuation ne sont jamais des fautes.
const flat = (s) => s
  .replace(/[\u00a0\u202f\u2009]/g, ' ')
  .replace(/[’‘`]/g, "'")
  .replace(/([.,;:!?…])(?=\p{L})/gu, '$1 ')

// Un mot : ce qu'on a écrit (raw) et ce qui sert à comparer (key : sans ponctuation, sans majuscules, accents au choix)
function tokens(text, strict) {
  return flat(text).split(/\s+/).filter(Boolean).map((raw) => {
    const bare = raw.replace(PUNCT, '')
    return { raw, bare, key: strict ? bare.toLowerCase() : normalize(bare) }
  }).filter((t) => /[\p{L}\d]/u.test(t.key))
}

// « soir là » écrit pour « soir-là » : le trait d'union oublié est toléré, comme la ponctuation
function mergeHyphens(given, expected) {
  const hyphenated = new Set(expected.filter((t) => t.key.includes('-')).map((t) => t.key))
  if (!hyphenated.size) return given
  const out = []
  for (let i = 0; i < given.length; i++) {
    const next = given[i + 1]
    if (next && hyphenated.has(`${given[i].key}-${next.key}`)) {
      out.push({ raw: `${given[i].raw}-${next.raw}`, bare: `${given[i].bare}-${next.bare}`, key: `${given[i].key}-${next.key}` })
      i++
    } else out.push(given[i])
  }
  return out
}

// Alignement mot à mot (distance d'édition sur les mots) : mot juste, mot faux, oubli, mot en trop
function align(exp, got) {
  const n = exp.length
  const m = got.length
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  const same = (i, j) => exp[i - 1].key === got[j - 1].key
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (same(i, j) ? 0 : 1))
    }
  }
  const ops = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (same(i, j) ? 0 : 1)) {
      ops.push(same(i, j) ? { kind: 'ok', word: exp[i - 1], given: got[j - 1] } : { kind: 'wrong', word: exp[i - 1], given: got[j - 1] })
      i--; j--
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      ops.push({ kind: 'missing', word: exp[i - 1] })
      i--
    } else {
      ops.push({ kind: 'extra', given: got[j - 1] })
      j--
    }
  }
  return ops.reverse()
}

// Corrige une dictée. strict : les accents comptent. Rend les mots dans l'ordre, avec leur état,
// le nombre de mots justes (right), de mots attendus (total) et d'accents oubliés mais tolérés (accents).
export function correctDictee(text, given, { strict = true } = {}) {
  const expected = tokens(text, strict)
  const written = mergeHyphens(tokens(given, strict), expected)
  const ops = align(expected, written)
  let accents = 0
  for (const op of ops) {
    // juste « aux accents près » : on le signale sans le compter faux
    if (op.kind === 'ok' && !strict && op.word.bare.toLowerCase() !== op.given.bare.toLowerCase()) { op.accent = true; accents++ }
  }
  const right = ops.filter((o) => o.kind === 'ok').length
  return { ops, total: expected.length, right, faults: ops.length - right, accents }
}

export function dicteeSummary(entry) {
  const d = entry.dictee
  const tense = { present: 'Présent', passe_compose: 'Passé composé', imparfait: 'Imparfait', futur: 'Futur', passe_simple: 'Passé simple' }[d?.t] ?? ''
  const n = d?.n ?? 1
  return `Dictée · ${tense} · ${n} phrase${n > 1 ? 's' : ''}${entry.config?.accents === 'tolerant' ? ' · accents tolérés' : ''}`
}
