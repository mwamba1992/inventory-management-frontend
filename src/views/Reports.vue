<template>
  <SwalAlert ref="swalAlert" />
  <div class="reports-container">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Business Reports</h1>
      <p class="page-subtitle">Detailed analytics and insights for your business</p>

      <!-- Filter Controls -->
      <div class="filter-section">
        <div class="filter-group">
          <label>Date Range:</label>
          <select v-model="selectedDateRange" @change="handleDateRangeChange">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div v-if="selectedDateRange === 'custom'" class="filter-group">
          <label>From Date:</label>
          <input 
            type="date" 
            v-model="customDateFrom" 
            @change="fetchReports"
            class="date-input"
          />
        </div>
        <div v-if="selectedDateRange === 'custom'" class="filter-group">
          <label>To Date:</label>
          <input 
            type="date" 
            v-model="customDateTo" 
            @change="fetchReports"
            class="date-input"
          />
        </div>
        <div class="filter-group">
          <label>Report Type:</label>
          <select v-model="selectedReport" @change="updateReport">
            <option value="overview">Overview</option>
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="customers">Customer Report</option>
            <option value="financial">Financial Report</option>
            <option value="whatsapp">WhatsApp Orders</option>
          </select>
        </div>
        <button @click="exportReport" class="export-btn">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading reports...</p>
    </div>

    <!-- Reports Content -->
    <div v-else class="reports-content">

      <!-- Overview Report -->
      <div v-if="selectedReport === 'overview'" class="report-section">
        <h2 class="section-title">Business Overview</h2>

        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-header">
              <h3>Total Revenue</h3>
              <div :class="['trend', reportData.revenueGrowth >= 0 ? 'positive' : 'negative']">
                {{ reportData.revenueGrowth >= 0 ? '+' : '' }}{{ reportData.revenueGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="card-value">TZS{{ formatNumber(reportData.totalRevenue) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Total Orders</h3>
              <div :class="['trend', reportData.ordersGrowth >= 0 ? 'positive' : 'negative']">
                {{ reportData.ordersGrowth >= 0 ? '+' : '' }}{{ reportData.ordersGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="card-value">{{ formatNumber(reportData.totalOrders) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Active Customers</h3>
              <div :class="['trend', reportData.customersGrowth >= 0 ? 'positive' : 'negative']">
                {{ reportData.customersGrowth >= 0 ? '+' : '' }}{{ reportData.customersGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="card-value">{{ formatNumber(reportData.activeCustomers) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Avg Order Value</h3>
              <div :class="['trend', reportData.avgOrderGrowth >= 0 ? 'positive' : 'negative']">
                {{ reportData.avgOrderGrowth >= 0 ? '+' : '' }}{{ reportData.avgOrderGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="card-value">TZS{{ formatNumber(reportData.avgOrderValue) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <div class="chart-container">
            <h3>Sales Trend</h3>
            <canvas ref="salesChart" class="chart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Top Products</h3>
            <canvas ref="productsChart" class="chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Sales Report -->
      <div v-if="selectedReport === 'sales'" class="report-section">
        <h2 class="section-title">Sales Report</h2>

        <div class="report-metrics">
          <div class="metric-box">
            <label>Total Sales:</label>
            <span class="metric-value">TZS{{ formatNumber(reportData.salesMetrics.total) }}</span>
          </div>
          <div class="metric-box">
            <label>Units Sold:</label>
            <span class="metric-value">{{ formatNumber(reportData.salesMetrics.units) }}</span>
          </div>
          <div class="metric-box">
            <label>Growth Rate:</label>
            <span class="metric-value positive">+{{ reportData.salesMetrics.growth }}%</span>
          </div>
        </div>

        <div class="data-table-container">
          <h3>Recent Sales</h3>
          <table class="data-table">
            <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="sale in reportData.recentSales" :key="sale.id">
              <td>{{ formatDate(sale.date) }}</td>
              <td>{{ sale.customer }}</td>
              <td>{{ sale.product }}</td>
              <td>{{ sale.quantity }}</td>
              <td>TZS{{ formatNumber(sale.amount) }}</td>
              <td>
                  <span :class="['status', sale.status.toLowerCase()]">
                    {{ sale.status }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inventory Report -->
      <div v-if="selectedReport === 'inventory'" class="report-section">
        <h2 class="section-title">Inventory Report</h2>

        <!-- Inventory Summary Cards -->
        <div class="summary-grid" style="margin-bottom: 32px;">
          <div class="summary-card">
            <div class="card-header">
              <h3>Total Items</h3>
            </div>
            <div class="card-value">{{ formatNumber(reportData.inventory.totalItems) }}</div>
            <div class="card-period">In inventory</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Total Stock Value</h3>
            </div>
            <div class="card-value">TZS{{ formatNumber(reportData.inventory.totalStockValue) }}</div>
            <div class="card-period">Current valuation</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Low Stock Items</h3>
            </div>
            <div class="card-value" style="color: #f59e0b;">{{ reportData.inventory.lowStockCount }}</div>
            <div class="card-period">Need reorder</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Out of Stock</h3>
            </div>
            <div class="card-value" style="color: #ef4444;">{{ reportData.inventory.outOfStockCount }}</div>
            <div class="card-period">Urgent attention</div>
          </div>
        </div>

        <div class="inventory-alerts">
          <div class="alert-box low-stock">
            <h3>Low Stock Items</h3>
            <div class="alert-count">{{ reportData.lowStockItems.length }}</div>
            <ul>
              <li v-for="item in reportData.lowStockItems.slice(0, 5)" :key="item.id">
                {{ item.name }} - {{ item.stock }} units left
              </li>
            </ul>
          </div>

          <div class="alert-box out-of-stock">
            <h3>Out of Stock</h3>
            <div class="alert-count">{{ reportData.outOfStockItems.length }}</div>
            <ul>
              <li v-for="item in reportData.outOfStockItems.slice(0, 5)" :key="item.id">
                {{ item.name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Items by Category -->
        <div v-if="reportData.inventory.itemsByCategory.length > 0" class="data-table-container" style="margin-top: 32px;">
          <h3>Items by Category</h3>
          <table class="data-table">
            <thead>
            <tr>
              <th>Category</th>
              <th>Item Count</th>
              <th>Total Value</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="category in reportData.inventory.itemsByCategory" :key="category.category">
              <td>{{ category.category }}</td>
              <td>{{ formatNumber(category.count) }}</td>
              <td>TZS{{ formatNumber(category.value) }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="data-table-container" style="margin-top: 32px;">
          <h3>Inventory Summary</h3>
          <table class="data-table">
            <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Value</th>
              <th>Warehouse</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.inventoryItems" :key="item.id">
              <td><span class="font-medium">{{ item.productCode }}</span></td>
              <td>{{ item.name }}</td>
              <td>{{ item.category || 'N/A' }}</td>
              <td class="text-center">{{ formatNumber(item.currentStock) }}</td>
              <td class="text-center">{{ formatNumber(item.minStock) }}</td>
              <td>TZS{{ formatNumber(item.value) }}</td>
              <td>{{ item.warehouse }}</td>
              <td>
                  <span :class="['status', getStockStatus(item).toLowerCase().replace(/\s+/g, '.')]">
                    {{ getStockStatus(item) }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Report -->
      <div v-if="selectedReport === 'customers'" class="report-section">
        <h2 class="section-title">Customer Report</h2>

        <!-- Customer Summary Cards -->
        <div class="summary-grid" style="margin-bottom: 32px;">
          <div class="summary-card">
            <div class="card-header">
              <h3>Total Customers</h3>
            </div>
            <div class="card-value">{{ formatNumber(reportData.customerMetrics.totalCustomers || 0) }}</div>
            <div class="card-period">All time</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Active Customers</h3>
            </div>
            <div class="card-value">{{ formatNumber(reportData.customerMetrics.activeCustomers || 0) }}</div>
            <div class="card-period">This period</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>New Customers</h3>
            </div>
            <div class="card-value">{{ formatNumber(reportData.customerMetrics.newCustomers) }}</div>
            <div class="card-period">This period</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Return Rate</h3>
            </div>
            <div class="card-value">{{ reportData.customerMetrics.returnRate.toFixed(1) }}%</div>
            <div class="card-period">Returning customers</div>
          </div>
        </div>

        <div class="customer-insights">
          <div class="insight-card">
            <h3>Returning Customers</h3>
            <div class="insight-value">{{ reportData.customerMetrics.returningCustomers }}</div>
            <div class="insight-period">{{ reportData.customerMetrics.returnRate.toFixed(1) }}% return rate</div>
          </div>

          <div class="insight-card">
            <h3>Customer Lifetime Value</h3>
            <div class="insight-value">TZS{{ formatNumber(reportData.customerMetrics.avgLifetimeValue) }}</div>
            <div class="insight-period">Average per customer</div>
          </div>

          <div class="insight-card">
            <h3>Customer Growth</h3>
            <div class="insight-value">{{ reportData.customerMetrics.newCustomers }}</div>
            <div class="insight-period">New this period</div>
          </div>
        </div>

        <div class="data-table-container">
          <h3>Top Customers</h3>
          <table class="data-table">
            <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="customer in reportData.topCustomers" :key="customer.id">
              <td>{{ customer.name }}</td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.totalOrders }}</td>
              <td>TZS{{ formatNumber(customer.totalSpent) }}</td>
              <td>{{ formatDate(customer.lastOrder) }}</td>
              <td>
                  <span :class="['status', customer.status.toLowerCase()]">
                    {{ customer.status }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financial Report -->
      <div v-if="selectedReport === 'financial'" class="report-section">
        <h2 class="section-title">Financial Report</h2>

        <div class="financial-summary">
          <div class="financial-card revenue">
            <h3>Total Revenue</h3>
            <div class="amount positive">TZS{{ formatNumber(reportData.financial.revenue) }}</div>
            <div :class="['change', reportData.financial.revenueGrowth >= 0 ? 'positive' : 'negative']">
              {{ reportData.financial.revenueGrowth >= 0 ? '+' : '' }}{{ reportData.financial.revenueGrowth.toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="financial-card expenses">
            <h3>Total Expenses</h3>
            <div class="amount negative">TZS{{ formatNumber(reportData.financial.expenses) }}</div>
            <div :class="['change', reportData.financial.expenseGrowth >= 0 ? 'negative' : 'positive']">
              {{ reportData.financial.expenseGrowth >= 0 ? '+' : '' }}{{ reportData.financial.expenseGrowth.toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="financial-card profit">
            <h3>Net Profit</h3>
            <div class="amount positive">TZS{{ formatNumber(reportData.financial.profit) }}</div>
            <div :class="['change', reportData.financial.profitGrowth >= 0 ? 'positive' : 'negative']">
              {{ reportData.financial.profitGrowth >= 0 ? '+' : '' }}{{ reportData.financial.profitGrowth.toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="financial-card margin">
            <h3>Profit Margin</h3>
            <div class="amount">{{ reportData.financial.profitMargin.toFixed(1) }}%</div>
            <div :class="['change', reportData.financial.marginGrowth >= 0 ? 'positive' : 'negative']">
              {{ reportData.financial.marginGrowth >= 0 ? '+' : '' }}{{ reportData.financial.marginGrowth.toFixed(1) }}% vs last period
            </div>
          </div>
        </div>

        <div class="expense-breakdown">
          <h3>Expense Breakdown</h3>
          <div class="expense-list">
            <div v-for="expense in reportData.expenseBreakdown" :key="expense.category" class="expense-item">
              <div class="expense-info">
                <span class="expense-category">{{ formatCategory(expense.category) }}</span>
                <span class="expense-amount">TZS{{ formatNumber(expense.amount) }}</span>
              </div>
              <div class="expense-bar">
                <div class="expense-fill" :style="{ width: expense.percentage + '%' }"></div>
              </div>
              <span class="expense-percentage">{{ expense.percentage.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Orders Report -->
      <div v-if="selectedReport === 'whatsapp'" class="report-section">
        <h2 class="section-title">WhatsApp Orders</h2>

        <!-- Order Statistics Cards -->
        <div class="summary-grid" style="margin-bottom: 32px;">
          <div class="summary-card">
            <div class="card-header">
              <h3>Total Orders</h3>
            </div>
            <div class="card-value">{{ formatNumber(reportData.whatsappOrders.totalOrders) }}</div>
            <div class="card-period">All orders</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Pending</h3>
            </div>
            <div class="card-value" style="color: #f59e0b;">{{ formatNumber(reportData.whatsappOrders.pendingOrders) }}</div>
            <div class="card-period">Awaiting confirmation</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Delivered</h3>
            </div>
            <div class="card-value" style="color: #10b981;">{{ formatNumber(reportData.whatsappOrders.deliveredOrders) }}</div>
            <div class="card-period">Successfully completed</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Total Revenue</h3>
            </div>
            <div class="card-value">TZS{{ formatNumber(reportData.whatsappOrders.totalRevenue) }}</div>
            <div class="card-period">From completed orders</div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="status-breakdown" style="margin-bottom: 32px;">
          <h3>Orders by Status</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">Pending</span>
              <span class="status-count">{{ reportData.whatsappOrders.pendingOrders }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Confirmed</span>
              <span class="status-count">{{ reportData.whatsappOrders.confirmedOrders }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Processing</span>
              <span class="status-count">{{ reportData.whatsappOrders.processingOrders }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Ready</span>
              <span class="status-count">{{ reportData.whatsappOrders.readyOrders }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Delivered</span>
              <span class="status-count">{{ reportData.whatsappOrders.deliveredOrders }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Cancelled</span>
              <span class="status-count">{{ reportData.whatsappOrders.cancelledOrders }}</span>
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
            <tr v-for="order in reportData.whatsappOrders.orders" :key="order.id">
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
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Configs } from '@/utils/Configs'
import SwalAlert from '@/components/common/SwalAlert.vue'
import { Chart, registerables } from 'chart.js'
import { useUserStore } from '@/stores/user'

// Register Chart.js components
Chart.register(...registerables)

// User store for authentication
const userStore = useUserStore()

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// Chart refs
const salesChart = ref(null)
const productsChart = ref(null)
let salesChartInstance = null
let productsChartInstance = null

// Reactive data
const loading = ref(true)
const selectedDateRange = ref('30')
const selectedReport = ref('overview')
const customDateFrom = ref('')
const customDateTo = ref('')

const reportData = reactive({
  totalRevenue: 0,
  totalOrders: 0,
  activeCustomers: 0,
  avgOrderValue: 0,
  revenueGrowth: 0,
  ordersGrowth: 0,
  customersGrowth: 0,
  avgOrderGrowth: 0,
  salesMetrics: {
    total: 0,
    units: 0,
    growth: 0
  },
  recentSales: [],
  topProducts: [],
  salesTrend: [],
  inventory: {
    totalItems: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    itemsByCategory: []
  },
  lowStockItems: [],
  outOfStockItems: [],
  inventoryItems: [],
  customerMetrics: {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    returnRate: 0,
    avgLifetimeValue: 0
  },
  topCustomers: [],
  financial: {
    revenue: 0,
    expenses: 0,
    profit: 0,
    profitMargin: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
    marginGrowth: 0
  },
  expenseBreakdown: [],
  whatsappOrders: {
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    readyOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    orders: []
  }
})

// Methods

const API_BASE_URL = Configs.API_BASE_URL
const getDateRangePayload = () => {
  if (selectedDateRange.value === 'custom') {
    return {
      startDate: customDateFrom.value,
      endDate: customDateTo.value
    };
  } else {
    return {
      days: selectedDateRange.value
    };
  }
};

const fetchReports = async () => {
  loading.value = true
  try {
    // Validate custom date range
    if (selectedDateRange.value === 'custom' && (!customDateFrom.value || !customDateTo.value)) {
      loading.value = false;
      swalAlert.value?.showWarning('Invalid Date Range', 'Please select both start and end dates for custom range');
      return;
    }

    // Map UI date range values to API dateRange format
    const dateRangeMap = {
      '7': 'last_7_days',
      '30': 'last_30_days',
      '90': 'last_90_days',
      '365': 'this_year'
    };

    // Build query parameters for GET request
    let queryParams = '';
    if (selectedDateRange.value === 'custom') {
      queryParams = `?startDate=${customDateFrom.value}&endDate=${customDateTo.value}`;
    } else {
      const dateRangeValue = dateRangeMap[selectedDateRange.value] || 'last_30_days';
      queryParams = `?dateRange=${dateRangeValue}`;
    }

    // Fetch comprehensive business overview data from single endpoint (GET)
    const businessOverview = await apiCall(`/reports/business-overview${queryParams}`);

    // Map overview metrics (new structure with current/previous/percentageChange)
    reportData.totalRevenue = businessOverview.totalRevenue?.current || 0;
    reportData.totalOrders = businessOverview.totalOrders?.current || 0;
    reportData.activeCustomers = businessOverview.activeCustomers?.current || 0;
    reportData.avgOrderValue = businessOverview.avgOrderValue?.current || 0;

    // Store growth percentages for display
    reportData.revenueGrowth = businessOverview.totalRevenue?.percentageChange || 0;
    reportData.ordersGrowth = businessOverview.totalOrders?.percentageChange || 0;
    reportData.customersGrowth = businessOverview.activeCustomers?.percentageChange || 0;
    reportData.avgOrderGrowth = businessOverview.avgOrderValue?.percentageChange || 0;

    // Map sales metrics
    reportData.salesMetrics = {
      total: businessOverview.totalRevenue?.current || 0,
      units: businessOverview.totalOrders?.current || 0,
      growth: businessOverview.totalRevenue?.percentageChange || 0
    };

    // Map top products (renamed from topProducts to match API response)
    reportData.topProducts = (businessOverview.topProducts || []).map(product => ({
      name: product.name,
      quantity: product.quantitySold,
      revenue: product.revenue
    }));

    // Map sales trend
    reportData.salesTrend = (businessOverview.salesTrend || []).map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      amount: item.revenue
    }));

    // Fetch detailed sales data for Sales Report section
    // Build date payload for POST request
    const salesDatePayload = selectedDateRange.value === 'custom'
      ? { startDate: customDateFrom.value, endDate: customDateTo.value }
      : { days: parseInt(selectedDateRange.value) };

    const salesData = await apiCall('/sales/sales-by-days', {
      method: 'POST',
      body: JSON.stringify(salesDatePayload)
    });

    // Map recent sales for Sales Report table
    reportData.recentSales = (salesData || []).map(sale => ({
      id: sale.id,
      date: sale.createdAt,
      customer: sale.customer?.name || 'Unknown',
      product: sale.item?.name || 'Unknown',
      quantity: sale.quantity,
      amount: sale.amountPaid,
      status: sale.status || "Completed"
    }));

    // Calculate total units sold from sales data for accurate metrics
    const totalUnitsSold = (salesData || []).reduce((total, sale) => total + (sale.quantity || 0), 0);

    // Update sales metrics with accurate units
    reportData.salesMetrics.units = totalUnitsSold;

    // Fetch financial report data
    const financialReport = await apiCall(`/reports/financial${queryParams}`);

    // Map financial data
    reportData.financial.revenue = financialReport.totalRevenue?.current || 0;
    reportData.financial.expenses = financialReport.totalExpenses?.current || 0;
    reportData.financial.profit = financialReport.netProfit?.current || 0;
    reportData.financial.profitMargin = financialReport.profitMargin?.current || 0;
    reportData.financial.revenueGrowth = financialReport.totalRevenue?.percentageChange || 0;
    reportData.financial.expenseGrowth = financialReport.totalExpenses?.percentageChange || 0;
    reportData.financial.profitGrowth = financialReport.netProfit?.percentageChange || 0;
    reportData.financial.marginGrowth = financialReport.profitMargin?.percentageChange || 0;

    // Map expense breakdown
    reportData.expenseBreakdown = (financialReport.expenseBreakdown || []).map(expense => ({
      category: expense.category,
      amount: expense.amount,
      percentage: expense.percentage
    }));

    // Fetch customer report data
    const customerReport = await apiCall(`/reports/customers${queryParams}`);

    // Map customer metrics
    reportData.customerMetrics.totalCustomers = customerReport.totalCustomers || 0;
    reportData.customerMetrics.activeCustomers = customerReport.activeCustomers || 0;
    reportData.customerMetrics.newCustomers = customerReport.newCustomers || 0;
    reportData.customerMetrics.returningCustomers = customerReport.returningCustomers || 0;
    reportData.customerMetrics.returnRate = customerReport.returnRate || 0;
    reportData.customerMetrics.avgLifetimeValue = customerReport.customerLifetimeValue || 0;

    // Map top customers
    reportData.topCustomers = (customerReport.topCustomers || []).map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      lastOrder: customer.lastOrder,
      status: customer.status
    }));

    // Fetch inventory report data (GET request)
    const inventoryReport = await apiCall('/reports/inventory');

    reportData.inventory.totalItems = inventoryReport.totalItems || 0;
    reportData.inventory.totalStockValue = inventoryReport.totalStockValue || 0;
    reportData.inventory.lowStockCount = inventoryReport.lowStockItems || 0;
    reportData.inventory.outOfStockCount = inventoryReport.outOfStockItems || 0;
    reportData.inventory.itemsByCategory = inventoryReport.itemsByCategory || [];

    // Map inventory items from API response
    reportData.inventoryItems = (inventoryReport.items || []).map(item => ({
      id: item.id,
      name: item.productName,
      productCode: item.productCode,
      currentStock: item.currentStock,
      minStock: item.minStock,
      value: item.value,
      warehouse: item.warehouse,
      status: item.status,
      category: item.category
    }));

    // Filter low stock and out of stock items
    reportData.lowStockItems = reportData.inventoryItems.filter(item =>
      item.status === 'Low Stock' || (item.currentStock < item.minStock && item.currentStock > 0)
    ).map(item => ({
      id: item.id,
      name: item.name,
      stock: item.currentStock,
      minStock: item.minStock
    }));

    reportData.outOfStockItems = reportData.inventoryItems.filter(item =>
      item.status === 'Out of Stock' || item.currentStock === 0
    ).map(item => ({
      id: item.id,
      name: item.name
    }));

    // Fetch WhatsApp orders data
    const whatsappStats = await apiCall('/whatsapp/stats/orders');

    reportData.whatsappOrders.totalOrders = whatsappStats.totalOrders || 0;
    reportData.whatsappOrders.pendingOrders = whatsappStats.pending || 0;
    reportData.whatsappOrders.confirmedOrders = whatsappStats.confirmed || 0;
    reportData.whatsappOrders.processingOrders = whatsappStats.processing || 0;
    reportData.whatsappOrders.readyOrders = whatsappStats.ready || 0;
    reportData.whatsappOrders.deliveredOrders = whatsappStats.delivered || 0;
    reportData.whatsappOrders.cancelledOrders = whatsappStats.cancelled || 0;
    reportData.whatsappOrders.totalRevenue = whatsappStats.totalRevenue || 0;

    // Fetch all WhatsApp orders
    const whatsappOrdersList = await apiCall('/whatsapp/orders');

    reportData.whatsappOrders.orders = (whatsappOrdersList || []).map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      itemCount: order.items?.length || 0,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));

    // Render charts after data is loaded (only for overview)
    if (selectedReport.value === 'overview') {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        renderCharts();
      }, 100);
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
    swalAlert.value?.showError('Failed to fetch reports', error.message || 'An error occurred while loading the report data')
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  // Only render charts if we're on the overview report
  if (selectedReport.value !== 'overview') {
    return;
  }

  // Destroy existing charts
  if (salesChartInstance) {
    salesChartInstance.destroy();
    salesChartInstance = null;
  }
  if (productsChartInstance) {
    productsChartInstance.destroy();
    productsChartInstance = null;
  }

  // Check if chart elements exist in the DOM
  if (!salesChart.value || !productsChart.value) {
    return;
  }

  // Render Sales Trend Chart
  if (reportData.salesTrend.length > 0) {
    try {
      const ctx = salesChart.value.getContext('2d');
      salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: reportData.salesTrend.map(item => item.date),
          datasets: [{
            label: 'Sales (TZS)',
            data: reportData.salesTrend.map(item => item.amount),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'TZS ' + context.parsed.y.toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'TZS ' + value.toLocaleString();
              }
            }
          }
        }
      }
      });
    } catch (error) {
      console.error('Error rendering sales trend chart:', error);
    }
  }

  // Render Top Products Chart
  if (reportData.topProducts.length > 0) {
    try {
      const ctx = productsChart.value.getContext('2d');
      productsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: reportData.topProducts.map(item => item.name),
          datasets: [{
            label: 'Revenue (TZS)',
            data: reportData.topProducts.map(item => item.revenue),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ],
            borderColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const product = reportData.topProducts[context.dataIndex];
                  return [
                    'Revenue: TZS ' + context.parsed.y.toLocaleString(),
                    'Quantity: ' + product.quantity.toLocaleString()
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return 'TZS ' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error rendering top products chart:', error);
    }
  }
}

const apiCall = async (url, options = {}) => {
  try {
    const token = userStore.getToken
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add Authorization header if token exists
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

const updateReport = () => {
  fetchReports()
}

const handleDateRangeChange = () => {
  if (selectedDateRange.value === 'custom') {
    // Set default dates if custom is selected
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    customDateTo.value = today.toISOString().split('T')[0];
    customDateFrom.value = lastWeek.toISOString().split('T')[0];
  }
  fetchReports();
}

const exportReport = () => {
  // Implementation for PDF export
  alert('Exporting report as PDF...')
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    loading.value = true
    await apiCall(`/whatsapp/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })

    swalAlert.value?.showSuccess('Status Updated', `Order #${orderId} status changed to ${newStatus}`)

    // Refresh orders data
    await fetchReports()
  } catch (error) {
    console.error('Error updating order status:', error)
    swalAlert.value?.showError('Update Failed', error.message || 'Failed to update order status')
    loading.value = false
  }
}

const cancelOrder = async (orderId) => {
  try {
    // Confirm cancellation
    const confirmed = confirm(`Are you sure you want to cancel order #${orderId}? This will restore inventory stock.`)
    if (!confirmed) return

    loading.value = true
    await apiCall(`/whatsapp/orders/${orderId}/cancel`, {
      method: 'PUT'
    })

    swalAlert.value?.showSuccess('Order Cancelled', `Order #${orderId} has been cancelled and inventory restored`)

    // Refresh orders data
    await fetchReports()
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

const getStockStatus = (item) => {
  // Use API-provided status if available, otherwise calculate
  if (item.status) return item.status
  if (item.currentStock === 0) return 'Out of Stock'
  if (item.currentStock < item.minStock) return 'Low Stock'
  return 'In Stock'
}

const formatCategory = (category) => {
  // Format category name: "office_supplies" -> "Office Supplies"
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Lifecycle
onMounted(() => {
  fetchReports()
})

// Watchers
watch(selectedReport, () => {
  // Re-render charts when switching to overview report
  if (selectedReport.value === 'overview') {
    setTimeout(() => {
      renderCharts()
    }, 100)
  }
})
</script>

<style scoped>
.reports-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0 0 24px 0;
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-group select,
.date-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.date-input {
  min-width: 150px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background: #2563eb;
}

.icon {
  width: 16px;
  height: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.report-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.trend {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.trend.positive {
  color: #065f46;
  background: #d1fae5;
}

.trend.negative {
  color: #991b1b;
  background: #fee2e2;
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-container {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  overflow: hidden;
  position: relative;
}

.chart-container h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.chart {
  width: 100% !important;
  height: 300px !important;
  max-width: 100%;
  max-height: 300px;
  background: #f9fafb;
  border-radius: 8px;
  display: block;
}

.report-metrics {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.metric-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 150px;
}

.metric-box label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.metric-value.positive {
  color: #059669;
}

.data-table-container {
  margin-top: 24px;
}

.data-table-container h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.data-table tr:hover {
  background: #f9fafb;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.completed {
  background: #d1fae5;
  color: #065f46;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.shipped {
  background: #dbeafe;
  color: #1d4ed8;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.in.stock {
  background: #d1fae5;
  color: #065f46;
}

.status.low.stock {
  background: #fef3c7;
  color: #92400e;
}

.status.out.of.stock {
  background: #fee2e2;
  color: #991b1b;
}

.inventory-alerts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.alert-box {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid;
}

.alert-box.low-stock {
  background: #fef3c7;
  border-color: #f59e0b;
}

.alert-box.out-of-stock {
  background: #fee2e2;
  border-color: #ef4444;
}

.alert-box h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.alert-count {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.alert-box ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.alert-box li {
  font-size: 14px;
  margin-bottom: 4px;
}

.customer-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.insight-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
}

.insight-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.insight-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.insight-period {
  font-size: 12px;
  color: #6b7280;
}

.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.financial-card {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.financial-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.amount {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.amount.positive {
  color: #059669;
}

.amount.negative {
  color: #dc2626;
}

.change {
  font-size: 12px;
  color: #6b7280;
}

.expense-breakdown {
  margin-top: 32px;
}

.expense-breakdown h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expense-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expense-info {
  display: flex;
  justify-content: space-between;
  min-width: 200px;
}

.expense-category {
  font-weight: 500;
  color: #374151;
}

.expense-amount {
  font-weight: 600;
  color: #1e293b;
}

.expense-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.expense-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.expense-percentage {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

@media (max-width: 768px) {
  .reports-container {
    padding: 16px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .summary-grid,
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .report-metrics {
    flex-direction: column;
  }

  .expense-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .expense-info {
    min-width: auto;
  }
}

/* Utility classes */
.text-center {
  text-align: center;
}

.font-medium {
  font-weight: 500;
  color: #374151;
}

/* WhatsApp Orders Styles */
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
