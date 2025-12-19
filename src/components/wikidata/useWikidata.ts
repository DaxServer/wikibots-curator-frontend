const properties: Record<string, string> = {
  P1259: 'coordinates of the point of view',
  P137: 'operator',
  P13988: 'Mapillary username',
  P1433: 'published in',
  P1476: 'title',
  P170: 'creator',
  P1947: 'Mapillary photo ID',
  P2048: 'height',
  P2049: 'width',
  P2093: 'author name string',
  P2699: 'url',
  P275: 'copyright license',
  P571: 'inception',
  P6216: 'copyright status',
  P7482: 'source of file',
  P7787: 'heading',
  P973: 'described at url',
}

const entities: Record<string, string> = {
  Q17985544: 'Mapillary',
  Q18199165: 'CC BY-SA 4.0',
  Q26757498: 'Mapillary database',
  Q28390: 'degree',
  Q355198: 'pixel',
  Q50423863: 'copyrighted',
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
