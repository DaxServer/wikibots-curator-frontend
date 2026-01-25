<script setup lang="ts">
const {
  error,
  highlightedTemplate,
  isDirty,
  anyItemsMissingCameraFields,
  itemsMissingCameraFields,
  previewItems,
  template,
  usedCameraFields,
  applyTemplate,
  getVariableToken,
  insertVariable,
  onDragStart,
} = useTitleTemplate()

const missingCameraFields = computed(() => {
  const missing = new Set<string>()
  itemsMissingCameraFields.value.forEach((item) => {
    if (!item.image.camera.make) missing.add('camera.make')
    if (!item.image.camera.model) missing.add('camera.model')
  })
  return missing
})

const isCameraField = (fieldPath: string): boolean => {
  return (CAMERA_FIELD_PATHS as readonly string[]).includes(fieldPath)
}

const isCameraFieldUsedAndMissing = (fieldPath: string): boolean => {
  return (
    isCameraField(fieldPath) &&
    (usedCameraFields.value as readonly string[]).includes(fieldPath) &&
    missingCameraFields.value.has(fieldPath)
  )
}

const getCameraFieldTooltip = (field: { description: string; path: string }) => {
  if (anyItemsMissingCameraFields.value) {
    return {
      value: `${field.description} - some items are missing this field`,
      severity: 'warn',
    }
  }
  return { value: field.description }
}

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
                  v-tooltip.top="getCameraFieldTooltip(field)"
                  class="flex flex-col items-start gap-1 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing"
                  v-for="(field, key) in fields"
                  :key="key"
                  :class="{
                    'border-yellow-400 bg-yellow-50': isCameraFieldUsedAndMissing(field.path),
                  }"
                  draggable="true"
                  @dragstart="onDragStart($event, field.path)"
                  @click="insertVariable(field.path)"
                >
                  <div class="container flex justify-between items-center">
                    <Tag
                      :value="field.name"
                      :severity="isCameraFieldUsedAndMissing(field.path) ? 'warn' : 'secondary'"
                      size="small"
                    />
                    <i
                      v-if="isCameraField(field.path)"
                      class="pi pi-exclamation-triangle text-xs mr-1"
                      :class="{
                        'text-yellow-600': isCameraFieldUsedAndMissing(field.path),
                        'text-gray-400': !isCameraFieldUsedAndMissing(field.path),
                      }"
                    />
                  </div>
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
