<template>
  <SwalAlert ref="swalAlert" />
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
              <span class="text-neutral-700 font-medium">WhatsApp Orders</span>
            </div>
            <h1 class="text-3xl font-bold text-neutral-900">WhatsApp Orders</h1>
            <p class="text-neutral-500 mt-1">Manage and track WhatsApp orders</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="fetchOrders"
              class="btn-secondary flex items-center text-sm !px-3"
            >
              <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
        <div class="w-10 h-10 border-4 border-neutral-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p class="text-neutral-500">Loading orders...</p>
      </div>

      <!-- Content -->
      <div v-else class="flex flex-col gap-6">
        <!-- Order Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Orders</h3>
              <div class="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <ClipboardDocumentListIcon class="w-5 h-5 text-brand-600" />
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(orderStats.totalOrders) }}</div>
            <div class="text-xs text-neutral-400">All orders</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Pending</h3>
              <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <ClockIcon class="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div class="text-2xl font-bold text-amber-500 mb-1">{{ formatNumber(orderStats.pendingOrders) }}</div>
            <div class="text-xs text-neutral-400">Awaiting confirmation</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Delivered</h3>
              <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div class="text-2xl font-bold text-emerald-500 mb-1">{{ formatNumber(orderStats.deliveredOrders) }}</div>
            <div class="text-xs text-neutral-400">Successfully completed</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Revenue</h3>
              <div class="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-brand-600" />
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">TZS{{ formatNumber(orderStats.totalRevenue) }}</div>
            <div class="text-xs text-neutral-400">From completed orders</div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
          <h3 class="text-lg font-semibold text-neutral-900 mb-5">Orders by Status</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Pending</span>
              <span class="text-2xl font-bold text-neutral-900">{{ orderStats.pendingOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Confirmed</span>
              <span class="text-2xl font-bold text-neutral-900">{{ orderStats.confirmedOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Processing</span>
              <span class="text-2xl font-bold text-neutral-900">{{ orderStats.processingOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Ready</span>
              <span class="text-2xl font-bold text-neutral-900">{{ orderStats.readyOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Delivered</span>
              <span class="text-2xl font-bold text-neutral-900">{{ orderStats.deliveredOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Cancelled</span>
              <span class="text-2xl font-bold text-neutral-900">{{ orderStats.cancelledOrders }}</span>
            </div>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-100">
            <h3 class="text-lg font-semibold text-neutral-900">All Orders</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-neutral-50 border-b border-neutral-200">
                  <th class="table-header">Order ID</th>
                  <th class="table-header">Customer</th>
                  <th class="table-header">Phone</th>
                  <th class="table-header">Items</th>
                  <th class="table-header">Total Amount</th>
                  <th class="table-header">Status</th>
                  <th class="table-header">Date</th>
                  <th class="table-header">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-if="orders.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center">
                    <ClipboardDocumentListIcon class="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p class="text-neutral-500 font-medium">No orders found</p>
                    <p class="text-sm text-neutral-400 mt-1">WhatsApp orders will appear here</p>
                  </td>
                </tr>
                <tr v-for="order in orders" :key="order.id" class="table-row">
                  <td class="table-cell font-medium text-neutral-900">#{{ order.id }}</td>
                  <td class="table-cell">{{ order.customerName }}</td>
                  <td class="table-cell">{{ order.customerPhone }}</td>
                  <td class="table-cell">{{ order.itemCount }} item(s)</td>
                  <td class="table-cell font-medium">TZS{{ formatNumber(order.totalAmount) }}</td>
                  <td class="table-cell">
                    <select
                      :value="order.status"
                      @change="updateOrderStatus(order.id, $event.target.value)"
                      class="px-3 py-1.5 border rounded-xl text-sm font-medium bg-white cursor-pointer transition-all duration-200"
                      :class="{
                        'text-amber-500 border-amber-400 bg-amber-50': order.status === 'pending',
                        'text-brand-500 border-brand-400 bg-brand-50': order.status === 'confirmed',
                        'text-violet-500 border-violet-400 bg-violet-50': order.status === 'processing',
                        'text-cyan-500 border-cyan-400 bg-cyan-50': order.status === 'ready',
                        'text-emerald-500 border-emerald-400 bg-emerald-50': order.status === 'delivered',
                        'text-red-500 border-red-400 bg-red-50': order.status === 'cancelled',
                        'opacity-60 cursor-not-allowed': order.status === 'delivered' || order.status === 'cancelled'
                      }"
                      :disabled="order.status === 'delivered' || order.status === 'cancelled'"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled" disabled>Cancelled</option>
                    </select>
                  </td>
                  <td class="table-cell">{{ formatDate(order.createdAt) }}</td>
                  <td class="table-cell">
                    <button
                      v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                      @click="cancelOrder(order.id)"
                      class="btn-danger text-sm !py-1.5 !px-3"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import {
  HomeIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import { Configs } from '@/utils/Configs'
import SwalAlert from '@/components/common/SwalAlert.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const swalAlert = ref(null)
const loading = ref(true)

const orderStats = reactive({
  totalOrders: 0,
  pendingOrders: 0,
  confirmedOrders: 0,
  processingOrders: 0,
  readyOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  totalRevenue: 0
})

const orders = ref([])

const API_BASE_URL = Configs.API_BASE_URL

const apiCall = async (url, options = {}) => {
  try {
    const token = userStore.getToken
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers,
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

const fetchOrders = async () => {
  loading.value = true
  try {
    const stats = await apiCall('/whatsapp/stats/orders')

    orderStats.totalOrders = stats.totalOrders || 0
    orderStats.pendingOrders = stats.pending || 0
    orderStats.confirmedOrders = stats.confirmed || 0
    orderStats.processingOrders = stats.processing || 0
    orderStats.readyOrders = stats.ready || 0
    orderStats.deliveredOrders = stats.delivered || 0
    orderStats.cancelledOrders = stats.cancelled || 0
    orderStats.totalRevenue = stats.totalRevenue || 0

    const ordersList = await apiCall('/whatsapp/orders')

    orders.value = (ordersList || []).map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      itemCount: order.items?.length || 0,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }))
  } catch (error) {
    console.error('Error fetching orders:', error)
    swalAlert.value?.showError('Failed to fetch orders', error.message || 'An error occurred while loading orders')
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    loading.value = true
    await apiCall(`/whatsapp/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })

    swalAlert.value?.showSuccess('Status Updated', `Order #${orderId} status changed to ${newStatus}`)

    await fetchOrders()
  } catch (error) {
    console.error('Error updating order status:', error)
    swalAlert.value?.showError('Update Failed', error.message || 'Failed to update order status')
    loading.value = false
  }
}

const cancelOrder = async (orderId) => {
  try {
    const confirmed = confirm(`Are you sure you want to cancel order #${orderId}? This will restore inventory stock.`)
    if (!confirmed) return

    loading.value = true
    await apiCall(`/whatsapp/orders/${orderId}/cancel`, {
      method: 'PUT'
    })

    swalAlert.value?.showSuccess('Order Cancelled', `Order #${orderId} has been cancelled and inventory restored`)

    await fetchOrders()
  } catch (error) {
    console.error('Error cancelling order:', error)
    swalAlert.value?.showError('Cancellation Failed', error.message || 'Failed to cancel order')
    loading.value = false
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchOrders()
})
</script>
