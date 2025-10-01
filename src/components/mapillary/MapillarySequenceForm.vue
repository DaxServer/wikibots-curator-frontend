<script setup lang="ts">
const mapillary = useMapillary()
const store = useMapillaryStore()
</script>

<template>
  <!-- PrimeVue Form -->
  <Form
    class="mb-4"
    @submit="mapillary.loadSequence"
  >
    <div class="flex gap-2">
      <div class="flex-1">
        <InputText
          v-model="store.sequenceId"
          placeholder="Mapillary sequence ID (e.g., tulzukst7vufhdo1e4z60f)"
          class="w-full"
        />
      </div>
      <Button
        type="submit"
        label="Load Sequence"
        icon="pi pi-search"
        :loading="store.isLoading"
        :disabled="!store.sequenceId.trim()"
      />
    </div>
  </Form>
</template>
