export const useCommons = () => {
  const store = useCollectionsStore()

  const applyMetaDefaults = (
    meta: Metadata,
    defaults: {
      language: string
      descriptionText: string
    },
    title: string,
  ): Metadata => ({
    ...meta,
    title: title || meta.title,
    description: {
      language:
        (meta.description.language || '').trim() || store.globalLanguage || defaults.language,
      text:
        (meta.description.text || '').trim() || store.globalDescription || defaults.descriptionText,
    },
    categories: meta.categories || store.globalCategories,
  })

  const buildWikitext = (item: Item): string => {
    const date = new Date(item.image.captured_at).toISOString().split('T')[0]!
    const lang = item.meta.description.language.trim()
    const description = item.meta.description.text.trim()
    const source = sourceLink(item.id, store.input)
    const license = licenseTemplate()
    const location = item.image.location
      ? `{{Location|${item.image.location.latitude}|${item.image.location.longitude}|heading:${item.image.compass_angle}}}\n`
      : ''

    const info = `== {{int:filedesc}} ==
{{Information
 | description = {{${lang}|1=${description}}}
 | date        = {{Taken on|${date}}}
 | source      = ${source}
 | author      = [${store.creator.profile_url} ${store.creator.username}]
}}
${location}
== {{int:license-header}} ==
${license}

${item.meta.categories}
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

  const licenseTemplate = (): string => {
    return '{{cc-by-sa-4.0}}'
  }

  const sourceLink = (id: string, sequenceId?: string): string => {
    return `{{Mapillary-source|key=${id}}} Sequence ID: ${sequenceId ?? ''}`
  }

  const sourcePageUrl = (id: string): string => {
    return `https://www.mapillary.com/app/?pKey=${id}&focus=photo`
  }

  const buildTitle = (image: Image, id: string): string => {
    const date = new Date(image.captured_at).toISOString().split('T')[0]!
    return `Photo from Mapillary ${date} (${id}).jpg`
  }

  const buildDescription = (): string => {
    return 'Photo from Mapillary'
  }

  return {
    applyMetaDefaults,
    checkFileTitleAvailability,
    licenseTemplate,
    sourceLink,
    sourcePageUrl,
    buildTitle,
    buildDescription,
    buildWikitext,
  }
}
