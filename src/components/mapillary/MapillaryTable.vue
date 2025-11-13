<script setup lang="ts">
import { mdiImageMultiple } from '@mdi/js'

const store = useMapillaryStore()
const auth = useAuthStore()

const updateStep = (step: string) => {
  store.stepper = step
}
</script>

<template>
  <div>
    <div
      v-if="!auth.isAuthenticated"
      class="py-16 d-flex justify-center align-center"
      @click="auth.login"
    >
      <v-btn
        color="primary"
        :loading="auth.isLoading"
        :disabled="auth.isLoading"
      >
        Login with Wikimedia Commons
      </v-btn>
    </div>
    <div v-else>
      <!-- Error Message -->
      <v-alert
        v-if="store.error"
        type="error"
        class="mb-4"
        closable
      >
        {{ store.error }}
      </v-alert>

      <v-stepper
        :model-value="Number(store.stepper)"
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

      <!-- Empty State -->
      <div
        v-if="!store.hasSequence && !store.isLoading"
        class="text-center py-8 text-medium-emphasis"
      >
        <v-icon
          :icon="mdiImageMultiple"
          class="mb-4"
        />
        <p class="text-body-1">Enter a Mapillary sequence ID to view images</p>
      </div>
    </div>
  </div>
</template>
