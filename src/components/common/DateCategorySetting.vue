<script lang="ts" setup>
const store = useCollectionsStore()

const takenOnTemplate = '{{Taken on|...}}'
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <Checkbox
        :model-value="store.globalDateCategory"
        binary
        inputId="dateCategory_input"
        @update:model-value="store.setGlobalDateCategory($event)"
      />
      <label
        for="dateCategory_input"
        class="cursor-pointer select-none"
      >
        Exclude from date category
      </label>
    </div>
    <SimpleMessage
      severity="secondary"
      variant="simple"
      size="small"
      class="pl-7"
    >
      Adds
      <code class="bg-gray-200 px-1">|cat=no</code>
      to
      <code>{{ takenOnTemplate }}</code>
      template to prevent automatic categorization by date
    </SimpleMessage>
  </div>
</template>
