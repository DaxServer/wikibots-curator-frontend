import {
  createCopyrightLicenseClaim,
  createCopyrightStatusClaim,
  createCreatorClaim,
  createHeightClaim,
  createInceptionClaim,
  createMapillaryIdClaim,
  createPublishedInMapillaryClaim,
  createSourceOfFileClaim,
  createWidthClaim,
} from '@/composables/sdc'
import { useCollectionsStore } from '@/stores/collections.store'
import type { Image, Item, Metadata, TitleStatus } from '@/types/image'
import type { Statement } from '@/types/wikidata'
import { isValidExtension } from '@/utils/titleTemplate'
import { debounce } from 'ts-debounce'

export const useCommons = () => {
  const store = useCollectionsStore()

  const applyMetaDefaults = (meta: Metadata, title: string): Metadata => ({
    ...meta,
    title: title || meta.title,
    description: {
      language: meta.description.language.trim() || store.globalLanguage.trim(),
      value: meta.description.value.trim() || store.globalDescription.trim(),
    },
    categories: meta.categories || store.globalCategories,
  })

  const buildWikitext = (item: Item): string => {
    const date = item.image.dates.taken.toISOString().split('T')[0]
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

  const debouncedCheckTitleMap = new Map<string, ReturnType<typeof debounce>>()

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
    const chunkSize = 50

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize)
      const fileTitles = chunk.map((item) => `File:${item.title}`)
      const params = new URLSearchParams()
      params.set('action', 'query')
      params.set('prop', 'revisions')
      params.set('titles', fileTitles.join('|'))
      params.set('format', 'json')
      params.set('origin', '*')
      params.set('formatversion', '2')

      const res = await fetch('https://commons.wikimedia.org/w/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
      if (!res || !res.ok) continue
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { missing?: boolean; title: string; revisions?: unknown[] }>
        }
      }

      const pages = Object.values(data.query?.pages || {})

      for (const item of chunk) {
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

  const sourceLink = (id: string, sequenceId?: string): string => {
    return `{{Mapillary-source|key=${id}}} Sequence ID: ${sequenceId ?? ''}`
  }

  const buildTitle = (image: Image): string => {
    const date = image.dates.taken.toISOString().split('T')[0]!
    return `Photo from Mapillary ${date} (${image.id}).jpg`
  }

  const buildDescription = (): string => {
    return 'Photo from Mapillary'
  }

  const buildSDC = (item: Item): Statement[] => {
    const claims: Statement[] = []

    // Creator
    claims.push(createCreatorClaim(item.image.creator.username, item.image.creator.profile_url))

    // Mapillary ID
    claims.push(createMapillaryIdClaim(item.image.id))

    // Published in
    claims.push(createPublishedInMapillaryClaim())

    // Inception
    claims.push(createInceptionClaim(item.image.dates.taken))

    // Source of file
    claims.push(createSourceOfFileClaim(item.image.url))

    // Check for license override
    const hasLicenseOverride = (item.meta.license?.trim() || store.globalLicense.trim()) !== ''

    if (!hasLicenseOverride) {
      // Copyright status
      claims.push(createCopyrightStatusClaim())

      // Copyright license
      claims.push(createCopyrightLicenseClaim())
    }

    // Width
    claims.push(createWidthClaim(item.image.width))

    // Height
    claims.push(createHeightClaim(item.image.height))

    return claims
  }

  return {
    applyMetaDefaults,
    verifyTitles,
    sourceLink,
    buildTitle,
    buildDescription,
    buildWikitext,
    buildSDC,
  }
}
