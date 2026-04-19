<script setup lang="ts">
const { wantedCategories, loading, total, fetchWantedCategories } = useWantedCategories()
const { getStatus, createCategory, recategorizeFiles, getCategoryText } = useCreateCategory()
const { reconcile, reconcileResults, selectedQids, toggleSelect, isReconciling } = useReconcile()
const { templateMap, checkTemplates } = useYearTemplates()

const filterText = ref('')
const offset = ref(0)
const showOnlyWithTemplate = ref(false)

const withTemplateCount = computed(
  () => wantedCategories.value.filter((c) => templateMap.value[c.title]).length,
)

const displayCategories = computed(() =>
  wantedCategories.value.map((c) => ({ ...c, status: getStatus(c.title) })),
)

const skeletonRows = Array.from(
  { length: 10 },
  (_, i) => ({ title: `skeleton-${i}` }) as WantedCategoryItem,
)

const doFetch = () =>
  fetchWantedCategories(offset.value, filterText.value.replaceAll(' ', '_') || undefined)
const debouncedFetch = debounce(doFetch, 500)

watch(filterText, (text) => {
  offset.value = 0
  if (text === '') {
    debouncedFetch.cancel()
    doFetch()
  } else {
    debouncedFetch()
  }
})

const onPageChange = (event: { first: number }) => {
  offset.value = event.first
  fetchWantedCategories(event.first, filterText.value.replaceAll(' ', '_') || undefined)
}

watch(wantedCategories, (cats) => {
  if (cats.length > 0) checkTemplates(cats.map((c) => c.title))
  selectedTitles.value.clear()
})

const selectedTitles = ref(new Set<string>())

const visibleIdleTitles = computed(() =>
  displayCategories.value
    .filter((c) => c.status.type === 'idle')
    .filter((c) => !showOnlyWithTemplate.value || templateMap.value[c.title])
    .filter((c) => !getFocalLengthRedirect(c.title))
    .map((c) => c.title),
)

const allSelected = computed(
  () =>
    visibleIdleTitles.value.length > 0 &&
    visibleIdleTitles.value.every((t) => selectedTitles.value.has(t)),
)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTitles.value = new Set()
  } else {
    selectedTitles.value = new Set(visibleIdleTitles.value)
  }
}

const createSelected = (useWI = false) => {
  for (const title of selectedTitles.value) {
    if (useWI) {
      createCategory(title, '{{WI}}', selectedQids.value[title])
    } else {
      createCategory(title, templateMap.value[title] ?? getCategoryText(title))
    }
  }
  selectedTitles.value = new Set()
}

onMounted(() => {
  fetchWantedCategories(0)
})
</script>

<template>
  <div class="flex justify-between items-center mb-4 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold">Wanted Categories</h1>
    <div class="flex gap-2 items-center">
      <Button
        label="Reconcile"
        :loading="isReconciling"
        severity="secondary"
        @click="reconcile(wantedCategories)"
      />
      <Button
        label="Refresh"
        :loading="loading"
        @click="fetchWantedCategories(0, filterText.replaceAll(' ', '_') || undefined)"
      />
    </div>
  </div>

  <DataView
    :value="loading && wantedCategories.length === 0 ? skeletonRows : displayCategories"
    data-key="title"
    layout="list"
    paginator
    paginator-position="both"
    paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
    current-page-report-template="Page {currentPage} of {totalPages} ({totalRecords})"
    :page-link-size="10"
    always-show-paginator
    lazy
    :rows="100"
    :total-records="total"
    :first="offset"
    class="max-w-7xl mx-auto"
    @page="onPageChange"
  >
    <template #header>
      <div class="flex flex-col gap-2">
        <div class="flex gap-2">
          <InputText
            v-model="filterText"
            placeholder="Filter..."
            class="flex-1"
          />
          <Button
            :label="`By year template (${withTemplateCount})`"
            :severity="showOnlyWithTemplate ? 'info' : 'secondary'"
            :outlined="!showOnlyWithTemplate"
            @click="showOnlyWithTemplate = !showOnlyWithTemplate"
          />
        </div>
        <div class="flex gap-2 items-center">
          <Button
            :label="allSelected ? 'Deselect All' : 'Select All'"
            size="small"
            severity="secondary"
            outlined
            @click="toggleSelectAll"
          />
          <Button
            label="Create"
            size="small"
            severity="secondary"
            :disabled="selectedTitles.size === 0"
            text
            class="create-btn"
            @click="createSelected()"
          />
          <Button
            label="Create WI"
            size="small"
            severity="secondary"
            :disabled="selectedTitles.size === 0"
            text
            class="create-btn"
            @click="createSelected(true)"
          />
          <span
            v-if="selectedTitles.size > 0"
            class="text-sm text-surface-500"
          >
            {{ selectedTitles.size }} selected
          </span>
        </div>
      </div>
    </template>

    <template #empty>
      <span class="py-4 text-center text-surface-500 block">No wanted categories found.</span>
    </template>

    <template #list="slotProps">
      <WantedCategoryRow
        v-for="(cat, index) in slotProps.items"
        v-show="!showOnlyWithTemplate || templateMap[cat.title]"
        :key="cat.title"
        :cat="cat"
        :index="Number(index)"
        :offset="offset"
        :is-loading="loading && wantedCategories.length === 0"
        :is-selected="selectedTitles.has(cat.title)"
        :template-text="templateMap[cat.title]"
        :selected-qid="selectedQids[cat.title]"
        :reconcile-results="reconcileResults[cat.title]"
        @toggle-select="
          selectedTitles.has(cat.title)
            ? selectedTitles.delete(cat.title)
            : selectedTitles.add(cat.title)
        "
        @create="createCategory(cat.title, templateMap[cat.title] ?? getCategoryText(cat.title))"
        @create-wi="createCategory(cat.title, '{{WI}}', selectedQids[cat.title])"
        @recategorize="recategorizeFiles(cat.title, getFocalLengthRedirect(cat.title)!)"
        @toggle-reconcile="(qid) => toggleSelect(cat.title, qid)"
      />
    </template>
  </DataView>
</template>

<style scoped>
.create-btn:hover {
  background: var(--p-primary-color) !important;
  color: var(--p-primary-contrast-color) !important;
  border-color: var(--p-primary-color) !important;
}
</style>
