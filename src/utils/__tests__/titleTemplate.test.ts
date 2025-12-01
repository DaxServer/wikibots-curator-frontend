import type { Image } from '@/types/image'
import { describe, expect, it } from 'bun:test'
import { applyTitleTemplate, validateTemplate } from '../titleTemplate'

describe('titleTemplate utils', () => {
  const createMockImage = (id: string): Image => ({
    id,
    handler: 'mapillary',
    title: 'Original Title',
    description: 'Original Description',
    url: 'http://example.com/image.jpg',
    url_original: 'http://example.com/original.jpg',
    preview_url: 'http://example.com/preview.jpg',
    thumbnail_url: 'http://example.com/thumbnail.jpg',
    width: 100,
    height: 100,
    dates: { taken: new Date('2023-01-01T00:00:00Z') },
    location: { latitude: 0, longitude: 0, compass_angle: 0 },
    creator: { id: 'user', username: 'user', profile_url: '' },
    is_pano: false,
    existing: [],
  })

  describe('applyTitleTemplate', () => {
    it('replaces tokens correctly', () => {
      const image = createMockImage('1')
      const template = 'Photo by {{mapillary.user.username}} on {{captured.date}}'
      const result = applyTitleTemplate(template, image, 'seq123')
      expect(result).toBe('Photo by user on 2023-01-01')
    })

    it('handles missing values', () => {
      const image = createMockImage('1')
      // @ts-expect-error - forcing missing prop for test
      image.creator.username = undefined
      const template = 'Photo by {{mapillary.user.username}}'
      const result = applyTitleTemplate(template, image, 'seq123')
      expect(result).toBe('Photo by ')
    })

    it('ignores unknown tokens - Handlebars behavior', () => {
      const image = createMockImage('1')
      const template = 'Photo {{unknown.prop}}'
      const result = applyTitleTemplate(template, image, 'seq123')
      expect(result).toBe('Photo ')
    })

    it('handles whitespace in tokens', () => {
      const image = createMockImage('1')
      const template = 'Photo by {{ mapillary.user.username }}'
      const result = applyTitleTemplate(template, image, 'seq123')
      expect(result).toBe('Photo by user')
    })

    it('uses provided sequence', () => {
      const image = createMockImage('1')
      const template = 'Sequence: {{mapillary.photo.sequence}}'
      const result = applyTitleTemplate(template, image, 'test_sequence_id')
      expect(result).toBe('Sequence: test_sequence_id')
    })
  })

  describe('validateTemplate', () => {
    it('returns valid for empty string', () => {
      expect(validateTemplate('').valid).toBe(true)
    })

    it('returns valid for valid template', () => {
      expect(validateTemplate('Photo by {{mapillary.user.username}}').valid).toBe(true)
    })

    it('detects mismatched braces', () => {
      const result = validateTemplate('Photo {{mapillary.user.username')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Mismatched syntax')
    })

    it('detects empty tags', () => {
      const result = validateTemplate('Photo {{}}')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Empty tag')
    })

    it('detects invalid characters', () => {
      const result = validateTemplate('Photo {{creator-username}}')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unknown variable')
    })

    it('detects unknown variables', () => {
      const result = validateTemplate('Photo {{unknown.variable}}')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unknown variable')
    })

    it('allows whitespace in valid variables', () => {
      expect(validateTemplate('Photo {{ mapillary.user.username }}').valid).toBe(true)
    })
  })
})
