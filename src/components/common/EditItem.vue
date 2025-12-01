<script lang="ts" setup>
const props = defineProps<{ item: Item; altPrefix: string }>()

const store = useCollectionsStore()
const { verifyTitles } = useCommons()

const computedTitle = computed(() =>
  applyTitleTemplate(store.globalTitleTemplate, props.item.image, store.input),
)
const effectiveTitle = computed(() => props.item.meta.title ?? computedTitle.value)

const onTitleChange = (id: string, title: string) => {
  if (!title) {
    store.updateItem(id, 'title', undefined)
    verifyTitles([{ id, title: computedTitle.value }], { debounce: true })
  } else {
    store.updateItem(id, 'title', title)
    verifyTitles([{ id, title }], { debounce: true })
  }
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
            :modelValue="effectiveTitle"
            :invalid="item.meta.titleStatus === 'taken'"
            @update:modelValue="(v) => onTitleChange(item.id, v ?? '')"
            fluid
          />
          <InputIcon
            class="pi"
            :class="{
              'text-inherit! pi-spin pi-spinner': item.meta.titleStatus === 'checking',
              'text-green-600! pi-check-circle': item.meta.titleStatus === 'available',
              'text-red-500! pi-times-circle': item.meta.titleStatus === 'taken',
              'text-yellow-500! pi-exclamation-triangle': item.meta.titleStatus === 'unknown',
            }"
          />
        </IconField>
        <Message
          v-if="item.meta.titleStatus === 'checking'"
          severity="info"
          variant="simple"
          size="small"
          :pt="{
            transition: {
              name: 'none',
              enterActiveClass: 'none',
              leaveActiveClass: 'none',
            },
          }"
        >
          Checking title availability...
        </Message>
        <Message
          v-else-if="item.meta.titleStatus === 'taken'"
          severity="error"
          variant="simple"
          size="small"
          :pt="{
            transition: {
              name: 'none',
              enterActiveClass: 'none',
              leaveActiveClass: 'none',
            },
          }"
        >
          Title is not possible
          <a
            :href="`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(effectiveTitle)}`"
            class="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check existing file
            <i class="pi pi-external-link text-xs!"></i>
          </a>
        </Message>
        <Message
          v-else-if="item.meta.titleStatus === 'unknown'"
          severity="warn"
          variant="simple"
          size="small"
          :pt="{
            transition: {
              name: 'none',
              enterActiveClass: 'none',
              leaveActiveClass: 'none',
            },
          }"
        >
          Unable to verify title availability
        </Message>
        <Message
          v-else-if="item.meta.titleStatus === 'available'"
          severity="success"
          variant="simple"
          size="small"
          :pt="{
            transition: {
              name: 'none',
              enterActiveClass: 'none',
              leaveActiveClass: 'none',
            },
          }"
        >
          Title is available
        </Message>
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
            <Chip
              v-if="item.image.is_pano"
              severity="info"
              class="self-start"
            >
              Panorama
            </Chip>
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
                class="text-info"
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
    />
  </div>
</template>
