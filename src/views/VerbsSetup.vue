<script setup>
import { computed } from 'vue'
import { state, startQuiz, abandonQuiz, nav, reworkVerbs } from '../stores/state.js'
import { TENSES } from '../lib/conjugation.js'
import { ANSWER_TYPES, QUESTION_TYPES, COUNTS, VERB_SETS, inVerbSet } from '../lib/quiz.js'
import Icon from '../components/Icon.vue'
import Segmented from '../components/Segmented.vue'

const tenseOrder = TENSES.map((t) => t.id)
const answerOrder = ANSWER_TYPES.map((t) => t.id)
const questionOrder = QUESTION_TYPES.map((t) => t.id)

// On garde toujours au moins un choix dans chaque groupe
function toggle(key, id, order) {
  const list = state.config[key]
  const i = list.indexOf(id)
  if (i >= 0) {
    if (list.length > 1) list.splice(i, 1)
  } else {
    list.push(id)
    list.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }
}
const has = (key, id) => state.config[key].includes(id)

// Seuls les verbes du jeu choisi peuvent être retravaillés
const troubled = computed(() => reworkVerbs().filter((v) => inVerbSet(state.config.verbSet, v)))
const hasTroubleOutside = computed(() => reworkVerbs().length > 0 && !troubled.value.length)
const countOptions = COUNTS.map((n) => ({ value: n, label: String(n) }))

const examples = {
  pronoun: 'nous + chanter → …',
  sentence: 'Hier, Léa … une chanson.',
  qcm_form: 'Choisir : chantions, chantons…',
  qcm_end: 'chant… → -ions, -ons…',
  text_end: 'chant… → tape la fin',
  text_form: 'nous … → tape le verbe',
}

const summary = computed(() => {
  const n = state.config.tenses.length
  const verbs = state.config.verbSet === 'irregular' ? ' · irréguliers' : ''
  return `${state.config.count} questions · ${n} temps${verbs}`
})
</script>

<template>
  <div class="page setup">
    <header class="page-head">
      <h1>Révision des verbes</h1>
      <p class="lede">Choisis ce que tu veux réviser, puis lance le quiz.</p>
    </header>

    <section v-if="state.quiz" class="card resume" aria-label="Quiz en cours">
      <div>
        <h2 class="card-title">Un quiz est en cours</h2>
        <p class="muted">Question {{ state.quiz.index + 1 }} sur {{ state.quiz.items.length }}</p>
      </div>
      <div class="row">
        <button type="button" class="btn btn--primary" @click="nav.go({ name: 'quiz' })">
          <Icon name="play" :size="20" />Reprendre
        </button>
        <button type="button" class="btn btn--quiet" @click="abandonQuiz">Abandonner</button>
      </div>
    </section>

    <div class="setup-grid">
      <div class="setup-col">
        <fieldset class="group">
          <legend class="group-title">Verbes</legend>
          <div class="opts opts--2" role="radiogroup" aria-label="Verbes">
            <button
              v-for="s in VERB_SETS" :key="s.id" type="button" role="radio" class="opt"
              :aria-checked="state.config.verbSet === s.id" @click="state.config.verbSet = s.id"
            >
              <span class="opt-title"><Icon v-if="state.config.verbSet === s.id" name="check" :size="20" />{{ s.label }}</span>
              <span class="opt-example">{{ s.hint }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Temps</legend>
          <p class="hint">Tu peux en choisir plusieurs.</p>
          <div class="chips">
            <button
              v-for="t in TENSES" :key="t.id" type="button" class="chip"
              :aria-pressed="has('tenses', t.id)" @click="toggle('tenses', t.id, tenseOrder)"
            >
              <Icon v-if="has('tenses', t.id)" name="check" :size="20" />{{ t.label }}
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Type de question</legend>
          <div class="opts opts--2">
            <button
              v-for="o in QUESTION_TYPES" :key="o.id" type="button" class="opt"
              :aria-pressed="has('questionTypes', o.id)" @click="toggle('questionTypes', o.id, questionOrder)"
            >
              <span class="opt-title"><Icon v-if="has('questionTypes', o.id)" name="check" :size="20" />{{ o.label }}</span>
              <span class="opt-example">{{ examples[o.id] }}</span>
            </button>
          </div>
        </fieldset>

      </div>

      <div class="setup-col">
        <fieldset class="group">
          <legend class="group-title">Type de réponse</legend>
          <div class="opts opts--2">
            <button
              v-for="o in ANSWER_TYPES" :key="o.id" type="button" class="opt"
              :aria-pressed="has('answerTypes', o.id)" @click="toggle('answerTypes', o.id, answerOrder)"
            >
              <span class="opt-title"><Icon v-if="has('answerTypes', o.id)" name="check" :size="20" />{{ o.label }}</span>
              <span class="opt-example">{{ examples[o.id] }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Nombre de questions</legend>
          <Segmented v-model="state.config.count" :options="countOptions" label="Nombre de questions" />
        </fieldset>

        <section class="group">
          <h2 class="group-title">Mes erreurs</h2>
          <button
            type="button" role="switch" class="opt opt--switch"
            :aria-checked="state.config.rework && troubled.length > 0" :disabled="!troubled.length"
            @click="state.config.rework = !state.config.rework"
          >
            <span class="opt-title">Retravailler les verbes erronés</span>
            <span v-if="troubled.length" class="opt-example">
              Ajoute les verbes ratés dans tes 3 derniers quiz.
            </span>
            <span v-else-if="hasTroubleOutside" class="opt-example">
              Tes erreurs récentes ne concernent pas ces verbes.
            </span>
            <span v-else class="opt-example">Fais un premier quiz : tes erreurs apparaîtront ici.</span>
            <span class="switch" aria-hidden="true"><span class="switch-knob" /></span>
          </button>
          <ul v-if="troubled.length" class="verb-list" aria-label="Verbes à retravailler">
            <li v-for="v in troubled" :key="v" class="verb-tag">{{ v }}</li>
          </ul>
        </section>
      </div>
    </div>

    <footer class="launch">
      <p class="launch-sum">{{ summary }}</p>
      <button type="button" class="btn btn--primary btn--xl" @click="startQuiz()">
        Commencer le quiz<Icon name="arrow" />
      </button>
    </footer>
  </div>
</template>
