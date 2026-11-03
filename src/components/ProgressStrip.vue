<script setup>
import Icon from './Icon.vue'
// Une marque par question, à états fixes : juste, faux, en cours, à venir. Jamais la couleur seule.
const props = defineProps({
  total: { type: Number, required: true },
  results: { type: Array, required: true },
  index: { type: Number, default: -1 },
})
const stateOf = (i) => {
  const r = props.results[i]
  if (r) return r.correct ? 'ok' : 'ko'
  return i === props.index ? 'now' : 'todo'
}
const label = (i) => ({ ok: 'réussie', ko: 'ratée', now: 'en cours', todo: 'à venir' })[stateOf(i)]
</script>

<template>
  <ol class="strip" :class="{ 'strip--dense': total > 20 }" role="list">
    <li v-for="i in total" :key="i" class="mark" :class="`mark--${stateOf(i - 1)}`">
      <Icon v-if="stateOf(i - 1) === 'ok'" name="check" :size="14" />
      <Icon v-else-if="stateOf(i - 1) === 'ko'" name="x" :size="14" />
      <span class="sr-only">Question {{ i }} : {{ label(i - 1) }}</span>
    </li>
  </ol>
</template>
