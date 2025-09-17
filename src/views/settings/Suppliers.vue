<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
    <div class="max-w-full mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Inventory</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Item Suppliers</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Item Suppliers
            </h1>
            <p class="text-gray-600 mt-2">Manage your supplier network and contact information</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshSuppliers"
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
              Add Supplier
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
              <p class="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p class="text-2xl font-bold text-gray-900">{{ suppliers.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <TruckIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">With Email</p>
              <p class="text-2xl font-bold text-gray-900">{{ suppliersWithEmail }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <EnvelopeIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">With Phone</p>
              <p class="text-2xl font-bold text-gray-900">{{ suppliersWithPhone }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <PhoneIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Unique Locations</p>
              <p class="text-2xl font-bold text-gray-900">{{ uniqueLocations }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <MapPinIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Suppliers Table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <!-- Error Display -->
        <div v-if="error" class="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm">{{ error }}</p>
          <button @click="error = ''" class="text-red-600 hover:text-red-800 text-xs mt-1 underline">
            Dismiss
          </button>
        </div>

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
                  placeholder="Search suppliers..."
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
                @click="sortBy('supplierName')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Supplier Name</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('location')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Location</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Contact Info</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Notes</span>
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
                  <span class="text-gray-500">Loading suppliers...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedSuppliers.length === 0">
              <td colspan="7" class="p-12 text-center text-gray-500">
                <TruckIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm ? 'No suppliers found' : 'No suppliers yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Create your first supplier to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="supplier in paginatedSuppliers"
              :key="supplier.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(supplier.id)"
                  @change="handleSelectItem(supplier.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ supplier.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"
                  >
                      <span class="text-white text-sm font-semibold">{{
                          supplier.supplierName.charAt(0).toUpperCase()
                        }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ supplier.supplierName }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center text-sm text-gray-900">
                  <MapPinIcon class="w-4 h-4 mr-2 text-gray-400" />
                  {{ supplier.location }}
                </div>
              </td>
              <td class="p-4">
                <div class="space-y-1">
                  <p v-if="supplier.contactEmail" class="text-xs text-gray-600 flex items-center">
                    <EnvelopeIcon class="w-3 h-3 mr-1 text-gray-400" />
                    {{ supplier.contactEmail }}
                  </p>
                  <p v-if="supplier.contactPhone" class="text-xs text-gray-600 flex items-center">
                    <PhoneIcon class="w-3 h-3 mr-1 text-gray-400" />
                    {{ supplier.contactPhone }}
                  </p>
                  <p v-if="!supplier.contactEmail && !supplier.contactPhone" class="text-xs text-gray-400">
                    No contact info
                  </p>
                </div>
              </td>
              <td class="p-4">
                <p v-if="supplier.notes" class="text-xs text-gray-600 max-w-xs truncate">
                  {{ supplier.notes }}
                </p>
                <p v-else class="text-xs text-gray-400">No notes</p>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(supplier)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Supplier"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewSupplierDetails(supplier)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteSupplier(supplier)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Supplier"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredSuppliers.length }} entries
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
              {{ selectedItems.size }} supplier{{ selectedItems.size !== 1 ? 's' : '' }} selected
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
              {{ isEditing ? 'Edit Supplier' : 'Create New Supplier' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveSupplier" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Supplier Name *</label>
                <input
                  v-model="form.supplierName"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter supplier name"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <div class="relative">
                  <MapPinIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.location"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter location (city, country)"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                <div class="relative">
                  <EnvelopeIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.contactEmail"
                    type="email"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="contact@supplier.com"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                <div class="relative">
                  <PhoneIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.contactPhone"
                    type="tel"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="4"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional notes about this supplier..."
                ></textarea>
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
                  {{ isEditing ? 'Update Supplier' : 'Create Supplier' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Supplier</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete "{{ supplierToDelete?.supplierName }}"? This action cannot be
              undone.
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
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'
import { Configs } from '@/utils/Configs'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = Configs.API_BASE_URL

// Reactive data
const suppliers = ref([])
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
const supplierToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  supplierName: '',
  location: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
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

const fetchSuppliers = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/item-suppliers')
    suppliers.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch suppliers', err.message)
    error.value = `Failed to fetch suppliers: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createSupplier = async (supplierData) => {
  submitting.value = true
  try {
    const newSupplier = await apiCall('/item-suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    })
    suppliers.value.push(newSupplier)
    swalAlert.value?.showSuccess('Supplier created successfully')
    return newSupplier
  } catch (err) {
    swalAlert.value?.showError('Failed to create supplier', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateSupplier = async (id, supplierData) => {
  submitting.value = true
  try {
    const updatedSupplier = await apiCall(`/item-suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    })
    const index = suppliers.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      suppliers.value[index] = updatedSupplier
    }
    swalAlert.value?.showSuccess('Supplier updated successfully')
    return updatedSupplier
  } catch (err) {
    swalAlert.value?.showError('Failed to update supplier', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteSupplierApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/item-suppliers/${id}`, {
      method: 'DELETE',
    })
    suppliers.value = suppliers.value.filter((s) => s.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Supplier deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete supplier', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredSuppliers = computed(() => {
  let filtered = suppliers.value.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (supplier.contactEmail && supplier.contactEmail.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (supplier.contactPhone && supplier.contactPhone.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (supplier.notes && supplier.notes.toLowerCase().includes(searchTerm.value.toLowerCase()))
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

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredSuppliers.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSuppliers.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredSuppliers.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredSuppliers.value.length)
})

// Stats computed properties
const suppliersWithEmail = computed(() => {
  return suppliers.value.filter((s) => s.contactEmail && s.contactEmail.trim()).length
})

const suppliersWithPhone = computed(() => {
  return suppliers.value.filter((s) => s.contactPhone && s.contactPhone.trim()).length
})

const uniqueLocations = computed(() => {
  const locations = new Set(suppliers.value.map((s) => s.location.toLowerCase()))
  return locations.size
})

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedSuppliers.value.map((supplier) => supplier.id))
    selectAll.value = true
  }
}

const handleSelectItem = (supplierId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(supplierId)
  } else {
    newSelected.delete(supplierId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedSuppliers.value.length && paginatedSuppliers.value.length > 0
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
    supplierName: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  }
  showModal.value = true
}

const openEditModal = (supplier) => {
  isEditing.value = true
  form.value = { ...supplier }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    supplierName: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  }
  error.value = ''
}

const saveSupplier = async () => {
  try {
    // Prepare data for API
    const supplierData = {
      supplierName: form.value.supplierName,
      location: form.value.location,
      contactEmail: form.value.contactEmail || null,
      contactPhone: form.value.contactPhone || null,
      notes: form.value.notes || null,
    }

    if (isEditing.value) {
      await updateSupplier(form.value.id, supplierData)
    } else {
      await createSupplier(supplierData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save supplier:', err)
  }
}

const deleteSupplier = (supplier) => {
  supplierToDelete.value = supplier
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (supplierToDelete.value) {
    try {
      await deleteSupplierApi(supplierToDelete.value.id)
      showDeleteModal.value = false
      supplierToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteSupplierApi
      console.error('Failed to delete supplier:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} supplier${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteSupplierApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected suppliers deleted successfully')
    } catch (err) {
      console.error('Failed to delete some suppliers:', err)
      swalAlert.value?.showError('Failed to delete some suppliers', 'Please try again')
    }
  }
}

const viewSupplierDetails = (supplier) => {
  // You can implement a detailed view modal or navigate to a detail page
  console.log('Viewing supplier details:', supplier)
  alert(
    `Supplier Details:\nName: ${supplier.supplierName}\nLocation: ${supplier.location}\nEmail: ${supplier.contactEmail || 'N/A'}\nPhone: ${supplier.contactPhone || 'N/A'}\nNotes: ${supplier.notes || 'N/A'}`
  )
}

// Other actions
const refreshSuppliers = async () => {
  await fetchSuppliers()
}

// Lifecycle
onMounted(() => {
  fetchSuppliers()
})
</script>
