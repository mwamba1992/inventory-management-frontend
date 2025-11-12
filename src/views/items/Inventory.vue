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
        <span class="text-gray-700 font-medium">Stock Management</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Inventory Stock Management
            </h1>
            <p class="text-gray-600 mt-2">Monitor and manage item quantities across warehouses</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshStocks"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="openBulkAdjustmentModal"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4 mr-2" />
              Bulk Adjust
            </button>
            <button
              @click="exportStocks"
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
              Add Stock Entry
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Warehouse:</label>
              <select
                v-model="selectedWarehouse"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="">All Warehouses</option>
                <option
                  v-for="warehouse in availableWarehouses"
                  :key="warehouse.id"
                  :value="warehouse.id"
                >
                  {{ warehouse.name }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Item:</label>
              <select
                v-model="selectedItem"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="">All Items</option>
                <option
                  v-for="item in availableItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Stock Level:</label>
              <select
                v-model="selectedStockLevel"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Levels</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="normal-stock">Normal Stock</option>
                <option value="overstock">Overstock</option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedWarehouse || selectedItem || selectedStockLevel"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <XMarkIcon class="w-4 h-4 inline mr-1" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Color Distribution Overview -->
      <div v-if="colorDistributionSummary.length > 0" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <SwatchIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">Color Distribution Overview</h3>
                <p class="text-sm text-gray-600">Total inventory by color variants</p>
              </div>
            </div>
            <span class="text-sm font-medium text-gray-600">
              {{ colorDistributionSummary.length }} color{{ colorDistributionSummary.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Color breakdown grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div
              v-for="color in colorDistributionSummary"
              :key="color.id"
              class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div class="flex items-center space-x-3 mb-3">
                <div
                  class="w-10 h-10 rounded-xl shadow-md flex-shrink-0 border-2 border-white"
                  :style="{ backgroundColor: color.hexCode }"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ color.name }}</p>
                  <p class="text-xs text-gray-500">{{ color.hexCode }}</p>
                </div>
              </div>
              <div class="text-center pt-3 border-t border-gray-200">
                <p class="text-2xl font-bold text-indigo-600">{{ formatNumber(color.quantity) }}</p>
                <p class="text-xs text-gray-500 mt-1">units in stock</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalItems }}</p>
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
              <p class="text-sm font-medium text-gray-600">Total Quantity</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalQuantity }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <ArchiveBoxIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ lowStockItems }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <ExclamationTriangleIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Out of Stock</p>
              <p class="text-2xl font-bold text-gray-900">{{ outOfStockItems }}</p>
            </div>
            <div class="p-3 bg-red-100 rounded-xl">
              <NoSymbolIcon class="w-6 h-6 text-red-600" />
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
      </div>

      <!-- Main Stocks Table -->
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
                  placeholder="Search inventory..."
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
                <span class="text-sm font-semibold text-gray-900">Item</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Warehouse</span>
              </th>
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Current Stock</span>
              </th>
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Reorder Point</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Stock Level</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Color Distribution</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Last Updated</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
            <tr v-if="loading">
              <td colspan="10" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading inventory...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedStocks.length === 0">
              <td colspan="10" class="p-12 text-center text-gray-500">
                <ArchiveBoxIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ hasActiveFilters || searchTerm ? 'No stock records found' : 'No inventory yet' }}
                </p>
                <p class="text-sm">
                  {{
                    hasActiveFilters || searchTerm
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first stock entry to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="stock in paginatedStocks"
              :key="stock.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(stock.id)"
                  @change="handleSelectItem(stock.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ stock.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                  >
                    <CubeIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ stock.item?.name || 'Unknown Item' }}</p>
                    <p class="text-xs text-gray-500">Item #{{ stock.item?.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <BuildingStorefrontIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm font-medium text-gray-900">{{ stock.warehouse?.name || 'Unknown Warehouse' }}</span>
                </div>
              </td>
              <td class="p-4 text-right">
                <span
                  class="text-lg font-bold"
                  :class="getQuantityColor(stock.quantity, stock.reorderPoint)"
                >
                  {{ formatNumber(stock.quantity) }}
                </span>
              </td>
              <td class="p-4 text-right">
                <span class="text-sm font-medium text-gray-600">{{ formatNumber(stock.reorderPoint || 10) }}</span>
              </td>
              <td class="p-4 text-center">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStockLevelColor(stock.quantity, stock.reorderPoint)"
                >
                  {{ getStockLevelText(stock.quantity, stock.reorderPoint) }}
                </span>
              </td>
              <td class="p-4">
                <div v-if="stock.distributions && stock.distributions.length > 0" class="space-y-2">
                  <!-- Color badges with names and quantities -->
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="dist in stock.distributions"
                      :key="dist.id"
                      class="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div
                        class="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                        :style="{ backgroundColor: dist.colorCategory?.hexCode || '#CCCCCC' }"
                      ></div>
                      <span class="text-xs font-medium text-gray-700">
                        {{ dist.colorCategory?.name || 'No Color' }}
                      </span>
                      <span class="text-xs font-bold text-indigo-600">
                        {{ dist.quantity }}
                      </span>
                    </div>
                  </div>
                  <!-- Manage button -->
                  <button
                    @click="openColorModal(stock)"
                    class="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                  >
                    <SwatchIcon class="w-3 h-3" />
                    <span>Manage Colors</span>
                  </button>
                </div>
                <div v-else>
                  <button
                    @click="openColorModal(stock)"
                    class="inline-flex items-center space-x-1 px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                  >
                    <SwatchIcon class="w-3 h-3" />
                    <span>+ Add Colors</span>
                  </button>
                </div>
              </td>
              <td class="p-4 text-center">
                <span class="text-xs text-gray-500">{{ formatDate(stock.updatedAt) }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(stock)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Stock"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openAdjustmentModal(stock)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Adjust Quantity"
                  >
                    <AdjustmentsVerticalIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openColorModal(stock)"
                    class="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    title="Manage Color Distribution"
                  >
                    <SwatchIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewStockHistory(stock)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="View Stock History"
                  >
                    <ClockIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicateStock(stock)"
                    class="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                    title="Duplicate for Another Warehouse"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteStock(stock)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Stock Entry"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredStocks.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-blue-600">
              (filtered from {{ itemStocks.length }} total)
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
              {{ selectedItems.size }} stock record{{ selectedItems.size !== 1 ? 's' : '' }} selected
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkAdjustStock"
                class="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Bulk Adjust Stock
              </button>
              <button
                @click="bulkUpdateReorderPoint"
                class="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Update Reorder Points
              </button>
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
              {{ isEditing ? 'Edit Stock Entry' : 'Create New Stock Entry' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveStock" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Item Selection -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Item *</label>
                <select
                  v-model="form.itemId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Item</option>
                  <option
                    v-for="item in availableItems"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </select>
              </div>

              <!-- Warehouse Selection -->
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
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>

              <!-- Quantity -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="0"
                  step="1"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <!-- Reorder Point -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Reorder Point</label>
                <input
                  v-model.number="form.reorderPoint"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="10"
                />
                <p class="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
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
                  {{ isEditing ? 'Update Stock' : 'Create Stock' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Stock Adjustment Modal -->
      <div
        v-if="showAdjustmentModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">Stock Adjustment</h3>
            <button
              @click="showAdjustmentModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <p class="text-sm text-gray-600">Item: <span class="font-medium">{{ adjustmentStock?.item?.name }}</span></p>
              <p class="text-sm text-gray-600">Warehouse: <span class="font-medium">{{ adjustmentStock?.warehouse?.name }}</span></p>
              <p class="text-sm text-gray-600">Current Stock: <span class="font-bold text-blue-600">{{ adjustmentStock?.quantity }}</span></p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Adjustment Type</label>
                <select
                  v-model="adjustmentType"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="add">Add Stock (+)</option>
                  <option value="subtract">Remove Stock (-)</option>
                  <option value="set">Set Exact Amount</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ adjustmentType === 'set' ? 'New Quantity' : 'Adjustment Quantity' }}
                </label>
                <input
                  v-model.number="adjustmentQuantity"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Reason (Optional)</label>
                <textarea
                  v-model="adjustmentReason"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter reason for adjustment..."
                ></textarea>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800">
                  <strong>Result:</strong>
                  {{ getAdjustmentResult() }}
                </p>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <button
                @click="showAdjustmentModal = false"
                class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                @click="confirmAdjustment"
                :disabled="!adjustmentQuantity || submitting"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
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
              <h3 class="text-lg font-bold text-gray-900">Delete Stock Entry</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete the stock entry for "{{ stockToDelete?.item?.name }}" in "{{ stockToDelete?.warehouse?.name }}"?
              <span class="text-red-600 font-medium">
                This action cannot be undone.
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

      <!-- Color Distribution Modal -->
      <div
        v-if="showColorModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Manage Color Distribution</h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ currentStockForColors?.item?.name }} - {{ currentStockForColors?.warehouse?.name }}
              </p>
            </div>
            <button
              @click="closeColorModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6">
            <!-- Stock Summary -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-xs text-gray-600 mb-1">Total Stock</p>
                  <p class="text-2xl font-bold text-gray-900">{{ currentStockForColors?.quantity || 0 }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">Distributed</p>
                  <p class="text-2xl font-bold text-blue-600">{{ getTotalDistributed() }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">Remaining</p>
                  <p class="text-2xl font-bold" :class="(currentStockForColors?.quantity || 0) - getTotalDistributed() < 0 ? 'text-red-600' : 'text-green-600'">
                    {{ (currentStockForColors?.quantity || 0) - getTotalDistributed() }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Add Color Form -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Add Color Distribution</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    v-model="colorForm.colorCategoryId"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No Specific Color</option>
                    <option
                      v-for="color in availableColors"
                      :key="color.id"
                      :value="color.id"
                    >
                      {{ color.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div class="flex space-x-2">
                    <input
                      v-model.number="colorForm.quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      @click="addColorDistribution"
                      :disabled="!colorForm.quantity"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Color Distributions List -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Current Distributions</h4>
              <div v-if="colorDistributions.length === 0" class="text-center py-8 text-gray-500">
                <SwatchIcon class="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p class="text-sm">No color distributions yet</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="dist in colorDistributions"
                  :key="dist.id"
                  class="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div
                          class="w-10 h-10 rounded-xl border-2 border-gray-200 shadow-sm flex-shrink-0"
                          :style="{ backgroundColor: dist.colorCategory?.hexCode || '#CCCCCC' }"
                        ></div>
                        <div>
                          <p class="text-sm font-semibold text-gray-900">{{ dist.colorCategory?.name || 'No Specific Color' }}</p>
                          <p class="text-xs text-gray-500">{{ dist.colorCategory?.hexCode || '#CCCCCC' }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-4">
                        <div class="text-right">
                          <p class="text-lg font-bold text-indigo-600">{{ dist.quantity }}</p>
                          <p class="text-xs text-gray-500">
                            {{ getTotalDistributed() > 0 ? Math.round((dist.quantity / getTotalDistributed()) * 100) : 0 }}%
                          </p>
                        </div>
                        <button
                          @click="deleteColorDistribution(dist.id)"
                          class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        :style="{
                          width: `${getTotalDistributed() > 0 ? (dist.quantity / getTotalDistributed()) * 100 : 0}%`,
                          backgroundColor: dist.colorCategory?.hexCode || '#CCCCCC'
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end p-6 border-t border-gray-200">
            <button
              @click="closeColorModal"
              class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              Close
            </button>
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
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
  NoSymbolIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  AdjustmentsVerticalIcon,
  SwatchIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'
import { Configs } from '@/utils/Configs'
import ColorCategoryService from '@/services/colorCategoryService'
import StockDistributionService from '@/services/stockDistributionService'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL =  Configs.API_BASE_URL

// Reactive data
const itemStocks = ref([])
const availableItems = ref([])
const availableWarehouses = ref([])
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
const selectedWarehouse = ref('')
const selectedItem = ref('')
const selectedStockLevel = ref('')

// Modal states
const showModal = ref(false)
const showAdjustmentModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const stockToDelete = ref(null)
const adjustmentStock = ref(null)

// Adjustment modal data
const adjustmentType = ref('add')
const adjustmentQuantity = ref(null)
const adjustmentReason = ref('')

// Form data
const form = ref({
  id: null,
  itemId: '',
  warehouseId: '',
  quantity: null,
  reorderPoint: 10,
})

// Color distribution states
const availableColors = ref([])
const showColorModal = ref(false)
const currentStockForColors = ref(null)
const colorDistributions = ref([])
const colorForm = ref({
  id: null,
  colorCategoryId: '',
  quantity: 0,
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

const fetchItemStocks = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/items/item-stocks')
    itemStocks.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch inventory', err.message)
    error.value = `Failed to fetch inventory: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fetchItems = async () => {
  try {
    const data = await apiCall('/items')
    availableItems.value = data
  } catch (err) {
    console.error('Failed to fetch items:', err)
    availableItems.value = []
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
      { id: 1, name: 'Main Warehouse' },
      { id: 2, name: 'Secondary Warehouse' }
    ]
  }
}

const fetchColors = async () => {
  try {
    const data = await ColorCategoryService.getAll()
    availableColors.value = data
  } catch (err) {
    console.error('Failed to fetch color categories:', err)
    availableColors.value = []
  }
}

const createStock = async (stockData) => {
  submitting.value = true
  try {
    const newStock = await apiCall('/items/item-stocks', {
      method: 'POST',
      body: JSON.stringify(stockData),
    })
    itemStocks.value.push(newStock)
    swalAlert.value?.showSuccess('Stock entry created successfully')
    return newStock
  } catch (err) {
    swalAlert.value?.showError('Failed to create stock entry', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateStock = async (id, stockData) => {
  submitting.value = true
  try {
    const updatedStock = await apiCall(`/items/item-stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    })
    const index = itemStocks.value.findIndex((stock) => stock.id === id)
    if (index !== -1) {
      itemStocks.value[index] = updatedStock
    }
    swalAlert.value?.showSuccess('Stock entry updated successfully')
    return updatedStock
  } catch (err) {
    swalAlert.value?.showError('Failed to update stock entry', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteStockApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/items/item-stocks/${id}`, {
      method: 'DELETE',
    })
    itemStocks.value = itemStocks.value.filter((stock) => stock.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Stock entry deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete stock entry', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Color Distribution Functions
const fetchStockDistributions = async (itemStockId) => {
  try {
    const distributions = await StockDistributionService.getByItemStock(itemStockId)
    colorDistributions.value = distributions
  } catch (err) {
    console.error('Failed to fetch distributions:', err)
    colorDistributions.value = []
  }
}

const openColorModal = async (stock) => {
  currentStockForColors.value = stock
  await fetchStockDistributions(stock.id)
  showColorModal.value = true
}

const closeColorModal = () => {
  showColorModal.value = false
  currentStockForColors.value = null
  colorDistributions.value = []
  colorForm.value = {
    id: null,
    colorCategoryId: '',
    quantity: 0,
  }
}

const addColorDistribution = async () => {
  if (!currentStockForColors.value || !colorForm.value.quantity) return

  try {
    const data = {
      itemStockId: currentStockForColors.value.id,
      colorCategoryId: colorForm.value.colorCategoryId || null,
      quantity: colorForm.value.quantity,
    }

    await StockDistributionService.create(data)
    await fetchStockDistributions(currentStockForColors.value.id)
    await fetchItemStocks() // Refresh main data

    colorForm.value = {
      id: null,
      colorCategoryId: '',
      quantity: 0,
    }

    swalAlert.value?.showSuccess('Color distribution added successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to add distribution', err.message)
  }
}

const deleteColorDistribution = async (distributionId) => {
  if (!confirm('Delete this color distribution?')) return

  try {
    await StockDistributionService.delete(distributionId)
    await fetchStockDistributions(currentStockForColors.value.id)
    await fetchItemStocks() // Refresh main data
    swalAlert.value?.showSuccess('Distribution deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete distribution', err.message)
  }
}

const getTotalDistributed = () => {
  return colorDistributions.value.reduce((sum, dist) => sum + (dist.quantity || 0), 0)
}

const getColorName = (colorId) => {
  if (!colorId) return 'No Color'
  const color = availableColors.value.find(c => c.id === colorId)
  return color ? color.name : 'Unknown'
}

const getColorHex = (colorId) => {
  if (!colorId) return '#CCCCCC'
  const color = availableColors.value.find(c => c.id === colorId)
  return color?.hexCode || '#CCCCCC'
}

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedWarehouse.value || selectedItem.value || selectedStockLevel.value
})

const filteredStocks = computed(() => {
  let filtered = itemStocks.value.filter(stock => {
    const matchesSearch = (stock.item?.name && stock.item.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (stock.warehouse?.name && stock.warehouse.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      stock.id.toString().includes(searchTerm.value)

    const matchesWarehouse = selectedWarehouse.value === '' ||
      (stock.warehouse && stock.warehouse.id.toString() === selectedWarehouse.value.toString())

    const matchesItem = selectedItem.value === '' ||
      (stock.item && stock.item.id.toString() === selectedItem.value.toString())

    const matchesStockLevel = selectedStockLevel.value === '' ||
      checkStockLevel(stock.quantity, stock.reorderPoint, selectedStockLevel.value)

    return matchesSearch && matchesWarehouse && matchesItem && matchesStockLevel
  })

  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value] || 0
      let bVal = b[sortField.value] || 0

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return filtered
})

const paginatedStocks = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredStocks.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredStocks.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredStocks.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredStocks.value.length)
})

// Stats computed properties
const totalItems = computed(() => {
  const uniqueItems = new Set(itemStocks.value.map(stock => stock.item?.id).filter(Boolean))
  return uniqueItems.size
})

const totalQuantity = computed(() => {
  return itemStocks.value.reduce((sum, stock) => sum + (stock.quantity || 0), 0)
})

const lowStockItems = computed(() => {
  return itemStocks.value.filter(stock => {
    const reorderPoint = stock.reorderPoint || 10
    return stock.quantity > 0 && stock.quantity <= reorderPoint
  }).length
})

const outOfStockItems = computed(() => {
  return itemStocks.value.filter(stock => stock.quantity === 0).length
})

// Color distribution summary across all inventory
const colorDistributionSummary = computed(() => {
  const colorMap = new Map()

  itemStocks.value.forEach(stock => {
    if (stock.distributions && stock.distributions.length > 0) {
      stock.distributions.forEach(dist => {
        const colorId = dist.colorCategory?.id || 'no-color'
        const colorName = dist.colorCategory?.name || 'No Color'
        const colorHex = dist.colorCategory?.hexCode || '#CCCCCC'

        if (colorMap.has(colorId)) {
          const existing = colorMap.get(colorId)
          existing.quantity += dist.quantity || 0
        } else {
          colorMap.set(colorId, {
            id: colorId,
            name: colorName,
            hexCode: colorHex,
            quantity: dist.quantity || 0
          })
        }
      })
    }
  })

  return Array.from(colorMap.values()).sort((a, b) => b.quantity - a.quantity)
})

// Utility methods
const formatNumber = (number) => {
  if (!number && number !== 0) return '0'
  return number.toLocaleString()
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}

const getQuantityColor = (quantity, reorderPoint = 10) => {
  if (quantity === 0) return 'text-red-600'
  if (quantity <= reorderPoint) return 'text-orange-600'
  if (quantity > reorderPoint * 3) return 'text-green-600'
  return 'text-gray-900'
}

const getStockLevelColor = (quantity, reorderPoint = 10) => {
  if (quantity === 0) return 'bg-red-100 text-red-800'
  if (quantity <= reorderPoint) return 'bg-orange-100 text-orange-800'
  if (quantity > reorderPoint * 3) return 'bg-blue-100 text-blue-800'
  return 'bg-green-100 text-green-800'
}

const getStockLevelText = (quantity, reorderPoint = 10) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= reorderPoint) return 'Low Stock'
  if (quantity > reorderPoint * 3) return 'Overstock'
  return 'Normal'
}

const checkStockLevel = (quantity, reorderPoint = 10, level) => {
  switch (level) {
    case 'out-of-stock': return quantity === 0
    case 'low-stock': return quantity > 0 && quantity <= reorderPoint
    case 'normal-stock': return quantity > reorderPoint && quantity <= reorderPoint * 3
    case 'overstock': return quantity > reorderPoint * 3
    default: return true
  }
}

const getAdjustmentResult = () => {
  if (!adjustmentStock.value || !adjustmentQuantity.value) return 'Enter quantity to see result'

  const current = adjustmentStock.value.quantity
  let result = current

  switch (adjustmentType.value) {
    case 'add':
      result = current + adjustmentQuantity.value
      break
    case 'subtract':
      result = Math.max(0, current - adjustmentQuantity.value)
      break
    case 'set':
      result = adjustmentQuantity.value
      break
  }

  return `Stock will be: ${result} (currently ${current})`
}

const clearFilters = () => {
  selectedWarehouse.value = ''
  selectedItem.value = ''
  selectedStockLevel.value = ''
  currentPage.value = 1
}

const exportStocks = () => {
  const csvData = filteredStocks.value.map(stock => ({
    ID: stock.id,
    Item: stock.item?.name || 'Unknown',
    Warehouse: stock.warehouse?.name || 'Unknown',
    'Current Stock': stock.quantity,
    'Reorder Point': stock.reorderPoint || 10,
    'Stock Level': getStockLevelText(stock.quantity, stock.reorderPoint),
    'Last Updated': formatDate(stock.updatedAt)
  }))

  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'inventory-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedStocks.value.map((stock) => stock.id))
    selectAll.value = true
  }
}

const handleSelectItem = (stockId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(stockId)
  } else {
    newSelected.delete(stockId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedStocks.value.length && paginatedStocks.value.length > 0
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
    itemId: '',
    warehouseId: '',
    quantity: null,
    reorderPoint: 10,
  }
  showModal.value = true
}

const openEditModal = (stock) => {
  isEditing.value = true
  form.value = {
    id: stock.id,
    itemId: stock.item?.id || '',
    warehouseId: stock.warehouse?.id || '',
    quantity: stock.quantity,
    reorderPoint: stock.reorderPoint || 10,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    itemId: '',
    warehouseId: '',
    quantity: null,
    reorderPoint: 10,
  }
  error.value = ''
}

const saveStock = async () => {
  try {
    const stockData = {
      itemId: form.value.itemId,
      warehouseId: form.value.warehouseId,
      quantity: form.value.quantity,
      reorderPoint: form.value.reorderPoint,
    }

    if (isEditing.value) {
      await updateStock(form.value.id, stockData)
    } else {
      await createStock(stockData)
    }

    closeModal()
  } catch (err) {
    console.error('Failed to save stock:', err)
  }
}

const openAdjustmentModal = (stock) => {
  adjustmentStock.value = stock
  adjustmentType.value = 'add'
  adjustmentQuantity.value = null
  adjustmentReason.value = ''
  showAdjustmentModal.value = true
}

const confirmAdjustment = async () => {
  if (!adjustmentStock.value || !adjustmentQuantity.value) return

  const current = adjustmentStock.value.quantity
  let newQuantity = current

  switch (adjustmentType.value) {
    case 'add':
      newQuantity = current + adjustmentQuantity.value
      break
    case 'subtract':
      newQuantity = Math.max(0, current - adjustmentQuantity.value)
      break
    case 'set':
      newQuantity = adjustmentQuantity.value
      break
  }

  try {
    await updateStock(adjustmentStock.value.id, { quantity: newQuantity })
    showAdjustmentModal.value = false
    adjustmentStock.value = null
  } catch (err) {
    console.error('Failed to adjust stock:', err)
  }
}

const duplicateStock = (stock) => {
  isEditing.value = false
  form.value = {
    id: null,
    itemId: stock.item?.id || '',
    warehouseId: '', // Leave empty for user to select different warehouse
    quantity: stock.quantity,
    reorderPoint: stock.reorderPoint || 10,
  }
  showModal.value = true
}

const deleteStock = (stock) => {
  stockToDelete.value = stock
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (stockToDelete.value) {
    try {
      await deleteStockApi(stockToDelete.value.id)
      showDeleteModal.value = false
      stockToDelete.value = null
    } catch (err) {
      console.error('Failed to delete stock:', err)
    }
  }
}

const viewStockHistory = (stock) => {
  const historyInfo = `Stock History for ${stock.item?.name} at ${stock.warehouse?.name}\n\nCurrent Stock: ${formatNumber(stock.quantity)}\nReorder Point: ${formatNumber(stock.reorderPoint || 10)}\nStock Level: ${getStockLevelText(stock.quantity, stock.reorderPoint)}\nLast Updated: ${formatDate(stock.updatedAt)}`
  alert(historyInfo)
}

// Bulk operations
const openBulkAdjustmentModal = () => {
  if (selectedItems.value.size === 0) {
    swalAlert.value?.showWarning('No stock records selected', 'Please select stock records to adjust')
    return
  }
  // Implementation for bulk adjustment modal
  swalAlert.value?.showInfo('Bulk Adjustment', 'Bulk adjustment feature coming soon')
}

const bulkAdjustStock = () => {
  if (selectedItems.value.size === 0) return
  swalAlert.value?.showInfo('Bulk Stock Adjustment', 'This feature will allow you to adjust multiple stock levels at once')
}

const bulkUpdateReorderPoint = () => {
  if (selectedItems.value.size === 0) return
  swalAlert.value?.showInfo('Bulk Reorder Point Update', 'This feature will allow you to update reorder points for multiple items')
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} stock record${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteStockApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected stock records deleted successfully')
    } catch (err) {
      console.error('Failed to delete some stock records:', err)
      swalAlert.value?.showError('Failed to delete some stock records', 'Please try again')
    }
  }
}

// Other actions
const refreshStocks = async () => {
  await fetchItemStocks()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchItemStocks(), fetchItems(), fetchWarehouses(), fetchColors()])
})
</script>
