<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Finance</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Accounts</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Account Management
            </h1>
            <p class="text-gray-600 mt-2">Manage chart of accounts and account hierarchy</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshAccounts"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="toggleHierarchicalView"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Bars3Icon v-if="hierarchicalView" class="w-4 h-4 mr-2" />
              <QueueListIcon v-else class="w-4 h-4 mr-2" />
              {{ hierarchicalView ? 'List View' : 'Tree View' }}
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Account
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
              <p class="text-sm font-medium text-gray-600">Total Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ accounts.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <BanknotesIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Parent Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ parentAccounts }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <FolderIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Sub Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ subAccounts }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <FolderOpenIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Account Types</p>
              <p class="text-2xl font-bold text-gray-900">{{ uniqueTypes }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <TagIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Accounts Table -->
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
                  placeholder="Search accounts..."
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
                  <span class="text-sm font-semibold text-gray-900">Account</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Code</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Type</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Parent Account</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Sub Accounts</span>
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
                  <span class="text-gray-500">Loading accounts...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="displayAccounts.length === 0">
              <td colspan="8" class="p-12 text-center text-gray-500">
                <BanknotesIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm ? 'No accounts found' : 'No accounts yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Create your first account to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="account in displayAccounts"
              :key="account.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
              :class="{ 'bg-blue-50/30': account.level && account.level > 0 }"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(account.id)"
                  @change="handleSelectItem(account.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ account.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    v-if="hierarchicalView && account.level"
                    :style="{ marginLeft: `${account.level * 20}px` }"
                    class="flex items-center space-x-2"
                  >
                    <ChevronRightIcon
                      class="w-4 h-4 text-gray-400"
                      :class="{ 'rotate-90': account.expanded }"
                      v-if="account.childAccounts && account.childAccounts.length > 0"
                      @click="toggleAccountExpansion(account.id)"
                    />
                    <div class="w-4 h-4" v-else></div>
                  </div>
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"
                  >
                    <BanknotesIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ account.name }}</p>
                    <p class="text-xs text-gray-500">Account #{{ account.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ account.code?.name || 'No Code' }}
                </span>
              </td>
              <td class="p-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getTypeColor(account.type?.name)"
                >
                  {{ account.type?.name || 'No Type' }}
                </span>
              </td>
              <td class="p-4">
                <div v-if="account.parentAccount">
                  <p class="text-sm text-gray-900">{{ account.parentAccount.name }}</p>
                  <p class="text-xs text-gray-500">#{{ account.parentAccount.id }}</p>
                </div>
                <span v-else class="text-xs text-gray-400">Root Account</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900">
                    {{ account.childAccounts?.length || 0 }}
                  </span>
                  <button
                    v-if="account.childAccounts && account.childAccounts.length > 0"
                    @click="viewSubAccounts(account)"
                    class="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(account)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Account"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewAccountDetails(account)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openAddModal(account)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Add Sub Account"
                  >
                    <PlusCircleIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteAccount(account)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Account"
                    :disabled="account.childAccounts && account.childAccounts.length > 0"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredAccounts.length }} entries
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
              {{ selectedItems.size }} account{{ selectedItems.size !== 1 ? 's' : '' }} selected
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
              {{ isEditing ? 'Edit Account' : 'Create New Account' }}
              {{ selectedParentAccount ? `(Sub-account of ${selectedParentAccount.name})` : '' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveAccount" class="p-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Account Information -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BanknotesIcon class="w-5 h-5 mr-2" />
                  Account Information
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Account Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter account name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Account Code</label>
                <select
                  v-model="form.codeId"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Account Code</option>
                  <option
                    v-for="code in availableCodes"
                    :key="code.id"
                    :value="code.id"
                  >
                    {{ code.name }} - {{ code.description || code.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Account Type *</label>
                <select
                  v-model="form.typeId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Account Type</option>
                  <option
                    v-for="type in availableTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }} - {{ type.description || type.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Parent Account</label>
                <select
                  v-model="form.parentAccountId"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Root Account (No Parent)</option>
                  <option
                    v-for="account in availableParentAccounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    {{ getAccountHierarchyName(account) }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Leave empty to create a root account
                </p>
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
                  {{ isEditing ? 'Update Account' : 'Create Account' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Account</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete account "{{ accountToDelete?.name }}"?
              <span v-if="accountToDelete?.childAccounts?.length > 0" class="text-red-600 font-medium">
                This account has {{ accountToDelete.childAccounts.length }} sub-account(s) which will also be affected.
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
                :disabled="submitting || (accountToDelete?.childAccounts?.length > 0)"
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
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  FolderIcon,
  FolderOpenIcon,
  TagIcon,
  EyeIcon,
  Bars3Icon,
  QueueListIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://84.247.178.93:3000'

// Reactive data
const accounts = ref([])
const availableCodes = ref([])
const availableTypes = ref([])
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
const hierarchicalView = ref(false)
const expandedAccounts = ref(new Set())

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const accountToDelete = ref(null)
const selectedParentAccount = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  codeId: '',
  typeId: '',
  parentAccountId: '',
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

const fetchAccounts = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/account')
    accounts.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch accounts', err.message)
    error.value = `Failed to fetch accounts: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fetchCodes = async () => {
  try {
    const data = await apiCall('/common/type/ACCOUNT_CODES')
    availableCodes.value = data
  } catch (err) {
    console.error('Failed to fetch codes:', err)
    // Fallback codes if API fails
    availableCodes.value = [
      { id: 1, name: '1000', description: 'Assets' },
      { id: 2, name: '2000', description: 'Liabilities' },
      { id: 3, name: '3000', description: 'Equity' },
      { id: 4, name: '4000', description: 'Revenue' },
      { id: 5, name: '5000', description: 'Expenses' }
    ]
  }
}

const fetchTypes = async () => {
  try {
    const data = await apiCall('/common/type/ACCOUNT_TYPE')
    availableTypes.value = data
  } catch (err) {
    console.error('Failed to fetch types:', err)
    // Fallback types if API fails
    availableTypes.value = [
      { id: 1, name: 'Asset', description: 'Asset Account' },
      { id: 2, name: 'Liability', description: 'Liability Account' },
      { id: 3, name: 'Equity', description: 'Equity Account' },
      { id: 4, name: 'Revenue', description: 'Revenue Account' },
      { id: 5, name: 'Expense', description: 'Expense.vue Account' }
    ]
  }
}

const createAccount = async (accountData) => {
  submitting.value = true
  try {
    const newAccount = await apiCall('/account', {
      method: 'POST',
      body: JSON.stringify(accountData),
    })
    accounts.value.push(newAccount)
    swalAlert.value?.showSuccess('Account created successfully')
    return newAccount
  } catch (err) {
    swalAlert.value?.showError('Failed to create account', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateAccount = async (id, accountData) => {
  submitting.value = true
  try {
    const updatedAccount = await apiCall(`/account/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    })
    const index = accounts.value.findIndex((a) => a.id === id)
    if (index !== -1) {
      accounts.value[index] = updatedAccount
    }
    swalAlert.value?.showSuccess('Account updated successfully')
    return updatedAccount
  } catch (err) {
    swalAlert.value?.showError('Failed to update account', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteAccountApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/account/${id}`, {
      method: 'DELETE',
    })
    accounts.value = accounts.value.filter((a) => a.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Account deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete account', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredAccounts = computed(() => {
  let filtered = accounts.value.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (account.code?.name && account.code.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (account.type?.name && account.type.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (account.parentAccount?.name && account.parentAccount.name.toLowerCase().includes(searchTerm.value.toLowerCase()))
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

const hierarchicalAccounts = computed(() => {
  if (!hierarchicalView.value) return filteredAccounts.value

  // Build hierarchy
  const accountMap = new Map()
  const rootAccounts = []

  filteredAccounts.value.forEach(account => {
    accountMap.set(account.id, { ...account, level: 0, expanded: expandedAccounts.value.has(account.id) })
  })

  filteredAccounts.value.forEach(account => {
    if (account.parentAccount) {
      const parent = accountMap.get(account.parentAccount.id)
      const child = accountMap.get(account.id)
      if (parent && child) {
        child.level = (parent.level || 0) + 1
        if (!parent.children) parent.children = []
        parent.children.push(child)
      }
    } else {
      rootAccounts.push(accountMap.get(account.id))
    }
  })

  // Flatten hierarchy respecting expansion state
  const flattenHierarchy = (accounts, level = 0) => {
    const result = []
    accounts.forEach(account => {
      if (account) {
        account.level = level
        result.push(account)
        if (account.children && account.expanded) {
          result.push(...flattenHierarchy(account.children, level + 1))
        }
      }
    })
    return result
  }

  return flattenHierarchy(rootAccounts)
})

const displayAccounts = computed(() => {
  const accountsToShow = hierarchicalView.value ? hierarchicalAccounts.value : filteredAccounts.value
  const start = (currentPage.value - 1) * entriesPerPage.value
  return accountsToShow.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  const accountsToCount = hierarchicalView.value ? hierarchicalAccounts.value : filteredAccounts.value
  return Math.ceil(accountsToCount.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  const accountsToCount = hierarchicalView.value ? hierarchicalAccounts.value : filteredAccounts.value
  return accountsToCount.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  const accountsToCount = hierarchicalView.value ? hierarchicalAccounts.value : filteredAccounts.value
  return Math.min(currentPage.value * entriesPerPage.value, accountsToCount.length)
})

const availableParentAccounts = computed(() => {
  return accounts.value.filter(account => {
    // Don't allow an account to be its own parent
    if (isEditing.value && account.id === form.value.id) return false

    // Don't allow circular references (prevent selecting a child as parent)
    const isDescendant = (potentialParent, targetId) => {
      if (!potentialParent.childAccounts) return false
      return potentialParent.childAccounts.some(child =>
        child.id === targetId || isDescendant(child, targetId)
      )
    }

    if (isEditing.value) {
      return !isDescendant(account, form.value.id)
    }

    return true
  })
})

// Stats computed properties
const parentAccounts = computed(() => {
  return accounts.value.filter((a) => !a.parentAccount).length
})

const subAccounts = computed(() => {
  return accounts.value.filter((a) => a.parentAccount).length
})

const uniqueTypes = computed(() => {
  const types = new Set()
  accounts.value.forEach(account => {
    if (account.type?.name) {
      types.add(account.type.name)
    }
  })
  return types.size
})

// Utility methods
const getTypeColor = (typeName) => {
  const colorMap = {
    'Asset': 'bg-green-100 text-green-800',
    'Liability': 'bg-red-100 text-red-800',
    'Equity': 'bg-blue-100 text-blue-800',
    'Revenue': 'bg-purple-100 text-purple-800',
    'Expense': 'bg-orange-100 text-orange-800',
  }
  return colorMap[typeName] || 'bg-gray-100 text-gray-800'
}

const getAccountHierarchyName = (account) => {
  const parents = []
  let current = account

  while (current?.parentAccount) {
    parents.unshift(current.parentAccount.name)
    current = accounts.value.find(a => a.id === current.parentAccount.id)
  }

  return parents.length > 0 ? `${parents.join(' > ')} > ${account.name}` : account.name
}

const toggleAccountExpansion = (accountId) => {
  if (expandedAccounts.value.has(accountId)) {
    expandedAccounts.value.delete(accountId)
  } else {
    expandedAccounts.value.add(accountId)
  }
}

const toggleHierarchicalView = () => {
  hierarchicalView.value = !hierarchicalView.value
  currentPage.value = 1
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(displayAccounts.value.map((account) => account.id))
    selectAll.value = true
  }
}

const handleSelectItem = (accountId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(accountId)
  } else {
    newSelected.delete(accountId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === displayAccounts.value.length && displayAccounts.value.length > 0
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
const openAddModal = (parentAccount = null) => {
  isEditing.value = false
  selectedParentAccount.value = parentAccount
  form.value = {
    id: null,
    name: '',
    codeId: '',
    typeId: '',
    parentAccountId: parentAccount?.id || '',
  }
  showModal.value = true
}

const openEditModal = (account) => {
  isEditing.value = true
  selectedParentAccount.value = null
  form.value = {
    id: account.id,
    name: account.name,
    codeId: account.code?.id || '',
    typeId: account.type?.id || '',
    parentAccountId: account.parentAccount?.id || '',
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedParentAccount.value = null
  form.value = {
    id: null,
    name: '',
    codeId: '',
    typeId: '',
    parentAccountId: '',
  }
  error.value = ''
}

const saveAccount = async () => {
  try {
    // Prepare data for API
    const accountData = {
      name: form.value.name,
      codeId: form.value.codeId || null,
      typeId: form.value.typeId,
      parentAccountId: form.value.parentAccountId || null,
    }

    if (isEditing.value) {
      await updateAccount(form.value.id, accountData)
    } else {
      await createAccount(accountData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save account:', err)
  }
}

const deleteAccount = (account) => {
  accountToDelete.value = account
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (accountToDelete.value) {
    try {
      await deleteAccountApi(accountToDelete.value.id)
      showDeleteModal.value = false
      accountToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteAccountApi
      console.error('Failed to delete account:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} account${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteAccountApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected accounts deleted successfully')
    } catch (err) {
      console.error('Failed to delete some accounts:', err)
      swalAlert.value?.showError('Failed to delete some accounts', 'Please try again')
    }
  }
}

const viewAccountDetails = (account) => {
  const parentInfo = account.parentAccount ? `${account.parentAccount.name} (#${account.parentAccount.id})` : 'Root Account'
  const childCount = account.childAccounts?.length || 0
  const childInfo = childCount > 0 ? `${childCount} sub-account(s)` : 'No sub-accounts'

  alert(
    `Account Details:\nName: ${account.name}\nID: #${account.id}\nCode: ${account.code?.name || 'No Code'}\nType: ${account.type?.name || 'No Type'}\nParent: ${parentInfo}\nChildren: ${childInfo}`
  )
}

const viewSubAccounts = (account) => {
  if (!account.childAccounts || account.childAccounts.length === 0) return

  const subAccounts = account.childAccounts.map(sub => `• ${sub.name} (#${sub.id})`).join('\n')
  alert(`Sub-accounts of "${account.name}":\n\n${subAccounts}`)
}

// Other actions
const refreshAccounts = async () => {
  await fetchAccounts()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchCodes(), fetchTypes()])
})
</script>
