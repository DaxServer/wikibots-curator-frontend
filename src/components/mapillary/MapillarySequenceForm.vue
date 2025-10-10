<script setup lang="ts">
import { Search } from '@vicons/ionicons5'

const mapillary = useMapillary()
const store = useMapillaryStore()

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  await mapillary.loadSequence()
}
</script>

<template>
  <n-form
    class="mt-4 mb-4"
  >
    <div class="flex gap-2">
      <n-input
        v-model:value="store.sequenceId"
        placeholder="Mapillary sequence ID (e.g., tulzukst7vufhdo1e4z60f)"
        class="w-full"
        />
        <n-button
          type="primary"
          attr-type="submit"
          :loading="store.isLoading"
          :disabled="!store.sequenceId.trim() || store.isLoading"
          @click="handleSubmit"
        >
          <template #icon>
            <n-icon>
              <Search />
            </n-icon>
          </template>
          Load Sequence
        </n-button>
    </div>
  </n-form>
</template>
