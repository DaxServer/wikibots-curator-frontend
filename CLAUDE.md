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

### Biome Integration

Auto-import generates a `.biomelintrc-auto-import.json` that configures Biome to ignore auto-imported variables. The linter is configured to exclude `**/*.d.ts` files.

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

### Component Patterns

Components use `<script setup lang="ts">` with Composition API. Since components and composables are auto-imported, you typically won't see import statements for them.

Icons are NOT auto-imported - they must be manually imported from PrimeIcons.

### Testing

- Tests in `__tests__/` directories alongside source files
- `bun:test` as test runner
- Happy DOM for browser simulation
- `@pinia/testing` for store testing
- Tests follow the pattern: `[name].test.ts`

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

## Domain Concepts

- **Handler** - Image source (currently only `mapillary`)
- **Item** - An image with metadata (`Item` type in `types/image.ts`)
- **Batch** - A collection of uploads tracked together (`BatchItem` in AsyncAPI types)
- **Title Status** - Validation state of generated titles (`TITLE_ERROR_STATUSES` in `types/image.ts`)
- **Layout** - View mode (`list` or `grid`) for collection display
- **Preset Modes** - Three UI states: Preset Mode (`currentPresetId` set), Editing Preset Mode (`presetIdToUpdate` set, `currentPresetId` null), Manual Mode (both null)
