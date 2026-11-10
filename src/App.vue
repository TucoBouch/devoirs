<script setup>
import { computed } from 'vue'
import { state, nav } from './stores/state.js'
import { exerciseOf } from './lib/quiz.js'
import { EXERCISES } from './lib/history.js'
import Icon from './components/Icon.vue'
import VerbsSetup from './views/VerbsSetup.vue'
import AccordsSetup from './views/AccordsSetup.vue'
import QuizView from './views/QuizView.vue'
import ResultView from './views/ResultView.vue'
import HistoryView from './views/HistoryView.vue'
import SettingsView from './views/SettingsView.vue'

const views = {
  verbes: VerbsSetup, accords: AccordsSetup, quiz: QuizView, resultat: ResultView, revue: ResultView,
  historique: HistoryView, reglages: SettingsView,
}
const section = computed(() => {
  const n = state.route.name
  if (n === 'historique' || n === 'revue') return 'historique'
  if (n === 'reglages') return 'reglages'
  // pendant un quiz ou sur son résultat, le menu garde l'exercice en cours en évidence
  if (n === 'quiz') return exerciseOf(state.quiz)
  if (n === 'resultat') return exerciseOf(state.history.find((h) => h.id === state.route.id))
  return n === 'accords' ? 'accords' : 'verbes'
})
const exercises = EXERCISES
const tools = [
  { id: 'historique', label: 'Historique', icon: 'clock' },
  { id: 'reglages', label: 'Réglages', icon: 'gear' },
]
const go = (id) => nav.go({ name: id })
const inQuiz = computed(() => state.route.name === 'quiz')
</script>

<template>
  <div class="shell" :class="{ 'shell--quiz': inQuiz }">
    <aside class="rail">
      <div class="brand"><span class="brand-label">Devoirs</span></div>
      <nav class="rail-nav" aria-label="Exercices">
        <p class="rail-label">Exercices</p>
        <button
          v-for="e in exercises" :key="e.id" type="button" class="nav-item"
          :class="{ 'is-on': section === e.id }" :aria-current="section === e.id ? 'page' : undefined"
          @click="go(e.id)"
        >
          <Icon :name="e.icon" /><span>{{ e.label }}</span>
        </button>
      </nav>
      <nav class="rail-nav rail-tools" aria-label="Outils">
        <button
          v-for="t in tools" :key="t.id" type="button" class="nav-item"
          :class="{ 'is-on': section === t.id }" :aria-current="section === t.id ? 'page' : undefined"
          @click="go(t.id)"
        >
          <Icon :name="t.icon" /><span>{{ t.label }}</span>
        </button>
      </nav>
    </aside>
    <main class="main" id="main">
      <component :is="views[state.route.name]" :key="state.route.name + (state.route.id ?? '')" />
    </main>
  </div>
</template>
