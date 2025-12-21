// Basic Wikibase JSON types for items, statements, snaks, datavalues, and references
// References:
// - Wikidata Data model overview: https://www.wikidata.org/wiki/Wikidata:Data_model

export const WikibaseEntityType = {
  Item: 'item',
  Property: 'property',
} as const

export type PropertyId = `P${number}`
export type ItemId = `Q${number}`

export type DataValueEntityId = {
  'numeric-id': number
  'entity-type': typeof WikibaseEntityType.Item | typeof WikibaseEntityType.Property
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

export type DataValueGlobeCoordinate = {
  latitude: number
  longitude: number
  altitude: null | number
  precision: number
  globe: string
}

export const DataValueType = {
  ExternalId: 'external-id',
  GlobeCoordinate: 'globecoordinate',
  Quantity: 'quantity',
  String: 'string',
  Time: 'time',
  WikibaseEntityId: 'wikibase-entityid',
} as const

export type StringDataValue = {
  type: typeof DataValueType.String
  value: string
}

export type GlobeCoordinateDataValue = {
  type: typeof DataValueType.GlobeCoordinate
  value: DataValueGlobeCoordinate
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
  | GlobeCoordinateDataValue
  | QuantityDataValue
  | TimeDataValue
  | UrlDataValue

export const SnakDataType = {
  ExternalId: 'external-id',
  GlobeCoordinate: 'globe-coordinate',
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

export type GlobeCoordinateValueSnak = {
  snaktype: typeof SnakType.Value
  datavalue: GlobeCoordinateDataValue
  property: PropertyId
  datatype: typeof SnakDataType.GlobeCoordinate
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
  | GlobeCoordinateValueSnak
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

export enum Rank {
  DEPRECATED = 'deprecated',
  NORMAL = 'normal',
  PREFRRED = 'preferred',
}

export type Statement = {
  mainsnak: Snak
  rank: Rank
  qualifiers?: Record<string, Snak[]>
  'qualifiers-order'?: string[]
  references?: Reference[]
  type?: 'statement'
}
