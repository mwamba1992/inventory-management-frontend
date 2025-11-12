<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Balance Sheet</h1>
            <p class="text-gray-600 mt-1">Statement of Financial Position</p>
          </div>
          <div class="flex items-center space-x-4">
            <input
              v-model="asOfDate"
              type="date"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              @click="fetchBalanceSheet"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Load Report
            </button>
            <button
              @click="exportToPDF"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Loading balance sheet...</p>
      </div>

      <!-- Balance Sheet Content -->
      <div v-else-if="balanceSheet" class="bg-white rounded-lg shadow-sm p-8">
        <!-- Report Header -->
        <div class="text-center mb-8 border-b pb-6">
          <h2 class="text-2xl font-bold text-gray-900">ShopStore</h2>
          <h3 class="text-xl font-semibold text-gray-700 mt-2">Balance Sheet</h3>
          <p class="text-gray-600 mt-1">As of {{ formatDate(balanceSheet.asOfDate) }}</p>
        </div>

        <div class="space-y-8">
          <!-- ASSETS SECTION -->
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">ASSETS</h3>

            <!-- Current Assets -->
            <div class="ml-4">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Current Assets</h4>
              <div class="ml-4 space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Cash and Cash Equivalents</span>
                  <span class="font-mono">TZS {{ formatCurrency(balanceSheet.assets.currentAssets.cash) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Inventory</span>
                  <span class="font-mono">TZS {{ formatCurrency(balanceSheet.assets.currentAssets.inventory) }}</span>
                </div>
                <div class="flex justify-between items-center font-semibold border-t pt-2 mt-2">
                  <span class="text-gray-900">Total Current Assets</span>
                  <span class="font-mono">TZS {{ formatCurrency(balanceSheet.assets.currentAssets.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Total Assets -->
            <div class="mt-6 pt-4 border-t-2 border-gray-400">
              <div class="flex justify-between items-center font-bold text-lg">
                <span class="text-gray-900">TOTAL ASSETS</span>
                <span class="font-mono text-blue-600">TZS {{ formatCurrency(balanceSheet.assets.totalAssets) }}</span>
              </div>
            </div>
          </div>

          <!-- LIABILITIES SECTION -->
          <div class="pt-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">LIABILITIES</h3>

            <!-- Current Liabilities -->
            <div class="ml-4">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Current Liabilities</h4>
              <div class="ml-4 space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-gray-700">Accounts Payable</span>
                  <span class="font-mono">TZS {{ formatCurrency(balanceSheet.liabilities.currentLiabilities.accountsPayable) }}</span>
                </div>
                <div class="flex justify-between items-center font-semibold border-t pt-2 mt-2">
                  <span class="text-gray-900">Total Current Liabilities</span>
                  <span class="font-mono">TZS {{ formatCurrency(balanceSheet.liabilities.currentLiabilities.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Total Liabilities -->
            <div class="mt-6 pt-4 border-t-2 border-gray-400">
              <div class="flex justify-between items-center font-bold text-lg">
                <span class="text-gray-900">TOTAL LIABILITIES</span>
                <span class="font-mono text-blue-600">TZS {{ formatCurrency(balanceSheet.liabilities.totalLiabilities) }}</span>
              </div>
            </div>
          </div>

          <!-- EQUITY SECTION -->
          <div class="pt-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">EQUITY</h3>

            <div class="ml-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Owner's Equity</span>
                <span class="font-mono">TZS {{ formatCurrency(balanceSheet.equity.ownersEquity) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Retained Earnings</span>
                <span class="font-mono">TZS {{ formatCurrency(balanceSheet.equity.retainedEarnings) }}</span>
              </div>
              <div class="flex justify-between items-center font-semibold border-t pt-2 mt-2">
                <span class="text-gray-900">Total Equity</span>
                <span class="font-mono">TZS {{ formatCurrency(balanceSheet.equity.totalEquity) }}</span>
              </div>
            </div>
          </div>

          <!-- TOTAL LIABILITIES AND EQUITY -->
          <div class="pt-6 border-t-4 border-gray-900">
            <div class="flex justify-between items-center font-bold text-xl">
              <span class="text-gray-900">TOTAL LIABILITIES AND EQUITY</span>
              <span class="font-mono text-green-600">TZS {{ formatCurrency(balanceSheet.totalLiabilitiesAndEquity) }}</span>
            </div>
          </div>

          <!-- Balance Check -->
          <div class="mt-8 p-4 rounded-lg" :class="isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center justify-center space-x-2">
              <svg v-if="isBalanced" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span :class="isBalanced ? 'text-green-700' : 'text-red-700'" class="font-semibold">
                {{ isBalanced ? 'Balance Sheet is Balanced ✓' : 'Balance Sheet is NOT Balanced!' }}
              </span>
            </div>
            <p v-if="!isBalanced" class="text-center text-red-600 text-sm mt-2">
              Assets: TZS {{ formatCurrency(balanceSheet.assets.totalAssets) }} ≠
              Liabilities + Equity: TZS {{ formatCurrency(balanceSheet.totalLiabilitiesAndEquity) }}
            </p>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>This is a computer-generated report. No signature is required.</p>
          <p class="mt-1">Generated on {{ new Date().toLocaleString() }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-red-800 font-semibold">Error Loading Balance Sheet</h3>
            <p class="text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- SwalAlert Component -->
    <SwalAlert ref="swalAlert" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Configs } from '@/utils/Configs'
import SwalAlert from '@/components/common/SwalAlert.vue'

const API_BASE_URL = Configs.API_BASE_URL

const asOfDate = ref(new Date().toISOString().split('T')[0])
const balanceSheet = ref(null)
const loading = ref(false)
const error = ref(null)
const swalAlert = ref(null)

const isBalanced = computed(() => {
  if (!balanceSheet.value) return false
  return balanceSheet.value.assets.totalAssets === balanceSheet.value.totalLiabilitiesAndEquity
})

const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

const fetchBalanceSheet = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await apiCall(`/reports/balance-sheet?asOfDate=${asOfDate.value}`)
    balanceSheet.value = data

    if (!isBalanced.value) {
      swalAlert.value?.showWarning(
        'Balance Sheet Warning',
        'The balance sheet does not balance. Please check the data.'
      )
    }
  } catch (err) {
    console.error('Error fetching balance sheet:', err)
    error.value = err.message || 'Failed to load balance sheet'
    swalAlert.value?.showError('Error', error.value)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const exportToPDF = () => {
  window.print()
}

onMounted(() => {
  fetchBalanceSheet()
})
</script>

<style scoped>
@media print {
  .bg-gray-50 {
    background: white;
  }
  button {
    display: none;
  }
  input {
    border: none;
    pointer-events: none;
  }
}
</style>
