<script setup lang="ts">
const store = useCollectionsStore()
</script>

<template>
  <v-stepper
    :model-value="store.stepper"
    @update:model-value="store.stepper = Number($event)"
  >
    <v-stepper-header>
      <v-stepper-item
        :value="1"
        title="Retrieve"
      />
      <v-divider />
      <v-stepper-item
        :value="2"
        title="Select"
        :editable="[3, 4].includes(store.stepper)"
      />
      <v-divider />
      <v-stepper-item
        :value="3"
        title="Edit"
        :editable="4 === store.stepper"
      />
      <v-divider />
      <v-stepper-item
        :value="4"
        title="Preview"
      />
      <v-divider />
      <v-stepper-item
        :value="5"
        title="Upload"
      />
    </v-stepper-header>
  </v-stepper>
</template>
