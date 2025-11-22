<script setup lang="ts">
import { mdiImageMultiple } from '@mdi/js'

defineProps<{
  placeholder: string
  emptyMessage: string
  idLabel: string
  altPrefix: string
}>()

const store = useCollectionsStore()
const auth = useAuthStore()
const { loadCollection } = useCollections()

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
      <div
        v-if="store.error"
        class="d-inline-flex w-auto flex-grow-0 flex-shrink-0 mb-4"
      >
        <v-alert type="error">{{ store.error }}</v-alert>
      </div>

      <IngestionStepper
        v-model="store.stepper"
        @update:model-value="(step) => updateStep(String(step))"
      />

      <CollectionsInfoCard
        v-if="store.stepper !== '1' && store.stepper !== '5'"
        :input="store.input"
        :selected-count="store.selectedCount"
        :total-images="store.totalImages"
        :id-label="idLabel"
      />

      <div v-if="store.stepper === '1'">
        <v-form
          class="mt-4 mb-4"
          @submit.prevent="(e) => (e.preventDefault(), loadCollection())"
        >
          <v-text-field
            autofocus
            v-model="store.input"
            :placeholder="placeholder"
            variant="outlined"
            density="compact"
            class="flex-grow-1"
          />
          <v-btn
            color="primary"
            type="submit"
            :loading="store.isLoading"
            :disabled="!store.input.trim() || store.isLoading"
          >
            Load
          </v-btn>
        </v-form>
      </div>

      <div v-if="store.stepper === '2'">
        <CollectionsControls />

        <IngestSelectionList :alt-prefix="altPrefix">
          <template #metadata="{ item }">
            <slot
              name="metadata"
              :item="item"
            ></slot>
          </template>
        </IngestSelectionList>
      </div>

      <div v-if="store.stepper === '3'">
        <CollectionsEdit :alt-prefix="altPrefix" />
      </div>

      <div v-if="store.stepper === '4'">
        <UploadPreview :alt-prefix="altPrefix" />
      </div>

      <div v-if="store.stepper === '5'">
        <UploadStatusTable :items="store.displayedItems" />
      </div>

      <div
        v-if="store.totalImages === 0 && !store.isLoading"
        class="text-center py-8 text-medium-emphasis"
      >
        <v-icon
          :icon="mdiImageMultiple"
          class="mb-4"
        />
        <p class="text-body-1">{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>
