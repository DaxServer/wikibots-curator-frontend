import type { PresetItem } from '@/types/asyncapi'

export const makePreset = (overrides: Partial<PresetItem> = {}): PresetItem => ({
  id: 1,
  title: 'Test Preset',
  title_template: 'Test {{mapillary.user.username}}.jpg',
  labels: { language: 'en', value: 'Test description' },
  categories: 'Test category',
  exclude_from_date_category: false,
  handler: 'mapillary',
  is_default: false,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  ...overrides,
})
