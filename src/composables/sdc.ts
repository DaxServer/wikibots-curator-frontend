import {
  DataValueType,
  SnakDataType,
  SnakType,
  WikidataEntity,
  WikidataProperty,
  type EntityIdValueSnak,
  type ExternalIdValueSnak,
  type ItemId,
  type NumericId,
  type PropertyId,
  type QuantityValueSnak,
  type Rank,
  type Snak,
  type SomeValueSnak,
  type Statement,
  type StringValueSnak,
  type TimeValueSnak,
  type UrlValueSnak,
} from '@/types/wikidata'

// ============================================================================
// Low-level builders for creating snaks and statements
// ============================================================================

export const createStringSnak = (property: PropertyId, value: string): StringValueSnak => ({
  snaktype: SnakType.Value,
  property,
  datatype: SnakDataType.String,
  datavalue: { value, type: DataValueType.String },
})

export const createUrlSnak = (property: PropertyId, value: string): UrlValueSnak => ({
  snaktype: SnakType.Value,
  property,
  datatype: SnakDataType.Url,
  datavalue: { value, type: DataValueType.String },
})

export const createWikibaseItemSnak = (
  property: PropertyId,
  itemId: ItemId,
): EntityIdValueSnak => ({
  snaktype: SnakType.Value,
  property,
  datatype: SnakDataType.WikibaseItem,
  datavalue: {
    value: { 'entity-type': 'item', 'numeric-id': getNumericId(itemId) },
    type: DataValueType.WikibaseEntityId,
  },
})

export const createSomeValueSnak = (property: PropertyId): SomeValueSnak => ({
  snaktype: SnakType.SomeValue,
  property,
})

export const createExternalIdSnak = (property: PropertyId, value: string): ExternalIdValueSnak => ({
  snaktype: SnakType.Value,
  property,
  datatype: SnakDataType.ExternalId,
  datavalue: { value, type: DataValueType.String },
})

export const createTimeSnak = (property: PropertyId, date: Date): TimeValueSnak => {
  const dateString = date.toISOString().split('T')[0]
  const time = `+0000000${dateString}T00:00:00Z`

  return {
    snaktype: SnakType.Value,
    property,
    datatype: SnakDataType.Time,
    datavalue: {
      value: {
        time,
        precision: 11,
        after: 0,
        before: 0,
        timezone: 0,
        calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
      },
      type: DataValueType.Time,
    },
  }
}

export const createQuantitySnak = (
  property: PropertyId,
  amount: number,
  unit: ItemId,
): QuantityValueSnak => ({
  snaktype: SnakType.Value,
  property,
  datatype: SnakDataType.Quantity,
  datavalue: {
    value: {
      amount: `+${amount}`,
      upperBound: null,
      lowerBound: null,
      unit: `http://www.wikidata.org/entity/${unit}`,
    },
    type: DataValueType.Quantity,
  },
})

export const createStatement = (
  mainsnak: Snak,
  qualifiers: Snak[] = [],
  rank: Rank = 'normal',
): Statement => {
  const statement: Statement = {
    mainsnak,
    type: 'statement',
    rank,
  }

  if (qualifiers.length > 0) {
    const _qualifiers: Record<string, Snak[]> = {}
    const _qualifiersOrder: string[] = []

    for (const snak of qualifiers) {
      if (!_qualifiers[snak.property]) {
        _qualifiers[snak.property] = []
        _qualifiersOrder.push(snak.property)
      }
      _qualifiers[snak.property]!.push(snak)
    }

    statement.qualifiers = _qualifiers
    statement['qualifiers-order'] = _qualifiersOrder
  }

  return statement
}

export const createExternalIdStatement = (property: PropertyId, value: string): Statement => {
  return createStatement(createExternalIdSnak(property, value))
}

export const createWikibaseItemStatement = (property: PropertyId, itemId: ItemId): Statement => {
  return createStatement(createWikibaseItemSnak(property, itemId))
}

export const createTimeStatement = (property: PropertyId, date: Date): Statement => {
  return createStatement(createTimeSnak(property, date))
}

export const createQuantityStatement = (
  property: PropertyId,
  amount: number,
  unit: ItemId,
): Statement => {
  return createStatement(createQuantitySnak(property, amount, unit))
}

// ============================================================================
// High-level domain-specific claim builders for Mapillary SDC
// ============================================================================

export const getNumericId = (entity: ItemId): NumericId => parseInt(entity.slice(1), 10)

export const createCreatorClaim = (username: string, profileUrl: string): Statement => {
  return createStatement(createSomeValueSnak(WikidataProperty.Creator), [
    createStringSnak(WikidataProperty.AuthorNameString, username),
    createUrlSnak(WikidataProperty.Url, profileUrl),
  ])
}

export const createMapillaryIdClaim = (id: string): Statement => {
  return createExternalIdStatement(WikidataProperty.MapillaryPhotoID, id)
}

export const createPublishedInMapillaryClaim = (): Statement => {
  return createWikibaseItemStatement(WikidataProperty.PublishedIn, WikidataEntity.MapillaryDatabase)
}

export const createInceptionClaim = (date: Date): Statement => {
  return createTimeStatement(WikidataProperty.Inception, date)
}

export const createSourceOfFileClaim = (url: string): Statement => {
  return createStatement(
    createWikibaseItemSnak(WikidataProperty.SourceOfFile, WikidataEntity.FileAvailableOnInternet),
    [
      createWikibaseItemSnak(WikidataProperty.Operator, WikidataEntity.Mapillary),
      createUrlSnak(WikidataProperty.DescribedAtUrl, url),
    ],
  )
}

export const createCopyrightStatusClaim = (): Statement => {
  return createWikibaseItemStatement(WikidataProperty.CopyrightStatus, WikidataEntity.Copyrighted)
}

export const createCopyrightLicenseClaim = (): Statement => {
  return createWikibaseItemStatement(WikidataProperty.CopyrightLicense, WikidataEntity.CCBYSA40)
}

export const createWidthClaim = (width: number): Statement => {
  return createQuantityStatement(WikidataProperty.Width, width, WikidataEntity.Pixel)
}

export const createHeightClaim = (height: number): Statement => {
  return createQuantityStatement(WikidataProperty.Height, height, WikidataEntity.Pixel)
}
