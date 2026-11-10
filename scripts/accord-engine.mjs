// Le contrôle grammatical des phrases de l'exercice « Féminin et pluriel » (utilisé seulement à la construction).
//
// - classifyFeminine / classifyPlural : reconnaissent la règle qui relie le mot de départ à la réponse écrite
//   dans la phrase. Si aucune règle ne convient, la réponse est suspecte (faute de frappe ou exception à ajouter).
// - distractors : trois propositions fausses mais plausibles pour le choix multiple.
import { normalize } from '../src/lib/conjugation.js'

// ---- Féminin ---------------------------------------------------------------------------------------

// Les paires qu'aucun motif ne décrit : un autre mot, un féminin irrégulier
const F_DICT = new Map(Object.entries({
  'père>mère': 'f_mot', 'frère>sœur': 'f_mot', 'oncle>tante': 'f_mot', 'papa>maman': 'f_mot', 'garçon>fille': 'f_mot',
  'monsieur>madame': 'f_mot', 'mari>femme': 'f_mot', 'homme>femme': 'f_mot', 'fils>fille': 'f_mot', 'coq>poule': 'f_mot',
  'cheval>jument': 'f_mot', 'bélier>brebis': 'f_mot', 'mouton>brebis': 'f_mot', 'cerf>biche': 'f_mot', 'canard>cane': 'f_mot',
  'jars>oie': 'f_mot', 'taureau>vache': 'f_mot', 'bouc>chèvre': 'f_mot', 'sanglier>laie': 'f_mot', 'singe>guenon': 'f_mot',
  'cochon>truie': 'f_mot', 'gendre>bru': 'f_mot', 'parrain>marraine': 'f_mot',
  'roi>reine': 'f_irr', 'héros>héroïne': 'f_irr', 'neveu>nièce': 'f_irr', 'compagnon>compagne': 'f_irr', 'copain>copine': 'f_irr',
  'empereur>impératrice': 'f_irr', 'dieu>déesse': 'f_irr', 'tsar>tsarine': 'f_irr', 'loup>louve': 'f_irr', 'dindon>dinde': 'f_irr',
  'poète>poétesse': 'f_esse', 'duc>duchesse': 'f_esse', 'enchanteur>enchanteresse': 'f_esse', 'vengeur>vengeresse': 'f_esse',
  'doux>douce': 'f_irr', 'roux>rousse': 'f_irr', 'faux>fausse': 'f_irr', 'vieux>vieille': 'f_irr', 'beau>belle': 'f_irr',
  'nouveau>nouvelle': 'f_irr', 'fou>folle': 'f_irr', 'mou>molle': 'f_irr', 'jumeau>jumelle': 'f_irr', 'long>longue': 'f_irr',
  'bref>brève': 'f_irr', 'frais>fraîche': 'f_irr', 'sec>sèche': 'f_irr', 'favori>favorite': 'f_irr', 'malin>maligne': 'f_irr',
  'bénin>bénigne': 'f_irr', 'aigu>aiguë': 'f_irr',
}))

export function classifyFeminine(base, ans) {
  const key = `${base}>${ans}`
  if (F_DICT.has(key)) return F_DICT.get(key)
  if (ans === base) return 'f_same'
  if (base.endsWith('teur') && ans === base.slice(0, -4) + 'trice') return 'f_trice'
  if (base.endsWith('eur') && ans === base.slice(0, -3) + 'euse') return 'f_euse'
  if ((base.endsWith('eux') || base.endsWith('oux')) && ans === base.slice(0, -1) + 'se') return 'f_x'
  if (base.endsWith('f') && ans === base.slice(0, -1) + 've') return 'f_ve'
  if (base.endsWith('er') && ans === base.slice(0, -2) + 'ère') return 'f_ere'
  if (base.endsWith('et') && ans === base.slice(0, -2) + 'ète') return 'f_ete'
  if (base.endsWith('c') && ans === base.slice(0, -1) + 'que') return 'f_que'
  if (base.endsWith('c') && ans === base.slice(0, -1) + 'che') return 'f_che'
  if (base.endsWith('c') && ans === base.slice(0, -1) + 'cque') return 'f_que'
  if (ans === base + 'e') return 'f_e'
  const last = base.slice(-1)
  if ('nlts'.includes(last) && ans === base + last + 'e') return 'f_double'
  if (ans === base + 'sse' || (base.endsWith('e') && ans === base.slice(0, -1) + 'esse')) return 'f_esse'
  return null
}

// ---- Pluriel ---------------------------------------------------------------------------------------

const P_AL_S = new Set(['bal', 'carnaval', 'festival', 'chacal', 'récital', 'régal', 'narval', 'fatal', 'naval', 'natal', 'banal'])
const P_AIL_X = new Set(['bail', 'corail', 'émail', 'soupirail', 'travail', 'vantail', 'vitrail'])
const P_OU_X = new Set(['bijou', 'caillou', 'chou', 'genou', 'hibou', 'joujou', 'pou'])
const P_X_EXC = new Set(['landau', 'sarrau', 'pneu', 'bleu', 'émeu'])
const P_IRR = {
  œil: 'yeux', ciel: 'cieux', aïeul: 'aïeux', monsieur: 'messieurs', madame: 'mesdames',
  mademoiselle: 'mesdemoiselles', bonhomme: 'bonshommes', gentilhomme: 'gentilshommes',
}
const COULEURS = new Set(['marron', 'orange', 'noisette'])

export function classifyPlural(base, ans) {
  if (P_IRR[base]) return ans === P_IRR[base] ? 'p_irr' : null
  if (COULEURS.has(base)) return ans === base ? 'p_couleur' : null
  if (/[sxz]$/.test(base)) return ans === base ? 'p_inv' : null
  if (base.endsWith('al')) {
    if (P_AL_S.has(base)) return ans === base + 's' ? 'p_als' : null
    return ans === base.slice(0, -2) + 'aux' ? 'p_aux' : null
  }
  if (base.endsWith('ail')) {
    if (P_AIL_X.has(base)) return ans === base.slice(0, -3) + 'aux' ? 'p_ail' : null
    return ans === base + 's' ? 'p_s' : null
  }
  if (/(eau|au|eu|œu)$/.test(base)) {
    if (P_X_EXC.has(base)) return ans === base + 's' ? 'p_x_exc' : null
    return ans === base + 'x' ? 'p_x' : null
  }
  if (base.endsWith('ou')) {
    if (P_OU_X.has(base)) return ans === base + 'x' ? 'p_ou_x' : null
    return ans === base + 's' ? 'p_ou_s' : null
  }
  return ans === base + 's' ? 'p_s' : null
}

// ---- Pièges du choix multiple --------------------------------------------------------------------------

const cut = (s, n) => s.slice(0, s.length - n)

// Féminin : terminaisons que l'on confond (fin du mot de départ → autres fins plausibles, souvent fausses)
const F_WRONG = [
  [/teur$/, ['trice', 'teuse', 'teure']],
  [/eur$/, ['euse', 'eure']],
  [/eux$/, ['euse', 'euxe']],
  [/oux$/, ['ouse', 'ouxe']],
  [/f$/, ['ve', 'fe']],
  [/ier$/, ['ière', 'ierre']],
  [/er$/, ['ère', 'erre']],
  [/et$/, ['ète', 'ette']],
  [/el$/, ['elle', 'ele']],
  [/ien$/, ['ienne', 'iene']],
  [/en$/, ['enne', 'ene']],
  [/on$/, ['onne', 'one']],
  [/an$/, ['anne', 'ane']],
  [/ain$/, ['aine', 'ainne']],
  [/in$/, ['ine', 'inne']],
  [/un$/, ['une', 'unne']],
  [/ot$/, ['otte', 'ote']],
  [/il$/, ['ille', 'ile']],
  [/eau$/, ['elle', 'eale']],
  [/ou$/, ['olle', 'ole']],
  [/c$/, ['que', 'che', 'ce']],
  [/g$/, ['gue', 'ge']],
  [/d$/, ['de', 'dde', 'te']],
  [/s$/, ['sse', 'se', 'ce']],
  [/x$/, ['se', 'sse', 'xe']],
]

function feminineCandidates(base, ans, n, r) {
  const last = base.slice(-1)
  const doubled = /[nlts]$/.test(base) ? [base + last + 'e'] : []
  // un autre mot ou une forme irrégulière (nom) : on ne confond pas des terminaisons, on hésite ou on double la consonne
  if (n === 'nom' && (r === 'f_mot' || r === 'f_irr')) return [base, ...doubled, ans + 's', base + 's']
  // -esse : l'orthographe du « ss » est ce qui trompe
  if (r === 'f_esse') return [base, ans.replace('ss', 's'), ans.replace('ss', 'c'), ans + 's']
  const out = [base] // le mot inchangé : le piège le plus naturel
  for (const [re, ends] of F_WRONG) {
    if (re.test(base)) {
      const [m] = re.exec(base)
      for (const e of ends) out.push(cut(base, m.length) + e)
      break
    }
  }
  if (base.endsWith('e')) out.push(base + 's', base + 'e', cut(base, 1) + 'esse')
  else out.push(base + 'e')
  out.push(...doubled, ans + 's', base + 's')
  return out
}

const P_IRR_WRONG = {
  œil: ['œils', 'œux', 'yeus'], ciel: ['ciels', 'cieus', 'ciaux'], aïeul: ['aïeuls', 'aïeulx', 'aïeuz'],
  monsieur: ['monsieurs', 'messieur', 'monsieux'], madame: ['madames', 'mesdame', 'madames'],
  mademoiselle: ['mademoiselles', 'mesdemoiselle', 'mesdamoiselles'], bonhomme: ['bonhommes', 'bonhommess', 'bonshomme'],
  gentilhomme: ['gentilhommes', 'gentilshomme', 'gentilhommess'],
}

function pluralCandidates(base, ans, n) {
  if (P_IRR_WRONG[base]) return P_IRR_WRONG[base]
  const out = []
  if (base.endsWith('al')) out.push(cut(base, 2) + 'aux', cut(base, 2) + 'als', cut(base, 2) + 'aus', cut(base, 2) + 'alx')
  else if (base.endsWith('ail')) out.push(base + 's', cut(base, 3) + 'aux', cut(base, 3) + 'aulx', base + 'x')
  else if (/[sxz]$/.test(base)) out.push(base + 's', base.endsWith('x') ? cut(base, 1) + 's' : base + 'x', base + 'es')
  else if (n === 'adj' && !base.endsWith('e')) out.push(base + 's', base + 'es', base + 'x', base) // un adjectif : on hésite aussi sur le genre
  else {
    out.push(base + 's', base + 'x', base)
    if (base.endsWith('e')) out.push(cut(base, 1) + 's') // branche → branchs
  }
  out.push(base, ans + 's', base + 'es')
  return out
}

// Trois propositions fausses, distinctes de la bonne réponse même sans les accents. `flip` varie l'ordre.
export function distractors(kind, base, ans, flip = false, n = 'nom', r = '') {
  const cands = kind === 'f' ? feminineCandidates(base, ans, n, r) : pluralCandidates(base, ans, n)
  const seen = new Set([normalize(ans)])
  const picked = []
  // le mot inchangé est un piège naturel : on le met tantôt devant, tantôt derrière les autres
  const ordered = flip ? [...cands.filter((c) => c !== base), ...cands.filter((c) => c === base)] : cands
  for (const c of ordered) {
    const k = normalize(c)
    if (!c || seen.has(k) || c.includes(' ')) continue
    seen.add(k)
    picked.push(c)
    if (picked.length === 3) break
  }
  return picked
}
