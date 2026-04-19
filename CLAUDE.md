## Project Overview

Curator Frontend — Vue 3 + TypeScript app for Wikimedia image curation. Manages Mapillary image collections, batch uploads to Wikimedia Commons, admin functionality.

## Development Commands

```bash
# Development server (runs on port 5173)
bun dev

# Type checking
bun typecheck

# Linting
bun lint

# Format code
bun format

# Generate AsyncAPI types from WebSocket contract
bun generate
```

**Note:** `asyncapi.json` = source of truth for WebSocket messages. After editing:
1. Run `bun generate` - Updates backend Python models AND frontend TypeScript types
2. Backend code generation auto-formats with ruff
3. Frontend types are generated to `src/types/asyncapi.ts`
4. When adding new server messages, update all 4 locations in `asyncapi.json`:
   - `components/messages/` - Message definition
   - `components/schemas/` - Schema with type, data, nonce properties
   - `channels/wsChannel/messages/` - Channel reference
   - `operations/ServerMessage/messages/` - Server operation (alphabetical order)

**Generator type inference:** `bun generate` uses `tsc` to infer template literal types from JSON schema patterns (e.g., `ItemId = \`Q${number}\``). If types degrade to `string` after dep bump, likely new TypeScript error (e.g., TS5112 in TS 6.0) polluting `tsc` output. Fix: add suppression flag to `Bun.spawnSync` call in `getInferredType()` in `scripts/asyncapi.ts`.

## Technology Stack

- **Vue 3** with Composition API (`<script setup lang="ts">`)
- **TypeScript** strict type checking (`noExplicitAny` enforced)
- **Vite** build tool
- **Bun** 1.3.9 package manager (enforced in package.json)
- **Pinia** state management
- **PrimeVue** 4.5.4 + TailwindCSS for UI
- **Biome** linting (Prettier for formatting only)

## Auto-Import Configuration

Auto-imports configured in `vite.config.ts`:

### What's Auto-Imported

**Vue ecosystem:** All Vue composables (`ref`, `computed`, `watch`, etc.), Pinia functions, Vue Router

**VueUse:** All composables from `@vueuse/core` + `useRouteParams` from `@vueuse/router`

**Project files:** All `src/**` files auto-imported
- Components: No manual imports needed for `.vue` files
- Composables: No manual imports for `.ts` in composables
- Stores: Pinia stores in `src/stores/`

**PrimeVue:** Components auto-resolved via `PrimeVueResolver`, plus:
- `useConfirm` from `primevue/useconfirm`
- Types: `MeterItem`, `DataTableCellEditEvent`, `MessageProps`, etc.

**Utilities:** `debounce` from `ts-debounce`

### Important Caveat

Auto-imports can generate TypeScript errors with JavaScript reserved keywords (e.g., `const`, `var`, `function`). If `auto-imports.d.ts` has reserved keyword errors, manually remove those lines.

**Composable `.ts` files are NOT auto-imported.** Only `.vue` SFCs get Vite's auto-import at runtime. Composable `.ts` files (e.g., `usePresetManager.ts`) must explicitly import stores, other composables, and PrimeVue utilities like `useToast`.

**Composable cleanup — `onScopeDispose` not `onUnmounted`:** Use `onScopeDispose` in composables — works in component context and bare `effectScope` (tests). Explicitly import from `'vue'` even though it appears in `auto-imports.d.ts`; TypeScript may flag as "declared but never read" (false positive) but bun test needs real import at runtime.

### Biome Integration

Auto-import generates `.biomelintrc-auto-import.json` configuring Biome to ignore auto-imported vars. Linter excludes `**/*.d.ts`.

### Layout Width

`max-w-7xl mx-auto` constraint for all step content lives in `CollectionsTable.vue:22`, not step components.

## Architecture

### Directory Structure

```
src/
├── components/         # Vue components organized by feature
│   ├── batch/         # Batch upload UI
│   ├── collection/    # Collection display/management
│   ├── edit/          # Image editing forms
│   ├── feedback/      # Error/feedback messages
│   ├── form/          # Form components
│   ├── layout/        # Layout components (Header, Footer)
│   ├── mapillary/     # Mapillary-specific components
│   ├── preview/       # Image previews
│   ├── steps/         # Multi-step wizards
│   ├── template/      # Template editing
│   ├── ui/            # Reusable UI components
│   └── views/         # Main page views
├── composables/       # Business logic (Vue composables)
│   └── __tests__/     # Tests alongside composables
├── stores/            # Pinia stores
├── types/             # TypeScript definitions
│   ├── asyncapi.ts    # WebSocket message types
│   ├── collections.ts # Collection-related types
│   ├── image.ts       # Image/metadata types
│   └── admin.ts       # Admin types
├── utils/             # Utility functions
└── router/            # Vue Router configuration
```

### State Management Pattern

Pinia stores in `src/stores/`:

- **collections.store.ts** - Image collections, selection, pagination, batch uploads, global metadata
- **auth.store.ts** - Auth state
- **admin.store.ts** - Admin functions

Stores use Composition API pattern with `defineStore` (arrow function syntax). State reactive via `ref`/`reactive`; computed properties derive values.

**Store vs local state:** Use Pinia store for state shared across components. Local refs duplicated across components need manual event sync chains — fragile. State affecting multiple components or needing sync → belongs in store.

### Component Patterns

Components use `<script setup lang="ts">`. Components/composables auto-imported — no import statements needed.

Icons NOT auto-imported — manually import from PrimeIcons.

**Template conventions:** Props accessed by name directly (not `props.propName`). Events emitted via `$emit('event')` in templates, not `emit` const from `defineEmits`. `const emit =` only needed when emitting from script logic.

**Vue Transitions:** For complex animations like accordions, use named transitions with scoped CSS over inline Transition props with Tailwind:
```vue
<Transition name="accordion">
  <div v-if="isOpen" class="overflow-hidden">...</div>
</Transition>

<style scoped>
.accordion-enter-active, .accordion-leave-active {
  transition: all 300ms ease-in-out;
  max-height: 2000px;
  overflow: hidden;
}
.accordion-enter-from, .accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
```

**Parent-child communication:** Use event emitters over `defineExpose`. Emit state changes up component tree; don't expose refs.

**TypeScript null handling:** Explicit nullable props: `prop: Type | null` over `prop?: Type` when prop can be null — distinguishes "not provided" (undefined) from "explicitly null".

### Testing

- Tests in `__tests__/` alongside source files
- `bun:test` test runner
- Happy DOM for browser simulation
- `@pinia/testing` for store testing
- Pattern: `[name].test.ts`
- Store tests in `src/stores/__tests__/`; shared fixtures in `src/__tests__/fixtures.ts` (imported as `@/__tests__/fixtures`)

**Vue watcher timing in tests:** Watchers fire async; `await nextTick()` needed between reactive state change and assertions depending on watcher callback (e.g., triggering second debounced call to exercise abort behavior).

**Debounce mock pattern:** `mock.module('ts-debounce', ...)` must appear before any import of module under test. Composable imported dynamically inside `beforeEach` after `mock.restore()` — each test gets fresh module load. `pendingDebounceExecutors` array captures debounced calls for manual execution. See `src/composables/__tests__/useTemplateEditor.test.ts` for full pattern.

**Watcher flush in composable tests:** Watchers default to async (microtask) flush. When test sets reactive ref and immediately asserts, use `{ flush: 'sync' }` on the watcher so it fires synchronously:

```ts
watch(data, handler, { flush: 'sync' })
```

**Module-level composable state in tests:** Composables holding module-level `ref` state (singletons) retain values across tests. Reset explicitly in `beforeEach`:

```ts
beforeEach(() => {
  const { items, loading } = useMyComposable()
  items.value = []
  loading.value = false
})
```

For non-ref module-level state (e.g. a `Set`), export directly and reset via typed dynamic import:

```ts
// composable
export const queriedItems = new Set<string>()

// test
import type * as Mod from '../useMyComposable'
beforeEach(async () => {
  const mod = (await import('../useMyComposable')) as typeof Mod
  mod.queriedItems.clear()
})
```

**POST body assertions in tests:** Use `new URLSearchParams(rawBody).get('key')` to assert on fetch POST bodies — raw body uses `+` for spaces, so `.toContain('foo bar')` won't match.

**Lazy DataView client-side filtering:** Use `v-show` on rows, not filtering `:value` array — changing `:value` on `lazy` DataView corrupts pagination state (total-records, first, page).

**Auto-imports regeneration:** After adding composable/store, `bun typecheck` fails with "Cannot find name" until `auto-imports.d.ts` regenerated. Run `bunx vite build` (triggers `unplugin-auto-import`) then delete `dist/`.

**Third-party constants in components:** Constants from external packages (e.g. `FilterMatchMode` from `@primevue/core/api`) not auto-imported by default. Add to `imports` array in `vite.config.ts` under `AutoImport({imports: [...]})` — don't hardcode string literals or add manual imports:

```ts
{ from: '@primevue/core/api', imports: ['FilterMatchMode'] }
```

**Composable tests with watchers:** Composables calling `watch()` (including transitively) must run inside `effectScope` to prevent watcher leaks:
```ts
import { afterEach, beforeEach } from 'bun:test'
import { effectScope } from 'vue'
let scope = effectScope()
beforeEach(() => { scope = effectScope() })
afterEach(() => { scope.stop() })
const run = () => scope.run(() => useMyComposable())!
```

**Drag-drop into textareas:** Native textareas accept text drops without JS — no `@dragover.prevent`, `@drop`, `@focus`, or `@blur`. These interfere with native drop behavior (e.g. `@blur` fires on mousedown of drag source → Vue re-renders mid-drag; `@dragover.prevent` signals browser JS owns drop → breaks native insertion). Card ring highlights: use CSS `focus-within:ring-2 focus-within:ring-X-300` on parent Card, not JS focus tracking.

**PrimeVue mocks in tests:** `useToast` and similar PrimeVue utilities require mocking before any import that depends on them:
```ts
mock.module('primevue/usetoast', () => ({ useToast: () => ({ add: mock(() => {}) }) }))
```

## API Proxying

Dev server (Vite) proxies API calls to backend:

- `/auth/*` → `http://localhost:8000`
- `/api/*` → `http://localhost:8000`
- `/callback/wikimedia` → rewritten to `/auth/callback`

No hardcoded API hosts — use proxy paths.

## WebSocket Integration

Real-time features use WebSocket connections defined in AsyncAPI contract (`src/types/asyncapi.ts` generated by `bun generate`). `useSocket.ts` handles WebSocket for upload status updates.

**Navigation after WebSocket responses:**
- For responses triggering navigation (e.g., retry creates new batch), set store state (e.g., `retryNewBatchId`)
- Components watch store state, navigate on change via `router.push()`
- Unsubscribe from old batch before navigating — avoid stale subscriptions
- Skip unnecessary data fetches when navigating away (early-return or conditional in retry functions)

**State updates after WebSocket responses:**
- WebSocket responses updating store arrays (e.g., `PRESETS_LIST` → `store.presets`) are async
- Use watchers on updated store property to complete dependent ops (e.g., setting `currentPresetId` after save)
- Temporary flags prevent watcher conflicts when multiple watchers observe same reactive source

## Code Style

**Typed const dispatch maps:** Use `satisfies Record<string, ...>` (not `as const`) for known-key maps — keeps narrow literal types for `keyof typeof`. Example: `CATEGORY_TEXT_MAP` in `useCreateCategory.ts`. `keyof typeof MAP` yields precise union, not `string`.

- **No `any` types** — Biome enforces (`noExplicitAny: error`)
- **Single quotes, semicolons as-needed** — configured in biome.json
- **Utility classes only** — no manual styles (TailwindCSS)
- **No linter ignore statements** — fix issues instead
- **No dark theme** — don't use `dark:` Tailwind variants; app doesn't support dark mode
- Run `bun typecheck && bun lint && bun format` before committing

## Async Patterns

**AbortController signal capture:** Capture `signal` from controller before `await` (`const { signal } = abortController`), use `signal.aborted` — not `abortController?.signal.aborted` — in `finally` blocks. Shared `abortController` may be reassigned by subsequent call before current `finally` runs → wrong signal checked.

## Feature Flags

`src/composables/useFeatureFlags.ts` gates features by `auth.isAdmin`. Flags: `redlinksEnabled`, `wantedCategoriesEnabled`. Returns `ComputedRef<boolean>` — wrap with `computed(() => auth.isAdmin)` not plain ref; Pinia auto-unwraps refs in returned objects → tests get `undefined` on `.value`.

## Wanted Categories

**`getCategoryText(title)`** in `useCreateCategory.ts` maps category title patterns to wikitext via `CATEGORY_TEXT_MAP` (satisfies pattern). Each entry has `pattern: RegExp` and `getText(match)`. Returns `{{subst:unc}}` for unrecognized titles.

**`getFocalLengthRedirect(title)`** returns target integer category for zero-decimal focal length titles (`79.0 mm` / `79,0 mm` → `Lens focal length 79 mm`), or `null` for all other. Used in `WantedCategoriesView` to show "Recategorize" over "Create" and exclude from bulk select (`visibleIdleTitles`).

**`CategoryStatus`** union includes `recategorizing` and `recategorized` (with `count`) for `RECATEGORIZE_FILES` WebSocket flow, alongside create/error states.

## Wikimedia Commons API

**Titles per request limit:** `action=query&titles=` accepts at most 50 titles for non-bot users (500 with `apihighlimits`). Both `useTitleVerification.ts` and `useCategoryValidation.ts` chunk at 50 via `for (let i = 0; i < items.length; i += 50)` loop with shared `AbortController` signal checked each iteration.

## PrimeVue Component Patterns

**DataTable header background (Noir theme):** Setting `sort-field`/`sort-order` pre-selects sorted column on load → triggers `selectedBackground` (black in Noir) on that header. Don't set default sort props unless black header intended. Override header colors globally via component tokens in `src/assets/Noir.ts` under `components.datatable.headerCell` — CSS selectors (even `!important`) lose to PrimeVue v4's dynamically injected theme tokens.

**DatePicker events:** Use `@update:model-value` as single handler for all date changes. `@date-select` and `@clear` unreliable — `@clear` may not fire with `show-clear`. Emit downstream events (e.g., `dateChange`) from `@update:model-value`.

**Button styling:** Use `severity` prop with `outlined` for semantic styling:
- Normal action: `outlined` (default)
- Danger action: `severity="danger"` + `outlined`
- Primary action: `severity="primary"` (filled, no outlined)

## Domain Concepts

### Title Template System

Title template system in `src/composables/useTitleTemplate.ts` and `src/utils/titleTemplate.ts`. `applyFieldTemplate()` in `titleTemplate.ts` regex-based (no Handlebars) — substitutes `{{known.path}}` tokens, leaves unknown `{{...}}` tokens (e.g. wikitext `{{Creator|John}}`) untouched.

**`meta.title` semantics:** `Metadata.title` stores user-entered titles only. When empty, `getEffectiveTitle()` in `useTitleVerification.ts` falls back to `getTemplateTitle()` computing from `store.globalTitleTemplate`. `verifyTitles()` never writes to `meta.title` — only updates `titleStatus`.

**`applyMetaDefaults` signature:** Takes `Item` (not `Metadata`) so image context is available for `applyFieldTemplate` when falling back to `globalDescription`/`globalCategories`.

**`GlobalTemplateEditor`:** When `fieldTemplatesEnabled`, `Step3Header.vue` renders `GlobalTemplateEditor` over `TitleTemplateEditor` + Fallback Values card. `useTemplateEditor` wraps `useTitleTemplate`, adds description/categories template state and `onDragStart` (drag-and-drop is UI concern, not `useTitleTemplate`'s). `allMissingOptionalFieldPaths` covers all three templates. Textareas have no event handlers; card focus rings use CSS `focus-within`. Two sub-components in `src/components/template/`: `HighlightedTextarea.vue` (overlay: highlighted div + transparent Textarea) and `TemplateStatusBadge.vue` (✓ Applied / Applying... badge).

**`verifyTitlesWithTemplate` guard:** Items with non-empty `meta.title` skipped (treated as user-entered), except `MissingFields` items whose title was written by template system. When `MissingFields` item recovers (offending field removed from template), `meta.title` must be explicitly cleared to `''` so `getEffectiveTitle` falls back to template.

**Optional field warning system:**
- `OPTIONAL_FIELD_PATHS` = `[...CAMERA_FIELD_PATHS, ...OPTIONAL_LOCATION_FIELD_PATHS]` — all fields that can be absent
- `allMissingOptionalFieldPaths` (Set) — paths any selected item is missing, independent of template; drives icon visibility in `TitleTemplateEditor.vue`
- `itemsMissingOptionalFields` — items missing at least one field also used in current template; drives yellow highlight count
- Icon shows if field in `allMissingOptionalFieldPaths`; yellow if also in `usedOptionalFields`
- Location numeric fields (`compass_angle`) use `== null` (0 = North, valid); location string fields use `!value` (empty = missing), matching camera field behavior

- **License field** — `meta.license` in data model/store but not exposed in Step 3 UI — Mapillary uses fixed license, per-item/global overrides not applicable
- **Handler** — Image source (currently only `mapillary`)
- **Item** — Image with metadata (`Item` type in `types/image.ts`). `index` 1-based.
- **Batch** — Collection of uploads tracked together (`BatchItem` in AsyncAPI types)
- **Title Status** — Validation state of generated titles (`TITLE_ERROR_STATUSES` in `types/image.ts`)
- **Layout** — View mode (`list` or `grid`) for collection display
- **Preset** — Active preset tracked by `store.currentPresetId` (null = manual mode). Three UI modes:
  1. **Selected (not editing)**: Read-only PresetPreview, forms hidden, images list + controls shown
  2. **Editing**: Preset preview hidden, forms shown, images list + controls hidden, "Change preset"/Edit/Remove buttons hidden
  3. **Manual (no preset)**: Forms shown, images list + controls shown

  Preset creation (accordion "Create new preset") treated like editing mode — hides images list until canceled/saved. Preset removal ("Remove preset") → manual mode with forms + images list visible.

  Orchestration in `usePresetManager` (`selectPreset`, `clearPreset`, `handleEditPreset`, `handleCancelEdit`).

## MapLibre GL JS Integration

**Container setup:** Reference container by string `id` (not Vue `ref`). Set height via scoped CSS — MapLibre reads `clientHeight` at init before Tailwind JIT resolves.

**Layer ordering:** Layers render in insertion order (first = bottom). Add background/direction layers before pin layers.

**Paint expressions:** WebGL-based — CSS `var()` not supported. Hardcode hex values.

**OpenFreeMap liberty style** has known missing sprite icons — cosmetic warnings, safe to ignore. Use `positron` for cleaner minimal style.
