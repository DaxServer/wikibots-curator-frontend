<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

type DotState = 'idle' | 'selected' | 'skipped'

const activeTab = ref('0')
const animTimer = ref<ReturnType<typeof setTimeout> | null>(null)
let animGeneration = 0

// ── Nth tab ────────────────────────────────────────────────────────────────
const NTH_N = 3
const NTH_RESULT = selectEveryNth(DEMO_ITEMS, NTH_N)

const nthStates = ref<DotState[]>(Array(DEMO_ITEMS.length).fill('idle'))
const nthStatus = ref('')
const nthSelectedCount = ref(0)

const nthDotData = computed(() => nthStates.value.map((state, i) => ({ state, num: i + 1 })))

// ── Time tab ───────────────────────────────────────────────────────────────
const TIME_ITEMS = DEMO_ITEMS.slice(0, 7)
const TIME_MIN_MS = 10_000
const TIME_RESULT = selectByMinInterval(TIME_ITEMS, TIME_MIN_MS)
const TIME_MAX_MS = TIME_ITEMS.reduce((max, item) => Math.max(max, item.capturedAt.getTime()), 0)

const timeStates = ref<DotState[]>(Array(TIME_ITEMS.length).fill('idle'))
const timeStatus = ref('')
const timeSelectedCount = ref(0)

const timeDotData = computed(() =>
  TIME_ITEMS.map((item, i) => {
    const ms = item.capturedAt.getTime()
    const state: DotState = timeStates.value[i] ?? 'idle'
    return {
      state,
      num: i + 1,
      label: `${ms / 1000}s`,
      x: 3 + (TIME_MAX_MS > 0 ? (ms / TIME_MAX_MS) * 94 : 0),
      isTop: i % 2 === 0,
    }
  }),
)

// ── Distance tab ───────────────────────────────────────────────────────────
const DIST_MIN_METERS = 100
const TRAVERSAL_RESULT = selectByTraversalDistance(DEMO_ITEMS, DIST_MIN_METERS)
const STRAIGHT_RESULT = selectByStraightLineDistance(DEMO_ITEMS, DIST_MIN_METERS)

const traversalStates = ref<DotState[]>(Array(DEMO_ITEMS.length).fill('idle'))
const straightStates = ref<DotState[]>(Array(DEMO_ITEMS.length).fill('idle'))
const distStatus = ref('')
const distSelectedCount = ref({ traversal: 0, straight: 0 })

const SVG_DOTS: Array<{ x: number; y: number }> = [
  { x: 15, y: 52 },
  { x: 52, y: 22 },
  { x: 90, y: 40 },
  { x: 130, y: 18 },
  { x: 163, y: 48 },
  { x: 203, y: 32 },
  { x: 242, y: 52 },
  { x: 278, y: 22 },
  { x: 315, y: 42 },
]

const SVG_PATH =
  'M 15 52 C 28 38 42 18 52 22 C 68 28 78 42 90 40 C 106 37 118 15 130 18 C 143 21 154 46 163 48 C 178 51 192 30 203 32 C 218 34 232 54 242 52 C 255 50 267 20 278 22 C 293 25 307 44 315 42'

const traversalDotData = computed(() =>
  SVG_DOTS.map((pos, i) => {
    const state: DotState = traversalStates.value[i] ?? 'idle'
    return { ...pos, state }
  }),
)

const straightDotData = computed(() =>
  SVG_DOTS.map((pos, i) => {
    const state: DotState = straightStates.value[i] ?? 'idle'
    return { ...pos, state }
  }),
)

const straightLineConnections = computed(() => {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  let lastPos: { x: number; y: number } | null = null
  SVG_DOTS.forEach((pos, i) => {
    const state: DotState = straightStates.value[i] ?? 'idle'
    if (state === 'selected') {
      if (lastPos !== null) lines.push({ x1: lastPos.x, y1: lastPos.y, x2: pos.x, y2: pos.y })
      lastPos = pos
    }
  })
  return lines
})

// ── Animation ──────────────────────────────────────────────────────────────
const clearTimer = () => {
  if (animTimer.value !== null) {
    clearTimeout(animTimer.value)
    animTimer.value = null
  }
}

const startNthAnim = () => {
  clearTimer()
  const gen = ++animGeneration
  nthStates.value = Array(DEMO_ITEMS.length).fill('idle')
  nthStatus.value = 'Scanning sequence…'
  nthSelectedCount.value = 0
  let i = 0

  const step = () => {
    if (gen !== animGeneration) return
    if (i >= DEMO_ITEMS.length) {
      nthStatus.value = `Done — ${nthSelectedCount.value} of ${DEMO_ITEMS.length} images selected`
      animTimer.value = setTimeout(startNthAnim, 2200)
      return
    }
    const selected = NTH_RESULT[i] ?? false
    nthStates.value[i] = selected ? 'selected' : 'skipped'
    if (selected) {
      nthSelectedCount.value++
      nthStatus.value = `Image ${i + 1} — selected ✓`
    } else {
      nthStatus.value = `Image ${i + 1} — skipped`
    }
    i++
    animTimer.value = setTimeout(step, 500)
  }
  animTimer.value = setTimeout(step, 500)
}

const startTimeAnim = () => {
  clearTimer()
  const gen = ++animGeneration
  timeStates.value = Array(TIME_ITEMS.length).fill('idle')
  timeStatus.value = 'Scanning timeline…'
  timeSelectedCount.value = 0
  let lastSelectedMs = -Infinity
  let i = 0

  const step = () => {
    if (gen !== animGeneration) return
    const item = TIME_ITEMS[i]
    if (item === undefined) {
      timeStatus.value = `Done — ${timeSelectedCount.value} of ${TIME_ITEMS.length} images selected`
      animTimer.value = setTimeout(startTimeAnim, 2200)
      return
    }
    const selected = TIME_RESULT[i] ?? false
    timeStates.value[i] = selected ? 'selected' : 'skipped'
    const ms = item.capturedAt.getTime()
    if (selected) {
      const gap = i === 0 ? 0 : ms - lastSelectedMs
      timeSelectedCount.value++
      timeStatus.value =
        i === 0 ? 'Image 1 — selected ✓' : `Image ${i + 1} — ${gap / 1000}s gap, selected ✓`
      lastSelectedMs = ms
    } else {
      timeStatus.value = `Image ${i + 1} — only ${(ms - lastSelectedMs) / 1000}s gap, skipped`
    }
    i++
    animTimer.value = setTimeout(step, 500)
  }
  animTimer.value = setTimeout(step, 500)
}

const startDistAnim = () => {
  clearTimer()
  const gen = ++animGeneration
  traversalStates.value = Array(DEMO_ITEMS.length).fill('idle')
  straightStates.value = Array(DEMO_ITEMS.length).fill('idle')
  distSelectedCount.value = { traversal: 0, straight: 0 }
  distStatus.value = 'Traversal: walking the path…'
  let i = 0

  const stepTraversal = () => {
    if (gen !== animGeneration) return
    if (i >= DEMO_ITEMS.length) {
      distStatus.value = `Traversal done — ${distSelectedCount.value.traversal} selected. Now straight-line…`
      i = 0
      animTimer.value = setTimeout(stepStraight, 700)
      return
    }
    const trav = TRAVERSAL_RESULT[i] ?? false
    traversalStates.value[i] = trav ? 'selected' : 'skipped'
    if (trav) distSelectedCount.value.traversal++
    distStatus.value = `Traversal: image ${i + 1} — ${trav ? 'selected ✓' : 'skipped'}`
    i++
    animTimer.value = setTimeout(stepTraversal, 500)
  }

  const stepStraight = () => {
    if (gen !== animGeneration) return
    if (i >= DEMO_ITEMS.length) {
      distStatus.value = `Done — traversal: ${distSelectedCount.value.traversal} · straight-line: ${distSelectedCount.value.straight} selected`
      animTimer.value = setTimeout(startDistAnim, 2200)
      return
    }
    const straight = STRAIGHT_RESULT[i] ?? false
    straightStates.value[i] = straight ? 'selected' : 'skipped'
    if (straight) distSelectedCount.value.straight++
    distStatus.value = `Straight-line: image ${i + 1} — ${straight ? 'selected ✓' : 'skipped'}`
    i++
    animTimer.value = setTimeout(stepStraight, 500)
  }

  animTimer.value = setTimeout(stepTraversal, 500)
}

const startAnim = (tab: string) => {
  if (tab === '0') startNthAnim()
  else if (tab === '1') startTimeAnim()
  else startDistAnim()
}

watch(activeTab, (tab) => startAnim(tab))
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) startAnim(activeTab.value)
    else clearTimer()
  },
)
onUnmounted(clearTimer)

// ── Style helpers ──────────────────────────────────────────────────────────
const dotClass = (state: DotState): string => {
  if (state === 'selected')
    return 'bg-green-500 text-white scale-110 shadow-[0_0_8px_var(--p-green-500)]'
  if (state === 'skipped') return 'bg-red-100 text-red-600'
  return 'bg-surface-200 text-surface-500'
}

const svgFill = (state: DotState): string => {
  if (state === 'selected') return 'var(--p-green-500)'
  if (state === 'skipped') return 'var(--p-red-200)'
  return 'var(--p-surface-200)'
}

const svgStroke = (state: DotState): string => {
  if (state === 'selected') return 'var(--p-green-600)'
  if (state === 'skipped') return 'var(--p-red-300)'
  return 'var(--p-surface-300)'
}
</script>

<template>
  <Dialog
    :visible="modelValue"
    modal
    dismissable-mask
    header="How filters work"
    :style="{
      width: 'var(--container-3xl)',
    }"
    @update:visible="emit('update:modelValue', $event)"
  >
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">Every Nth</Tab>
        <Tab value="1">Time Interval</Tab>
        <Tab value="2">Distance</Tab>
      </TabList>

      <TabPanels>
        <!-- ── Every Nth ──────────────────────────────────────────────── -->
        <TabPanel value="0">
          <p class="text-base text-surface-600 mb-2">
            Select every {{ NTH_N }}rd image from your sequence.
          </p>
          <p class="text-sm text-surface-500 mb-5">
            Useful when you want an evenly-spaced sample regardless of timing or location.
          </p>

          <div class="bg-surface-100 rounded-lg p-5 mb-4">
            <p class="text-sm text-surface-500 text-center mb-4">
              N = {{ NTH_N }} &nbsp;→&nbsp; selecting every {{ NTH_N }}rd image
            </p>
            <div class="flex gap-3 justify-center flex-wrap">
              <div
                v-for="dot in nthDotData"
                :key="dot.num"
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                :class="dotClass(dot.state)"
              >
                {{ dot.num }}
              </div>
            </div>
            <p class="text-sm text-surface-500 text-center mt-4">{{ nthStatus }}</p>
          </div>

          <div class="flex gap-4">
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-green-500 text-3xl font-bold">{{ nthSelectedCount }}</div>
              <div class="text-sm text-surface-500 mt-2">selected</div>
            </div>
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-surface-600 text-3xl font-bold">{{ DEMO_ITEMS.length }}</div>
              <div class="text-sm text-surface-500 mt-2">total images</div>
            </div>
          </div>
        </TabPanel>

        <!-- ── Time Interval ─────────────────────────────────────────── -->
        <TabPanel value="1">
          <p class="text-base text-surface-600 mb-2">
            Select images at least {{ TIME_MIN_MS / 1000 }} seconds apart.
          </p>
          <p class="text-sm text-surface-500 mb-5">
            Only the first image within each time window is kept.
          </p>

          <div class="bg-surface-100 rounded-lg p-5 mb-4">
            <p class="text-sm text-surface-500 text-center mb-5">
              Min interval = {{ TIME_MIN_MS / 1000 }}s &nbsp;→&nbsp; skip images within
              {{ TIME_MIN_MS / 1000 }}s of previously selected image
            </p>

            <div class="relative mx-2 h-32">
              <div class="absolute top-9 left-0 right-0 h-px bg-surface-300" />
              <div
                v-for="dot in timeDotData"
                :key="dot.num"
                class="absolute flex flex-col items-center gap-1"
                :style="{ left: `${dot.x}%`, transform: 'translateX(-50%)' }"
              >
                <template v-if="dot.isTop">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                    :class="dotClass(dot.state)"
                  >
                    {{ dot.num }}
                  </div>
                  <div class="w-px h-4 bg-surface-300" />
                  <div class="text-sm text-surface-500">{{ dot.label }}</div>
                </template>
                <template v-else>
                  <div class="text-sm text-surface-500 mt-9">
                    {{ dot.label }}
                  </div>
                  <div class="w-px h-4 bg-surface-300" />
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                    :class="dotClass(dot.state)"
                  >
                    {{ dot.num }}
                  </div>
                </template>
              </div>
            </div>

            <p class="text-sm text-surface-500 text-center mt-4">{{ timeStatus }}</p>
          </div>

          <div class="flex gap-4">
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-green-500 text-3xl font-bold">{{ timeSelectedCount }}</div>
              <div class="text-sm text-surface-500 mt-2">selected</div>
            </div>
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-surface-600 text-3xl font-bold">{{ TIME_ITEMS.length }}</div>
              <div class="text-sm text-surface-500 mt-2">total images</div>
            </div>
          </div>
        </TabPanel>

        <!-- ── Distance ──────────────────────────────────────────────── -->
        <TabPanel value="2">
          <p class="text-base text-surface-600 mb-2">
            Select images at least {{ DIST_MIN_METERS }} meters apart.
          </p>
          <p class="text-sm text-surface-500 mb-5">
            <strong>Traversal</strong>
            measures along the captured path;
            <strong>straight-line</strong>
            uses direct distance between images.
          </p>

          <div class="flex gap-4 mb-4">
            <!-- Traversal panel -->
            <div class="flex-1 bg-surface-100 rounded-lg p-4">
              <p class="text-sm text-surface-500 font-semibold text-center mb-3">Traversal</p>
              <svg
                width="100%"
                viewBox="0 0 330 75"
                class="overflow-visible"
              >
                <path
                  :d="SVG_PATH"
                  :style="{ stroke: 'var(--p-surface-300)' }"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  :d="SVG_PATH"
                  :style="{ stroke: 'var(--p-green-500)' }"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  opacity="0.25"
                />
                <circle
                  v-for="dot in traversalDotData"
                  :key="`${dot.x}-${dot.y}`"
                  :cx="dot.x"
                  :cy="dot.y"
                  :r="dot.state === 'selected' ? 10 : 8"
                  :style="{ fill: svgFill(dot.state), stroke: svgStroke(dot.state) }"
                  stroke-width="1.5"
                  class="transition-all duration-300"
                />
              </svg>
              <p class="text-sm text-surface-500 text-center mt-2">distance along the road</p>
            </div>

            <!-- Straight-line panel -->
            <div class="flex-1 bg-surface-100 rounded-lg p-4">
              <p class="text-sm text-surface-500 font-semibold text-center mb-3">Straight-line</p>
              <svg
                width="100%"
                viewBox="0 0 330 75"
                class="overflow-visible"
              >
                <path
                  :d="SVG_PATH"
                  :style="{ stroke: 'var(--p-surface-300)' }"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                />
                <line
                  v-for="(conn, i) in straightLineConnections"
                  :key="i"
                  :x1="conn.x1"
                  :y1="conn.y1"
                  :x2="conn.x2"
                  :y2="conn.y2"
                  :style="{ stroke: 'var(--p-green-500)' }"
                  stroke-width="1.5"
                  stroke-dasharray="4 3"
                  opacity="0.7"
                />
                <circle
                  v-for="dot in straightDotData"
                  :key="`${dot.x}-${dot.y}`"
                  :cx="dot.x"
                  :cy="dot.y"
                  :r="dot.state === 'selected' ? 10 : 8"
                  :style="{ fill: svgFill(dot.state), stroke: svgStroke(dot.state) }"
                  stroke-width="1.5"
                  class="transition-all duration-300"
                />
              </svg>
              <p class="text-sm text-surface-500 text-center mt-2">
                direct distance between images
              </p>
            </div>
          </div>

          <div class="bg-surface-100 rounded p-3 mb-4">
            <p class="text-sm text-surface-500 text-center">{{ distStatus }}</p>
          </div>

          <div class="flex gap-4">
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-green-500 text-3xl font-bold">{{ distSelectedCount.traversal }}</div>
              <div class="text-sm text-surface-500 mt-2">traversal selected</div>
            </div>
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-green-500 text-3xl font-bold">{{ distSelectedCount.straight }}</div>
              <div class="text-sm text-surface-500 mt-2">straight-line selected</div>
            </div>
            <div class="flex-1 bg-surface-100 rounded p-4 text-center">
              <div class="text-surface-600 text-3xl font-bold">{{ DEMO_ITEMS.length }}</div>
              <div class="text-sm text-surface-500 mt-2">total images</div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>
</template>
