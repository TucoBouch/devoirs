<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { state, submitAnswer, nextQuestion } from '../stores/state.js'
import { tenseLabel } from '../lib/conjugation.js'
import { isTyped, promptParts, genderTag, expectedFor, explain, praise, exerciseOf } from '../lib/quiz.js'
import { accordParts, accordTitle, accordTag, accordHelp, explainAccord } from '../lib/accords.js'
import { useCoarsePointer } from '../lib/touch.js'
import Icon from '../components/Icon.vue'
import ProgressStrip from '../components/ProgressStrip.vue'
import AppKeyboard from '../components/AppKeyboard.vue'

const ACCENT_KEYS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'û', 'ù', 'œ']

const quiz = computed(() => state.quiz)
const item = computed(() => quiz.value?.items[quiz.value.index])
const result = computed(() => quiz.value?.results[quiz.value.index])
const feedback = computed(() => quiz.value?.phase === 'feedback')
// Deux exercices partagent cet écran : les verbes et le féminin / pluriel
const isAccord = computed(() => exerciseOf(quiz.value) === 'accords')
const parts = computed(() => (item.value ? (isAccord.value ? accordParts(item.value) : promptParts(item.value)) : null))
const typed = computed(() => (item.value ? isTyped(item.value.at) : false))
const title = computed(() => (item.value ? (isAccord.value ? accordTitle(item.value) : tenseLabel(item.value.t)) : ''))
const tag = computed(() => {
  if (!item.value) return null
  return isAccord.value ? accordTag(item.value) : genderTag(item.value)
})
const infinitive = computed(() => (item.value ? (isAccord.value ? item.value.w : item.value.v) : ''))
const help = computed(() => {
  const it = item.value
  if (!it) return ''
  if (isAccord.value) return accordHelp(it)
  return it.at === 'qcm_form' ? 'Choisis le bon verbe.'
    : it.at === 'qcm_end' ? 'Choisis la bonne terminaison.'
    : it.at === 'text_end' ? 'Écris la terminaison.' : 'Écris le verbe conjugué.'
})
const expected = computed(() => (item.value ? expectedFor(item.value) : ''))
const isLast = computed(() => quiz.value && quiz.value.index + 1 === quiz.value.items.length)
const longLine = computed(() => {
  if (!item.value || item.value.qt !== 'pronoun') return false
  const given = feedback.value && typed.value ? (result.value?.given?.length ?? 0) : 0
  const size = parts.value.lead.length + parts.value.stem.length + expected.value.length + given + item.value.v.length * 0.6
  return size > 22
})
const dashed = (s) => (item.value && ['qcm_end', 'text_end'].includes(item.value.at) ? `-${s}` : s)

// ---- Réponse écrite ------------------------------------------------------------------------
// Au doigt, la réponse s'écrit directement dans le trou de la phrase, avec le clavier de l'app :
// celui de l'iPad cacherait la phrase. Avec une souris, on garde le champ et le clavier de l'ordinateur.
const coarse = useCoarsePointer()
const appKeys = computed(() => coarse.value && typed.value && !feedback.value)
const MAX_DRAFT = 30
const draft = ref(quiz.value?.draft ?? '')
const input = ref(null)
const nextBtn = ref(null)

watch(draft, (v) => { if (state.quiz) state.quiz.draft = v })
watch(() => quiz.value?.index, async () => {
  draft.value = quiz.value?.draft ?? ''
  await nextTick()
  if (typed.value) input.value?.focus({ preventScroll: true })
})
watch(feedback, async (on) => {
  if (!on) return
  await nextTick()
  if (!typed.value) nextBtn.value?.focus({ preventScroll: true })
  nextBtn.value?.scrollIntoView({ block: 'end', behavior: 'smooth' })
})
onMounted(() => {
  if (typed.value && !feedback.value) input.value?.focus({ preventScroll: true })
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function submitTyped() {
  if (feedback.value) return nextQuestion()
  if (!draft.value.trim()) return
  submitAnswer(draft.value)
}

// Clavier de l'app
function typeChar(ch) {
  if (feedback.value || draft.value.length >= MAX_DRAFT) return
  if (ch === ' ' && (!draft.value || draft.value.endsWith(' '))) return
  draft.value += ch
}
function backspace() {
  if (!feedback.value) draft.value = draft.value.slice(0, -1)
}
// Un clavier matériel branché sur l'iPad écrit aussi dans le trou (il n'y a pas de champ à remplir)
const WRITABLE = /^[a-zàâäçéèêëîïôöùûüÿœ' -]$/i
function onKeydown(e) {
  if (!coarse.value || !typed.value || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === 'Enter') {
    // un bouton qui a le focus gère déjà la touche Entrée par son clic
    if (e.repeat || e.target instanceof HTMLButtonElement) return
    e.preventDefault()
    submitTyped()
  } else if (feedback.value) {
    return
  } else if (e.key === 'Backspace') {
    e.preventDefault()
    backspace()
  } else if (WRITABLE.test(e.key)) {
    e.preventDefault()
    typeChar(e.key)
  }
}
function insertAccent(ch) {
  const el = input.value
  if (!el || feedback.value) return
  const start = el.selectionStart ?? draft.value.length
  const end = el.selectionEnd ?? start
  draft.value = draft.value.slice(0, start) + ch + draft.value.slice(end)
  nextTick(() => { el.setSelectionRange(start + 1, start + 1) })
}

function leave() {
  history.back()
}

// ---- Propositions ---------------------------------------------------------------------------
function choiceState(c) {
  if (!feedback.value) return null
  if (c === expected.value) return 'right'
  if (c === result.value?.given) return 'wrong'
  return 'other'
}

const heading = computed(() => {
  if (!feedback.value) return null
  const r = result.value
  if (r.verdict === 'exact') return { icon: 'check', title: praise(quiz.value.index), kind: 'ok' }
  if (r.verdict === 'accent') return { icon: 'check', title: 'Presque parfait !', kind: 'ok' }
  if (r.verdict === 'whole') return { icon: 'check', title: 'C’est juste !', kind: 'ok' }
  return { icon: 'x', title: 'Pas tout à fait', kind: 'ko' }
})
const detail = computed(() => {
  if (!feedback.value) return null
  const r = result.value
  const it = item.value
  if (r.verdict === 'accent') return `Il manque un accent : écris « ${expected.value} ».`
  if (r.verdict === 'whole') return `On te demandait seulement la terminaison : -\u2060${it.end}.`
  if (r.verdict === 'wrong') return `La bonne réponse : « ${it.qt === 'pronoun' ? `${parts.value.lead}${it.a}` : expected.value} ».`
  return null
})
const why = computed(() => {
  if (!feedback.value || !item.value) return null
  return isAccord.value ? explainAccord(item.value) : explain(item.value)
})
</script>

<template>
  <section v-if="quiz && item" class="page quiz" :aria-label="`Question ${quiz.index + 1} sur ${quiz.items.length}`">
    <header class="quiz-head">
      <button type="button" class="btn btn--quiet btn--sm" @click="leave">
        <Icon name="back" :size="20" />Quitter
      </button>
      <ProgressStrip :total="quiz.items.length" :results="quiz.results" :index="quiz.index" />
      <p class="quiz-count"><b>{{ quiz.index + 1 }}</b> / {{ quiz.items.length }}</p>
    </header>

    <div class="sheet" :class="feedback && (result.correct ? 'sheet--ok' : 'sheet--ko')">
      <p class="sheet-title">
        <span>{{ title }}</span><span v-if="tag" class="sheet-tag"> ({{ tag }})</span>
      </p>
      <div class="sheet-row">
        <span class="sheet-mark" aria-hidden="true">
          <Icon v-if="feedback" :name="result.correct ? 'check' : 'x'" :size="40" />
        </span>
        <p class="prompt-line" :class="{ 'prompt-line--sentence': isAccord || item.qt === 'sentence', 'prompt-line--long': longLine }">
          <span class="lead">{{ parts.lead }}</span><span v-if="parts.stem" class="stem">{{ parts.stem }}</span><span
            class="slot" :class="{ 'is-filled': feedback, 'is-ok': feedback && result.correct, 'is-ko': feedback && !result.correct }"
          >
            <s v-if="feedback && !result.correct && result.given && typed" class="given">{{ result.given }}</s>
            <span class="slot-text">{{ feedback ? expected : typed ? draft : '' }}</span><span v-if="appKeys" class="caret" aria-hidden="true" />
          </span><span class="inf">({{ infinitive }})</span><span v-if="parts.tail" class="tail">{{ parts.tail }}</span>
        </p>
      </div>
    </div>
    <p class="prompt-help">{{ help }}</p>
    <p v-if="appKeys" class="sr-only" aria-live="polite">Ta réponse : {{ draft || 'vide' }}</p>

    <div v-if="!(coarse && typed)" class="answer">
      <div v-if="!typed" class="choices" role="group" aria-label="Réponses possibles">
        <button
          v-for="c in item.choices" :key="c" type="button" class="choice"
          :class="choiceState(c) && `choice--${choiceState(c)}`" :disabled="feedback"
          @click="submitAnswer(c)"
        >
          <span class="choice-text">{{ dashed(c) }}</span>
          <Icon v-if="choiceState(c) === 'right'" name="check" :size="26" />
          <Icon v-else-if="choiceState(c) === 'wrong'" name="x" :size="26" />
        </button>
      </div>

      <form v-else class="typed" @submit.prevent="submitTyped">
        <label class="sr-only" for="answer">Ta réponse</label>
        <div class="typed-row">
          <input
            id="answer" ref="input" v-model="draft" class="field" type="text" :readonly="feedback"
            autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"
            :placeholder="item.at === 'text_end' ? 'La terminaison' : 'Le verbe conjugué'"
          />
          <button v-if="!feedback" type="submit" class="btn btn--primary btn--lg" :disabled="!draft.trim()">Valider</button>
        </div>
        <div v-if="!feedback" class="accent-keys" role="group" aria-label="Lettres accentuées">
          <button
            v-for="k in ACCENT_KEYS" :key="k" type="button" class="key" tabindex="-1"
            @pointerdown.prevent @click="insertAccent(k)"
          >{{ k }}</button>
        </div>
      </form>
    </div>

    <div v-if="!appKeys" class="feedback" :class="heading && `feedback--${heading.kind}`" aria-live="polite">
      <template v-if="heading">
        <div class="feedback-body">
          <p class="feedback-title"><span class="mark-badge"><Icon :name="heading.icon" :size="22" /></span>{{ heading.title }}</p>
          <p v-if="detail" class="feedback-detail">{{ detail }}</p>
          <p v-if="why" class="feedback-why">{{ why }}</p>
        </div>
        <button ref="nextBtn" type="button" class="btn btn--primary btn--lg" @click="nextQuestion">
          {{ isLast ? 'Voir mon score' : 'Question suivante' }}<Icon name="arrow" />
        </button>
      </template>
    </div>
    <AppKeyboard v-else :can-submit="!!draft.trim()" @key="typeChar" @back="backspace" @submit="submitTyped" />
  </section>
</template>
