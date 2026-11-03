---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["src/App.vue","src/styles/base.css"]
---

# Surface brief: Devoirs (app shell, quiz, results, history, settings)

## Scope and mode
Operate. A CM2 pupil revises French verb conjugation alone on an iPad 11 inch (landscape first, portrait supported).
Task: choose what to revise, answer a quiz, read each correction, see a final score, track mistakes.

## Direction contract
THESIS: Devoirs is a cahier Seyès, not a quiz app. The exercise is written on a ruled sheet and corrected in the teacher's red pen. It refuses the rounded-card, confetti, gamified quiz template.
OWN-WORLD: White paper, lilac Seyès ruling (8 mm squares with faint interlines), a red double margin rule, violet-indigo ink. Correction pens: red for errors, green for ticks. The shell wears the chosen cahier cover colour (eight covers: indigo, violet, rose, orange, jaune, vert, turquoise, bleu). Playwrite FR Moderne (French school cursive) for written lines, Andika for printed labels and controls. Cursive and ruling appear on the exercise sheet, the corrected copy, page titles and the score note; everywhere else is plain paper and printed type.
STORY: The pupil opens his cahier, picks what to revise, writes on the line, sees each mistake struck and corrected in red pen, and ends with a graded note circled in red. He understands each correction without help and wants another go.
FIRST VIEWPORT: iPad landscape 1194x834. Left: cover-coloured rail 280 px, a white label "Devoirs", exercise list, Historique and Réglages pinned low. Right, the quiz: progress marks on top, then a ruled sheet with the margin at left, the pronoun and verb written in cursive about 56 px on a main line with a dotted writing slot, then four printed answer buttons in a 2x2 grid, then a correction bar with the next button. The setup screen is plain paper with a cursive title, tense chips, option rows, and a sticky launch bar.
FORM: Le Cahier Seyès, position 1 on my grounded list, chosen by the user as IMPECCABLE'S PICK. seed:2f2904394e728da8
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature move
Correction in red pen: a wrong answer is struck through in the pupil's ink with a red line and the right form is written beside it in red; a right answer is underlined in green with a tick in the margin; the final score is a red note circled on the corrected copy.

## Unresolved decisions
None blocking. The cursive is limited to the exercise sheet, titles and the score note so that printed controls stay unambiguous for spelling.
