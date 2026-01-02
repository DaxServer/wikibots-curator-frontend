<script setup lang="ts">
import type { MessageProps } from 'primevue/message'

withDefaults(
  defineProps<{
    severity?: MessageProps['severity']
    variant?: MessageProps['variant']
    size?: MessageProps['size']
    icon?: string
  }>(),
  {
    variant: 'simple',
    size: 'small',
  },
)
</script>

<template>
  <Message
    :severity="severity"
    :variant="variant"
    :size="size"
    :icon="icon"
    :pt="{
      transition: {
        name: 'none',
        enterActiveClass: 'none',
        leaveActiveClass: 'none',
      },
    }"
  >
    <slot />
  </Message>
</template>
