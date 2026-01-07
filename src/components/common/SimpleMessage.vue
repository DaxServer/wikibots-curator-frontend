<script setup lang="ts">
interface _Props extends /* @vue-ignore */ MessageProps {}

defineProps<_Props>()
</script>

<template>
  <Message
    v-bind="$attrs"
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
