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
        <span class="text-gray-700 font-medium">Warehouses</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              Warehouse Management
            </h1>
            <p class="text-gray-600 mt-2">Manage your warehouse locations and storage facilities</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshWarehouses"
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
              Add Warehouse
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
              <p class="text-sm font-medium text-gray-600">Total Warehouses</p>
              <p class="text-2xl font-bold text-gray-900">{{ warehouses.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <BuildingOffice2Icon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Warehouses</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeWarehouses }}</p>
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
              <p class="text-sm font-medium text-gray-600">Total Capacity</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalCapacity.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">sq ft</p>
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
              <p class="text-sm font-medium text-gray-600">Avg Capacity</p>
              <p class="text-2xl font-bold text-gray-900">{{ averageCapacity.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">sq ft</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <ChartBarIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Warehouse Table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <!-- Error Display -->
        <div v-if="error" class="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm">{{ error }}</p>
          <button @click="error = ''" class="text-red-600 hover:text-red-800 text-xs mt-1 underline">
            Dismiss
          </button>
        </div>

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
                  placeholder="Search warehouses..."
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
                  <span class="text-sm font-semibold text-gray-900">Warehouse Name</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('location')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Location</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('capacity')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Capacity</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('status')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Status</span>
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
              <td colspan="7" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading warehouses...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedWarehouses.length === 0">
              <td colspan="7" class="p-12 text-center text-gray-500">
                <BuildingOffice2Icon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm ? 'No warehouses found' : 'No warehouses yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Create your first warehouse to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="warehouse in paginatedWarehouses"
              :key="warehouse.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(warehouse.id)"
                  @change="handleSelectItem(warehouse.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ warehouse.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
                  >
                      <span class="text-white text-sm font-semibold">{{
                          warehouse.name.charAt(0).toUpperCase()
                        }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ warehouse.name }}</p>
                    <p v-if="warehouse.code" class="text-xs text-gray-500">
                      Code: {{ warehouse.code }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div>
                  <p class="text-sm text-gray-900">{{ warehouse.address }}</p>
                  <p class="text-xs text-gray-500">{{ warehouse.city }}, {{ warehouse.country }}</p>
                </div>
              </td>
              <td class="p-4">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ warehouse.capacity.toLocaleString() }}
                  </p>
                  <p class="text-xs text-gray-500">sq ft</p>
                </div>
              </td>
              <td class="p-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': warehouse.status === 'Active',
                      'bg-red-100 text-red-800': warehouse.status === 'Inactive',
                      'bg-yellow-100 text-yellow-800': warehouse.status === 'Maintenance',
                    }"
                  >
                    {{ warehouse.status }}
                  </span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(warehouse)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Warehouse"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewWarehouseDetails(warehouse)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteWarehouse(warehouse)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Warehouse"
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
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredWarehouses.length }} entries
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
              {{ selectedItems.size }} warehouse{{ selectedItems.size !== 1 ? 's' : '' }} selected
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
              {{ isEditing ? 'Edit Warehouse' : 'Create New Warehouse' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveWarehouse" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Warehouse Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter warehouse name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Code</label>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="e.g., WH001"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <textarea
                  v-model="form.address"
                  rows="2"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter full address"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input
                  v-model="form.city"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">State/Province</label>
                <input
                  v-model="form.state"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter state or province"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                <input
                  v-model="form.postalCode"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                <input
                  v-model="form.country"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Capacity (sq ft) *</label>
                <input
                  v-model.number="form.capacity"
                  type="number"
                  required
                  min="1"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter capacity in square feet"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Warehouse Type</label>
                <select
                  v-model="form.type"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="General">General Storage</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Hazmat">Hazardous Materials</option>
                  <option value="Distribution">Distribution Center</option>
                  <option value="Cross Dock">Cross Dock</option>
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
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Manager Name</label>
                <input
                  v-model="form.manager"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter manager name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                <input
                  v-model="form.phone"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter contact phone"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter additional notes..."
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
                  {{ isEditing ? 'Update Warehouse' : 'Create Warehouse' }}
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
              <h3 class="text-lg font-bold text-gray-900">Delete Warehouse</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete "{{ warehouseToDelete?.name }}"? This action cannot be
              undone.
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
  BuildingOffice2Icon,
  CheckCircleIcon,
  CubeIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://84.247.178.93:3000'

// Reactive data
const warehouses = ref([])
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
const warehouseToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  name: '',
  code: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  location: '',
  capacity: 0,
  type: 'General',
  status: 'Active',
  manager: '',
  phone: '',
  notes: '',
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

const fetchWarehouses = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/warehouses')
    warehouses.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch warehouses', err.message)
    error.value = `Failed to fetch warehouses: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createWarehouse = async (warehouseData) => {
  submitting.value = true
  try {
    const newWarehouse = await apiCall('/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouseData),
    })
    warehouses.value.push(newWarehouse)
    swalAlert.value?.showSuccess('Warehouse created successfully')
    return newWarehouse
  } catch (err) {
    swalAlert.value?.showError('Failed to create warehouse', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateWarehouse = async (id, warehouseData) => {
  submitting.value = true
  try {
    const updatedWarehouse = await apiCall(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData),
    })
    const index = warehouses.value.findIndex((w) => w.id === id)
    if (index !== -1) {
      warehouses.value[index] = updatedWarehouse
    }
    swalAlert.value?.showSuccess('Warehouse updated successfully')
    return updatedWarehouse
  } catch (err) {
    swalAlert.value?.showError('Failed to update warehouse', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteWarehouseApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/warehouses/${id}`, {
      method: 'DELETE',
    })
    warehouses.value = warehouses.value.filter((w) => w.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('Warehouse deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete warehouse', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredWarehouses = computed(() => {
  let filtered = warehouses.value.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (warehouse.code && warehouse.code.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (warehouse.manager && warehouse.manager.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      warehouse.city.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      warehouse.country.toLowerCase().includes(searchTerm.value.toLowerCase())
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

const paginatedWarehouses = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredWarehouses.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredWarehouses.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredWarehouses.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredWarehouses.value.length)
})

// Stats computed properties
const activeWarehouses = computed(() => {
  return warehouses.value.filter((w) => w.status === 'Active').length
})

const totalCapacity = computed(() => {
  return warehouses.value.reduce((total, warehouse) => total + (warehouse.capacity || 0), 0)
})

const averageCapacity = computed(() => {
  return warehouses.value.length > 0
    ? Math.round(totalCapacity.value / warehouses.value.length)
    : 0
})

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedWarehouses.value.map((warehouse) => warehouse.id))
    selectAll.value = true
  }
}

const handleSelectItem = (warehouseId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(warehouseId)
  } else {
    newSelected.delete(warehouseId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedWarehouses.value.length && paginatedWarehouses.value.length > 0
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
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    location: '',
    capacity: 0,
    type: 'General',
    status: 'Active',
    manager: '',
    phone: '',
    notes: '',
  }
  showModal.value = true
}

const openEditModal = (warehouse) => {
  isEditing.value = true
  form.value = { ...warehouse }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    location: '',
    capacity: 0,
    type: 'General',
    status: 'Active',
    manager: '',
    phone: '',
    notes: '',
  }
  error.value = ''
}

const saveWarehouse = async () => {
  try {
    // Create location string from city and state
    form.value.location = form.value.state
      ? `${form.value.city}, ${form.value.state}`
      : form.value.city

    // Prepare data for API
    const warehouseData = {
      name: form.value.name,
      code: form.value.code || null,
      address: form.value.address,
      city: form.value.city,
      state: form.value.state || null,
      postalCode: form.value.postalCode || null,
      country: form.value.country,
      location: form.value.location,
      capacity: form.value.capacity,
      type: form.value.type,
      status: form.value.status,
      manager: form.value.manager || null,
      phone: form.value.phone || null,
      notes: form.value.notes || null,
    }

    if (isEditing.value) {
      await updateWarehouse(form.value.id, warehouseData)
    } else {
      await createWarehouse(warehouseData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save warehouse:', err)
  }
}

const deleteWarehouse = (warehouse) => {
  warehouseToDelete.value = warehouse
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (warehouseToDelete.value) {
    try {
      await deleteWarehouseApi(warehouseToDelete.value.id)
      showDeleteModal.value = false
      warehouseToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteWarehouseApi
      console.error('Failed to delete warehouse:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} warehouse${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteWarehouseApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected warehouses deleted successfully')
    } catch (err) {
      console.error('Failed to delete some warehouses:', err)
      swalAlert.value?.showError('Failed to delete some warehouses', 'Please try again')
    }
  }
}

const viewWarehouseDetails = (warehouse) => {
  // You can implement a detailed view modal or navigate to a detail page
  console.log('Viewing warehouse details:', warehouse)
  alert(
    `Warehouse Details:\nName: ${warehouse.name}\nCode: ${warehouse.code || 'N/A'}\nAddress: ${warehouse.address}\nCity: ${warehouse.city}\nCountry: ${warehouse.country}\nCapacity: ${warehouse.capacity.toLocaleString()} sq ft\nType: ${warehouse.type}\nStatus: ${warehouse.status}\nManager: ${warehouse.manager || 'N/A'}\nPhone: ${warehouse.phone || 'N/A'}\nNotes: ${warehouse.notes || 'N/A'}`
  )
}

// Other actions
const refreshWarehouses = async () => {
  await fetchWarehouses()
}

// Lifecycle
onMounted(() => {
  fetchWarehouses()
})
</script>
