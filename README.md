# Devoirs

Application de révision pour un élève de CM2, pensée pour un iPad 11 pouces. Trois exercices : la révision des verbes, le féminin et le pluriel des noms et des adjectifs, et la dictée.
Aucun serveur : tout tourne dans le navigateur et les données restent dans le `localStorage`.

## Commandes

```bash
npm install
npm run dev      # développement sur http://localhost:5173
npm run build    # produit dist/index.html, un fichier unique et autonome
```

`dist/index.html` embarque tout (scripts, styles, polices, 1600 phrases de verbes, 700 phrases de féminin et pluriel et 2000 dictées). Il suffit de l'ouvrir ou de le déposer sur un hébergement statique.

## Organisation

- `src/lib/conjugation.js` : moteur de conjugaison (42 verbes, 5 temps), découpe en terminaisons, comparaison tolérante aux accents.
- `scripts/phrases/*.txt` : les 1600 phrases, écrites à la main dans l'esprit des romans et albums pour les 9-12 ans (aventures, enquêtes, contes, école, copains). 50 phrases par verbe (10 par temps) pour les 11 verbes irréguliers, 33 à 34 par verbe pour les 31 autres. Chaque ligne donne la personne (1 à 6, suivie de `f` si le sujet est féminin) et la phrase, avec `{}` à la place du verbe : `3f Elle {} un secret.`
- `scripts/build-questions.mjs` : lit ces fichiers, calcule la forme conjuguée avec le moteur, contrôle chaque phrase (pronom sujet, élision, passé composé, doublons) et écrit `src/data/questions.json`. Relancer avec `node scripts/build-questions.mjs` après avoir modifié une phrase (`DRY=1` pour contrôler sans écrire). Les ids sont attribués dans l'ordre des fichiers : ils peuvent changer, c'est pourquoi chaque erreur de l'historique garde sa phrase en entier.
- `scripts/accords/*.txt` : les 700 phrases de l'exercice « Féminin et pluriel » (361 de féminin, 339 de pluriel, noms et adjectifs), écrites à la main dans l'esprit des romans pour adolescents. Chaque ligne a un trou `{mot>réponse}` : `Sa {voisin>voisine} lui a souri.` L'élève voit « (voisin) » et écrit « voisine ». `{souris}` marque un mot qui ne change pas.
- `scripts/build-accords.mjs` et `scripts/accord-engine.mjs` : lisent ces fichiers, reconnaissent la règle qui relie les deux mots (+ e, -eur → -euse, -al → -aux, -ou → -oux, exceptions…), contrôlent chaque phrase (genre ou nombre lisible, élision, longueur, mot répété plus de 3 fois) et fabriquent trois mauvaises réponses plausibles pour le choix multiple. Une paire sans règle connue arrête le script : faute de frappe, ou exception à déclarer dans `accord-engine.mjs`. `node scripts/build-accords.mjs` écrit `src/data/accords.json` (`DRY=1` pour contrôler sans écrire, `LIST=1` pour lister les mots par règle, `DIST=1` pour voir des mauvaises réponses).
- `scripts/dictees/*.txt` : les 2000 dictées, une par ligne, de 1 à 3 phrases, 400 par temps (`== pres`, `pc`, `imp`, `fut`, `ps`) : environ 30 % d'une phrase, 40 % de deux, 30 % de trois, de 8 à 42 mots. Un fichier par lot de 95 dictées (`10-present-a.txt` à `53-passe-simple-d.txt`), plus les 100 premières (`01` à `05`). Textes originaux, dans l'esprit des romans pour enfants : récits, descriptions, souvenirs, projets. Chaque dictée reste au temps annoncé : pas d'imparfait dans une dictée au passé composé.
- `scripts/build-dictees.mjs` : lit ces fichiers, contrôle l'orthographe de chaque mot avec le dictionnaire français de Hunspell (`nspell` et `dictionary-fr`, installés en `devDependencies` : ils ne servent qu'à la construction et ne sont pas embarqués), la structure (1 à 3 phrases, majuscules, ponctuation, longueur, doublons) et signale les dictées où le temps annoncé ne se reconnaît pas ou où un autre temps s'est glissé (terminaisons en -ait, -erai, -èrent…), et repère les débuts de phrase et les mots trop répétés d'une dictée à l'autre. Il écrit `src/data/dictees.json`. `DRY=1` contrôle sans écrire, `SHOW=1` affiche les dictées. Chaque dictée a un identifiant tiré de son texte : l'app s'en sert pour ne pas en répéter une avant d'avoir fait le tour.
- `src/lib/dictee.js` : choix de la dictée, découpage en groupes de mots pour la lecture, correction mot à mot (majuscules, ponctuation et trait d'union oublié toujours tolérés ; accents au choix). `src/lib/speech.js` : lecture à voix haute avec la voix du navigateur (voix françaises sans doublon, attente après un arrêt, relance d'une lecture muette). `DicteeSetup.vue`, `DicteeView.vue` et `DicteeResult.vue` : réglages, écran d'écriture, correction.
- `tools/test-ipad.html` : page de test à ouvrir sur l'iPad (voix françaises, enchaînement des lectures, clavier, caméra, texte en direct). Elle fabrique un rapport à copier. Se sert avec `python3 -m http.server 8090 --bind 0.0.0.0 --directory tools`.
- `src/lib/accord-rules.js` : les règles et leur explication, montrées à l'élève après chaque réponse. `src/lib/accords.js` : construction du quiz, libellés. `src/lib/history.js` : historique commun aux deux exercices (10 derniers quiz de chacun).
- `src/lib/quiz.js` : construction d'un quiz de verbes, propositions de réponse, correction (réutilisée par le quiz de féminin et pluriel). Le choix « Verbes irréguliers » limite le quiz à avoir, être, aller, faire, dire, prendre, pouvoir, voir, finir, devoir et vouloir (liste `IRREGULAR_VERBS` dans `conjugation.js`).
- `src/stores/state.js` : état global sauvegardé (écran courant, quiz en cours, historique, réglages).
- `src/lib/nav.js` : navigation par l'historique du navigateur (le retour revient à l'écran précédent, sans quitter l'app).
- `src/components/AppKeyboard.vue` : le clavier de l'app, utilisé pour les réponses écrites sur un écran tactile (`src/lib/touch.js` détecte le pointeur tactile). Celui de l'iPad n'apparaît plus : il couvrait la moitié de l'écran en paysage et faisait défiler la phrase hors de vue. La réponse s'écrit dans le trou de la phrase ; un clavier matériel branché sur l'iPad fonctionne aussi. Avec une souris, le champ de saisie habituel reste. La dictée s'en sert aussi sur écran tactile (option `extended` : une touche Maj pour les majuscules et une rangée de ponctuation) : la feuille affiche alors le texte, ajouté à la fin avec une touche d'effacement, et le brouillon est gardé dans le quiz en cours.
- `src/views/` : écrans (`VerbsSetup`, `AccordsSetup`, `QuizView` commun aux deux exercices, résultat, historique, réglages). `src/styles/` : thème (clair, sombre, huit couleurs de cahier) et taille du texte (Petit, Normal, Grand, dans Réglages). Sur téléphone (700 px et moins), l'échelle des polices est déjà réduite (`tokens.css`), les boutons sont plus bas, le menu disparaît pendant un quiz et la barre de lancement passe sur deux lignes ; « Petit » s'y ajoute si ce n'est pas assez.

## Données sauvegardées

Clés `devoirs:*` du `localStorage` : `settings`, `history` (10 derniers quiz de chaque exercice), `config` (réglages des verbes), `accords` (réglages du féminin et pluriel), `dictees` (réglages de la dictée et dictées déjà posées), `route`, `quiz` (quiz en cours, avec son exercice `ex`).
Les verbes à retravailler sont ceux ratés dans les 3 derniers quiz de verbes ; pour le féminin et pluriel, ce sont les règles ratées dans les 3 derniers quiz de cet exercice. Un quiz enregistré sans `ex` est un quiz de verbes.
