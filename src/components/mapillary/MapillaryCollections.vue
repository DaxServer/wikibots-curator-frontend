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
          {{ item.image.dates.taken ? item.image.dates.taken.toLocaleString() : '—' }}
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
        <ExternalLink
          as="button"
          :href="item.image.url_original"
          class="w-fit pl-0!"
        >
          View image
        </ExternalLink>
        <ExternalLink
          as="button"
          :href="item.image.url"
          class="w-fit pl-0!"
        >
          View on Mapillary
        </ExternalLink>
        <Message
          v-if="item.image.existing.length"
          severity="warn"
          :pt="{
            transition: {
              name: 'none',
              enterActiveClass: 'none',
              leaveActiveClass: 'none',
            },
          }"
        >
          <strong>Existing files:</strong>
          <div
            v-for="page in item.image.existing"
            :key="page.url"
          >
            *
            <ExternalLink
              :href="page.url"
              class="hover:underline"
            >
              {{ page.url.split('/').pop() }}
            </ExternalLink>
          </div>
        </Message>
      </div>
    </template>
  </CollectionsTable>
</template>
