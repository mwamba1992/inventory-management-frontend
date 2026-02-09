<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-sm shadow-soft border-b border-neutral-100">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="flex items-center text-sm text-neutral-400 mb-2">
              <HomeIcon class="w-4 h-4 mr-2" />
              <span>Home</span>
              <ChevronRightIcon class="w-4 h-4 mx-2" />
              <span>Sales</span>
              <ChevronRightIcon class="w-4 h-4 mx-2" />
              <span class="text-neutral-700 font-medium">Invoices</span>
            </div>
            <h1 class="text-3xl font-bold text-neutral-900">Invoices</h1>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center">
              <span class="text-sm text-neutral-500 mr-2">Ref:</span>
              <input
                v-model="refSearch"
                type="text"
                class="input-field !py-2 !px-3 !rounded-xl w-32 text-sm"
              />
            </div>
            <button
              @click="searchInvoices"
              class="btn-primary flex items-center text-sm"
            >
              <MagnifyingGlassIcon class="w-4 h-4 mr-2" />
              Search
            </button>
            <button
              @click="exportCSV"
              class="btn-success flex items-center text-sm"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              @click="openAddModal"
              class="btn-primary flex items-center text-sm"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add
            </button>
            <button
              @click="refreshInvoices"
              class="btn-secondary flex items-center text-sm !px-3"
            >
              <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Gradient Banner -->
      <div class="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-5 rounded-2xl mb-6 shadow-soft">
        <p class="text-brand-100 text-sm">View & search invoices</p>
      </div>

      <!-- Main Content -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
        <!-- Controls -->
        <div class="px-6 py-4 border-b border-neutral-100">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <span class="text-sm text-neutral-500 mr-2">Show</span>
                <select
                  v-model="entriesPerPage"
                  @change="currentPage = 1"
                  class="border border-neutral-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="text-sm text-neutral-500 ml-2">entries</span>
              </div>

              <div class="flex items-center">
                <span class="text-sm text-neutral-500 mr-2">Range:</span>
                <select
                  v-model="dateRange"
                  class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
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
              <span class="text-sm text-neutral-500">Search:</span>
              <div class="relative">
                <input
                  v-model="searchTerm"
                  @input="currentPage = 1"
                  type="text"
                  placeholder="Search invoices..."
                  class="input-field !py-2 !px-3 !rounded-xl w-64 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-neutral-50/80">
            <tr>
              <th class="table-header">
                <input
                  type="checkbox"
                  class="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  :checked="selectAll"
                  @change="handleSelectAll"
                />
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('id')">
                <div class="flex items-center justify-between">
                  <span>ID</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('ref')">
                <div class="flex items-center justify-between">
                  <span>Ref</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('customer')">
                <div class="flex items-center justify-between">
                  <span>Customer</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('date')">
                <div class="flex items-center justify-between">
                  <span>Date</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('total')">
                <div class="flex items-center justify-between">
                  <span>Total</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('balance')">
                <div class="flex items-center justify-between">
                  <span>Balance</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header cursor-pointer hover:bg-neutral-100 transition-colors" @click="sortBy('status')">
                <div class="flex items-center justify-between">
                  <span>Status</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-neutral-400" />
                </div>
              </th>
              <th class="table-header">Actions</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-100">
            <tr v-if="loading">
              <td colspan="9" class="px-6 py-12 text-center text-neutral-500">
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                  <span class="ml-3">Loading invoices...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedInvoices.length === 0">
              <td colspan="9" class="px-6 py-12 text-center text-neutral-500">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-neutral-900">No invoices found</h3>
                  <p class="mt-1 text-sm text-neutral-500">
                    {{ searchTerm ? 'No invoices match your search criteria.' : 'Get started by creating a new invoice.' }}
                  </p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="invoice in paginatedInvoices" :key="invoice.id" class="table-row">
              <td class="table-cell whitespace-nowrap">
                <input
                  type="checkbox"
                  class="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  :checked="selectedItems.has(invoice.id)"
                  @change="handleSelectItem(invoice.id, $event.target.checked)"
                />
              </td>
              <td class="table-cell whitespace-nowrap text-neutral-900">{{ invoice.id }}</td>
              <td class="table-cell whitespace-nowrap">
                <button @click="viewInvoiceDetails(invoice)" class="text-brand-600 hover:text-brand-800 font-medium transition-colors">
                  {{ invoice.ref }}
                </button>
              </td>
              <td class="table-cell whitespace-nowrap text-neutral-900">{{ invoice.customer }}</td>
              <td class="table-cell whitespace-nowrap text-neutral-500">{{ formatDate(invoice.date) }}</td>
              <td class="table-cell whitespace-nowrap text-neutral-900 font-medium">${{ invoice.total.toFixed(2) }}</td>
              <td class="table-cell whitespace-nowrap font-medium" :class="invoice.balance > 0 ? 'text-red-600' : 'text-emerald-600'">
                ${{ invoice.balance.toFixed(2) }}
              </td>
              <td class="table-cell whitespace-nowrap">
                <span :class="getStatusBadge(invoice.status)">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="table-cell whitespace-nowrap">
                <div class="flex items-center space-x-1">
                  <button
                    @click="viewInvoiceDetails(invoice)"
                    class="text-brand-600 hover:text-brand-800 p-1.5 rounded-lg hover:bg-brand-50 transition-all"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="editInvoice(invoice)"
                    class="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-all"
                    title="Edit"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteInvoice(invoice)"
                    class="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-all"
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
        <div class="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div class="text-sm text-neutral-500">
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredInvoices.length }} entries
          </div>

          <div v-if="totalPages > 1" class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="btn-secondary !py-2 !px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="goToPage(page)"
                :class="currentPage === page
                  ? 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700 shadow-soft'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'"
                class="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-xl transition-all duration-200"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="btn-secondary !py-2 !px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft-lg border border-white/20 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-neutral-100">
          <h3 class="text-xl font-bold text-neutral-900">Transaction Details</h3>
          <button @click="closeDetailsModal" class="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-all">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div v-if="selectedInvoice" class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <div class="bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                <h4 class="font-semibold text-neutral-900 mb-4">Transaction Details</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Status:</span>
                    <span :class="getStatusBadge(selectedInvoice.status)">{{ selectedInvoice.status }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">ID:</span>
                    <span class="font-medium text-neutral-900">{{ selectedInvoice.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Ref:</span>
                    <span class="font-medium text-neutral-900">{{ selectedInvoice.ref }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Trans DT:</span>
                    <span class="text-neutral-700">{{ selectedInvoice.transactionDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Process DT:</span>
                    <span class="text-neutral-700">{{ selectedInvoice.processDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">User:</span>
                    <span class="text-neutral-700">{{ selectedInvoice.user }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Device:</span>
                    <span class="text-neutral-700">{{ selectedInvoice.device }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Location:</span>
                    <span class="text-neutral-700">{{ selectedInvoice.location }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                <h4 class="font-semibold text-neutral-900 mb-4">Invoice Details</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Invoice Date:</span>
                    <span class="text-neutral-700">{{ formatDate(selectedInvoice.invoiceDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Due Date:</span>
                    <span class="text-neutral-700">{{ formatDate(selectedInvoice.dueDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Close Date:</span>
                    <span class="text-neutral-700">{{ formatDate(selectedInvoice.closeDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Discount:</span>
                    <span class="text-neutral-700">{{ selectedInvoice.discount }}%</span>
                  </div>
                </div>
              </div>

              <div class="bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                <h4 class="font-semibold text-neutral-900 mb-4">Notes</h4>
                <textarea
                  v-model="selectedInvoice.notes"
                  rows="3"
                  class="input-field text-sm"
                  placeholder="Add notes..."
                ></textarea>
                <button
                  @click="saveNotes"
                  class="mt-3 btn-success text-sm"
                >
                  Save
                </button>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div class="bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                <h4 class="font-semibold text-neutral-900 mb-4">Customer Details</h4>
                <div class="space-y-2">
                  <div class="font-medium text-neutral-900">{{ selectedInvoice.customerDetails.name }}</div>
                  <div class="text-neutral-500">{{ selectedInvoice.customerDetails.address }}</div>
                  <div class="text-neutral-500">{{ selectedInvoice.customerDetails.city }}</div>
                  <div class="text-neutral-500">P: {{ selectedInvoice.customerDetails.phone }}</div>
                  <div class="text-neutral-500">M: {{ selectedInvoice.customerDetails.mobile }}</div>
                  <div class="text-neutral-500">E: {{ selectedInvoice.customerDetails.email }}</div>
                  <button class="mt-3 btn-primary text-sm">
                    Details
                  </button>
                </div>
              </div>

              <div class="bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                <h4 class="font-semibold text-neutral-900 mb-4">Sale Totals</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-neutral-500">Subtotal:</span>
                    <span class="font-medium text-neutral-900">${{ selectedInvoice.subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between font-semibold text-lg border-t border-neutral-200 pt-3">
                    <span class="text-neutral-900">Total:</span>
                    <span class="text-brand-700">${{ selectedInvoice.total.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mt-6">
            <div class="border-b border-neutral-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'"
                  class="py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200"
                >
                  <component :is="tab.icon" class="w-4 h-4 mr-2" />
                  {{ tab.name }}
                </button>
              </nav>
            </div>

            <div class="mt-4">
              <div v-if="activeTab === 'details'" class="text-neutral-600 p-4">
                Transaction details content...
              </div>
              <div v-else-if="activeTab === 'items'" class="text-neutral-600 p-4">
                Invoice items list...
              </div>
              <div v-else-if="activeTab === 'payments'" class="text-neutral-600 p-4">
                Payment history...
              </div>
              <div v-else-if="activeTab === 'options'" class="text-neutral-600 p-4">
                Additional options...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Invoice Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft-lg border border-white/20 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-neutral-100">
          <h3 class="text-xl font-bold text-neutral-900">
            {{ isEditing ? 'Edit Invoice' : 'Create New Invoice' }}
          </h3>
          <button @click="closeAddModal" class="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100 transition-all">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveInvoice" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="input-label">Customer *</label>
              <input
                v-model="invoiceForm.customer"
                type="text"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="input-label">Reference</label>
              <input
                v-model="invoiceForm.ref"
                type="text"
                class="input-field"
              />
            </div>

            <div>
              <label class="input-label">Invoice Date *</label>
              <input
                v-model="invoiceForm.invoiceDate"
                type="date"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="input-label">Due Date</label>
              <input
                v-model="invoiceForm.dueDate"
                type="date"
                class="input-field"
              />
            </div>

            <div>
              <label class="input-label">Total Amount *</label>
              <input
                v-model.number="invoiceForm.total"
                type="number"
                step="0.01"
                min="0"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="input-label">Status</label>
              <select
                v-model="invoiceForm.status"
                class="input-field"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="input-label">Notes</label>
              <textarea
                v-model="invoiceForm.notes"
                rows="3"
                class="input-field"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-neutral-100">
            <button
              type="button"
              @click="closeAddModal"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary"
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
  ChevronRightIcon,
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
    'Open': 'badge badge-primary',
    'Closed': 'badge badge-success',
    'Overdue': 'badge bg-red-100 text-red-800',
    'Cancelled': 'badge bg-neutral-100 text-neutral-800'
  }
  return badges[status] || 'badge bg-neutral-100 text-neutral-800'
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
    const index = invoices.value.findIndex(invoice => invoice.id === invoiceForm.value.id)
    if (index !== -1) {
      invoices.value[index] = {
        ...invoices.value[index],
        ...invoiceForm.value,
        date: invoiceForm.value.invoiceDate,
        balance: invoiceForm.value.total,
        subtotal: invoiceForm.value.total
      }
    }
  } else {
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

const searchInvoices = () => {
  currentPage.value = 1
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
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

onMounted(() => {
  // Initial data load if needed
})
</script>
