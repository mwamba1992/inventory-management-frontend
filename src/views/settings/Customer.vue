<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>CRM</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Customer Management</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Customer Management
            </h1>
            <p class="text-gray-600 mt-2">Manage your customer database and relationships</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshCustomers"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="openBulkActionsModal"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4 mr-2" />
              Bulk Actions
            </button>
            <button
              @click="exportCustomers"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              @click="openImportModal"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <DocumentArrowUpIcon class="w-4 h-4 mr-2" />
              Import
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-4">
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
                <option value="year">This Year</option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Sort By:</label>
              <select
                v-model="selectedSortBy"
                @change="applySorting"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="created-desc">Newest First</option>
                <option value="created-asc">Oldest First</option>
                <option value="updated-desc">Recently Updated</option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedDateRange || searchTerm"
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
              <p class="text-sm font-medium text-gray-600">Total Customers</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalCustomers }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <UsersIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-green-600 font-medium">+{{ newCustomersThisMonth }} this month</span>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">New This Week</p>
              <p class="text-2xl font-bold text-gray-900">{{ newCustomersThisWeek }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <UserPlusIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeCustomersToday }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <ClockIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Growth Rate</p>
              <p class="text-2xl font-bold text-gray-900">{{ growthRate }}%</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <TrendingUpIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Customers Table -->
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
                  placeholder="Search customers..."
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
                <span class="text-sm font-semibold text-gray-900">Customer</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Phone</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Joined</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Last Updated</span>
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
              <td colspan="8" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading customers...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedCustomers.length === 0">
              <td colspan="8" class="p-12 text-center text-gray-500">
                <UsersIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ hasActiveFilters || searchTerm ? 'No customers found' : 'No customers yet' }}
                </p>
                <p class="text-sm">
                  {{
                    hasActiveFilters || searchTerm
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first customer to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="customer in paginatedCustomers"
              :key="customer.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(customer.id)"
                  @change="handleSelectItem(customer.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ customer.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
                  >
                    <span class="text-white font-medium text-sm">{{ getInitials(customer.name) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ customer.name }}</p>
                    <p class="text-xs text-gray-500">Customer ID: #{{ customer.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <PhoneIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-900">{{ customer.phone }}</span>
                </div>
              </td>
              <td class="p-4 text-center">
                <div class="text-sm text-gray-900">{{ formatDate(customer.createdAt) }}</div>
                <div class="text-xs text-gray-500">{{ formatTimeAgo(customer.createdAt) }}</div>
              </td>
              <td class="p-4 text-center">
                <div class="text-sm text-gray-900">{{ formatDate(customer.updatedAt) }}</div>
                <div class="text-xs text-gray-500">{{ formatTimeAgo(customer.updatedAt) }}</div>
              </td>
              <td class="p-4 text-center">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getCustomerStatusColor(customer)"
                >
                  {{ getCustomerStatus(customer) }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewCustomer(customer)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(customer)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Edit Customer"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="contactCustomer(customer)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Contact Customer"
                  >
                    <ChatBubbleLeftRightIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicateCustomer(customer)"
                    class="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                    title="Duplicate Customer"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteCustomer(customer)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Customer"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredCustomers.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-blue-600">
              (filtered from {{ customers.length }} total)
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
              {{ selectedItems.size }} customer{{ selectedItems.size !== 1 ? 's' : '' }} selected
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkExport"
                class="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Export Selected
              </button>
              <button
                @click="bulkContact"
                class="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Contact Selected
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
              {{ isEditing ? 'Edit Customer' : 'Add New Customer' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveCustomer" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Customer Name -->
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter customer name"
                />
              </div>

              <!-- Phone Number -->
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter phone number"
                />
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
                  {{ isEditing ? 'Update Customer' : 'Add Customer' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Customer Detail Modal -->
      <div
        v-if="showDetailModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">Customer Details</h3>
            <button
              @click="showDetailModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="p-6" v-if="selectedCustomer">
            <div class="flex items-center space-x-4 mb-6">
              <div
                class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
              >
                <span class="text-white font-bold text-xl">{{ getInitials(selectedCustomer.name) }}</span>
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-900">{{ selectedCustomer.name }}</h4>
                <p class="text-gray-600">Customer #{{ selectedCustomer.id }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                <p class="text-lg font-medium text-gray-900">{{ selectedCustomer.phone }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getCustomerStatusColor(selectedCustomer)"
                >
                  {{ getCustomerStatus(selectedCustomer) }}
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
                <p class="text-lg font-medium text-gray-900">{{ formatDate(selectedCustomer.createdAt) }}</p>
                <p class="text-sm text-gray-500">{{ formatTimeAgo(selectedCustomer.createdAt) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p class="text-lg font-medium text-gray-900">{{ formatDate(selectedCustomer.updatedAt) }}</p>
                <p class="text-sm text-gray-500">{{ formatTimeAgo(selectedCustomer.updatedAt) }}</p>
              </div>
            </div>

            <div class="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                @click="editFromDetail"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Edit Customer
              </button>
              <button
                @click="contactCustomer(selectedCustomer)"
                class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
              >
                Contact Customer
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
              <h3 class="text-lg font-bold text-gray-900">Delete Customer</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete "{{ customerToDelete?.name }}"?
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
  UsersIcon,
  UserPlusIcon,
  ClockIcon,
  PhoneIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://localhost:3000'

// Reactive data
const customers = ref([])
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
const selectedDateRange = ref('')
const selectedSortBy = ref('name-asc')

// Modal states
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const customerToDelete = ref(null)
const selectedCustomer = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  phone: '',
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

const fetchCustomers = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/customers')
    customers.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch customers', err.message)
    error.value = `Failed to fetch customers: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createCustomer = async (customerData) => {
  submitting.value = true
  try {
    const newCustomer = await apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })
    customers.value.push(newCustomer)
    swalAlert.value?.showSuccess('Customer created successfully')
    return newCustomer
  } catch (err) {
    swalAlert.value?.showError('Failed to create customer', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateCustomer = async (id, customerData) => {
  submitting.value = true
  try {
    const updatedCustomer = await apiCall(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    })
    const index = customers.value.findIndex((customer) => customer.id === id)
    if (index !== -1) {
      customers.value[index] = updatedCustomer
    }
    swalAlert.value?.showSuccess('Customer updated successfully')
    return updatedCustomer
  } catch (err) {
    swalAlert.value?.showError('Failed to update customer', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteCustomerApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/customers/${id}`, {
      method: 'DELETE',
    })
    customers.value = customers.value.filter((customer) => customer.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Customer deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete customer', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedDateRange.value || searchTerm.value
})

const filteredCustomers = computed(() => {
  let filtered = customers.value.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      customer.phone.includes(searchTerm.value) ||
      customer.id.toString().includes(searchTerm.value)

    const matchesDateRange = selectedDateRange.value === '' || checkDateRange(customer.createdAt, selectedDateRange.value)

    return matchesSearch && matchesDateRange
  })

  // Apply sorting
  if (selectedSortBy.value) {
    const [field, direction] = selectedSortBy.value.split('-')
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (field) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'created':
          aVal = new Date(a.createdAt)
          bVal = new Date(b.createdAt)
          break
        case 'updated':
          aVal = new Date(a.updatedAt)
          bVal = new Date(b.updatedAt)
          break
        default:
          aVal = a[field] || 0
          bVal = b[field] || 0
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return filtered
})

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredCustomers.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredCustomers.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredCustomers.value.length)
})

// Stats computed properties
const totalCustomers = computed(() => customers.value.length)

const newCustomersThisMonth = computed(() => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return customers.value.filter(customer => new Date(customer.createdAt) >= thisMonth).length
})

const newCustomersThisWeek = computed(() => {
  const now = new Date()
  const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  return customers.value.filter(customer => new Date(customer.createdAt) >= thisWeek).length
})

const activeCustomersToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return customers.value.filter(customer => new Date(customer.updatedAt) >= today).length
})

const growthRate = computed(() => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const lastMonthCount = customers.value.filter(customer => {
    const createdAt = new Date(customer.createdAt)
    return createdAt >= lastMonth && createdAt < thisMonth
  }).length

  const thisMonthCount = newCustomersThisMonth.value

  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0
  return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
})

// Utility methods
const getInitials = (name) => {
  return name
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

const getCustomerStatus = (customer) => {
  const daysSinceUpdate = Math.floor((new Date() - new Date(customer.updatedAt)) / (1000 * 60 * 60 * 24))
  if (daysSinceUpdate === 0) return 'Active Today'
  if (daysSinceUpdate <= 7) return 'Recent'
  if (daysSinceUpdate <= 30) return 'Active'
  return 'Inactive'
}

const getCustomerStatusColor = (customer) => {
  const status = getCustomerStatus(customer)
  switch (status) {
    case 'Active Today': return 'bg-green-100 text-green-800'
    case 'Recent': return 'bg-blue-100 text-blue-800'
    case 'Active': return 'bg-yellow-100 text-yellow-800'
    case 'Inactive': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const checkDateRange = (date, range) => {
  const customerDate = new Date(date)
  const now = new Date()

  switch (range) {
    case 'today':
      return customerDate.toDateString() === now.toDateString()
    case 'week':
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      return customerDate >= weekAgo
    case 'month':
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
      return customerDate >= monthAgo
    case 'quarter':
      const quarterAgo = new Date(now.setMonth(now.getMonth() - 3))
      return customerDate >= quarterAgo
    case 'year':
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1))
      return customerDate >= yearAgo
    default:
      return true
  }
}

const clearFilters = () => {
  selectedDateRange.value = ''
  searchTerm.value = ''
  currentPage.value = 1
}

const applySorting = () => {
  currentPage.value = 1
}

const exportCustomers = () => {
  const csvData = filteredCustomers.value.map(customer => ({
    ID: customer.id,
    Name: customer.name,
    Phone: customer.phone,
    Status: getCustomerStatus(customer),
    'Joined Date': formatDate(customer.createdAt),
    'Last Updated': formatDate(customer.updatedAt)
  }))

  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'customers-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedCustomers.value.map((customer) => customer.id))
    selectAll.value = true
  }
}

const handleSelectItem = (customerId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(customerId)
  } else {
    newSelected.delete(customerId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedCustomers.value.length && paginatedCustomers.value.length > 0
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
    phone: '',
  }
  showModal.value = true
}

const openEditModal = (customer) => {
  isEditing.value = true
  form.value = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    phone: '',
  }
  error.value = ''
}

const saveCustomer = async () => {
  try {
    const customerData = {
      name: form.value.name,
      phone: form.value.phone,
    }

    if (isEditing.value) {
      await updateCustomer(form.value.id, customerData)
    } else {
      await createCustomer(customerData)
    }

    closeModal()
  } catch (err) {
    console.error('Failed to save customer:', err)
  }
}

const viewCustomer = (customer) => {
  selectedCustomer.value = customer
  showDetailModal.value = true
}

const editFromDetail = () => {
  showDetailModal.value = false
  openEditModal(selectedCustomer.value)
}

const contactCustomer = (customer) => {
  // Implement contact functionality
  swalAlert.value?.showInfo('Contact Customer', `Contacting ${customer.name} at ${customer.phone}`)
}

const duplicateCustomer = (customer) => {
  isEditing.value = false
  form.value = {
    id: null,
    name: `${customer.name} (Copy)`,
    phone: customer.phone,
  }
  showModal.value = true
}

const deleteCustomer = (customer) => {
  customerToDelete.value = customer
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (customerToDelete.value) {
    try {
      await deleteCustomerApi(customerToDelete.value.id)
      showDeleteModal.value = false
      customerToDelete.value = null
    } catch (err) {
      console.error('Failed to delete customer:', err)
    }
  }
}

// Bulk operations
const openBulkActionsModal = () => {
  if (selectedItems.value.size === 0) {
    swalAlert.value?.showWarning('No customers selected', 'Please select customers for bulk actions')
    return
  }
  swalAlert.value?.showInfo('Bulk Actions', 'Bulk actions feature coming soon')
}

const openImportModal = () => {
  swalAlert.value?.showInfo('Import Customers', 'Customer import feature coming soon')
}

const bulkExport = () => {
  if (selectedItems.value.size === 0) return

  const selectedCustomers = customers.value.filter(customer => selectedItems.value.has(customer.id))
  const csvData = selectedCustomers.map(customer => ({
    ID: customer.id,
    Name: customer.name,
    Phone: customer.phone,
    Status: getCustomerStatus(customer),
    'Joined Date': formatDate(customer.createdAt),
    'Last Updated': formatDate(customer.updatedAt)
  }))

  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'selected-customers-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)

  swalAlert.value?.showSuccess(`Exported ${selectedItems.value.size} customers successfully`)
}

const bulkContact = () => {
  if (selectedItems.value.size === 0) return
  swalAlert.value?.showInfo('Bulk Contact', `This feature will allow you to contact ${selectedItems.value.size} customers at once`)
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} customer${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteCustomerApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected customers deleted successfully')
    } catch (err) {
      console.error('Failed to delete some customers:', err)
      swalAlert.value?.showError('Failed to delete some customers', 'Please try again')
    }
  }
}

// Other actions
const refreshCustomers = async () => {
  await fetchCustomers()
}

// Lifecycle
onMounted(async () => {
  await fetchCustomers()
})
</script>
