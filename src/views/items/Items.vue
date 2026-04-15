<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-neutral-50 p-6">
    <div class="max-w-full mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-neutral-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Inventory</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-neutral-900 font-medium">Items</span>
      </div>

      <!-- Header Section -->
      <div class="card mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1 class="text-3xl font-bold text-neutral-900">
              Items Management
            </h1>
            <p class="text-neutral-600 mt-2">Manage inventory items, categories and warehouse locations</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshItems"
              :disabled="loading"
              class="btn-secondary flex items-center text-sm disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="exportItems"
              class="btn-secondary flex items-center text-sm"
            >
              <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              @click="openAddModal"
              class="btn-primary flex items-center text-sm"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="card mb-6">
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-neutral-700">Category:</label>
              <select
                v-model="selectedCategory"
                @change="selectedSubcategory = ''; currentPage = 1"
                class="border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in parentCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.description }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2" v-if="selectedCategory">
              <label class="text-sm font-medium text-neutral-700">Subcategory:</label>
              <select
                v-model="selectedSubcategory"
                @change="currentPage = 1"
                class="border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">All Subcategories</option>
                <option
                  v-for="sub in subcategoriesOf(selectedCategory)"
                  :key="sub.id"
                  :value="sub.id"
                >
                  {{ sub.description }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-neutral-700">Warehouse:</label>
              <select
                v-model="selectedWarehouse"
                @change="currentPage = 1"
                class="border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
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
              <label class="text-sm font-medium text-neutral-700">Brand:</label>
              <select
                v-model="selectedBrand"
                @change="currentPage = 1"
                class="border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">All Brands</option>
                <option
                  v-for="brand in availableBrands"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.name }}
                </option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedCategory || selectedSubcategory || selectedWarehouse || selectedBrand"
              class="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-all duration-200"
            >
              <XMarkIcon class="w-4 h-4 inline mr-1" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="card">
          <div class="flex items-center justify-between p-6">
            <div>
              <p class="text-sm font-medium text-neutral-600">Total Items</p>
              <p class="text-2xl font-bold text-neutral-900">{{ items.length }}</p>
            </div>
            <div class="p-3 bg-brand-100 rounded-xl">
              <CubeIcon class="w-6 h-6 text-brand-600" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between p-6">
            <div>
              <p class="text-sm font-medium text-neutral-600">Categories</p>
              <p class="text-2xl font-bold text-neutral-900">{{ availableCategories.length }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <TagIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between p-6">
            <div>
              <p class="text-sm font-medium text-neutral-600">Warehouses</p>
              <p class="text-2xl font-bold text-neutral-900">{{ availableWarehouses.length }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <BuildingStorefrontIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

      </div>

      <!-- Main Items Table -->
      <div class="card">
        <div class="p-6 border-b border-neutral-100">
          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-neutral-700">Show</span>
                <select
                  v-model="entriesPerPage"
                  @change="currentPage = 1"
                  class="border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="text-sm font-medium text-neutral-700">entries</span>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                />
                <input
                  v-model="searchTerm"
                  @input="currentPage = 1"
                  type="text"
                  placeholder="Search items..."
                  class="pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-neutral-50">
            <tr>
              <th class="p-4 text-left">
                <input
                  type="checkbox"
                  class="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  :checked="selectAll"
                  @change="handleSelectAll"
                />
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                @click="sortBy('id')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-neutral-900">ID</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                @click="sortBy('name')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-neutral-900">Item</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-neutral-900">Code</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-neutral-900">Condition</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-neutral-900">Description</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-neutral-900">Category</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-neutral-900">Warehouse</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-neutral-900">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
            <tr v-if="loading">
              <td colspan="9" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                  <span class="text-neutral-500">Loading items...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedItems.length === 0">
              <td colspan="9" class="p-12 text-center text-neutral-500">
                <CubeIcon class="w-12 h-12 mx-auto text-neutral-300 mb-4" />
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
              class="hover:bg-neutral-50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  :checked="selectedItems.has(item.id)"
                  @change="handleSelectItem(item.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-neutral-900">#{{ item.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <!-- Product Image or Icon -->
                  <div class="relative group">
                    <div v-if="item.imageUrl" class="w-12 h-12 rounded-xl overflow-hidden shadow-soft ring-2 ring-white">
                      <img
                        :src="item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`"
                        :alt="item.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft"
                    >
                      <CubeIcon class="w-6 h-6 text-white" />
                    </div>
                    <!-- Hover Zoom Preview -->
                    <div v-if="item.imageUrl" class="absolute left-full ml-2 top-0 hidden group-hover:block z-50 pointer-events-none">
                      <div class="bg-white rounded-xl shadow-soft-lg border-2 border-neutral-200 p-2">
                        <img
                          :src="item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`"
                          :alt="item.name"
                          class="w-48 h-48 object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-neutral-900">{{ item.name }}</p>
                    <p class="text-xs text-neutral-500">Item #{{ item.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span v-if="item.code" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-brand-100 text-brand-800">
                  {{ item.code }}
                </span>
                <span v-else class="text-xs text-neutral-400">No code</span>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                    item.condition === 'new'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  ]"
                >
                  {{ item.condition === 'new' ? '✨ New' : '♻️ Used' }}
                </span>
              </td>
              <td class="p-4">
                <p class="text-sm text-neutral-900 max-w-xs truncate" :title="item.desc">
                  {{ item.desc || 'No description' }}
                </p>
              </td>
              <td class="p-4">
                <div v-if="item.category">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                    {{ item.category.description }}
                  </span>
                  <p v-if="item.subcategory" class="text-xs text-neutral-500 mt-1">{{ item.subcategory.description }}</p>
                </div>
                <span v-else class="text-xs text-neutral-400">No category</span>
              </td>
              <td class="p-4">
                <div v-if="item.warehouse">
                  <div class="flex items-center space-x-2">
                    <BuildingStorefrontIcon class="w-4 h-4 text-purple-600" />
                    <div>
                      <p class="text-sm font-medium text-neutral-900">{{ item.warehouse.code }}</p>
                      <p class="text-xs text-neutral-500">{{ item.warehouse.description }}</p>
                    </div>
                  </div>
                </div>
                <span v-else class="text-xs text-neutral-400">No warehouse</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="shareOnWhatsApp(item)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-all duration-200"
                    title="Share on WhatsApp"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>
                  <button
                    @click="copyWhatsAppLink(item)"
                    class="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-xl transition-all duration-200"
                    title="Copy WhatsApp Link"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    @click="openEditModal(item)"
                    class="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-xl transition-all duration-200"
                    title="Edit Item"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewItemDetails(item)"
                    class="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 rounded-xl transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicateItem(item)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-all duration-200"
                    title="Duplicate Item"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteItem(item)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
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
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-t border-neutral-100"
        >
          <div class="text-sm text-neutral-600 mb-4 sm:mb-0">
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredItems.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-brand-600">
              (filtered from {{ items.length }} total)
            </span>
          </div>

          <div v-if="totalPages > 1" class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-neutral-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors duration-200 text-sm font-medium"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-2 border rounded-xl text-sm font-medium transition-colors duration-200"
                :class="
                  currentPage === page
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-neutral-300 hover:bg-neutral-50'
                "
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border border-neutral-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors duration-200 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Selection Info -->
        <div
          v-if="selectedItems.size > 0"
          class="mx-6 mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-brand-700">
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
        class="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-soft-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-neutral-100">
            <h3 class="text-xl font-bold text-neutral-900">
              {{ isEditing ? 'Edit Item' : 'Create New Item' }}
            </h3>
            <button
              @click="closeModal"
              class="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveItem" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Item Information -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <CubeIcon class="w-5 h-5 mr-2" />
                  Item Information
                </h4>
              </div>

              <div>
                <label class="input-label">Item Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label class="input-label">Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="input-field font-mono"
                  placeholder="Enter item code (e.g., SKU-001)"
                />
              </div>

              <div>
                <label class="input-label">Condition</label>
                <select
                  v-model="form.condition"
                  class="input-field"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div>
                <label class="input-label">Category *</label>
                <select
                  v-model="form.categoryId"
                  @change="form.subcategoryId = ''"
                  required
                  class="input-field"
                >
                  <option value="">Select Category</option>
                  <option
                    v-for="category in parentCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.description }}
                  </option>
                </select>
              </div>

              <div v-if="form.categoryId && subcategoriesOf(form.categoryId).length">
                <label class="input-label">Subcategory</label>
                <select
                  v-model="form.subcategoryId"
                  class="input-field"
                >
                  <option value="">Select Subcategory</option>
                  <option
                    v-for="sub in subcategoriesOf(form.categoryId)"
                    :key="sub.id"
                    :value="sub.id"
                  >
                    {{ sub.description }}
                  </option>
                </select>
              </div>

              <div>
                <label class="input-label">Brand</label>
                <select
                  v-model="form.brandId"
                  class="input-field"
                >
                  <option value="">Select Brand (Optional)</option>
                  <option
                    v-for="brand in availableBrands"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="input-label">Supplier</label>
                <select
                  v-model="form.supplierId"
                  class="input-field"
                >
                  <option value="">Select Supplier (Optional)</option>
                  <option
                    v-for="supplier in availableSuppliers"
                    :key="supplier.id"
                    :value="supplier.id"
                  >
                    {{ supplier.supplierName }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="input-label">Description</label>
                <textarea
                  v-model="form.desc"
                  rows="3"
                  class="input-field"
                  placeholder="Enter item description (optional)"
                ></textarea>
              </div>

              <!-- Product Image Upload -->
              <div class="md:col-span-2">
                <label class="input-label">Product Image</label>

                <!-- Drag and Drop Zone -->
                <div
                  v-if="!imagePreview"
                  @dragover="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop"
                  :class="[
                    'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer',
                    isDragging
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-neutral-300 hover:border-brand-400 hover:bg-neutral-50'
                  ]"
                  @click="$refs.imageInput?.click()"
                >
                  <svg class="w-12 h-12 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm font-medium text-neutral-700 mb-1">
                    Drop your image here or click to browse
                  </p>
                  <p class="text-xs text-neutral-500">
                    Supports: JPG, PNG, GIF (Max 5MB)
                  </p>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageChange"
                    class="hidden"
                  />
                </div>

                <!-- Image Preview -->
                <div v-else class="relative">
                  <div class="border-2 border-neutral-200 rounded-xl p-4 bg-neutral-50">
                    <img
                      :src="imagePreview"
                      alt="Preview"
                      class="max-h-64 mx-auto rounded-lg shadow-soft object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    @click="removeImage"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 shadow-soft"
                    title="Remove image"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                  <div class="mt-3 flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-neutral-200">
                    <div class="flex items-center space-x-3">
                      <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm font-medium text-neutral-700">Image ready to upload</span>
                    </div>
                    <button
                      type="button"
                      @click="$refs.imageInput?.click()"
                      class="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Change
                    </button>
                  </div>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageChange"
                    class="hidden"
                  />
                </div>
              </div>

              <!-- Location -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <MapPinIcon class="w-5 h-5 mr-2" />
                  Location
                </h4>
              </div>

              <div>
                <label class="input-label">Warehouse *</label>
                <select
                  v-model="form.warehouseId"
                  required
                  class="input-field"
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

              <!-- Preview Section -->
              <div v-if="form.name && form.categoryId" class="md:col-span-2 bg-gradient-to-br from-neutral-50 to-brand-50 rounded-xl p-6 border border-neutral-200 shadow-soft">
                <h5 class="text-sm font-semibold text-neutral-700 mb-4 flex items-center">
                  <EyeIcon class="w-4 h-4 mr-2" />
                  Item Preview
                </h5>
                <div class="flex items-start space-x-4">
                  <!-- Preview Image -->
                  <div class="flex-shrink-0">
                    <div v-if="imagePreview" class="w-20 h-20 rounded-xl overflow-hidden shadow-soft ring-2 ring-white">
                      <img
                        :src="imagePreview"
                        :alt="form.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div v-else class="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-soft">
                      <CubeIcon class="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <!-- Preview Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold text-neutral-900 mb-1">{{ form.name }}</p>
                    <p v-if="form.code" class="text-xs font-mono text-brand-600 mb-2">{{ form.code }}</p>
                    <p class="text-sm text-neutral-600 mb-3">{{ form.desc || 'No description provided' }}</p>
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          form.condition === 'new'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        ]"
                      >
                        {{ form.condition === 'new' ? '✨ New' : '♻️ Used' }}
                      </span>
                      <span class="text-xs text-neutral-400">•</span>
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                        {{ getCategoryName(form.categoryId) }}
                      </span>
                      <span v-if="form.brandId" class="text-xs text-neutral-400">•</span>
                      <span v-if="form.brandId" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                        {{ getBrandName(form.brandId) }}
                      </span>
                      <span v-if="form.supplierId" class="text-xs text-neutral-400">•</span>
                      <span v-if="form.supplierId" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {{ getSupplierName(form.supplierId) }}
                      </span>
                      <span class="text-xs text-neutral-400">•</span>
                      <span class="text-xs text-neutral-700 font-medium">{{ getWarehouseName(form.warehouseId) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-neutral-100">
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="btn-primary disabled:opacity-50"
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

      <!-- View Item Details Modal -->
      <div
        v-if="showViewModal && viewingItem"
        class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeViewModal"
      >
        <div class="bg-white rounded-2xl shadow-soft-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header with image -->
          <div class="relative">
            <div class="bg-gradient-to-br from-brand-600 to-brand-700 rounded-t-2xl p-6 pb-16">
              <div class="flex justify-between items-start">
                <div>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white mb-3">
                    #{{ viewingItem.id }}
                  </span>
                  <h3 class="text-2xl font-bold text-white">{{ viewingItem.name }}</h3>
                  <p class="text-brand-100 text-sm mt-1">{{ viewingItem.desc || 'No description' }}</p>
                </div>
                <button
                  @click="closeViewModal"
                  class="text-white/70 hover:text-white transition-colors duration-200 p-1"
                >
                  <XMarkIcon class="w-6 h-6" />
                </button>
              </div>
            </div>
            <!-- Floating image/icon -->
            <div class="absolute -bottom-8 left-6">
              <div v-if="viewingItem.imageUrl" class="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                <img
                  :src="viewingItem.imageUrl.startsWith('http') ? viewingItem.imageUrl : `${API_BASE_URL}${viewingItem.imageUrl}`"
                  :alt="viewingItem.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white">
                <CubeIcon class="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div class="p-6 pt-12 space-y-6">
            <!-- Quick Info Badges -->
            <div class="flex flex-wrap gap-2">
              <span v-if="viewingItem.code" class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-brand-50 text-brand-700 border border-brand-200">
                {{ viewingItem.code }}
              </span>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium',
                  viewingItem.condition === 'new' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                ]"
              >
                {{ viewingItem.condition === 'new' ? 'New' : 'Used' }}
              </span>
              <span v-if="viewingItem.brand" class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                {{ viewingItem.brand.name || viewingItem.brand.code }}
              </span>
            </div>

            <!-- Price Section -->
            <div>
              <div class="flex items-center space-x-2 mb-3">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BanknotesIcon class="w-4 h-4 text-green-600" />
                </div>
                <h4 class="text-sm font-semibold text-neutral-900">Pricing Information</h4>
              </div>
              <div v-if="loadingViewDetails" class="flex items-center space-x-2 py-4">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                <span class="text-sm text-neutral-500">Loading pricing...</span>
              </div>
              <div v-else-if="viewItemPrices.length > 0" class="space-y-3">
                <div
                  v-for="price in viewItemPrices"
                  :key="price.id"
                  class="bg-neutral-50 rounded-xl p-4 border border-neutral-100"
                >
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p class="text-xs text-neutral-500 mb-1">Purchase</p>
                      <p class="text-sm font-bold text-neutral-900">TZS {{ formatViewCurrency(price.purchaseAmount) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 mb-1">Freight</p>
                      <p class="text-sm font-bold text-neutral-900">TZS {{ formatViewCurrency(price.freightAmount) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 mb-1">Margin</p>
                      <p class="text-sm font-bold text-green-600">{{ price.profitMargin }}%</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 mb-1">Selling Price</p>
                      <p class="text-lg font-bold text-brand-600">TZS {{ formatViewCurrency(price.sellingPrice) }}</p>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="price.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    >
                      {{ price.isActive ? 'Active' : 'Inactive' }}
                    </span>
                    <span class="text-xs text-neutral-400">
                      Total Cost: TZS {{ formatViewCurrency((price.purchaseAmount || 0) + (price.freightAmount || 0)) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="bg-neutral-50 rounded-xl p-4 border border-neutral-100 text-center">
                <CurrencyDollarIcon class="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p class="text-sm text-neutral-500">No pricing set for this item</p>
              </div>
            </div>

            <!-- Stock Section -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArchiveBoxIcon class="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 class="text-sm font-semibold text-neutral-900">Stock Information</h4>
                </div>
                <span v-if="!loadingViewDetails && viewItemStocks.length > 0" class="text-sm font-bold text-brand-600">
                  Total: {{ formatViewCurrency(getTotalStock) }} units
                </span>
              </div>
              <div v-if="loadingViewDetails" class="flex items-center space-x-2 py-4">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                <span class="text-sm text-neutral-500">Loading stock...</span>
              </div>
              <div v-else-if="viewItemStocks.length > 0" class="space-y-3">
                <div
                  v-for="stock in viewItemStocks"
                  :key="stock.id"
                  class="bg-neutral-50 rounded-xl p-4 border border-neutral-100"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <BuildingStorefrontIcon class="w-4 h-4 text-purple-600" />
                      <span class="text-sm font-medium text-neutral-900">{{ stock.warehouse?.name || 'Unknown Warehouse' }}</span>
                    </div>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="getStockStatus(stock.quantity, stock.reorderPoint).class"
                    >
                      {{ getStockStatus(stock.quantity, stock.reorderPoint).text }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-xs text-neutral-500 mb-1">Quantity</p>
                      <p class="text-xl font-bold" :class="stock.quantity <= 0 ? 'text-red-600' : 'text-neutral-900'">
                        {{ formatViewCurrency(stock.quantity) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 mb-1">Reorder Point</p>
                      <p class="text-sm font-medium text-neutral-600">{{ formatViewCurrency(stock.reorderPoint || 10) }}</p>
                    </div>
                  </div>
                  <!-- Color distributions -->
                  <div v-if="stock.distributions && stock.distributions.length > 0" class="mt-3 pt-3 border-t border-neutral-200">
                    <p class="text-xs text-neutral-500 mb-2">Color Distribution</p>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="dist in stock.distributions"
                        :key="dist.id"
                        class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-white text-xs"
                      >
                        <div
                          class="w-3 h-3 rounded-full border border-neutral-300"
                          :style="{ backgroundColor: dist.colorCategory?.hexCode || '#CCC' }"
                        ></div>
                        <span class="font-medium text-neutral-700">{{ dist.colorCategory?.name || 'N/A' }}</span>
                        <span class="font-bold text-brand-600">{{ dist.quantity }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="bg-neutral-50 rounded-xl p-4 border border-neutral-100 text-center">
                <ArchiveBoxIcon class="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p class="text-sm text-neutral-500">No stock records for this item</p>
              </div>
            </div>

            <!-- Details Section -->
            <div>
              <div class="flex items-center space-x-2 mb-3">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TagIcon class="w-4 h-4 text-orange-600" />
                </div>
                <h4 class="text-sm font-semibold text-neutral-900">Item Details</h4>
              </div>
              <div class="bg-neutral-50 rounded-xl border border-neutral-100 divide-y divide-neutral-100">
                <div class="flex items-center justify-between p-4">
                  <span class="text-sm text-neutral-500">Category</span>
                  <span v-if="viewingItem.category && (viewingItem.category.code || viewingItem.category.description)" class="text-sm font-medium text-neutral-900">
                    {{ [viewingItem.category.code, viewingItem.category.description].filter(Boolean).join(' - ') }}
                  </span>
                  <span v-else class="text-sm text-neutral-400">Not assigned</span>
                </div>
                <div class="flex items-center justify-between p-4">
                  <span class="text-sm text-neutral-500">Warehouse</span>
                  <span v-if="viewingItem.warehouse && (viewingItem.warehouse.code || viewingItem.warehouse.description || viewingItem.warehouse.name)" class="text-sm font-medium text-neutral-900">
                    {{ viewingItem.warehouse.name || [viewingItem.warehouse.code, viewingItem.warehouse.description].filter(Boolean).join(' - ') }}
                  </span>
                  <span v-else class="text-sm text-neutral-400">Not assigned</span>
                </div>
                <div class="flex items-center justify-between p-4">
                  <span class="text-sm text-neutral-500">Business</span>
                  <span v-if="viewingItem.business && viewingItem.business.name" class="text-sm font-medium text-neutral-900">
                    {{ viewingItem.business.name }}
                  </span>
                  <span v-else class="text-sm text-neutral-400">Not assigned</span>
                </div>
                <div class="flex items-center justify-between p-4">
                  <span class="text-sm text-neutral-500">Supplier</span>
                  <span v-if="viewingItem.supplier && (viewingItem.supplier.name || viewingItem.supplier.code)" class="text-sm font-medium text-neutral-900">
                    {{ viewingItem.supplier.name || viewingItem.supplier.code }}
                  </span>
                  <span v-else class="text-sm text-neutral-400">Not assigned</span>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                @click="() => { const item = viewingItem; closeViewModal(); openEditModal(item) }"
                class="btn-secondary flex items-center text-sm"
              >
                <PencilIcon class="w-4 h-4 mr-2" />
                Edit Item
              </button>
              <button
                @click="closeViewModal"
                class="btn-primary text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-soft-lg w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-600 mr-3" />
              <h3 class="text-lg font-bold text-neutral-900">Delete Item</h3>
            </div>
            <p class="text-neutral-600 mb-6">
              Are you sure you want to delete item "{{ itemToDelete?.name }}"?
              <span class="text-red-600 font-medium">
                This action cannot be undone and may affect related inventory records.
              </span>
            </p>
            <div class="flex justify-end space-x-3">
              <button
                @click="showDeleteModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                :disabled="submitting"
                class="btn-danger disabled:opacity-50"
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
  EyeIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArchiveBoxIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'
import { Configs } from '@/utils/Configs'
import api from '@/services/Api'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = Configs.API_BASE_URL

// Reactive data
const items = ref([])
const availableCategories = ref([])
const availableBrands = ref([])
const availableWarehouses = ref([])
const availableSuppliers = ref([])
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
const selectedSubcategory = ref('')
const selectedWarehouse = ref('')
const selectedBrand = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)
const viewingItem = ref(null)
const viewItemPrices = ref([])
const viewItemStocks = ref([])
const loadingViewDetails = ref(false)

// Form data
const form = ref({
  id: null,
  name: '',
  code: '',
  condition: 'new',
  desc: '',
  categoryId: '',
  subcategoryId: '',
  brandId: '',
  supplierId: '',
  warehouseId: '',
})

// Image upload states
const imageFile = ref(null)
const imagePreview = ref(null)
const isDragging = ref(false)

// API Functions
const apiCall = async (url, options = {}) => {
  try {
    const method = (options.method || 'GET').toLowerCase()
    const data = options.body ? JSON.parse(options.body) : undefined
    const response = await api({ url, method, data })
    return response.data
  } catch (err) {
    const message = err.response?.data?.message || err.message
    console.error('API call failed:', message)
    throw new Error(message)
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

const fetchBrands = async () => {
  try {
    const data = await apiCall('/brands')
    availableBrands.value = data
  } catch (err) {
    console.error('Failed to fetch brands:', err)
    availableBrands.value = []
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

const fetchSuppliers = async () => {
  try {
    const data = await apiCall('/item-suppliers')
    availableSuppliers.value = data
  } catch (err) {
    console.error('Failed to fetch suppliers:', err)
    availableSuppliers.value = []
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
  return selectedCategory.value || selectedSubcategory.value || selectedWarehouse.value || selectedBrand.value
})

const parentCategories = computed(() =>
  availableCategories.value.filter(c => !c.parentCategoryId && !c.parentCategory)
)

const subcategoriesOf = (parentId) => {
  if (!parentId) return []
  const pid = parentId.toString()
  return availableCategories.value.filter(c =>
    (c.parentCategoryId && c.parentCategoryId.toString() === pid) ||
    (c.parentCategory && c.parentCategory.id && c.parentCategory.id.toString() === pid)
  )
}

const filteredItems = computed(() => {
  let filtered = items.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (item.category?.code && item.category.code.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (item.category?.description && item.category.description.toLowerCase().includes(searchTerm.value.toLowerCase()))

    const matchesCategory = selectedCategory.value === '' ||
      (item.category && item.category.id.toString() === selectedCategory.value.toString())

    const matchesSubcategory = selectedSubcategory.value === '' ||
      (item.subcategory && item.subcategory.id && item.subcategory.id.toString() === selectedSubcategory.value.toString()) ||
      (item.subcategoryId && item.subcategoryId.toString() === selectedSubcategory.value.toString())

    const matchesWarehouse = selectedWarehouse.value === '' ||
      (item.warehouse && item.warehouse.id.toString() === selectedWarehouse.value.toString())

    const matchesBrand = selectedBrand.value === '' ||
      (item.brandId && item.brandId.toString() === selectedBrand.value.toString()) ||
      (item.brand && item.brand.id && item.brand.id.toString() === selectedBrand.value.toString())

    return matchesSearch && matchesCategory && matchesSubcategory && matchesWarehouse && matchesBrand
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

const getBrandName = (brandId) => {
  if (!brandId) return ''
  const brand = availableBrands.value.find(br => br.id.toString() === brandId.toString())
  return brand ? brand.name : ''
}

const getWarehouseName = (warehouseId) => {
  if (!warehouseId) return ''
  const warehouse = availableWarehouses.value.find(wh => wh.id.toString() === warehouseId.toString())
  return warehouse ? warehouse.code : ''
}

const getSupplierName = (supplierId) => {
  if (!supplierId) return ''
  const supplier = availableSuppliers.value.find(sup => sup.id.toString() === supplierId.toString())
  return supplier ? supplier.supplierName : ''
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedSubcategory.value = ''
  selectedWarehouse.value = ''
  selectedBrand.value = ''
  currentPage.value = 1
}

const exportItems = () => {
  const csvData = filteredItems.value.map(item => ({
    ID: item.id,
    Name: item.name,
    Code: item.code || '',
    Condition: item.condition || 'new',
    Description: item.desc || '',
    Category: item.category?.code || '',
    Warehouse: item.warehouse?.code || '',
    Image: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`) : 'No image'
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
    code: '',
    condition: 'new',
    desc: '',
    categoryId: '',
    subcategoryId: '',
    brandId: '',
    supplierId: '',
    warehouseId: '',
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  form.value = {
    id: item.id,
    name: item.name,
    code: item.code || '',
    condition: item.condition || 'new',
    desc: item.desc || '',
    categoryId: item.category?.id || '',
    subcategoryId: item.subcategory?.id || item.subcategoryId || '',
    brandId: item.brand?.id || '',
    supplierId: item.supplier?.id || '',
    warehouseId: item.warehouse?.id || '',
  }
  // Set existing image preview if item has an image
  if (item.imageUrl) {
    imagePreview.value = item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    code: '',
    condition: 'new',
    desc: '',
    categoryId: '',
    subcategoryId: '',
    brandId: '',
    supplierId: '',
    warehouseId: '',
  }
  // Clean up image states
  removeImage()
  error.value = ''
}

const saveItem = async () => {
  try {
    const itemData = {
      name: form.value.name.trim(),
      code: form.value.code.trim() || null,
      condition: form.value.condition || 'new',
      desc: form.value.desc.trim() || null,
      categoryId: form.value.categoryId,
      subcategoryId: form.value.subcategoryId || null,
      brandId: form.value.brandId || null,
      supplierId: form.value.supplierId || null,
      warehouseId: form.value.warehouseId,
    }

    let savedItem
    if (isEditing.value) {
      savedItem = await updateItem(form.value.id, itemData)
    } else {
      savedItem = await createItem(itemData)
    }

    // Upload image if selected
    if (imageFile.value && savedItem) {
      try {
        await uploadImage(savedItem.id)
        swalAlert.value?.showSuccess('Success', 'Item and image saved successfully')
      } catch (imgErr) {
        swalAlert.value?.showWarning('Partial Success', 'Item saved but image upload failed')
      }
      // Refresh items to show new image
      await fetchItems()
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
    code: item.code ? `${item.code}-COPY` : '',
    condition: item.condition || 'new',
    desc: item.desc || '',
    categoryId: item.category?.id || '',
    brandId: item.brand?.id || '',
    supplierId: item.supplier?.id || '',
    warehouseId: item.warehouse?.id || '',
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

const viewItemDetails = async (item) => {
  viewingItem.value = item
  showViewModal.value = true
  loadingViewDetails.value = true
  viewItemPrices.value = []
  viewItemStocks.value = []

  try {
    const [prices, stocks] = await Promise.all([
      apiCall('/items/item-prices').catch(() => []),
      apiCall('/items/item-stocks').catch(() => []),
    ])
    viewItemPrices.value = prices.filter(p => p.item?.id === item.id)
    viewItemStocks.value = stocks.filter(s => s.item?.id === item.id)
  } catch (err) {
    console.error('Failed to fetch item details:', err)
  } finally {
    loadingViewDetails.value = false
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingItem.value = null
  viewItemPrices.value = []
  viewItemStocks.value = []
}

const formatViewCurrency = (value) => {
  if (!value && value !== 0) return '0'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const getTotalStock = computed(() => {
  return viewItemStocks.value.reduce((sum, s) => sum + (s.quantity || 0), 0)
})

const getStockStatus = (quantity, reorderPoint) => {
  const rp = reorderPoint || 10
  if (quantity <= 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' }
  if (quantity <= rp) return { text: 'Low Stock', class: 'bg-orange-100 text-orange-800' }
  if (quantity > rp * 3) return { text: 'Overstock', class: 'bg-blue-100 text-blue-800' }
  return { text: 'Normal', class: 'bg-green-100 text-green-800' }
}

// Image Upload Functions
const handleImageChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      swalAlert.value?.showError('Invalid File', 'Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      swalAlert.value?.showError('File Too Large', 'Image size must be less than 5MB')
      return
    }
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      swalAlert.value?.showError('Invalid File', 'Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      swalAlert.value?.showError('File Too Large', 'Image size must be less than 5MB')
      return
    }
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const removeImage = () => {
  imageFile.value = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
}

const uploadImage = async (itemId) => {
  if (!imageFile.value) return

  const formData = new FormData()
  formData.append('image', imageFile.value)

  try {
    await api.post(`/items/${itemId}/upload-image`, formData)
  } catch (err) {
    console.error('Failed to upload image:', err)
    throw err
  }
}

// WhatsApp Share Functions
const shareOnWhatsApp = (item) => {
  const phoneNumber = '255676107301'
  const message = `ORDER:${item.id}`
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  // Open WhatsApp in a new tab
  window.open(whatsappUrl, '_blank')
}

const copyWhatsAppLink = async (item) => {
  const phoneNumber = '255676107301'
  const message = `ORDER:${item.id}`
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  try {
    await navigator.clipboard.writeText(whatsappUrl)
    swalAlert.value?.showSuccess('Link Copied!', `WhatsApp order link for ${item.name} has been copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy link:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = whatsappUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      swalAlert.value?.showSuccess('Link Copied!', `WhatsApp order link for ${item.name} has been copied to clipboard`)
    } catch (fallbackErr) {
      swalAlert.value?.showError('Copy Failed', 'Unable to copy link to clipboard')
    }
    document.body.removeChild(textArea)
  }
}

// Other actions
const refreshItems = async () => {
  await fetchItems()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchItems(), fetchCategories(), fetchBrands(), fetchWarehouses(), fetchSuppliers()])
})
</script>
