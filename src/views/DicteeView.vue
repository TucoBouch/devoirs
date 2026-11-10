<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { state, submitDictee } from '../stores/state.js'
import { tenseLabel } from '../lib/conjugation.js'
import { groupsOf, withPunctuation, rateOf, SPEEDS } from '../lib/dictee.js'
import { speak, stopSpeaking } from '../lib/speech.js'
import { useCoarsePointer } from '../lib/touch.js'
import Icon from '../components/Icon.vue'
import AppKeyboard from '../components/AppKeyboard.vue'

// Une dictée : l'élève écoute, puis écrit sur la feuille.
// Au doigt, comme pour les verbes, on écrit avec le clavier de l'app (celui du téléphone ou de l'iPad couvre la moitié
// de l'écran, corrige les mots tout seul et perd parfois l'espace après une virgule) ; la feuille est alors une simple
// page qui affiche le texte, sans champ à remplir. Avec une souris, la zone de texte et le clavier de l'ordinateur.
const quiz = computed(() => state.quiz)
const item = computed(() => quiz.value?.item)
const config = computed(() => quiz.value?.config ?? {})
const groups = computed(() => (item.value ? groupsOf(item.value.text) : []))

// La zone de texte n'est pas liée à Vue (pas de v-model) : sur l'iPad, Safari envoie des événements de composition
// pendant la frappe, et un champ lié ignore alors ce qui est tapé jusqu'à la fin du mot. Ici on relit toujours le texte
// directement dans la zone, au moindre événement et au moment de valider.
const coarse = useCoarsePointer()
const pad = ref(null)
const view = ref(null)
const draft = ref(quiz.value?.draft ?? '')
watch(draft, (v) => { if (state.quiz) state.quiz.draft = v })
watch(pad, (el) => { if (el) el.value = draft.value }) // la zone de texte reprend le texte déjà écrit
const sync = () => { if (pad.value) draft.value = pad.value.value }

// ---- Clavier de l'app --------------------------------------------------------------------------------
const MAX_LEN = 600
const toEnd = () => nextTick(() => { if (view.value) view.value.scrollTop = view.value.scrollHeight })
function typeChar(ch) {
  const text = draft.value
  if (text.length >= MAX_LEN) return
  if (ch === ' ' && (!text || text.endsWith(' '))) return // pas d'espace en tête ni doublée
  // une lettre juste après une ponctuation : l'espace se met toute seule
  const space = /\p{L}/u.test(ch) && PUNCT_BEFORE.test(text.slice(-1))
  draft.value = text + (space ? ' ' : '') + ch
  toEnd()
}
const backspace = () => { draft.value = draft.value.slice(0, -1) }
// Un clavier matériel branché sur l'iPad écrit aussi sur la feuille
const WRITABLE = /^[\p{L}'’ ,;:.!?…-]$/u
function onKeydown(e) {
  if (!coarse.value || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === 'Backspace') {
    e.preventDefault()
    backspace()
  } else if (WRITABLE.test(e.key) && !(e.key === ' ' && e.target instanceof HTMLButtonElement)) {
    e.preventDefault()
    typeChar(e.key)
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))

// Sur l'iPad, la barre d'espace tapée juste après une virgule ou un point n'arrive pas toujours à la page (le journal de
// touches le montre, même dans une zone de texte toute simple). Quand une lettre suit directement une ponctuation,
// on remet l'espace nous-mêmes ; la correction, de son côté, ne compte jamais cette espace comme une faute.
const PUNCT_BEFORE = /[,;:.!?…]/
function onInput(e) {
  const el = pad.value
  if (el && e.inputType === 'insertText' && /^\p{L}$/u.test(e.data ?? '')) {
    const caret = el.selectionStart // juste après la lettre tapée
    if (caret >= 2 && el.selectionEnd === caret && PUNCT_BEFORE.test(el.value[caret - 2])) {
      el.setRangeText(' ', caret - 1, caret - 1)
      el.setSelectionRange(caret + 1, caret + 1)
    }
  }
  sync()
}
const canSubmit = computed(() => draft.value.trim().length > 0)

// ---- Écoute --------------------------------------------------------------------------------------
// idle : rien lu encore · groups : on attend l'élève entre deux groupes · done : la lecture complète est terminée
const stage = ref('idle')
const gi = ref(0) // groupe en cours
const playing = ref(false)
const reading = ref('') // whole | group | final : ce qui est lu en ce moment
let last = { kind: 'whole' } // ce que « Répéter » relit
let session = 0 // change à chaque arrêt : une lecture interrompue ne continue pas toute seule

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rate = () => rateOf(config.value.speed)

// Lit un texte ; rend true si la lecture est allée au bout sans être interrompue
async function say(text, s, what) {
  reading.value = what
  playing.value = true
  const r = await speak(text, { rate: rate(), voiceName: config.value.voice })
  if (s !== session) return false
  playing.value = false
  return !r.stopped
}
const whole = (s, what = 'whole') => { last = { kind: 'whole' }; return say(item.value.text, s, what) }
function group(i, s) {
  stage.value = 'groups'
  gi.value = i
  last = { kind: 'group', i }
  const g = groups.value[i]
  return say(config.value.punct ? withPunctuation(g) : g, s, 'group')
}

function halt() {
  session += 1
  stopSpeaking()
  playing.value = false
}

async function start() {
  const s = ++session
  if (!(await whole(s))) return
  if (config.value.mode !== 'groups') { stage.value = 'done'; return }
  await sleep(700)
  if (s !== session) return
  await group(0, s)
}
async function nextGroup() {
  const s = ++session
  await group(gi.value + 1, s)
}
async function finalRead() {
  const s = ++session
  if (await whole(s, 'final')) stage.value = 'done'
}
async function replayWhole() {
  const s = ++session
  await whole(s)
}
async function repeat() {
  const s = ++session
  if (last.kind === 'group') await group(last.i, s)
  else await whole(s)
}

const primary = computed(() => {
  if (playing.value) return { label: 'Arrêter', icon: 'stop', act: halt }
  if (stage.value === 'idle') return { label: 'Écouter la dictée', icon: 'play', act: start }
  if (stage.value === 'groups') {
    return gi.value < groups.value.length - 1
      ? { label: 'Groupe suivant', icon: 'arrow', act: nextGroup }
      : { label: 'Relire en entier', icon: 'redo', act: finalRead }
  }
  return { label: 'Réécouter la dictée', icon: 'redo', act: replayWhole }
})

const status = computed(() => {
  if (playing.value) {
    if (reading.value === 'group') return `Groupe ${gi.value + 1} sur ${groups.value.length}…`
    return reading.value === 'final' ? 'Dernière lecture…' : 'Écoute la dictée en entier…'
  }
  if (stage.value === 'idle') return config.value.mode === 'groups' ? 'Lue en entier, puis groupe par groupe.' : 'Lue en entier.'
  if (stage.value === 'groups') return `Écris le groupe ${gi.value + 1} sur ${groups.value.length}, puis passe au suivant.`
  return 'Relis-toi et corrige, puis valide.'
})

// La vitesse se change en cours de route, d'un appui
const speed = computed(() => SPEEDS.find((x) => x.value === config.value.speed) ?? SPEEDS[0])
function nextSpeed() {
  const i = SPEEDS.findIndex((x) => x.value === speed.value.value)
  state.quiz.config.speed = SPEEDS[(i + 1) % SPEEDS.length].value
}

function finish() {
  sync()
  halt()
  submitDictee(pad.value ? pad.value.value : draft.value)
}
const leave = () => history.back()
onBeforeUnmount(() => { halt(); window.removeEventListener('keydown', onKeydown) })
</script>

<template>
  <section v-if="quiz && item" class="page dictee" aria-label="Dictée">
    <header class="dictee-head">
      <button type="button" class="btn btn--quiet btn--sm" @click="leave"><Icon name="back" :size="20" />Quitter</button>
      <p class="dictee-info">
        <span class="pill">{{ tenseLabel(item.t) }}</span>
        <span class="pill">{{ item.n }} phrase{{ item.n > 1 ? 's' : '' }}</span>
      </p>
      <button v-if="!coarse" type="button" class="btn btn--primary btn--sm" :disabled="!canSubmit" @click="finish">
        Valider<Icon name="check" :size="20" />
      </button>
    </header>

    <div class="dictee-player">
      <p class="dictee-status" aria-live="polite">{{ status }}</p>
      <div class="dictee-actions" role="group" aria-label="Lecture">
        <button type="button" class="btn btn--primary btn--sm" @pointerdown.prevent @click="primary.act">
          <Icon :name="primary.icon" :size="20" />{{ primary.label }}
        </button>
        <button v-if="stage !== 'idle' && !playing" type="button" class="btn btn--sm" @pointerdown.prevent @click="repeat">
          <Icon name="redo" :size="20" />Répéter
        </button>
        <button v-if="stage === 'groups' && !playing" type="button" class="btn btn--sm" @pointerdown.prevent @click="replayWhole">
          Tout relire
        </button>
        <button type="button" class="btn btn--sm" :aria-label="`Vitesse de la voix : ${speed.label}. Changer`" @pointerdown.prevent @click="nextSpeed">
          <Icon name="speaker" :size="20" />{{ speed.label }}
        </button>
      </div>
    </div>

    <div class="pad">
      <div v-if="coarse" ref="view" class="pad-text pad-view" role="textbox" aria-multiline="true" aria-label="Ta dictée">
        <span class="pad-view-text">{{ draft }}</span><span class="caret" aria-hidden="true" />
        <span v-if="!draft" class="pad-placeholder">Écris ici ce que tu entends.</span>
      </div>
      <label v-if="!coarse" class="sr-only" for="dictee-text">Ta dictée</label>
      <textarea
        v-if="!coarse" id="dictee-text" ref="pad" class="pad-text"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        placeholder="Écris ici ce que tu entends."
        @input="onInput" @change="sync" @keyup="sync" @blur="sync" @compositionend="sync"
      />
    </div>

    <AppKeyboard v-if="coarse" extended :can-submit="canSubmit" @key="typeChar" @back="backspace" @submit="finish" />
  </section>
</template>
