// Les règles du féminin et du pluriel : un identifiant, une étiquette courte et l'explication donnée à l'élève.
// Ce fichier ne dépend de rien : l'app l'utilise pour les corrections, le script de construction pour contrôler les phrases.
export const RULES = {
  // ---- Féminin
  f_e: { short: '+ e', text: 'On ajoute un -e à la fin du mot.' },
  f_same: { short: 'ne change pas', text: 'Ce mot s’écrit pareil au masculin et au féminin.' },
  f_double: { short: 'consonne doublée', text: 'On double la dernière consonne, puis on ajoute un -e.' },
  f_ere: { short: '-er → -ère', text: '-er devient -ère, et -ier devient -ière.' },
  f_ete: { short: '-et → -ète', text: 'Pour quelques mots (complet, secret, discret, inquiet, concret), -et devient -ète.' },
  f_euse: { short: '-eur → -euse', text: '-eur devient -euse.' },
  f_trice: { short: '-teur → -trice', text: '-teur devient souvent -trice.' },
  f_x: { short: '-x → -se', text: 'Le -x final devient -se.' },
  f_ve: { short: '-f → -ve', text: 'Le -f final devient -ve.' },
  f_que: { short: '-c → -que', text: 'Le -c final devient -que.' },
  f_che: { short: '-c → -che', text: 'Le -c final devient -che.' },
  f_esse: { short: '-esse', text: 'Le féminin de ce mot se termine par -esse.' },
  f_mot: { short: 'autre mot', text: 'Le féminin est un mot différent, à connaître par cœur.' },
  f_irr: { short: 'irrégulier', text: 'Ce féminin est irrégulier : il faut l’apprendre.' },
  // ---- Pluriel
  p_s: { short: '+ s', text: 'On ajoute un -s à la fin du mot.' },
  p_inv: { short: 'pas de -s', text: 'Un mot qui finit par -s, -x ou -z ne change pas au pluriel.' },
  p_aux: { short: '-al → -aux', text: '-al devient -aux.' },
  p_als: { short: '-al → -als', text: 'Exception : ces mots en -al prennent seulement un -s (bal, carnaval, festival, chacal, récital, régal, fatal, naval, natal, banal).' },
  p_ail: { short: '-ail → -aux', text: 'Sept mots en -ail font -aux au pluriel : bail, corail, émail, soupirail, travail, vantail, vitrail.' },
  p_x: { short: '+ x', text: 'Les mots en -eau, -au et -eu prennent un -x au pluriel.' },
  p_x_exc: { short: '+ s (exception)', text: 'Exception : pneu, bleu, landau et émeu prennent un simple -s.' },
  p_ou_x: { short: '-ou → -oux', text: 'Sept mots en -ou prennent un -x au pluriel : bijou, caillou, chou, genou, hibou, joujou, pou.' },
  p_ou_s: { short: '-ou → -ous', text: 'Les autres mots en -ou prennent un simple -s (trou, clou, sou, verrou…).' },
  p_irr: { short: 'irrégulier', text: 'Ce pluriel est irrégulier : il faut l’apprendre.' },
  p_couleur: { short: 'couleur invariable', text: 'Un nom employé comme couleur ne change pas (marron, orange, noisette).' },
}

export const isRule = (id) => Object.prototype.hasOwnProperty.call(RULES, id)
