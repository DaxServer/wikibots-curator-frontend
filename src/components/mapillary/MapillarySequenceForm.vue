<script setup lang="ts">
import { mdiMagnify } from '@mdi/js'

const mapillary = useMapillary()
const store = useMapillaryStore()

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  await mapillary.loadSequence()
}
</script>

<template>
  <v-form
    class="mt-4 mb-4"
    @submit.prevent="handleSubmit"
  >
    <v-text-field
      v-model="store.sequenceId"
      placeholder="Mapillary sequence ID (e.g., tulzukst7vufhdo1e4z60f)"
      variant="outlined"
      density="compact"
      class="flex-grow-1"
    />
    <v-btn
      :prepend-icon="mdiMagnify"
      color="primary"
      type="submit"
      :loading="store.isLoading"
      :disabled="!store.sequenceId.trim() || store.isLoading"
      @click="handleSubmit"
    >
      Load Sequence
    </v-btn>
  </v-form>
</template>
