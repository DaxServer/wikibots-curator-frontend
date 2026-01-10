<script lang="ts" setup>
const props = defineProps<{ item: Item; altPrefix: string }>()

const store = useCollectionsStore()
const { getEffectiveTitle, verifyTitles } = useCommons()

const effectiveTitle = computed(() => getEffectiveTitle(props.item))

const isTitleFocused = ref(false)
const titleDraft = ref('')

const displayedTitle = computed(() => {
  if (isTitleFocused.value) return titleDraft.value
  return effectiveTitle.value
})

const onTitleChange = (title?: string) => {
  store.updateItem(props.item.id, 'title', title || '')
  if (!title) {
    store.updateItem(props.item.id, 'titleStatus', TITLE_STATUS.Invalid)
  } else {
    verifyTitles([{ id: props.item.id, title, image: props.item.image }], { debounce: true })
  }
}

const onTitleInput = (title?: string) => {
  titleDraft.value = title ?? ''
  onTitleChange(title)
}

const onTitleFocus = () => {
  isTitleFocused.value = true
  titleDraft.value = effectiveTitle.value
}

const onTitleBlur = () => {
  isTitleFocused.value = false

  if (titleDraft.value.trim()) return

  const titleToVerify = effectiveTitle.value.trim()
  if (!titleToVerify) return

  verifyTitles([{ id: props.item.id, title: titleToVerify, image: props.item.image }], {
    debounce: true,
  })
}
</script>

<template>
  <div>
    <div class="flex items-start gap-4">
      <span class="text-4xl font-medium">{{ item.index }}</span>
      <Checkbox
        binary
        :modelValue="item.meta.selected"
        size="large"
        class="mt-2"
        @update:modelValue="(v: boolean) => store.updateItem(item.id, 'selected', v)"
      />
      <div class="flex-1 flex flex-col gap-1">
        <IconField>
          <InputText
            :modelValue="displayedTitle"
            :invalid="TITLE_ERROR_STATUSES.includes(item.meta.titleStatus as never)"
            @update:modelValue="onTitleInput($event)"
            @focus="onTitleFocus"
            @blur="onTitleBlur"
            fluid
          />
          <InputIcon
            class="pi"
            :class="{
              'text-inherit! pi-spin pi-spinner': item.meta.titleStatus === TITLE_STATUS.Checking,
              'text-green-600! pi-check-circle': item.meta.titleStatus === TITLE_STATUS.Available,
              'text-red-500! pi-times-circle': TITLE_ERROR_STATUSES.includes(
                item.meta.titleStatus as never,
              ),
              'text-yellow-500! pi-exclamation-triangle':
                item.meta.titleStatus === TITLE_STATUS.Unknown,
            }"
          />
        </IconField>
        <SimpleMessage
          v-if="item.meta.titleStatus === TITLE_STATUS.Checking"
          severity="info"
          variant="simple"
          size="small"
          icon="pi pi-spinner pi-spin"
          class="pl-3"
        >
          Checking title availability...
        </SimpleMessage>
        <SimpleMessage
          v-else-if="item.meta.titleStatus === TITLE_STATUS.Taken"
          severity="error"
          variant="simple"
          size="small"
          icon="pi pi-times-circle"
          class="pl-3"
        >
          Title is not possible.
          <ExternalLink
            :href="`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(effectiveTitle)}`"
            class="text-primary"
          >
            Check existing file
          </ExternalLink>
        </SimpleMessage>
        <SimpleMessage
          v-else-if="item.meta.titleStatus === TITLE_STATUS.Invalid"
          severity="error"
          variant="simple"
          size="small"
          icon="pi pi-times-circle"
          class="pl-3"
        >
          Extension is not valid. Valid extensions are: {{ VALID_EXTENSIONS.join(', ') }}
        </SimpleMessage>
        <SimpleMessage
          v-else-if="item.meta.titleStatus === TITLE_STATUS.Blacklisted"
          severity="error"
          variant="simple"
          size="small"
          icon="pi pi-times-circle"
          class="pl-3"
        >
          Title is blacklisted and cannot be used
        </SimpleMessage>
        <SimpleMessage
          v-else-if="item.meta.titleStatus === TITLE_STATUS.Duplicate"
          severity="error"
          variant="simple"
          size="small"
          icon="pi pi-times-circle"
          class="pl-3"
        >
          Title is duplicated within this collection. Each item must have a unique title.
        </SimpleMessage>
        <SimpleMessage
          v-else-if="item.meta.titleStatus === TITLE_STATUS.Unknown"
          severity="warn"
          variant="simple"
          size="small"
          icon="pi pi-exclamation-triangle"
          class="pl-3"
        >
          Unable to verify title availability
        </SimpleMessage>
        <SimpleMessage
          v-else-if="item.meta.titleStatus === TITLE_STATUS.Available"
          severity="success"
          variant="simple"
          size="small"
          icon="pi pi-check-circle"
          class="pl-3"
        >
          Title is available
        </SimpleMessage>
      </div>
    </div>

    <div class="flex gap-4 py-4">
      <Image
        :src="item.image.preview_url"
        :alt="`${altPrefix} ${item.id}`"
        class="max-w-3xl"
      />
      <div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div>
              <span class="text-gray-500">Taken</span>
              <div>
                {{ item.image.dates.taken.toLocaleString() }}
              </div>
            </div>
          </div>
          <div>
            <div>
              <span class="text-gray-500">Coordinates</span>
              <div>
                Lat: {{ item.image.location.latitude }}
                <br />
                Lng: {{ item.image.location.longitude }}
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div>
              <span class="text-gray-500">Compass Angle</span>
              <div>{{ item.image.location.compass_angle }}°</div>
            </div>
          </div>
          <div>
            <div>
              <span class="text-gray-500">Size</span>
              <div>{{ item.image.width }}×{{ item.image.height }}</div>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex flex-col gap-2 text-sm items-start">
            <ExternalLink
              as="button"
              :href="item.image.url_original"
              show-icon
              variant="text"
              color="primary"
              size="small"
              class="self-start pl-0 text-none"
            >
              View image
            </ExternalLink>
            <ExternalLink
              as="button"
              :href="item.image.url"
              show-icon
              variant="text"
              color="primary"
              size="small"
              class="self-start pl-0 text-none"
            >
              View on {{ store.handler.charAt(0).toUpperCase() + store.handler.slice(1) }}
            </ExternalLink>
            <Tag
              v-if="item.image.is_pano"
              severity="info"
              class="self-start"
            >
              Panorama
            </Tag>
          </div>
        </div>
        <div
          v-if="item.image.existing.length"
          class="mb-4"
        >
          <div class="p-1 bg-orange-100">
            <strong>Existing files:</strong>
            <div
              v-for="page in item.image.existing"
              :key="page.url"
            >
              *
              <ExternalLink
                :href="page.url"
                class="text-info hover:underline"
                show-icon
              >
                {{ page.url }}
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ItemInputs
      :language="item.meta.description.language"
      :description="item.meta.description.value"
      :categories="item.meta.categories"
      :license="item.meta.license"
      show-fallback-messages
      @update:language="
        (language: string) =>
          store.updateItem(item.id, 'description', {
            ...item.meta.description,
            language,
          })
      "
      @update:description="
        (value: string) =>
          store.updateItem(item.id, 'description', {
            ...item.meta.description,
            value,
          })
      "
      @update:categories="
        (categories: string) => store.updateItem(item.id, 'categories', categories)
      "
      @update:license="(license: string) => store.updateItem(item.id, 'license', license)"
    />
  </div>
</template>
