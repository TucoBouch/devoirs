// Lecture à voix haute avec la synthèse vocale du navigateur (Safari sur iPad : voix françaises préinstallées).
// Ce que le test sur l'iPad a montré, et que ce fichier gère :
// - la même voix est parfois listée deux fois : on retire les doublons ;
// - une lecture lancée juste après un arrêt peut se terminer aussitôt, sans rien dire : on laisse passer un instant
//   après chaque arrêt, et on relance une lecture qui s'est terminée sans avoir démarré ;
// - la première lecture doit partir d'un appui de l'élève, les suivantes peuvent s'enchaîner toutes seules.
import { onBeforeUnmount, ref } from 'vue'

export const speechAvailable = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined'

const REGION = { 'fr-FR': 'France', 'fr-CA': 'Canada', 'fr-BE': 'Belgique', 'fr-CH': 'Suisse' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Voix françaises sans doublon, celles de France d'abord
export function frenchVoices() {
  if (!speechAvailable()) return []
  const seen = new Set()
  const out = []
  for (const v of window.speechSynthesis.getVoices()) {
    if (!/^fr/i.test(v.lang)) continue
    const lang = v.lang.replace('_', '-')
    const key = `${v.name}|${lang}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: v.name, lang, label: `${v.name} · ${REGION[lang] ?? lang}`, voice: v })
  }
  return out.sort((a, b) => Number(b.lang === 'fr-FR') - Number(a.lang === 'fr-FR'))
}

// La liste des voix arrive en retard sur Safari : elle se met à jour toute seule
export function useVoices() {
  const voices = ref([])
  const refresh = () => { voices.value = frenchVoices() }
  if (speechAvailable()) {
    const synth = window.speechSynthesis
    refresh()
    synth.addEventListener?.('voiceschanged', refresh)
    const timers = [300, 1000, 2500].map((t) => setTimeout(refresh, t))
    onBeforeUnmount(() => {
      synth.removeEventListener?.('voiceschanged', refresh)
      timers.forEach(clearTimeout)
    })
  }
  return voices
}

let generation = 0
let lastStop = 0

// Arrête toute lecture ; les lectures en cours rendent la main avec { stopped: true }
export function stopSpeaking() {
  generation += 1
  lastStop = Date.now()
  if (speechAvailable()) window.speechSynthesis.cancel()
}

// Texte tel qu'il doit être prononcé : espaces insécables et apostrophes typographiques posent problème à certaines voix
export const speakable = (text) => text.replace(/[\u00a0\u202f]/g, ' ').replace(/[’‘]/g, "'")

// Lit un texte. Rend { ok, stopped } quand c'est fini ; ne rejette jamais.
export async function speak(text, { rate = 0.9, voiceName = '' } = {}) {
  if (!speechAvailable()) return { ok: false, stopped: false }
  const mine = ++generation
  const synth = window.speechSynthesis
  if (synth.speaking || synth.pending) { synth.cancel(); lastStop = Date.now() } // une seule voix à la fois
  const wait = 220 - (Date.now() - lastStop)
  if (wait > 0) await sleep(wait) // après un arrêt, Safari a besoin d'un instant
  if (mine !== generation) return { ok: false, stopped: true }

  const picked = frenchVoices().find((v) => v.name === voiceName) ?? frenchVoices()[0]
  for (let attempt = 0; attempt < 3; attempt++) {
    const outcome = await new Promise((resolve) => {
      const u = new window.SpeechSynthesisUtterance(speakable(text))
      u.lang = picked?.lang ?? 'fr-FR'
      if (picked) u.voice = picked.voice
      u.rate = rate
      const t0 = performance.now()
      let started = false
      let done = false
      const finish = (v) => { if (!done) { done = true; clearTimeout(guard); resolve(v) } }
      // sécurité : certaines voix ne signalent jamais la fin
      const guard = setTimeout(() => finish({ ok: false, silent: false }), 6000 + text.length * 300)
      u.onstart = () => { started = true }
      u.onend = () => finish({ ok: true, silent: !started && performance.now() - t0 < 250 })
      u.onerror = () => finish({ ok: false, silent: false })
      synth.speak(u)
    })
    if (mine !== generation) return { ok: false, stopped: true }
    if (!outcome.silent) return { ok: outcome.ok, stopped: false }
    await sleep(300) // terminée sans avoir parlé : on recommence
    if (mine !== generation) return { ok: false, stopped: true }
  }
  return { ok: false, stopped: false }
}
