import { WikidataEntity, WikidataProperty } from '@/components/wikidata/useWikidata'
import {
  createCopyrightLicenseClaim,
  createCopyrightStatusClaim,
  createCreatorClaim,
  createExternalIdSnak,
  createHeightClaim,
  createInceptionClaim,
  createQuantitySnak,
  createSourceOfFileClaim,
  createStatement,
  createStringSnak,
  createTimeSnak,
  createUrlSnak,
  createWidthClaim,
  createWikibaseItemSnak,
  getNumericId,
} from '@/composables/sdc'
import { DataValueType, Rank, SnakDataType, SnakType, WikibaseEntityType } from '@/types/wikidata'
import { describe, expect, it } from 'bun:test'

describe('SDC Builders', () => {
  it('should create an external-id statement', () => {
    const property = 'P1947'
    const value = '168951548443095'

    expect(createStatement(createExternalIdSnak(property, value))).toEqual({
      mainsnak: {
        snaktype: SnakType.Value,
        property,
        datatype: SnakDataType.ExternalId,
        datavalue: {
          value,
          type: DataValueType.String,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create a wikibase-item statement', () => {
    const property = 'P1433'
    const numericId = 26757498

    expect(createStatement(createWikibaseItemSnak(property, `Q${numericId}`))).toEqual({
      mainsnak: {
        snaktype: SnakType.Value,
        property,
        datatype: SnakDataType.WikibaseItem,
        datavalue: {
          value: {
            'entity-type': WikibaseEntityType.Item,
            'numeric-id': numericId,
          },
          type: DataValueType.WikibaseEntityId,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create a time statement', () => {
    const property = 'P571'
    const dateValue = '2017-06-24T00:00:00Z'

    expect(createStatement(createTimeSnak(property, new Date(dateValue)))).toEqual({
      mainsnak: {
        snaktype: SnakType.Value,
        property,
        datatype: SnakDataType.Time,
        datavalue: {
          value: {
            time: `+0000000${dateValue}`,
            precision: 11,
            after: 0,
            before: 0,
            timezone: 0,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: DataValueType.Time,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create a quantity statement', () => {
    const property = 'P2049'
    const amount = 5312
    const unit = 'Q355198'

    expect(createStatement(createQuantitySnak(property, amount, unit))).toEqual({
      mainsnak: {
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
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create a string value snak with qualifiers', () => {
    const property = 'P2093'
    const value = 'testuser'

    expect(createStringSnak(property, value)).toEqual({
      snaktype: SnakType.Value,
      property,
      datatype: SnakDataType.String,
      datavalue: {
        value,
        type: DataValueType.String,
      },
    })
  })

  it('should create a url value snak with qualifiers', () => {
    const property = 'P2699'
    const value = 'https://www.example.com/user/testuser'

    expect(createUrlSnak(property, value)).toEqual({
      snaktype: SnakType.Value,
      property,
      datatype: SnakDataType.Url,
      datavalue: {
        value,
        type: DataValueType.String,
      },
    })
  })

  it('should create creator claim with qualifiers', () => {
    const username = 'testuser'

    expect(
      createCreatorClaim(username, [
        createExternalIdSnak(WikidataProperty.MapillaryUsername, username),
      ]),
    ).toEqual({
      mainsnak: {
        property: WikidataProperty.Creator,
        snaktype: SnakType.SomeValue,
      },
      qualifiers: {
        [WikidataProperty.AuthorNameString]: [
          {
            snaktype: SnakType.Value,
            property: WikidataProperty.AuthorNameString,
            datatype: SnakDataType.String,
            datavalue: {
              value: username,
              type: DataValueType.String,
            },
          },
        ],
        [WikidataProperty.MapillaryUsername]: [
          {
            snaktype: SnakType.Value,
            property: WikidataProperty.MapillaryUsername,
            datatype: SnakDataType.ExternalId,
            datavalue: {
              value: username,
              type: DataValueType.String,
            },
          },
        ],
      },
      'qualifiers-order': [WikidataProperty.AuthorNameString, WikidataProperty.MapillaryUsername],
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create Inception claim', () => {
    const date = '2023-01-01T00:00:00Z'

    expect(createInceptionClaim(new Date(date))).toEqual({
      mainsnak: {
        property: WikidataProperty.Inception,
        snaktype: SnakType.Value,
        datatype: SnakDataType.Time,
        datavalue: {
          value: {
            time: `+0000000${date}`,
            precision: 11,
            after: 0,
            before: 0,
            timezone: 0,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: DataValueType.Time,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create Source of File claim', () => {
    const url = 'https://example.com/image.jpg'

    expect(createSourceOfFileClaim(url)).toEqual({
      mainsnak: {
        property: WikidataProperty.SourceOfFile,
        snaktype: SnakType.Value,
        datatype: SnakDataType.WikibaseItem,
        datavalue: {
          value: {
            'entity-type': WikibaseEntityType.Item,
            'numeric-id': getNumericId(WikidataEntity.FileAvailableOnInternet),
          },
          type: DataValueType.WikibaseEntityId,
        },
      },
      qualifiers: {
        [WikidataProperty.Operator]: [
          {
            snaktype: SnakType.Value,
            property: WikidataProperty.Operator,
            datatype: SnakDataType.WikibaseItem,
            datavalue: {
              value: {
                'entity-type': WikibaseEntityType.Item,
                'numeric-id': getNumericId(WikidataEntity.Mapillary),
              },
              type: DataValueType.WikibaseEntityId,
            },
          },
        ],
        [WikidataProperty.DescribedAtUrl]: [
          {
            snaktype: SnakType.Value,
            property: WikidataProperty.DescribedAtUrl,
            datatype: SnakDataType.Url,
            datavalue: {
              value: url,
              type: DataValueType.String,
            },
          },
        ],
      },
      'qualifiers-order': [WikidataProperty.Operator, WikidataProperty.DescribedAtUrl],
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create Copyright Status claim', () => {
    expect(createCopyrightStatusClaim()).toEqual({
      mainsnak: {
        property: WikidataProperty.CopyrightStatus,
        snaktype: SnakType.Value,
        datatype: SnakDataType.WikibaseItem,
        datavalue: {
          value: {
            'entity-type': WikibaseEntityType.Item,
            'numeric-id': getNumericId(WikidataEntity.Copyrighted),
          },
          type: DataValueType.WikibaseEntityId,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create Copyright License claim', () => {
    expect(createCopyrightLicenseClaim()).toEqual({
      mainsnak: {
        property: WikidataProperty.CopyrightLicense,
        snaktype: SnakType.Value,
        datatype: SnakDataType.WikibaseItem,
        datavalue: {
          value: {
            'entity-type': WikibaseEntityType.Item,
            'numeric-id': getNumericId(WikidataEntity.CCBYSA40),
          },
          type: DataValueType.WikibaseEntityId,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create Width claim', () => {
    const width = 1000

    expect(createWidthClaim(width)).toEqual({
      mainsnak: {
        property: WikidataProperty.Width,
        snaktype: SnakType.Value,
        datatype: SnakDataType.Quantity,
        datavalue: {
          value: {
            amount: `+${width}`,
            upperBound: null,
            lowerBound: null,
            unit: `http://www.wikidata.org/entity/${WikidataEntity.Pixel}`,
          },
          type: DataValueType.Quantity,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })

  it('should create Height claim', () => {
    const height = 800

    expect(createHeightClaim(height)).toEqual({
      mainsnak: {
        property: WikidataProperty.Height,
        snaktype: SnakType.Value,
        datatype: SnakDataType.Quantity,
        datavalue: {
          value: {
            amount: `+${height}`,
            upperBound: null,
            lowerBound: null,
            unit: `http://www.wikidata.org/entity/${WikidataEntity.Pixel}`,
          },
          type: DataValueType.Quantity,
        },
      },
      type: 'statement',
      rank: Rank.NORMAL,
    })
  })
})
