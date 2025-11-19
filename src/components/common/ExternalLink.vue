<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js'

const props = withDefaults(
  defineProps<{
    href: string
    class?: string
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

const target = computed(() => (props.newTab ? '_blank' : undefined))
const rel = computed(() => (props.newTab ? 'noopener noreferrer' : undefined))
const iconToUse = computed(() => props.icon ?? mdiOpenInNew)
</script>

<template>
  <a
    v-if="(as ?? 'link') === 'link'"
    v-bind="props"
    class="d-inline-flex align-center"
    :href="href"
    :target="target"
    :rel="rel"
  >
    <slot />
    <v-icon v-if="showIcon" v-bind="props" :icon="iconToUse" :size="iconSize" class="ml-1" />
  </a>
  <v-btn
    v-else
    v-bind="props"
    :href="href"
    :target="target"
    :rel="rel"
    :append-icon="showIcon ? iconToUse : undefined"
  >
    <slot />
  </v-btn>
</template>
