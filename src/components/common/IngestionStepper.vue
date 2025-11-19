<script setup lang="ts">
const modelValue = defineModel<string>({ required: true })
const updateStep = (step: string) => {
  modelValue.value = step
}
</script>

<template>
  <v-stepper
    :model-value="Number(modelValue)"
    @update:model-value="(step) => updateStep(String(step))"
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
      />
      <v-divider />
      <v-stepper-item
        :value="3"
        title="Edit"
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
