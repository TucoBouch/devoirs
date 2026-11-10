// Construit la banque de l'exercice « Féminin et pluriel » (src/data/accords.json) à partir des phrases écrites
// à la main dans scripts/accords/*.txt, puis contrôle chaque phrase.
//
// Format d'un fichier de phrases :
//   == f nom                une section : f (féminin) ou p (pluriel), puis nom ou adj
//   Sa {voisin>voisine} lui a souri.
//                           {mot de départ>réponse} (ou {mot} s'il ne change pas) marque la place du mot à transformer : l'élève voit « (voisin) »
//                           et doit écrire « voisine ». Le mot de départ est celui de la phrase au singulier
//                           (au masculin pour le féminin, au genre de la phrase pour le pluriel).
// La règle (+ e, -al → -aux…) est reconnue d'après les deux mots ; si aucune ne convient, le script s'arrête.
// Lancer : node scripts/build-accords.mjs      (DRY=1 : contrôle sans écrire ; LIST=1 : liste des mots par règle)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { classifyFeminine, classifyPlural, distractors } from './accord-engine.mjs'
import { RULES } from '../src/lib/accord-rules.js'

const NBSP = ' '
const typo = (s) =>
  s.replace(/'/g, '’').replace(/\.\.\./g, '…').replace(/ ([?!:;»])/g, `${NBSP}$1`).replace(/« /g, `«${NBSP}`)

const SECTIONS = { 'f nom': ['f', 'nom'], 'f adj': ['f', 'adj'], 'p nom': ['p', 'nom'], 'p adj': ['p', 'adj'] }
const MAX_LEN = 88 // pour que la phrase et le clavier de l'app tiennent ensemble en paysage
const MAX_REPEAT = 3

const tokensOf = (s) => s.toLowerCase().split(/[^a-zàâäçéèêëîïôöùûüÿœ]+/).filter(Boolean)
const FEM_CUES = new Set(['une', 'la', 'ma', 'ta', 'sa', 'cette', 'elle', 'celle', 'madame', 'mademoiselle', 'quelle',
  'petite', 'grande', 'nouvelle', 'vieille', 'belle', 'meilleure', 'seule', 'première', 'dernière', 'sœur', 'mère', 'fille'])
const MASC_SING = new Set(['un', 'le', 'mon', 'ton', 'son', 'ce', 'cet', 'du', 'au'])
const PLURAL_CUES = new Set([
  'les', 'des', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'plusieurs', 'quelques', 'ils', 'elles', 'nous', 'vous',
  'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'vingt', 'cent', 'mille',
  'tous', 'toutes', 'mesdames', 'certains', 'certaines', 'autres', 'beaucoup', 'tant', 'enfants', 'amis',
])
const SINGULAR_DET = new Set([
  'un', 'une', 'le', 'la', 'l', 'ce', 'cet', 'cette', 'mon', 'ma', 'ton', 'ta', 'son', 'sa', 'notre', 'votre', 'chaque', 'du', 'au',
])

const errors = []
const warnings = []
const items = []
const seenText = new Map()
const seenWord = new Map()

const files = readdirSync(new URL('./accords/', import.meta.url)).filter((f) => f.endsWith('.txt')).sort()
for (const file of files) {
  const lines = readFileSync(new URL(`./accords/${file}`, import.meta.url), 'utf8').split('\n')
  let section = null
  lines.forEach((raw, i) => {
    const where = `${file}:${i + 1}`
    const line = raw.trim()
    if (!line || line.startsWith('//')) return
    if (line.startsWith('== ')) {
      section = SECTIONS[line.slice(3).trim()]
      if (!section) errors.push(`${where} section inconnue : ${line}`)
      return
    }
    if (!section) return errors.push(`${where} phrase avant toute section : ${line}`)
    const [k, n] = section
    const m = /^(.*)\{([^>{}]+)(?:>([^>{}]+))?\}(.*)$/.exec(line)
    if (!m || line.split('{').length !== 2) return errors.push(`${where} il faut exactement un {mot>réponse} : ${line}`)
    const base = m[2].trim()
    const a = (m[3] ?? m[2]).trim() // {souris} : le mot ne change pas
    const pre = typo(m[1])
    const post = typo(m[4])
    const text = `${pre}[${a}]${post}`
    const label = `${where} ${base}>${a}`

    const r = k === 'f' ? classifyFeminine(base, a) : classifyPlural(base, a)
    if (!r) errors.push(`${label} aucune règle ne relie ces deux mots (faute de frappe, ou exception à déclarer) : ${text}`)

    // Mise en forme
    if (!/^[A-ZÀÂÉÈÊÎÔÛÇ«]/.test(pre.trim())) errors.push(`${label} majuscule manquante : ${text}`)
    if (pre.trim().length < 2) errors.push(`${label} le trou ne doit pas ouvrir la phrase : ${text}`)
    if (!/[\s’]$/.test(pre)) errors.push(`${label} il faut un espace avant le trou : ${text}`)
    if (!/^[\s.,;:!?…»)]/.test(post)) errors.push(`${label} il faut un espace après le trou : ${text}`)
    if (!/[.!?…»]$/.test(post.trim())) errors.push(`${label} ponctuation finale manquante : ${text}`)
    if (/\s{2,}/.test(pre.replace(/ /g, ' ')) || /\s{2,}/.test(post.replace(/ /g, ' '))) errors.push(`${label} espaces doubles : ${text}`)
    const length = pre.length + post.length + a.length
    if (length > MAX_LEN) errors.push(`${label} phrase trop longue (${length} > ${MAX_LEN}) : ${text}`)
    const key = (pre + '_' + post).toLowerCase()
    if (seenText.has(key)) errors.push(`${label} doublon de ${seenText.get(key)} : ${text}`)
    seenText.set(key, where)
    const wk = `${k}|${base}`
    seenWord.set(wk, (seenWord.get(wk) ?? 0) + 1)
    if (seenWord.get(wk) > MAX_REPEAT) errors.push(`${label} « ${base} » est déjà utilisé ${MAX_REPEAT} fois en ${k}`)

    // Élision et liaison devant le trou : l'actrice, mon amie, cet homme
    const vowel = /^[aeiouyhéèêëâîïôûùœ]/i.test(a)
    if (vowel && /(^|[\s«])(la|le|ma|ta|sa|ce)\s$/i.test(pre)) {
      errors.push(`${label} élision ou liaison manquante (« ${pre.trim().split(/\s+/).pop()} » devant « ${a} ») : ${text}`)
    }
    if (!vowel && /(^|[\s«])(l|d|j|n|qu)’$/i.test(pre)) errors.push(`${label} élision devant une consonne : ${text}`)

    // Le genre ou le nombre doivent se lire dans la phrase
    const before = tokensOf(pre)
    const all = tokensOf(pre + ' ' + post)
    const lastToken = before[before.length - 1]
    if (k === 'f') {
      if (n === 'nom' && MASC_SING.has(lastToken)) errors.push(`${label} un déterminant masculin devant le trou : ${text}`)
      if (!all.some((t) => FEM_CUES.has(t))) warnings.push(`${label} rien n'indique le féminin : ${text}`)
      if (r === 'f_same' && !before.slice(-3).some((t) => FEM_CUES.has(t)) && !all.includes('elle')) {
        warnings.push(`${label} mot invariable : le féminin doit se lire juste avant le trou : ${text}`)
      }
    } else {
      if (n === 'nom' && SINGULAR_DET.has(lastToken)) errors.push(`${label} un déterminant singulier devant le trou : ${text}`)
      if (!all.some((t) => PLURAL_CUES.has(t)) && !/s[\s.,;:!?…»]/.test(post.slice(0, 40))) {
        warnings.push(`${label} rien n'indique le pluriel : ${text}`)
      }
    }
    items.push({ k, n, w: base, a, r, pre, post })
  })
}

// ---- Propositions du choix multiple ---------------------------------------------------------------------
const out = items.map((q, i) => {
  const d = distractors(q.k, q.w, q.a, i % 2 === 1, q.n, q.r)
  if (d.length < 3) errors.push(`${q.w}>${q.a} : seulement ${d.length} piège(s) trouvé(s)`)
  return { id: i + 1, k: q.k, n: q.n, w: q.w, a: q.a, r: q.r, pre: q.pre, post: q.post, d }
})

// ---- Rapport ------------------------------------------------------------------------------------------
const count = (list, f) => list.reduce((acc, q) => ((acc[f(q)] = (acc[f(q)] ?? 0) + 1), acc), {})
console.log(`total : ${out.length} phrases`)
console.log('par section :', count(out, (q) => `${q.k} ${q.n}`))
for (const k of ['f', 'p']) {
  console.log(`règles ${k} :`, count(out.filter((q) => q.k === k), (q) => q.r))
}
const longest = out.reduce((a, q) => Math.max(a, q.pre.length + q.post.length + q.a.length), 0)
console.log(`phrase la plus longue : ${longest} caractères`)
const same = out.filter((q) => q.k === 'f' && q.w === q.a).length
console.log(`féminins identiques au masculin : ${same}`)
const unused = Object.keys(RULES).filter((id) => !out.some((q) => q.r === id))
if (unused.length) console.log('règles sans phrase :', unused.join(', '))
if (process.env.LIST) {
  const byRule = {}
  for (const q of out) (byRule[q.r] ??= []).push(`${q.w}>${q.a}`)
  for (const [r, list] of Object.entries(byRule)) console.log(`\n${r} (${list.length}) : ${list.join(', ')}`)
}
if (process.env.DIST) {
  const seen = {}
  for (const q of out) {
    seen[q.r] = (seen[q.r] ?? 0) + 1
    if (seen[q.r] <= 3) console.log(`${q.r.padEnd(10)} ${q.w} → ${q.a}   ✗ ${q.d.join(' · ')}`)
  }
}
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
  new URL('../src/data/accords.json', import.meta.url),
  '[\n' + out.map((q) => JSON.stringify(q)).join(',\n') + '\n]\n',
)
console.log('\nsrc/data/accords.json écrit.')
