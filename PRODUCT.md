# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 + Vite + npm, front only, no backend. State lives in localStorage only. The build ships as one self-contained `index.html` (everything inlined: JS, CSS, fonts, data). Chosen by the user.

## Users

Primary: a French CM2 pupil (about 10 to 11 years old) revising school lessons alone on an iPad 11 inch, after school or in the evening. Secondary: the parent who set the app up and who may adjust settings (theme, accent colour).

## Product Purpose

"Devoirs" is a revision companion for primary-school lessons. The first and only exercise for now is conjugation: a configurable quiz on French verbs. The list of exercises sits in a side menu so other subjects can be added later. Success is a child who can start a useful revision session alone, understands each correction on the spot, and sees his score and weak verbs improve.

## Positioning

A quiz that remembers what the child got wrong: verbs missed in the last three quizzes can be added back explicitly to the next one, and every verb form comes from a bank of 600 written sentences covering every pronoun of every verb.

## Operating Context

- iPad 11 inch first (landscape and portrait), touch input, on-screen keyboard for free-text answers.
- Sessions are short and repeated. The app can be closed at any moment and must reopen on exactly the same screen, including mid-quiz.
- The system back gesture or button must step back through app screens and never exit the app.
- Offline, opened as a single local file or hosted statically.

## Capabilities and Constraints

- App name: "Devoirs"; the page title mentions it. UI language is French.
- Light and dark themes. Settings screen. Accent colour chosen from 8 predefined swatches.
- Left side menu listing exercises. Current exercise: "Révision des verbes" (conjugation quiz).
- Quiz parameters, several can be active at once:
  - Tenses: présent, passé composé, imparfait, futur, passé simple.
  - Answer types: multiple choice of the full verb form; pick the ending among choices; type the ending; type the full verb form.
  - Question types: a pronoun plus a verb to conjugate; a sentence to complete (with masculine, feminine, singular and plural agreement).
  - Number of questions: 10, 20, 30, 40, 50 or 100.
- Verb list: avoir, être, aller, faire, dire, parler, prendre, pouvoir, voir, finir, devoir, vouloir, plus 30 common verbs across the 1st, 2nd and 3rd groups.
- Accent tolerant: a missing or wrong accent is still accepted as correct, with a short remark.
- Final screen shows the score. The last 10 quizzes are stored in localStorage.
- Verbs answered wrongly are tracked. When launching a quiz, an option "retravailler les verbes erronés" injects the verbs missed in the last 3 quizzes.
- A bank of 600 generated questions with sentences, covering all pronouns of the verbs. Quizzes draw randomly from it.
- Immediate correction after each answer: right or wrong, the correct form shown, a remark when an accent is missing.

## Brand Commitments

Name "Devoirs". Voice: sober and encouraging, short positive messages, no points, no gamified tricks, no mascot.

## Evidence on Hand

No existing assets, copy or data. The 600-question bank and the verb conjugations are authored for this project and must be checked for French grammar.

## Product Principles

1. The child can run a full session alone; nothing needs an adult's explanation.
2. Every answer teaches: the correct form is always shown, accent slips are noted, not punished.
3. Memory is a feature: close the app, come back, same screen; mistakes feed the next quiz.
4. Calm over loud: encouragement is honest and short, the score is clear, progress is visible.
5. Touch first on iPad: large targets, no hover dependence, the keyboard never hides the question.

## Accessibility & Inclusion

Aimed at a 10 to 11 year old reader: generous type size, high contrast in both themes whatever the accent, no information carried by colour alone (right and wrong also use icon and text), and reduced-motion respected.
