# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Curator Frontend - a Vue 3 + TypeScript application for Wikimedia's image curation tool. It manages image collections from Mapillary, handles batch uploads to Wikimedia Commons, and provides administrative functionality.

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

**Note:** `asyncapi.json` is the source of truth for WebSocket messages. After editing:
1. Run `bun generate` - Updates backend Python models AND frontend TypeScript types
2. Backend code generation auto-formats with ruff
3. Frontend types are generated to `src/types/asyncapi.ts`
4. When adding new server messages, update all 4 locations in `asyncapi.json`:
   - `components/messages/` - Message definition
   - `components/schemas/` - Schema with type, data, nonce properties
   - `channels/wsChannel/messages/` - Channel reference
   - `operations/ServerMessage/messages/` - Server operation (alphabetical order)

**Generator type inference:** `bun generate` uses `tsc` to infer template literal types from JSON schema patterns (e.g., `ItemId = \`Q${number}\``). If these degrade to `string` after a dep bump, the cause is likely a new TypeScript error (e.g., TS5112 in TS 6.0) polluting the `tsc` output. The fix is adding the relevant suppression flag to the `Bun.spawnSync` call in `getInferredType()` in `scripts/asyncapi.ts`.

## Technology Stack

- **Vue 3** with Composition API (`<script setup lang="ts">`)
- **TypeScript** with strict type checking (`noExplicitAny` is enforced)
- **Vite** as build tool
- **Bun** 1.3.9 as package manager (enforced in package.json)
- **Pinia** for state management
- **PrimeVue** 4.5.4 + TailwindCSS for UI
- **Biome** for linting (Prettier for formatting only)

## Auto-Import Configuration

The project uses extensive auto-imports configured in `vite.config.ts`:

### What's Auto-Imported

**Vue ecosystem:** All Vue composables (`ref`, `computed`, `watch`, etc.), Pinia functions, Vue Router

**VueUse:** All composables from `@vueuse/core` plus `useRouteParams` from `@vueuse/router`

**Project files:** All files in `src/**` directories are auto-imported
- Components: No manual imports needed for `.vue` files
- Composables: No manual imports needed for `.ts` files in composables
- Stores: Pinia stores in `src/stores/`

**PrimeVue:** Components auto-resolved via `PrimeVueResolver`, plus specific imports:
- `useConfirm` from `primevue/useconfirm`
- Types: `MeterItem`, `DataTableCellEditEvent`, `MessageProps`, etc.

**Utilities:** `debounce` from `ts-debounce`

### Important Caveat

Auto-imports can generate TypeScript errors with JavaScript reserved keywords (e.g., `const`, `var`, `function`). If `auto-imports.d.ts` has errors related to reserved keywords, manually remove those lines from the generated file.

**Composable `.ts` files are NOT auto-imported.** Only `.vue` SFCs receive Vite's auto-import treatment at runtime. Composable `.ts` files (e.g., `usePresetManager.ts`) must explicitly import stores, other composables, and PrimeVue utilities like `useToast`.

**Composable cleanup — `onScopeDispose` not `onUnmounted`:** Use `onScopeDispose` for cleanup in composables — works in both component context and bare `effectScope` (tests). Explicitly import it from `'vue'` even though it appears in `auto-imports.d.ts`; TypeScript may flag it as "declared but never read" (false positive from the global shadow) but bun test needs the real import at runtime.

### Biome Integration

Auto-import generates a `.biomelintrc-auto-import.json` that configures Biome to ignore auto-imported variables. The linter is configured to exclude `**/*.d.ts` files.

### Layout Width

The `max-w-7xl mx-auto` constraint for all step content (including Step 3's preset card) lives in `CollectionsTable.vue:22`, not in the step components themselves.

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

Centralized state in Pinia stores located in `src/stores/`:

- **collections.store.ts** - Main state for image collections, selection, pagination, batch uploads, global metadata
- **auth.store.ts** - Authentication state
- **admin.store.ts** - Administrative functions

Stores use the Composition API pattern with `defineStore` (arrow function syntax). State is reactive with `ref`/`reactive`, and computed properties derive values.

**Store vs local state:** Use Pinia store for state shared across multiple components. Local refs duplicated across components require manual event synchronization chains that are fragile and hard to maintain. If state affects multiple components or requires events to stay in sync, it belongs in the store.

### Component Patterns

Components use `<script setup lang="ts">` with Composition API. Since components and composables are auto-imported, you typically won't see import statements for them.

Icons are NOT auto-imported - they must be manually imported from PrimeIcons.

**Template conventions:** Props are accessed directly by name (not `props.propName`). Events are emitted with `$emit('event')` directly in templates, not via the `emit` const from `defineEmits`. The `const emit =` assignment is only needed when emitting from script logic.

**Vue Transitions:** For complex animations like accordions, use named transitions with scoped CSS instead of inline Transition props with Tailwind classes:
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

**Parent-child communication:** Use event emitters instead of `defineExpose` for sharing state between components. Emit state changes up the component tree rather than exposing refs.

**TypeScript null handling:** Be explicit about nullable props. Use `prop: Type | null` instead of `prop?: Type` when a prop can be null, to distinguish between "not provided" (undefined) and "explicitly null" values.

### Testing

- Tests in `__tests__/` directories alongside source files
- `bun:test` as test runner
- Happy DOM for browser simulation
- `@pinia/testing` for store testing
- Tests follow the pattern: `[name].test.ts`
- Store tests go in `src/stores/__tests__/`; shared test fixtures in `src/__tests__/fixtures.ts` (imported as `@/__tests__/fixtures`)

**Vue watcher timing in tests:** Watchers fire asynchronously; `await nextTick()` is needed between a reactive state change and any assertion that depends on the watcher callback having run (e.g., triggering a second debounced call to exercise abort behavior).

**Debounce mock pattern:** When testing composables that use `ts-debounce`, `mock.module('ts-debounce', ...)` must appear before any import of the module under test. The composable is imported dynamically inside `beforeEach` after `mock.restore()` so each test gets a fresh module load. A `pendingDebounceExecutors` array captures debounced calls for manual execution in tests. See `src/composables/__tests__/useTemplateEditor.test.ts` for the full pattern.

**Watcher flush in composable tests:** Watchers in composables default to async (microtask) flush. When a test sets a reactive ref and immediately asserts on the result, use `{ flush: 'sync' }` on the watcher so it fires synchronously:

```ts
watch(data, handler, { flush: 'sync' })
```

**Module-level composable state in tests:** Composables that hold module-level `ref` state (singletons) retain their values across tests. Reset the state explicitly in `beforeEach`:

```ts
beforeEach(() => {
  const { items, loading } = useMyComposable()
  items.value = []
  loading.value = false
})
```

**Auto-imports regeneration:** After adding a new composable or store, `bun typecheck` will fail with "Cannot find name" until `auto-imports.d.ts` is regenerated. Run `bunx vite build` (which triggers Vite plugins including `unplugin-auto-import`) to regenerate it, then delete `dist/` afterwards.

**Third-party constants in components:** Constants from external packages (e.g. `FilterMatchMode` from `@primevue/core/api`) are not auto-imported by default. Add them to the `imports` array in `vite.config.ts` under `AutoImport({imports: [...]})` rather than hardcoding string literals or adding manual imports to components:

```ts
{ from: '@primevue/core/api', imports: ['FilterMatchMode'] }
```

**Composable tests with watchers:** Composables that call `watch()` (including transitively) must run inside an `effectScope` to prevent watcher leaks across tests:
```ts
import { afterEach, beforeEach } from 'bun:test'
import { effectScope } from 'vue'
let scope = effectScope()
beforeEach(() => { scope = effectScope() })
afterEach(() => { scope.stop() })
const run = () => scope.run(() => useMyComposable())!
```

**Drag-drop into textareas:** Native textareas accept text drops without any JavaScript — no `@dragover.prevent`, `@drop`, `@focus`, or `@blur` on the textarea. Any of these can interfere with native drop behavior (e.g. `@blur` firing on mousedown of the drag source triggers Vue re-renders mid-drag; `@dragover.prevent` signals the browser that JS owns the drop, breaking native insertion). For card ring highlights use CSS `focus-within:ring-2 focus-within:ring-X-300` on the parent Card instead of JS focus tracking.

**PrimeVue mocks in tests:** `useToast` and similar PrimeVue utilities require mocking before any import that depends on them:
```ts
mock.module('primevue/usetoast', () => ({ useToast: () => ({ add: mock(() => {}) }) }))
```

## API Proxying

Development server (Vite) proxies API calls to backend:

- `/auth/*` → `http://localhost:8000`
- `/api/*` → `http://localhost:8000`
- `/callback/wikimedia` → rewritten to `/auth/callback`

No hardcoded API hosts - use proxy paths.

## WebSocket Integration

Real-time features use WebSocket connections defined in AsyncAPI contract (`src/types/asyncapi.ts` generated by `bun generate`). The `useSocket.ts` composable handles WebSocket connections for upload status updates.

**Navigation after WebSocket responses:**
- For responses that should trigger navigation (e.g., retry creates new batch), set a store state (e.g., `retryNewBatchId`)
- Components watch the store state and navigate when it changes using `router.push()`
- Unsubscribe from old batch before navigating to avoid stale subscriptions
- Skip unnecessary data fetches when navigating away (early-return or conditional in retry functions)

**State updates after WebSocket responses:**
- WebSocket responses that update store arrays (e.g., `PRESETS_LIST` → `store.presets`) are asynchronous
- Use watchers on the updated store property to complete dependent operations (e.g., setting `currentPresetId` after save)
- Use temporary flags to prevent watcher conflicts when multiple watchers observe the same reactive source

## Code Style

- **No `any` types** - Enforced by Biome linter (`noExplicitAny: error`)
- **Single quotes, semicolons as-needed** - Configured in biome.json
- **Utility classes only** - No manual styles (TailwindCSS)
- **No linter ignore statements** - Fix issues instead
- Run `bun typecheck && bun lint && bun format` before committing

## Async Patterns

**AbortController signal capture:** When using `AbortController` in async functions, always capture `signal` from the controller before the `await` (`const { signal } = abortController`) and use `signal.aborted` — not `abortController?.signal.aborted` — in `finally` blocks. The shared `abortController` variable may be reassigned by a subsequent call before the current `finally` runs, causing the wrong signal to be checked.

## Feature Flags

`src/composables/useFeatureFlags.ts` gates features by username allowlist. Add a new `const FEATURE_ALLOWED_USERS` array and a `computed` flag. Currently gated feature: `fieldTemplatesEnabled` (description/categories template editing in `GlobalTemplateEditor`).

## Wikimedia Commons API

**Titles per request limit:** The `action=query&titles=` parameter accepts at most 50 titles for non-bot users (500 with `apihighlimits`). Both `useTitleVerification.ts` and `useCategoryValidation.ts` chunk requests at 50 using a `for (let i = 0; i < items.length; i += 50)` loop with a shared `AbortController` signal checked at the top of each iteration.

## PrimeVue Component Patterns

**DataTable header background (Noir theme):** Setting `sort-field`/`sort-order` pre-selects a sorted column on load, which triggers `selectedBackground` (`highlight.background` = black in Noir) on that header. Don't set default sort props unless a black header is intended. To override header colors globally, add component token overrides in `src/assets/Noir.ts` under `components.datatable.headerCell` — CSS class selectors (even with `!important`) don't win against PrimeVue v4's dynamically injected theme tokens.

**DatePicker events:** Use `@update:model-value` as the single handler for all date changes (selection and clear). The separate `@date-select` and `@clear` events are unreliable — `@clear` may not fire when `show-clear` is used. Emit downstream events (e.g., `dateChange`) from `@update:model-value` instead.

**Button styling:** Use `severity` prop with `outlined` for semantic styling:
- Normal action: `outlined` (default)
- Danger action: `severity="danger"` + `outlined`
- Primary action: `severity="primary"` (filled, no outlined)

## Domain Concepts

### Title Template System

The title template system lives in `src/composables/useTitleTemplate.ts` and `src/utils/titleTemplate.ts`. `applyFieldTemplate()` in `titleTemplate.ts` is a regex-based variant (no Handlebars) that substitutes `{{known.path}}` tokens and leaves unknown `{{...}}` tokens (e.g. wikitext like `{{Creator|John}}`) untouched.

**`meta.title` semantics:** `Metadata.title` stores only user-entered titles. When empty, `getEffectiveTitle()` in `useTitleVerification.ts` falls back to `getTemplateTitle()` which computes from `store.globalTitleTemplate`. `verifyTitles()` never writes to `meta.title` — it only updates `titleStatus`.

**`applyMetaDefaults` signature:** Takes `Item` (not `Metadata`) so image context is available for `applyFieldTemplate` when falling back to `globalDescription`/`globalCategories`.

**`GlobalTemplateEditor`:** When `fieldTemplatesEnabled`, `Step3Header.vue` renders `GlobalTemplateEditor` instead of `TitleTemplateEditor` + Fallback Values card. The composable `useTemplateEditor` wraps `useTitleTemplate` and adds description/categories template state and `onDragStart` (drag-and-drop is a UI concern, not owned by `useTitleTemplate`). `allMissingOptionalFieldPaths` considers all three templates combined. Textareas have no event handlers; card focus rings use CSS `focus-within`. Two sub-components in `src/components/template/`: `HighlightedTextarea.vue` (overlay pattern: highlighted div + transparent Textarea) and `TemplateStatusBadge.vue` (✓ Applied / Applying... badge).

**`verifyTitlesWithTemplate` guard:** Items with a non-empty `meta.title` are skipped (treated as user-entered), except items in `MissingFields` status whose title was written by the template system. When a `MissingFields` item recovers (offending field removed from template), its `meta.title` must be explicitly cleared to `''` so `getEffectiveTitle` falls back to the template again.

**Optional field warning system:**
- `OPTIONAL_FIELD_PATHS` = `[...CAMERA_FIELD_PATHS, ...OPTIONAL_LOCATION_FIELD_PATHS]` — all fields that can be absent
- `allMissingOptionalFieldPaths` (Set) — which paths ANY selected item is missing, independent of the template; drives icon visibility in `TitleTemplateEditor.vue`
- `itemsMissingOptionalFields` — items missing at least one field that is ALSO used in the current template; drives yellow highlight count
- Icon shows if field is in `allMissingOptionalFieldPaths`; icon is yellow if also in `usedOptionalFields`
- Location numeric fields (`compass_angle`) use `== null` check (0 = North, valid); location string fields use `!value` (empty string = missing), matching camera field behavior

- **License field** - `meta.license` exists in the data model and store but is intentionally not exposed in the Step 3 UI — Mapillary images use a fixed license so per-item and global license overrides are not applicable
- **Handler** - Image source (currently only `mapillary`)
- **Item** - An image with metadata (`Item` type in `types/image.ts`)
- **Batch** - A collection of uploads tracked together (`BatchItem` in AsyncAPI types)
- **Title Status** - Validation state of generated titles (`TITLE_ERROR_STATUSES` in `types/image.ts`)
- **Layout** - View mode (`list` or `grid`) for collection display
- **Preset** - Active preset tracked by `store.currentPresetId` (null = manual mode). Three preset UI modes with different visibility rules:
  1. **Selected preset (not editing)**: Shows read-only PresetPreview, hides forms, shows images list and controls
  2. **Editing preset**: Hides preset preview, shows editable forms, hides images list and controls, hides "Change preset" and Edit/Remove buttons
  3. **Manual mode (no preset)**: Shows editable forms, shows images list and controls

  Preset creation (via accordion "Create new preset" button) is treated like editing mode - hides images list until canceled/saved. Preset removal (via "Remove preset" button) enters manual mode with both forms and images list visible.

  Orchestration lives in `usePresetManager` composable (`selectPreset`, `clearPreset`, `handleEditPreset`, `handleCancelEdit`).
