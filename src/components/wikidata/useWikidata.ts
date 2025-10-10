const properties: Record<string, string> = {
  P137: 'operator',
  P1433: 'published in',
  P1476: 'title',
  P170: 'creator',
  P1947: 'Mapillary photo ID',
  P2093: 'author name string',
  P2699: 'url',
  P571: 'inception',
  P7482: 'source of file',
  P973: 'described at url',
}

const entities: Record<string, string> = {
  Q17985544: 'Mapillary',
  Q26757498: 'Mapillary database',
  Q74228490: 'file available on the internet',
}

export const useWikidata = () => {
  const getPropertyLabel = (property: string) => properties[property] ?? ''
  const getEntityLabel = (entity: string) => entities[entity] ?? ''

  return {
    getPropertyLabel,
    getEntityLabel,
  }
}
