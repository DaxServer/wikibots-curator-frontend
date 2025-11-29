<script setup lang="ts">
defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { verifyTitles } = useCommons()

const showErrorsOnly = ref(false)

const displayedItems = computed(() => {
  if (showErrorsOnly.value) {
    return store.selectedItems.filter((i) => i.meta.titleStatus === 'taken')
  }
  return store.selectedItems
})

const disablePreview = computed(() => {
  if (store.selectedCount === 0) return true
  for (const item of store.selectedItems) {
    if (item.meta.selected && item.meta.titleStatus === 'taken') return true
  }
  return false
})

onMounted(async () => {
  const itemsToCheck = store.selectedItems.map((item) => ({
    id: item.id,
    title: item.meta.title,
  }))
  void verifyTitles(itemsToCheck)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="bg-gray-100">
      <template #content>
        <ItemInputs
          :language="store.globalLanguage"
          :description="store.globalDescription"
          :categories="store.globalCategories"
          @update:language="(v: string) => (store.globalLanguage = v)"
          @update:description="(v: string) => (store.globalDescription = v)"
          @update:categories="(v: string) => (store.globalCategories = v)"
        >
          <template #description-help>
            <div class="inline-flex flex-none">
              <Message
                severity="info"
                icon="pi pi-info-circle"
              >
                Will be applied to all selected images
                <span class="underline">only as a fallback</span>
                .
              </Message>
            </div>
          </template>
        </ItemInputs>
      </template>
    </Card>

    <div class="flex justify-between items-center">
      <Message
        severity="info"
        icon="pi pi-info-circle"
      >
        Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
      </Message>
      <div class="flex items-center gap-2">
        <div
          v-if="store.itemsWithErrors > 0"
          class="flex items-center gap-2 mr-2"
        >
          <Checkbox
            v-model="showErrorsOnly"
            binary
            inputId="showErrors"
          />
          <label
            for="showErrors"
            class="cursor-pointer"
          >
            Show items with errors
          </label>
        </div>
        <Message
          v-if="store.itemsWithErrors > 0"
          severity="error"
          icon="pi pi-exclamation-triangle"
        >
          {{ store.itemsWithErrors }} item{{ store.itemsWithErrors > 1 ? 's' : '' }} with errors
        </Message>
        <Button
          icon="pi pi-eye"
          icon-pos="left"
          label="Preview edits"
          :severity="disablePreview ? 'secondary' : 'primary'"
          :disabled="disablePreview"
          @click="store.stepper = '4'"
        />
      </div>
    </div>

    <div>
      <EditItem
        v-for="item in displayedItems"
        :key="item.id"
        class="flex flex-col p-4 py-8 border-l-4"
        :class="{
          'border-green-600': item.meta.titleStatus === 'available',
          'border-red-500': item.meta.titleStatus === 'taken',
          'border-gray-200': item.meta.titleStatus === undefined,
          'border-yellow-500':
            item.meta.titleStatus === 'unknown' ||
            (item.image.existing.length > 0 && item.meta.titleStatus === 'available'),
        }"
        :item="item"
        :altPrefix="altPrefix"
      />
    </div>
  </div>
</template>
