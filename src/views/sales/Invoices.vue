<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <HomeIcon class="w-4 h-4 mr-2" />
              <span>Home</span>
              <span class="mx-2">/</span>
              <span class="text-gray-700 font-medium">Invoices</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Invoices</h1>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center">
              <span class="text-sm text-gray-600 mr-2">Ref:</span>
              <input
                v-model="refSearch"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
              />
            </div>
            <button
              @click="searchInvoices"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center text-sm"
            >
              <MagnifyingGlassIcon class="w-4 h-4 mr-2" />
              Search
            </button>
            <button
              @click="exportCSV"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center text-sm"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              @click="openAddModal"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center text-sm"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add
            </button>
            <button
              @click="refreshInvoices"
              class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center text-sm"
            >
              <ArrowPathIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Blue Banner -->
      <div class="bg-blue-600 text-white p-4 rounded-lg mb-6">
        <p class="text-blue-100">View & search invoices</p>
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm border">
        <!-- Controls -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-600 mr-2">Show</span>
                <select
                  v-model="entriesPerPage"
                  @change="currentPage = 1"
                  class="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="text-sm text-gray-600 ml-2">entries</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-gray-600 mr-2">Range:</span>
                <select
                  v-model="dateRange"
                  class="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Search:</span>
              <div class="relative">
                <input
                  v-model="searchTerm"
                  @input="currentPage = 1"
                  type="text"
                  placeholder="Search invoices..."
                  class="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  class="rounded"
                  :checked="selectAll"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('id')">
                <div class="flex items-center justify-between">
                  <span>ID</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('ref')">
                <div class="flex items-center justify-between">
                  <span>Ref</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('customer')">
                <div class="flex items-center justify-between">
                  <span>Customer</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('date')">
                <div class="flex items-center justify-between">
                  <span>Date</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('total')">
                <div class="flex items-center justify-between">
                  <span>Total</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('balance')">
                <div class="flex items-center justify-between">
                  <span>Balance</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortBy('status')">
                <div class="flex items-center justify-between">
                  <span>Status</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="hover:bg-gray-50">
              <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span class="ml-2">Loading invoices...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedInvoices.length === 0" class="hover:bg-gray-50">
              <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ searchTerm ? 'No invoices match your search criteria.' : 'Get started by creating a new invoice.' }}
                  </p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="invoice in paginatedInvoices" :key="invoice.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  class="rounded"
                  :checked="selectedItems.has(invoice.id)"
                  @change="handleSelectItem(invoice.id, $event.target.checked)"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invoice.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="viewInvoiceDetails(invoice)" class="text-blue-600 hover:text-blue-800 font-medium">
                  {{ invoice.ref }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invoice.customer }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(invoice.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${{ invoice.total.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="invoice.balance > 0 ? 'text-red-600' : 'text-green-600'">
                ${{ invoice.balance.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewInvoiceDetails(invoice)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="editInvoice(invoice)"
                    class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                    title="Edit"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteInvoice(invoice)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredInvoices.length }} entries
          </div>

          <div v-if="totalPages > 1" class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="goToPage(page)"
                :class="currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Transaction Details</h3>
          <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div v-if="selectedInvoice" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span :class="getStatusBadge(selectedInvoice.status)">{{ selectedInvoice.status }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">ID:</span>
                    <span class="font-medium">{{ selectedInvoice.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Ref:</span>
                    <span class="font-medium">{{ selectedInvoice.ref }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Trans DT:</span>
                    <span>{{ selectedInvoice.transactionDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Process DT:</span>
                    <span>{{ selectedInvoice.processDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">User:</span>
                    <span>{{ selectedInvoice.user }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Device:</span>
                    <span>{{ selectedInvoice.device }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Location:</span>
                    <span>{{ selectedInvoice.location }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Invoice Details</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Invoice Date:</span>
                    <span>{{ formatDate(selectedInvoice.invoiceDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Due Date:</span>
                    <span>{{ formatDate(selectedInvoice.dueDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Close Date:</span>
                    <span>{{ formatDate(selectedInvoice.closeDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Discount:</span>
                    <span>{{ selectedInvoice.discount }}%</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Notes</h4>
                <textarea
                  v-model="selectedInvoice.notes"
                  rows="3"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes..."
                ></textarea>
                <button
                  @click="saveNotes"
                  class="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  Save
                </button>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Customer Details</h4>
                <div class="space-y-2">
                  <div class="font-medium text-gray-900">{{ selectedInvoice.customerDetails.name }}</div>
                  <div class="text-gray-600">{{ selectedInvoice.customerDetails.address }}</div>
                  <div class="text-gray-600">{{ selectedInvoice.customerDetails.city }}</div>
                  <div class="text-gray-600">P: {{ selectedInvoice.customerDetails.phone }}</div>
                  <div class="text-gray-600">M: {{ selectedInvoice.customerDetails.mobile }}</div>
                  <div class="text-gray-600">E: {{ selectedInvoice.customerDetails.email }}</div>
                  <button class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                    Details
                  </button>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Sale Totals</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium">${{ selectedInvoice.subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${{ selectedInvoice.total.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mt-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  class="py-2 px-1 border-b-2 font-medium text-sm flex items-center"
                >
                  <component :is="tab.icon" class="w-4 h-4 mr-2" />
                  {{ tab.name }}
                </button>
              </nav>
            </div>

            <div class="mt-4">
              <div v-if="activeTab === 'details'" class="text-gray-600">
                Transaction details content...
              </div>
              <div v-else-if="activeTab === 'items'" class="text-gray-600">
                Invoice items list...
              </div>
              <div v-else-if="activeTab === 'payments'" class="text-gray-600">
                Payment history...
              </div>
              <div v-else-if="activeTab === 'options'" class="text-gray-600">
                Additional options...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Invoice Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Edit Invoice' : 'Create New Invoice' }}
          </h3>
          <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveInvoice" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <input
                v-model="invoiceForm.customer"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                v-model="invoiceForm.ref"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
              <input
                v-model="invoiceForm.invoiceDate"
                type="date"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                v-model="invoiceForm.dueDate"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
              <input
                v-model.number="invoiceForm.total"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="invoiceForm.status"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="invoiceForm.notes"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeAddModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {{ isEditing ? 'Update Invoice' : 'Create Invoice' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentTextIcon,
  ListBulletIcon,
  CreditCardIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

// Reactive data
const invoices = ref([
  {
    id: 1,
    ref: '7046',
    customer: 'Jo Doe',
    date: '2025-06-26',
    total: 619.00,
    balance: 619.00,
    status: 'Open',
    invoiceDate: '2025-06-26',
    dueDate: '2025-07-10',
    closeDate: '2025-06-26',
    discount: 0,
    subtotal: 619.00,
    transactionDate: '26/6/25 00:00:00',
    processDate: '2025-06-26 04:48:35',
    user: 'admin',
    device: 'Admin Dash',
    location: 'Admin Dash',
    notes: '',
    customerDetails: {
      name: 'Jo Doe',
      address: '10 Fake St',
      city: 'Faketown, Australia',
      phone: '99999999',
      mobile: '111111111',
      email: 'jdoe@domainname.com'
    }
  },
  {
    id: 61,
    ref: '6716',
    customer: 'Jane Smith',
    date: '2025-06-25',
    total: 612.77,
    balance: 612.77,
    status: 'Overdue',
    invoiceDate: '2025-06-25',
    dueDate: '2025-07-09',
    closeDate: '2025-06-25',
    discount: 0,
    subtotal: 612.77,
    transactionDate: '25/6/25 00:00:00',
    processDate: '2025-06-25 14:22:15',
    user: 'admin',
    device: 'Admin Dash',
    location: 'Admin Dash',
    notes: '',
    customerDetails: {
      name: 'Jane Smith',
      address: '15 Main Street',
      city: 'Downtown, Australia',
      phone: '88888888',
      mobile: '222222222',
      email: 'jane@email.com'
    }
  },
  {
    id: 99,
    ref: '7546',
    customer: 'John Wilson',
    date: '2025-06-24',
    total: 0.00,
    balance: 0.00,
    status: 'Closed',
    invoiceDate: '2025-06-24',
    dueDate: '2025-07-08',
    closeDate: '2025-06-24',
    discount: 0,
    subtotal: 0.00,
    transactionDate: '24/6/25 00:00:00',
    processDate: '2025-06-24 10:15:30',
    user: 'admin',
    device: 'Admin Dash',
    location: 'Admin Dash',
    notes: '',
    customerDetails: {
      name: 'John Wilson',
      address: '22 Oak Avenue',
      city: 'Suburbia, Australia',
      phone: '77777777',
      mobile: '333333333',
      email: 'john@company.com'
    }
  },
  {
    id: 98,
    ref: '8528',
    customer: 'Sarah Johnson',
    date: '2025-06-23',
    total: 0.00,
    balance: 0.00,
    status: 'Closed',
    invoiceDate: '2025-06-23',
    dueDate: '2025-07-07',
    closeDate: '2025-06-23',
    discount: 0,
    subtotal: 0.00,
    transactionDate: '23/6/25 00:00:00',
    processDate: '2025-06-23 16:45:22',
    user: 'admin',
    device: 'Admin Dash',
    location: 'Admin Dash',
    notes: '',
    customerDetails: {
      name: 'Sarah Johnson',
      address: '8 Pine Road',
      city: 'Hillview, Australia',
      phone: '66666666',
      mobile: '444444444',
      email: 'sarah@business.com'
    }
  }
])

const searchTerm = ref('')
const refSearch = ref('')
const entriesPerPage = ref(10)
const currentPage = ref(1)
const selectedItems = ref(new Set())
const selectAll = ref(false)
const sortField = ref('')
const sortDirection = ref('asc')
const loading = ref(false)
const dateRange = ref('all')

// Modal states
const showDetailsModal = ref(false)
const showAddModal = ref(false)
const isEditing = ref(false)
const selectedInvoice = ref(null)
const activeTab = ref('details')

// Form data
const invoiceForm = ref({
  id: null,
  customer: '',
  ref: '',
  invoiceDate: '',
  dueDate: '',
  total: 0,
  status: 'Open',
  notes: ''
})

// Tab configuration
const tabs = ref([
  { id: 'details', name: 'Details', icon: DocumentTextIcon },
  { id: 'items', name: 'Items', icon: ListBulletIcon },
  { id: 'payments', name: 'Payments', icon: CreditCardIcon },
  { id: 'options', name: 'Options', icon: Cog6ToothIcon }
])

// Computed properties
const filteredInvoices = computed(() => {
  let filtered = invoices.value.filter(invoice => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      invoice.ref.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      invoice.id.toString().includes(searchTerm.value)

    const matchesRef = !refSearch.value || invoice.ref.toLowerCase().includes(refSearch.value.toLowerCase())

    let matchesDateRange = true
    if (dateRange.value !== 'all') {
      const invoiceDate = new Date(invoice.date)
      const now = new Date()

      switch (dateRange.value) {
        case 'today':
          matchesDateRange = invoiceDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDateRange = invoiceDate >= weekAgo
          break
        case 'month':
          matchesDateRange = invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear()
          break
        case 'year':
          matchesDateRange = invoiceDate.getFullYear() === now.getFullYear()
          break
      }
    }

    return matchesSearch && matchesRef && matchesDateRange
  })

  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]

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

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredInvoices.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredInvoices.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredInvoices.value.length > 0 ? (currentPage.value - 1) * entriesPerPage.value + 1 : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredInvoices.value.length)
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusBadge = (status) => {
  const badges = {
    'Open': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    'Closed': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'Overdue': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    'Cancelled': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
  }
  return badges[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const handleSelectAll = (event) => {
  selectAll.value = event.target.checked
  if (selectAll.value) {
    selectedItems.value = new Set(paginatedInvoices.value.map(invoice => invoice.id))
  } else {
    selectedItems.value = new Set()
  }
}

const handleSelectItem = (invoiceId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(invoiceId)
  } else {
    newSelected.delete(invoiceId)
  }
  selectedItems.value = newSelected
  selectAll.value = newSelected.size === paginatedInvoices.value.length
}

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
const viewInvoiceDetails = (invoice) => {
  selectedInvoice.value = { ...invoice }
  activeTab.value = 'details'
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedInvoice.value = null
}

const openAddModal = () => {
  isEditing.value = false
  invoiceForm.value = {
    id: null,
    customer: '',
    ref: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    total: 0,
    status: 'Open',
    notes: ''
  }
  showAddModal.value = true
}

const editInvoice = (invoice) => {
  isEditing.value = true
  invoiceForm.value = { ...invoice }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  invoiceForm.value = {
    id: null,
    customer: '',
    ref: '',
    invoiceDate: '',
    dueDate: '',
    total: 0,
    status: 'Open',
    notes: ''
  }
}

const saveInvoice = () => {
  if (isEditing.value) {
    // Update existing invoice
    const index = invoices.value.findIndex(invoice => invoice.id === invoiceForm.value.id)
    if (index !== -1) {
      invoices.value[index] = {
        ...invoices.value[index],
        ...invoiceForm.value,
        date: invoiceForm.value.invoiceDate,
        balance: invoiceForm.value.total, // Assuming new invoices start with full balance
        subtotal: invoiceForm.value.total
      }
    }
  } else {
    // Add new invoice
    const newId = Math.max(...invoices.value.map(invoice => invoice.id)) + 1
    const newRef = Math.floor(Math.random() * 9000) + 1000
    invoices.value.push({
      ...invoiceForm.value,
      id: newId,
      ref: newRef.toString(),
      date: invoiceForm.value.invoiceDate,
      balance: invoiceForm.value.total,
      subtotal: invoiceForm.value.total,
      discount: 0,
      closeDate: invoiceForm.value.invoiceDate,
      transactionDate: new Date().toLocaleDateString('en-AU'),
      processDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'admin',
      device: 'Admin Dash',
      location: 'Admin Dash',
      customerDetails: {
        name: invoiceForm.value.customer,
        address: '',
        city: '',
        phone: '',
        mobile: '',
        email: ''
      }
    })
  }
  closeAddModal()
}

const deleteInvoice = (invoice) => {
  if (confirm(`Are you sure you want to delete invoice ${invoice.ref}?`)) {
    const index = invoices.value.findIndex(i => i.id === invoice.id)
    if (index !== -1) {
      invoices.value.splice(index, 1)
    }
  }
}

const saveNotes = () => {
  if (selectedInvoice.value) {
    const index = invoices.value.findIndex(invoice => invoice.id === selectedInvoice.value.id)
    if (index !== -1) {
      invoices.value[index].notes = selectedInvoice.value.notes
    }
    alert('Notes saved successfully!')
  }
}

// Other actions
const searchInvoices = () => {
  currentPage.value = 1
  // Additional search logic can be added here
}

const exportCSV = () => {
  const csvContent = [
    ['ID', 'Ref', 'Customer', 'Date', 'Total', 'Balance', 'Status'],
    ...filteredInvoices.value.map(invoice => [
      invoice.id,
      invoice.ref,
      invoice.customer,
      invoice.date,
      invoice.total,
      invoice.balance,
      invoice.status
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'invoices.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

const refreshInvoices = () => {
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// Lifecycle
onMounted(() => {
  // Initial data load if needed
})
</script>
