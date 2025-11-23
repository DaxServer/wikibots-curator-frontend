import {
  createCopyrightLicenseClaim,
  createCopyrightStatusClaim,
  createCreatorClaim,
  createExternalIdSnak,
  createHeightClaim,
  createInceptionClaim,
  createMapillaryIdClaim,
  createPublishedInMapillaryClaim,
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
import { WikidataEntity, WikidataProperty } from '@/types/wikidata'
import { describe, expect, it } from 'bun:test'

describe('SDC Builders', () => {
  it('should create an external-id statement', () => {
    const property = 'P1947'
    const value = '168951548443095'

    expect(createStatement(createExternalIdSnak(property, value))).toEqual({
      mainsnak: {
        snaktype: 'value',
        property,
        datatype: 'external-id',
        datavalue: {
          value,
          type: 'string',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create a wikibase-item statement', () => {
    const property = 'P1433'
    const numericId = 26757498

    expect(createStatement(createWikibaseItemSnak(property, `Q${numericId}`))).toEqual({
      mainsnak: {
        snaktype: 'value',
        property,
        datatype: 'wikibase-item',
        datavalue: {
          value: {
            'entity-type': 'item',
            'numeric-id': numericId,
          },
          type: 'wikibase-entityid',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create a time statement', () => {
    const property = 'P571'
    const dateValue = '2017-06-24T00:00:00Z'

    expect(createStatement(createTimeSnak(property, new Date(dateValue)))).toEqual({
      mainsnak: {
        snaktype: 'value',
        property,
        datatype: 'time',
        datavalue: {
          value: {
            time: `+0000000${dateValue}`,
            precision: 11,
            after: 0,
            before: 0,
            timezone: 0,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: 'time',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create a quantity statement', () => {
    const property = 'P2049'
    const amount = 5312
    const unit = 'Q355198'

    expect(createStatement(createQuantitySnak(property, amount, unit))).toEqual({
      mainsnak: {
        snaktype: 'value',
        property,
        datatype: 'quantity',
        datavalue: {
          value: {
            amount: `+${amount}`,
            upperBound: null,
            lowerBound: null,
            unit: `http://www.wikidata.org/entity/${unit}`,
          },
          type: 'quantity',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create a string value snak with qualifiers', () => {
    const property = 'P2093'
    const value = 'testuser'

    expect(createStringSnak(property, value)).toEqual({
      snaktype: 'value',
      property,
      datatype: 'string',
      datavalue: {
        value,
        type: 'string',
      },
    })
  })

  it('should create a url value snak with qualifiers', () => {
    const property = 'P2699'
    const value = 'https://www.example.com/user/testuser'

    expect(createUrlSnak(property, value)).toEqual({
      snaktype: 'value',
      property,
      datatype: 'url',
      datavalue: {
        value,
        type: 'string',
      },
    })
  })

  it('should create creator claim with qualifiers', () => {
    const username = 'testuser'
    const profileUrl = 'https://example.com/user/testuser'

    expect(createCreatorClaim(username, profileUrl)).toEqual({
      mainsnak: {
        property: WikidataProperty.Creator,
        snaktype: 'somevalue',
      },
      qualifiers: {
        [WikidataProperty.AuthorNameString]: [
          {
            snaktype: 'value',
            property: WikidataProperty.AuthorNameString,
            datatype: 'string',
            datavalue: {
              value: username,
              type: 'string',
            },
          },
        ],
        [WikidataProperty.Url]: [
          {
            snaktype: 'value',
            property: WikidataProperty.Url,
            datatype: 'url',
            datavalue: {
              value: profileUrl,
              type: 'string',
            },
          },
        ],
      },
      'qualifiers-order': [WikidataProperty.AuthorNameString, WikidataProperty.Url],
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Mapillary ID claim', () => {
    const id = '12345'

    expect(createMapillaryIdClaim(id)).toEqual({
      mainsnak: {
        property: WikidataProperty.MapillaryPhotoID,
        snaktype: 'value',
        datatype: 'external-id',
        datavalue: {
          value: id,
          type: 'string',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Published In Mapillary claim', () => {
    expect(createPublishedInMapillaryClaim()).toEqual({
      mainsnak: {
        property: WikidataProperty.PublishedIn,
        snaktype: 'value',
        datatype: 'wikibase-item',
        datavalue: {
          value: {
            'entity-type': 'item',
            'numeric-id': getNumericId(WikidataEntity.MapillaryDatabase),
          },
          type: 'wikibase-entityid',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Inception claim', () => {
    const date = '2023-01-01T00:00:00Z'

    expect(createInceptionClaim(new Date(date))).toEqual({
      mainsnak: {
        property: WikidataProperty.Inception,
        snaktype: 'value',
        datatype: 'time',
        datavalue: {
          value: {
            time: `+0000000${date}`,
            precision: 11,
            after: 0,
            before: 0,
            timezone: 0,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: 'time',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Source of File claim', () => {
    const url = 'https://example.com/image.jpg'

    expect(createSourceOfFileClaim(url)).toEqual({
      mainsnak: {
        property: WikidataProperty.SourceOfFile,
        snaktype: 'value',
        datatype: 'wikibase-item',
        datavalue: {
          value: {
            'entity-type': 'item',
            'numeric-id': getNumericId(WikidataEntity.FileAvailableOnInternet),
          },
          type: 'wikibase-entityid',
        },
      },
      qualifiers: {
        [WikidataProperty.Operator]: [
          {
            snaktype: 'value',
            property: WikidataProperty.Operator,
            datatype: 'wikibase-item',
            datavalue: {
              value: {
                'entity-type': 'item',
                'numeric-id': getNumericId(WikidataEntity.Mapillary),
              },
              type: 'wikibase-entityid',
            },
          },
        ],
        [WikidataProperty.DescribedAtUrl]: [
          {
            snaktype: 'value',
            property: WikidataProperty.DescribedAtUrl,
            datatype: 'url',
            datavalue: {
              value: url,
              type: 'string',
            },
          },
        ],
      },
      'qualifiers-order': [WikidataProperty.Operator, WikidataProperty.DescribedAtUrl],
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Copyright Status claim', () => {
    expect(createCopyrightStatusClaim()).toEqual({
      mainsnak: {
        property: WikidataProperty.CopyrightStatus,
        snaktype: 'value',
        datatype: 'wikibase-item',
        datavalue: {
          value: {
            'entity-type': 'item',
            'numeric-id': getNumericId(WikidataEntity.Copyrighted),
          },
          type: 'wikibase-entityid',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Copyright License claim', () => {
    expect(createCopyrightLicenseClaim()).toEqual({
      mainsnak: {
        property: WikidataProperty.CopyrightLicense,
        snaktype: 'value',
        datatype: 'wikibase-item',
        datavalue: {
          value: {
            'entity-type': 'item',
            'numeric-id': getNumericId(WikidataEntity.CCBYSA40),
          },
          type: 'wikibase-entityid',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Width claim', () => {
    const width = 1000

    expect(createWidthClaim(width)).toEqual({
      mainsnak: {
        property: WikidataProperty.Width,
        snaktype: 'value',
        datatype: 'quantity',
        datavalue: {
          value: {
            amount: `+${width}`,
            upperBound: null,
            lowerBound: null,
            unit: `http://www.wikidata.org/entity/${WikidataEntity.Pixel}`,
          },
          type: 'quantity',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })

  it('should create Height claim', () => {
    const height = 800

    expect(createHeightClaim(height)).toEqual({
      mainsnak: {
        property: WikidataProperty.Height,
        snaktype: 'value',
        datatype: 'quantity',
        datavalue: {
          value: {
            amount: `+${height}`,
            upperBound: null,
            lowerBound: null,
            unit: `http://www.wikidata.org/entity/${WikidataEntity.Pixel}`,
          },
          type: 'quantity',
        },
      },
      type: 'statement',
      rank: 'normal',
    })
  })
})
