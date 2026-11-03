// Construit la banque de questions (src/data/questions.json) à partir des phrases écrites à la main
// dans scripts/phrases/*.txt, puis contrôle chaque phrase (personne, élision, accords, doublons).
//
// Format d'un fichier de phrases :
//   # avoir                 un verbe (infinitif)
//   == pres                 un temps : pres, pc, imp, fut, ps
//   3f Elle {} un secret.   la personne (1 à 6, suivie de "f" si le sujet est féminin), puis la phrase ;
//                           {} marque la place du verbe conjugué, le sujet reste écrit juste avant
// Lancer : node scripts/build-questions.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { getVerb, conjugate, needsAgreement, IRREGULAR_VERBS } from '../src/lib/conjugation.js'

const TENSES = { pres: 'present', pc: 'passe_compose', imp: 'imparfait', fut: 'futur', ps: 'passe_simple' }
const NBSP = ' '
const typo = (s) =>
  s.replace(/'/g, '’').replace(/\.\.\./g, '…').replace(/ ([?!:;»])/g, `${NBSP}$1`).replace(/« /g, `«${NBSP}`)

const errors = []
const warnings = []
const questions = []
const seen = new Map()

const files = readdirSync(new URL('./phrases/', import.meta.url)).filter((f) => f.endsWith('.txt')).sort()
for (const file of files) {
  const lines = readFileSync(new URL(`./phrases/${file}`, import.meta.url), 'utf8').split('\n')
  let verb = null
  let tense = null
  lines.forEach((raw, i) => {
    const where = `${file}:${i + 1}`
    const line = raw.trim()
    if (!line || line.startsWith('//')) return
    if (line.startsWith('# ')) {
      verb = getVerb(line.slice(2).trim())
      tense = null
      if (!verb) errors.push(`${where} verbe inconnu : ${line}`)
      return
    }
    if (line.startsWith('== ')) {
      tense = TENSES[line.slice(3).trim()]
      if (!tense) errors.push(`${where} temps inconnu : ${line}`)
      return
    }
    const m = /^([1-6])(f?) (.+)$/.exec(line)
    if (!m || !verb || !tense) return errors.push(`${where} ligne illisible : ${line}`)
    const p = Number(m[1]) - 1
    const g = m[2] ? 'f' : 'm'
    const text = typo(m[3])
    const parts = text.split('{}')
    if (parts.length !== 2) return errors.push(`${where} il faut exactement un {} : ${line}`)
    const [pre, post] = parts
    const a = conjugate(verb, tense, p, g)
    const label = `${where} ${verb.inf}/${tense}/${p + 1}`

    // Sujet : la dernière proposition avant le verbe doit contenir le bon pronom
    const clause = pre.split(/[,;:.!?«»—()…]/).pop().toLowerCase()
    const tokens = clause.split(/[^a-zàâäçéèêëîïôöùûüÿœ]+/).filter(Boolean)
    const subjects = [['je', 'j'], ['tu'], [], ['nous'], ['vous'], []]
    const others = ['je', 'j', 'tu', 'nous', 'vous']
    if (subjects[p].length && !subjects[p].some((s) => tokens.includes(s))) {
      errors.push(`${label} le sujet « ${subjects[p].join('/')} » manque avant le trou : ${text}`)
    }
    if (!subjects[p].length && tokens.some((t) => others.includes(t))) {
      warnings.push(`${label} pronom suspect avant le trou (complément ?) : ${text}`)
    }
    // Élision : j'ai / je vais, n'est / ne va, l'a / le fait…
    const startsVowel = /^[aeiouyéèêâîôûh]/i.test(a)
    const tail = pre.slice(-4)
    if (/[jnlmtsdc]’$|qu’$/i.test(pre) && !startsVowel) errors.push(`${label} élision devant une consonne : ${text}`)
    if (/(^|[\s«])(je|ne|le|la|me|te|se|ce|de|que)\s$/i.test(pre) && startsVowel) {
      errors.push(`${label} élision manquante (${tail.trim()} + ${a}) : ${text}`)
    }
    // Passé composé : le verbe et son auxiliaire restent côte à côte, sans objet placé avant
    if (tense === 'passe_compose') {
      if (/(^|\s)n(e|’)\s?$/i.test(pre)) errors.push(`${label} négation impossible au passé composé : ${text}`)
      if (needsAgreement(verb, tense) && [0, 1, 3, 4].includes(p)) warnings.push(`${label} accord à vérifier : ${text}`)
      if (!needsAgreement(verb, tense) && /(^|\s)(l’|les|la|le|que|qu’)\s?/i.test(pre.split(/[,;:.!?«»—()…]/).pop().trim().split(/\s+/).slice(1).join(' ') + ' ')) {
        warnings.push(`${label} objet avant le participe ? : ${text}`)
      }
    }
    // Mise en forme
    if (/\s{2,}/.test(text.replace(/ /g, ' '))) errors.push(`${label} espaces doubles : ${text}`)
    if (!/[.!?…»]$/.test(post.trim())) errors.push(`${label} ponctuation finale manquante : ${text}`)
    if (!/^[A-ZÀÂÉÈÊÎÔÛÇ«]/.test(pre.trim())) errors.push(`${label} majuscule manquante : ${text}`)
    if (!/[\s’]$/.test(pre)) errors.push(`${label} il faut un espace avant le trou : ${text}`)
    if (!/^[\s.,;:!?…»]/.test(post)) errors.push(`${label} il faut un espace après le trou : ${text}`)
    const key = (pre + post).toLowerCase()
    if (seen.has(key)) errors.push(`${label} doublon de ${seen.get(key)} : ${text}`)
    seen.set(key, where)
    questions.push({ v: verb.inf, t: tense, p, g, a, pre, post })
  })
}

const out = questions.map((q, i) => ({ id: i + 1, ...q }))

// ---- Rapport ------------------------------------------------------------------------------
const count = (f) => out.reduce((acc, q) => ((acc[f(q)] = (acc[f(q)] ?? 0) + 1), acc), {})
console.log(`total : ${out.length} phrases`)
console.log('par temps :', count((q) => q.t))
console.log('par personne :', count((q) => q.p + 1))
const byVerb = count((q) => q.v)
console.log('par verbe :', Object.entries(byVerb).map(([v, n]) => `${v} ${n}`).join(', '))
const irregular = out.filter((q) => IRREGULAR_VERBS.includes(q.v)).length
console.log(`verbes irréguliers : ${irregular} phrases`)
const missing = []
for (const v of Object.keys(byVerb)) {
  for (const t of Object.values(TENSES)) {
    const n = out.filter((q) => q.v === v && q.t === t).length
    if (n < 6) missing.push(`${v}/${t} (${n})`)
  }
}
if (missing.length) console.log('moins de 6 phrases :', missing.join(', '))
if (warnings.length) console.log(`\n${warnings.length} à relire :\n` + warnings.join('\n'))
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) :\n` + errors.join('\n'))
  process.exit(1)
}
if (process.env.DRY) {
  console.log('\n(essai à blanc : rien d’écrit)')
  process.exit(0)
}
writeFileSync(
  new URL('../src/data/questions.json', import.meta.url),
  '[\n' + out.map((q) => JSON.stringify(q)).join(',\n') + '\n]\n',
)
console.log('\nsrc/data/questions.json écrit.')
