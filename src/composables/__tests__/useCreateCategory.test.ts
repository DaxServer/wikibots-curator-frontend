import { describe, expect, it } from 'bun:test'
import { getCategoryText, getFocalLengthRedirect } from '../useCreateCategory'

describe('getCategoryText', () => {
  describe('lensFocalLength - integer', () => {
    it('returns ImageTOC + Hiddencat + parent category with padded sort key', () => {
      expect(getCategoryText('Lens focal length 1 mm')).toBe(
        '{{ImageTOC}}\n{{Hiddencat}}\n\n[[Category:Photographs by lens focal length| 00001]]',
      )
    })

    it('pads large integers', () => {
      expect(getCategoryText('Lens focal length 200 mm')).toBe(
        '{{ImageTOC}}\n{{Hiddencat}}\n\n[[Category:Photographs by lens focal length| 00200]]',
      )
    })
  })

  describe('lensFocalLength - decimal dot', () => {
    it('creates subcategory of integer parent with decimal sort key', () => {
      expect(getCategoryText('Lens focal length 1.3 mm')).toBe(
        '{{Hiddencat}}\n{{ImageTOC}}\n[[Category:Lens focal length 1 mm| 1.3]]',
      )
    })

    it('uses integer part for parent category', () => {
      expect(getCategoryText('Lens focal length 79.1 mm')).toBe(
        '{{Hiddencat}}\n{{ImageTOC}}\n[[Category:Lens focal length 79 mm| 79.1]]',
      )
    })
  })

  describe('lensFocalLength - German comma decimal', () => {
    it('zero decimal redirects to integer parent category', () => {
      expect(getCategoryText('Lens focal length 79,0 mm')).toBe(
        '[[Category:Lens focal length 79 mm]]',
      )
    })

    it('non-zero decimal treated as dot notation subcategory', () => {
      expect(getCategoryText('Lens focal length 79,1 mm')).toBe(
        '{{Hiddencat}}\n{{ImageTOC}}\n[[Category:Lens focal length 79 mm| 79.1]]',
      )
    })

    it('multi-digit zero decimal redirects to integer parent', () => {
      expect(getCategoryText('Lens focal length 50,00 mm')).toBe(
        '[[Category:Lens focal length 50 mm]]',
      )
    })
  })
})

describe('getFocalLengthRedirect', () => {
  it('returns null for integer focal length', () => {
    expect(getFocalLengthRedirect('Lens focal length 79 mm')).toBeNull()
  })

  it('returns null for non-zero dot decimal', () => {
    expect(getFocalLengthRedirect('Lens focal length 79.1 mm')).toBeNull()
  })

  it('returns null for non-zero comma decimal', () => {
    expect(getFocalLengthRedirect('Lens focal length 79,1 mm')).toBeNull()
  })

  it('returns integer category for zero dot decimal', () => {
    expect(getFocalLengthRedirect('Lens focal length 79.0 mm')).toBe('Lens focal length 79 mm')
  })

  it('returns integer category for zero comma decimal', () => {
    expect(getFocalLengthRedirect('Lens focal length 79,0 mm')).toBe('Lens focal length 79 mm')
  })

  it('returns integer category for multi-digit zero decimal', () => {
    expect(getFocalLengthRedirect('Lens focal length 50,00 mm')).toBe('Lens focal length 50 mm')
  })

  it('returns null for unrelated category', () => {
    expect(getFocalLengthRedirect('January 2024 in Boston')).toBeNull()
  })
})
