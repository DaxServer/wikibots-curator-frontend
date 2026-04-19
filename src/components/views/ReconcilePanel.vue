<script setup lang="ts">
defineProps<{
  results: ReconCandidate[]
  selectedQid: string | undefined
}>()

const emit = defineEmits<{
  'toggle-select': [candidateId: string]
}>()
</script>

<template>
  <div class="mt-2 ml-10 border-l-2 border-indigo-200 pl-3">
    <div
      v-if="results.length === 0"
      class="text-sm text-surface-400"
    >
      No Wikidata matches found
    </div>
    <div
      v-for="candidate in results"
      :key="candidate.id"
      :class="[
        'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm border hover:bg-sky-50 hover:border-sky-300',
        selectedQid === candidate.id ? 'bg-sky-50 border-sky-300' : 'border-transparent',
      ]"
      @click="emit('toggle-select', candidate.id)"
    >
      <span
        :class="[
          'w-3 h-3 rounded-full border-2 flex-shrink-0',
          selectedQid === candidate.id ? 'border-sky-500 bg-sky-500' : 'border-surface-400',
        ]"
      />
      <ExternalLink
        :href="`https://www.wikidata.org/wiki/${candidate.id}`"
        :show-icon="false"
        class="font-mono text-sky-800 hover:underline flex-shrink-0"
        @click.stop
      >
        {{ candidate.id }}
      </ExternalLink>
      <span class="font-medium">{{ candidate.name }}</span>
      <span class="text-surface-500 truncate">{{ candidate.description }}</span>
      <span class="text-surface-500 ml-auto flex-shrink-0">{{ candidate.score }}%</span>
      <ExternalLink
        :href="`https://www.wikidata.org/wiki/${candidate.id}`"
        :show-icon="false"
        class="text-sky-800 hover:underline hover:text-sky-900 flex-shrink-0"
        @click.stop
      >
        Wikidata ↗
      </ExternalLink>
    </div>
  </div>
</template>
