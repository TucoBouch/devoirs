# Devoirs

Application de révision pour un élève de CM2, pensée pour un iPad 11 pouces. Premier exercice : la révision des verbes.
Aucun serveur : tout tourne dans le navigateur et les données restent dans le `localStorage`.

## Commandes

```bash
npm install
npm run dev      # développement sur http://localhost:5173
npm run build    # produit dist/index.html, un fichier unique et autonome
```

`dist/index.html` embarque tout (scripts, styles, polices, 1600 questions). Il suffit de l'ouvrir ou de le déposer sur un hébergement statique.

## Organisation

- `src/lib/conjugation.js` : moteur de conjugaison (42 verbes, 5 temps), découpe en terminaisons, comparaison tolérante aux accents.
- `scripts/phrases/*.txt` : les 1600 phrases, écrites à la main dans l'esprit des romans et albums pour les 9-12 ans (aventures, enquêtes, contes, école, copains). 50 phrases par verbe (10 par temps) pour les 11 verbes irréguliers, 33 à 34 par verbe pour les 31 autres. Chaque ligne donne la personne (1 à 6, suivie de `f` si le sujet est féminin) et la phrase, avec `{}` à la place du verbe : `3f Elle {} un secret.`
- `scripts/build-questions.mjs` : lit ces fichiers, calcule la forme conjuguée avec le moteur, contrôle chaque phrase (pronom sujet, élision, passé composé, doublons) et écrit `src/data/questions.json`. Relancer avec `node scripts/build-questions.mjs` après avoir modifié une phrase (`DRY=1` pour contrôler sans écrire). Les ids sont attribués dans l'ordre des fichiers : ils peuvent changer, c'est pourquoi chaque erreur de l'historique garde sa phrase en entier.
- `src/lib/quiz.js` : construction d'un quiz, propositions de réponse, correction. Le choix « Verbes irréguliers » limite le quiz à avoir, être, aller, faire, dire, prendre, pouvoir, voir, finir, devoir et vouloir (liste `IRREGULAR_VERBS` dans `conjugation.js`).
- `src/stores/state.js` : état global sauvegardé (écran courant, quiz en cours, historique, réglages).
- `src/lib/nav.js` : navigation par l'historique du navigateur (le retour revient à l'écran précédent, sans quitter l'app).
- `src/views/` : écrans. `src/styles/` : thème (clair, sombre, huit couleurs de cahier).

## Données sauvegardées

Clés `devoirs:*` du `localStorage` : `settings`, `history` (10 derniers quiz), `config`, `route`, `quiz` (quiz en cours).
Les verbes à retravailler sont ceux ratés dans les 3 derniers quiz.
