<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 p-3 text-left">
          <input type="checkbox" class="rounded" />
        </th>
        <th class="border border-gray-200 p-3 text-left">ID</th>
        <th class="border border-gray-200 p-3 text-left">Name</th>
        <th class="border border-gray-200 p-3 text-left">Description</th>
        <th class="border border-gray-200 p-3 text-left">Tax</th>
        <th class="border border-gray-200 p-3 text-left">Default Qty</th>
        <th class="border border-gray-200 p-3 text-left">Price</th>
        <th class="border border-gray-200 p-3 text-left">Stockcode</th>
        <th class="border border-gray-200 p-3 text-left">Category</th>
        <th class="border border-gray-200 p-3 text-left">Supplier</th>
        <th class="border border-gray-200 p-3 text-left">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading" class="hover:bg-gray-50">
        <td colspan="11" class="border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </td>
      </tr>
      <tr v-else-if="items.length === 0" class="hover:bg-gray-50">
        <td colspan="11" class="border border-gray-200 p-8 text-center text-gray-500">
          No items found
        </td>
      </tr>
      <tr v-else v-for="item in items" :key="item.id" class="hover:bg-gray-50">
        <td class="border border-gray-200 p-3">
          <input type="checkbox" class="rounded" />
        </td>
        <td class="border border-gray-200 p-3">{{ item.id }}</td>
        <td class="border border-gray-200 p-3">{{ item.name }}</td>
        <td class="border border-gray-200 p-3">{{ item.description }}</td>
        <td class="border border-gray-200 p-3">{{ item.tax }}</td>
        <td class="border border-gray-200 p-3">{{ item.defaultQty }}</td>
        <td class="border border-gray-200 p-3">${{ item.price.toFixed(2) }}</td>
        <td class="border border-gray-200 p-3">{{ item.stockcode }}</td>
        <td class="border border-gray-200 p-3">{{ item.category }}</td>
        <td class="border border-gray-200 p-3">{{ item.supplier }}</td>
        <td class="border border-gray-200 p-3">
          <div class="flex space-x-2">
            <button
              @click="$emit('edit', item)"
              class="text-blue-600 hover:text-blue-800"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', item)"
              class="text-red-600 hover:text-red-800"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

defineProps({
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])
</script>
