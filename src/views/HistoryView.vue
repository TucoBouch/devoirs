<script setup>
import { computed } from 'vue'
import { state, nav, startQuiz, startAccords, reworkVerbs, reworkRules } from '../stores/state.js'
import { inVerbSet } from '../lib/quiz.js'
import { ruleSkill } from '../lib/accords.js'
import { RULES } from '../lib/accord-rules.js'
import { entrySummary } from '../lib/history.js'
import Icon from '../components/Icon.vue'

const troubled = computed(() => reworkVerbs())
const rules = computed(() => reworkRules())

const day = (iso) => {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  const same = (a, b) => a.toDateString() === b.toDateString()
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (same(d, today)) return `Aujourd’hui, ${time}`
  if (same(d, yesterday)) return `Hier, ${time}`
  return `${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}, ${time}`
}

// Ce quiz sert à retravailler tous les verbes listés ici, même si le jeu de verbes choisi les exclut
function reworkQuiz() {
  state.config.rework = true
  const outside = troubled.value.some((v) => !inVerbSet(state.config.verbSet, v))
  startQuiz(outside ? { verbSet: 'all' } : {})
}

// Même principe pour le féminin et le pluriel : le quiz couvre toutes les règles listées ici
function reworkAccords() {
  state.accords.rework = true
  const outside = rules.value.some((r) => !state.accords.skills.includes(ruleSkill(r)))
  startAccords(outside ? { skills: ['f', 'p'] } : {})
}
</script>

<template>
  <div class="page history">
    <header class="page-head">
      <h1>Historique</h1>
      <p class="lede">Tes 10 derniers quiz de chaque exercice.</p>
    </header>

    <section v-if="troubled.length" class="card trouble" aria-label="Verbes à retravailler">
      <div>
        <h2 class="card-title">Verbes à retravailler</h2>
        <p class="muted">Verbes ratés dans tes 3 derniers quiz.</p>
        <ul class="verb-list">
          <li v-for="v in troubled" :key="v" class="verb-tag">{{ v }}</li>
        </ul>
      </div>
      <button type="button" class="btn btn--primary" @click="reworkQuiz"><Icon name="target" :size="20" />Lancer un quiz</button>
    </section>

    <section v-if="rules.length" class="card trouble" aria-label="Règles à retravailler">
      <div>
        <h2 class="card-title">Règles à retravailler</h2>
        <p class="muted">Féminin et pluriel : règles ratées dans tes 3 derniers quiz.</p>
        <ul class="verb-list">
          <li v-for="r in rules" :key="r" class="verb-tag">{{ RULES[r].short }}</li>
        </ul>
      </div>
      <button type="button" class="btn btn--primary" @click="reworkAccords"><Icon name="target" :size="20" />Lancer un quiz</button>
    </section>

    <ul v-if="state.history.length" class="runs">
      <li v-for="h in state.history" :key="h.id">
        <button type="button" class="run" @click="nav.go({ name: 'revue', id: h.id })">
          <span class="run-main">
            <span class="run-date">{{ day(h.date) }}</span>
            <span class="run-sum">{{ entrySummary(h, true) }}</span>
          </span>
          <span class="run-gauge" aria-hidden="true"><span class="run-fill" :style="{ width: (h.score / h.total) * 100 + '%' }" /></span>
          <span class="run-score"><b>{{ h.score }}</b> / {{ h.total }}</span>
        </button>
      </li>
    </ul>
    <section v-else class="card calm">
      <h2 class="card-title">Pas encore de quiz</h2>
      <p class="muted">Dès que tu auras terminé un quiz, il apparaîtra ici.</p>
      <button type="button" class="btn btn--primary" @click="nav.go({ name: 'verbes' })">Faire un premier quiz</button>
    </section>
  </div>
</template>
