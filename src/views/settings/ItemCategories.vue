<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Items</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Categories</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Category Management
            </h1>
            <p class="text-gray-600 mt-2">Organize and manage your product categories</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshCategories"
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
              Add Category
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
              <p class="text-sm font-medium text-gray-600">Total Categories</p>
              <p class="text-2xl font-bold text-gray-900">{{ categories.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <FolderIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Categories</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeCategories }}</p>
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
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalItems }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <CubeIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Parent Categories</p>
              <p class="text-2xl font-bold text-gray-900">{{ parentCategories }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <FolderOpenIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Categories Table -->
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
                  placeholder="Search categories..."
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
                  <span class="text-sm font-semibold text-gray-900">Category Name</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Description</span>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('itemCount')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900"># Items</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
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
              <td colspan="7" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading categories...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedCategories.length === 0">
              <td colspan="7" class="p-12 text-center text-gray-500">
                <FolderIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm ? 'No categories found' : 'No categories yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Create your first category to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="category in paginatedCategories"
              :key="category.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(category.id)"
                  @change="handleSelectItem(category.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ category.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center"
                  >
                      <span class="text-white text-sm font-semibold">{{
                          category.name.charAt(0).toUpperCase()
                        }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ category.name }}</p>
                    <p v-if="category.code" class="text-xs text-gray-500">
                      Code: {{ category.code }}
                    </p>
                    <p v-if="getParentCategoryName(category.parentId)" class="text-xs text-blue-600">
                      Parent: {{ getParentCategoryName(category.parentId) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <p class="text-sm text-gray-900 max-w-xs truncate">
                  {{ category.description || 'No description' }}
                </p>
              </td>
              <td class="p-4">
                <div class="flex items-center">
                  <CubeIcon class="w-4 h-4 text-gray-400 mr-1" />
                  <span class="text-sm font-medium text-gray-900">{{ category.itemCount }}</span>
                </div>
              </td>
              <td class="p-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadge(category.status)"
                  >
                    {{ category.status }}
                  </span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(category)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Category"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewCategoryDetails(category)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteCategory(category)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Category"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredCategories.length }} entries
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
              {{ selectedItems.size }} categor{{ selectedItems.size !== 1 ? 'ies' : 'y' }} selected
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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Edit Category' : 'Create New Category' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveCategory" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Category Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="e.g. ELEC, COMP, ACC"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe this category..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Parent Category</label>
                <select
                  v-model="form.parentId"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">None (Top Level)</option>
                  <option v-for="category in categories.filter(c => c.id !== form.id)" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  v-model="form.status"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
                <input
                  v-model.number="form.sortOrder"
                  type="number"
                  min="0"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter sort order"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Tax Category</label>
                <select
                  v-model="form.taxCategory"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Standard">Standard</option>
                  <option value="Reduced">Reduced</option>
                  <option value="Zero">Zero</option>
                  <option value="Exempt">Exempt</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  v-model="form.imageUrl"
                  type="url"
                  placeholder="https://example.com/category-image.jpg"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional notes about this category..."
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
                  {{ isEditing ? 'Update Category' : 'Create Category' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Category</h3>
            </div>
            <p class="text-gray-600 mb-2">
              Are you sure you want to delete "{{ categoryToDelete?.name }}"? This action cannot be
              undone.
            </p>
            <p v-if="categoryToDelete?.itemCount > 0" class="text-red-600 text-sm font-medium">
              ⚠️ This category has {{ categoryToDelete.itemCount }} items assigned to it.
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
  FolderIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  CubeIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// Reactive data
const categories = ref([
  {
    id: 1,
    name: 'Electronics',
    description: 'Electronic devices and components',
    status: 'Active',
    itemCount: 12,
    parentId: null,
    sortOrder: 1,
    code: 'ELEC',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: 'All electronic products including phones, computers, etc.'
  },
  {
    id: 2,
    name: 'Computers',
    description: 'Desktop and laptop computers',
    status: 'Active',
    itemCount: 8,
    parentId: 1,
    sortOrder: 1,
    code: 'COMP',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: 'Computer systems and related hardware'
  },
  {
    id: 3,
    name: 'Accessories',
    description: 'Various accessories and add-ons',
    status: 'Active',
    itemCount: 15,
    parentId: null,
    sortOrder: 2,
    code: 'ACC',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: 'Accessories for various product categories'
  },
  {
    id: 4,
    name: 'Software',
    description: 'Software applications and licenses',
    status: 'Active',
    itemCount: 6,
    parentId: null,
    sortOrder: 3,
    code: 'SOFT',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: 'Software products and digital licenses'
  },
  {
    id: 5,
    name: 'Mobile Phones',
    description: 'Smartphones and mobile devices',
    status: 'Active',
    itemCount: 9,
    parentId: 1,
    sortOrder: 2,
    code: 'MOBILE',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: 'Mobile phones and related devices'
  },
  {
    id: 6,
    name: 'Fitness Equipment',
    description: 'Exercise and fitness related products',
    status: 'Active',
    itemCount: 4,
    parentId: null,
    sortOrder: 4,
    code: 'FITNESS',
    taxCategory: 'Reduced',
    imageUrl: '',
    notes: 'Fitness and exercise equipment'
  },
  {
    id: 7,
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    status: 'Inactive',
    itemCount: 0,
    parentId: null,
    sortOrder: 5,
    code: 'HOME',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: 'Currently not in use'
  }
])

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
const categoryToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  description: '',
  status: 'Active',
  itemCount: 0,
  parentId: null,
  sortOrder: 0,
  code: '',
  taxCategory: 'Standard',
  imageUrl: '',
  notes: ''
})

// API Configuration
const API_BASE_URL = 'http://84.247.178.93:3000'

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

const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/item-categories')
    categories.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch categories', err.message)
    error.value = `Failed to fetch categories: ${err.message}`
    console.error('Failed to fetch categories, using demo data')
  } finally {
    loading.value = false
  }
}

const createCategory = async (categoryData) => {
  submitting.value = true
  try {
    const newCategory = await apiCall('/item-categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
    categories.value.push(newCategory)
    swalAlert.value?.showSuccess('Category created successfully')
    return newCategory
  } catch (err) {
    swalAlert.value?.showError('Failed to create category', err.message)
    // Fallback to demo functionality
    const newId = Math.max(...categories.value.map(category => category.id)) + 1
    const newCategory = { ...categoryData, id: newId }
    categories.value.push(newCategory)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateCategory = async (id, categoryData) => {
  submitting.value = true
  try {
    const updatedCategory = await apiCall(`/item-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
    swalAlert.value?.showSuccess('Category updated successfully')
    return updatedCategory
  } catch (err) {
    swalAlert.value?.showError('Failed to update category', err.message)
    // Fallback to demo functionality
    const index = categories.value.findIndex(category => category.id === id)
    if (index !== -1) {
      categories.value[index] = { ...categoryData, id }
    }
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteCategoryApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/item-categories/${id}`, {
      method: 'DELETE',
    })
    categories.value = categories.value.filter((c) => c.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Category deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete category', err.message)
    // Fallback to demo functionality
    categories.value = categories.value.filter((c) => c.id !== id)
    selectedItems.value.delete(id)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredCategories = computed(() => {
  let filtered = categories.value.filter(category =>
    category.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
    (category.code && category.code.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
    (category.notes && category.notes.toLowerCase().includes(searchTerm.value.toLowerCase()))
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

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredCategories.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCategories.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredCategories.value.length > 0 ? (currentPage.value - 1) * entriesPerPage.value + 1 : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredCategories.value.length)
})

// Stats computed properties
const activeCategories = computed(() => {
  return categories.value.filter((c) => c.status === 'Active').length
})

const totalItems = computed(() => {
  return categories.value.reduce((total, category) => total + (category.itemCount || 0), 0)
})

const parentCategories = computed(() => {
  return categories.value.filter((c) => !c.parentId).length
})

// Helper methods
const getStatusBadge = (status) => {
  if (status === 'Active') {
    return 'bg-green-100 text-green-800'
  } else {
    return 'bg-red-100 text-red-800'
  }
}

const getParentCategoryName = (parentId) => {
  if (!parentId) return null
  const parent = categories.value.find(c => c.id === parentId)
  return parent ? parent.name : null
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedCategories.value.map((category) => category.id))
    selectAll.value = true
  }
}

const handleSelectItem = (categoryId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(categoryId)
  } else {
    newSelected.delete(categoryId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedCategories.value.length && paginatedCategories.value.length > 0
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
    status: 'Active',
    itemCount: 0,
    parentId: null,
    sortOrder: 0,
    code: '',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: ''
  }
  showModal.value = true
}

const openEditModal = (category) => {
  isEditing.value = true
  form.value = { ...category }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    description: '',
    status: 'Active',
    itemCount: 0,
    parentId: null,
    sortOrder: 0,
    code: '',
    taxCategory: 'Standard',
    imageUrl: '',
    notes: ''
  }
  error.value = ''
}

const saveCategory = async () => {
  try {
    // Prepare data for API
    const categoryData = {
      name: form.value.name,
      description: form.value.description || null,
      status: form.value.status,
      parentId: form.value.parentId || null,
      sortOrder: form.value.sortOrder || 0,
      code: form.value.code || null,
      taxCategory: form.value.taxCategory,
      imageUrl: form.value.imageUrl || null,
      notes: form.value.notes || null,
    }

    if (isEditing.value) {
      await updateCategory(form.value.id, categoryData)
    } else {
      await createCategory(categoryData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save category:', err)
  }
}

const deleteCategory = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (categoryToDelete.value) {
    try {
      await deleteCategoryApi(categoryToDelete.value.id)
      showDeleteModal.value = false
      categoryToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteCategoryApi
      console.error('Failed to delete category:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} categor${
      selectedItems.value.size > 1 ? 'ies' : 'y'
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteCategoryApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected categories deleted successfully')
    } catch (err) {
      console.error('Failed to delete some categories:', err)
      swalAlert.value?.showError('Failed to delete some categories', 'Please try again')
    }
  }
}

const viewCategoryDetails = (category) => {
  // You can implement a detailed view modal or navigate to a detail page
  console.log('Viewing category details:', category)
  const parentName = getParentCategoryName(category.parentId)
  alert(
    `Category Details:\nName: ${category.name}\nCode: ${category.code || 'N/A'}\nDescription: ${category.description || 'N/A'}\nStatus: ${category.status}\nParent: ${parentName || 'None'}\nItems: ${category.itemCount}\nTax Category: ${category.taxCategory}\nSort Order: ${category.sortOrder}\nNotes: ${category.notes || 'N/A'}`
  )
}

// Other actions
const refreshCategories = async () => {
  await fetchCategories()
}

// Lifecycle
onMounted(() => {
  fetchCategories()
})
</script>
