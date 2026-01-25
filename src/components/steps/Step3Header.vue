<script setup lang="ts">
const store = useCollectionsStore()
const { itemsMissingCameraFields } = useTitleTemplate()
</script>

<template>
  <div class="flex flex-col gap-6">
    <TitleTemplateEditor />

    <Card class="bg-surface-100 border-l-4 border-blue-500">
      <template #title>Fallbacks</template>
      <template #content>
        <ItemInputs
          class="mt-2"
          :language="store.globalLanguage"
          :description="store.globalDescription"
          :categories="store.globalCategories"
          :license="store.globalLicense"
          @update:language="(v: string) => (store.globalLanguage = v)"
          @update:description="(v: string) => (store.globalDescription = v)"
          @update:categories="(v: string) => (store.globalCategories = v)"
          @update:license="(v: string) => (store.globalLicense = v)"
        >
          <template #description-help>
            <div class="flex flex-col gap-4">
              <div class="inline-flex flex-none">
                <SimpleMessage
                  severity="info"
                  variant="simple"
                  size="small"
                  icon="pi pi-info-circle"
                >
                  Will be applied to all selected images
                  <span class="underline">only as a fallback</span>
                </SimpleMessage>
              </div>
            </div>
          </template>
        </ItemInputs>
        <DateCategorySetting class="mt-4" />
      </template>
    </Card>

    <SdcWarningMessage v-if="store.itemsWithExistingTitlesCount > 0" />

    <Message
      v-if="itemsMissingCameraFields.length > 0"
      severity="warn"
      icon="pi pi-exclamation-triangle"
    >
      {{ itemsMissingCameraFields.length }} item{{ itemsMissingCameraFields.length > 1 ? 's' : '' }}
      missing camera fields used in template
    </Message>
  </div>
</template>
