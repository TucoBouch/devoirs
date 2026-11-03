// Navigation par l'historique du navigateur : le bouton retour revient à l'écran précédent
// et ne quitte jamais l'app (une entrée "garde" au pied de la pile est aussitôt remplacée).
const HOME = { name: 'verbes' }

export const hashFor = (route) => '#/' + route.name + (route.id != null ? '/' + route.id : '')

export function createNav(state, validate) {
  const apply = (route) => {
    state.route = validate(route)
  }

  function start() {
    const initial = validate(state.route)
    history.replaceState({ guard: true }, '', location.pathname + location.search)
    if (initial.name !== HOME.name) history.pushState({ route: HOME }, '', hashFor(HOME))
    history.pushState({ route: initial }, '', hashFor(initial))
    state.route = initial

    window.addEventListener('popstate', (e) => {
      const s = e.state
      if (!s || s.guard || !s.route) {
        // retour au-delà de l'accueil : on reste dans l'app
        history.pushState({ route: HOME }, '', hashFor(HOME))
        apply(HOME)
        return
      }
      apply(s.route)
    })
  }

  function go(route, { replace = false } = {}) {
    const next = validate(route)
    const same = next.name === state.route.name && next.id === state.route.id
    state.route = next
    if (same && !replace) return
    const method = replace || same ? 'replaceState' : 'pushState'
    history[method]({ route: next }, '', hashFor(next))
  }

  return { start, go }
}
