<script setup>
import { computed } from 'vue'
import { state, startDictee } from '../stores/state.js'
import { TENSES } from '../lib/conjugation.js'
import { LENGTHS, ACCENT_MODES, READ_MODES, SPEEDS, rateOf, poolFor } from '../lib/dictee.js'
import { speak, stopSpeaking, speechAvailable, useVoices } from '../lib/speech.js'
import Icon from '../components/Icon.vue'
import Segmented from '../components/Segmented.vue'
import ResumeCard from '../components/ResumeCard.vue'

const tenseOrder = TENSES.map((t) => t.id)
const voices = useVoices()
const canSpeak = speechAvailable()

// On garde toujours au moins un temps
function toggleTense(id) {
  const list = state.dictees.tenses
  const i = list.indexOf(id)
  if (i >= 0) {
    if (list.length > 1) list.splice(i, 1)
  } else {
    list.push(id)
    list.sort((a, b) => tenseOrder.indexOf(a) - tenseOrder.indexOf(b))
  }
}
const has = (id) => state.dictees.tenses.includes(id)

const available = computed(() => poolFor(state.dictees).length)
const speedOptions = SPEEDS.map((s) => ({ value: s.value, label: s.label }))
const voiceChoice = computed(() => voices.value.find((v) => v.name === state.dictees.voice)?.name ?? '')

// Un essai de voix pour régler la vitesse sans lancer une dictée
function trial() {
  stopSpeaking()
  speak('Voici un essai de lecture pour la dictée. Les enfants ont écouté une histoire de pirates.', {
    rate: rateOf(state.dictees.speed), voiceName: voiceChoice.value,
  })
}

const summary = computed(() => {
  const n = state.dictees.tenses.length
  const len = state.dictees.maxSentences
  return `${available.value} dictée${available.value > 1 ? 's' : ''} · ${n} temps · jusqu’à ${len} phrase${len > 1 ? 's' : ''}`
})
</script>

<template>
  <div class="page setup">
    <header class="page-head">
      <h1>Dictée</h1>
      <p class="lede">Écoute la dictée, puis écris-la au clavier.</p>
    </header>

    <ResumeCard />

    <section v-if="!canSpeak" class="card calm" aria-label="Voix indisponible">
      <h2 class="card-title">Pas de voix sur cet appareil</h2>
      <p class="muted">Ce navigateur ne sait pas lire à voix haute : la dictée ne peut pas démarrer ici.</p>
    </section>

    <div class="setup-grid">
      <div class="setup-col">
        <fieldset class="group">
          <legend class="group-title">Temps</legend>
          <p class="hint">Tu peux en choisir plusieurs.</p>
          <div class="chips">
            <button
              v-for="t in TENSES" :key="t.id" type="button" class="chip"
              :aria-pressed="has(t.id)" @click="toggleTense(t.id)"
            >
              <Icon v-if="has(t.id)" name="check" :size="20" />{{ t.label }}
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Longueur maximale</legend>
          <Segmented v-model="state.dictees.maxSentences" :options="LENGTHS" label="Longueur maximale" />
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Accents</legend>
          <div class="opts opts--2" role="radiogroup" aria-label="Accents">
            <button
              v-for="m in ACCENT_MODES" :key="m.id" type="button" role="radio" class="opt"
              :aria-checked="state.dictees.accents === m.id" @click="state.dictees.accents = m.id"
            >
              <span class="opt-title"><Icon v-if="state.dictees.accents === m.id" name="check" :size="20" />{{ m.label }}</span>
              <span class="opt-example">{{ m.hint }}</span>
            </button>
          </div>
          <p class="hint">Les majuscules et la ponctuation ne comptent jamais comme des fautes.</p>
        </fieldset>
      </div>

      <div class="setup-col">
        <fieldset class="group">
          <legend class="group-title">Lecture</legend>
          <div class="opts opts--2" role="radiogroup" aria-label="Lecture">
            <button
              v-for="m in READ_MODES" :key="m.id" type="button" role="radio" class="opt"
              :aria-checked="state.dictees.mode === m.id" @click="state.dictees.mode = m.id"
            >
              <span class="opt-title"><Icon v-if="state.dictees.mode === m.id" name="check" :size="20" />{{ m.label }}</span>
              <span class="opt-example">{{ m.hint }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Voix</legend>
          <Segmented v-model="state.dictees.speed" :options="speedOptions" label="Vitesse de la voix" />
          <div v-if="voices.length > 1" class="opts opts--2" role="radiogroup" aria-label="Voix">
            <button
              v-for="v in voices" :key="v.name + v.lang" type="button" role="radio" class="opt"
              :aria-checked="voiceChoice === v.name || (!voiceChoice && v.name === voices[0].name)" @click="state.dictees.voice = v.name"
            >
              <span class="opt-title">
                <Icon v-if="voiceChoice === v.name || (!voiceChoice && v.name === voices[0].name)" name="check" :size="20" />{{ v.label }}
              </span>
            </button>
          </div>
          <div class="row">
            <button type="button" class="btn" :disabled="!canSpeak" @click="trial"><Icon name="speaker" :size="20" />Écouter un essai</button>
          </div>
          <button
            type="button" role="switch" class="opt opt--switch" :aria-checked="state.dictees.punct"
            @click="state.dictees.punct = !state.dictees.punct"
          >
            <span class="opt-title">Dire la ponctuation</span>
            <span class="opt-example">« Hier soir virgule les enfants… » comme le maître.</span>
            <span class="switch" aria-hidden="true"><span class="switch-knob" /></span>
          </button>
        </fieldset>
      </div>
    </div>

    <footer class="launch">
      <p class="launch-sum">{{ summary }}</p>
      <button type="button" class="btn btn--primary btn--xl" :disabled="!canSpeak || !available" @click="startDictee()">
        Commencer la dictée<Icon name="arrow" />
      </button>
    </footer>
  </div>
</template>
