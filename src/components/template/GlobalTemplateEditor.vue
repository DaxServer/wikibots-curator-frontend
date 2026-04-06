<script setup lang="ts">
const store = useCollectionsStore()

const {
  internalDescription,
  internalCategories,
  descriptionHighlighted,
  categoriesHighlighted,
  previewItems,
  titleStatus,
  descriptionStatus,
  categoriesStatus,
  missingCategories,
  titleTemplate,
} = useTemplateEditor()

const { error: titleError, highlightedTemplate, template } = titleTemplate

onMounted(() => {
  titleTemplate.applyTemplate()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <span class="font-semibold text-lg">Templates</span>
    </div>

    <div class="flex flex-row gap-6">
      <!-- Left column: field cards -->
      <div class="flex-3 flex flex-col gap-4 min-w-0">
        <!-- Title field -->
        <Card class="border-l-4 border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-300">
          <template #title>
            <div class="flex justify-between items-center">
              <span>Title</span>
              <span
                v-if="titleStatus"
                class="text-xs font-normal"
                :class="titleStatus === 'applied' ? 'text-green-600' : 'text-gray-400'"
              >
                {{ titleStatus === 'applied' ? '✓ Applied' : 'Applying...' }}
              </span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-2 mt-1">
              <div class="relative grid w-full">
                <div
                  class="col-start-1 row-start-1 p-3 text-md leading-snug font-mono whitespace-pre-wrap break-words border border-transparent pointer-events-none text-gray-900"
                  aria-hidden="true"
                  v-html="highlightedTemplate"
                />
                <Textarea
                  v-model="template"
                  :invalid="!!titleError"
                  rows="1"
                  auto-resize
                  fluid
                  class="col-start-1 row-start-1 !bg-transparent !text-transparent caret-gray-900 !p-3 !text-md !leading-snug !font-mono shadow-none"
                />
              </div>
              <small
                v-if="titleError"
                class="text-red-500"
              >
                {{ titleError }}
              </small>
            </div>
          </template>
        </Card>

        <!-- Description field -->
        <Card class="border-l-4 border-green-500 focus-within:ring-2 focus-within:ring-green-300">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span>Description</span>
                <Select
                  :model-value="store.globalLanguage"
                  :options="[
                    { label: 'English', value: 'en' },
                    { label: 'Deutsch', value: 'de' },
                  ]"
                  option-label="label"
                  option-value="value"
                  size="small"
                  @update:model-value="(v: string) => (store.globalLanguage = v)"
                />
              </div>
              <span
                v-if="descriptionStatus"
                class="text-xs font-normal"
                :class="descriptionStatus === 'applied' ? 'text-green-600' : 'text-gray-400'"
              >
                {{ descriptionStatus === 'applied' ? '✓ Applied' : 'Applying...' }}
              </span>
            </div>
          </template>
          <template #content>
            <div class="relative grid w-full mt-1">
              <div
                class="col-start-1 row-start-1 p-3 text-md leading-snug font-mono whitespace-pre-wrap break-words border border-transparent pointer-events-none text-gray-900"
                aria-hidden="true"
                v-html="descriptionHighlighted"
              />
              <Textarea
                v-model="internalDescription"
                rows="2"
                auto-resize
                fluid
                class="col-start-1 row-start-1 !bg-transparent !text-transparent caret-gray-900 !p-3 !text-md !leading-snug !font-mono shadow-none"
              />
            </div>
          </template>
        </Card>

        <!-- Categories field -->
        <Card class="border-l-4 border-amber-500 focus-within:ring-2 focus-within:ring-amber-300">
          <template #title>
            <div class="flex justify-between items-center">
              <span>Categories</span>
              <span
                v-if="categoriesStatus"
                class="text-xs font-normal"
                :class="categoriesStatus === 'applied' ? 'text-green-600' : 'text-gray-400'"
              >
                {{ categoriesStatus === 'applied' ? '✓ Applied' : 'Applying...' }}
              </span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4 mt-1">
              <div class="relative grid w-full">
                <div
                  class="col-start-1 row-start-1 p-3 text-md leading-snug font-mono whitespace-pre-wrap break-words border border-transparent pointer-events-none text-gray-900"
                  aria-hidden="true"
                  v-html="categoriesHighlighted"
                />
                <Textarea
                  v-model="internalCategories"
                  rows="3"
                  auto-resize
                  fluid
                  class="col-start-1 row-start-1 !bg-transparent !text-transparent caret-gray-900 !p-3 !text-md !leading-snug !font-mono shadow-none"
                />
              </div>
              <CategoryValidationMessages
                :missing-categories="missingCategories"
                show-auto-added
              />
            </div>
          </template>
        </Card>

        <!-- Others -->
        <Card class="border-l-4 border-blue-500">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-info-circle text-blue-600" />
              <span>Others</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-wrap gap-4 mt-2 items-end">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium text-gray-600">License</label>
                <InputText
                  :value="store.globalLicense"
                  size="small"
                  placeholder="e.g. {{cc-by-sa-4.0}}"
                  @input="
                    (e: Event) => (store.globalLicense = (e.target as HTMLInputElement).value)
                  "
                />
              </div>
            </div>
            <DateCategorySetting class="mt-4" />
          </template>
        </Card>

        <!-- Preview -->
        <div
          v-if="previewItems.length > 0"
          class="flex flex-col gap-2 p-3 bg-blue-50 rounded border border-gray-200"
        >
          <span class="text-md font-medium text-gray-600">Preview</span>
          <div
            v-for="(item, idx) in previewItems"
            :key="item.id"
            class="flex flex-col gap-1 text-sm"
            :class="{ 'opacity-60': idx > 0 }"
          >
            <span class="font-thin text-gray-500">#{{ item.index }}</span>
            <span class="text-gray-900 font-mono break-words">{{ item.title || '(empty)' }}</span>
            <span
              v-if="item.description"
              class="text-gray-700 font-mono break-words"
            >
              {{ item.description }}
            </span>
            <span
              v-if="item.categories"
              class="text-gray-600 font-mono break-words text-xs"
            >
              {{ item.categories }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right column: chip bank -->
      <TemplateVariableBank />
    </div>
  </div>
</template>
