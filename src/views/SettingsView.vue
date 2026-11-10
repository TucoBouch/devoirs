<script setup>
import { ref } from 'vue'
import { state, ACCENTS, clearHistory, resetEverything } from '../stores/state.js'
import Icon from '../components/Icon.vue'
import Segmented from '../components/Segmented.vue'

const themes = [
  { value: 'light', label: 'Clair', icon: 'sun' },
  { value: 'dark', label: 'Sombre', icon: 'moon' },
  { value: 'auto', label: 'Auto', icon: 'auto' },
]
const sizes = [
  { value: 'small', label: 'Petit' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grand' },
]
// Deux temps pour les actions qui effacent : un premier appui demande confirmation
const confirming = ref(null)
let timer
function arm(what) {
  confirming.value = what
  clearTimeout(timer)
  timer = setTimeout(() => (confirming.value = null), 5000)
}
function run(what, action) {
  if (confirming.value !== what) return arm(what)
  confirming.value = null
  action()
}
</script>

<template>
  <div class="page settings">
    <header class="page-head">
      <h1>Réglages</h1>
      <p class="lede">Choisis l’apparence de ton cahier.</p>
    </header>

    <fieldset class="group">
      <legend class="group-title">Thème</legend>
      <Segmented v-model="state.settings.theme" :options="themes" label="Thème">
        <template #default="{ option }"><Icon :name="option.icon" :size="22" />{{ option.label }}</template>
      </Segmented>
    </fieldset>

    <fieldset class="group">
      <legend class="group-title">Couleur du cahier</legend>
      <div class="swatches" role="radiogroup" aria-label="Couleur du cahier">
        <button
          v-for="a in ACCENTS" :key="a.id" type="button" role="radio" class="swatch"
          :aria-checked="state.settings.accent === a.id" :aria-label="a.label"
          @click="state.settings.accent = a.id"
        >
          <span class="cover" :style="{ '--c': a.color }">
            <span class="cover-label" />
            <span v-if="state.settings.accent === a.id" class="cover-check"><Icon name="check" :size="18" /></span>
          </span>
          <span class="swatch-name">{{ a.label }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="group">
      <legend class="group-title">Taille du texte</legend>
      <Segmented v-model="state.settings.textSize" :options="sizes" label="Taille du texte" />
    </fieldset>

    <section class="group" aria-label="Données">
      <h2 class="group-title">Données</h2>
      <p class="muted">Tout reste sur cet appareil : rien n’est envoyé sur Internet.</p>
      <div class="row">
        <button type="button" class="btn" :class="{ 'btn--danger': confirming === 'history' }" @click="run('history', clearHistory)">
          <Icon name="trash" :size="20" />{{ confirming === 'history' ? 'Appuie encore pour effacer' : 'Effacer l’historique' }}
        </button>
        <button type="button" class="btn" :class="{ 'btn--danger': confirming === 'all' }" @click="run('all', resetEverything)">
          <Icon name="redo" :size="20" />{{ confirming === 'all' ? 'Appuie encore pour tout remettre à zéro' : 'Tout remettre à zéro' }}
        </button>
      </div>
    </section>
  </div>
</template>
