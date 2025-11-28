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
    const source = sourceLink(item.id, store.input)
    let categories = item.meta.categories

    if (!categories.includes('Category:Images from Mapillary uploaded with Curator')) {
      categories = `${categories.trim()}\n[[Category:Images from Mapillary uploaded with Curator]]`
    }

    let additionalInfo = ''

    additionalInfo = `{{Location|${item.image.location!.latitude}|${item.image.location!.longitude}|heading:${item.image.location!.compass_angle}}}`
    if (item.image.is_pano === true) additionalInfo += '\n{{Pano360}}'

    categories = categories.trim()

    const info = `== {{int:filedesc}} ==
{{Information
 | source      = ${source}
}}
${additionalInfo}

== {{int:license-header}} ==
{{cc-by-sa-4.0}}

${categories}
`

    return info
  }

  const checkFileTitleAvailability = async (titles: string[]): Promise<Record<string, boolean>> => {
    const availability: Record<string, boolean> = {}
    const chunkSize = 50

    for (let i = 0; i < titles.length; i += chunkSize) {
      const chunk = titles.slice(i, i + chunkSize)
      const fileTitles = chunk.map((title) => `File:${title}`)
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
          pages?: Record<string, { missing?: boolean; title: string }>
        }
      }

      for (const title of chunk) {
        const page = Object.values(data.query?.pages || {}).find((p) => p.title === `File:${title}`)
        availability[title] = 'missing' in page!
      }
    }

    return availability
  }

  const sourceLink = (id: string, sequenceId?: string): string => {
    return `{{Mapillary-source|key=${id}}} Sequence ID: ${sequenceId ?? ''}`
  }

  const buildTitle = (image: Image): string => {
    const date = new Date(image.dates.taken!).toISOString().split('T')[0]!
    return `Photo from Mapillary ${date} (${image.id}).jpg`
  }

  const buildDescription = (): string => {
    return 'Photo from Mapillary'
  }

  const buildSDC = (image: Image): Statement[] => {
    const claims: Statement[] = []

    // Creator
    claims.push(createCreatorClaim(image.creator.username, image.creator.profile_url))

    // Mapillary ID
    claims.push(createMapillaryIdClaim(image.id))

    // Published in
    claims.push(createPublishedInMapillaryClaim())

    // Inception
    claims.push(createInceptionClaim(new Date(image.dates.taken!)))

    // Source of file
    claims.push(createSourceOfFileClaim(image.url))

    // Copyright status
    claims.push(createCopyrightStatusClaim())

    // Copyright license
    claims.push(createCopyrightLicenseClaim())

    // Width
    claims.push(createWidthClaim(image.width))

    // Height
    claims.push(createHeightClaim(image.height))

    return claims
  }

  return {
    applyMetaDefaults,
    checkFileTitleAvailability,
    sourceLink,
    buildTitle,
    buildDescription,
    buildWikitext,
    buildSDC,
  }
}
