import { describe, it, expect } from 'vitest'
import { estimateTokens, formatTokens } from '../tokens'

describe('estimateTokens', () => {
  it('renvoie 0 pour du vide', () => {
    expect(estimateTokens('')).toBe(0)
    expect(estimateTokens('   \n  ')).toBe(0)
  })

  it('ne descend jamais sous 1 pour du texte non vide', () => {
    expect(estimateTokens('a')).toBe(1)
  })

  it('tient dans la fourchette attendue sur de la prose anglaise reelle', () => {
    // Prose courante : mots de 4 a 5 lettres en moyenne. Les tokeniseurs BPE
    // tournent autour de 1,3 token par mot sur ce type de texte ; on accepte
    // 1,2 a 1,6 puisque l'heuristique surestime volontairement.
    const prose =
      'Layout systems drift over time. This one came back because it solved a ' +
      'problem that never went away, and it came back with receipts. The grid ' +
      'divides cleanly, it survives scaling, and it gives every team the same ' +
      'vocabulary for spacing without a meeting about it.'
    const words = prose.split(/\s+/).length
    const estimate = estimateTokens(prose)
    expect(estimate / words).toBeGreaterThanOrEqual(1.2)
    expect(estimate / words).toBeLessThanOrEqual(1.6)
  })

  it('surestime plutot que de sous-estimer sur du Markdown dense', () => {
    // Ponctuation et symboles font grimper le compte reel : la borne haute protege.
    const md = '## Why eight\n\n- Divides cleanly by 2 and 4\n\n`--space-md: 1rem;`'
    expect(estimateTokens(md)).toBeGreaterThanOrEqual(Math.round(md.length / 4))
  })

  it('croit avec la longueur', () => {
    expect(estimateTokens('word '.repeat(100))).toBeGreaterThan(estimateTokens('word '.repeat(10)))
  })
})

describe('formatTokens', () => {
  it('laisse les petits nombres tels quels', () => {
    expect(formatTokens(0)).toBe('0')
    expect(formatTokens(850)).toBe('850')
  })

  it('passe au k avec une decimale sous 10k', () => {
    expect(formatTokens(2400)).toBe('2.4k')
  })

  it('arrondit au k entier au dela de 10k', () => {
    expect(formatTokens(128000)).toBe('128k')
  })
})
