<script setup>
// Clavier à l'écran de l'app, pour les réponses écrites au doigt.
// Celui de l'iPad couvre la moitié de l'écran en paysage et fait défiler la page : celui-ci reste dans la page,
// plus bas que la phrase, avec les lettres accentuées à portée de pouce.
import { onBeforeUnmount, ref } from 'vue'
import Icon from './Icon.vue'

// extended : une rangée de plus avec la majuscule et la ponctuation, pour écrire des phrases entières (la dictée)
const props = defineProps({ canSubmit: { type: Boolean, default: false }, extended: { type: Boolean, default: false } })
const emit = defineEmits(['key', 'back', 'submit'])

// La majuscule vaut pour la prochaine lettre seulement
const shift = ref(false)
const PUNCT = [',', '.', '?', '!', ';', ':', '-']
const show = (k) => (shift.value ? k.toUpperCase() : k)
function press(k) {
  emit('key', props.extended && shift.value ? k.toUpperCase() : k)
  shift.value = false
}

const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'î', 'ï', 'ô', 'ç', 'œ']
const ROW_1 = [...'azertyuiop']
const ROW_2 = [...'qsdfghjklm']
const ROW_3 = [...'wxcvbn', '\'']

// Effacer en continu quand on garde le doigt appuyé
let delay
let repeat
const stop = () => { clearTimeout(delay); clearInterval(repeat) }
function pressBack() {
  stop()
  emit('back')
  delay = setTimeout(() => { repeat = setInterval(() => emit('back'), 70) }, 400)
}
// Un clic sans doigt (clavier matériel, lecteur d'écran) efface une seule lettre
const clickBack = (e) => { if (e.detail === 0) emit('back') }
onBeforeUnmount(stop)
</script>

<template>
  <div class="appkb" role="group" aria-label="Clavier">
    <div class="appkb-row appkb-row--accents">
      <button
        v-for="k in ACCENTS" :key="k" type="button" class="kkey kkey--accent" tabindex="-1"
        @pointerdown.prevent @click="press(k)"
      >{{ show(k) }}</button>
    </div>
    <div class="appkb-row">
      <button v-for="k in ROW_1" :key="k" type="button" class="kkey" tabindex="-1" @pointerdown.prevent @click="press(k)">{{ show(k) }}</button>
    </div>
    <div class="appkb-row">
      <button v-for="k in ROW_2" :key="k" type="button" class="kkey" tabindex="-1" @pointerdown.prevent @click="press(k)">{{ show(k) }}</button>
    </div>
    <div class="appkb-row">
      <button v-for="k in ROW_3" :key="k" type="button" class="kkey" tabindex="-1" @pointerdown.prevent @click="press(k)">{{ show(k) }}</button>
      <button
        type="button" class="kkey kkey--wide" tabindex="-1" aria-label="Effacer"
        @pointerdown.prevent="pressBack" @pointerup="stop" @pointerleave="stop" @pointercancel="stop" @click="clickBack"
      ><Icon name="backspace" :size="28" /></button>
    </div>
    <div v-if="extended" class="appkb-row">
      <button
        type="button" class="kkey kkey--wide" tabindex="-1" aria-label="Majuscule" :aria-pressed="shift"
        @pointerdown.prevent @click="shift = !shift"
      ><Icon name="shift" :size="26" /></button>
      <button v-for="k in PUNCT" :key="k" type="button" class="kkey" tabindex="-1" @pointerdown.prevent @click="emit('key', k)">{{ k }}</button>
    </div>
    <div class="appkb-row">
      <button type="button" class="kkey kkey--space" tabindex="-1" @pointerdown.prevent @click="emit('key', ' ')">espace</button>
      <button type="button" class="kkey kkey--go" :disabled="!canSubmit" @pointerdown.prevent @click="emit('submit')">Valider</button>
    </div>
  </div>
</template>
