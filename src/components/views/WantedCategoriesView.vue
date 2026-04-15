<script setup lang="ts">
const { wantedCategories, loading, total, fetchWantedCategories } = useWantedCategories()
const { getStatus, createCategory, getCategoryText } = useCreateCategory()
const { reconcile, reconcileResults, selectedQids, toggleSelect, isReconciling } = useReconcile()

const filterText = ref('')
const offset = ref(0)

const displayCategories = computed(() =>
  wantedCategories.value.map((c) => ({ ...c, status: getStatus(c.title) })),
)

const skeletonRows = Array<WantedCategoryItem>(10).fill({} as WantedCategoryItem)

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
        @click="fetchWantedCategories(0, filterText || undefined)"
      />
    </div>
  </div>

  <InputText
    v-model="filterText"
    placeholder="Filter..."
    class="w-full mb-3 max-w-7xl mx-auto block"
  />

  <DataView
    :value="loading && wantedCategories.length === 0 ? skeletonRows : displayCategories"
    data-key="title"
    layout="list"
    paginator
    paginator-position="both"
    paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
    current-page-report-template="Page {currentPage} of {totalPages}"
    :page-link-size="10"
    always-show-paginator
    lazy
    :rows="100"
    :total-records="total"
    :first="offset"
    class="max-w-7xl mx-auto"
    @page="onPageChange"
  >
    <template #empty>
      <span class="py-4 text-center text-surface-500 block">No wanted categories found.</span>
    </template>

    <template #list="slotProps">
      <div class="flex flex-col">
        <div
          v-for="(cat, index) in slotProps.items"
          :key="index"
          class="flex flex-col py-2 px-3 rounded odd:bg-surface-50 hover:bg-surface-100"
        >
          <template v-if="loading && wantedCategories.length === 0">
            <Skeleton />
          </template>
          <template v-else>
            <div class="flex items-center justify-between">
              <span class="text-xs text-surface-400 w-10">
                {{ offset + Number(index) + 1 }}
              </span>
              <span class="flex items-center gap-2 flex-wrap flex-1">
                <ExternalLink
                  :href="`https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(cat.title)}`"
                  :show-icon="false"
                  class="hover:underline"
                >
                  {{ cat.title.replaceAll('_', ' ') }}
                </ExternalLink>

                <template v-if="cat.status.type === 'idle'">
                  <Button
                    label="Create"
                    size="small"
                    severity="secondary"
                    text
                    class="create-btn"
                    @click="createCategory(cat.title, getCategoryText(cat.title))"
                  />
                  <Button
                    label="Create WI"
                    size="small"
                    :severity="selectedQids[cat.title] ? 'primary' : 'secondary'"
                    text
                    class="create-btn"
                    @click="createCategory(cat.title, '{{WI}}', selectedQids[cat.title])"
                  />
                </template>

                <span
                  v-if="cat.status.type === 'deleted'"
                  class="text-xs text-red-900 cursor-help"
                  title="This category was previously deleted"
                >
                  Deleted
                </span>

                <span
                  v-else-if="cat.status.type === 'creating'"
                  class="text-xs cursor-wait"
                >
                  Creating...
                </span>

                <template v-else-if="cat.status.type === 'created'">
                  <span class="text-xs text-green-600">
                    <ExternalLink
                      :href="`https://commons.wikimedia.org/wiki/${encodeURIComponent(cat.status.createdTitle)}`"
                      class="hover:underline"
                      :icon-size="10"
                    >
                      {{ cat.status.createdTitle.replaceAll('_', ' ') }}
                    </ExternalLink>
                  </span>
                </template>

                <span
                  v-else-if="cat.status.type === 'error'"
                  class="text-xs text-red-500"
                >
                  {{ cat.status.message }}
                </span>
              </span>

              <span class="flex gap-3 text-xs text-surface-500 ml-4">
                <span title="Subcategories">{{ cat.subcats }}c</span>
                <span title="Files">{{ cat.files }}f</span>
                <span title="Pages">{{ cat.pages }}p</span>
                <span
                  title="Total"
                  class="font-medium text-surface-700"
                >
                  {{ cat.total }}
                </span>
              </span>
            </div>

            <!-- Reconcile candidate panel -->
            <div
              v-if="reconcileResults[cat.title]"
              class="mt-2 ml-10 border-l-2 border-indigo-200 pl-3"
            >
              <div class="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                Wikidata Matches
              </div>
              <div
                v-if="reconcileResults[cat.title]?.length === 0"
                class="text-xs text-surface-400"
              >
                No Wikidata matches found
              </div>
              <div
                v-for="candidate in reconcileResults[cat.title]"
                :key="candidate.id"
                :class="[
                  'flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-xs hover:bg-indigo-50',
                  selectedQids[cat.title] === candidate.id
                    ? 'bg-indigo-50 border border-indigo-300'
                    : '',
                ]"
                @click="toggleSelect(cat.title, candidate.id)"
              >
                <span
                  :class="[
                    'w-3 h-3 rounded-full border-2 flex-shrink-0',
                    selectedQids[cat.title] === candidate.id
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-surface-400',
                  ]"
                />
                <span class="font-mono text-indigo-600">{{ candidate.id }}</span>
                <span class="font-medium">{{ candidate.name }}</span>
                <span class="text-surface-400 truncate">{{ candidate.description }}</span>
                <span class="text-surface-300 ml-auto flex-shrink-0">{{ candidate.score }}%</span>
                <a
                  :href="`https://www.wikidata.org/wiki/${candidate.id}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-indigo-400 hover:text-indigo-600 flex-shrink-0"
                  @click.stop
                >
                  Wikidata ↗
                </a>
              </div>
            </div>
          </template>
        </div>
      </div>
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
