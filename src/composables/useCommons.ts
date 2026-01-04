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

    additionalInfo = `{{Location|${item.image.location.latitude}|${item.image.location.longitude}|heading:${item.image.location.compass_angle}}}`
    if (item.image.is_pano === true) additionalInfo += '\n{{Pano360}}'

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

  const verifyTitles = async (
    items: { id: string; title: string }[],
    options: { debounce?: boolean } = {},
  ): Promise<void> => {
    if (options.debounce) {
      for (const item of items) {
        if (!isValidExtension(item.title)) {
          store.updateItem(item.id, 'titleStatus', 'invalid')
          continue
        }
        if (isBlacklisted(item.title)) {
          store.updateItem(item.id, 'titleStatus', 'blacklisted')
          continue
        }

        store.updateItem(item.id, 'titleStatus', 'checking')
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
      if (!isValidExtension(item.title)) {
        store.updateItem(item.id, 'titleStatus', 'invalid')
      } else if (isBlacklisted(item.title)) {
        store.updateItem(item.id, 'titleStatus', 'blacklisted')
      } else {
        store.updateItem(item.id, 'titleStatus', 'checking')
        validItems.push(item)
      }
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
        let status: TitleStatus = 'unknown'

        if (!page) {
          status = 'unknown'
        } else if (page.missing) {
          status = 'available'
        } else if (page.revisions) {
          status = 'taken'
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
      if (item.meta.titleStatus === 'checking') {
        store.updateItem(item.id, 'titleStatus', 'unknown')
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
    claims.push(createSourceOfFileClaim(image.url))

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
    claims.push(createWidthClaim(image.width))

    // Height
    claims.push(createHeightClaim(image.height))

    return claims
  }

  return {
    applyMetaDefaults,
    buildDescription,
    buildTitle,
    buildSDC,
    buildWikitext,
    getEffectiveTitle,
    getTemplateTitle,
    sourceLink,
    cancelTitleVerification,
    verifyTitles,
    wikitext,
  }
}
