<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Settings</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Business Management</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Business Management
            </h1>
            <p class="text-gray-600 mt-2">Manage your business profiles and information</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshBusinesses"
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
              Add Business
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
              <p class="text-sm font-medium text-gray-600">Total Businesses</p>
              <p class="text-2xl font-bold text-gray-900">{{ businesses.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <BuildingOfficeIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">With Website</p>
              <p class="text-2xl font-bold text-gray-900">{{ businessesWithWebsite }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <GlobeAltIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">With Email</p>
              <p class="text-2xl font-bold text-gray-900">{{ businessesWithEmail }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <EnvelopeIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalItems }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <ArchiveBoxIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Business Table -->
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
                  placeholder="Search businesses..."
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
                  @click="sortBy('name')"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-gray-900">Business Name</span>
                    <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th class="p-4 text-left">
                  <span class="text-sm font-semibold text-gray-900">Contact Info</span>
                </th>
                <th class="p-4 text-left">
                  <span class="text-sm font-semibold text-gray-900">Website</span>
                </th>
                <th class="p-4 text-left">
                  <span class="text-sm font-semibold text-gray-900">Items Count</span>
                </th>
                <th class="p-4 text-left">
                  <span class="text-sm font-semibold text-gray-900">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
              <tr v-if="loading">
                <td colspan="6" class="p-12 text-center">
                  <div class="flex items-center justify-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="text-gray-500">Loading businesses...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="paginatedBusinesses.length === 0">
                <td colspan="6" class="p-12 text-center text-gray-500">
                  <BuildingOfficeIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p class="text-lg font-medium">
                    {{ searchTerm ? 'No businesses found' : 'No businesses yet' }}
                  </p>
                  <p class="text-sm">
                    {{
                      searchTerm
                        ? 'Try adjusting your search criteria'
                        : 'Create your first business to get started'
                    }}
                  </p>
                </td>
              </tr>
              <tr
                v-else
                v-for="business in paginatedBusinesses"
                :key="business.id"
                class="hover:bg-gray-50/50 transition-colors duration-200"
              >
                <td class="p-4">
                  <input
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    :checked="selectedItems.has(business.id)"
                    @change="handleSelectItem(business.id, $event.target.checked)"
                  />
                </td>
                <td class="p-4">
                  <span class="text-sm font-medium text-gray-900">#{{ business.id }}</span>
                </td>
                <td class="p-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                    >
                      <span class="text-white text-sm font-semibold">{{
                        business.name.charAt(0).toUpperCase()
                      }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ business.name }}</p>
                      <p class="text-xs text-gray-500 max-w-xs truncate">
                        {{ business.description || 'No description' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="space-y-1">
                    <p v-if="business.email" class="text-xs text-gray-600 flex items-center">
                      <EnvelopeIcon class="w-3 h-3 mr-1" />
                      {{ business.email }}
                    </p>
                    <p v-if="business.phone" class="text-xs text-gray-600 flex items-center">
                      <PhoneIcon class="w-3 h-3 mr-1" />
                      {{ business.phone }}
                    </p>
                    <p v-if="!business.email && !business.phone" class="text-xs text-gray-400">
                      No contact info
                    </p>
                  </div>
                </td>
                <td class="p-4">
                  <a
                    v-if="business.website"
                    :href="business.website"
                    target="_blank"
                    class="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <GlobeAltIcon class="w-3 h-3 mr-1" />
                    Visit Website
                  </a>
                  <span v-else class="text-xs text-gray-400">No website</span>
                </td>
                <td class="p-4">
                  <span class="text-sm font-medium text-gray-900">{{
                    business.items?.length || 0
                  }}</span>
                </td>
                <td class="p-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="openEditModal(business)"
                      class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit Business"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="viewBusinessDetails(business)"
                      class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteBusiness(business)"
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Business"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredBusinesses.length }} entries
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
              {{ selectedItems.size }} business{{ selectedItems.size !== 1 ? 'es' : '' }} selected
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
              {{ isEditing ? 'Edit Business' : 'Create New Business' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveBusiness" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Business Name *</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter business name"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe your business..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div class="relative">
                  <EnvelopeIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.email"
                    type="email"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="business@example.com"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <div class="relative">
                  <PhoneIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                <div class="relative">
                  <GlobeAltIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.website"
                    type="url"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://www.example.com"
                  />
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
                  {{ isEditing ? 'Update Business' : 'Create Business' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Business</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete "{{ businessToDelete?.name }}"? This action cannot be
              undone and will also delete all associated items.
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
  ArrowsUpDownIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArchiveBoxIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://localhost:3000'

// Reactive data
const businesses = ref([])
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
const businessToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  description: '',
  phone: '',
  email: '',
  website: '',
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

const fetchBusinesses = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/business')
    businesses.value = data
  } catch (err) {
    swalAlert.value.showError('Failed to fetch businesses', err.message)
    error.value = `Failed to fetch businesses: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createBusiness = async (businessData) => {
  submitting.value = true
  try {
    const newBusiness = await apiCall('/business', {
      method: 'POST',
      body: JSON.stringify(businessData),
    })
    businesses.value.push(newBusiness)
    swalAlert.value.showSuccess('Business created successfully')
    return newBusiness
  } catch (err) {
    swalAlert.value.showError('Failed to create business', err.message)
  } finally {
    submitting.value = false
  }
}

const updateBusiness = async (id, businessData) => {
  submitting.value = true
  try {
    const updatedBusiness = await apiCall(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(businessData),
    })
    const index = businesses.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      businesses.value[index] = updatedBusiness
    }
    return updatedBusiness
  } catch (err) {
    error.value = `Failed to update business: ${err.message}`
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteBusinessApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/business/${id}`, {
      method: 'DELETE',
    })
    businesses.value = businesses.value.filter((b) => b.id !== id)
    selectedItems.value.delete(id)
  } catch (err) {
    error.value = `Failed to delete business: ${err.message}`
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredBusinesses = computed(() => {
  let filtered = businesses.value.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (business.description &&
        business.description.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (business.email && business.email.toLowerCase().includes(searchTerm.value.toLowerCase()))
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

const paginatedBusinesses = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredBusinesses.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredBusinesses.value.length / entriesPerPage.value))

const startIndex = computed(() =>
  filteredBusinesses.value.length === 0 ? 0 : (currentPage.value - 1) * entriesPerPage.value + 1
)

const endIndex = computed(() =>
  Math.min(currentPage.value * entriesPerPage.value, filteredBusinesses.value.length)
)

const businessesWithWebsite = computed(() => {
  return businesses.value.filter((b) => b.website && b.website.trim()).length
})

const businessesWithEmail = computed(() => {
  return businesses.value.filter((b) => b.email && b.email.trim()).length
})

const totalItems = computed(() => {
  return businesses.value.reduce((total, business) => {
    return total + (business.items?.length || 0)
  }, 0)
})

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedBusinesses.value.map((business) => business.id))
    selectAll.value = true
  }
}

const handleSelectItem = (businessId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(businessId)
  } else {
    newSelected.delete(businessId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedBusinesses.value.length && paginatedBusinesses.value.length > 0
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
    description: '',
    phone: '',
    email: '',
    website: '',
  }
  showModal.value = true
}

const openEditModal = (business) => {
  isEditing.value = true
  form.value = { ...business }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
  }
  error.value = ''
}

const saveBusiness = async () => {
  try {
    // Prepare data for API
    const businessData = {
      name: form.value.name,
      description: form.value.description || null,
      phone: form.value.phone || null,
      email: form.value.email || null,
      website: form.value.website || null,
    }

    if (isEditing.value) {
      await updateBusiness(form.value.id, businessData)
    } else {
      await createBusiness(businessData)
    }

    closeModal()
  } catch (err) {
    // Error is already set in the API functions
    console.error('Failed to save business:', err)
  }
}

const deleteBusiness = (business) => {
  businessToDelete.value = business
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (businessToDelete.value) {
    try {
      await deleteBusinessApi(businessToDelete.value.id)
      showDeleteModal.value = false
      businessToDelete.value = null
    } catch (err) {
      // Error is already set in deleteBusinessApi
      console.error('Failed to delete business:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} business${
      selectedItems.value.size > 1 ? 'es' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteBusinessApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
    } catch (err) {
      console.error('Failed to delete some businesses:', err)
    }
  }
}

const viewBusinessDetails = (business) => {
  // You can implement a detailed view modal or navigate to a detail page
  console.log('Viewing business details:', business)
  alert(
    `Business Details:\nName: ${business.name}\nDescription: ${
      business.description || 'N/A'
    }\nEmail: ${business.email || 'N/A'}\nPhone: ${business.phone || 'N/A'}\nWebsite: ${
      business.website || 'N/A'
    }\nItems: ${business.items?.length || 0}`
  )
}

const refreshBusinesses = async () => {
  await fetchBusinesses()
}

// Lifecycle
onMounted(() => {
  fetchBusinesses()
})
</script>
