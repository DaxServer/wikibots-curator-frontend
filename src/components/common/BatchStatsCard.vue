<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    count: number
    skeleton?: boolean
    color?: 'gray' | 'green' | 'red' | 'fuchsia' | 'blue'
    alwaysActive?: boolean
    selected?: boolean
  }>(),
  {
    skeleton: true,
    color: 'gray',
    alwaysActive: false,
    selected: false,
  },
)

defineEmits<{
  click: []
}>()

const isActive = computed(() => props.alwaysActive || props.count > 0)

const COLOR_VARIANTS = {
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    labelColor: 'text-gray-600',
    labelColorInactive: 'text-gray-300',
    countColor: 'text-gray-700',
    countColorInactive: 'text-gray-200',
    ring: 'ring-gray-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    labelColor: 'text-green-600',
    labelColorInactive: 'text-green-300',
    countColor: 'text-green-700',
    countColorInactive: 'text-green-200',
    ring: 'ring-green-500',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    labelColor: 'text-red-600',
    labelColorInactive: 'text-red-300',
    countColor: 'text-red-700',
    countColorInactive: 'text-red-200',
    ring: 'ring-red-500',
  },
  fuchsia: {
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    labelColor: 'text-fuchsia-600',
    labelColorInactive: 'text-fuchsia-300',
    countColor: 'text-fuchsia-700',
    countColorInactive: 'text-fuchsia-200',
    ring: 'ring-fuchsia-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    labelColor: 'text-blue-600',
    labelColorInactive: 'text-blue-300',
    countColor: 'text-blue-700',
    countColorInactive: 'text-blue-200',
    ring: 'ring-blue-500',
  },
} as const

const colors = computed(() => {
  const variant = COLOR_VARIANTS[props.color]
  return {
    bg: variant.bg,
    border: variant.border,
    labelColor: isActive.value ? variant.labelColor : variant.labelColorInactive,
    countColor: isActive.value ? variant.countColor : variant.countColorInactive,
    ring: variant.ring,
  }
})
</script>

<template>
  <div
    class="flex flex-col p-3 border rounded-lg transition-all duration-200"
    :class="[
      colors.bg,
      colors.border,
      isActive ? 'hover:cursor-pointer hover:shadow-md' : 'hover:cursor-default',
      !skeleton && selected ? `ring-2 ${colors.ring}` : '',
    ]"
    @click="isActive && $emit('click')"
  >
    <span
      class="text-xs font-medium uppercase"
      :class="colors.labelColor"
    >
      {{ label }}
    </span>
    <span
      class="text-2xl font-bold mt-1"
      :class="colors.countColor"
    >
      <Skeleton v-if="skeleton" />
      <template v-else>
        {{ count }}
      </template>
    </span>
  </div>
</template>
