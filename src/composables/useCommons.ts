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

  const checkFileTitleAvailability = async (title: string): Promise<boolean> => {
    const fileTitle = `File:${title}`
    const params = new URLSearchParams()
    params.set('action', 'query')
    params.set('prop', 'revisions')
    params.set('titles', fileTitle)
    params.set('format', 'json')
    params.set('origin', '*')
    params.set('formatversion', '2')

    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`)
    if (!res || !res.ok) return false
    const data = (await res.json()) as {
      query?: {
        pages?: { missing?: boolean }[]
      }
    }

    return Boolean(data.query?.pages?.[0]?.missing)
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

  return {
    applyMetaDefaults,
    checkFileTitleAvailability,
    sourceLink,
    buildTitle,
    buildDescription,
    buildWikitext,
  }
}
