<script setup lang="ts">
type CategoryRow = WantedCategoryItem & { status: CategoryStatus }

const props = defineProps<{
  cat: CategoryRow
  index: number
  offset: number
  isLoading: boolean
  isSelected: boolean
  templateText: string | undefined
  selectedQid: string | undefined
  reconcileResults: ReconCandidate[] | undefined
}>()

const emit = defineEmits<{
  'toggle-select': []
  create: []
  'create-wi': []
  recategorize: []
  'toggle-reconcile': [candidateId: string]
}>()

const focalLengthRedirect = computed(() => getFocalLengthRedirect(props.cat.title))
</script>

<template>
  <div class="flex flex-col py-3 px-4 rounded odd:bg-surface-50 hover:bg-surface-100">
    <template v-if="isLoading">
      <Skeleton />
    </template>
    <template v-else>
      <div class="flex items-center justify-between">
        <Checkbox
          v-if="cat.status.type === 'idle' && !focalLengthRedirect"
          :model-value="isSelected"
          :binary="true"
          class="mr-4"
          @change="emit('toggle-select')"
        />
        <span
          v-else
          class="w-5 mr-4"
        />

        <span class="text-sm text-surface-400 w-10">
          {{ offset + index + 1 }}
        </span>

        <span class="flex items-center gap-2 flex-wrap flex-1">
          <ExternalLink
            :href="`https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(cat.title)}`"
            :show-icon="false"
            class="text-base font-medium hover:underline py-(--p-button-sm-padding-y)"
          >
            {{ cat.title.replaceAll('_', ' ') }}
          </ExternalLink>

          <template v-if="cat.status.type === 'idle'">
            <template v-if="focalLengthRedirect">
              <Tag
                value="recategorize"
                severity="warn"
                class="text-xs"
              />
              <Button
                label="Recategorize"
                size="small"
                severity="warn"
                text
                class="create-btn"
                @click="emit('recategorize')"
              />
            </template>
            <template v-else>
              <Tag
                v-if="templateText"
                value="by year template"
                severity="success"
                class="text-xs"
              />
              <Button
                label="Create"
                size="small"
                severity="secondary"
                text
                class="create-btn"
                @click="emit('create')"
              />
              <Button
                label="Create WI"
                size="small"
                :severity="selectedQid ? 'primary' : 'secondary'"
                text
                class="create-btn"
                @click="emit('create-wi')"
              />
            </template>
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
          <span
            v-else-if="cat.status.type === 'recategorizing'"
            class="text-sm cursor-wait"
          >
            Recategorizing...
          </span>
          <span
            v-else-if="cat.status.type === 'recategorized'"
            class="text-sm text-green-600"
          >
            {{ cat.status.count }} file{{ cat.status.count === 1 ? '' : 's' }} moved to
            {{ focalLengthRedirect }}
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
            class="text-base font-medium text-surface-700"
          >
            {{ cat.total }}
          </span>
        </span>
      </div>

      <ReconcilePanel
        v-if="reconcileResults"
        :results="reconcileResults"
        :selected-qid="selectedQid"
        @toggle-select="(id) => emit('toggle-reconcile', id)"
      />
    </template>
  </div>
</template>

<style scoped>
.create-btn:hover {
  background: var(--p-primary-color) !important;
  color: var(--p-primary-contrast-color) !important;
  border-color: var(--p-primary-color) !important;
}
</style>
