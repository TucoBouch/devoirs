// Vrai quand l'appareil se commande au doigt (iPad, téléphone) : le pointeur principal est « grossier ».
// La requête est lue à l'appel, pas à l'import, pour suivre un changement d'appareil (souris branchée, etc.).
import { onBeforeUnmount, ref } from 'vue'

export function useCoarsePointer() {
  const query = window.matchMedia('(pointer: coarse)')
  const coarse = ref(query.matches)
  const update = () => { coarse.value = query.matches }
  query.addEventListener?.('change', update)
  onBeforeUnmount(() => query.removeEventListener?.('change', update))
  return coarse
}
