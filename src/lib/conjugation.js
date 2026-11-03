// Moteur de conjugaison : 42 verbes, 5 temps, 6 personnes.
// Les formes sont calculées à partir de règles (1er et 2e groupe) et de tables (3e groupe).

export const TENSES = [
  { id: 'present', label: 'Présent' },
  { id: 'passe_compose', label: 'Passé composé' },
  { id: 'imparfait', label: 'Imparfait' },
  { id: 'futur', label: 'Futur' },
  { id: 'passe_simple', label: 'Passé simple' },
]

export const tenseLabel = (id) => TENSES.find((t) => t.id === id)?.label ?? id

const IMP = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']
const FUT = ['ai', 'as', 'a', 'ons', 'ez', 'ont']
const PS = {
  a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
  i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
  in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'],
}
const AVOIR = ['ai', 'as', 'a', 'avons', 'avez', 'ont']
const ETRE = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']

// Verbes du 1er groupe : g = e muet devant a/o (manger), c = c cédille (commencer)
const GROUP1 = [
  ['parler'], ['chanter'], ['manger', { g: true }], ['jouer'], ['regarder'], ['aimer'],
  ['donner'], ['travailler'], ['commencer', { c: true }], ['trouver'], ['écouter'],
  ['arriver', { aux: 'être' }], ['tomber', { aux: 'être' }],
]
const GROUP2 = ['finir', 'choisir', 'grandir', 'réussir', 'remplir', 'réfléchir', 'obéir']

// Verbes du 3e groupe : présent, radical d'imparfait, radical de futur, passé simple, participe passé
const IRREGULAR = {
  avoir: { pres: AVOIR, imp: 'av', fut: 'aur', ps: ['e', 'u'], pp: 'eu' },
  être: { pres: ETRE, imp: 'ét', fut: 'ser', ps: ['f', 'u'], pp: 'été' },
  aller: { pres: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], imp: 'all', fut: 'ir', ps: ['all', 'a'], pp: 'allé', aux: 'être' },
  faire: { pres: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], imp: 'fais', fut: 'fer', ps: ['f', 'i'], pp: 'fait' },
  dire: { pres: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], imp: 'dis', fut: 'dir', ps: ['d', 'i'], pp: 'dit' },
  prendre: { pres: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], imp: 'pren', fut: 'prendr', ps: ['pr', 'i'], pp: 'pris' },
  pouvoir: { pres: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], imp: 'pouv', fut: 'pourr', ps: ['p', 'u'], pp: 'pu' },
  voir: { pres: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], imp: 'voy', fut: 'verr', ps: ['v', 'i'], pp: 'vu' },
  devoir: { pres: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'], imp: 'dev', fut: 'devr', ps: ['d', 'u'], pp: 'dû' },
  vouloir: { pres: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], imp: 'voul', fut: 'voudr', ps: ['voul', 'u'], pp: 'voulu' },
  venir: { pres: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], imp: 'ven', fut: 'viendr', ps: ['v', 'in'], pp: 'venu', aux: 'être' },
  partir: { pres: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'], imp: 'part', fut: 'partir', ps: ['part', 'i'], pp: 'parti', aux: 'être' },
  savoir: { pres: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'], imp: 'sav', fut: 'saur', ps: ['s', 'u'], pp: 'su' },
  mettre: { pres: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'], imp: 'mett', fut: 'mettr', ps: ['m', 'i'], pp: 'mis' },
  écrire: { pres: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'], imp: 'écriv', fut: 'écrir', ps: ['écriv', 'i'], pp: 'écrit' },
  lire: { pres: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'], imp: 'lis', fut: 'lir', ps: ['l', 'u'], pp: 'lu' },
  dormir: { pres: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'], imp: 'dorm', fut: 'dormir', ps: ['dorm', 'i'], pp: 'dormi' },
  courir: { pres: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'], imp: 'cour', fut: 'courr', ps: ['cour', 'u'], pp: 'couru' },
  ouvrir: { pres: ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'], imp: 'ouvr', fut: 'ouvrir', ps: ['ouvr', 'i'], pp: 'ouvert' },
  attendre: { pres: ['attends', 'attends', 'attend', 'attendons', 'attendez', 'attendent'], imp: 'attend', fut: 'attendr', ps: ['attend', 'i'], pp: 'attendu' },
  croire: { pres: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'], imp: 'croy', fut: 'croir', ps: ['cr', 'u'], pp: 'cru' },
  connaître: { pres: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'], imp: 'connaiss', fut: 'connaîtr', ps: ['conn', 'u'], pp: 'connu' },
}

// Les 12 verbes du programme, listés en premier ; les 30 autres sont des verbes usuels des trois groupes
export const ESSENTIAL = ['avoir', 'être', 'aller', 'faire', 'dire', 'parler', 'prendre', 'pouvoir', 'voir', 'finir', 'devoir', 'vouloir']

const addEnding = (stem, ending, spec) => {
  const soft = /^[aoâ]/.test(ending)
  if (spec.g && soft) return stem + 'e' + ending
  if (spec.c && soft) return stem.slice(0, -1) + 'ç' + ending
  return stem + ending
}

function buildGroup1(inf, spec = {}) {
  const stem = inf.slice(0, -2)
  const pres = ['e', 'es', 'e', 'ons', 'ez', 'ent'].map((e) => addEnding(stem, e, spec))
  return {
    inf, grp: 1, aux: spec.aux ?? 'avoir', pp: stem + 'é',
    present: pres,
    imparfait: IMP.map((e) => addEnding(stem, e, spec)),
    futur: FUT.map((e) => inf + e),
    passe_simple: PS.a.map((e) => (e === 'èrent' ? stem + e : addEnding(stem, e, spec))),
  }
}

function buildGroup2(inf) {
  const stem = inf.slice(0, -2)
  return {
    inf, grp: 2, aux: 'avoir', pp: stem + 'i',
    present: ['is', 'is', 'it', 'issons', 'issez', 'issent'].map((e) => stem + e),
    imparfait: IMP.map((e) => stem + 'iss' + e),
    futur: FUT.map((e) => inf + e),
    passe_simple: PS.i.map((e) => stem + e),
  }
}

function buildGroup3(inf, d) {
  return {
    inf, grp: 3, aux: d.aux ?? 'avoir', pp: d.pp,
    present: d.pres,
    imparfait: IMP.map((e) => d.imp + e),
    futur: FUT.map((e) => d.fut + e),
    passe_simple: PS[d.ps[1]].map((e) => d.ps[0] + e),
  }
}

const ALL = [
  ...Object.entries(IRREGULAR).map(([inf, d]) => buildGroup3(inf, d)),
  ...GROUP1.map(([inf, spec]) => buildGroup1(inf, spec)),
  ...GROUP2.map(buildGroup2),
]

export const VERBS = (() => {
  const rank = (v) => (ESSENTIAL.includes(v.inf) ? ESSENTIAL.indexOf(v.inf) : 100)
  return [...ALL].sort((a, b) => rank(a) - rank(b) || a.grp - b.grp || a.inf.localeCompare(b.inf, 'fr'))
})()

const BY_INF = Object.fromEntries(VERBS.map((v) => [v.inf, v]))
export const getVerb = (inf) => BY_INF[inf]

const isPlural = (p) => p >= 3

// Forme conjuguée sans pronom. gender : 'm' ou 'f' (n'a d'effet que pour être + participe passé)
export function conjugate(verb, tense, p, gender = 'm') {
  if (tense !== 'passe_compose') return verb[tense][p]
  const aux = (verb.aux === 'être' ? ETRE : AVOIR)[p]
  let pp = verb.pp
  if (verb.aux === 'être') pp += (gender === 'f' ? 'e' : '') + (isPlural(p) ? 's' : '')
  return `${aux} ${pp}`
}

export const needsAgreement = (verb, tense) => tense === 'passe_compose' && verb.aux === 'être'

// Pronom sujet affiché ("j'" devant une voyelle)
export function pronoun(p, gender, form) {
  if (p === 0) return /^[aeiouyéèêâîôû]/i.test(form) ? "j'" : 'je'
  if (p === 2) return gender === 'f' ? 'elle' : 'il'
  if (p === 5) return gender === 'f' ? 'elles' : 'ils'
  return ['je', 'tu', 'il', 'nous', 'vous', 'ils'][p]
}

// ---- Terminaisons ---------------------------------------------------------------

const END_CANDIDATES = {
  present: [['e', 's', 'x'], ['es', 's', 'x'], ['e', 't'], ['ons'], ['ez'], ['ent']],
  imparfait: [['ais'], ['ais'], ['ait'], ['ions'], ['iez'], ['aient']],
  futur: [['ai'], ['as'], ['a'], ['ons'], ['ez'], ['ont']],
  passe_simple: [
    ['ai', 'is', 'us', 'ins'], ['as', 'is', 'us', 'ins'], ['a', 'it', 'ut', 'int'],
    ['âmes', 'îmes', 'ûmes', 'înmes'], ['âtes', 'îtes', 'ûtes', 'întes'], ['èrent', 'irent', 'urent', 'inrent'],
  ],
}

// Découpe une forme en radical visible + terminaison à compléter, ou null si aucune terminaison nette
export function splitForm(verb, tense, p, gender = 'm') {
  const form = conjugate(verb, tense, p, gender)
  if (tense === 'passe_compose') {
    // Le radical garde l'auxiliaire ; la terminaison est celle du participe, accord compris
    const [aux, pp] = form.split(' ')
    const base = verb.pp
    return { stem: `${aux} ${base.slice(0, -1)}`, end: base.slice(-1) + pp.slice(base.length) }
  }
  const candidates = [...END_CANDIDATES[tense][p]].sort((a, b) => b.length - a.length)
  for (const end of candidates) {
    if (form.endsWith(end) && form.length > end.length) return { stem: form.slice(0, -end.length), end }
  }
  return null
}

const ENDING_POOL = {
  present: ['e', 'es', 's', 't', 'x', 'ent', 'ons', 'ez', 'ont', 'a'],
  imparfait: ['ais', 'ait', 'aient', 'ions', 'iez', 'ai', 'ons', 'ez', 'ant'],
  futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont', 'ais', 'ait', 'aient', 'rai', 'ra'],
  passe_simple: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent', 'is', 'it', 'irent', 'us', 'ut', 'urent', 'îmes', 'îtes', 'ûmes', 'ûtes', 'erent', 'ames', 'ates'],
  passe_compose: ['é', 'er', 'ée', 'és', 'ées', 'ez', 'i', 'is', 'it', 'ie', 'ies', 'u', 'us', 'ue', 'ues', 'ut', 's', 't', 'û'],
}

const SIMILAR = [
  ['é', 'er', 'ez', 'ée', 'és', 'ées'], ['ais', 'ait', 'aient', 'ai'], ['e', 'es', 'ent'], ['s', 't', 'x'],
  ['ons', 'ont'], ['a', 'as', 'à'], ['i', 'is', 'it', 'ie', 'ies'], ['u', 'us', 'ue', 'ues', 'ut', 'û'],
  ['ai', 'ais', 'ait'], ['ions', 'iez', 'ons', 'ez'], ['îmes', 'imes', 'ûmes', 'umes'],
]

// Propose n terminaisons incorrectes mais plausibles
export function wrongEndings(tense, correct, n, rand = Math.random) {
  const pool = ENDING_POOL[tense].filter((e) => e !== correct)
  const score = (e) => {
    let s = rand()
    if (SIMILAR.some((g) => g.includes(e) && g.includes(correct))) s += 3
    if (e.slice(-1) === correct.slice(-1)) s += 1.5
    if (e.length === correct.length) s += 1
    return s
  }
  return pool.sort((a, b) => score(b) - score(a)).slice(0, n)
}

// ---- Normalisation et comparaison (tolérante aux accents) ------------------------

export const normalize = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe').replace(/æ/gi, 'ae')
    .replace(/[’‘`]/g, "'").toLowerCase().replace(/\s+/g, ' ').trim()

const lightClean = (s) => s.replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase()

// Retire un pronom sujet saisi en tête de réponse ("nous chantions" -> "chantions")
const stripPronoun = (s) => s.replace(/^(?:j'\s*|(?:je|tu|elles|elle|ils|il|on|nous|vous)\s+)/i, '')

// Renvoie 'exact', 'accent' (juste, mais accents oubliés ou faux) ou 'wrong'
export function compare(given, expected) {
  const g = lightClean(given)
  const e = lightClean(expected)
  if (!g) return 'wrong'
  if (g === e) return 'exact'
  if (normalize(g) === normalize(e)) return 'accent'
  const g2 = lightClean(stripPronoun(given))
  if (g2 && g2 !== g) {
    if (g2 === e) return 'exact'
    if (normalize(g2) === normalize(e)) return 'accent'
  }
  return 'wrong'
}

// ---- Choix multiples ------------------------------------------------------------

const shuffle = (arr, rand = Math.random) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export { shuffle }

// Quatre propositions de forme entière (la bonne + trois pièges plausibles)
export function formChoices(verb, tense, p, gender, rand = Math.random) {
  const answer = conjugate(verb, tense, p, gender)
  const seen = new Set([normalize(answer)])
  const out = []
  const add = (f) => {
    const k = normalize(f)
    if (!f || seen.has(k)) return false
    seen.add(k)
    out.push(f)
    return true
  }
  // 1. accord différent (être + participe), 2. autre terminaison, 3. autres personnes, 4. autres temps
  if (needsAgreement(verb, tense)) {
    const other = gender === 'f' ? 'm' : 'f'
    add(conjugate(verb, tense, p, other))
  }
  const sp = splitForm(verb, tense, p, gender)
  if (sp) wrongEndings(tense, sp.end, 3, rand).slice(0, 2).forEach((e) => out.length < 2 && add(sp.stem + e))
  const samePerson = shuffle([0, 1, 2, 3, 4, 5].filter((q) => q !== p), rand)
  for (const q of samePerson) if (out.length < 2 + 1) add(conjugate(verb, tense, q, gender))
  const otherTenses = shuffle(TENSES.map((t) => t.id).filter((t) => t !== tense), rand)
  for (const t of otherTenses) if (out.length < 3) add(conjugate(verb, t, p, gender))
  for (const q of samePerson) if (out.length < 3) add(conjugate(verb, tense, q, gender))
  return shuffle([answer, ...out.slice(0, 3)], rand)
}

// Quatre terminaisons au choix
export function endingChoices(tense, correct, rand = Math.random) {
  return shuffle([correct, ...wrongEndings(tense, correct, 3, rand)], rand)
}
