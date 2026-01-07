<script setup lang="ts">
const {
  error,
  highlightedTemplate,
  isDirty,
  previewItems,
  template,
  applyTemplate,
  getVariableToken,
  insertVariable,
  onDragStart,
} = useTitleTemplate()

onMounted(async () => {
  applyTemplate()
})
</script>

<template>
  <Card class="border-l-4 border-indigo-500">
    <template #title>
      <div class="flex justify-between items-center">
        <span>Title Template</span>
        <Button
          :label="isDirty ? 'Apply' : 'Applied'"
          size="small"
          :disabled="!!error || !isDirty"
          @click="applyTemplate"
        />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-3 mt-2">
        <div class="relative grid w-full">
          <div
            class="col-start-1 row-start-1 p-3 text-md leading-snug font-mono whitespace-pre-wrap break-words border border-transparent pointer-events-none text-gray-900"
            aria-hidden="true"
            v-html="highlightedTemplate"
          ></div>
          <Textarea
            v-model="template"
            :invalid="!!error"
            rows="1"
            auto-resize
            fluid
            class="col-start-1 row-start-1 !bg-transparent !text-transparent caret-gray-900 !p-3 !text-md !leading-snug !font-mono shadow-none"
          />
        </div>
        <small
          v-if="error"
          class="text-red-500"
        >
          {{ error }}
        </small>
        <div
          v-if="previewItems.length > 0"
          class="flex flex-col gap-2 p-3 bg-blue-50 rounded border border-gray-200"
        >
          <span class="text-md font-medium text-gray-600">Preview</span>
          <div
            v-for="item in previewItems"
            :key="item.id"
            class="text-sm flex flex-wrap gap-2"
          >
            <span class="font-thin text-gray-900">#{{ item.index }}</span>
            <span class="text-gray-900">{{ item.title || '(empty)' }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <SimpleMessage
            class="w-fit"
            severity="info"
            variant="simple"
            size="small"
            icon="pi pi-info-circle"
          >
            Available variables (drag to add)
          </SimpleMessage>
          <div class="flex flex-col gap-4">
            <div
              v-for="(fields, group) in AVAILABLE_IMAGE_FIELDS"
              :key="group"
              class="flex flex-col gap-1 p-1 rounded odd:bg-gray-50"
            >
              <span class="text-sm font-bold uppercase text-gray-700 pl-2">{{ group }}</span>
              <div class="flex flex-wrap gap-3">
                <div
                  v-tooltip.top="field.description"
                  class="flex flex-col items-start gap-1 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing"
                  v-for="(field, key) in fields"
                  :key="key"
                  draggable="true"
                  @dragstart="onDragStart($event, field.path)"
                  @click="insertVariable(field.path)"
                >
                  <Tag
                    :value="field.name"
                    severity="secondary"
                    size="small"
                  />
                  <span class="text-sm p-1">{{ getVariableToken(field.path) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
