<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js'

const props = withDefaults(
  defineProps<{
    href: string
    newTab?: boolean
    as?: 'link' | 'button'
    showIcon?: boolean
    icon?: string
    iconSize?: number | string
  }>(),
  {
    newTab: true,
    as: 'link',
    showIcon: false,
    iconSize: 12,
  },
)

defineOptions({
  inheritAttrs: false,
})

const target = computed(() => (props.newTab ? '_blank' : undefined))
const rel = computed(() => (props.newTab ? 'noopener noreferrer' : undefined))
const iconToUse = computed(() => props.icon ?? mdiOpenInNew)
</script>

<template>
  <a
    v-if="(as ?? 'link') === 'link'"
    v-bind="$attrs"
    class="d-inline-flex align-center"
    :href="href"
    :target="target"
    :rel="rel"
  >
    <slot />
    <v-icon
      v-if="showIcon"
      v-bind="$attrs"
      :icon="iconToUse"
      :size="iconSize"
      class="ml-1"
    />
  </a>
  <v-btn
    v-else
    v-bind="$attrs"
    :href="href"
    :target="target"
    :rel="rel"
    :append-icon="showIcon ? iconToUse : undefined"
  >
    <slot />
  </v-btn>
</template>
