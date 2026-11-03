# Devoirs

Application de révision pour un élève de CM2, pensée pour un iPad 11 pouces. Premier exercice : la révision des verbes.
Aucun serveur : tout tourne dans le navigateur et les données restent dans le `localStorage`.

## Commandes

```bash
npm install
npm run dev      # développement sur http://localhost:5173
npm run build    # produit dist/index.html, un fichier unique et autonome
```

`dist/index.html` embarque tout (scripts, styles, polices, 600 questions). Il suffit de l'ouvrir ou de le déposer sur un hébergement statique.

## Organisation

- `src/lib/conjugation.js` : moteur de conjugaison (42 verbes, 5 temps), découpe en terminaisons, comparaison tolérante aux accents.
- `scripts/generate-questions.mjs` : génère `src/data/questions.json` (600 phrases, 100 par pronom, 120 par temps). Relancer avec `node scripts/generate-questions.mjs`.
- `src/lib/quiz.js` : construction d'un quiz, propositions de réponse, correction.
- `src/stores/state.js` : état global sauvegardé (écran courant, quiz en cours, historique, réglages).
- `src/lib/nav.js` : navigation par l'historique du navigateur (le retour revient à l'écran précédent, sans quitter l'app).
- `src/views/` : écrans. `src/styles/` : thème (clair, sombre, huit couleurs de cahier).

## Données sauvegardées

Clés `devoirs:*` du `localStorage` : `settings`, `history` (10 derniers quiz), `config`, `route`, `quiz` (quiz en cours).
Les verbes à retravailler sont ceux ratés dans les 3 derniers quiz.
