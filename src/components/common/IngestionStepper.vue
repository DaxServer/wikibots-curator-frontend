<script setup lang="ts">
const store = useCollectionsStore()

const steps = [
  { label: 'Retrieve' },
  { label: 'Select' },
  { label: 'Edit' },
  { label: 'Preview' },
  { label: 'Upload' },
]

const activeStep = computed({
  get: () => store.stepper - 1, // PrimeVue Steps is 0-indexed
  set: (value: number) => {
    const newStep = value + 1
    // Only allow navigation to certain steps based on current step
    if (store.stepper === 3 && newStep === 2) {
      store.stepper = newStep
    } else if (store.stepper === 4 && [2, 3].includes(newStep)) {
      store.stepper = newStep
    }
  },
})
</script>

<template>
  <Stepper value="ingest">
    <StepList>
      <Steps
        :model="steps"
        :activeStep="activeStep"
        @update:activeStep="activeStep = $event"
        :readonly="false"
      />
    </StepList>
  </Stepper>
</template>
