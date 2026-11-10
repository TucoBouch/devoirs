<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { state, startDictee, nav } from '../stores/state.js'
import { scoreMessage } from '../lib/quiz.js'
import { correctDictee } from '../lib/dictee.js'
import { entrySummary } from '../lib/history.js'
import { speak, stopSpeaking, speechAvailable } from '../lib/speech.js'
import { rateOf } from '../lib/dictee.js'
import Icon from '../components/Icon.vue'

const entry = computed(() => state.history.find((h) => h.id === state.route.id))
const fresh = computed(() => state.route.name === 'resultat')
// La correction se refait à partir du texte et de ce que l'élève a écrit : rien d'autre n'est enregistré
const result = computed(() => (entry.value
  ? correctDictee(entry.value.dictee.text, entry.value.given ?? '', { strict: entry.value.config.accents !== 'tolerant' })
  : null))
const date = computed(() =>
  new Date(entry.value.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
)
const percent = computed(() => (entry.value.total ? Math.round((entry.value.score / entry.value.total) * 100) : 0))
const canSpeak = speechAvailable()

// Écouter encore le texte juste, pour entendre les mots qu'on a ratés
const listening = ref(false)
async function listen() {
  if (listening.value) { stopSpeaking(); listening.value = false; return }
  listening.value = true
  await speak(entry.value.dictee.text, { rate: rateOf(entry.value.config.speed), voiceName: entry.value.config.voice })
  listening.value = false
}
onBeforeUnmount(stopSpeaking)

// Chaque mot du texte juste, avec ce qu'il y avait à corriger. Un oubli ou un mot en trop se voit aussi.
const label = (op) => {
  if (op.kind === 'ok') return op.accent ? 'accent oublié' : 'juste'
  if (op.kind === 'wrong') return 'à corriger'
  return op.kind === 'missing' ? 'mot oublié' : 'mot en trop'
}

function another() {
  // mêmes réglages : une nouvelle dictée
  Object.assign(state.dictees, JSON.parse(JSON.stringify(entry.value.config)))
  startDictee()
}
</script>

<template>
  <div v-if="entry && result" class="page result">
    <header class="copy-head">
      <div class="page-head">
        <h1>{{ fresh ? 'Dictée corrigée' : `Dictée du ${date}` }}</h1>
        <p class="muted">
          {{ percent }} % de mots justes · {{ entrySummary(entry) }}
          <template v-if="entry.accents"> · {{ entry.accents }} accent{{ entry.accents > 1 ? 's' : '' }} à surveiller</template>
        </p>
      </div>
      <div class="note" role="img" :aria-label="`Note : ${entry.score} mots justes sur ${entry.total}. ${scoreMessage(entry.score, entry.total)}`">
        <span class="note-score" aria-hidden="true">
          <svg class="note-ring" viewBox="0 0 240 120" preserveAspectRatio="none" focusable="false">
            <path pathLength="1" d="M30 66C18 30 78 10 128 11c52 1 100 20 94 52-5 33-62 48-114 44C60 103 14 86 20 52c3-20 28-34 56-40" />
          </svg>
          {{ entry.score }}<span class="note-total">/{{ entry.total }}</span>
        </span>
        <span class="note-msg" aria-hidden="true">{{ scoreMessage(entry.score, entry.total) }}</span>
      </div>
    </header>

    <section class="group" aria-label="Correction">
      <h2 class="group-title">Ta dictée corrigée</h2>
      <div class="sheet">
        <p class="mistake-line copy-line">
          <template v-for="(op, i) in result.ops" :key="i">
            <span v-if="op.kind === 'ok'" :class="{ 'accent-ok': op.accent }">
              <span class="sr-only">{{ label(op) }} : </span>{{ op.word.raw }}
            </span>
            <span v-else-if="op.kind === 'wrong'" class="slot is-filled is-ko">
              <s class="given">{{ op.given.bare }}</s><span class="slot-text"><span class="sr-only">à corriger : </span>{{ op.word.raw }}</span>
            </span>
            <span v-else-if="op.kind === 'missing'" class="slot is-filled is-ko">
              <span class="slot-text"><span class="sr-only">mot oublié : </span>{{ op.word.raw }}</span>
            </span>
            <s v-else class="given"><span class="sr-only">mot en trop : </span>{{ op.given.bare }}</s>{{ ' ' }}
          </template>
        </p>
      </div>
      <p class="muted">
        En rouge, ce qu’il fallait écrire. Un mot barré est un mot en trop.
        <template v-if="entry.accents"> Un mot souligné de points a un accent oublié, ce qui est toléré.</template>
      </p>
    </section>

    <footer class="actions">
      <button type="button" class="btn btn--primary btn--lg" @click="another"><Icon name="redo" />Une autre dictée</button>
      <button v-if="canSpeak" type="button" class="btn btn--lg" @click="listen">
        <Icon :name="listening ? 'stop' : 'speaker'" />{{ listening ? 'Arrêter' : 'Réécouter la dictée' }}
      </button>
      <button type="button" class="btn btn--quiet btn--lg" @click="nav.go({ name: fresh ? 'dictees' : 'historique' })">
        {{ fresh ? 'Retour' : 'Retour à l’historique' }}
      </button>
    </footer>
  </div>
</template>
