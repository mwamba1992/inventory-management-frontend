<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Sales</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Sales Management</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Sales Management
            </h1>
            <p class="text-gray-600 mt-2">Track and manage all your sales transactions</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshSales"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="exportData"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              @click="openBulkActionsModal"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4 mr-2" />
              Bulk Actions
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Sale
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Customer:</label>
              <select
                v-model="selectedCustomer"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
              >
                <option value="">All Customers</option>
                <option
                  v-for="customer in availableCustomers"
                  :key="customer.id"
                  :value="customer.id"
                >
                  {{ customer.name }}
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
              <label class="text-sm font-medium text-gray-700">Date Range:</label>
              <select
                v-model="selectedDateRange"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedCustomer || selectedItem || selectedWarehouse || selectedDateRange"
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
              <p class="text-sm font-medium text-gray-600">Total Sales</p>
              <p class="text-2xl font-bold text-gray-900">
                TZS{{ totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
            </div>
            <div class="p-3 bg-emerald-100 rounded-xl">
              <CurrencyDollarIcon class="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-green-600 font-medium">+{{ salesThisMonth }} this month</span>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Transactions</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalSales }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <ShoppingCartIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Avg. Sale Value</p>
              <p class="text-2xl font-bold text-gray-900">
                TZS{{ averageSaleValue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <CalculatorIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Quantity</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalQuantitySold.toLocaleString() }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-xl">
              <CubeIcon class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Sales Table -->
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
                  placeholder="Search sales..."
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
                  <span class="text-sm font-semibold text-gray-900">Sale ID</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Customer</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Item</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Warehouse</span>
              </th>
              <th
                class="p-4 text-center cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('quantity')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Quantity</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-right cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('amountPaid')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Amount Paid</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Remarks</span>
              </th>
              <th
                class="p-4 text-center cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('createdAt')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Date</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
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
                  <span class="text-gray-500">Loading sales...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedSales.length === 0">
              <td colspan="10" class="p-12 text-center text-gray-500">
                <ShoppingCartIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ hasActiveFilters || searchTerm ? 'No sales found' : 'No sales yet' }}
                </p>
                <p class="text-sm">
                  {{
                    hasActiveFilters || searchTerm
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first sale to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="sale in paginatedSales"
              :key="sale.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(sale.id)"
                  @change="handleSelectItem(sale.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ sale.id.toString().padStart(4, '0') }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
                  >
                    <span class="text-white font-medium text-sm">{{ getCustomerInitials(sale.customer) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ sale.customer?.name || 'Unknown Customer' }}</p>
                    <p class="text-xs text-gray-500">{{ sale.customer?.phone || 'No phone' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <CubeIcon class="w-4 h-4 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ sale.item?.name || 'Unknown Item' }}</p>
                    <p class="text-xs text-gray-500">Item #{{ sale.item?.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <BuildingStorefrontIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-900">{{ sale.warehouseId?.name || 'Unknown Warehouse' }}</span>
                </div>
              </td>
              <td class="p-4 text-center">
                <span class="text-lg font-bold text-blue-600">
                  {{ Number(sale.quantity || 0).toLocaleString() }}
                </span>
              </td>
              <td class="p-4 text-right">
                <span class="text-lg font-bold text-emerald-600">
                  ${{ Number(sale.amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </td>
              <td class="p-4">
                <div class="max-w-xs">
                  <p class="text-sm text-gray-600 truncate" :title="sale.remarks">
                    {{ sale.remarks || 'No remarks' }}
                  </p>
                </div>
              </td>
              <td class="p-4 text-center">
                <div class="text-sm text-gray-900">{{ formatDate(sale.createdAt) }}</div>
                <div class="text-xs text-gray-500">{{ formatTimeAgo(sale.createdAt) }}</div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewSaleDetails(sale)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(sale)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Edit Sale"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicateSale(sale)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Duplicate Sale"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteSale(sale)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Sale"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredSales.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-blue-600">
              (filtered from {{ sales.length }} total)
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
              {{ selectedItems.size }} sale{{ selectedItems.size !== 1 ? 's' : '' }} selected
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkExport"
                class="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Export Selected
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
              {{ isEditing ? 'Edit Sale' : 'Create New Sale' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveSale" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Customer Selection -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Customer *</label>
                <select
                  v-model="form.customerId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Customer</option>
                  <option
                    v-for="customer in availableCustomers"
                    :key="customer.id"
                    :value="customer.id"
                  >
                    {{ customer.name }} - {{ customer.phone }}
                  </option>
                </select>
              </div>

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
                  min="1"
                  step="1"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="1"
                />
              </div>

              <!-- Amount Paid -->
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Amount Paid *</label>
                <div class="relative">
                  <CurrencyDollarIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model.number="form.amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <!-- Remarks -->
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                <textarea
                  v-model="form.remarks"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional remarks about this sale..."
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
                  {{ isEditing ? 'Update Sale' : 'Create Sale' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Sale Detail Modal -->
      <div
        v-if="showDetailModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">Sale Details</h3>
            <button
              @click="showDetailModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6" v-if="selectedSale">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Sale ID</label>
                <p class="text-lg font-bold text-gray-900">#{{ selectedSale.id.toString().padStart(4, '0') }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Sale Date</label>
                <p class="text-lg font-medium text-gray-900">{{ formatDate(selectedSale.createdAt) }}</p>
                <p class="text-sm text-gray-500">{{ formatTimeAgo(selectedSale.createdAt) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Customer</label>
                <p class="text-lg font-medium text-gray-900">{{ selectedSale.customer?.name || 'Unknown' }}</p>
                <p class="text-sm text-gray-500">{{ selectedSale.customer?.phone || 'No phone' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Item</label>
                <p class="text-lg font-medium text-gray-900">{{ selectedSale.item?.name || 'Unknown' }}</p>
                <p class="text-sm text-gray-500">Item #{{ selectedSale.item?.id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Warehouse</label>
                <p class="text-lg font-medium text-gray-900">{{ selectedSale.warehouseId?.name || 'Unknown' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Quantity</label>
                <p class="text-2xl font-bold text-blue-600">{{ Number(selectedSale.quantity || 0).toLocaleString() }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Amount Paid</label>
                <p class="text-2xl font-bold text-emerald-600">
                  ${{ Number(selectedSale.amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p class="text-lg font-medium text-gray-900">{{ formatDate(selectedSale.updatedAt) }}</p>
                <p class="text-sm text-gray-500">{{ formatTimeAgo(selectedSale.updatedAt) }}</p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-500 mb-1">Remarks</label>
                <p class="text-lg text-gray-900">{{ selectedSale.remarks || 'No remarks' }}</p>
              </div>
            </div>

            <div class="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                @click="editFromDetail"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Edit Sale
              </button>
              <button
                @click="duplicateSale(selectedSale)"
                class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium"
              >
                Duplicate Sale
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
              <h3 class="text-lg font-bold text-gray-900">Delete Sale</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete sale #{{ saleToDelete?.id?.toString().padStart(4, '0') }}?
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
  ShoppingCartIcon,
  CurrencyDollarIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  CubeIcon,
  CalculatorIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://84.247.178.93:3000'

// Reactive data
const sales = ref([])
const availableCustomers = ref([])
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
const selectedCustomer = ref('')
const selectedItem = ref('')
const selectedWarehouse = ref('')
const selectedDateRange = ref('')

// Modal states
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saleToDelete = ref(null)
const selectedSale = ref(null)

// Form data
const form = ref({
  id: null,
  customerId: '',
  itemId: '',
  warehouseId: '',
  quantity: 1,
  amountPaid: 0,
  remarks: '',
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

const fetchSales = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/sales')
    sales.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch sales', err.message)
    error.value = `Failed to fetch sales: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const data = await apiCall('/customers')
    availableCustomers.value = data
  } catch (err) {
    console.error('Failed to fetch customers:', err)
    availableCustomers.value = []
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
    availableWarehouses.value = []
  }
}

const createSale = async (saleData) => {
  submitting.value = true
  try {
    const newSale = await apiCall('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    })
    sales.value.push(newSale)
    swalAlert.value?.showSuccess('Sale created successfully')
    return newSale
  } catch (err) {
    swalAlert.value?.showError('Failed to create sale', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateSale = async (id, saleData) => {
  submitting.value = true
  try {
    const updatedSale = await apiCall(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    })
    const index = sales.value.findIndex((sale) => sale.id === id)
    if (index !== -1) {
      sales.value[index] = updatedSale
    }
    swalAlert.value?.showSuccess('Sale updated successfully')
    return updatedSale
  } catch (err) {
    swalAlert.value?.showError('Failed to update sale', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteSaleApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/sales/${id}`, {
      method: 'DELETE',
    })
    sales.value = sales.value.filter((sale) => sale.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Sale deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete sale', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedCustomer.value || selectedItem.value || selectedWarehouse.value || selectedDateRange.value
})

const filteredSales = computed(() => {
  let filtered = sales.value.filter(sale => {
    const matchesSearch = (sale.customer?.name && sale.customer.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (sale.item?.name && sale.item.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      sale.id.toString().includes(searchTerm.value) ||
      (sale.remarks && sale.remarks.toLowerCase().includes(searchTerm.value.toLowerCase()))

    const matchesCustomer = selectedCustomer.value === '' ||
      (sale.customer && sale.customer.id.toString() === selectedCustomer.value.toString())

    const matchesItem = selectedItem.value === '' ||
      (sale.item && sale.item.id.toString() === selectedItem.value.toString())

    const matchesWarehouse = selectedWarehouse.value === '' ||
      (sale.warehouseId && sale.warehouseId.id.toString() === selectedWarehouse.value.toString())

    const matchesDateRange = selectedDateRange.value === '' ||
      checkDateRange(sale.createdAt, selectedDateRange.value)

    return matchesSearch && matchesCustomer && matchesItem && matchesWarehouse && matchesDateRange
  })

  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortField.value) {
        case 'amountPaid':
          aVal = Number(a.amountPaid)
          bVal = Number(b.amountPaid)
          break
        case 'quantity':
          aVal = Number(a.quantity || 0)
          bVal = Number(b.quantity || 0)
          break
        case 'createdAt':
          aVal = new Date(a.createdAt)
          bVal = new Date(b.createdAt)
          break
        default:
          aVal = a[sortField.value] || 0
          bVal = b[sortField.value] || 0
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

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredSales.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSales.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredSales.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredSales.value.length)
})

// Stats computed properties
const totalSales = computed(() => sales.value.length)

const totalSalesAmount = computed(() => {
  return sales.value.reduce((sum, sale) => sum + Number(sale.amountPaid || 0), 0)
})

const salesThisMonth = computed(() => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return sales.value.filter(sale => new Date(sale.createdAt) >= thisMonth).length
})

const averageSaleValue = computed(() => {
  return sales.value.length > 0 ? totalSalesAmount.value / sales.value.length : 0
})

const totalQuantitySold = computed(() => {
  return sales.value.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0)
})

// Utility methods
const getCustomerInitials = (customer) => {
  if (!customer?.name) return 'U'
  return customer.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}

const formatTimeAgo = (date) => {
  if (!date) return ''
  const now = new Date()
  const diffInMs = now - new Date(date)
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

const checkDateRange = (date, range) => {
  const saleDate = new Date(date)
  const now = new Date()

  switch (range) {
    case 'today':
      return saleDate.toDateString() === now.toDateString()
    case 'week':
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      return saleDate >= weekAgo
    case 'month':
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
      return saleDate >= monthAgo
    case 'quarter':
      const quarterAgo = new Date(now.setMonth(now.getMonth() - 3))
      return saleDate >= quarterAgo
    default:
      return true
  }
}

const clearFilters = () => {
  selectedCustomer.value = ''
  selectedItem.value = ''
  selectedWarehouse.value = ''
  selectedDateRange.value = ''
  currentPage.value = 1
}

const exportData = () => {
  const csvData = filteredSales.value.map(sale => ({
    ID: sale.id,
    Customer: sale.customer?.name || 'Unknown',
    'Customer Phone': sale.customer?.phone || '',
    Item: sale.item?.name || 'Unknown',
    Warehouse: sale.warehouseId?.name || 'Unknown',
    Quantity: sale.quantity || 0,
    'Amount Paid': sale.amountPaid,
    Remarks: sale.remarks || '',
    'Sale Date': formatDate(sale.createdAt),
    'Last Updated': formatDate(sale.updatedAt)
  }))

  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sales-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedSales.value.map((sale) => sale.id))
    selectAll.value = true
  }
}

const handleSelectItem = (saleId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(saleId)
  } else {
    newSelected.delete(saleId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedSales.value.length && paginatedSales.value.length > 0
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
    customerId: '',
    itemId: '',
    warehouseId: '',
    quantity: 1,
    amountPaid: 0,
    remarks: '',
  }
  showModal.value = true
}

const openEditModal = (sale) => {
  isEditing.value = true
  form.value = {
    id: sale.id,
    customerId: sale.customer?.id || '',
    itemId: sale.item?.id || '',
    warehouseId: sale.warehouseId?.id || '',
    quantity: Number(sale.quantity || 1),
    amountPaid: Number(sale.amountPaid),
    remarks: sale.remarks || '',
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    customerId: '',
    itemId: '',
    warehouseId: '',
    quantity: 1,
    amountPaid: 0,
    remarks: '',
  }
  error.value = ''
}

const saveSale = async () => {
  try {
    const saleData = {
      customerId: form.value.customerId,
      itemId: form.value.itemId,
      warehouseId: form.value.warehouseId,
      quantity: form.value.quantity,
      amountPaid: form.value.amountPaid,
      remarks: form.value.remarks,
    }

    if (isEditing.value) {
      await updateSale(form.value.id, saleData)
    } else {
      await createSale(saleData)
    }

    closeModal()
  } catch (err) {
    console.error('Failed to save sale:', err)
  }
}

const viewSaleDetails = (sale) => {
  selectedSale.value = sale
  showDetailModal.value = true
}

const editFromDetail = () => {
  showDetailModal.value = false
  openEditModal(selectedSale.value)
}

const duplicateSale = (sale) => {
  isEditing.value = false
  form.value = {
    id: null,
    customerId: sale.customer?.id || '',
    itemId: sale.item?.id || '',
    warehouseId: sale.warehouseId?.id || '',
    quantity: Number(sale.quantity || 1),
    amountPaid: Number(sale.amountPaid),
    remarks: sale.remarks || '',
  }
  showModal.value = true
}

const deleteSale = (sale) => {
  saleToDelete.value = sale
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (saleToDelete.value) {
    try {
      await deleteSaleApi(saleToDelete.value.id)
      showDeleteModal.value = false
      saleToDelete.value = null
    } catch (err) {
      console.error('Failed to delete sale:', err)
    }
  }
}

// Bulk operations
const openBulkActionsModal = () => {
  if (selectedItems.value.size === 0) {
    swalAlert.value?.showWarning('No sales selected', 'Please select sales for bulk actions')
    return
  }
  swalAlert.value?.showInfo('Bulk Actions', 'Bulk actions feature coming soon')
}

const bulkExport = () => {
  if (selectedItems.value.size === 0) return

  const selectedSales = sales.value.filter(sale => selectedItems.value.has(sale.id))
  const csvData = selectedSales.map(sale => ({
    ID: sale.id,
    Customer: sale.customer?.name || 'Unknown',
    'Customer Phone': sale.customer?.phone || '',
    Item: sale.item?.name || 'Unknown',
    Warehouse: sale.warehouseId?.name || 'Unknown',
    Quantity: sale.quantity || 0,
    'Amount Paid': sale.amountPaid,
    Remarks: sale.remarks || '',
    'Sale Date': formatDate(sale.createdAt),
    'Last Updated': formatDate(sale.updatedAt)
  }))

  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'selected-sales-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)

  swalAlert.value?.showSuccess(`Exported ${selectedItems.value.size} sales successfully`)
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} sale${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteSaleApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected sales deleted successfully')
    } catch (err) {
      console.error('Failed to delete some sales:', err)
      swalAlert.value?.showError('Failed to delete some sales', 'Please try again')
    }
  }
}

// Other actions
const refreshSales = async () => {
  await fetchSales()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchSales(), fetchCustomers(), fetchItems(), fetchWarehouses()])
})
</script>
