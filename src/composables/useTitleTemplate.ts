import { useCommons } from '@/composables/useCommons'
import { useCollectionsStore } from '@/stores/collections.store'
import { applyTitleTemplate, validPaths, validateTemplate } from '@/utils/titleTemplate'
import { computed, ref } from 'vue'

export const useTitleTemplate = () => {
  const store = useCollectionsStore()
  const { verifyTitles } = useCommons()
  const internalTemplate = ref(
    'Mapillary ({{mapillary.photo.sequence}}) ({{mapillary.user.username}}) {{captured.date}} {{captured.time}}.jpg',
  )
  const error = ref<string | null>(null)

  const applyTemplate = async () => {
    const { valid, error: err } = validateTemplate(internalTemplate.value)
    if (!valid) {
      error.value = err
      return
    }
    store.globalTitleTemplate = internalTemplate.value

    const itemsToVerify: { id: string; title: string }[] = []
    store.selectedItems.forEach((item) => {
      if (!store.items[item.id]?.meta.title) {
        itemsToVerify.push({
          id: item.id,
          title: applyTitleTemplate(internalTemplate.value, item.image, store.input),
        })
      }
    })

    if (itemsToVerify.length > 0) {
      await verifyTitles(itemsToVerify)
    }
  }

  const template = computed({
    get: () => internalTemplate.value,
    set: (newVal: string) => {
      internalTemplate.value = newVal
      const { error: err } = validateTemplate(newVal)
      error.value = err
    },
  })

  const insertVariable = (variable: string) => {
    const prefix = template.value.length > 0 && !template.value.endsWith(' ') ? ' ' : ''
    template.value += `${prefix}{{${variable}}}`
  }

  const isDirty = computed(() => internalTemplate.value !== store.globalTitleTemplate)

  const highlightedTemplate = computed(() => {
    if (!template.value) return ' '
    const text = template.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    return (
      text.replace(
        /(\{\{[^{}]*\}\})|(\{\{)|(\}\})/g,
        (match, completeTag, openBrace, closeBrace) => {
          if (completeTag) {
            const content = match.slice(2, -2).trim()
            const isValid = validPaths.includes(content)
            const classes = isValid
              ? 'text-blue-600 bg-blue-50'
              : 'text-red-600 bg-red-50 border-b-2 border-red-600'
            return `<span class="${classes} rounded-sm">${match}</span>`
          }
          if (openBrace || closeBrace) {
            return `<span class="text-red-600 bg-red-50 border-b-2 border-red-600 rounded-sm">${match}</span>`
          }
          return match
        },
      ) + (text.endsWith('\n') ? '<br>' : '')
    )
  })

  const previewItems = computed(() => {
    return store.selectedItems.slice(0, 3).map((item) => ({
      id: item.id,
      index: item.index,
      title: applyTitleTemplate(template.value, item.image, store.input),
    }))
  })

  const getVariableToken = (path: string) => `{{${path}}}`

  const onDragStart = (event: DragEvent, variable: string) => {
    if (!event.dataTransfer) {
      return
    }

    const text = getVariableToken(variable)
    event.dataTransfer.setData('text/plain', text)
    event.dataTransfer.effectAllowed = 'copy'

    // Create a custom drag image that shows just the text
    const el = document.createElement('div')
    el.textContent = text
    el.className =
      'absolute top-[-9999px] bg-white p-1 rounded text-sm border border-gray-200 z-50 pointer-events-none'
    document.body.appendChild(el)

    // Use the text element as the drag image
    // Offset slightly so it doesn't block the cursor (x: 0, y: -10)
    event.dataTransfer.setDragImage(el, 0, -10)

    // Clean up after a short delay to ensure the browser has captured the image
    requestAnimationFrame(() => {
      document.body.removeChild(el)
    })
  }

  return {
    error,
    highlightedTemplate,
    isDirty,
    previewItems,
    template,

    applyTemplate,
    getVariableToken,
    insertVariable,
    onDragStart,
  }
}
