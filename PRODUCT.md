# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 + Vite + npm, front only, no backend. State lives in localStorage only. The build ships as one self-contained `index.html` (everything inlined: JS, CSS, fonts, data). Chosen by the user.

## Users

Primary: a French CM2 pupil (about 10 to 11 years old) revising school lessons alone on an iPad 11 inch, after school or in the evening. Secondary: the parent who set the app up and who may adjust settings (theme, accent colour).

## Product Purpose

"Devoirs" is a revision companion for primary-school lessons. Two exercises so far: conjugation (a configurable quiz on French verbs) and vocabulary spelling (the feminine and the plural of nouns and adjectives). The list of exercises sits in a side menu so other subjects can be added later. Success is a child who can start a useful revision session alone, understands each correction on the spot, and sees his score and weak verbs improve.

## Positioning

A quiz that remembers what the child got wrong: verbs missed in the last three quizzes can be added back explicitly to the next one, and every verb form comes from a bank of 1600 hand-written sentences, in the spirit of children's fiction for 9 to 12 year olds, covering every pronoun.

## Operating Context

- iPad 11 inch first (landscape and portrait), touch input. Free-text answers use the app's own on-screen keyboard (letters, accents, space, delete, validate), because the iPad keyboard covers half of the landscape screen and scrolls the sentence out of view. The answer is written straight into the gap of the sentence. With a mouse, the usual field and the computer keyboard are used.
- Sessions are short and repeated. The app can be closed at any moment and must reopen on exactly the same screen, including mid-quiz.
- The system back gesture or button must step back through app screens and never exit the app.
- Offline, opened as a single local file or hosted statically.

## Capabilities and Constraints

- App name: "Devoirs"; the page title mentions it. UI language is French.
- Light and dark themes. Settings screen. Accent colour chosen from 8 predefined swatches.
- Left side menu listing exercises: "Révision des verbes" (conjugation quiz) and "Féminin et pluriel" (vocabulary quiz).
- Quiz parameters, several can be active at once:
  - Tenses: présent, passé composé, imparfait, futur, passé simple.
  - Answer types: multiple choice of the full verb form; pick the ending among choices; type the ending; type the full verb form.
  - Question types: a pronoun plus a verb to conjugate; a sentence to complete (with masculine, feminine, singular and plural agreement).
  - Number of questions: 10, 20, 30, 40, 50 or 100.
- Verb list: avoir, être, aller, faire, dire, parler, prendre, pouvoir, voir, finir, devoir, vouloir, plus 30 common verbs across the 1st, 2nd and 3rd groups.
- Verb set: all 42 verbs, or only the "irregular" ones the parent listed: avoir, être, aller, faire, dire, prendre, pouvoir, voir, finir, devoir, vouloir (finir is 2nd group but kept at the parent's request). The set also limits which missed verbs can be reworked.
- Accent tolerant: a missing or wrong accent is still accepted as correct, with a short remark.
- Final screen shows the score. The last 10 quizzes are stored in localStorage.
- Verbs answered wrongly are tracked. When launching a quiz, an option "retravailler les verbes erronés" injects the verbs missed in the last 3 quizzes.
- A bank of 1600 hand-written sentences (original, inspired by children's fiction for 9 to 12 year olds), covering all pronouns of the verbs. The 11 irregular verbs have 50 sentences each. Quizzes draw randomly from it. Each recorded mistake keeps its full sentence, so the bank can be rewritten without breaking the history.
- Immediate correction after each answer: right or wrong, the correct form shown, a remark when an accent is missing.

### Exercise: Féminin et pluriel

- Each question is a sentence with a gap and the starting word in brackets, for example « Sa ___ (voisin) lui a souri. » → voisine, or « Les ___ (cheval) galopaient. » → chevaux. The gender or number must be readable in the sentence. Plural adjectives are given in the gender of the sentence (« jolie » for a feminine noun), so the question is only about the plural.
- Parameters: feminine and/or plural; nouns and/or adjectives; multiple choice (the right form among 4) and/or typed (the whole word); 10 to 100 questions. Typed answers use the same app keyboard as the verbs, with œ added (sœur, vœux).
- A bank of 700 hand-written sentences (original, in the spirit of novels for teenagers, readable by a CM2 pupil): 361 feminine and 339 plural, nouns and adjectives. Each pair of words follows a named rule (+ e, consonne doublée, -er → -ère, -eur → -euse, -teur → -trice, -x → -se, -f → -ve, -c → -che / -que, -esse, autre mot, irrégulier; + s, pas de -s, -al → -aux, -al → -als, -ail → -aux, + x, -ou → -oux, -ou → -ous, exceptions, couleurs invariables). The correction states the rule.
- "Retravailler mes erreurs" adds words that follow the rules missed in the last 3 quizzes of this exercise. The history shows the rules to rework, next to the verbs to rework.
- History: the last 10 quizzes of each exercise, each labelled with its exercise.

## Brand Commitments

Name "Devoirs". Voice: sober and encouraging, short positive messages, no points, no gamified tricks, no mascot.

## Evidence on Hand

No existing assets, copy or data. The 1600-question verb bank, the verb conjugations and the 700-sentence feminine and plural bank are authored for this project and must be checked for French grammar.

## Product Principles

1. The child can run a full session alone; nothing needs an adult's explanation.
2. Every answer teaches: the correct form is always shown, accent slips are noted, not punished.
3. Memory is a feature: close the app, come back, same screen; mistakes feed the next quiz.
4. Calm over loud: encouragement is honest and short, the score is clear, progress is visible.
5. Touch first on iPad: large targets, no hover dependence, the keyboard never hides the question.

## Accessibility & Inclusion

Aimed at a 10 to 11 year old reader: generous type size, high contrast in both themes whatever the accent, no information carried by colour alone (right and wrong also use icon and text), and reduced-motion respected.
