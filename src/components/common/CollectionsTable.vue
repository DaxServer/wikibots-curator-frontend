<script setup lang="ts">
defineProps<{
  placeholder: string
  emptyMessage: string
  idLabel: string
  altPrefix: string
}>()

const store = useCollectionsStore()
const { loadCollection } = useCollections()
</script>

<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-4">
    <Stepper
      :value="store.stepper"
      @update:value="store.stepper = $event"
    >
      <StepList>
        <Step value="1">Retrieve</Step>
        <Step value="2">Select</Step>
        <Step value="3">Edit</Step>
        <Step value="4">Preview</Step>
        <Step value="5">Upload</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="1">
          <Form
            @submit="loadCollection"
            class="mt-4 mb-4 flex flex-col gap-4"
            v-focustrap
          >
            <InputText
              autofocus
              v-model="store.input"
              :placeholder="placeholder"
            />
            <Button
              color="primary"
              type="submit"
              :loading="store.isLoading"
              :disabled="!store.input.trim() || store.isLoading"
              :label="store.isLoading ? 'Loading...' : 'Load sequence'"
              class="w-fit"
            />
          </Form>

          <div class="text-center py-48 text-gray-500">
            <i class="pi pi-image mb-4 text-4xl" />
            <p class="text-base">{{ emptyMessage }}</p>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>

    <CollectionsInfoCard
      v-if="store.stepper !== '1' && store.stepper !== '5'"
      :input="store.input"
      :selected-count="store.selectedCount"
      :total-images="store.totalImages"
      :id-label="idLabel"
    />

    <IngestSelectionList
      v-if="store.stepper === '2'"
      :alt-prefix="altPrefix"
    >
      <template #metadata="{ item }">
        <slot
          name="metadata"
          :item="item"
        ></slot>
      </template>
    </IngestSelectionList>

    <CollectionsEdit
      v-if="store.stepper === '3'"
      :alt-prefix="altPrefix"
    />

    <UploadPreview
      v-if="store.stepper === '4'"
      :alt-prefix="altPrefix"
    />

    <UploadStatusTable
      v-if="store.stepper === '5'"
      :items="store.selectedItems"
    />

    <!-- <div
        v-if="store.totalImages === 0 && !store.isLoading"
        class="text-center py-8 text-gray-500"
      >
        <i class="pi pi-image mb-4 text-4xl" />
        <p class="text-base">{{ emptyMessage }}</p>
      </div> -->
  </div>
</template>
