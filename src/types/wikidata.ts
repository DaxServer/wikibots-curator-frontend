// Basic Wikibase JSON types for items, statements, snaks, datavalues, and references
// References:
// - Wikidata Data model overview: https://www.wikidata.org/wiki/Wikidata:Data_model

export type WikibaseEntityType = 'item' | 'property'

export type NumericId = number
export type PropertyId = `P${NumericId}`
export type ItemId = `Q${NumericId}`

export type DataValueEntityId = {
  'numeric-id': NumericId
  'entity-type': WikibaseEntityType
}

export type DataValueMonolingualText = {
  text: string
  language: string
}

export type DataValueQuantity = {
  amount: string // e.g. "+12.34"
  unit: string // e.g. "http://www.wikidata.org/entity/Q123"
  upperBound?: string | null
  lowerBound?: string | null
}

export type DataValueTime = {
  time: string // e.g. "+2013-01-01T00:00:00Z"
  timezone?: number
  before?: number
  after?: number
  precision?: number
  calendarmodel?: string
}

export const DataValueType = {
  ExternalId: 'external-id',
  Quantity: 'quantity',
  String: 'string',
  Time: 'time',
  WikibaseEntityId: 'wikibase-entityid',
} as const

export type StringDataValue = {
  type: typeof DataValueType.String
  value: string
}

export type EntityIdDataValue = {
  type: typeof DataValueType.WikibaseEntityId
  value: DataValueEntityId
}

export type QuantityDataValue = {
  type: typeof DataValueType.Quantity
  value: DataValueQuantity
}

export type TimeDataValue = {
  type: typeof DataValueType.Time
  value: DataValueTime
}

export type UrlDataValue = {
  type: typeof DataValueType.String
  value: string
}

export type DataValue =
  | StringDataValue
  | EntityIdDataValue
  | QuantityDataValue
  | TimeDataValue
  | UrlDataValue

export const SnakDataType = {
  ExternalId: 'external-id',
  Quantity: 'quantity',
  String: 'string',
  Time: 'time',
  Url: 'url',
  WikibaseItem: 'wikibase-item',
} as const

export const SnakType = {
  Value: 'value',
  SomeValue: 'somevalue',
  NoValue: 'novalue',
} as const

export type StringValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: StringDataValue
  property: PropertyId
  datatype: typeof SnakDataType.String
}

export type EntityIdValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: EntityIdDataValue
  property: PropertyId
  datatype: typeof SnakDataType.WikibaseItem
}

export type ExternalIdValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: StringDataValue
  property: PropertyId
  datatype: typeof SnakDataType.ExternalId
}

export type QuantityValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: QuantityDataValue
  property: PropertyId
  datatype: typeof SnakDataType.Quantity
}

export type TimeValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: TimeDataValue
  property: PropertyId
  datatype: typeof SnakDataType.Time
}

export type UrlValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: UrlDataValue
  property: PropertyId
  datatype: typeof SnakDataType.Url
}

export type ValueSnak =
  | StringValueSnak
  | EntityIdValueSnak
  | ExternalIdValueSnak
  | QuantityValueSnak
  | TimeValueSnak
  | UrlValueSnak

export type SomeValueSnak = {
  snaktype: typeof SnakType.SomeValue
  property: PropertyId
}

export type NoValueSnak = {
  snaktype: typeof SnakType.NoValue
  property: PropertyId
}

export type Snak = ValueSnak | SomeValueSnak | NoValueSnak

export type Reference = {
  snaks: Record<string, Snak[]>
  'snaks-order'?: string[]
  hash?: string
}

export type Rank = 'preferred' | 'normal' | 'deprecated'

export type Statement = {
  mainsnak: Snak
  rank: Rank
  qualifiers?: Record<string, Snak[]>
  'qualifiers-order'?: string[]
  references?: Reference[]
  type?: 'statement'
}

export const WikidataEntity = {
  CCBYSA40: 'Q18199165',
  Copyrighted: 'Q50423863',
  FileAvailableOnInternet: 'Q74228490',
  Mapillary: 'Q17985544',
  MapillaryDatabase: 'Q26757498',
  Pixel: 'Q355198',
} as const

export const WikidataProperty = {
  AuthorNameString: 'P2093',
  CopyrightLicense: 'P275',
  CopyrightStatus: 'P6216',
  Creator: 'P170',
  DescribedAtUrl: 'P973',
  Height: 'P2048',
  Inception: 'P571',
  MapillaryPhotoID: 'P1947',
  Operator: 'P137',
  PublishedIn: 'P1433',
  SourceOfFile: 'P7482',
  Url: 'P2699',
  Width: 'P2049',
} as const
