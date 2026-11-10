<script setup>
import { computed } from 'vue'
import { state, nav, abandonQuiz } from '../stores/state.js'
import { exerciseOf } from '../lib/quiz.js'
import { EXERCISES } from '../lib/history.js'
import Icon from './Icon.vue'

// Un seul quiz peut être en cours : cette carte apparaît sur l'écran de chaque exercice
const label = computed(() => EXERCISES.find((e) => e.id === exerciseOf(state.quiz))?.label)
const progress = computed(() => {
  const q = state.quiz
  if (!q) return ''
  return exerciseOf(q) === 'dictees' ? 'dictée à écrire' : `question ${q.index + 1} sur ${q.items.length}`
})
</script>

<template>
  <section v-if="state.quiz" class="card resume" aria-label="Quiz en cours">
    <div>
      <h2 class="card-title">Un quiz est en cours</h2>
      <p class="muted">{{ label }} · {{ progress }}</p>
    </div>
    <div class="row">
      <button type="button" class="btn btn--primary" @click="nav.go({ name: 'quiz' })">
        <Icon name="play" :size="20" />Reprendre
      </button>
      <button type="button" class="btn btn--quiet" @click="abandonQuiz">Abandonner</button>
    </div>
  </section>
</template>
