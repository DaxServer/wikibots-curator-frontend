import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { api, useTitleBlacklist, type MediaWikiApiResponse } from '../useTitleBlacklist'

const MOCK_BLACKLIST_RESPONSE: MediaWikiApiResponse = {
  query: {
    pages: [
      {
        title: 'MediaWiki:Filename-prefix-blacklist',
        revisions: [
          {
            slots: {
              main: {
                content: ` #<!-- leave this line exactly as it is --> <pre>
 # Syntax is as follows:
 #   * Everything from a "#" character to the end of the line is a comment
 #   * Every non-blank line is a prefix for typical file names assigned automatically by digital cameras

 CIMG    # Casio
 DSC_    # Nikon
 DSCF    # Fuji
 DSCN    # Nikon
 DUW     # some mobile phones
 GEDC    # GE
 IMG     # generic
 JD      # Jenoptik
 MGP     # Pentax
 PICT    # misc.
 PXL     # Google Pixel phones
 Imagen  # misc.
 FOTO    # misc.
 DSC     # misc.
 SANY    # Sanyo
 SAM     # Samsung
 #</pre> <!-- leave this line exactly as it is -->`,
              },
            },
          },
        ],
      },
      {
        title: 'MediaWiki:Titleblacklist',
        revisions: [
          {
            slots: {
              main: {
                content: ` ###########################################################################
 # DO NOT MODIFY THIS LIST UNLESS YOU HAVE A BASIC UNDERSTANDING OF REGEX! #
 ###########################################################################
 # __NOINDEX__
 # This is a list of page titles for which certain actions are blocked.

 # CHARACTERS THAT SHOULD NEVER APPEAR IN VALID TITLES
 .*[\\x{00A0}\\x{1680}\\x{180E}\\x{2000}-\\x{200B}\\x{2028}\\x{2029}\\x{202F}\\x{205F}\\x{3000}].* <casesensitive|errmsg=titleblacklist-custom-hidden-char> # NBSP and other unusual spaces
 .*[\\x{202A}-\\x{202E}].* <casesensitive|errmsg=titleblacklist-custom-hidden-char> # BiDi overrides
 .*\\p{Cc}.* <casesensitive|errmsg=titleblacklist-custom-hidden-char> # Control characters
 .*\\x{FEFF}.* <casesensitive|errmsg=titleblacklist-custom-hidden-char> # BOM

 # Tricky regexes with comments and special chars
 File:InstagramCapture_.+ #cf [[:File:InstagramCapture 01fcdcfd-3513-4b07-8153-927af16ce415 jpg(1).jpg]]
 File:Snapchat\\-\\d.+ # [[:File:Snapchat-6374224575409848347.jpg]]
 File:Static_svgfiles.* # [[:File:Static svgfiles 2024-08-09-23-11-00-128465-a16faca9b211dd9b5a325a6cf467bc5a4858478d83e48f782528e9e1b9fe457c.svg]]
 File:DJI[\\d\\s]+\\.JPG # DJI (drones)

 # Standard simple regexes
 .*thumb.*
 .*temp.*`,
              },
            },
          },
        ],
      },
    ],
  },
}

describe('useTitleBlacklist', () => {
  let composable: ReturnType<typeof useTitleBlacklist>

  beforeEach(async () => {
    spyOn(api, 'fetchBlacklistsJson').mockResolvedValue(MOCK_BLACKLIST_RESPONSE)
    composable = useTitleBlacklist()
    await composable.fetchBlacklists()
  })

  it('checks prefix blacklist correctly', () => {
    expect(composable.isBlacklisted('DSC_1234.JPG')).toBe(true)
    expect(composable.isBlacklisted('img_0001.png')).toBe(true)
    expect(composable.isBlacklisted('MyFile.jpg')).toBe(false)
  })

  it('checks regex blacklist correctly - Simple cases', () => {
    expect(composable.isBlacklisted('Some_thumb_image.jpg')).toBe(true)
    expect(composable.isBlacklisted('temp_file.txt')).toBe(true)
  })

  it('checks regex blacklist correctly - Unicode ranges (\\x{...})', () => {
    expect(composable.isBlacklisted('TitleWith\u00A0Space')).toBe(true)
    expect(composable.isBlacklisted('Hidden\u200BChar')).toBe(true)
    expect(composable.isBlacklisted('Normal Title')).toBe(false)
  })

  it('checks regex blacklist correctly - Tricky comments and special chars', () => {
    expect(composable.isBlacklisted('File:InstagramCapture_12345.jpg')).toBe(true)
    expect(composable.isBlacklisted('File:Snapchat-12345.jpg')).toBe(true)
    expect(composable.isBlacklisted('File:Static_svgfiles_test.svg')).toBe(true)
  })

  it('checks regex blacklist correctly - DJI pattern with File: prefix', () => {
    expect(composable.isBlacklisted('DJI123444.jpg')).toBe(true)
    expect(composable.isBlacklisted('DJI 123444.JPG')).toBe(true)
    expect(composable.isBlacklisted('DJI123444.JPG')).toBe(true)

    // Test that non-DJI patterns are not caught by blacklist
    expect(composable.isBlacklisted('MyDJI123444.jpeg')).toBe(false)
    expect(composable.isBlacklisted('DJI.jpeg')).toBe(false)

    // Test .jpeg extension - this should NOT match because the pattern expects .JPG (3 chars) not .jpeg (4 chars)
    expect(composable.isBlacklisted('DJI123444.jpeg')).toBe(false)
  })
})
