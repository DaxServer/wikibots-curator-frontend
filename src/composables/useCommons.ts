import { WikidataEntity, WikidataProperty } from '@/components/wikidata/useWikidata'
import {
  createCopyrightLicenseClaim,
  createCopyrightStatusClaim,
  createCreatorClaim,
  createExternalIdSnak,
  createExternalIdStatement,
  createHeightClaim,
  createInceptionClaim,
  createPointOfViewClaim,
  createSourceOfFileClaim,
  createWidthClaim,
  createWikibaseItemStatement,
} from '@/composables/sdc'
import { useTitleBlacklist } from '@/composables/useTitleBlacklist'
import { useCollectionsStore } from '@/stores/collections.store'
import type { Image, Item, Metadata, TitleStatus } from '@/types/image'
import { TITLE_STATUS } from '@/types/image'
import { applyTitleTemplate, isValidExtension } from '@/utils/titleTemplate'
import { debounce } from 'ts-debounce'

let titleVerificationAbortController: AbortController | null = null

const debouncedCheckTitleMap = new Map<string, ReturnType<typeof debounce>>()

const getTitleVerificationAbortController = (): AbortController => {
  if (
    titleVerificationAbortController === null ||
    titleVerificationAbortController.signal.aborted
  ) {
    titleVerificationAbortController = new AbortController()
  }
  return titleVerificationAbortController
}

export const useCommons = () => {
  const store = useCollectionsStore()
  const { isBlacklisted } = useTitleBlacklist()

  const applyMetaDefaults = (meta: Metadata, fallbackTitle: string): Metadata => {
    const title = meta.title?.trim() || fallbackTitle

    return {
      ...meta,
      title,
      description: {
        language: meta.description.language.trim() || store.globalLanguage.trim(),
        value: meta.description.value.trim() || store.globalDescription.trim(),
      },
      categories: meta.categories || store.globalCategories,
    }
  }

  const buildWikitext = (item: Item): string => {
    const date = `${item.image.dates.taken.toISOString().split('.')[0]}Z`
    const source = sourceLink(item.id, store.input)
    let categories = item.meta.categories

    if (!categories.includes('Category:Images from Mapillary uploaded with Curator')) {
      categories = `${categories.trim()}\n[[Category:Images from Mapillary uploaded with Curator]]`
    }

    let additionalInfo = ''

    additionalInfo = `{{Location|${item.image.location.latitude}|${item.image.location.longitude}`
    if (item.image.location.compass_angle) {
      additionalInfo += `|heading:${item.image.location.compass_angle}`
    }
    additionalInfo += '}}'
    if (item.image.camera.is_pano === true) additionalInfo += '\n{{Pano360}}'

    categories = categories.trim()

    const license = item.meta.license?.trim() || store.globalLicense.trim() || '{{cc-by-sa-4.0}}'

    const info = `== {{int:filedesc}} ==
{{Information
 | date        = {{Taken on|${date}}}
 | source      = ${source}
}}
${additionalInfo}

== {{int:license-header}} ==
${license}

${categories}
`

    return info
  }

  const wikitext = (item: Item) => {
    const meta = applyMetaDefaults(item.meta, getTemplateTitle(item.image))
    return buildWikitext({ ...item, meta: meta as Metadata })
  }

  const validateTitle = (
    item: { id: string; title: string; image: Image },
    duplicateTitles: Set<string>,
  ): TitleStatus | null => {
    if (!isValidExtension(item.title)) return TITLE_STATUS.Invalid
    if (isBlacklisted(item.title)) return TITLE_STATUS.Blacklisted

    const effectiveTitle = item.title || getTemplateTitle(item.image)
    if (effectiveTitle && duplicateTitles.has(effectiveTitle)) return TITLE_STATUS.Duplicate

    return null
  }

  const verifyTitles = async (
    items: { id: string; title: string; image: Image }[],
    options: { debounce?: boolean } = {},
  ): Promise<void> => {
    const duplicateTitles = findDuplicateTitles()

    if (options.debounce) {
      for (const item of items) {
        const error = validateTitle(item, duplicateTitles)
        if (error) {
          store.updateItem(item.id, 'titleStatus', error)
          continue
        }

        store.updateItem(item.id, 'titleStatus', TITLE_STATUS.Checking)
        if (!debouncedCheckTitleMap.has(item.id)) {
          const debounced = debounce(async (id: string, title: string) => {
            await checkFileTitleAvailability([{ id, title }])
          }, 100)
          debouncedCheckTitleMap.set(item.id, debounced)
        }
        debouncedCheckTitleMap.get(item.id)!(item.id, item.title)
      }
      return
    }

    const validItems: { id: string; title: string }[] = []

    for (const item of items) {
      const error = validateTitle(item, duplicateTitles)
      if (error) {
        store.updateItem(item.id, 'titleStatus', error)
        continue
      }

      store.updateItem(item.id, 'titleStatus', TITLE_STATUS.Checking)
      validItems.push({ id: item.id, title: item.title })
    }

    if (validItems.length > 0) {
      await checkFileTitleAvailability(validItems)
    }
  }

  const checkFileTitleAvailability = async (
    items: { id: string; title: string }[],
  ): Promise<void> => {
    const signal = getTitleVerificationAbortController().signal
    const chunkSize = 50

    for (let i = 0; i < items.length; i += chunkSize) {
      if (signal.aborted) return

      const chunk = items.slice(i, i + chunkSize)
      const fileTitles = chunk.map((item) => `File:${item.title}`)
      const params = new URLSearchParams()
      params.set('action', 'query')
      params.set('prop', 'revisions')
      params.set('titles', fileTitles.join('|'))
      params.set('format', 'json')
      params.set('origin', '*')
      params.set('formatversion', '2')

      let res: Response | null = null
      try {
        res = await fetch('https://commons.wikimedia.org/w/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
          signal,
        })
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') return
        continue
      }

      if (signal.aborted) return
      if (!res || !res.ok) continue
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { missing?: boolean; title: string; revisions?: unknown[] }>
        }
      }

      const pages = Object.values(data.query?.pages || {})

      for (const item of chunk) {
        if (signal.aborted) return

        const page = pages.find((p) => p.title === `File:${item.title}`)
        let status: TitleStatus = TITLE_STATUS.Unknown

        if (!page) {
          status = TITLE_STATUS.Unknown
        } else if (page.missing) {
          status = TITLE_STATUS.Available
        } else if (page.revisions) {
          status = TITLE_STATUS.Taken
        }

        store.updateItem(item.id, 'titleStatus', status)
      }
    }
  }

  const cancelTitleVerification = (): void => {
    titleVerificationAbortController?.abort()
    titleVerificationAbortController = null

    for (const debounced of debouncedCheckTitleMap.values()) {
      debounced.cancel()
    }
    debouncedCheckTitleMap.clear()

    for (const item of Object.values(store.items)) {
      if (item.meta.titleStatus === TITLE_STATUS.Checking) {
        store.updateItem(item.id, 'titleStatus', TITLE_STATUS.Unknown)
      }
    }
  }

  const sourceLink = (id: string, sequenceId?: string): string => {
    return `{{Mapillary-source|key=${id}}} Sequence ID: ${sequenceId ?? ''}`
  }

  const buildTitle = (image: Image): string => {
    const date = image.dates.taken.toISOString().split('T')[0]!
    return `Photo from Mapillary ${date} (${image.id}).jpg`
  }

  const getTemplateTitle = (image: Image): string => {
    const template = store.globalTitleTemplate.trim()
    if (!template) return buildTitle(image)

    const computed = applyTitleTemplate(template, image, store.input).trim()
    if (!computed) return buildTitle(image)

    return computed
  }

  const getEffectiveTitle = (item: Item): string => {
    const explicit = item.meta.title?.trim()
    if (explicit) return explicit

    return getTemplateTitle(item.image)
  }

  const findDuplicateTitles = (): Set<string> => {
    const titleCount = new Map<string, number>()
    for (const item of store.selectedItems) {
      const title = getEffectiveTitle(item)
      titleCount.set(title, (titleCount.get(title) || 0) + 1)
    }
    const duplicates = new Set<string>()
    for (const [title, count] of titleCount.entries()) {
      if (count > 1) duplicates.add(title)
    }
    return duplicates
  }

  const buildDescription = (): string => {
    return 'Photo from Mapillary'
  }

  const buildSDC = (id: string, image: Image, license?: string): Statement[] => {
    const claims: Statement[] = []

    // Creator
    claims.push(
      createCreatorClaim(image.creator.username, [
        createExternalIdSnak(WikidataProperty.MapillaryUsername, image.creator.username),
      ]),
    )

    // Mapillary ID
    claims.push(createExternalIdStatement(WikidataProperty.MapillaryPhotoID, id))

    // Published in
    claims.push(
      createWikibaseItemStatement(WikidataProperty.PublishedIn, WikidataEntity.MapillaryDatabase),
    )

    // Inception
    claims.push(createInceptionClaim(image.dates.taken))

    // Source of file
    claims.push(createSourceOfFileClaim(image.urls.url))

    // Coordinates of the point of view
    claims.push(createPointOfViewClaim(image.location))

    // Check for license override
    const hasLicenseOverride = (license?.trim() || store.globalLicense.trim()) !== ''

    if (!hasLicenseOverride) {
      // Copyright status
      claims.push(createCopyrightStatusClaim())

      // Copyright license
      claims.push(createCopyrightLicenseClaim())
    }

    // Width
    claims.push(createWidthClaim(image.dimensions.width))

    // Height
    claims.push(createHeightClaim(image.dimensions.height))

    return claims
  }

  return {
    applyMetaDefaults,
    buildDescription,
    buildTitle,
    buildSDC,
    buildWikitext,
    findDuplicateTitles,
    getEffectiveTitle,
    getTemplateTitle,
    sourceLink,
    cancelTitleVerification,
    validateTitle,
    verifyTitles,
    wikitext,
  }
}
