<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>System</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Reference Data</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Reference Data Management
            </h1>
            <p class="text-gray-600 mt-2">Manage system lookup values and reference data</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshCommon"
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
              Add Reference Data
            </button>
          </div>
        </div>
      </div>

      <!-- Type Filter Tabs -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex flex-wrap gap-2">
            <button
              @click="selectedType = ''"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedType === ''
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              All Types ({{ commonData.length }})
            </button>
            <button
              v-for="type in availableTypes"
              :key="type"
              @click="selectedType = type"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span :class="getTypeIcon(type)"></span>
              <span>{{ formatTypeName(type) }} ({{ getTypeCount(type) }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Entries</p>
              <p class="text-2xl font-bold text-gray-900">{{ commonData.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <QueueListIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Data Types</p>
              <p class="text-2xl font-bold text-gray-900">{{ availableTypes.length }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <TagIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Account Types</p>
              <p class="text-2xl font-bold text-gray-900">{{ getTypeCount('ACCOUNT_TYPE') }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <BanknotesIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Currencies</p>
              <p class="text-2xl font-bold text-gray-900">{{ getTypeCount('CURRENCY') }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <CurrencyDollarIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Reference Data Table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
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
                  placeholder="Search reference data..."
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
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('type')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Type</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('code')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Code</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('description')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Description</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Usage</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
            <tr v-if="loading">
              <td colspan="7" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading reference data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedData.length === 0">
              <td colspan="7" class="p-12 text-center text-gray-500">
                <QueueListIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm || selectedType ? 'No data found' : 'No reference data yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm || selectedType
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first reference data entry to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="item in paginatedData"
              :key="item.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(item.id)"
                  @change="handleSelectItem(item.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ item.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <span :class="getTypeIcon(item.type)" class="w-4 h-4"></span>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="getTypeColor(item.type)"
                  >
                    {{ formatTypeName(item.type) }}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
                  >
                    <span class="text-white text-sm font-semibold">
                      {{ item.code.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.code }}</p>
                    <p class="text-xs text-gray-500">Reference Code</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <p class="text-sm text-gray-900">{{ item.description }}</p>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-1">
                  <span class="text-xs text-gray-500">Used in:</span>
                  <span class="text-xs font-medium text-blue-600">{{ getUsageInfo(item) }}</span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(item)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Reference Data"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewItemDetails(item)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicateItem(item)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Duplicate Entry"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteItem(item)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Reference Data"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredData.length }} entries
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
              {{ selectedItems.size }} item{{ selectedItems.size !== 1 ? 's' : '' }} selected
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
              {{ isEditing ? 'Edit Reference Data' : 'Create New Reference Data' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveItem" class="p-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Reference Data Information -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <QueueListIcon class="w-5 h-5 mr-2" />
                  Reference Data Information
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                <select
                  v-model="form.type"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Data Type</option>
                  <option value="ACCOUNT_TYPE">Account Type</option>
                  <option value="ACCOUNT_CODES">Account Codes</option>
                  <option value="ITEM_CATEGORY">Item Category</option>
                  <option value="CURRENCY">Currency</option>
                  <option value="COUNTRY">Country</option>
                  <option value="LANGUAGE">Language</option>
                  <option value="STATUS">Status</option>
                  <option value="PRIORITY">Priority</option>
                  <option value="CATEGORY">Category</option>
                  <option value="DEPARTMENT">Department</option>
                  <option value="ROLE_TYPE">Role Type</option>
                  <option value="PAYMENT_METHOD">Payment Method</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Code *</label>
                <input
                  v-model="form.code"
                  type="text"
                  required
                  maxlength="100"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter reference code (e.g., USD, ASSET, etc.)"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Unique identifier for this reference data entry
                </p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  required
                  maxlength="100"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter detailed description"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">
                  Clear description of what this reference data represents
                </p>
              </div>

              <!-- Preview Section -->
              <div v-if="form.type && form.code" class="bg-gray-50 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-gray-700 mb-2">Preview</h5>
                <div class="flex items-center space-x-2">
                  <span :class="getTypeIcon(form.type)" class="w-4 h-4"></span>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="getTypeColor(form.type)"
                  >
                    {{ formatTypeName(form.type) }}
                  </span>
                  <span class="text-sm font-medium">{{ form.code }}</span>
                  <span class="text-sm text-gray-600">- {{ form.description }}</span>
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
                  {{ isEditing ? 'Update Reference Data' : 'Create Reference Data' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Reference Data</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete the reference data "{{ itemToDelete?.code }}" ({{ itemToDelete?.description }})?
              <span class="text-red-600 font-medium">
                This may affect other parts of the system that use this reference data.
              </span>
              This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3">
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
  QueueListIcon,
  TagIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://localhost:3000'

// Reactive data
const commonData = ref([])
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
const selectedType = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  code: '',
  description: '',
  type: '',
})

// API Functions
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error('API call failed:', err)
    throw err
  }
}

const fetchCommonData = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/common')
    commonData.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch reference data', err.message)
    error.value = `Failed to fetch reference data: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createItem = async (itemData) => {
  submitting.value = true
  try {
    const newItem = await apiCall('/common', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
    commonData.value.push(newItem)
    swalAlert.value?.showSuccess('Reference data created successfully')
    return newItem
  } catch (err) {
    swalAlert.value?.showError('Failed to create reference data', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateItem = async (id, itemData) => {
  submitting.value = true
  try {
    const updatedItem = await apiCall(`/common/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    })
    const index = commonData.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      commonData.value[index] = updatedItem
    }
    swalAlert.value?.showSuccess('Reference data updated successfully')
    return updatedItem
  } catch (err) {
    swalAlert.value?.showError('Failed to update reference data', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteItemApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/common/${id}`, {
      method: 'DELETE',
    })
    commonData.value = commonData.value.filter((item) => item.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Reference data deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete reference data', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const availableTypes = computed(() => {
  const types = [...new Set(commonData.value.map(item => item.type))].filter(Boolean)
  return types.sort()
})

const filteredData = computed(() => {
  let filtered = commonData.value.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesType = selectedType.value === '' || item.type === selectedType.value

    return matchesSearch && matchesType
  })

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

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredData.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredData.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredData.value.length)
})

// Utility methods
const getTypeColor = (type) => {
  const colorMap = {
    'ACCOUNT_TYPE': 'bg-blue-100 text-blue-800',
    'CURRENCY': 'bg-green-100 text-green-800',
    'COUNTRY': 'bg-purple-100 text-purple-800',
    'LANGUAGE': 'bg-indigo-100 text-indigo-800',
    'STATUS': 'bg-yellow-100 text-yellow-800',
    'PRIORITY': 'bg-red-100 text-red-800',
    'CATEGORY': 'bg-pink-100 text-pink-800',
    'DEPARTMENT': 'bg-orange-100 text-orange-800',
    'ROLE_TYPE': 'bg-teal-100 text-teal-800',
    'PAYMENT_METHOD': 'bg-cyan-100 text-cyan-800',
  }
  return colorMap[type] || 'bg-gray-100 text-gray-800'
}

const getTypeIcon = (type) => {
  const iconMap = {
    'ACCOUNT_TYPE': 'w-4 h-4 text-blue-600',
    'CURRENCY': 'w-4 h-4 text-green-600',
    'COUNTRY': 'w-4 h-4 text-purple-600',
    'LANGUAGE': 'w-4 h-4 text-indigo-600',
    'STATUS': 'w-4 h-4 text-yellow-600',
    'PRIORITY': 'w-4 h-4 text-red-600',
    'CATEGORY': 'w-4 h-4 text-pink-600',
    'DEPARTMENT': 'w-4 h-4 text-orange-600',
    'ROLE_TYPE': 'w-4 h-4 text-teal-600',
    'PAYMENT_METHOD': 'w-4 h-4 text-cyan-600',
  }
  return iconMap[type] || 'w-4 h-4 text-gray-600'
}

const formatTypeName = (type) => {
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

const getTypeCount = (type) => {
  return commonData.value.filter(item => item.type === type).length
}

const getUsageInfo = (item) => {
  // This would typically query related entities to see where this reference data is used
  // For now, return placeholder text based on type
  const usageMap = {
    'ACCOUNT_TYPE': 'Accounts',
    'ACCOUNT_CODES': 'Accounts Codes',
    'CURRENCY': 'Transactions',
    'COUNTRY': 'Users, Addresses',
    'LANGUAGE': 'User Preferences',
    'STATUS': 'Multiple Entities',
    'PRIORITY': 'Tasks, Issues',
    'CATEGORY': 'Classification',
    'DEPARTMENT': 'Users, Structure',
    'ROLE_TYPE': 'User Roles',
    'PAYMENT_METHOD': 'Transactions',
  }
  return usageMap[item.type] || 'Various'
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedData.value.map((item) => item.id))
    selectAll.value = true
  }
}

const handleSelectItem = (itemId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(itemId)
  } else {
    newSelected.delete(itemId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedData.value.length && paginatedData.value.length > 0
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
    code: '',
    description: '',
    type: '',
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  form.value = {
    id: item.id,
    code: item.code,
    description: item.description,
    type: item.type,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    code: '',
    description: '',
    type: '',
  }
  error.value = ''
}

const saveItem = async () => {
  try {
    const itemData = {
      code: form.value.code.trim().toUpperCase(),
      description: form.value.description.trim(),
      type: form.value.type,
    }

    if (isEditing.value) {
      await updateItem(form.value.id, itemData)
    } else {
      await createItem(itemData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save reference data:', err)
  }
}

const duplicateItem = (item) => {
  isEditing.value = false
  form.value = {
    id: null,
    code: `${item.code}_COPY`,
    description: `Copy of ${item.description}`,
    type: item.type,
  }
  showModal.value = true
}

const deleteItem = (item) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (itemToDelete.value) {
    try {
      await deleteItemApi(itemToDelete.value.id)
      showDeleteModal.value = false
      itemToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteItemApi
      console.error('Failed to delete reference data:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} reference data item${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteItemApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected reference data deleted successfully')
    } catch (err) {
      console.error('Failed to delete some reference data:', err)
      swalAlert.value?.showError('Failed to delete some reference data', 'Please try again')
    }
  }
}

const viewItemDetails = (item) => {
  const usageInfo = getUsageInfo(item)
  alert(
    `Reference Data Details:\nType: ${formatTypeName(item.type)}\nCode: ${item.code}\nDescription: ${item.description}\nID: #${item.id}\nUsed In: ${usageInfo}`
  )
}

// Other actions
const refreshCommon = async () => {
  await fetchCommonData()
}

// Lifecycle
onMounted(async () => {
  await fetchCommonData()
})
</script>
