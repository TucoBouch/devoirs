import { createApp } from 'vue'
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource-variable/playwrite-fr-moderne/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.vue'
import { state, nav, applyAppearance } from './stores/state.js'

applyAppearance()
if (import.meta.env.DEV) window.__devoirs = state // inspection en développement seulement
nav.start()
createApp(App).mount('#app')
