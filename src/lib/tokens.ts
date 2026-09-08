// PixelLens — Estimation du nombre de tokens
//
// Pourquoi une estimation et pas un vrai tokeniseur : embarquer le BPE d'un
// modèle (js-tiktoken et consorts) coûte plusieurs mégaoctets dans le bundle,
// pour un chiffre qui ne sert qu'à répondre à « est-ce que ça rentre dans ma
// fenêtre de contexte ». Chaque modèle a d'ailleurs son propre tokeniseur, donc
// un chiffre exact pour l'un serait faux pour l'autre.
//
// L'heuristique ci-dessous combine les deux règles empiriques d'OpenAI, qui se
// corrigent l'une l'autre : environ 4 caractères par token, et environ 0,75 mot
// par token. La première dérive sur du texte dense en ponctuation (du code, du
// Markdown), la seconde sur du texte à mots longs. On prend la plus élevée des
// deux, parce qu'une sous-estimation est le seul cas qui nuit vraiment : elle
// laisse croire que le document rentre alors qu'il sera tronqué.
//
// L'UI doit toujours afficher ce chiffre précédé d'un « ~ ».

const CHARS_PER_TOKEN = 4
const TOKENS_PER_WORD = 1 / 0.75

/**
 * Estime le nombre de tokens d'un texte. Approximation volontairement haute,
 * généralement à moins de 10 % du compte réel des tokeniseurs BPE courants.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  const trimmed = text.trim()
  if (!trimmed) return 0

  const byChars = trimmed.length / CHARS_PER_TOKEN
  const words = trimmed.split(/\s+/).length
  const byWords = words * TOKENS_PER_WORD

  return Math.max(1, Math.round(Math.max(byChars, byWords)))
}

/**
 * Format court pour l'affichage : 850, 2.4k, 128k.
 * Les fenêtres de contexte se comptent en milliers, l'unité de lecture est le k.
 */
export function formatTokens(count: number): string {
  if (count < 1000) return String(count)
  const k = count / 1000
  return `${k < 10 ? k.toFixed(1) : Math.round(k)}k`
}
