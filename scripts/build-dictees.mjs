// Construit la banque de l'exercice « Dictée » (src/data/dictees.json) à partir des textes écrits à la main
// dans scripts/dictees/*.txt, puis contrôle chaque dictée (orthographe, structure, temps).
//
// Format d'un fichier :
//   == pres                 le temps de la dictée : pres, pc, imp, fut, ps
//   Phrase un. Phrase deux. une dictée par ligne, de 1 à 3 phrases
// Lancer : node scripts/build-dictees.mjs      (DRY=1 : contrôle sans écrire ; SHOW=1 : affiche les dictées)
//
// Le contrôle d'orthographe utilise le dictionnaire français de Hunspell (devDependencies : nspell, dictionary-fr).
// Il sert uniquement à la construction : rien de tout cela n'est embarqué dans l'app.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import nspell from 'nspell'
import dictionary from 'dictionary-fr'
import { VERBS } from '../src/lib/conjugation.js'

const TENSES = { pres: 'present', pc: 'passe_compose', imp: 'imparfait', fut: 'futur', ps: 'passe_simple' }
const NBSP = ' '
const MAX_WORDS = 55
const MAX_SENTENCE_WORDS = 22
const MIN_WORDS = 6

const typo = (s) =>
  s.replace(/'/g, '’').replace(/\.\.\./g, '…').replace(/ ([?!:;»])/g, `${NBSP}$1`).replace(/« /g, `«${NBSP}`)

// Un identifiant qui ne change pas tant que le texte ne change pas : l'app s'en sert pour ne pas répéter une dictée
function hash(s) {
  let h = 0x811c9dc5
  for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(36).padStart(7, '0')
}

// ---- Orthographe -------------------------------------------------------------------------------------
const speller = nspell(dictionary)
// Prénoms et mots du récit que le dictionnaire ne connaît pas
const NAMES = [
  'Léa', 'Tom', 'Maya', 'Inès', 'Samir', 'Zoé', 'Mamie', 'Papi', 'Papa', 'Maman', 'Hugo', 'Lina', 'Max', 'Nora', 'Clara', 'Noé',
  'Jules', 'Camille', 'Yanis', 'Eliott', 'Sofia', 'Lucas', 'Manon', 'Théo', 'Emma', 'Louis', 'Chloé', 'Nathan', 'Jade', 'Ethan',
  'Lola', 'Adam', 'Mia', 'Gabriel', 'Alice', 'Arthur', 'Rose', 'Basile', 'Émile', 'Célia', 'Sacha', 'Mathis', 'Anna', 'Leïla',
  'Karim', 'Ilyes', 'Margot', 'Axel', 'Lou', 'Éva', 'Nina', 'Rémi', 'Alix', 'Iris', 'Malo', 'Océane', 'Tessa', 'Victor', 'Yasmine',
  'Bretagne', 'Provence', 'Marseille', 'Lyon', 'Paris', 'Cévennes', 'Alpes', 'Pyrénées', 'Atlantique', 'Méditerranée', 'Seine',
  'Loire', 'Brocéliande', 'Madagascar', 'Sahara', 'Amazonie', 'Islande', 'Écosse', 'Italie', 'Espagne', 'Afrique', 'Asie',
  'Mars', 'Jupiter', 'Saturne', 'Vénus', 'Neptune', 'Chambord', 'Dupré', 'Mirolo', 'Aldar', 'Lenoir', 'Zéphyr', 'Aubin', 'Graal', 'Orion', 'Mirabel', 'Orphée', 'Galba', 'Bellevue', 'Albert', 'Bastien', 'Aurore', 'Lancelot', 'Merlin', 'Arthur', 'Versailles', 'Normandie', 'Corse', 'Auvergne', 'Alsace', 'Vosges', 'Jura',
]
for (const w of NAMES) speller.add(w)
const wordsOf = (text) => text.replace(/[’‘]/g, "'").match(/[\p{L}]+(?:['-][\p{L}]+)*/gu) ?? []
function misspelled(text) {
  const bad = []
  for (const w of wordsOf(text)) {
    if (speller.correct(w) || speller.correct(w.toLowerCase())) continue
    // élision devant un nom propre ajouté à la main (d'Aldar, l'Atlantique)
    const elided = /^(l|d|j|m|t|s|n|c|qu|jusqu|lorsqu|puisqu)'(.+)$/i.exec(w)
    if (elided && (speller.correct(elided[2]) || speller.correct(elided[2].toLowerCase()))) continue
    // mot composé : chaque morceau doit exister (ce soir-là, grand-père)
    const parts = w.split('-')
    if (parts.length > 1 && parts.every((p) => speller.correct(p) || speller.correct(p.toLowerCase()))) continue
    bad.push(w)
  }
  return bad
}

// ---- Reconnaissance du temps (aide à la relecture, ne bloque rien) -----------------------------------
const formSets = { present: new Set(), imparfait: new Set(), futur: new Set(), passe_simple: new Set() }
const ppSet = new Set()
for (const v of VERBS) {
  for (const t of Object.keys(formSets)) for (const f of v[t]) formSets[t].add(f)
  for (const s of ['', 'e', 's', 'es']) ppSet.add(v.pp + s)
}
const AUX = new Set(['ai', 'as', 'a', 'avons', 'avez', 'ont', 'suis', 'es', 'est', 'sommes', 'êtes', 'sont'])
// mots qui ressemblent à un participe passé sans en être un
const NOT_PP = new Set(['plus', 'tous', 'nous', 'vous', 'sous', 'lui', 'ici', 'ainsi', 'aussi', 'puis', 'depuis', 'que', 'qui', 'quelque', 'une', 'vie', 'rue', 'mue', 'nue', 'bleu'])
const PP_END = /(é|ée|és|ées|u|ue|us|ues|is|ise|ises|it|ite|ites|i|ie|ies|ert|erte|erts|ertes)$/
// Terminaisons qui trahissent un temps : suffisent à reconnaître un verbe hors des 42 verbes du moteur
const ENDINGS = {
  imparfait: /(ait|aient|ions|iez)$/,
  futur: /(erai|eras|era|erons|erez|eront|irons|iront|drai|dras|dra|drons|drez|dront|rons|ront)$/,
  passe_simple: /(èrent|irent|urent|âmes|îmes|ûmes|[bcdfghjklmnpqstvwxz]a)$/, // « tira », « éclata » : 3e personne du 1er groupe
}
function tenseMarks(text) {
  const w = text.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)
  const count = { present: 0, passe_compose: 0, imparfait: 0, futur: 0, passe_simple: 0 }
  w.forEach((x, i) => {
    if (AUX.has(x) && [w[i + 1], w[i + 2]].some((n) => n && (ppSet.has(n) || (n.length > 2 && !NOT_PP.has(n) && PP_END.test(n))))) count.passe_compose++
    for (const t of ['imparfait', 'futur', 'passe_simple']) {
      if (formSets[t].has(x) || (x.length > 4 && ENDINGS[t].test(x))) count[t]++
    }
    if (formSets.present.has(x) && !AUX.has(x)) count.present++
  })
  return count
}
// Terminaisons qui n'appartiennent qu'à un seul temps (pour repérer un temps étranger dans une dictée)
const STRICT = {
  imparfait: /(ait|aient)$/,
  futur: /(erai|eras|erons|erez|eront|iront|irons)$/,
  // -èrent est sans équivoque ; -irent et -urent se confondent avec le présent (courent, éclairent) : on liste les formes
  passe_simple: /(?:èrent$|^(?:prirent|mirent|virent|firent|dirent|eurent|furent|voulurent|purent|surent|coururent|crurent|lurent|durent|vinrent|tinrent|reçurent|écrivirent|partirent|dormirent|ouvrirent|connurent)$)/,
}
// Mots qui finissent comme un temps sans en être un (ou qui sont du présent)
const STRICT_OK = new Set(['fait', 'sait', 'lait', 'trait', 'souhait', 'portrait', 'attrait', 'parfait', 'bienfait', 'retrait', 'forfait', 'distrait', 'extrait', 'abstrait', 'satisfait', 'contrefait', 'refait', 'défait'])
// Tournures du présent qui ne dérangent pas un autre temps
const PRESENT_OK = /\bil y a longtemps\b|\bc'est\b|\bpeut-être\b/i

// ---- Lecture des fichiers ----------------------------------------------------------------------------
const errors = []
const warnings = []
const items = []
const seen = new Map()

const files = readdirSync(new URL('./dictees/', import.meta.url)).filter((f) => f.endsWith('.txt')).sort()
for (const file of files) {
  const lines = readFileSync(new URL(`./dictees/${file}`, import.meta.url), 'utf8').split('\n')
  let tense = null
  lines.forEach((raw, i) => {
    const where = `${file}:${i + 1}`
    const line = raw.trim()
    if (!line || line.startsWith('//')) return
    if (line.startsWith('== ')) {
      tense = TENSES[line.slice(3).trim()]
      if (!tense) errors.push(`${where} temps inconnu : ${line}`)
      return
    }
    if (!tense) return errors.push(`${where} dictée avant tout temps : ${line}`)
    const text = typo(line)
    const label = `${where} (${tense})`

    const sentences = text.split(/(?<=[.!?…»])\s+/).filter(Boolean)
    const words = text.split(/\s+/).filter((x) => /[\p{L}\d]/u.test(x))
    if (sentences.length < 1 || sentences.length > 3) errors.push(`${label} ${sentences.length} phrases (1 à 3 attendues) : ${text}`)
    for (const s of sentences) {
      if (!/^[A-ZÀÂÉÈÊÎÔÛÇ«]/.test(s)) errors.push(`${label} phrase sans majuscule : ${s}`)
      if (!/[.!?…»]$/.test(s)) errors.push(`${label} phrase sans ponctuation finale : ${s}`)
      const n = s.split(/\s+/).filter((x) => /[\p{L}\d]/u.test(x)).length
      if (n > MAX_SENTENCE_WORDS) errors.push(`${label} phrase de ${n} mots (maximum ${MAX_SENTENCE_WORDS}) : ${s}`)
    }
    if (words.length > MAX_WORDS) errors.push(`${label} ${words.length} mots (maximum ${MAX_WORDS}) : ${text}`)
    if (words.length < MIN_WORDS) errors.push(`${label} seulement ${words.length} mots : ${text}`)
    if (/\s{2,}/.test(text.replace(/ /g, ' '))) errors.push(`${label} espaces doubles : ${text}`)
    if (/["“”]/.test(text)) errors.push(`${label} guillemets droits : utiliser « » : ${text}`)
    if (/\d/.test(text)) warnings.push(`${label} un chiffre dans le texte (à écrire en lettres ?) : ${text}`)

    const bad = misspelled(text)
    if (bad.length) errors.push(`${label} orthographe : ${bad.join(', ')} → ${text}`)

    const key = text.toLowerCase()
    if (seen.has(key)) errors.push(`${label} doublon de ${seen.get(key)}`)
    seen.set(key, where)

    // Le temps annoncé doit se lire dans le texte ; les autres temps ne doivent pas s'y trouver
    const marks = tenseMarks(text)
    if (tense !== 'present' && !marks[tense]) warnings.push(`${label} aucune marque du temps reconnue : ${text}`)
    if (tense !== 'present' && marks.present && !PRESENT_OK.test(text)) {
      warnings.push(`${label} forme du présent reconnue (${marks.present}) : ${text}`)
    }
    if (tense !== 'passe_compose' && marks.passe_compose) warnings.push(`${label} passé composé reconnu : ${text}`)
    // Une terminaison qui n'appartient qu'à un autre temps : « il contenait » dans une dictée au passé composé
    const lowered = text.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)
    for (const other of ['imparfait', 'futur', 'passe_simple']) {
      if (other === tense) continue
      const found = lowered.filter((w) => w.length > 4 && STRICT[other].test(w) && !STRICT_OK.has(w))
      if (found.length) warnings.push(`${label} forme d'un autre temps (${other}) : ${[...new Set(found)].join(', ')} → ${text}`)
    }

    items.push({ id: hash(`${tense}|${text}`), t: tense, n: sentences.length, w: words.length, text })
  })
}

// ---- Rapport -----------------------------------------------------------------------------------------
const count = (list, f) => list.reduce((acc, q) => ((acc[f(q)] = (acc[f(q)] ?? 0) + 1), acc), {})
console.log(`total : ${items.length} dictées`)
console.log('par temps :', count(items, (q) => q.t))
console.log('par longueur (phrases) :', count(items, (q) => q.n))
const wordsAvg = items.reduce((a, q) => a + q.w, 0) / (items.length || 1)
console.log(`mots : ${wordsAvg.toFixed(0)} en moyenne, de ${Math.min(...items.map((q) => q.w))} à ${Math.max(...items.map((q) => q.w))}`)
// Variété : les débuts de phrase et les mots de contenu qui reviennent trop souvent se voient ici
const STOP = new Set(('chaque quelques dans avec sans pour vers chez entre sous sur dont leur leurs elles ils elle nous vous cette comme mais alors ' +
  'aussi encore toute tous tout très plus moins même autre autres quand pendant avant après depuis puis donc ainsi ces ses son ' +
  'sont était étaient avait avaient avons avez font fait faire être avoir fut furent eut eurent sera seront aura auront ont est').split(' '))
const contentWords = {}
const openings = {}
for (const q of items) {
  for (const sentence of q.text.split(/(?<=[.!?…»])\s+/)) {
    const ws = sentence.replace(/[’']/g, ' ').toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)
    const key = ws.slice(0, 2).join(' ')
    openings[key] = (openings[key] ?? 0) + 1
  }
  for (const w of new Set(q.text.replace(/[’']/g, ' ').toLowerCase().split(/[^\p{L}]+/u))) {
    if (w.length >= 5 && !STOP.has(w)) contentWords[w] = (contentWords[w] ?? 0) + 1
  }
}
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${v}`).join(', ')
console.log('débuts de phrase les plus fréquents :', top(openings, 8))
console.log('mots les plus répétés (dictées contenant le mot) :', top(contentWords, 14))
const overused = Object.entries(contentWords).filter(([, n]) => n > Math.max(14, items.length * 0.05))
if (overused.length) warnings.push(`mots dans plus de 5 % des dictées : ${overused.map(([w, n]) => `${w} ${n}`).join(', ')}`)
const ids = new Set(items.map((q) => q.id))
if (ids.size !== items.length) errors.push('deux dictées ont le même identifiant')
if (process.env.SHOW) for (const q of items) console.log(`[${q.t} ${q.n}p ${q.w}m] ${q.text}`)
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
  new URL('../src/data/dictees.json', import.meta.url),
  '[\n' + items.map((q) => JSON.stringify(q)).join(',\n') + '\n]\n',
)
console.log('\nsrc/data/dictees.json écrit.')
