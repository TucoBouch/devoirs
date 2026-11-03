<script setup>
// Choix unique parmi quelques options, façon "boutons surlignés"
defineProps({
  modelValue: { type: [String, Number], required: true },
  options: { type: Array, required: true }, // [{ value, label, icon? }]
  label: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="segmented" role="radiogroup" :aria-label="label">
    <button
      v-for="o in options" :key="o.value" type="button" role="radio" class="seg"
      :aria-checked="modelValue === o.value" :class="{ 'is-on': modelValue === o.value }"
      @click="emit('update:modelValue', o.value)"
    >
      <slot :option="o">{{ o.label }}</slot>
    </button>
  </div>
</template>
