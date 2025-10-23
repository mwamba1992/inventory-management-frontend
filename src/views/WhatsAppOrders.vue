<template>
  <SwalAlert ref="swalAlert" />
  <div class="whatsapp-orders-container">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">WhatsApp Orders Management</h1>
      <p class="page-subtitle">Manage and track WhatsApp orders</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading orders...</p>
    </div>

    <!-- Content -->
    <div v-else class="content">
      <!-- Order Statistics Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="card-header">
            <h3>Total Orders</h3>
          </div>
          <div class="card-value">{{ formatNumber(orderStats.totalOrders) }}</div>
          <div class="card-period">All orders</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <h3>Pending</h3>
          </div>
          <div class="card-value" style="color: #f59e0b;">{{ formatNumber(orderStats.pendingOrders) }}</div>
          <div class="card-period">Awaiting confirmation</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <h3>Delivered</h3>
          </div>
          <div class="card-value" style="color: #10b981;">{{ formatNumber(orderStats.deliveredOrders) }}</div>
          <div class="card-period">Successfully completed</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <h3>Total Revenue</h3>
          </div>
          <div class="card-value">TZS{{ formatNumber(orderStats.totalRevenue) }}</div>
          <div class="card-period">From completed orders</div>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="status-breakdown">
        <h3>Orders by Status</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Pending</span>
            <span class="status-count">{{ orderStats.pendingOrders }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Confirmed</span>
            <span class="status-count">{{ orderStats.confirmedOrders }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Processing</span>
            <span class="status-count">{{ orderStats.processingOrders }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Ready</span>
            <span class="status-count">{{ orderStats.readyOrders }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Delivered</span>
            <span class="status-count">{{ orderStats.deliveredOrders }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Cancelled</span>
            <span class="status-count">{{ orderStats.cancelledOrders }}</span>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="data-table-container">
        <h3>All Orders</h3>
        <table class="data-table">
          <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td><span class="font-medium">#{{ order.id }}</span></td>
            <td>{{ order.customerName }}</td>
            <td>{{ order.customerPhone }}</td>
            <td>{{ order.itemCount }} item(s)</td>
            <td>TZS{{ formatNumber(order.totalAmount) }}</td>
            <td>
              <select
                :value="order.status"
                @change="updateOrderStatus(order.id, $event.target.value)"
                class="status-select"
                :class="[order.status]"
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
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>
              <button
                v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                @click="cancelOrder(order.id)"
                class="cancel-btn"
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
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
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
    // Fetch order statistics
    const stats = await apiCall('/whatsapp/stats/orders')

    orderStats.totalOrders = stats.totalOrders || 0
    orderStats.pendingOrders = stats.pending || 0
    orderStats.confirmedOrders = stats.confirmed || 0
    orderStats.processingOrders = stats.processing || 0
    orderStats.readyOrders = stats.ready || 0
    orderStats.deliveredOrders = stats.delivered || 0
    orderStats.cancelledOrders = stats.cancelled || 0
    orderStats.totalRevenue = stats.totalRevenue || 0

    // Fetch all orders
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

    // Refresh orders
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

    // Refresh orders
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

<style scoped>
.whatsapp-orders-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: #64748b;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.card-period {
  font-size: 12px;
  color: #6b7280;
}

.status-breakdown {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.status-breakdown h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.status-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.status-count {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.data-table-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
}

.data-table-container h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.font-medium {
  font-weight: 500;
  color: #374151;
}

.status-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-select.pending {
  color: #f59e0b;
  border-color: #f59e0b;
  background: #fffbeb;
}

.status-select.confirmed {
  color: #3b82f6;
  border-color: #3b82f6;
  background: #eff6ff;
}

.status-select.processing {
  color: #8b5cf6;
  border-color: #8b5cf6;
  background: #f5f3ff;
}

.status-select.ready {
  color: #06b6d4;
  border-color: #06b6d4;
  background: #ecfeff;
}

.status-select.delivered {
  color: #10b981;
  border-color: #10b981;
  background: #f0fdf4;
}

.status-select.cancelled {
  color: #ef4444;
  border-color: #ef4444;
  background: #fef2f2;
}

.cancel-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #dc2626;
}

.cancel-btn:active {
  background: #b91c1c;
}
</style>
