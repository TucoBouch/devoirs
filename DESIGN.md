---
name: Devoirs
description: Le Cahier Seyès, a CM2 pupil's French verb revision, written on a ruled sheet and corrected in red pen.
colors:
  paper: "#fffefb"
  surface: "#ffffff"
  ink: "#2b2380"
  ink-soft: "#5b5494"
  rule: "#cfc3f2"
  rule-faint: "#ebe5fb"
  rule-strong: "#8a7fc4"
  margin-red: "#e2566f"
  pen-red: "#c2273f"
  pen-green: "#1a7f4b"
  cover-indigo: "#2f3d9c"
  cover-violet: "#7a3fb0"
  cover-rose: "#c4306f"
  cover-orange: "#e6720f"
  cover-jaune: "#f2c012"
  cover-vert: "#1b7f48"
  cover-turquoise: "#0b7a80"
  cover-bleu: "#1f68b8"
  night-paper: "#14112a"
  night-surface: "#1d1a3a"
  night-ink: "#ece9ff"
  night-ink-soft: "#b5aee0"
  night-rule-strong: "#8d83d6"
  night-margin-red: "#ff7391"
  night-pen-red: "#ff8da0"
  night-pen-green: "#74d9a4"
typography:
  display:
    fontFamily: "Playwrite FR Moderne Variable, Snell Roundhand, Segoe Script, cursive"
    fontSize: "2.75rem"
    fontWeight: 400
    lineHeight: 1.35
  prompt:
    fontFamily: "Playwrite FR Moderne Variable, Snell Roundhand, Segoe Script, cursive"
    fontSize: "clamp(2.5rem, 6.2cqi, 3.5rem)"
    fontWeight: 400
    lineHeight: "2 ruling lines"
  headline:
    fontFamily: "Andika, ui-rounded, Avenir Next, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Andika, ui-rounded, Avenir Next, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Andika, ui-rounded, Avenir Next, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Andika, ui-rounded, Avenir Next, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  label: "0.4rem"
  control: "0.7rem"
  card: "1rem"
  pill: "2rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  gutter: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.cover-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    height: "3.5rem"
    padding: "0 1.5rem"
  button-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "3.5rem"
    padding: "0 1.5rem"
  choice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "5rem"
  choice-right:
    textColor: "{colors.ink}"
  choice-wrong:
    textColor: "{colors.pen-red}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "3.5rem"
    padding: "0 1.25rem"
  rail:
    backgroundColor: "{colors.cover-indigo}"
    textColor: "#ffffff"
    width: "17.5rem"
  brand-label:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.label}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "1.25rem 1.5rem"
---

# Design System: Devoirs

## Overview

**Creative North Star: "Le Cahier Seyès"**

Devoirs is a school notebook, not a quiz app. The exercise is written on a ruled Seyès sheet and corrected in a teacher's red pen. The shell wears the cover of the notebook the pupil chose. Everything else is plain paper and printed type, so controls stay unambiguous for spelling. Density is calm and the targets are large, because it is used alone on an iPad (min control height 3.5rem).

The two registers never mix. Cursive (the pupil's and teacher's hand) appears only on the exercise sheet, the corrected copy, page titles, the brand label and the score note. Printed Andika is used for every control, hint and explanation.

**Key Characteristics:**
- White paper, lilac ruling, violet-indigo ink, a red double margin.
- Eight selectable cover colours, each with a light and a dark value.
- Two correction pens: red for error, green for right.
- Light and dark themes through `html[data-theme]`, cover through `html[data-accent]`.
- Motion is limited to the pen writing in and the score ring being drawn.

## Colors

Violet-indigo ink on near-white paper, with one chosen cover colour and two pen colours that only ever mean wrong and right. Hex values live in the frontmatter; dark-theme counterparts are the `night-` tokens.

### Primary
- **Cover colour** (`cover-*`, eight choices: indigo, violet, rose, orange, jaune, vert, turquoise, bleu): the chosen notebook cover. Light theme uses the `cover-*` value; dark theme uses a lighter tone for fills and a deep tone for the rail (see sidecar `colorMeta`). Each cover carries an on-colour; orange and jaune take dark text, the others white. The default is indigo.

### Secondary
- **Pen red** (`pen-red`): wrong answers, strike lines, the circled score note, the sheet title underline, destructive buttons.
- **Pen green** (`pen-green`): right answers, the underline and the margin tick.
- **Margin red** (`margin-red`): the double margin rule on the sheet only.

### Neutral
- **Paper** (`paper`): page ground and the sheet.
- **Surface** (`surface`): cards, chips, buttons, answer choices.
- **Ink** (`ink`): text, focus ring, selected-state border.
- **Ink soft** (`ink-soft`): secondary text, hints, the empty dotted slot.
- **Rule / rule-faint / rule-strong** (`rule`, `rule-faint`, `rule-strong`): card borders and gauges; the sheet grid reuses rule and rule-faint (translucent in dark); control borders.

### Named Rules
**The Two Pens Rule.** Red means wrong, green means right, and neither is used decoratively. Red also draws the notebook's own marks (margin, title underline).

**The Cover Rule.** The cover colour fills only the rail and the primary button, and tints selection and progress. It is never used as a text colour on paper.

**The Colour Is Not Alone Rule.** Right and wrong always carry a glyph and a line style as well (tick or cross, strike-through, solid versus dotted underline, taller red bars in the dense strip).

## Typography

**Display Font:** Playwrite FR Moderne Variable (with Snell Roundhand, Segoe Script, cursive)
**Body Font:** Andika (with ui-rounded, Avenir Next, system-ui, sans-serif)

**Character:** French school cursive for what is written, a letterform-clear printed face for what is read. Weights used: Andika 400 and 700; Playwrite at 400.

### Hierarchy
- **Display** (cursive 400, 2.75rem, 1.35): page titles.
- **Prompt** (cursive 400, clamp 2.5rem to 3.5rem over container width, two ruling lines; sentence variant 1.75rem to 2.4rem on one line): the pronoun and verb on the sheet.
- **Headline** (Andika 700, 1.75rem, 1.2): group and feedback titles.
- **Title** (Andika 700, 1.375rem, 1.2): card titles, nav items, lede (400), feedback detail.
- **Body** (Andika 400, 1.1875rem, 1.5): default; tabular numerals on.
- **Label** (Andika 700, 1rem): pills, hints (400), tags. Never uppercase. Setting `data-size='large'` scales the root to 112.5%.
- **Hand small:** sheet title 1.5rem, mistake lines 1.7rem, score 3.5rem, brand label 1.75rem, all cursive.

### Named Rules
**The Hand And Print Rule.** Cursive only for written lines, titles, the brand label and the score note. Controls, answers to pick and explanations are Andika.

## Layout

A two-column shell: the cover rail (17.5rem, 15rem at 1100px and below) and a scrolling main column whose page is at most 70rem with a 2.5rem gutter (1.75rem, then 1.1rem on phones). Sections breathe with 2rem vertical gaps; controls sit in 0.75rem gaps. The setup screen is two columns that collapse to one when the main container is under 56rem, with a sticky launch bar. At 700px and below the rail becomes a top bar. Safe-area insets are honoured throughout.

The sheet is the grid: one ruling square equals one writing line. It is 3rem in the quiz and 2.5rem on the corrected copy, with a 5rem margin (3rem on phones), and a faint interline every quarter square. Text sits on the ruling (`line-height` is a multiple of the ruling).

## Elevation & Depth

Mostly flat paper with soft, ambient, blurred shadows: cards and the sheet share one soft violet shadow (`0 1px 2px` plus `0 10px 22px`, heavier in dark). The rail has an inset spine (`inset 0.7rem 0 0 rgba(0,0,0,.14)`) and a blurred cast shadow. The brand label and the active nav item are paper stickers with a small drop. No hard offset shadows.

### Named Rules
**The Spine Rule.** The rail's depth comes from an inset darker spine on its left, as on a notebook cover, not from a border.

## Shapes

Soft but not bubbly: controls 0.7rem, cards 1rem, the brand label 0.4rem, pills and switches fully round, the sheet only 0.3rem like paper. Borders are 2px on interactive controls and 1px on cards and the sheet. The cover swatch is a small notebook with asymmetric corners (0.3rem and 0.6rem).

## Components

### Buttons
- **Shape:** 0.7rem radius, 2px border, min height 3.5rem (sm 3rem, lg 4.25rem, xl 4.5rem), bold.
- **Primary:** solid cover-colour fill with its on-colour. The only solid-accent control besides the rail.
- **Default:** surface fill, ink text, strong rule border. Quiet and danger (pen-red text and border) variants.
- **Hover / Focus:** hover tints toward the cover colour (12%) on hover-capable devices; primary brightens. Active nudges down and scales to 0.985. Focus is a 3px ink outline offset 3px (on-rail colour inside the rail). Disabled drops to 45% opacity.

### Chips, options, segments
- **Style:** surface fill, 2px strong rule border, 0.7rem radius, 3.5rem high (options 4.75rem).
- **Selected:** paper tinted 24% with the cover colour, ink border, plus a tick glyph; never a solid fill. Switch on-state uses the cover fill with a knob and the label text.

### Answer choices
- Surface fill with a 2px ink border, 5rem tall, in a 2-column grid. After answering: right is green-tinted with a green border and tick; wrong is pen-red with a struck label; other choices drop to 50%.

### Navigation (rail)
- Cover-coloured rail, brand label as a slightly rotated (-1.5deg) paper sticker in cursive. Nav items are 3.5rem, regular weight; the active item becomes a paper sticker, bold. Historique and Réglages are pinned low.

### Cards
- Surface fill, 1px rule border, 1rem radius, padding 1.25rem 1.5rem, the soft shadow.

### The ruled sheet and red-pen correction (signature)
- Ruling, double margin and cursive prompt. The empty slot is a 3px dotted ink-soft line. Right: solid green underline, the answer written in, tick in the margin. Wrong: pupil answer struck with a 0.09em red line, red rewrite tilted -2deg, red cross in the margin. The feedback bar echoes this (tinted green or red with a 2px border and a circled glyph).
- **Score note:** red cursive 3.5rem, rotated -3deg, hand-drawn ring around the score, double red underline under the message.

### Progress strip
- Round marks 1.6rem: done in green with a tick, wrong in red with a cross, todo faded, current filled with the cover colour with a double halo. Beyond twenty questions the marks become bars, wrong ones taller. History gauge: rounded track in rule colour with cover fill, always beside a numeric score.

### Cover swatches
- A 4.25rem by 5.5rem notebook with spine and white label; the selected one lifts and tilts and shows a check disc.

### Motion
- Two keyframes only: `write` (clip-path reveal left to right, 0.6 to 0.7s) and `draw` (ring, 0.9s), with easing `cubic-bezier(0.16, 1, 0.3, 1)`. Press feedback 0.15s, switch knob 0.3s, cover lift 0.25s. `prefers-reduced-motion` reduces all animation and transition durations to 0.01ms.

## Do's and Don'ts

### Do:
- **Do** write exercise text on the ruled sheet, one ruling square per line.
- **Do** mark selection with tinted paper, an ink border and a tick.
- **Do** pair every red or green with a glyph or line style, and keep tap targets at 3.5rem or more.
- **Do** read every colour from the role tokens so all eight covers and both themes work; pair each cover with its on-colour.
- **Do** keep motion to the pen writing and the ring.

### Don't:
- **Don't** use cursive on controls, option labels or explanations.
- **Don't** use pen red or green for decoration, or the cover colour as text on paper.
- **Don't** fill a selected state solidly with the cover colour; only primary buttons and the rail do.
- **Don't** add confetti, streak badges, or celebratory motion.
