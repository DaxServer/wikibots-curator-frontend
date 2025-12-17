<script setup lang="ts">
defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { wikitext, submitUpload, loadSDC } = useCollections()

onMounted(() => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  })
  loadSDC()
})

const rowsPerPageOptions = computed(() => {
  const total = store.selectedItems.length
  const options = [10, 25, 50, 100]
  if (total > 0 && !options.includes(total)) {
    options.push(total)
  }
  return options.sort((a, b) => a - b)
})
</script>

<template>
  <Card class="bg-gray-100">
    <template #content>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="text-xl font-bold">Preview</div>
          <span class="text-sm text-gray-500">
            displaying {{ store.selectedCount }} items to upload
          </span>
        </div>
        <Button
          severity="primary"
          :disabled="store.selectedCount === 0"
          @click="submitUpload"
        >
          <i class="pi pi-cloud-upload mr-2"></i>
          Upload
        </Button>
      </div>
    </template>
  </Card>

  <Message
    severity="info"
    icon="pi pi-info-circle"
  >
    The
    <span
      v-pre
      class="text-primary"
    >
      {{ Information }}
    </span>
    template will be populated from SDC
  </Message>

  <DataTable
    :value="store.selectedItems"
    paginator
    paginator-position="both"
    paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
    current-page-report-template="Page {currentPage} of {totalPages}"
    :rows="10"
    :rowsPerPageOptions="rowsPerPageOptions"
    data-key="id"
  >
    <Column
      field="index"
      header="#"
    />

    <Column
      field="image"
      header="Image"
    >
      <template #body="{ data }">
        <Image
          :src="data.image.preview_url"
          :alt="`${altPrefix} ${data.id}`"
        />
      </template>
    </Column>

    <Column
      field="metadata"
      header="Metadata"
    >
      <template #body="{ data }">
        <div class="flex flex-col gap-3">
          <div class="text-base font-bold">File:{{ data.meta.title }}</div>
          <pre
            class="text-xs bg-gray-100 p-2 rounded"
            style="font-family: monospace"
            >{{ wikitext(data).trim() }}</pre
          >
          <div>
            <div class="text-base font-bold">Labels</div>
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="border-b">
                  <th class="text-left p-2">Language</th>
                  <th class="text-left p-2">Label</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="p-2">
                    {{ data.meta.description.language.trim() || store.globalLanguage.trim() }}
                  </td>
                  <td class="p-2">
                    {{ data.meta.description.value.trim() || store.globalDescription.trim() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div class="text-base font-bold">SDC</div>
            <StatementsList
              :key="data.id"
              :statements="data.sdc"
            />
          </div>
        </div>
      </template>
    </Column>
  </DataTable>
</template>
