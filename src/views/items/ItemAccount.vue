<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Accounting</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Item Account Mapping</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Item Account Mapping
            </h1>
            <p class="text-gray-600 mt-2">Configure accounting mappings for inventory items</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshMappings"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="openBulkMappingModal"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <AdjustmentsHorizontalIcon class="w-4 h-4 mr-2" />
              Bulk Map
            </button>
            <button
              @click="exportMappings"
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
              Add Mapping
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Mapping Type:</label>
              <select
                v-model="selectedMappingType"
                @change="currentPage = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Types</option>
                <option value="default">Default</option>
                <option value="seasonal">Seasonal</option>
                <option value="promotional">Promotional</option>
                <option value="special">Special</option>
              </select>
            </div>

            <button
              @click="clearFilters"
              v-if="selectedItem || selectedStatus || selectedMappingType"
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
              <p class="text-sm font-medium text-gray-600">Total Mappings</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalMappings }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <LinkIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Mappings</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeMappings }}</p>
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
              <p class="text-sm font-medium text-gray-600">Unmapped Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ unmappedItems }}</p>
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
              <p class="text-sm font-medium text-gray-600">Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalAccounts }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <BanknotesIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Mappings Table -->
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
                  placeholder="Search mappings..."
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
                <span class="text-sm font-semibold text-gray-900">Sale Account</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Inventory Account</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">COGS Account</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Status</span>
              </th>
              <th class="p-4 text-center">
                <span class="text-sm font-semibold text-gray-900">Type</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
            <tr v-if="loading">
              <td colspan="9" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading mappings...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedMappings.length === 0">
              <td colspan="9" class="p-12 text-center text-gray-500">
                <LinkIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ hasActiveFilters || searchTerm ? 'No mappings found' : 'No account mappings yet' }}
                </p>
                <p class="text-sm">
                  {{
                    hasActiveFilters || searchTerm
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first account mapping to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="mapping in paginatedMappings"
              :key="mapping.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(mapping.id)"
                  @change="handleSelectItem(mapping.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ mapping.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                  >
                    <CubeIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ mapping.item?.name || 'Unknown Item' }}</p>
                    <p class="text-xs text-gray-500">{{ mapping.item?.code || 'No Code' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <BanknotesIcon class="w-4 h-4 text-green-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ mapping.saleAccount?.name || 'Not Set' }}</p>
                    <p class="text-xs text-gray-500">{{ mapping.saleAccount?.code || '' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <ArchiveBoxIcon class="w-4 h-4 text-blue-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ mapping.inventoryAccount?.name || 'Not Set' }}</p>
                    <p class="text-xs text-gray-500">{{ mapping.inventoryAccount?.code || '' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <CalculatorIcon class="w-4 h-4 text-red-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ mapping.costOfGoodsAccount?.name || 'Not Set' }}</p>
                    <p class="text-xs text-gray-500">{{ mapping.costOfGoodsAccount?.code || '' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 text-center">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="mapping.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ mapping.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="p-4 text-center">
                <span class="text-sm text-gray-600 capitalize">{{ mapping.mappingType || 'Default' }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(mapping)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Mapping"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="toggleMappingStatus(mapping)"
                    class="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    :class="mapping.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'"
                    :title="mapping.isActive ? 'Deactivate' : 'Activate'"
                  >
                    <component :is="mapping.isActive ? PauseIcon : PlayIcon" class="w-4 h-4" />
                  </button>
                  <button
                    @click="duplicateMapping(mapping)"
                    class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Duplicate Mapping"
                  >
                    <DocumentDuplicateIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteMapping(mapping)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Mapping"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredMappings.length }} entries
            <span v-if="hasActiveFilters || searchTerm" class="text-blue-600">
              (filtered from {{ accountMappings.length }} total)
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
              {{ selectedItems.size }} mapping{{ selectedItems.size !== 1 ? 's' : '' }} selected
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
                class="text-sm text-orange-600 hover:text-orange-800 font-medium"
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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Edit Account Mapping' : 'Create New Account Mapping' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveMapping" class="p-6">
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
                    {{ item.name }} ({{ item.code }})
                  </option>
                </select>
              </div>

              <!-- Sale Account -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Sale Account *</label>
                <select
                  v-model="form.saleAccountId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Account</option>
                  <option
                    v-for="account in revenueAccounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    {{ account.name }} ({{ account.code.code }})
                  </option>
                </select>
              </div>

              <!-- Inventory Account -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Inventory Account *</label>
                <select
                  v-model="form.inventoryAccountId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Account</option>
                  <option
                    v-for="account in assetAccounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    {{ account.name }} ({{ account.code.code }})
                  </option>
                </select>
              </div>

              <!-- COGS Account -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Cost of Goods Sold Account *</label>
                <select
                  v-model="form.cogsAccountId"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Account</option>
                  <option
                    v-for="account in expenseAccounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    {{ account.name }} ({{ account.code.code }})
                  </option>
                </select>
              </div>

              <!-- Purchase Account -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Purchase Account</label>
                <select
                  v-model="form.purchaseAccountId"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Account (Optional)</option>
                  <option
                    v-for="account in expenseAccounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    {{ account.name }} ({{ account.code }})
                  </option>
                </select>
              </div>

              <!-- Mapping Type -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Mapping Type</label>
                <select
                  v-model="form.mappingType"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="default">Default</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="promotional">Promotional</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <input
                  v-model.number="form.priority"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="1"
                />
                <p class="text-xs text-gray-500 mt-1">Higher number = higher priority</p>
              </div>

              <!-- Effective From -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Effective From</label>
                <input
                  v-model="form.effectiveFrom"
                  type="date"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <!-- Notes -->
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional notes about this mapping..."
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
                  {{ isEditing ? 'Update Mapping' : 'Create Mapping' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Account Mapping</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete the account mapping for "{{ mappingToDelete?.item?.name }}"?
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
  CubeIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
  CalculatorIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://84.247.178.93:3000'

// Reactive data
const accountMappings = ref([])
const availableItems = ref([])
const availableAccounts = ref([])
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
const selectedMappingType = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const mappingToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  itemId: '',
  saleAccountId: '',
  inventoryAccountId: '',
  cogsAccountId: '',
  purchaseAccountId: '',
  mappingType: 'default',
  priority: 1,
  effectiveFrom: new Date().toISOString().split('T')[0],
  notes: ''
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

const fetchAccountMappings = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/items/account-mappings')
    accountMappings.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch account mappings', err.message)
    error.value = `Failed to fetch account mappings: ${err.message}`
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

const fetchAccounts = async () => {
  try {
    const data = await apiCall('/account')
    availableAccounts.value = data
    console.log(availableAccounts)
  } catch (err) {
    console.error('Failed to fetch accounts:', err)
    availableAccounts.value = []
  }
}

const createMapping = async (mappingData) => {
  submitting.value = true
  try {
    const newMapping = await apiCall('/items/account-mappings', {
      method: 'POST',
      body: JSON.stringify(mappingData),
    })
    accountMappings.value.push(newMapping)
    swalAlert.value?.showSuccess('Account mapping created successfully')
    return newMapping
  } catch (err) {
    swalAlert.value?.showError('Failed to create account mapping', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateMapping = async (id, mappingData) => {
  submitting.value = true
  try {
    const updatedMapping = await apiCall(`/items/account-mappings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mappingData),
    })
    const index = accountMappings.value.findIndex((mapping) => mapping.id === id)
    if (index !== -1) {
      accountMappings.value[index] = updatedMapping
    }
    swalAlert.value?.showSuccess('Account mapping updated successfully')
    return updatedMapping
  } catch (err) {
    swalAlert.value?.showError('Failed to update account mapping', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteMappingApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/items/account-mappings/${id}`, {
      method: 'DELETE',
    })
    accountMappings.value = accountMappings.value.filter((mapping) => mapping.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Account mapping deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete account mapping', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedItem.value || selectedStatus.value || selectedMappingType.value
})

const filteredMappings = computed(() => {
  let filtered = accountMappings.value.filter(mapping => {
    const matchesSearch = (mapping.item?.name && mapping.item.name.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (mapping.item?.code && mapping.item.code.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      mapping.id.toString().includes(searchTerm.value)

    const matchesItem = selectedItem.value === '' ||
      (mapping.item && mapping.item.id.toString() === selectedItem.value.toString())

    const matchesStatus = selectedStatus.value === '' ||
      (selectedStatus.value === 'active' ? mapping.isActive : !mapping.isActive)

    const matchesType = selectedMappingType.value === '' ||
      (mapping.mappingType || 'default') === selectedMappingType.value

    return matchesSearch && matchesItem && matchesStatus && matchesType
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

const paginatedMappings = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredMappings.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMappings.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredMappings.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredMappings.value.length)
})

// Stats computed properties
const totalMappings = computed(() => accountMappings.value.length)

const activeMappings = computed(() => {
  return accountMappings.value.filter(mapping => mapping.isActive).length
})

const unmappedItems = computed(() => {
  const mappedItemIds = new Set(accountMappings.value.map(mapping => mapping.item?.id).filter(Boolean))
  return availableItems.value.filter(item => !mappedItemIds.has(item.id)).length
})

const totalAccounts = computed(() => availableAccounts.value.length)

const revenueAccounts = computed(() => {
  return availableAccounts.value.filter(account => account.code.code === '1001')
})

const assetAccounts = computed(() => {
  return availableAccounts.value.filter(account => account.code.code === '1000')
})

const expenseAccounts = computed(() => {
  return availableAccounts.value.filter(account => account.code.code === '1002')
})

// Utility methods
const clearFilters = () => {
  selectedItem.value = ''
  selectedStatus.value = ''
  selectedMappingType.value = ''
  currentPage.value = 1
}

const exportMappings = () => {
  const csvData = filteredMappings.value.map(mapping => ({
    ID: mapping.id,
    Item: mapping.item?.name || 'Unknown',
    'Item Code': mapping.item?.code || '',
    'Sale Account': mapping.saleAccount?.name || '',
    'Sale Account Code': mapping.saleAccount?.code || '',
    'Inventory Account': mapping.inventoryAccount?.name || '',
    'Inventory Account Code': mapping.inventoryAccount?.code || '',
    'COGS Account': mapping.costOfGoodsAccount?.name || '',
    'COGS Account Code': mapping.costOfGoodsAccount?.code || '',
    'Purchase Account': mapping.purchaseAccount?.name || '',
    Status: mapping.isActive ? 'Active' : 'Inactive',
    'Mapping Type': mapping.mappingType || 'Default',
    Priority: mapping.priority || 1,
    Notes: mapping.notes || ''
  }))

  const headers = Object.keys(csvData[0] || {}).join(',')
  const rows = csvData.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'account-mappings-export.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedMappings.value.map((mapping) => mapping.id))
    selectAll.value = true
  }
}

const handleSelectItem = (mappingId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(mappingId)
  } else {
    newSelected.delete(mappingId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedMappings.value.length && paginatedMappings.value.length > 0
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
    saleAccountId: '',
    inventoryAccountId: '',
    cogsAccountId: '',
    purchaseAccountId: '',
    mappingType: 'default',
    priority: 1,
    effectiveFrom: new Date().toISOString().split('T')[0],
    notes: ''
  }
  showModal.value = true
}

const openEditModal = (mapping) => {
  isEditing.value = true
  form.value = {
    id: mapping.id,
    itemId: mapping.item?.id || '',
    saleAccountId: mapping.saleAccount?.id || '',
    inventoryAccountId: mapping.inventoryAccount?.id || '',
    cogsAccountId: mapping.costOfGoodsAccount?.id || '',
    purchaseAccountId: mapping.purchaseAccount?.id || '',
    mappingType: mapping.mappingType || 'default',
    priority: mapping.priority || 1,
    effectiveFrom: mapping.effectiveFrom ? new Date(mapping.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: mapping.notes || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    itemId: '',
    saleAccountId: '',
    inventoryAccountId: '',
    cogsAccountId: '',
    purchaseAccountId: '',
    mappingType: 'default',
    priority: 1,
    effectiveFrom: new Date().toISOString().split('T')[0],
    notes: ''
  }
  error.value = ''
}

const saveMapping = async () => {
  try {
    const mappingData = {
      itemId: form.value.itemId,
      saleAccountId: form.value.saleAccountId,
      inventoryAccountId: form.value.inventoryAccountId,
      cogsAccountId: form.value.cogsAccountId,
      purchaseAccountId: form.value.purchaseAccountId || null,
      mappingType: form.value.mappingType,
      priority: form.value.priority,
      effectiveFrom: form.value.effectiveFrom,
      notes: form.value.notes
    }

    if (isEditing.value) {
      await updateMapping(form.value.id, mappingData)
    } else {
      await createMapping(mappingData)
    }

    closeModal()
  } catch (err) {
    console.error('Failed to save mapping:', err)
  }
}

const duplicateMapping = (mapping) => {
  isEditing.value = false
  form.value = {
    id: null,
    itemId: '', // Leave empty for user to select different item
    saleAccountId: mapping.saleAccount?.id || '',
    inventoryAccountId: mapping.inventoryAccount?.id || '',
    cogsAccountId: mapping.costOfGoodsAccount?.id || '',
    purchaseAccountId: mapping.purchaseAccount?.id || '',
    mappingType: mapping.mappingType || 'default',
    priority: mapping.priority || 1,
    effectiveFrom: new Date().toISOString().split('T')[0],
    notes: mapping.notes || ''
  }
  showModal.value = true
}

const deleteMapping = (mapping) => {
  mappingToDelete.value = mapping
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (mappingToDelete.value) {
    try {
      await deleteMappingApi(mappingToDelete.value.id)
      showDeleteModal.value = false
      mappingToDelete.value = null
    } catch (err) {
      console.error('Failed to delete mapping:', err)
    }
  }
}

const toggleMappingStatus = async (mapping) => {
  try {
    await updateMapping(mapping.id, { isActive: !mapping.isActive })
  } catch (err) {
    console.error('Failed to toggle mapping status:', err)
  }
}

// Bulk operations
const openBulkMappingModal = () => {
  if (selectedItems.value.size === 0) {
    swalAlert.value?.showWarning('No mappings selected', 'Please select account mappings to bulk edit')
    return
  }
  swalAlert.value?.showInfo('Bulk Mapping', 'Bulk mapping feature coming soon')
}

const bulkActivate = async () => {
  if (selectedItems.value.size === 0) return

  const activatePromises = Array.from(selectedItems.value).map((id) => {
    const mapping = accountMappings.value.find(m => m.id === id)
    return updateMapping(id, { isActive: true })
  })

  try {
    await Promise.all(activatePromises)
    selectedItems.value = new Set()
    selectAll.value = false
    swalAlert.value?.showSuccess('Selected mappings activated successfully')
  } catch (err) {
    console.error('Failed to activate some mappings:', err)
    swalAlert.value?.showError('Failed to activate some mappings', 'Please try again')
  }
}

const bulkDeactivate = async () => {
  if (selectedItems.value.size === 0) return

  const deactivatePromises = Array.from(selectedItems.value).map((id) => {
    return updateMapping(id, { isActive: false })
  })

  try {
    await Promise.all(deactivatePromises)
    selectedItems.value = new Set()
    selectAll.value = false
    swalAlert.value?.showSuccess('Selected mappings deactivated successfully')
  } catch (err) {
    console.error('Failed to deactivate some mappings:', err)
    swalAlert.value?.showError('Failed to deactivate some mappings', 'Please try again')
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} account mapping${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteMappingApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected account mappings deleted successfully')
    } catch (err) {
      console.error('Failed to delete some mappings:', err)
      swalAlert.value?.showError('Failed to delete some mappings', 'Please try again')
    }
  }
}

// Other actions
const refreshMappings = async () => {
  await fetchAccountMappings()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchAccountMappings(), fetchItems(), fetchAccounts()])
})
</script>
