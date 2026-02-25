<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <div class="card border-b border-neutral-100 shadow-soft mb-0 rounded-none">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-neutral-900">
              Business Intelligence Dashboard
            </h1>
            <p class="text-sm text-neutral-600 mt-1">{{ currentDateTime }}</p>
          </div>
          <div class="flex items-center space-x-6">
            <div class="flex items-center text-sm">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span class="text-green-700 font-medium">System Online</span>
              </div>
            </div>
            <div class="text-sm text-neutral-600">
              <span class="font-medium">{{ totalTransactions.toLocaleString() }}</span> transactions loaded
            </div>
            <button
              @click="refreshDashboard"
              :disabled="isRefreshing"
              class="btn-primary disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshing }" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Key Performance Indicators -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Revenue -->
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p class="text-3xl font-bold text-neutral-900 mt-1">
                TZS{{ formatCurrency(totalRevenue) }}
              </p>
              <div class="flex items-center mt-3">
                <div class="flex items-center">
                  <TrendingUpIcon class="w-4 h-4 text-green-600 mr-1" />
                  <span class="text-green-600 text-sm font-semibold">+{{ revenueGrowth }}%</span>
                </div>
                <span class="text-neutral-500 text-sm ml-2">vs last month</span>
              </div>
            </div>
            <div class="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <CurrencyDollarIcon class="w-8 h-8 text-white" />
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-neutral-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                :style="`width: ${Math.min(revenueGrowth * 5, 100)}%`"
              ></div>
            </div>
            <p class="text-xs text-neutral-500 mt-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              Updated {{ lastUpdated }} ago
            </p>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-neutral-600">Total Stocks</p>
              <p class="text-3xl font-bold text-neutral-900 mt-1">
                {{ totalProducts.toLocaleString() }}
              </p>
              <div class="flex items-center mt-3">
                <div class="flex items-center">
                  <component :is="productChange >= 0 ? TrendingUpIcon : TrendingDownIcon"
                             :class="productChange >= 0 ? 'text-green-600' : 'text-red-600'"
                             class="w-4 h-4 mr-1" />
                  <span :class="productChange >= 0 ? 'text-green-600' : 'text-red-600'"
                        class="text-sm font-semibold">
                    {{ productChange >= 0 ? '+' : '' }}{{ productChange }}%
                  </span>
                </div>
                <span class="text-neutral-500 text-sm ml-2">vs last month</span>
              </div>
            </div>
            <div class="p-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl">
              <ShoppingBagIcon class="w-8 h-8 text-white" />
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-neutral-200 rounded-full h-2">
              <div
                :class="productChange >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'"
                class="h-2 rounded-full transition-all duration-500"
                :style="`width: ${Math.min(Math.abs(productChange) * 8, 100)}%`"
              ></div>
            </div>
            <p class="text-xs text-neutral-500 mt-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              Updated {{ lastUpdated }} ago
            </p>
          </div>
        </div>

        <!-- Active Customers -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-neutral-600">Stock Value</p>
              <p class="text-3xl font-bold text-neutral-900 mt-1">
                TZS{{ totalStockValues.toLocaleString() }}
              </p>
              <div class="flex items-center mt-3">
                <div class="flex items-center">
                  <TrendingUpIcon class="w-4 h-4 text-green-600 mr-1" />
                  <span class="text-green-600 text-sm font-semibold">+{{ customerGrowth }}%</span>
                </div>
                <span class="text-neutral-500 text-sm ml-2">vs last month</span>
              </div>
            </div>
            <div class="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <UsersIcon class="w-8 h-8 text-white" />
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-neutral-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                :style="`width: ${Math.min(customerGrowth * 4, 100)}%`"
              ></div>
            </div>
            <p class="text-xs text-neutral-500 mt-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              Updated {{ lastUpdated }} ago
            </p>
          </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-neutral-600">Inventory Alerts</p>
              <p class="text-3xl font-bold text-neutral-900 mt-1">
                {{ lowStockCount }}
              </p>
              <div class="flex items-center mt-3">
                <div class="flex items-center">
                  <ExclamationTriangleIcon class="w-4 h-4 text-orange-600 mr-1" />
                  <span class="text-orange-600 text-sm font-semibold">{{ stockStatus }}</span>
                </div>
                <span class="text-neutral-500 text-sm ml-2">items need attention</span>
              </div>
            </div>
            <div class="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <CubeIcon class="w-8 h-8 text-white" />
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-neutral-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-500"
                :style="`width: ${Math.min(lowStockCount * 3, 100)}%`"
              ></div>
            </div>
            <p class="text-xs text-neutral-500 mt-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              Updated {{ lastUpdated }} ago
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Recent Transactions -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
            <div class="px-6 py-4 border-b border-neutral-200/50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-neutral-900 flex items-center">
                    <DocumentTextIcon class="w-6 h-6 text-brand-600 mr-3" />
                    Recent Transactions
                  </h2>
                  <p class="text-sm text-neutral-600 mt-1">{{ recentTransactions.length }} recent transactions</p>
                </div>
                <button
                  @click="viewAllTransactions"
                  class="text-brand-600 hover:text-brand-800 text-sm font-medium transition-colors duration-200"
                >
                  View All →
                </button>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="transaction in recentTransactions"
                  :key="transaction.id"
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl hover:from-brand-50 hover:to-brand-50 transition-all duration-200 cursor-pointer"
                  @click="viewTransactionDetails(transaction)"
                >
                  <div class="flex items-center">
                    <div :class="getTransactionIconStyle(transaction.type)" class="p-3 rounded-xl mr-4">
                      <component :is="getTransactionIcon(transaction.type)" class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="font-semibold text-neutral-900">{{ transaction.item.name }}</p>
                      <div class="flex items-center text-sm text-neutral-600 mt-1">
                        <span class="font-medium">{{ transaction.id }}</span>
                        <span class="mx-2 text-neutral-400">•</span>
                        <span>{{ transaction.customer.name }}</span>
                        <span class="mx-2 text-neutral-400">•</span>
                        <span>{{ transaction.time }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold" :class="getAmountColor(transaction.amountPaid)">
                      {{ formatTransactionAmount(transaction.amountPaid) }}
                    </p>
                    <span :class="getStatusStyle('Completed')"
                          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1">
                      <div :class="getStatusDot('Online')" class="w-2 h-2 rounded-full mr-2"></div>
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Top Products -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
            <div class="px-6 py-4 border-b border-neutral-200/50">
              <h2 class="text-xl font-bold text-neutral-900 flex items-center">
                <TrophyIcon class="w-6 h-6 text-yellow-600 mr-3" />
                Top Products
              </h2>
              <p class="text-sm text-neutral-600 mt-1">{{ topProducts.length }} best performers</p>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="(product, index) in topProducts"
                  :key="product.item.id"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors duration-200"
                >
                  <div class="flex items-center">
                    <div :class="getRankStyle(index)" class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4">
                      {{ index + 1 }}
                    </div>
                    <div>
                      <p class="font-semibold text-neutral-900">{{ product.item.name }}</p>
                      <p class="text-sm text-neutral-600">{{ product.category }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-emerald-600 text-lg">TZS{{ formatNumber(product.totalSales) }}</p>
                    <p class="text-xs text-neutral-500">{{ product.totalQuantity }} units sold</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Trends -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
          <div class="px-6 py-4 border-b border-neutral-200/50">
            <h2 class="text-xl font-bold text-neutral-900 flex items-center">
              <ChartBarIcon class="w-6 h-6 text-brand-600 mr-3" />
              Weekly Sales Trends
            </h2>
            <p class="text-sm text-neutral-600 mt-1">Daily sales performance this week</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-7 gap-3">
              <div
                v-for="day in salesTrends"
                :key="day.day"
                class="text-center group cursor-pointer"
                @click="viewDaySales(day)"
              >
                <p class="text-xs font-medium text-neutral-600 mb-3">{{ day.day }}</p>
                <div class="relative">
                  <div class="w-full bg-neutral-200 rounded-full h-24 flex items-end overflow-hidden">
                    <div
                      class="bg-gradient-to-t from-brand-600 to-brand-500 rounded-full w-full transition-all duration-700 group-hover:from-brand-700 group-hover:to-brand-600"
                      :style="`height: TZS{Math.max(day.percentage, 10)}%`"
                    ></div>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-xs font-bold text-white">{{ day.percentage }}%</span>
                  </div>
                </div>
                <p class="text-sm font-bold text-neutral-900 mt-3">TZS{{ formatNumber(day.amount) }}</p>
              </div>
            </div>
            <div class="mt-6 p-4 bg-gradient-to-r from-brand-50 to-brand-50 rounded-xl">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-neutral-700">Weekly Total</p>
                  <p class="text-2xl font-bold text-brand-600">TZS{{ formatNumber(weeklyTotal) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-neutral-600">Avg. Daily</p>
                  <p class="text-lg font-semibold text-neutral-900">TZS{{ formatNumber(dailyAverage) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory Overview -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
          <div class="px-6 py-4 border-b border-neutral-200/50">
            <h2 class="text-xl font-bold text-neutral-900 flex items-center">
              <ArchiveBoxIcon class="w-6 h-6 text-orange-600 mr-3" />
              Inventory Overview
            </h2>
            <p class="text-sm text-neutral-600 mt-1">Current stock distribution</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div v-for="category in inventoryStatus" :key="category.name" class="group">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center">
                    <div :class="category.color" class="w-4 h-4 rounded-full mr-3"></div>
                    <span class="font-semibold text-neutral-900">{{ category.name }}</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-sm text-neutral-600">{{ category.count }} items</span>
                    <span class="text-sm font-bold text-neutral-900">{{ category.percentage }}%</span>
                  </div>
                </div>
                <div class="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                  <div
                    :class="category.color"
                    class="h-full rounded-full transition-all duration-700 group-hover:scale-105"
                    :style="`width: ${category.percentage}%`"
                  ></div>
                </div>
              </div>
            </div>

            <div class="mt-8 grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <p class="text-sm font-medium text-neutral-600">Total Items</p>
                <p class="text-2xl font-bold text-emerald-600">{{ totalInventoryItems.toLocaleString() }}</p>
              </div>
              <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <p class="text-sm font-medium text-neutral-600">Restock Needed</p>
                <p class="text-2xl font-bold text-orange-600">{{ restockNeeded }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  TrophyIcon,
  UsersIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'
import api from '@/services/Api'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// Reactive data
const currentDateTime = ref('')
const isRefreshing = ref(false)
const lastUpdated = ref('2 min')

// KPI Data
const totalRevenue = ref(0)
const revenueGrowth = ref(18.5)
const  totalProducts = ref(0)
const productChange = ref(12.3)
const totalStockValues = ref(0)
const customerGrowth = ref(22.1)
const lowStockCount = ref(0)
const stockStatus = ref('Critical')
const totalTransactions = ref(0)
const recentTransactions = ref([])


// Transaction data

// Top products data
const topProducts = ref([

])

// System status data
const systemStatus = ref([
  { name: 'Database', status: 'Online' },
  { name: 'Payment Gateway', status: 'Online' },
  { name: 'Inventory Sync', status: 'Warning' },
  { name: 'Backup System', status: 'Online' },
  { name: 'API Services', status: 'Online' },
  { name: 'Email Service', status: 'Online' }
])

// Sales trends data
const salesTrends = ref([
])

// Inventory status data
const inventoryStatus = ref([
  { name: 'In Stock', count: 0, percentage: 0, color: 'bg-emerald-500' },
  { name: 'Low Stock', count: 0, percentage: 0, color: 'bg-orange-500' },
  { name: 'Out of Stock', count: 0, percentage: 0, color: 'bg-red-500' }
])

// Computed properties
const weeklyTotal = computed(() => {
  return salesTrends.value.reduce((sum, day) => sum + day.amount, 0)
})

const dailyAverage = computed(() => {
  return Math.round(weeklyTotal.value / salesTrends.value.length)
})

const totalInventoryItems = computed(() => {
  return inventoryStatus.value.reduce((sum, status) => sum + status.count, 0)
})

const restockNeeded = computed(() => {
  return inventoryStatus.value.find(status => status.name === 'Low Stock')?.count +
    inventoryStatus.value.find(status => status.name === 'Out of Stock')?.count || 0
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

const formatTransactionAmount = (amount) => {
  const prefix = amount >= 0 ? '+' : ''
  return `${prefix}TZS${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const updateDateTime = () => {
  const now = new Date()
  currentDateTime.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Transaction methods
const getTransactionIcon = (type) => {
  const icons = {
    'sale': CurrencyDollarIcon,
    'return': XCircleIcon,
    'adjustment': ExclamationCircleIcon
  }
  return icons[type] || CheckCircleIcon
}

const getTransactionIconStyle = (type) => {
  const styles = {
    'sale': 'bg-gradient-to-br from-emerald-500 to-green-600 text-white',
    'return': 'bg-gradient-to-br from-red-500 to-pink-600 text-white',
    'adjustment': 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
  }
  return styles[type] || 'bg-gradient-to-br from-neutral-500 to-neutral-600 text-white'
}

const getAmountColor = (amount) => {
  return amount >= 0 ? 'text-emerald-600' : 'text-red-600'
}

const getStatusStyle = (status) => {
  const styles = {
    'Completed': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Processed': 'bg-brand-100 text-brand-800 border border-brand-200',
    'Refunded': 'bg-red-100 text-red-800 border border-red-200'
  }
  return styles[status] || 'bg-neutral-100 text-neutral-800 border border-neutral-200'
}

const getStatusDot = (status) => {
  const styles = {
    'Completed': 'bg-emerald-500',
    'Pending': 'bg-yellow-500',
    'Processed': 'bg-brand-500',
    'Refunded': 'bg-red-500'
  }
  return styles[status] || 'bg-neutral-500'
}

// Product ranking methods
const getRankStyle = (index) => {
  const styles = [
    'bg-gradient-to-br from-yellow-400 to-yellow-600',  // Gold
    'bg-gradient-to-br from-neutral-400 to-neutral-600',      // Silver
    'bg-gradient-to-br from-orange-400 to-orange-600',  // Bronze
    'bg-gradient-to-br from-brand-500 to-brand-600',      // Blue
    'bg-gradient-to-br from-purple-500 to-purple-600'   // Purple
  ]
  return styles[index] || 'bg-gradient-to-br from-neutral-500 to-neutral-600'
}

// System status methods
const getSystemStatusStyle = (status) => {
  const styles = {
    'Online': 'bg-emerald-100',
    'Warning': 'bg-yellow-100',
    'Offline': 'bg-red-100'
  }
  return styles[status] || 'bg-neutral-100'
}

const getSystemStatusDot = (status) => {
  const styles = {
    'Online': 'bg-emerald-500',
    'Warning': 'bg-yellow-500',
    'Offline': 'bg-red-500'
  }
  return styles[status] || 'bg-neutral-500'
}

const getSystemStatusText = (status) => {
  const styles = {
    'Online': 'text-emerald-600',
    'Warning': 'text-yellow-600',
    'Offline': 'text-red-600'
  }
  return styles[status] || 'text-neutral-600'
}

// Action methods
const refreshDashboard = async () => {
  isRefreshing.value = true
  try {
    // Refresh all dashboard data
    await Promise.all([
      fetchTotalTransactions(),
      fetchTopProducts(),
      fetchSalesTrends(),
      fetchLowStockCount(),
      fetchTotalStockValue(),
      fetchTotalProducts(),
      fetchTotalRevenue(),
      fetchRecentSales(),
      fetchInventoryStats()
    ])

    lastUpdated.value = 'Just now'
    swalAlert.value?.showSuccess('Dashboard refreshed successfully')
  } catch (error) {
    swalAlert.value?.showError('Failed to refresh dashboard', error.message)
  } finally {
    isRefreshing.value = false
  }
}

const viewAllTransactions = () => {
  swalAlert.value?.showInfo('Navigation', 'Redirecting to transactions page...')
}

const viewTransactionDetails = (transaction) => {
  swalAlert.value?.showInfo('Transaction Details', `Viewing details for ${transaction.id}`)
}

const viewDaySales = (day) => {
  swalAlert.value?.showInfo('Daily Sales', `${day.day}: $${formatNumber(day.amount)} (${day.percentage}% of target)`)
}

// Auto-refresh functionality
let refreshInterval = null



async function fetchRecentSales() {
  recentTransactions.value = await apiCall('/sales/recent-sales')
}


async function fetchTotalProducts() {
  try {
    totalProducts.value = await apiCall('/items/item-stocks/available')
  } catch (error) {
    console.error('Failed to fetch total products:', error)
  }
}


async  function fetchTotalRevenue() {
  try {
    const data = await apiCall('/sales/total-sales')
    totalRevenue.value = data.totalSales
  } catch (error) {
    console.error('Failed to fetch total revenue:', error)
  }
}

async function fetchTotalStockValue() {
  try {
    totalStockValues.value = await apiCall('/items/item-stocks/actual-value')
  } catch (error) {
    console.error('Failed to fetch total customers:', error)
  }
}

async function fetchLowStockCount() {
  try {
    lowStockCount.value = await apiCall('/items/item-stocks/low-stock')
  } catch (error) {
    console.error('Failed to fetch low stock count:', error)
  }
}

async function fetchSalesTrends() {
  try {
    const data = await apiCall('/sales/total-sales-by-week')
    salesTrends.value = data.map(day => ({
      day: day.day,
      amount: day.amount,
      percentage: Math.round((day.amount / data.reduce((sum, d) => sum + d.amount, 0)) * 100)
    }))
  } catch (error) {
    console.error('Failed to fetch sales trends:', error)
  }
}

async function fetchTopProducts() {
  try {
    const data = await apiCall('/sales/top-products')
    topProducts.value = data
  } catch (error) {
    console.error('Failed to fetch top products:', error)
  }
}


async function fetchTotalTransactions() {
  try {
    totalTransactions.value = await apiCall('/sales/total-sales-count')
  } catch (error) {
    console.error('Failed to fetch total transactions:', error)
  }
}

async function fetchInventoryStats() {
  try {
    const itemStocks = await apiCall('/items/item-stocks')

    // Calculate statistics based on reorder points
    let inStockCount = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    itemStocks.forEach(stock => {
      const reorderPoint = stock.reorderPoint || 10
      if (stock.quantity === 0) {
        outOfStockCount++
      } else if (stock.quantity <= reorderPoint) {
        lowStockCount++
      } else {
        inStockCount++
      }
    })

    const total = itemStocks.length || 1 // Avoid division by zero

    // Update inventory status with real data
    inventoryStatus.value = [
      {
        name: 'In Stock',
        count: inStockCount,
        percentage: Math.round((inStockCount / total) * 100),
        color: 'bg-emerald-500'
      },
      {
        name: 'Low Stock',
        count: lowStockCount,
        percentage: Math.round((lowStockCount / total) * 100),
        color: 'bg-orange-500'
      },
      {
        name: 'Out of Stock',
        count: outOfStockCount,
        percentage: Math.round((outOfStockCount / total) * 100),
        color: 'bg-red-500'
      }
    ]
  } catch (error) {
    console.error('Failed to fetch inventory statistics:', error)
  }
}

onMounted(() => {
  fetchTotalTransactions()
  fetchTopProducts()
  fetchSalesTrends()
  fetchLowStockCount()
  fetchTotalStockValue()
  fetchTotalProducts()
  fetchTotalRevenue()
  fetchRecentSales()
  fetchInventoryStats()
  updateDateTime()
  refreshInterval = setInterval(() => {
    updateDateTime()
    lastUpdated.value = Math.floor(Math.random() * 5) + 1 + ' min'
  }, 60000) // Update every minute
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

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
</script>
