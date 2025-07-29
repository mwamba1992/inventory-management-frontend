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
        <span class="text-gray-700 font-medium">Item Prices</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Item Price Management
            </h1>
            <p class="text-gray-600 mt-2">Manage item pricing, profit margins and cost analysis</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshPrices"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="openBulkUpdateModal"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PencilSquareIcon class="w-4 h-4 mr-2" />
              Bulk Update
            </button>
            <button
              @click="exportPrices"
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
              Add Price
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-4">
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
              <label class="text-sm font-medium text-gray-700">Status:</label>
              <select
                v-model="selectedStatus"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Profit Margin:</label>
              <select
                v-model="selectedProfitRange"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Ranges</option>
                <option value="0-10">0% - 10%</option>
                <option value="10-25">10% - 25%</option>
                <option value="25-50">25% - 50%</option>
                <option value="50+">50%+</option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedItem || selectedStatus || selectedProfitRange"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <XMarkIcon class="w-4 h-4 inline mr-1" />
              Clear Filters
            </button>
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
              <p class="text-sm font-medium text-gray-600">Total Prices</p>
              <p class="text-2xl font-bold text-gray-900">{{ itemPrices.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <CurrencyDollarIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Prices</p>
              <p class="text-2xl font-bold text-gray-900">{{ activePrices }}</p>
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
              <p class="text-sm font-medium text-gray-600">Avg Profit Margin</p>
              <p class="text-2xl font-bold text-gray-900">{{ averageProfitMargin }}%</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <ChartBarIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">High Margin Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ highMarginItems }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <TrendingUpIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Items with Prices</p>
              <p class="text-2xl font-bold text-gray-900">{{ uniqueItemsCount }}</p>
            </div>
            <div class="p-3 bg-indigo-100 rounded-xl">
              <CubeIcon class="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Prices Table -->
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
                  placeholder="Search prices..."
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
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Purchase Amount</span>
              </th>
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Freight Amount</span>
              </th>
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Total Cost</span>
              </th>
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Profit Margin</span>
              </th>
              <th class="p-4 text-right">
                <span class="text-sm font-semibold text-gray-900">Selling Price</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Status</span>
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
                  <span class="text-gray-500">Loading prices...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedPrices.length === 0">
              <td colspan="10" class="p-12 text-center text-gray-500">
                <CurrencyDollarIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ hasActiveFilters || searchTerm ? 'No prices found' : 'No prices yet' }}
                </p>
                <p class="text-sm">
                  {{
                    hasActiveFilters || searchTerm
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first item price to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="price in paginatedPrices"
              :key="price.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(price.id)"
                  @change="handleSelectItem(price.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ price.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                  >
                    <CurrencyDollarIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ price.item?.name || 'Unknown Item' }}</p>
                    <p class="text-xs text-gray-500">Item #{{ price.item?.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 text-right">
                <span class="text-sm font-medium text-gray-900">TZS {{ formatCurrency(price.purchaseAmount) }}</span>
              </td>
              <td class="p-4 text-right">
                <span class="text-sm font-medium text-gray-900">TZS {{ formatCurrency(price.freightAmount) }}</span>
              </td>
              <td class="p-4 text-right">
                <span class="text-sm font-medium text-blue-600">TZS {{ formatCurrency(calculateTotalCost(price)) }}</span>
              </td>
              <td class="p-4 text-right">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getProfitMarginColor(price.profitMargin)"
                >
                  {{ price.profitMargin }}%
                </span>
              </td>
              <td class="p-4 text-right">
                <div class="flex flex-col items-end">
                  <span class="text-sm font-bold text-gray-900">TZS {{ formatCurrency(price.sellingPrice) }}</span>
                  <span
                    v-if="getSuggestedPrice(price) !== price.sellingPrice"
                    class="text-xs text-orange-600"
                    :title="`Suggested: TZS ${formatCurrency(getSuggestedPrice(price))}`"
                  >
                    Suggested: TZS {{ formatCurrency(getSuggestedPrice(price)) }}
                  </span>
                </div>
              </td>
              <td class="p-4 text-center">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': price.isActive,
                    'bg-red-100 text-red-800': !price.isActive
                  }"
                >
                  {{ price.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(price)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Price"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="togglePriceStatus(price)"
                    class="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                    :title="price.isActive ? 'Deactivate Price' : 'Activate Price'"
                  >
                    <EyeSlashIcon v-if="price.isActive" class="w-4 h-4" />
                    <EyeIcon v-else class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewPriceHistory(price)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="View Price History"
                  >
                    <ClockIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicatePrice(price)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Duplicate Price"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deletePrice(price)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Price"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredPrices.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-blue-600">
              (filtered from {{ itemPrices.length }} total)
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
              {{ selectedItems.size }} price{{ selectedItems.size !== 1 ? 's' : '' }} selected
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkActivate"
                class="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Activate Selected
              </button>
              <button
                @click="bulkDeactivate"
                class="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Deactivate Selected
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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Edit Item Price' : 'Create New Item Price' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="savePrice" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Item Selection -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeIcon class="w-5 h-5 mr-2" />
                  Item Selection
                </h4>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Item *</label>
                <select
                  v-model="form.itemId"
                  required
                  @change="updateCalculatedPrice"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Item</option>
                  <option
                    v-for="item in availableItems"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }} - {{ item.category?.code || 'No Category' }}
                  </option>
                </select>
              </div>

              <!-- Cost Information -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalculatorIcon class="w-5 h-5 mr-2" />
                  Cost Information
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Purchase Amount *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">TZS</span>
                  <input
                    v-model.number="form.purchaseAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    @input="updateCalculatedPrice"
                    class="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Freight Amount *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">TZS</span>
                  <input
                    v-model.number="form.freightAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    @input="updateCalculatedPrice"
                    class="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Profit Margin (%) *</label>
                <div class="relative">
                  <input
                    v-model.number="form.profitMargin"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000"
                    required
                    @input="updateCalculatedPrice"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                  <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Selling Price *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">TZS</span>
                  <input
                    v-model.number="form.sellingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Calculated price: TZS {{ formatCurrency(calculatedPrice) }}
                </p>
              </div>

              <!-- Status -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon class="w-5 h-5 mr-2" />
                  Status
                </h4>
              </div>

              <div class="md:col-span-2">
                <div class="flex items-center">
                  <input
                    id="isActive"
                    v-model="form.isActive"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label for="isActive" class="ml-2 text-sm text-gray-700">
                    Active Price
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Only active prices are used for selling calculations
                </p>
              </div>

              <!-- Price Summary -->
              <div v-if="form.purchaseAmount && form.freightAmount" class="md:col-span-2 bg-gray-50 rounded-lg p-4">
                <h5 class="text-sm font-semibold text-gray-700 mb-3">Price Summary</h5>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Purchase Amount:</span>
                    <span class="font-medium">TZS {{ formatCurrency(form.purchaseAmount || 0) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Freight Amount:</span>
                    <span class="font-medium">TZS {{ formatCurrency(form.freightAmount || 0) }}</span>
                  </div>
                  <div class="flex justify-between font-semibold">
                    <span class="text-gray-900">Total Cost:</span>
                    <span class="text-blue-600">TZS {{ formatCurrency((form.purchaseAmount || 0) + (form.freightAmount || 0)) }}</span>
                  </div>
                  <div class="flex justify-between font-semibold">
                    <span class="text-gray-900">Profit Margin:</span>
                    <span class="text-purple-600">{{ form.profitMargin || 0 }}%</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span class="text-gray-900">Calculated Price:</span>
                    <span class="text-green-600">TZS {{ formatCurrency(calculatedPrice) }}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span class="text-gray-900">Selling Price:</span>
                    <span class="text-orange-600">TZS {{ formatCurrency(form.sellingPrice || 0) }}</span>
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
                type="button"
                @click="useSuggestedPrice"
                v-if="calculatedPrice !== form.sellingPrice"
                class="px-6 py-3 border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-all duration-200 font-medium"
              >
                Use Suggested Price
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
                  {{ isEditing ? 'Update Price' : 'Create Price' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bulk Update Modal -->
      <div
        v-if="showBulkModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">Bulk Price Update</h3>
            <button
              @click="showBulkModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Update Type</label>
                <select
                  v-model="bulkUpdateType"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="profit_margin">Profit Margin</option>
                  <option value="purchase_increase">Purchase Amount Increase (%)</option>
                  <option value="selling_increase">Selling Price Increase (%)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ bulkUpdateType === 'profit_margin' ? 'New Profit Margin (%)' : 'Increase Percentage (%)' }}
                </label>
                <input
                  v-model.number="bulkUpdateValue"
                  type="number"
                  step="0.01"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                />
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-sm text-yellow-800">
                  This will update all selected prices. This action cannot be undone.
                </p>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <button
                @click="showBulkModal = false"
                class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                @click="confirmBulkUpdate"
                :disabled="!bulkUpdateValue || submitting"
                class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 font-medium disabled:opacity-50"
              >
                Update Prices
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
              <h3 class="text-lg font-bold text-gray-900">Delete Price</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete the price for "{{ priceToDelete?.item?.name }}"?
              <span class="text-red-600 font-medium">
                This action cannot be undone and may affect pricing calculations.
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
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CubeIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  CalculatorIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = Configs.API_BASE_URL
// Reactive data
const itemPrices = ref([])
const availableItems = ref([])
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
const selectedItem = ref('')
const selectedStatus = ref('')
const selectedProfitRange = ref('')

// Modal states
const showModal = ref(false)
const showBulkModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const priceToDelete = ref(null)

// Bulk update
const bulkUpdateType = ref('profit_margin')
const bulkUpdateValue = ref(null)

// Form data
const form = ref({
  id: null,
  itemId: '',
  purchaseAmount: null,
  freightAmount: null,
  profitMargin: null,
  sellingPrice: null,
  isActive: true,
})

const calculatedPrice = ref(0)

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

const fetchItemPrices = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/items/item-prices')
    itemPrices.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch item prices', err.message)
    error.value = `Failed to fetch item prices: ${err.message}`
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
    // Fallback items if API fails
    availableItems.value = [
      { id: 1, name: 'Sample Item 1', category: { code: 'CAT1' } },
      { id: 2, name: 'Sample Item 2', category: { code: 'CAT2' } }
    ]
  }
}

const createPrice = async (priceData) => {
  submitting.value = true
  try {
    const newPrice = await apiCall('/items/item-prices', {
      method: 'POST',
      body: JSON.stringify(priceData),
    })
    itemPrices.value.push(newPrice)
    swalAlert.value?.showSuccess('Item price created successfully')
    return newPrice
  } catch (err) {
    swalAlert.value?.showError('Failed to create item price', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updatePrice = async (id, priceData) => {
  submitting.value = true
  try {
    const updatedPrice = await apiCall(`/items/item-prices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(priceData),
    })
    const index = itemPrices.value.findIndex((price) => price.id === id)
    if (index !== -1) {
      itemPrices.value[index] = updatedPrice
    }
    swalAlert.value?.showSuccess('Item price updated successfully')
    return updatedPrice
  } catch (err) {
    swalAlert.value?.showError('Failed to update item price', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deletePriceApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/items/item-prices/${id}`, {
      method: 'DELETE',
    })
    itemPrices.value = itemPrices.value.filter((price) => price.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Item price deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete item price', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const togglePriceStatusApi = async (id, isActive) => {
  submitting.value = true
  try {
    const updatedPrice = await apiCall(`/items/item-prices/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    })
    const index = itemPrices.value.findIndex((price) => price.id === id)
    if (index !== -1) {
      itemPrices.value[index] = updatedPrice
    }
    swalAlert.value?.showSuccess(`Price ${isActive ? 'activated' : 'deactivated'} successfully`)
    return updatedPrice
  } catch (err) {
    swalAlert.value?.showError('Failed to update price status', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedItem.value || selectedStatus.value || selectedProfitRange.value
})

const filteredPrices = computed(() => {
  let filtered = itemPrices.value.filter(price => {
    const matchesSearch = (price.item?.name && price.item.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      price.id.toString().includes(searchTerm.value)

    const matchesItem = selectedItem.value === '' ||
      (price.item && price.item.id.toString() === selectedItem.value.toString())

    const matchesStatus = selectedStatus.value === '' ||
      price.isActive.toString() === selectedStatus.value

    const matchesProfitRange = selectedProfitRange.value === '' ||
      checkProfitRange(price.profitMargin, selectedProfitRange.value)

    return matchesSearch && matchesItem && matchesStatus && matchesProfitRange
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

const paginatedPrices = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredPrices.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPrices.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredPrices.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredPrices.value.length)
})

// Stats computed properties
const activePrices = computed(() => {
  return itemPrices.value.filter((price) => price.isActive).length
})

const averageProfitMargin = computed(() => {
  if (itemPrices.value.length === 0) return 0
  const sum = itemPrices.value.reduce((acc, price) => acc + (price.profitMargin || 0), 0)
  return (sum / itemPrices.value.length).toFixed(1)
})

const highMarginItems = computed(() => {
  return itemPrices.value.filter((price) => price.profitMargin >= 25).length
})

const uniqueItemsCount = computed(() => {
  const itemIds = new Set(itemPrices.value.map(price => price.item?.id).filter(Boolean))
  return itemIds.size
})

// Utility methods
const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const calculateTotalCost = (price) => {
  return (price.purchaseAmount || 0) + (price.freightAmount || 0)
}

const getSuggestedPrice = (price) => {
  const totalCost = calculateTotalCost(price)
  const profitAmount = totalCost * (price.profitMargin / 100)
  return totalCost + profitAmount
}

const getProfitMarginColor = (margin) => {
  if (margin >= 50) return 'bg-green-100 text-green-800'
  if (margin >= 25) return 'bg-blue-100 text-blue-800'
  if (margin >= 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const checkProfitRange = (margin, range) => {
  switch (range) {
    case '0-10': return margin >= 0 && margin < 10
    case '10-25': return margin >= 10 && margin < 25
    case '25-50': return margin >= 25 && margin < 50
    case '50+': return margin >= 50
    default: return true
  }
}

const updateCalculatedPrice = () => {
  if (form.value.purchaseAmount && form.value.freightAmount && form.value.profitMargin) {
    const totalCost = (form.value.purchaseAmount || 0) + (form.value.freightAmount || 0)
    const profitAmount = totalCost * (form.value.profitMargin / 100)
    calculatedPrice.value = totalCost + profitAmount

    if (!form.value.sellingPrice) {
      form.value.sellingPrice = calculatedPrice.value
    }
  }
}

const useSuggestedPrice = () => {
  form.value.sellingPrice = calculatedPrice.value
}

const clearFilters = () => {
  selectedItem.value = ''
  selectedStatus.value = ''
  selectedProfitRange.value = ''
  currentPage.value = 1
}

const exportPrices = () => {
  const csvData = filteredPrices.value.map(price => ({
    ID: price.id,
    Item: price.item?.name || 'Unknown',
    'Purchase Amount': price.purchaseAmount,
    'Freight Amount': price.freightAmount,
    'Total Cost': calculateTotalCost(price),
    'Profit Margin (%)': price.profitMargin,
    'Selling Price': price.sellingPrice,
    'Suggested Price': getSuggestedPrice(price).toFixed(2),
    Status: price.isActive ? 'Active' : 'Inactive'
  }))

  // Simple CSV export
  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'item-prices-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedPrices.value.map((price) => price.id))
    selectAll.value = true
  }
}

const handleSelectItem = (priceId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(priceId)
  } else {
    newSelected.delete(priceId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedPrices.value.length && paginatedPrices.value.length > 0
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
    purchaseAmount: null,
    freightAmount: null,
    profitMargin: null,
    sellingPrice: null,
    isActive: true,
  }
  calculatedPrice.value = 0
  showModal.value = true
}

const openEditModal = (price) => {
  isEditing.value = true
  form.value = {
    id: price.id,
    itemId: price.item?.id || '',
    purchaseAmount: price.purchaseAmount,
    freightAmount: price.freightAmount,
    profitMargin: price.profitMargin,
    sellingPrice: price.sellingPrice,
    isActive: price.isActive,
  }
  updateCalculatedPrice()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    itemId: '',
    purchaseAmount: null,
    freightAmount: null,
    profitMargin: null,
    sellingPrice: null,
    isActive: true,
  }
  calculatedPrice.value = 0
  error.value = ''
}

const savePrice = async () => {
  try {
    const priceData = {
      itemId: form.value.itemId,
      purchaseAmount: form.value.purchaseAmount,
      freightAmount: form.value.freightAmount,
      profitMargin: form.value.profitMargin,
      sellingPrice: form.value.sellingPrice,
      isActive: form.value.isActive,
    }

    if (isEditing.value) {
      await updatePrice(form.value.id, priceData)
    } else {
      await createPrice(priceData)
    }

    closeModal()
  } catch (err) {
    console.error('Failed to save price:', err)
  }
}

const duplicatePrice = (price) => {
  isEditing.value = false
  form.value = {
    id: null,
    itemId: price.item?.id || '',
    purchaseAmount: price.purchaseAmount,
    freightAmount: price.freightAmount,
    profitMargin: price.profitMargin,
    sellingPrice: price.sellingPrice,
    isActive: false, // Set as inactive for duplicates
  }
  updateCalculatedPrice()
  showModal.value = true
}

const deletePrice = (price) => {
  priceToDelete.value = price
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (priceToDelete.value) {
    try {
      await deletePriceApi(priceToDelete.value.id)
      showDeleteModal.value = false
      priceToDelete.value = null
    } catch (err) {
      console.error('Failed to delete price:', err)
    }
  }
}

const togglePriceStatus = async (price) => {
  try {
    await togglePriceStatusApi(price.id, !price.isActive)
  } catch (err) {
    console.error('Failed to toggle price status:', err)
  }
}

const viewPriceHistory = (price) => {
  // This would typically show a history modal with price changes
  const historyInfo = `Price History for ${price.item?.name}\n\nCurrent Price: TZS ${formatCurrency(price.sellingPrice)}\nSuggested Price: TZS ${formatCurrency(getSuggestedPrice(price))}\nProfit Margin: ${price.profitMargin}%\nStatus: ${price.isActive ? 'Active' : 'Inactive'}`
  alert(historyInfo)
}

// Bulk operations
const openBulkUpdateModal = () => {
  if (selectedItems.value.size === 0) {
    swalAlert.value?.showWarning('No prices selected', 'Please select prices to update')
    return
  }
  showBulkModal.value = true
}

const confirmBulkUpdate = async () => {
  if (!bulkUpdateValue.value || selectedItems.value.size === 0) return

  const updatePromises = Array.from(selectedItems.value).map(async (id) => {
    const price = itemPrices.value.find(p => p.id === id)
    if (!price) return

    let updateData = {}

    switch (bulkUpdateType.value) {
      case 'profit_margin':
        updateData.profitMargin = bulkUpdateValue.value
        // Recalculate selling price
        const totalCost = calculateTotalCost(price)
        updateData.sellingPrice = totalCost + (totalCost * (bulkUpdateValue.value / 100))
        break
      case 'purchase_increase':
        updateData.purchaseAmount = price.purchaseAmount * (1 + bulkUpdateValue.value / 100)
        break
      case 'selling_increase':
        updateData.sellingPrice = price.sellingPrice * (1 + bulkUpdateValue.value / 100)
        break
    }

    return updatePrice(id, updateData)
  })

  try {
    await Promise.all(updatePromises)
    selectedItems.value = new Set()
    selectAll.value = false
    showBulkModal.value = false
    bulkUpdateValue.value = null
    swalAlert.value?.showSuccess('Bulk update completed successfully')
  } catch (err) {
    console.error('Failed to update some prices:', err)
    swalAlert.value?.showError('Failed to update some prices', 'Please try again')
  }
}

const bulkActivate = async () => {
  if (selectedItems.value.size === 0) return

  const updatePromises = Array.from(selectedItems.value).map((id) =>
    togglePriceStatusApi(id, true)
  )

  try {
    await Promise.all(updatePromises)
    selectedItems.value = new Set()
    selectAll.value = false
    swalAlert.value?.showSuccess('Selected prices activated successfully')
  } catch (err) {
    console.error('Failed to activate some prices:', err)
    swalAlert.value?.showError('Failed to activate some prices', 'Please try again')
  }
}

const bulkDeactivate = async () => {
  if (selectedItems.value.size === 0) return

  const updatePromises = Array.from(selectedItems.value).map((id) =>
    togglePriceStatusApi(id, false)
  )

  try {
    await Promise.all(updatePromises)
    selectedItems.value = new Set()
    selectAll.value = false
    swalAlert.value?.showSuccess('Selected prices deactivated successfully')
  } catch (err) {
    console.error('Failed to deactivate some prices:', err)
    swalAlert.value?.showError('Failed to deactivate some prices', 'Please try again')
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} price${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deletePriceApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected prices deleted successfully')
    } catch (err) {
      console.error('Failed to delete some prices:', err)
      swalAlert.value?.showError('Failed to delete some prices', 'Please try again')
    }
  }
}

// Other actions
const refreshPrices = async () => {
  await fetchItemPrices()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchItemPrices(), fetchItems()])
})
</script>
