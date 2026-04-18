<script setup lang="ts">
const { wantedCategories, loading, total, fetchWantedCategories } = useWantedCategories()
const { getStatus, createCategory, getCategoryText } = useCreateCategory()
const { reconcile, reconcileResults, selectedQids, toggleSelect, isReconciling } = useReconcile()

const filterText = ref('')
const offset = ref(0)

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
      <TransitionGroup
        tag="div"
        leave-active-class="transition-opacity duration-500 ease-in"
        leave-to-class="opacity-0"
        class="flex flex-col"
      >
        <div
          v-for="(cat, index) in slotProps.items"
          :key="cat.title"
          class="flex flex-col py-3 px-4 rounded odd:bg-surface-50 hover:bg-surface-100"
        >
          <template v-if="loading && wantedCategories.length === 0">
            <Skeleton />
          </template>
          <template v-else>
            <div class="flex items-center justify-between">
              <span class="text-sm text-surface-400 w-10">
                {{ offset + Number(index) + 1 }}
              </span>
              <span class="flex items-center gap-2 flex-wrap flex-1">
                <ExternalLink
                  :href="`https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(cat.title)}`"
                  :show-icon="false"
                  class="text-md font-medium hover:underline py-(--p-button-sm-padding-y)"
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
                  class="text-sm text-red-900 cursor-help"
                  title="This category was previously deleted"
                >
                  Deleted
                </span>

                <span
                  v-else-if="cat.status.type === 'creating'"
                  class="text-sm cursor-wait"
                >
                  Creating...
                </span>

                <template v-else-if="cat.status.type === 'created'">
                  <span class="text-sm text-green-600">
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
                  class="text-sm text-red-500"
                >
                  {{ cat.status.message }}
                </span>
              </span>

              <span class="flex gap-3 text-sm text-surface-500 ml-4">
                <span title="Subcategories">{{ cat.subcats }}c</span>
                <span title="Files">{{ cat.files }}f</span>
                <span title="Pages">{{ cat.pages }}p</span>
                <span
                  title="Total"
                  class="text-md font-medium text-surface-700"
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
              <div
                v-if="reconcileResults[cat.title]?.length === 0"
                class="text-sm text-surface-400"
              >
                No Wikidata matches found
              </div>
              <div
                v-for="candidate in reconcileResults[cat.title]"
                :key="candidate.id"
                :class="[
                  'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm border hover:bg-sky-50 hover:border-sky-300 hover:border',
                  selectedQids[cat.title] === candidate.id
                    ? 'bg-sky-50 border-sky-300'
                    : 'border-transparent',
                ]"
                @click="toggleSelect(cat.title, candidate.id)"
              >
                <span
                  :class="[
                    'w-3 h-3 rounded-full border-2 flex-shrink-0',
                    selectedQids[cat.title] === candidate.id
                      ? 'border-sky-500 bg-sky-500'
                      : 'border-surface-400',
                  ]"
                />
                <ExternalLink
                  :href="`https://www.wikidata.org/wiki/${candidate.id}`"
                  :show-icon="false"
                  class="font-mono text-sky-800 hover:underline flex-shrink-0"
                  @click.stop
                >
                  {{ candidate.id }}
                </ExternalLink>
                <span class="font-medium">{{ candidate.name }}</span>
                <span class="text-surface-500 truncate">{{ candidate.description }}</span>
                <span class="text-surface-500 ml-auto flex-shrink-0">{{ candidate.score }}%</span>
                <ExternalLink
                  :href="`https://www.wikidata.org/wiki/${candidate.id}`"
                  class="text-sky-800 hover:underline hover:text-sky-900 flex-shrink-0"
                  @click.stop
                  :show-icon="false"
                >
                  Wikidata ↗
                </ExternalLink>
              </div>
            </div>
          </template>
        </div>
      </TransitionGroup>
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
