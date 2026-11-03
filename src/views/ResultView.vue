<script setup>
import { computed } from 'vue'
import { state, startQuiz, nav } from '../stores/state.js'
import { tenseLabel } from '../lib/conjugation.js'
import { mistakeView, promptParts, scoreMessage, configSummary } from '../lib/quiz.js'
import Icon from '../components/Icon.vue'
import ProgressStrip from '../components/ProgressStrip.vue'

const entry = computed(() => state.history.find((h) => h.id === state.route.id))
const fresh = computed(() => state.route.name === 'resultat')
const views = computed(() => (entry.value?.mistakes ?? []).map(mistakeView).filter(Boolean))
const wrongVerbs = computed(() => [...new Set((entry.value?.mistakes ?? []).map((m) => m.v))])
// une marque par question, dans l'ordre où elles ont été posées
const marks = computed(() => {
  if (!entry.value) return []
  const { marks: m, total, mistakes } = entry.value
  if (m) return [...m].map((c) => ({ correct: c === '1' }))
  return Array.from({ length: total }, (_, i) => ({ correct: i >= mistakes.length }))
})
const date = computed(() =>
  new Date(entry.value.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
)
const percent = computed(() => Math.round((entry.value.score / entry.value.total) * 100))

// Les erreurs d'avant le renouvellement des phrases n'ont pas gardé leur énoncé
const lost = computed(() => (entry.value?.mistakes.length ?? 0) - views.value.length)

function replay(rework = false) {
  // un ancien quiz n'a pas de choix de verbes : tous les verbes
  Object.assign(state.config, { verbSet: 'all' }, JSON.parse(JSON.stringify(entry.value.config)), { rework })
  startQuiz()
}
const parts = (v) => promptParts(v)
// Forme complète de l'élève (barrée) et forme juste (réécrite en rouge), même pour une terminaison
const fix = (v) => {
  const ending = v.at === 'qcm_end' || v.at === 'text_end'
  if (ending) return { given: v.given ? v.stem + v.given : '', right: v.stem + v.end }
  return { given: v.given, right: v.a }
}
</script>

<template>
  <div v-if="entry" class="page result">
    <header class="copy-head">
      <div class="page-head">
        <h1>{{ fresh ? 'Quiz terminé' : `Quiz du ${date}` }}</h1>
        <p class="muted">
          {{ percent }} % de réussite · {{ configSummary(entry.config) }}
          <template v-if="entry.accents"> · {{ entry.accents }} accent{{ entry.accents > 1 ? 's' : '' }} à surveiller</template>
        </p>
      </div>
      <div class="note" role="img" :aria-label="`Note : ${entry.score} sur ${entry.total}. ${scoreMessage(entry.score, entry.total)}`">
        <span class="note-score" aria-hidden="true">
          <svg class="note-ring" viewBox="0 0 240 120" preserveAspectRatio="none" focusable="false">
            <path pathLength="1" d="M30 66C18 30 78 10 128 11c52 1 100 20 94 52-5 33-62 48-114 44C60 103 14 86 20 52c3-20 28-34 56-40" />
          </svg>
          {{ entry.score }}<span class="note-total">/{{ entry.total }}</span>
        </span>
        <span class="note-msg" aria-hidden="true">{{ scoreMessage(entry.score, entry.total) }}</span>
      </div>
    </header>

    <section class="recap" aria-label="Récapitulatif">
      <ProgressStrip :total="entry.total" :results="marks" />
    </section>

    <section v-if="entry.mistakes.length" class="group" aria-label="Erreurs">
      <h2 class="group-title">À revoir</h2>
      <ul class="mistakes sheet">
        <li v-for="v in views" :key="v.id" class="mistake">
          <p class="mistake-line">
            <span>{{ parts(v).lead }}</span><span class="slot is-filled is-ko"><s v-if="fix(v).given" class="given">{{ fix(v).given }}</s><span class="slot-text">{{ fix(v).right }}</span></span><span>{{ parts(v).tail }}</span>
          </p>
          <p class="mistake-meta"><span class="pill">{{ v.v }}</span><span class="pill">{{ tenseLabel(v.t) }}</span></p>
        </li>
      </ul>
      <p v-if="lost" class="muted">
        {{ lost === 1 ? 'Une erreur' : `${lost} erreurs` }} de ce quiz ne {{ lost === 1 ? 'peut' : 'peuvent' }} plus être
        {{ lost === 1 ? 'affichée' : 'affichées' }} : les phrases ont été renouvelées depuis.
      </p>
    </section>
    <section v-else class="card calm">
      <p>Aucune erreur dans ce quiz. Rien à revoir !</p>
    </section>

    <footer class="actions">
      <button v-if="fresh && wrongVerbs.length" type="button" class="btn btn--primary btn--lg" @click="replay(true)">
        <Icon name="target" />Retravailler mes erreurs
      </button>
      <button type="button" class="btn btn--lg" :class="fresh && wrongVerbs.length ? '' : 'btn--primary'" @click="replay(false)">
        <Icon name="redo" />{{ fresh ? 'Rejouer' : 'Rejouer ce quiz' }}
      </button>
      <button type="button" class="btn btn--quiet btn--lg" @click="nav.go({ name: fresh ? 'verbes' : 'historique' })">
        {{ fresh ? 'Retour' : 'Retour à l’historique' }}
      </button>
    </footer>
  </div>
</template>
