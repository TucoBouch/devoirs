<script setup>
// Icônes en trait, 24x24, héritent de la couleur du texte
defineProps({ name: { type: String, required: true }, size: { type: Number, default: 24 } })

const paths = {
  pen: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z M14 7l3 3',
  book: 'M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5z M5 19.5A1.5 1.5 0 006.5 21H19v-3 M9 8h6 M9 12h4',
  clock: 'M12 7v5l3 2 M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8z M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M21 13.2A8.5 8.5 0 1110.8 3a6.7 6.7 0 0010.2 10.2z',
  auto: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 3v18 M12 3a9 9 0 010 18',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 6l-6 6 6 6',
  backspace: 'M21 5H9l-6 7 6 7h12a1 1 0 001-1V6a1 1 0 00-1-1z M13 9.5l5 5 M18 9.5l-5 5',
  play: 'M7 5l12 7-12 7z',
  stop: 'M7 7h10v10H7z',
  speaker: 'M11 5L6 9H3v6h3l5 4V5z M15.5 8.5a5 5 0 010 7 M18.5 5.5a9 9 0 010 13',
  redo: 'M20 11a8 8 0 10-2.3 6.3 M20 4v7h-7',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 16a4 4 0 100-8 4 4 0 000 8z M12 12h.01',
}
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"
  >
    <path :d="paths[name]" />
  </svg>
</template>
