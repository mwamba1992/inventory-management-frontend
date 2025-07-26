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
        <span class="text-gray-700 font-medium">Expenses</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Expense Management
            </h1>
            <p class="text-gray-600 mt-2">Track and manage company expenses</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshExpenses"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="exportExpenses"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Expense
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
              <p class="text-sm font-medium text-gray-600">Total Expenses</p>
              <p class="text-2xl font-bold text-gray-900">{{ expenses.length }}</p>
            </div>
            <div class="p-3 bg-red-100 rounded-xl">
              <CreditCardIcon class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Amount</p>
              <p class="text-2xl font-bold text-gray-900">TZS{{ totalAmount.toLocaleString() }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">This Month</p>
              <p class="text-2xl font-bold text-gray-900">TZS{{ thisMonthAmount.toLocaleString() }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <CalendarIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Categories</p>
              <p class="text-2xl font-bold text-gray-900">{{ uniqueCategories }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <TagIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="filterCategory"
                @change="currentPage = 1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                v-model="filterDateFrom"
                @change="currentPage = 1"
                type="date"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                v-model="filterDateTo"
                @change="currentPage = 1"
                type="date"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
              <select
                v-model="filterAmountRange"
                @change="currentPage = 1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Amounts</option>
                <option value="0-100">TZS0 - TZS100</option>
                <option value="100-500">TZS100 - TZS500</option>
                <option value="500-1000">TZS500 - TZS1,000</option>
                <option value="1000+">TZS1,000+</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Expenses Table -->
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
                  placeholder="Search expenses..."
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
                @click="sortBy('title')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Title</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('amount')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Amount</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Category</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Date</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Created By</span>
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
                  <span class="text-gray-500">Loading expenses...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="displayExpenses.length === 0">
              <td colspan="8" class="p-12 text-center text-gray-500">
                <CreditCardIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm || hasActiveFilters ? 'No expenses found' : 'No expenses yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm || hasActiveFilters
                      ? 'Try adjusting your search criteria or filters'
                      : 'Create your first expense to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="expense in displayExpenses"
              :key="expense.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(expense.id)"
                  @change="handleSelectItem(expense.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ expense.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center"
                  >
                    <CreditCardIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ expense.title }}</p>
                    <p class="text-xs text-gray-500" v-if="expense.description">
                      {{ expense.description.substring(0, 50) }}{{ expense.description.length > 50 ? '...' : '' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span class="text-sm font-bold text-gray-900">TZS{{ parseFloat(expense.amount).toLocaleString() }}</span>
              </td>
              <td class="p-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getCategoryColor(expense.category)"
                >
                  {{ expense.category }}
                </span>
              </td>
              <td class="p-4">
                <span class="text-sm text-gray-900">{{ formatDate(expense.expenseDate) }}</span>
              </td>
              <td class="p-4">
                <span class="text-sm text-gray-900">{{ expense.createdBy }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(expense)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Expense"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewExpenseDetails(expense)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteExpense(expense)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Expense"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredExpenses.length }} entries
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
              {{ selectedItems.size }} expense{{ selectedItems.size !== 1 ? 's' : '' }} selected
              (Total: ${{ selectedTotal.toLocaleString() }})
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
              {{ isEditing ? 'Edit Expense' : 'Create New Expense' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveExpense" class="p-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Expense Information -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCardIcon class="w-5 h-5 mr-2" />
                  Expense Information
                </h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    v-model="form.title"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter expense title"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                  <input
                    v-model="form.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    v-model="form.category"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Category</option>
                    <option value="transport">Transport</option>
                    <option value="salaries">Salaries</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="utilities">Utilities</option>
                    <option value="marketing">Marketing</option>
                    <option value="meals">Meals & Entertainment</option>
                    <option value="travel">Travel</option>
                    <option value="equipment">Equipment</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="insurance">Insurance</option>
                    <option value="rent">Rent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Expense Date *</label>
                  <input
                    v-model="form.expenseDate"
                    type="date"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Created By *</label>
                <input
                  v-model="form.createdBy"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter creator name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter expense description (optional)"
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
                  {{ isEditing ? 'Update Expense' : 'Create Expense' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Expense</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete expense "{{ expenseToDelete?.title }}"
              (${{ parseFloat(expenseToDelete?.amount || 0).toLocaleString() }})?
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
  CreditCardIcon,
  CurrencyDollarIcon,
  TagIcon,
  EyeIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://localhost:3000'

// Reactive data
const expenses = ref([])
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

// Filter states
const filterCategory = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterAmountRange = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const expenseToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  title: '',
  amount: '',
  category: '',
  description: '',
  expenseDate: '',
  createdBy: '',
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

const fetchExpenses = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/expenses')
    expenses.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch expenses', err.message)
    error.value = `Failed to fetch expenses: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createExpense = async (expenseData) => {
  submitting.value = true
  try {
    const newExpense = await apiCall('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    })
    expenses.value.push(newExpense)
    swalAlert.value?.showSuccess('Expense created successfully')
    return newExpense
  } catch (err) {
    swalAlert.value?.showError('Failed to create expense', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateExpense = async (id, expenseData) => {
  submitting.value = true
  try {
    const updatedExpense = await apiCall(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    })
    const index = expenses.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      expenses.value[index] = updatedExpense
    }
    swalAlert.value?.showSuccess('Expense updated successfully')
    return updatedExpense
  } catch (err) {
    swalAlert.value?.showError('Failed to update expense', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteExpenseApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/expenses/${id}`, {
      method: 'DELETE',
    })
    expenses.value = expenses.value.filter((e) => e.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Expense deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete expense', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredExpenses = computed(() => {
  let filtered = expenses.value.filter(
    (expense) =>
      expense.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      expense.createdBy.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm.value.toLowerCase()))
  )

  // Apply filters
  if (filterCategory.value) {
    filtered = filtered.filter(expense => expense.category === filterCategory.value)
  }

  if (filterDateFrom.value) {
    filtered = filtered.filter(expense => new Date(expense.expenseDate) >= new Date(filterDateFrom.value))
  }

  if (filterDateTo.value) {
    filtered = filtered.filter(expense => new Date(expense.expenseDate) <= new Date(filterDateTo.value))
  }

  if (filterAmountRange.value) {
    const [min, max] = filterAmountRange.value.split('-').map(v => v.replace('+', ''))
    filtered = filtered.filter(expense => {
      const amount = parseFloat(expense.amount)
      if (max) {
        return amount >= parseFloat(min) && amount <= parseFloat(max)
      } else {
        return amount >= parseFloat(min)
      }
    })
  }

  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value] || ''
      let bVal = b[sortField.value] || ''

      if (sortField.value === 'amount') {
        aVal = parseFloat(aVal)
        bVal = parseFloat(bVal)
      } else if (typeof aVal === 'string') {
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

const displayExpenses = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredExpenses.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredExpenses.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredExpenses.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredExpenses.value.length)
})

const hasActiveFilters = computed(() => {
  return filterCategory.value || filterDateFrom.value || filterDateTo.value || filterAmountRange.value
})

const availableCategories = computed(() => {
  const categories = new Set()
  expenses.value.forEach(expense => {
    if (expense.category) {
      categories.add(expense.category)
    }
  })
  return Array.from(categories).sort()
})

// Stats computed properties
const totalAmount = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0)
})

const thisMonthAmount = computed(() => {
  const now = new Date()
  const thisMonth = expenses.value.filter(expense => {
    const expenseDate = new Date(expense.expenseDate)
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  })
  return thisMonth.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0)
})

const uniqueCategories = computed(() => {
  const categories = new Set()
  expenses.value.forEach(expense => {
    if (expense.category) {
      categories.add(expense.category)
    }
  })
  return categories.size
})

const selectedTotal = computed(() => {
  return Array.from(selectedItems.value).reduce((total, id) => {
    const expense = expenses.value.find(e => e.id === id)
    return total + (expense ? parseFloat(expense.amount || 0) : 0)
  }, 0)
})

// Utility methods
const getCategoryColor = (category) => {
  const colorMap = {
    'transport': 'bg-blue-100 text-blue-800',
    'salaries': 'bg-green-100 text-green-800',
    'maintenance': 'bg-orange-100 text-orange-800',
    'office_supplies': 'bg-purple-100 text-purple-800',
    'utilities': 'bg-yellow-100 text-yellow-800',
    'marketing': 'bg-pink-100 text-pink-800',
    'meals': 'bg-indigo-100 text-indigo-800',
    'travel': 'bg-teal-100 text-teal-800',
    'equipment': 'bg-gray-100 text-gray-800',
    'professional_services': 'bg-cyan-100 text-cyan-800',
    'insurance': 'bg-red-100 text-red-800',
    'rent': 'bg-emerald-100 text-emerald-800',
  }
  return colorMap[category] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(displayExpenses.value.map((expense) => expense.id))
    selectAll.value = true
  }
}

const handleSelectItem = (expenseId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(expenseId)
  } else {
    newSelected.delete(expenseId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === displayExpenses.value.length && displayExpenses.value.length > 0
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
    title: '',
    amount: '',
    category: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    createdBy: '',
  }
  showModal.value = true
}

const openEditModal = (expense) => {
  isEditing.value = true
  form.value = {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    description: expense.description || '',
    expenseDate: expense.expenseDate,
    createdBy: expense.createdBy,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    title: '',
    amount: '',
    category: '',
    description: '',
    expenseDate: '',
    createdBy: '',
  }
  error.value = ''
}

const saveExpense = async () => {
  try {
    // Prepare data for API
    const expenseData = {
      title: form.value.title,
      amount: parseFloat(form.value.amount),
      category: form.value.category,
      description: form.value.description || null,
      expenseDate: form.value.expenseDate,
      createdBy: form.value.createdBy,
    }

    if (isEditing.value) {
      await updateExpense(form.value.id, expenseData)
    } else {
      await createExpense(expenseData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save expense:', err)
  }
}

const deleteExpense = (expense) => {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (expenseToDelete.value) {
    try {
      await deleteExpenseApi(expenseToDelete.value.id)
      showDeleteModal.value = false
      expenseToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteExpenseApi
      console.error('Failed to delete expense:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} expense${
      selectedItems.value.size > 1 ? 's' : ''
    }? Total amount: $${selectedTotal.value.toLocaleString()}`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteExpenseApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected expenses deleted successfully')
    } catch (err) {
      console.error('Failed to delete some expenses:', err)
      swalAlert.value?.showError('Failed to delete some expenses', 'Please try again')
    }
  }
}

const viewExpenseDetails = (expense) => {
  const formattedAmount = parseFloat(expense.amount).toLocaleString()
  const formattedDate = formatDate(expense.expenseDate)

  alert(
    `Expense Details:\nTitle: ${expense.title}\nID: #${expense.id}\nAmount: $${formattedAmount}\nCategory: ${expense.category}\nDate: ${formattedDate}\nCreated By: ${expense.createdBy}\nDescription: ${expense.description || 'No description'}`
  )
}

const exportExpenses = () => {
  // Create CSV content
  const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Created By', 'Description']
  const csvContent = [
    headers.join(','),
    ...filteredExpenses.value.map(expense => [
      expense.id,
      `"${expense.title}"`,
      expense.amount,
      expense.category,
      expense.expenseDate,
      `"${expense.createdBy}"`,
      `"${expense.description || ''}"`
    ].join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Other actions
const refreshExpenses = async () => {
  await fetchExpenses()
}

// Lifecycle
onMounted(async () => {
  await fetchExpenses()
})
</script>
