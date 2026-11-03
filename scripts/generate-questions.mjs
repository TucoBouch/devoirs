// Génère la banque de questions (src/data/questions.json) en deux temps :
//   1. la banque d'origine, 600 questions (ids 1 à 600), à ne jamais modifier : l'historique des élèves y fait référence ;
//   2. 1000 questions en plus (ids 601 à 1600), avec davantage de compléments et d'adverbes.
// Chaque question : un verbe, un temps, une personne, une phrase à trous et la réponse attendue.
// Répartition équilibrée sur l'ensemble : environ 267 questions par pronom, 320 par temps, 37 à 39 par verbe.
import { writeFileSync } from 'node:fs'
import { VERBS, TENSES, conjugate, needsAgreement } from '../src/lib/conjugation.js'

// Générateur pseudo-aléatoire à graine : la banque est identique à chaque exécution
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20261103)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const weighted = (entries) => {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of entries) if ((r -= w) < 0) return v
  return entries[0][0]
}

const ADVERBS = {
  present: ["Aujourd'hui,", 'En ce moment,', 'Chaque matin,', 'Souvent,', 'Toujours,', 'Tous les jours,', 'Le dimanche,', 'Maintenant,'],
  passe_compose: ['Hier,', 'Hier soir,', 'Ce matin,', 'La semaine dernière,', 'Samedi dernier,', "Tout à l'heure,", 'Il y a une heure,', 'Cet été,'],
  imparfait: ['Autrefois,', 'Tous les étés,', 'Chaque soir,', 'À cette époque,', 'Pendant les vacances,', 'Souvent,', 'Quand il faisait beau,', 'Le mercredi,'],
  futur: ['Demain,', 'Bientôt,', 'Plus tard,', 'Dans une semaine,', "L'été prochain,", 'Ce week-end,', 'Un jour,', 'Après-demain,'],
  passe_simple: ['Soudain,', 'Alors,', 'Ce soir-là,', 'Un matin,', 'Le lendemain,', 'Peu après,', 'Enfin,', 'Ce jour-là,'],
}

// Compléments neutres : valables quel que soit le sujet (pas de possessif, pas d'adjectif à accorder)
const COMPLEMENTS = {
  avoir: ['un chien', 'un vélo rouge', 'de la chance', 'faim', 'une bonne idée', 'rendez-vous chez le dentiste'],
  être: ["à l'heure", 'en retard', 'à la maison', 'dans le jardin', 'au parc', 'en classe'],
  aller: ["à l'école", 'au marché', 'chez le boulanger', 'à la piscine', 'au cinéma', 'à la mer'],
  faire: ['un gâteau', 'du vélo', 'une promenade', 'un dessin', 'la vaisselle', 'les devoirs'],
  dire: ['bonjour', 'la vérité', 'un secret', 'merci', 'une blague', 'au revoir'],
  parler: ['avec le maître', 'anglais', 'à voix basse', 'des vacances', 'doucement', 'avec les voisins'],
  prendre: ['le bus', 'un livre', 'le train de huit heures', 'une photo', 'un goûter', 'le chemin le plus court'],
  pouvoir: ['venir avec nous', 'sortir jouer', "finir à l'heure", 'nager sans bouée', 'lire seul', 'attendre un peu'],
  voir: ['un film', 'un arc-en-ciel', 'un oiseau', 'le médecin', 'les étoiles', 'un ami au parc'],
  finir: ['le travail', 'la leçon', 'le repas', 'le puzzle', 'la course', "l'exercice"],
  devoir: ['rentrer tôt', 'ranger la chambre', 'partir à huit heures', 'apprendre la leçon', 'dire la vérité', 'faire la vaisselle'],
  vouloir: ['un gâteau', 'jouer dehors', 'voir un film', 'une glace', 'dormir tard', 'gagner le match'],
  chanter: ['une chanson', 'dans la chorale', 'un air joyeux', "à l'école", 'devant la classe', 'une berceuse'],
  manger: ['une pomme', 'des pâtes', 'au restaurant', 'un gâteau', 'une glace', 'du pain frais'],
  jouer: ['au ballon', 'dans la cour', 'aux cartes', 'du piano', 'avec les voisins', 'dehors'],
  regarder: ['un film', 'la télévision', 'par la fenêtre', 'les nuages', 'un dessin animé', "l'horloge"],
  aimer: ['le chocolat', 'la musique', 'les animaux', 'lire des histoires', 'la mer', 'jouer au foot'],
  donner: ['un livre', 'un conseil', 'un coup de main', 'à manger au chat', 'le cahier', 'une fleur'],
  travailler: ['dans un bureau', 'à la ferme', 'avec soin', 'dans la cuisine', "à l'école", 'dans le jardin'],
  commencer: ['la leçon', 'le dessin', 'un nouveau livre', 'le match', 'à lire', 'le repas'],
  trouver: ['un trésor', 'une clé', 'la réponse', 'un chat perdu', 'un cahier', 'le chemin'],
  écouter: ['la radio', 'de la musique', 'le maître', 'les oiseaux', 'une histoire', 'le silence'],
  arriver: ['à la gare', "à l'heure", 'en retard', 'à pied', 'en vélo', "à l'école"],
  tomber: ["dans l'herbe", "de l'arbre", 'sur le sol', 'dans la neige', 'dans la rivière', 'de vélo'],
  choisir: ['un livre', 'une glace', 'le plus beau dessin', 'un cadeau', 'la bonne réponse', 'un jeu'],
  grandir: ['vite', 'à la campagne', 'dans une grande famille', 'près de la mer', 'sans souci', 'en un été'],
  réussir: ['le test', "l'examen", 'un beau dessin', 'à nager', 'le gâteau', 'la course'],
  remplir: ['le verre', 'la bouteille', 'le panier', 'la fiche', 'le seau', 'la grille'],
  réfléchir: ['longuement', 'à la réponse', 'avant de parler', 'à un plan', 'un instant', 'à la question'],
  obéir: ['au maître', 'aux règles', 'à la consigne', 'sans discuter', 'au chef', "à l'arbitre"],
  venir: ["à l'école", 'chez nous', 'avec un ami', 'en bus', 'à pied', 'à midi'],
  partir: ['en vacances', 'tôt le matin', 'à la montagne', 'sans bruit', 'en voyage', 'avec les amis'],
  savoir: ['la réponse', 'nager', 'la poésie par cœur', 'le chemin', 'la vérité', 'jouer du piano'],
  mettre: ['la table', 'un pull', "le livre sur l'étagère", 'de la musique', 'les clés dans le sac', 'un manteau'],
  écrire: ['une lettre', 'une histoire', 'à une amie', 'une carte postale', 'un poème', 'au tableau'],
  lire: ['un roman', 'une bande dessinée', 'le journal', 'à voix haute', 'une histoire', 'dans le canapé'],
  dormir: ['tard', 'dans un hamac', 'sous la tente', 'toute la nuit', "jusqu'à midi", 'profondément'],
  courir: ['dans le parc', 'très vite', 'après le ballon', 'sur la plage', "jusqu'à la maison", 'le long du chemin'],
  ouvrir: ['la porte', 'la fenêtre', 'un paquet', 'le cahier', 'la boîte', 'le livre'],
  attendre: ['le bus', 'un ami', "devant l'école", 'la sonnerie', 'le facteur', 'patiemment'],
  croire: ['cette histoire', 'le maître', 'aux fées', 'la nouvelle', 'au Père Noël', 'les voisins'],
  connaître: ['la réponse', 'cette chanson', 'un secret', 'la ville', 'le chemin', 'ce garçon'],
}

const NAMES = {
  m: ['Lucas', 'Tom', 'Hugo', 'Nathan', 'Louis', 'Jules', 'Adam', 'Max', 'Théo', 'Noé'],
  f: ['Léa', 'Zoé', 'Chloé', 'Emma', 'Inès', 'Jade', 'Manon', 'Lola', 'Sarah', 'Camille'],
}
const THIRD_SG = {
  m: ['mon frère', 'le chat', 'le maître', 'Papa', 'mon voisin', 'le facteur', 'le petit garçon', 'mon cousin', 'le directeur'],
  f: ['ma sœur', 'la maîtresse', 'Maman', 'ma voisine', 'la boulangère', 'la petite fille', 'ma cousine', 'la directrice'],
}
const THIRD_PL = {
  m: ['les garçons', 'mes cousins', 'les voisins', 'les élèves', 'les enfants', 'mes frères'],
  f: ['les filles', 'mes cousines', 'les voisines', 'les fillettes', 'mes sœurs', 'les maîtresses'],
}
const twoNames = (g) => {
  const a = pick(NAMES[g])
  let b = pick(NAMES[g])
  while (b === a) b = pick(NAMES[g])
  return `${a} et ${b}`
}

// Sujet affiché dans la phrase, avec son genre. Quand l'accord dépend du genre (être + participe),
// le sujet porte un indice lisible : "moi, Léa, je", "Léa, tu", "Tom et moi, nous", "Léa et Zoé, vous".
function subjectFor(p, agree) {
  const g = rand() < 0.5 ? 'm' : 'f'
  const cue = agree || rand() < 0.2
  switch (p) {
    case 0: return cue ? { text: `moi, ${pick(NAMES[g])}, je`, g } : { text: 'je', g: 'm' }
    case 1: return cue ? { text: `${pick(NAMES[g])}, tu`, g } : { text: 'tu', g: 'm' }
    case 2: return { text: weighted([[g === 'f' ? 'elle' : 'il', 3], [pick(NAMES[g]), 2], [pick(THIRD_SG[g]), 3]]), g }
    case 3: return cue ? { text: `${pick(NAMES[g])} et moi, nous`, g } : { text: 'nous', g: 'm' }
    case 4: return cue ? { text: `${twoNames(g)}, vous`, g } : { text: 'vous', g: 'm' }
    default: return { text: weighted([[g === 'f' ? 'elles' : 'ils', 3], [twoNames(g), 1], [pick(THIRD_PL[g]), 3]]), g }
  }
}

// ---- Pools de la seconde vague (1000 questions en plus) ----------------------------------
// Ajoutés après coup pour ne pas changer le tirage de la banque d'origine.
const EXTRA_ADVERBS = {
  present: ['Le samedi,', 'Le soir,', 'Parfois,', 'Cette semaine,'],
  passe_compose: ['Lundi dernier,', 'Hier après-midi,', 'Cette nuit,', 'Le mois dernier,'],
  imparfait: ['Chaque matin,', 'Il y a longtemps,', 'Tous les jours,', 'En ce temps-là,'],
  futur: ["L'année prochaine,", 'Demain matin,', 'Dans un mois,', 'Un de ces jours,'],
  passe_simple: ['Un soir,', 'Aussitôt,', 'Quelques jours plus tard,', 'À ce moment-là,'],
}
const EXTRA_COMPLEMENTS = {
  avoir: ['soif', 'peur du noir', 'mal à la tête', 'un nouveau cartable', 'de bonnes notes', 'sommeil'],
  être: ["à l'école", 'chez des amis', 'sur la plage', 'à la bibliothèque', 'dans la cour', 'au cinéma'],
  aller: ['à la bibliothèque', 'chez le médecin', 'au musée', 'à la campagne', 'au parc', 'chez les voisins'],
  faire: ['du sport', 'du bruit', 'un puzzle', 'de la peinture', 'un voyage', 'une bonne action'],
  dire: ['un mot gentil', 'la réponse', 'une histoire drôle', 'quelques mots', 'non', 'la leçon'],
  parler: ['français', 'au téléphone', 'de la fête', 'avec un ami', 'trop fort', 'à la maîtresse'],
  prendre: ['un crayon', 'une douche', 'le métro', 'un bon petit-déjeuner', 'des notes', 'un parapluie'],
  pouvoir: ['regarder un film', 'aider les autres', 'monter sur le vélo', 'dormir tard', 'porter le sac', 'répondre à la question'],
  voir: ['la mer', 'un renard', 'le facteur', 'une étoile filante', 'des nuages gris', 'le spectacle'],
  finir: ['le livre', 'le dessin', 'la poésie', 'le gâteau', 'la partie', 'le match'],
  devoir: ['finir les devoirs', 'attendre le bus', 'aller chez le dentiste', 'écrire une lettre', 'lire le chapitre', 'ouvrir la fenêtre'],
  vouloir: ['un chien', 'partir en voyage', "de l'eau", 'chanter une chanson', 'manger une pomme', 'une grande part'],
  chanter: ['à tue-tête', 'sous la douche', 'une comptine', 'en chœur', 'un refrain', 'juste'],
  manger: ['une orange', 'du riz', 'à la cantine', 'des fruits', 'une crêpe', 'du fromage'],
  jouer: ['au football', 'de la guitare', 'aux billes', 'à cache-cache', 'dans le jardin', 'avec le chien'],
  regarder: ['les étoiles', 'une photo', 'le match', 'les oiseaux', 'la carte', 'le spectacle'],
  aimer: ['les fruits', 'dessiner', 'la neige', 'danser', 'les vacances', 'nager'],
  donner: ['une pomme', 'la réponse', 'un bonbon', "de l'eau aux plantes", 'un baiser', 'un cadeau'],
  travailler: ["à l'hôpital", 'dans une boulangerie', 'sans bruit', 'avec courage', 'dans la classe', 'toute la journée'],
  commencer: ['le travail', 'un puzzle', 'à écrire', 'la course', 'un nouveau cahier', 'la poésie'],
  trouver: ['une pièce de monnaie', 'un nid', 'la solution', 'un crayon', 'un coquillage', 'une bonne place'],
  écouter: ['un conte', 'la pluie', 'une chanson', 'attentivement', 'la maîtresse', 'le vent'],
  arriver: ['en avance', 'à la maison', 'à midi', 'au parc', 'en voiture', 'avant les autres'],
  tomber: ['de la chaise', "dans l'escalier", 'dans le sable', 'sur le dos', 'dans la boue', 'du lit'],
  choisir: ['un film', 'une couleur', 'le chemin', 'un gâteau', 'une place', 'un nouveau cahier'],
  grandir: ['en ville', 'dans une petite maison', 'loin de la mer', 'avec des animaux', 'en montagne', 'doucement'],
  réussir: ['la dictée', 'à lire', 'le saut', 'le puzzle', 'la partie', 'à convaincre'],
  remplir: ['la valise', 'le sac', 'le cahier', 'le tableau', 'la caisse', 'la piscine'],
  réfléchir: ['à une solution', 'en silence', "avant d'agir", 'au problème', 'sérieusement', 'à cette idée'],
  obéir: ['à la maîtresse', 'aux parents', 'tout de suite', 'au signal', 'à la loi', 'au capitaine'],
  venir: ['à la fête', 'en voiture', 'avec le chien', 'à la maison', 'chercher le pain', 'en courant'],
  partir: ['à la mer', 'en train', 'sans rien dire', "pour l'école", 'à pied', 'en courant'],
  savoir: ['lire', 'la leçon', "compter jusqu'à cent", 'faire du vélo', 'le secret', 'danser'],
  mettre: ['un chapeau', 'le couvert', 'des bottes', 'du sucre dans le thé', 'la lumière', 'la radio'],
  écrire: ['un mot', 'une dictée', "à l'encre", 'une chanson', 'le titre', 'à un ami'],
  lire: ['un conte', 'un magazine', 'la leçon', 'une poésie', 'dans le jardin', 'à voix basse'],
  dormir: ['dans le train', 'à la belle étoile', 'chez des amis', 'sur le canapé', 'huit heures', 'paisiblement'],
  courir: ['autour du stade', 'dans la cour', 'vers la sortie', 'sous la pluie', "dans l'herbe", 'avec le chien'],
  ouvrir: ['le robinet', 'un parapluie', 'la lettre', 'le portail', 'le coffre', 'le sac'],
  attendre: ['le train', 'la pluie', "sous l'abri", 'le signal', 'devant la porte', 'le résultat'],
  croire: ['ce garçon', 'à ce conte', 'la maîtresse', 'cette blague', 'aux miracles', 'à la chance'],
  connaître: ['cette histoire', 'cette fille', 'un raccourci', 'le directeur', 'ce jeu', 'la poésie'],
}

// ---- Répartition équilibrée des (verbe, temps, personne) ---------------------------
const tenseIds = TENSES.map((t) => t.id)
const gTense = Object.fromEntries(tenseIds.map((t) => [t, 0]))
const gPers = [0, 0, 0, 0, 0, 0]
const perVerb = new Map(VERBS.map((v) => [v.inf, { vt: Object.fromEntries(tenseIds.map((t) => [t, 0])), vp: [0, 0, 0, 0, 0, 0], vtp: new Set() }]))

// Choisit n triplets (verbe, temps, personne) en comblant d'abord les manques globaux, puis ceux du verbe
function plan(verb, n) {
  const { vt, vp, vtp } = perVerb.get(verb.inf)
  const picked = []
  for (let k = 0; k < n; k++) {
    let best = null
    for (const t of tenseIds) {
      for (let p = 0; p < 6; p++) {
        const cost = 10 * gTense[t] + 10 * gPers[p] + 4 * vt[t] + 4 * vp[p] + (vtp.has(`${t}${p}`) ? 50 : 0) + rand() * 3
        if (!best || cost < best.cost) best = { t, p, cost }
      }
    }
    gTense[best.t]++; gPers[best.p]++; vt[best.t]++; vp[best.p]++; vtp.add(`${best.t}${best.p}`)
    picked.push({ verb, t: best.t, p: best.p })
  }
  return picked
}

// ---- Construction des phrases ---------------------------------------------------------
const used = new Set()
const advUse = {}
const compUse = {}
const questions = []

function makeQuestion({ verb, t, p }, advs, comps) {
  const agree = needsAgreement(verb, t)
  for (let attempt = 0; attempt < 40; attempt++) {
    const { text, g } = subjectFor(p, agree)
    const form = conjugate(verb, t, p, g)
    const adv = advs.reduce((x, y) => ((advUse[`${t}${x}`] ?? 0) <= (advUse[`${t}${y}`] ?? 0) ? x : y))
    const comp = comps.reduce((x, y) => ((compUse[`${verb.inf}${x}`] ?? 0) <= (compUse[`${verb.inf}${y}`] ?? 0) ? x : y))
    // "je" devient "j'" devant une voyelle ; la réponse se place juste après
    const elide = p === 0 && /^[aeiouyéèêâîôû]/i.test(form)
    const subject = elide ? text.replace(/je$/, "j'") : text
    const pre = `${adv} ${subject}${subject.endsWith("'") ? '' : ' '}`
    const post = ` ${comp}.`
    const key = pre + '_' + post
    compUse[`${verb.inf}${comp}`] = (compUse[`${verb.inf}${comp}`] ?? 0) + 1
    if (used.has(key)) continue // doublon : le complément suivant sera préféré
    used.add(key)
    advUse[`${t}${adv}`] = (advUse[`${t}${adv}`] ?? 0) + 1
    return { v: verb.inf, t, p, g, a: form, pre, post }
  }
  throw new Error(`Impossible de générer ${verb.inf} ${t} ${p}`)
}

// Première vague : la banque d'origine (ids 1 à 600)
const wave1 = VERBS.flatMap((verb, vi) => plan(verb, 14 + (vi < 12 ? 1 : 0)))
for (const c of wave1) questions.push(makeQuestion(c, ADVERBS[c.t], COMPLEMENTS[c.verb.inf]))
const BASE = questions.length

// Seconde vague : 1000 questions de plus, avec les pools élargis (ids 601 à 1600)
const ADVERBS_ALL = Object.fromEntries(tenseIds.map((t) => [t, [...ADVERBS[t], ...EXTRA_ADVERBS[t]]]))
const COMPLEMENTS_ALL = Object.fromEntries(Object.entries(COMPLEMENTS).map(([k, v]) => [k, [...v, ...EXTRA_COMPLEMENTS[k]]]))
const wave2 = VERBS.flatMap((verb, vi) => plan(verb, vi < 34 ? 24 : 23))
for (const c of wave2) questions.push(makeQuestion(c, ADVERBS_ALL[c.t], COMPLEMENTS_ALL[c.verb.inf]))

// Apostrophes typographiques dans les textes affichés
const fix = (s) => s.replace(/'/g, '’')
const out = questions.map((q, i) => ({ id: i + 1, ...q, pre: fix(q.pre), post: fix(q.post) }))

writeFileSync(new URL('../src/data/questions.json', import.meta.url), '[\n' + out.map((q) => JSON.stringify(q)).join(',\n') + '\n]\n')

// ---- Contrôles --------------------------------------------------------------------------
const count = (fn) => out.reduce((m, q) => ((m[fn(q)] = (m[fn(q)] ?? 0) + 1), m), {})
console.log('total', out.length, '(dont banque d\'origine :', BASE + ')')
console.log('par pronom', count((q) => q.p))
console.log('par temps', count((q) => q.t))
const verbCounts = count((q) => q.v)
console.log('min/max par verbe', Math.min(...Object.values(verbCounts)), Math.max(...Object.values(verbCounts)))
console.log('phrases uniques', new Set(out.map((q) => q.pre + '_' + q.post)).size)
