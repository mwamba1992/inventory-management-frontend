<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Inventory</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Items</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Items Management
            </h1>
            <p class="text-gray-600 mt-2">Manage inventory items, categories and warehouse locations</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshItems"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="exportItems"
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
              Add Item
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Category:</label>
              <select
                v-model="selectedCategory"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in availableCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.code }} - {{ category.description }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Warehouse:</label>
              <select
                v-model="selectedWarehouse"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Warehouses</option>
                <option
                  v-for="warehouse in availableWarehouses"
                  :key="warehouse.id"
                  :value="warehouse.id"
                >
                  {{ warehouse.name }} - {{ warehouse.address }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Business:</label>
              <select
                v-model="selectedBusiness"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Businesses</option>
                <option
                  v-for="business in availableBusinesses"
                  :key="business.id"
                  :value="business.id"
                >
                  {{ business.name }}
                </option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedCategory || selectedWarehouse || selectedBusiness"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <XMarkIcon class="w-4 h-4 inline mr-1" />
              Clear Filters
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
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ items.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <CubeIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Categories</p>
              <p class="text-2xl font-bold text-gray-900">{{ availableCategories.length }}</p>
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
              <p class="text-sm font-medium text-gray-600">Warehouses</p>
              <p class="text-2xl font-bold text-gray-900">{{ availableWarehouses.length }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <BuildingStorefrontIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Businesses</p>
              <p class="text-2xl font-bold text-gray-900">{{ availableBusinesses.length }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <BuildingOfficeIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Items Table -->
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
                  placeholder="Search items..."
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
                  <span class="text-sm font-semibold text-gray-900">Item</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Description</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Category</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Warehouse</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Business</span>
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
                  <span class="text-gray-500">Loading items...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedItems.length === 0">
              <td colspan="8" class="p-12 text-center text-gray-500">
                <CubeIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ hasActiveFilters || searchTerm ? 'No items found' : 'No items yet' }}
                </p>
                <p class="text-sm">
                  {{
                    hasActiveFilters || searchTerm
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first item to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="item in paginatedItems"
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
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                  >
                    <CubeIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">Item #{{ item.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <p class="text-sm text-gray-900 max-w-xs truncate" :title="item.desc">
                  {{ item.desc || 'No description' }}
                </p>
              </td>
              <td class="p-4">
                <div v-if="item.category">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ item.category.code }}
                  </span>
                  <p class="text-xs text-gray-500 mt-1">{{ item.category.description }}</p>
                </div>
                <span v-else class="text-xs text-gray-400">No category</span>
              </td>
              <td class="p-4">
                <div v-if="item.warehouse">
                  <div class="flex items-center space-x-2">
                    <BuildingStorefrontIcon class="w-4 h-4 text-purple-600" />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ item.warehouse.code }}</p>
                      <p class="text-xs text-gray-500">{{ item.warehouse.description }}</p>
                    </div>
                  </div>
                </div>
                <span v-else class="text-xs text-gray-400">No warehouse</span>
              </td>
              <td class="p-4">
                <div v-if="item.business">
                  <div class="flex items-center space-x-2">
                    <BuildingOfficeIcon class="w-4 h-4 text-orange-600" />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ item.business.name }}</p>
                      <p class="text-xs text-gray-500">Business</p>
                    </div>
                  </div>
                </div>
                <span v-else class="text-xs text-gray-400">No business</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(item)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Item"
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
                    title="Duplicate Item"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteItem(item)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Item"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredItems.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-blue-600">
              (filtered from {{ items.length }} total)
            </span>
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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Edit Item' : 'Create New Item' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveItem" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Item Information -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeIcon class="w-5 h-5 mr-2" />
                  Item Information
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  v-model="form.categoryId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Category</option>
                  <option
                    v-for="category in availableCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.code }} - {{ category.description }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="form.desc"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter item description (optional)"
                ></textarea>
              </div>

              <!-- Location & Business -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon class="w-5 h-5 mr-2" />
                  Location & Business
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Warehouse *</label>
                <select
                  v-model="form.warehouseId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Warehouse</option>
                  <option
                    v-for="warehouse in availableWarehouses"
                    :key="warehouse.id"
                    :value="warehouse.id"
                  >
                    {{ warehouse.name }} - {{ warehouse.address }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Business *</label>
                <select
                  v-model="form.businessId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Business</option>
                  <option
                    v-for="business in availableBusinesses"
                    :key="business.id"
                    :value="business.id"
                  >
                    {{ business.name }}
                  </option>
                </select>
              </div>

              <!-- Preview Section -->
              <div v-if="form.name && form.categoryId" class="md:col-span-2 bg-gray-50 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-gray-700 mb-2">Item Preview</h5>
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <CubeIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ form.name }}</p>
                    <p class="text-xs text-gray-500">{{ form.desc || 'No description provided' }}</p>
                    <div class="flex items-center space-x-2 mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ getCategoryName(form.categoryId) }}
                      </span>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-600">{{ getWarehouseName(form.warehouseId) }}</span>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-600">{{ getBusinessName(form.businessId) }}</span>
                    </div>
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
                  {{ isEditing ? 'Update Item' : 'Create Item' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Item</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete item "{{ itemToDelete?.name }}"?
              <span class="text-red-600 font-medium">
                This action cannot be undone and may affect related inventory records.
              </span>
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
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'
import { Configs } from '@/utils/Configs'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = Configs.API_BASE_URL

// Reactive data
const items = ref([])
const availableCategories = ref([])
const availableWarehouses = ref([])
const availableBusinesses = ref([])
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
const selectedCategory = ref('')
const selectedWarehouse = ref('')
const selectedBusiness = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  desc: '',
  categoryId: '',
  warehouseId: '',
  businessId: '',
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

const fetchItems = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/items')
    items.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch items', err.message)
    error.value = `Failed to fetch items: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await apiCall('/common/type/ITEM_CATEGORY')
    availableCategories.value = data
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    // Fallback categories if API fails
    availableCategories.value = [
      { id: 1, code: 'ELECTRONICS', description: 'Electronic Items' },
      { id: 2, code: 'FURNITURE', description: 'Furniture & Fixtures' },
      { id: 3, code: 'OFFICE', description: 'Office Supplies' },
      { id: 4, code: 'EQUIPMENT', description: 'Equipment & Machinery' }
    ]
  }
}

const fetchWarehouses = async () => {
  try {
    const data = await apiCall('/warehouses')
    availableWarehouses.value = data
  } catch (err) {
    console.error('Failed to fetch warehouses:', err)
    // Fallback warehouses if API fails
    availableWarehouses.value = [
      { id: 1, code: 'WH001', description: 'Main Warehouse' },
      { id: 2, code: 'WH002', description: 'Secondary Warehouse' },
      { id: 3, code: 'WH003', description: 'Distribution Center' }
    ]
  }
}

const fetchBusinesses = async () => {
  try {
    const data = await apiCall('/business')
    availableBusinesses.value = data
  } catch (err) {
    console.error('Failed to fetch businesses:', err)
    // Fallback businesses if API fails
    availableBusinesses.value = [
      { id: 1, name: 'Main Business Unit' },
      { id: 2, name: 'Secondary Division' },
      { id: 3, name: 'Subsidiary Company' }
    ]
  }
}

const createItem = async (itemData) => {
  submitting.value = true
  try {
    const newItem = await apiCall('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
    items.value.push(newItem)
    swalAlert.value?.showSuccess('Item created successfully')
    return newItem
  } catch (err) {
    swalAlert.value?.showError('Failed to create item', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateItem = async (id, itemData) => {
  submitting.value = true
  try {
    const updatedItem = await apiCall(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    })
    const index = items.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
    swalAlert.value?.showSuccess('Item updated successfully')
    return updatedItem
  } catch (err) {
    swalAlert.value?.showError('Failed to update item', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteItemApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/items/${id}`, {
      method: 'DELETE',
    })
    items.value = items.value.filter((item) => item.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Item deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete item', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedCategory.value || selectedWarehouse.value || selectedBusiness.value
})

const filteredItems = computed(() => {
  let filtered = items.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (item.category?.code && item.category.code.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (item.category?.description && item.category.description.toLowerCase().includes(searchTerm.value.toLowerCase()))

    const matchesCategory = selectedCategory.value === '' ||
      (item.category && item.category.id.toString() === selectedCategory.value.toString())

    const matchesWarehouse = selectedWarehouse.value === '' ||
      (item.warehouse && item.warehouse.id.toString() === selectedWarehouse.value.toString())

    const matchesBusiness = selectedBusiness.value === '' ||
      (item.business && item.business.id.toString() === selectedBusiness.value.toString())

    return matchesSearch && matchesCategory && matchesWarehouse && matchesBusiness
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

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredItems.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredItems.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredItems.value.length)
})

// Utility methods
const getCategoryName = (categoryId) => {
  if (!categoryId) return ''
  const category = availableCategories.value.find(cat => cat.id.toString() === categoryId.toString())
  return category ? category.code : ''
}

const getWarehouseName = (warehouseId) => {
  if (!warehouseId) return ''
  const warehouse = availableWarehouses.value.find(wh => wh.id.toString() === warehouseId.toString())
  return warehouse ? warehouse.code : ''
}

const getBusinessName = (businessId) => {
  if (!businessId) return ''
  const business = availableBusinesses.value.find(bus => bus.id.toString() === businessId.toString())
  return business ? business.name : ''
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedWarehouse.value = ''
  selectedBusiness.value = ''
  currentPage.value = 1
}

const exportItems = () => {
  const csvData = filteredItems.value.map(item => ({
    ID: item.id,
    Name: item.name,
    Description: item.desc || '',
    Category: item.category?.code || '',
    Warehouse: item.warehouse?.code || '',
    Business: item.business?.name || ''
  }))

  // Simple CSV export (in real implementation, you'd use a proper CSV library)
  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'items-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedItems.value.map((item) => item.id))
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
    newSelected.size === paginatedItems.value.length && paginatedItems.value.length > 0
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
    desc: '',
    categoryId: '',
    warehouseId: '',
    businessId: '',
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  form.value = {
    id: item.id,
    name: item.name,
    desc: item.desc || '',
    categoryId: item.category?.id || '',
    warehouseId: item.warehouse?.id || '',
    businessId: item.business?.id || '',
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    desc: '',
    categoryId: '',
    warehouseId: '',
    businessId: '',
  }
  error.value = ''
}

const saveItem = async () => {
  try {
    const itemData = {
      name: form.value.name.trim(),
      desc: form.value.desc.trim() || null,
      categoryId: form.value.categoryId,
      warehouseId: form.value.warehouseId,
      businessId: form.value.businessId,
    }

    if (isEditing.value) {
      await updateItem(form.value.id, itemData)
    } else {
      await createItem(itemData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save item:', err)
  }
}

const duplicateItem = (item) => {
  isEditing.value = false
  form.value = {
    id: null,
    name: `${item.name} (Copy)`,
    desc: item.desc || '',
    categoryId: item.category?.id || '',
    warehouseId: item.warehouse?.id || '',
    businessId: item.business?.id || '',
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
      console.error('Failed to delete item:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} item${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteItemApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected items deleted successfully')
    } catch (err) {
      console.error('Failed to delete some items:', err)
      swalAlert.value?.showError('Failed to delete some items', 'Please try again')
    }
  }
}

const viewItemDetails = (item) => {
  const categoryInfo = item.category ? `${item.category.code} - ${item.category.description}` : 'No category'
  const warehouseInfo = item.warehouse ? `${item.warehouse.code} - ${item.warehouse.description}` : 'No warehouse'
  const businessInfo = item.business ? item.business.name : 'No business'

  alert(
    `Item Details:\nName: ${item.name}\nID: #${item.id}\nDescription: ${item.desc || 'No description'}\nCategory: ${categoryInfo}\nWarehouse: ${warehouseInfo}\nBusiness: ${businessInfo}`
  )
}

// Other actions
const refreshItems = async () => {
  await fetchItems()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchItems(), fetchCategories(), fetchWarehouses(), fetchBusinesses()])
})
</script>
