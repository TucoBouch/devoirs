<script setup>
import { computed } from 'vue'
import { state, startAccords, reworkRules } from '../stores/state.js'
import { SKILLS, NATURES, ACCORD_ANSWERS, COUNTS, ruleSkill } from '../lib/accords.js'
import { RULES } from '../lib/accord-rules.js'
import Icon from '../components/Icon.vue'
import Segmented from '../components/Segmented.vue'
import ResumeCard from '../components/ResumeCard.vue'

const orders = {
  skills: SKILLS.map((x) => x.id),
  natures: NATURES.map((x) => x.id),
  answerTypes: ACCORD_ANSWERS.map((x) => x.id),
}

// On garde toujours au moins un choix dans chaque groupe
function toggle(key, id) {
  const list = state.accords[key]
  const i = list.indexOf(id)
  if (i >= 0) {
    if (list.length > 1) list.splice(i, 1)
  } else {
    list.push(id)
    list.sort((a, b) => orders[key].indexOf(a) - orders[key].indexOf(b))
  }
}
const has = (key, id) => state.accords[key].includes(id)

// Seules les règles du féminin ou du pluriel choisis peuvent être retravaillées
const troubled = computed(() => reworkRules().filter((r) => state.accords.skills.includes(ruleSkill(r))))
const hasTroubleOutside = computed(() => reworkRules().length > 0 && !troubled.value.length)
const countOptions = COUNTS.map((n) => ({ value: n, label: String(n) }))

const examples = {
  qcm_form: 'Choisir : chevaux, chevals…',
  text_form: 'cheval → tape chevaux',
}

const summary = computed(() => {
  const { skills, natures, count } = state.accords
  const what = skills.length === 2 ? 'féminin et pluriel' : skills[0] === 'f' ? 'féminin' : 'pluriel'
  const kinds = natures.length === 2 ? 'noms et adjectifs' : natures[0] === 'nom' ? 'noms' : 'adjectifs'
  return `${count} questions · ${what} · ${kinds}`
})
</script>

<template>
  <div class="page setup">
    <header class="page-head">
      <h1>Féminin et pluriel</h1>
      <p class="lede">Choisis ce que tu veux réviser, puis lance le quiz.</p>
    </header>

    <ResumeCard />

    <div class="setup-grid">
      <div class="setup-col">
        <fieldset class="group">
          <legend class="group-title">Je révise</legend>
          <p class="hint">Tu peux en choisir plusieurs.</p>
          <div class="opts opts--2">
            <button
              v-for="o in SKILLS" :key="o.id" type="button" class="opt"
              :aria-pressed="has('skills', o.id)" @click="toggle('skills', o.id)"
            >
              <span class="opt-title"><Icon v-if="has('skills', o.id)" name="check" :size="20" />{{ o.label }}</span>
              <span class="opt-example">{{ o.hint }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Les mots</legend>
          <div class="opts opts--2">
            <button
              v-for="o in NATURES" :key="o.id" type="button" class="opt"
              :aria-pressed="has('natures', o.id)" @click="toggle('natures', o.id)"
            >
              <span class="opt-title"><Icon v-if="has('natures', o.id)" name="check" :size="20" />{{ o.label }}</span>
              <span class="opt-example">{{ o.hint }}</span>
            </button>
          </div>
        </fieldset>
      </div>

      <div class="setup-col">
        <fieldset class="group">
          <legend class="group-title">Type de réponse</legend>
          <div class="opts opts--2">
            <button
              v-for="o in ACCORD_ANSWERS" :key="o.id" type="button" class="opt"
              :aria-pressed="has('answerTypes', o.id)" @click="toggle('answerTypes', o.id)"
            >
              <span class="opt-title"><Icon v-if="has('answerTypes', o.id)" name="check" :size="20" />{{ o.label }}</span>
              <span class="opt-example">{{ examples[o.id] }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend class="group-title">Nombre de questions</legend>
          <Segmented v-model="state.accords.count" :options="countOptions" label="Nombre de questions" />
        </fieldset>

        <section class="group">
          <h2 class="group-title">Mes erreurs</h2>
          <button
            type="button" role="switch" class="opt opt--switch"
            :aria-checked="state.accords.rework && troubled.length > 0" :disabled="!troubled.length"
            @click="state.accords.rework = !state.accords.rework"
          >
            <span class="opt-title">Retravailler mes erreurs</span>
            <span v-if="troubled.length" class="opt-example">
              Ajoute des mots qui suivent les règles de tes 3 derniers quiz ratés.
            </span>
            <span v-else-if="hasTroubleOutside" class="opt-example">
              Tes erreurs récentes ne concernent pas ce choix.
            </span>
            <span v-else class="opt-example">Fais un premier quiz : tes erreurs apparaîtront ici.</span>
            <span class="switch" aria-hidden="true"><span class="switch-knob" /></span>
          </button>
          <ul v-if="troubled.length" class="verb-list" aria-label="Règles à retravailler">
            <li v-for="r in troubled" :key="r" class="verb-tag">{{ RULES[r].short }}</li>
          </ul>
        </section>
      </div>
    </div>

    <footer class="launch">
      <p class="launch-sum">{{ summary }}</p>
      <button type="button" class="btn btn--primary btn--xl" @click="startAccords()">
        Commencer le quiz<Icon name="arrow" />
      </button>
    </footer>
  </div>
</template>
