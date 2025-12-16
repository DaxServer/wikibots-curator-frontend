<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    count: number
    color?: 'gray' | 'green' | 'red' | 'fuchsia' | 'blue'
    alwaysActive?: boolean
    selected?: boolean
  }>(),
  {
    color: 'gray',
    alwaysActive: false,
    selected: false,
  },
)

defineEmits<{
  click: []
}>()

const isActive = computed(() => props.alwaysActive || props.count > 0)

const colors = computed(() => {
  const c = props.color
  return {
    bg: `bg-${c}-50`,
    border: `border-${c}-200`,
    textLabel: isActive.value ? `text-${c}-600` : `text-${c}-300`,
    textCount: isActive.value ? `text-${c}-700` : `text-${c}-200`,
    ring: `ring-${c}-500`,
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
      selected ? `ring-2 ${colors.ring}` : '',
    ]"
    @click="isActive && $emit('click')"
  >
    <span
      class="text-xs font-medium uppercase"
      :class="[colors.textLabel, { 'text-gray-500': color === 'gray' && alwaysActive }]"
    >
      {{ label }}
    </span>
    <span
      class="text-2xl font-bold mt-1"
      :class="colors.textCount"
    >
      {{ count }}
    </span>
  </div>
</template>
