export const useCommons = () => {
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

  return { checkFileTitleAvailability }
}
