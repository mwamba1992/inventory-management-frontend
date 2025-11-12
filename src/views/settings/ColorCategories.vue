<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
    <div class="max-w-full mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Settings</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Color Categories</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Color Category Management
            </h1>
            <p class="text-gray-600 mt-2">Manage color variants for your inventory items</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshColors"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Color
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Colors</p>
              <p class="text-2xl font-bold text-gray-900">{{ colorCategories.length }}</p>
            </div>
            <div class="p-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
              <SwatchIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Colors</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeColors }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Recently Added</p>
              <p class="text-2xl font-bold text-gray-900">{{ recentlyAdded }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <ClockIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Colors Table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <!-- Controls Section -->
        <div class="p-6 border-b border-gray-200/50">
          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-700">Show</span>
                <select
                  v-model="entriesPerPage"
                  @change="currentPage = 1"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="text-sm font-medium text-gray-700">entries</span>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  v-model="searchTerm"
                  @input="currentPage = 1"
                  type="text"
                  placeholder="Search colors..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
            <tr>
              <th class="p-4 text-left">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectAll"
                  @change="handleSelectAll"
                />
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('id')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">ID</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Color Preview</span>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('name')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Color Name</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Hex Code</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Description</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Status</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
            <tr v-if="loading">
              <td colspan="8" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading colors...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedColors.length === 0">
              <td colspan="8" class="p-12 text-center text-gray-500">
                <SwatchIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm ? 'No colors found' : 'No colors yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Create your first color to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="color in paginatedColors"
              :key="color.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(color.id)"
                  @change="handleSelectItem(color.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ color.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <div
                    class="w-10 h-10 rounded-xl border-2 border-gray-200 shadow-sm"
                    :style="{ backgroundColor: color.hexCode || '#CCCCCC' }"
                  ></div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ color.name }}</p>
                    <p class="text-xs text-gray-500">Color #{{ color.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-800"
                >
                  {{ color.hexCode || 'N/A' }}
                </span>
              </td>
              <td class="p-4">
                <p class="text-sm text-gray-900 max-w-xs truncate">
                  {{ color.description || 'No description' }}
                </p>
              </td>
              <td class="p-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="color.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ color.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(color)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Color"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewColorDetails(color)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteColor(color)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Color"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Section -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-t border-gray-200/50"
        >
          <div class="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredColors.length }} entries
          </div>

          <div v-if="totalPages > 1" class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors duration-200"
                :class="
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                "
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Selection Info -->
        <div
          v-if="selectedItems.size > 0"
          class="mx-6 mb-6 p-4 bg-blue-50/50 border border-blue-200 rounded-xl"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-blue-700">
              {{ selectedItems.size }} color{{ selectedItems.size !== 1 ? 's' : '' }} selected
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkDelete"
                class="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Edit Color' : 'Create New Color' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveColor" class="p-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Color Name -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Color Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Navy Blue, Crimson Red"
                />
              </div>

              <!-- Color Picker -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Color Code</label>
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <input
                      v-model="form.hexCode"
                      type="text"
                      placeholder="#000000"
                      maxlength="7"
                      class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono"
                      @input="validateHexCode"
                    />
                  </div>
                  <div class="relative">
                    <input
                      v-model="form.hexCode"
                      type="color"
                      class="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      @change="updateHexCode"
                    />
                  </div>
                  <div
                    class="w-16 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                    :style="{ backgroundColor: form.hexCode || '#CCCCCC' }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">Enter hex code or use color picker</p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe this color variant..."
                ></textarea>
              </div>

              <!-- Preview Section -->
              <div v-if="form.name" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <h5 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <EyeIcon class="w-4 h-4 mr-2" />
                  Color Preview
                </h5>
                <div class="flex items-center space-x-4">
                  <div
                    class="w-20 h-20 rounded-xl border-2 border-white shadow-lg"
                    :style="{ backgroundColor: form.hexCode || '#CCCCCC' }"
                  ></div>
                  <div class="flex-1">
                    <p class="text-base font-semibold text-gray-900 mb-1">{{ form.name }}</p>
                    <p class="text-xs font-mono text-indigo-600 mb-2">{{ form.hexCode || 'No hex code' }}</p>
                    <p class="text-sm text-gray-600">{{ form.description || 'No description provided' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <span v-if="submitting" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ isEditing ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>
                  {{ isEditing ? 'Update Color' : 'Create Color' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-600 mr-3" />
              <h3 class="text-lg font-bold text-gray-900">Delete Color</h3>
            </div>
            <p class="text-gray-600 mb-2">
              Are you sure you want to delete "{{ colorToDelete?.name }}"? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3 mt-6">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                :disabled="submitting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50"
              >
                <span v-if="submitting" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  HomeIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'
import ColorCategoryService from '@/services/colorCategoryService'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// Reactive data
const colorCategories = ref([])
const searchTerm = ref('')
const entriesPerPage = ref(10)
const currentPage = ref(1)
const selectedItems = ref(new Set())
const selectAll = ref(false)
const sortField = ref('')
const sortDirection = ref('asc')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const colorToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  hexCode: '#000000',
  description: '',
})

// Fetch color categories
const fetchColors = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await ColorCategoryService.getAll()
    colorCategories.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch color categories', err.message)
    error.value = `Failed to fetch color categories: ${err.message}`
  } finally {
    loading.value = false
  }
}

// Create color category
const createColor = async (colorData) => {
  submitting.value = true
  try {
    const newColor = await ColorCategoryService.create(colorData)
    colorCategories.value.push(newColor)
    swalAlert.value?.showSuccess('Color created successfully')
    return newColor
  } catch (err) {
    swalAlert.value?.showError('Failed to create color', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Update color category
const updateColor = async (id, colorData) => {
  submitting.value = true
  try {
    const updatedColor = await ColorCategoryService.update(id, colorData)
    const index = colorCategories.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      colorCategories.value[index] = updatedColor
    }
    swalAlert.value?.showSuccess('Color updated successfully')
    return updatedColor
  } catch (err) {
    swalAlert.value?.showError('Failed to update color', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Delete color category
const deleteColorApi = async (id) => {
  submitting.value = true
  try {
    await ColorCategoryService.delete(id)
    colorCategories.value = colorCategories.value.filter((c) => c.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Color deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete color', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredColors = computed(() => {
  let filtered = colorCategories.value.filter(color =>
    color.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    (color.description && color.description.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
    (color.hexCode && color.hexCode.toLowerCase().includes(searchTerm.value.toLowerCase()))
  )

  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value] || ''
      let bVal = b[sortField.value] || ''

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return filtered
})

const paginatedColors = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredColors.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredColors.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredColors.value.length > 0 ? (currentPage.value - 1) * entriesPerPage.value + 1 : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredColors.value.length)
})

// Stats computed properties
const activeColors = computed(() => {
  return colorCategories.value.filter((c) => c.active).length
})

const recentlyAdded = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return colorCategories.value.filter((c) => new Date(c.createdAt) >= sevenDaysAgo).length
})

// Helper methods
const validateHexCode = () => {
  // Ensure hex code starts with #
  if (form.value.hexCode && !form.value.hexCode.startsWith('#')) {
    form.value.hexCode = '#' + form.value.hexCode
  }
  // Validate hex code format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (form.value.hexCode && !hexRegex.test(form.value.hexCode)) {
    // Keep typing but don't show error yet
  }
}

const updateHexCode = (event) => {
  form.value.hexCode = event.target.value
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedColors.value.map((color) => color.id))
    selectAll.value = true
  }
}

const handleSelectItem = (colorId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(colorId)
  } else {
    newSelected.delete(colorId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedColors.value.length && paginatedColors.value.length > 0
}

// Sorting methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Pagination methods
const goToPage = (page) => {
  currentPage.value = page
  selectedItems.value = new Set()
  selectAll.value = false
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const getPageNumbers = () => {
  const pageNumbers = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return pageNumbers
}

// CRUD Operations
const openAddModal = () => {
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    hexCode: '#000000',
    description: '',
  }
  showModal.value = true
}

const openEditModal = (color) => {
  isEditing.value = true
  form.value = {
    id: color.id,
    name: color.name,
    hexCode: color.hexCode || '#000000',
    description: color.description || '',
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    hexCode: '#000000',
    description: '',
  }
  error.value = ''
}

const saveColor = async () => {
  try {
    const colorData = {
      name: form.value.name.trim(),
      hexCode: form.value.hexCode?.trim() || null,
      description: form.value.description?.trim() || null,
    }

    if (isEditing.value) {
      await updateColor(form.value.id, colorData)
    } else {
      await createColor(colorData)
    }

    closeModal()
  } catch (err) {
    console.error('Failed to save color:', err)
  }
}

const deleteColor = (color) => {
  colorToDelete.value = color
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (colorToDelete.value) {
    try {
      await deleteColorApi(colorToDelete.value.id)
      showDeleteModal.value = false
      colorToDelete.value = null
    } catch (err) {
      console.error('Failed to delete color:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} color${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteColorApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected colors deleted successfully')
    } catch (err) {
      console.error('Failed to delete some colors:', err)
      swalAlert.value?.showError('Failed to delete some colors', 'Please try again')
    }
  }
}

const viewColorDetails = (color) => {
  alert(
    `Color Details:\nName: ${color.name}\nHex Code: ${color.hexCode || 'N/A'}\nDescription: ${color.description || 'N/A'}\nStatus: ${color.active ? 'Active' : 'Inactive'}\nCreated: ${new Date(color.createdAt).toLocaleDateString()}`
  )
}

// Other actions
const refreshColors = async () => {
  await fetchColors()
}

// Lifecycle
onMounted(() => {
  fetchColors()
})
</script>
