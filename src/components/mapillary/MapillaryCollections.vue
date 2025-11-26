<script setup lang="ts">
const store = useCollectionsStore()

onMounted(() => {
  store.setHandler('mapillary')
})
</script>

<template>
  <CollectionsTable
    placeholder="Mapillary sequence ID (e.g., tulzukst7vufhdo1e4z60f)"
    empty-message="Enter a Mapillary sequence ID to view images"
    id-label="Sequence ID"
    alt-prefix="Mapillary image"
  >
    <template #metadata="{ item }">
      <div class="flex flex-col gap-3">
        <span class="text-4xl font-thin">
          #
          <span class="text-4xl font-medium">{{ item.index }}</span>
        </span>
        <div>
          <strong>Taken:</strong>
          {{ item.image.dates.taken ? new Date(item.image.dates.taken).toLocaleString() : '—' }}
        </div>
        <div>
          <strong>ID:</strong>
          {{ item.image.id }}
        </div>
        <Tag
          v-if="item.image.is_pano"
          severity="info"
          value="Panorama"
          class="align-self-start"
        />
        <Button
          as="a"
          :href="item.image.url_original"
          class="w-fit pl-0!"
          variant="link"
          label="View image"
          target="_blank"
          icon="pi pi-external-link"
          iconPos="right"
          rel="noopener noreferrer"
        />
        <Button
          as="a"
          class="w-fit pl-0!"
          variant="link"
          label="View on Mapillary"
          :href="item.image.url"
          target="_blank"
          icon="pi pi-external-link"
          iconPos="right"
          rel="noopener noreferrer"
        />
        <Message
          v-if="item.image.existing.length"
          severity="warn"
        >
          <strong>Existing files:</strong>
          <div
            v-for="page in item.image.existing"
            :key="page.url"
          >
            *
            <a
              :href="page.url"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
            >
              {{ page.url.split('/').pop() }}
              <i class="pi pi-external-link"></i>
            </a>
          </div>
        </Message>
      </div>
    </template>
  </CollectionsTable>
</template>
