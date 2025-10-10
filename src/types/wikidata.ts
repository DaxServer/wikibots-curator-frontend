// Basic Wikibase JSON types for items, statements, snaks, datavalues, and references
// References:
// - Wikidata Data model overview: https://www.wikidata.org/wiki/Wikidata:Data_model

export type WikibaseEntityType = 'item' | 'property' | 'lexeme' | 'form' | 'sense'

export interface DataValueEntityId {
  'numeric-id': number
  'entity-type': WikibaseEntityType
}

export interface DataValueMonolingualText {
  text: string
  language: string
}

export interface DataValueQuantity {
  amount: string // e.g. "+12.34"
  unit: string // e.g. "http://www.wikidata.org/entity/Q123"
  upperBound?: string
  lowerBound?: string
}

export interface DataValueTime {
  time: string // e.g. "+2013-01-01T00:00:00Z"
  timezone?: number
  before?: number
  after?: number
  precision?: number
  calendarmodel?: string
}

export interface DataValueGlobeCoordinate {
  latitude: number
  longitude: number
  altitude?: number | null
  precision?: number | null
  globe?: string
}

export interface StringDataValue {
  type: 'string'
  value: string
}

export interface EntityIdDataValue {
  type: 'wikibase-entityid'
  value: DataValueEntityId
}

export interface MonolingualTextDataValue {
  type: 'monolingualtext'
  value: DataValueMonolingualText
}

export interface QuantityDataValue {
  type: 'quantity'
  value: DataValueQuantity
}

export interface TimeDataValue {
  type: 'time'
  value: DataValueTime
}

export interface GlobeCoordinateDataValue {
  type: 'globecoordinate'
  value: DataValueGlobeCoordinate
}

export interface UrlDataValue {
  type: 'url'
  value: string
}

export type DataValue =
  | StringDataValue
  | EntityIdDataValue
  | MonolingualTextDataValue
  | QuantityDataValue
  | TimeDataValue
  | GlobeCoordinateDataValue
  | UrlDataValue

export type SnakType = 'value' | 'somevalue' | 'novalue'

export interface ValueSnak {
  snaktype: 'value'
  datavalue: DataValue
  property: string
}

export interface SomeValueSnak {
  snaktype: 'somevalue'
  property: string
}

export interface NoValueSnak {
  snaktype: 'novalue'
  property: string
}

export type Snak = ValueSnak | SomeValueSnak | NoValueSnak

export interface Reference {
  snaks: Record<string, Snak[]>
  'snaks-order'?: string[]
  hash?: string
}

export type Rank = 'preferred' | 'normal' | 'deprecated'

export interface Statement {
  mainsnak: Snak
  rank: Rank
  qualifiers?: Record<string, Snak[]>
  'qualifiers-order'?: string[]
  references?: Reference[]
}
