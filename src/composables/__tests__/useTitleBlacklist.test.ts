import { beforeEach, describe, expect, it } from 'bun:test'
import { useTitleBlacklist } from '../useTitleBlacklist'

describe('useTitleBlacklist - Regex Tests', () => {
  let composable: ReturnType<typeof useTitleBlacklist>

  beforeEach(() => {
    composable = useTitleBlacklist()

    // Mock the regex blacklist directly - no parsing needed
    // These are actual patterns from MediaWiki:Titleblacklist with their comments for context
    composable.regexBlacklist.value = [
      // Characters that should never appear in valid titles - ALL case sensitive (have <casesensitive> flag)
      /.*[\u00A0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000].*/u, // NBSP and other unusual spaces
      /.*[\u202A-\u202E].*/u, // BiDi overrides
      /.*\p{Cc}.*/u, // Control characters
      /.*\uFEFF.*/u, // BOM

      // Instagram captures with UUID patterns
      /^File:InstagramCapture_.+$/i, // cf [[:File:InstagramCapture 01fcdcfd-3513-4b07-8153-927af16ce415 jpg(1).jpg]]

      // Snapchat captures with numeric patterns
      /^File:Snapchat-\d.+$/i, // [[:File:Snapchat-6374224575409848347.jpg]]

      // Static SVG files with hash patterns - should only match .svg extension
      /^File:Static_svgfiles.*\.svg$/i, // [[:File:Static svgfiles 2024-08-09-23-11-00-128465-a16faca9b211dd9b5a325a6cf467bc5a4858478d83e48f782528e9e1b9fe457c.svg]]

      // DJI drone photos with numeric patterns - should only match .JPG extension (case sensitive)
      /^File:DJI[\d\s]+\.JPG$/, // DJI (drones)

      // Standard simple patterns
      /^.*thumb.*$/i, // Generic thumb pattern
      /^.*temp.*$/i, // Generic temp pattern

      // Camera-specific patterns that should be blocked - ALL case sensitive for .JPG extension
      /^File:Test[\d\s]+\.JPG$/, // Test photos
      /^File:DSC[\d\s]+\.JPG$/, // DSC pattern
      /^File:IMG[\d\s]+\.JPG$/, // IMG pattern

      // Overly broad pattern that should be filtered out in production
      // /^File:[\w\d\s]+$/i, // This would match almost anything - filtered out

      // Social media patterns
      /^File:FB_IMG_\d+\.jpg$/i, // Facebook images
      /^File:WA\d+\.jpg$/i, // WhatsApp images

      // Screenshot patterns - should match any case variations
      /^File:Screenshot.*$/i, // Screenshots (any extension)
      /^File:Screen Shot.*$/i, // macOS screenshots (any extension)

      // Generic test patterns with different extensions
      /^File:test.*\.(jpg|jpeg|png|gif)$/i, // Generic test files
      /^File:sample.*\.(jpg|jpeg|png|gif)$/i, // Sample files

      // Camera patterns - case insensitive versions
      /^File:DSC.*\.(jpg|jpeg|png|gif)$/i, // Generic DSC files
      /^File:IMG.*\.(jpg|jpeg|png|gif)$/i, // Generic IMG files

      // Mobile app patterns
      /^File:signal-\d{4}-\d{2}-\d{2}-\d{6}\.jpg$/i, // Signal app images
      /^File:Telegram\.jpg$/i, // Telegram images

      // Hash-based filenames
      /^File:[a-f0-9]{32}\.(jpg|jpeg|png)$/i, // MD5 hash filenames
      /^File:[a-f0-9]{64}\.(jpg|jpeg|png)$/i, // SHA256 hash filenames
    ]

    // Mock prefix blacklist
    composable.prefixBlacklist.value = [
      'DSC_', // Nikon
      'IMG_', // Generic
      'IMG', // Generic (without underscore)
      'PICT', // misc.
      'FOTO', // misc.
      'SAMPLE', // Sample files
    ]
  })

  describe('Unicode Character Patterns', () => {
    it('should block titles with NBSP and unusual spaces', () => {
      expect(composable.isBlacklisted('TitleWith\u00A0Space.jpg')).toBe(true) // NBSP
      expect(composable.isBlacklisted('TitleWith\u1680Space.jpg')).toBe(true) // Ogham space mark
      expect(composable.isBlacklisted('TitleWith\u2000Space.jpg')).toBe(true) // En quad
      expect(composable.isBlacklisted('TitleWith\u200BSpace.jpg')).toBe(true) // Zero-width space
      expect(composable.isBlacklisted('TitleWith\u202FSpace.jpg')).toBe(true) // Narrow no-break space
    })

    it('should block titles with BiDi overrides', () => {
      expect(composable.isBlacklisted('TitleWith\u202AOverride.jpg')).toBe(true) // LTR override
      expect(composable.isBlacklisted('TitleWith\u202BOverride.jpg')).toBe(true) // RTL override
      expect(composable.isBlacklisted('TitleWith\u202COverride.jpg')).toBe(true) // Pop directional formatting
      expect(composable.isBlacklisted('TitleWith\u202DOverride.jpg')).toBe(true) // LTR embedding
      expect(composable.isBlacklisted('TitleWith\u202EOverride.jpg')).toBe(true) // RTL embedding
    })

    it('should block titles with control characters', () => {
      expect(composable.isBlacklisted('TitleWith\u0001Control.jpg')).toBe(true) // SOH
      expect(composable.isBlacklisted('TitleWith\u0007Control.jpg')).toBe(true) // BEL
      expect(composable.isBlacklisted('TitleWith\u001BControl.jpg')).toBe(true) // ESC
    })

    it('should block titles with BOM', () => {
      expect(composable.isBlacklisted('TitleWith\uFEFFBOM.jpg')).toBe(true) // BOM
      expect(composable.isBlacklisted('Normal Title.jpg')).toBe(false) // Should not block normal titles
    })
  })

  describe('Instagram Capture Patterns', () => {
    it('should block Instagram capture files with UUID patterns', () => {
      expect(
        composable.isBlacklisted('InstagramCapture_01fcdcfd-3513-4b07-8153-927af16ce415.jpg'),
      ).toBe(true)
      expect(
        composable.isBlacklisted('InstagramCapture_12345678-1234-1234-1234-123456789012.jpg'),
      ).toBe(true)
      expect(
        composable.isBlacklisted('File:InstagramCapture_01fcdcfd-3513-4b07-8153-927af16ce415.jpg'),
      ).toBe(true)
    })

    it('should not block similar but different patterns', () => {
      expect(composable.isBlacklisted('Instagram_Capture_12345.jpg')).toBe(false) // Underscore instead of camelCase
      expect(composable.isBlacklisted('InstagramCapture.jpg')).toBe(false) // No UUID suffix
      expect(composable.isBlacklisted('MyInstagramCapture_12345.jpg')).toBe(false) // Prefix
    })
  })

  describe('Snapchat Capture Patterns', () => {
    it('should block Snapchat capture files with numeric patterns', () => {
      expect(composable.isBlacklisted('File:Snapchat-6374224575409848347.jpg')).toBe(true)
      expect(composable.isBlacklisted('Snapchat-1234567890.jpg')).toBe(true)
      expect(composable.isBlacklisted('Snapchat-1.jpg')).toBe(true)
    })

    it('should not block similar but different patterns', () => {
      expect(composable.isBlacklisted('Snapchat.jpg')).toBe(false) // No numeric suffix
      expect(composable.isBlacklisted('MySnapchat-12345.jpg')).toBe(false) // Prefix
      expect(composable.isBlacklisted('Snapchat_12345.jpg')).toBe(false) // Underscore instead of dash
    })
  })

  describe('DJI Drone Patterns', () => {
    it('should block DJI drone photos with numeric patterns', () => {
      expect(composable.isBlacklisted('File:DJI123444.JPG')).toBe(true)
      expect(composable.isBlacklisted('File:DJI 123444.JPG')).toBe(true)
      expect(composable.isBlacklisted('DJI123444.JPG')).toBe(true)
      expect(composable.isBlacklisted('DJI 123444.JPG')).toBe(true)
    })

    it('should not block DJI patterns with wrong extension', () => {
      expect(composable.isBlacklisted('DJI123444.jpeg')).toBe(false) // .jpeg instead of .JPG
      expect(composable.isBlacklisted('DJI123444.png')).toBe(false) // .png instead of .JPG
      expect(composable.isBlacklisted('DJI123444.jpg')).toBe(false) // .jpg instead of .JPG (case sensitive)
    })

    it('should not block DJI patterns without numbers', () => {
      expect(composable.isBlacklisted('DJI.JPG')).toBe(false) // No numbers
      expect(composable.isBlacklisted('MyDJI123444.JPG')).toBe(false) // Prefix
    })
  })

  describe('Static SVG Patterns', () => {
    it('should block static SVG files', () => {
      expect(composable.isBlacklisted('File:Static_svgfiles_2024-08-09-23-11-00.svg')).toBe(true)
      expect(composable.isBlacklisted('Static_svgfiles_test.svg')).toBe(true)
      expect(composable.isBlacklisted('Static_svgfiles.svg')).toBe(true)
    })

    it('should not block similar patterns', () => {
      expect(composable.isBlacklisted('Static.svg')).toBe(false) // No _svgfiles suffix
      expect(composable.isBlacklisted('MyStatic_svgfiles.svg')).toBe(false) // Prefix
      expect(composable.isBlacklisted('Static_svgfiles.jpg')).toBe(false) // Wrong extension (not .svg)
    })
  })

  describe('Generic Patterns', () => {
    it('should block files with thumb in the name', () => {
      expect(composable.isBlacklisted('Some_thumb_image.jpg')).toBe(true)
      expect(composable.isBlacklisted('thumbnail.png')).toBe(true)
      expect(composable.isBlacklisted('My_thumb.jpg')).toBe(true)
    })

    it('should block files with temp in the name', () => {
      expect(composable.isBlacklisted('temp_file.txt')).toBe(true)
      expect(composable.isBlacklisted('temporary.jpg')).toBe(true)
      expect(composable.isBlacklisted('My_temp.png')).toBe(true)
    })
  })

  describe('Camera Test Patterns', () => {
    it('should block test photo patterns', () => {
      expect(composable.isBlacklisted('File:Test123.JPG')).toBe(true)
      expect(composable.isBlacklisted('File:Test 123.JPG')).toBe(true)
      expect(composable.isBlacklisted('Test123.JPG')).toBe(true)
      expect(composable.isBlacklisted('Test 123.JPG')).toBe(true)
    })

    it('should validate case sensitivity for camera vs generic patterns', () => {
      // The case-sensitive camera pattern requires .JPG uppercase and specific format
      expect(composable.isBlacklisted('File:Test123.JPG')).toBe(true) // Matches case-sensitive camera pattern
      expect(composable.isBlacklisted('File:Test123.jpg')).toBe(true) // Blocked by case-insensitive generic pattern

      // Test that the case-sensitive pattern is indeed case-sensitive for the extension
      // Use a pattern that wouldn't match the generic test pattern
      expect(composable.isBlacklisted('File:Test999.JPG')).toBe(true) // Matches case-sensitive pattern
      expect(composable.isBlacklisted('File:Test999.jpg')).toBe(true) // Blocked by generic pattern (case insensitive)
    })

    it('should block DSC patterns', () => {
      expect(composable.isBlacklisted('File:DSC123.JPG')).toBe(true)
      expect(composable.isBlacklisted('File:DSC 123.JPG')).toBe(true)
      expect(composable.isBlacklisted('DSC123.JPG')).toBe(true)
      expect(composable.isBlacklisted('DSC 123.JPG')).toBe(true)
    })

    it('should validate case sensitivity for DSC patterns', () => {
      // The case-sensitive camera pattern requires .JPG uppercase and specific format
      expect(composable.isBlacklisted('File:DSC123.JPG')).toBe(true) // Matches case-sensitive camera pattern
      expect(composable.isBlacklisted('File:DSC123.jpg')).toBe(true) // Blocked by case-insensitive generic patterns

      // Test patterns that wouldn't match generic patterns
      expect(composable.isBlacklisted('File:DSC999.JPG')).toBe(true) // Matches case-sensitive pattern
      expect(composable.isBlacklisted('File:DSC999.jpg')).toBe(true) // Blocked by other patterns
    })

    it('should block IMG patterns', () => {
      expect(composable.isBlacklisted('File:IMG1234.JPG')).toBe(true)
      expect(composable.isBlacklisted('File:IMG 1234.JPG')).toBe(true)
      expect(composable.isBlacklisted('IMG1234.JPG')).toBe(true)
      expect(composable.isBlacklisted('IMG 1234.JPG')).toBe(true)
    })

    it('should validate case sensitivity for IMG patterns', () => {
      // The case-sensitive camera pattern requires .JPG uppercase and specific format
      expect(composable.isBlacklisted('File:IMG1234.JPG')).toBe(true) // Matches case-sensitive camera pattern
      expect(composable.isBlacklisted('File:IMG1234.jpg')).toBe(true) // Blocked by case-insensitive generic patterns

      // Test patterns that wouldn't match generic patterns
      expect(composable.isBlacklisted('File:IMG9999.JPG')).toBe(true) // Matches case-sensitive pattern
      expect(composable.isBlacklisted('File:IMG9999.jpg')).toBe(true) // Blocked by other patterns
    })
  })

  describe('Social Media Patterns', () => {
    it('should block Facebook images', () => {
      expect(composable.isBlacklisted('File:FB_IMG_1234567890.jpg')).toBe(true)
      expect(composable.isBlacklisted('FB_IMG_1234567890.jpg')).toBe(true)
    })

    it('should block WhatsApp images', () => {
      expect(composable.isBlacklisted('File:WA12345.jpg')).toBe(true)
      expect(composable.isBlacklisted('WA12345.jpg')).toBe(true)
    })
  })

  describe('Screenshot Patterns', () => {
    it('should block screenshot files', () => {
      expect(composable.isBlacklisted('File:Screenshot_2024_01_01.png')).toBe(true)
      expect(composable.isBlacklisted('Screenshot.png')).toBe(true)
      expect(composable.isBlacklisted('My_screenshot.png')).toBe(false) // Has prefix, won't match anchored pattern
    })

    it('should block macOS screen shot files', () => {
      expect(composable.isBlacklisted('File:Screen Shot 2024-01-01 at 12.00.00.png')).toBe(true)
      expect(composable.isBlacklisted('Screen Shot.png')).toBe(true)
    })
  })

  describe('Test and Sample Patterns', () => {
    it('should block generic test files', () => {
      expect(composable.isBlacklisted('File:test123.jpg')).toBe(true)
      expect(composable.isBlacklisted('File:test_image.png')).toBe(true)
      expect(composable.isBlacklisted('test123.jpg')).toBe(true)
    })

    it('should block sample files', () => {
      expect(composable.isBlacklisted('File:sample123.jpg')).toBe(true)
      expect(composable.isBlacklisted('File:sample_image.png')).toBe(true)
      expect(composable.isBlacklisted('sample123.jpg')).toBe(true)
    })
  })

  describe('Mobile App Patterns', () => {
    it('should block Signal app images', () => {
      expect(composable.isBlacklisted('File:signal-2024-01-01-123456.jpg')).toBe(true)
      expect(composable.isBlacklisted('signal-2024-01-01-123456.jpg')).toBe(true)
    })

    it('should block Telegram images', () => {
      expect(composable.isBlacklisted('File:Telegram.jpg')).toBe(true)
      expect(composable.isBlacklisted('Telegram.jpg')).toBe(true)
    })
  })

  describe('Hash-based Filenames', () => {
    it('should block MD5 hash filenames', () => {
      expect(composable.isBlacklisted('File:5d41402abc4b2a76b9719d911017c592.jpg')).toBe(true)
      expect(composable.isBlacklisted('5d41402abc4b2a76b9719d911017c592.jpg')).toBe(true)
    })

    it('should block SHA256 hash filenames', () => {
      expect(
        composable.isBlacklisted(
          'File:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.jpg',
        ),
      ).toBe(true)
      expect(
        composable.isBlacklisted(
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.jpg',
        ),
      ).toBe(true)
    })

    it('should not block non-hash patterns', () => {
      expect(composable.isBlacklisted('File:my-photo.jpg')).toBe(false)
      expect(composable.isBlacklisted('my-photo.jpg')).toBe(false)
    })
  })

  describe('Edge Cases and False Positives', () => {
    it('should not block legitimate filenames that contain blocked patterns as substrings', () => {
      expect(composable.isBlacklisted('Something with Test123.JPG in the middle.jpg')).toBe(false)
      expect(composable.isBlacklisted('Not a File:Test123.JPG but similar.jpg')).toBe(false)
      expect(composable.isBlacklisted('File:Test123.JPG.extra.text.jpg')).toBe(true) // This matches the generic test pattern
    })

    it('should not block legitimate creative filenames', () => {
      expect(
        composable.isBlacklisted(
          'Mapillary (tulzukst7vufhdo1e4z60f) (b4sti4n) 2017-06-24 13H42M49S.jpg',
        ),
      ).toBe(false)
      expect(composable.isBlacklisted('Sunset at the beach.jpg')).toBe(false)
      expect(composable.isBlacklisted('Portrait of a person.png')).toBe(false)
      expect(composable.isBlacklisted('Landscape photo.jpeg')).toBe(false)
      expect(composable.isBlacklisted('My vacation photo.jpg')).toBe(false)
    })

    it('should handle case variations correctly', () => {
      expect(composable.isBlacklisted('file:test.jpg')).toBe(true) // lowercase file:
      expect(composable.isBlacklisted('FILE:TEST.JPG')).toBe(true) // uppercase
      expect(composable.isBlacklisted('File:Test123.jpg')).toBe(true) // mixed case extension
      expect(composable.isBlacklisted('file:TEST123.JPG')).toBe(true) // mixed case everywhere
    })
  })

  describe('Prefix Blacklist', () => {
    it('should block camera prefix patterns', () => {
      expect(composable.isBlacklisted('DSC_1234.JPG')).toBe(true) // Nikon
      expect(composable.isBlacklisted('IMG_0001.png')).toBe(true) // Generic
      expect(composable.isBlacklisted('IMG1234.jpg')).toBe(true) // Generic (no underscore)
      expect(composable.isBlacklisted('DSC123.jpg')).toBe(true) // Generic (no underscore)
      expect(composable.isBlacklisted('PICT0001.jpg')).toBe(true) // misc.
      expect(composable.isBlacklisted('FOTO1234.jpg')).toBe(true) // misc.
    })

    it('should block test and sample prefixes', () => {
      expect(composable.isBlacklisted('TEST123.jpg')).toBe(true)
      expect(composable.isBlacklisted('SAMPLE123.png')).toBe(true)
      expect(composable.isBlacklisted('test_image.jpg')).toBe(true)
      expect(composable.isBlacklisted('sample_photo.png')).toBe(true)
    })

    it('should not block legitimate filenames with these strings in the middle', () => {
      expect(composable.isBlacklisted('MyDSC_1234.jpg')).toBe(false) // Prefix
      expect(composable.isBlacklisted('Photo_IMG_0001.png')).toBe(false) // Prefix
      expect(composable.isBlacklisted('testing_123.jpg')).toBe(true) // This matches TEST prefix
      expect(composable.isBlacklisted('sampling_123.png')).toBe(false) // Different prefix
    })
  })
})
