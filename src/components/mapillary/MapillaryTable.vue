<script setup lang="ts">
const store = useMapillaryStore()
// const auth = useAuthStore()

const updateStep = (step: string) => {
  store.stepper = step
}
</script>

<template>
  <div>
  <!-- <div v-if="!auth.isAuthenticated" class="py-50 flex justify-center items-center">
    <n-button
      type="primary"
      :loading="auth.isLoading"
      :disabled="auth.isLoading"
      @click="auth.login"
    >
      Login with Wikimedia Commons
    </n-button>
  </div> -->
    <!-- Error Message -->
    <n-alert
      v-if="store.error"
      type="error"
      class="mb-4"
      :closable="true"
    >
      {{ store.error }}
    </n-alert>

    <n-steps :current="Number(store.stepper)" :on-update:current="(step) => updateStep(String(step))">
      <n-step title="Retrieve" description="" />
      <n-step title="Select" description="" />
      <n-step title="Edit" description="" />
      <n-step title="Preview" description="" />
      <n-step title="Upload" description="" />
    </n-steps>

    <div v-if="store.stepper === '1'">
      <MapillarySequenceForm />
    </div>
    <div v-if="store.stepper === '2'">
      <MapillarySequenceSelect />
    </div>
    <div v-if="store.stepper === '3'">
      <MapillarySequenceEdit />
    </div>
    <div v-if="store.stepper === '4'">
      <MapillaryPreview />
    </div>
    <div v-if="store.stepper === '5'">
      <MapillaryUpload />
    </div>

    <!-- Loading State -->
    <div
      v-if="store.isLoading"
      class="flex justify-center items-center py-8"
    >
      <n-spin />
    </div>

    <!-- Empty State -->
    <div
      v-if="!store.hasSequence && !store.isLoading"
      class="text-center py-8 text-gray-500"
    >
      <i class="pi pi-images text-4xl mb-2"></i>
      <p>Enter a Mapillary sequence ID to view images</p>
    </div>
   </div>
</template>
