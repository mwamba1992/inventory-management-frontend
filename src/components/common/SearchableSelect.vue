<template>
  <div ref="root" class="relative">
    <button
      type="button"
      :disabled="disabled"
      @click="toggle"
      :class="[
        'w-full px-3 py-2 rounded-xl border border-neutral-200 text-left flex items-center justify-between bg-white',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-neutral-300',
      ]"
    >
      <span :class="selectedLabel ? 'text-neutral-900' : 'text-neutral-400'" class="truncate">
        {{ selectedLabel || placeholder }}
      </span>
      <svg class="w-4 h-4 text-neutral-400 ml-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute z-30 mt-1 w-full bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden"
    >
      <div class="p-2 border-b border-neutral-100 bg-neutral-50">
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          :placeholder="searchPlaceholder"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc.prevent="close"
          class="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-brand-500"
        />
      </div>
      <div class="max-h-64 overflow-y-auto">
        <div
          v-if="filtered.length === 0"
          class="px-3 py-4 text-sm text-neutral-500 text-center"
        >
          No matches
        </div>
        <button
          v-for="(item, idx) in filtered"
          :key="getValue(item)"
          type="button"
          @click="select(item)"
          @mouseenter="highlightedIndex = idx"
          :class="[
            'w-full px-3 py-2 text-left text-sm flex items-center justify-between',
            idx === highlightedIndex ? 'bg-brand-50' : 'hover:bg-neutral-50',
            getValue(item) === modelValue ? 'font-semibold text-brand-700' : 'text-neutral-700',
          ]"
        >
          <span class="truncate">{{ getLabel(item) }}</span>
          <span v-if="getValue(item) === modelValue" class="text-brand-600 ml-2">✓</span>
        </button>
        <div
          v-if="hasMoreThanLimit"
          class="px-3 py-2 text-xs text-neutral-400 text-center border-t border-neutral-100"
        >
          Showing first {{ visibleLimit }} — refine your search to narrow further
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  items: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'name' },
  valueKey: { type: String, default: 'id' },
  // Optional: function (item) => string. Lets callers compose richer labels.
  formatLabel: { type: Function, default: null },
  // Optional: function (item, query) => boolean. Lets callers customize matching.
  filterFn: { type: Function, default: null },
  placeholder: { type: String, default: 'Select…' },
  searchPlaceholder: { type: String, default: 'Search…' },
  disabled: { type: Boolean, default: false },
  visibleLimit: { type: Number, default: 100 },
})

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const query = ref('')
const highlightedIndex = ref(0)
const root = ref(null)
const searchInput = ref(null)

const getValue = (item) => (item ? item[props.valueKey] : null)
const getLabel = (item) => {
  if (!item) return ''
  if (props.formatLabel) return props.formatLabel(item)
  return item[props.labelKey] ?? ''
}

const selectedItem = computed(() =>
  props.items.find((i) => getValue(i) === props.modelValue),
)
const selectedLabel = computed(() => getLabel(selectedItem.value))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let result = props.items
  if (q) {
    if (props.filterFn) {
      result = result.filter((i) => props.filterFn(i, q))
    } else {
      result = result.filter((i) => {
        const label = getLabel(i)
        return label && label.toLowerCase().includes(q)
      })
    }
  }
  // Cap rendering to keep DOM cheap on 1000+ item lists.
  if (result.length > props.visibleLimit) {
    return result.slice(0, props.visibleLimit)
  }
  return result
})

const hasMoreThanLimit = computed(
  () => filtered.value.length === props.visibleLimit && props.items.length > props.visibleLimit,
)

const toggle = () => {
  if (props.disabled) return
  open.value ? close() : openMenu()
}

const openMenu = async () => {
  open.value = true
  query.value = ''
  highlightedIndex.value = Math.max(
    0,
    filtered.value.findIndex((i) => getValue(i) === props.modelValue),
  )
  await nextTick()
  searchInput.value?.focus()
}

const close = () => {
  open.value = false
}

const select = (item) => {
  const value = getValue(item)
  emit('update:modelValue', value)
  emit('change', item)
  close()
}

const selectHighlighted = () => {
  const item = filtered.value[highlightedIndex.value]
  if (item) select(item)
}

const moveHighlight = (delta) => {
  const max = filtered.value.length - 1
  if (max < 0) return
  highlightedIndex.value = Math.max(0, Math.min(max, highlightedIndex.value + delta))
}

watch(query, () => {
  highlightedIndex.value = 0
})

const onClickOutside = (e) => {
  if (root.value && !root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>
