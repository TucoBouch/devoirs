// Accès sûr au localStorage : l'app doit rester utilisable même s'il est indisponible.
const PREFIX = 'devoirs:'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* stockage plein ou refusé : on continue sans sauvegarde */
  }
}

export function clear(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* rien à faire */
  }
}
