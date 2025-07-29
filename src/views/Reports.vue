<template>
  <div class="reports-container">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Business Reports</h1>
      <p class="page-subtitle">Detailed analytics and insights for your business</p>

      <!-- Filter Controls -->
      <div class="filter-section">
        <div class="filter-group">
          <label>Date Range:</label>
          <select v-model="selectedDateRange" @change="fetchReports">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Report Type:</label>
          <select v-model="selectedReport" @change="updateReport">
            <option value="overview">Overview</option>
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="customers">Customer Report</option>
            <option value="financial">Financial Report</option>
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
              <div class="trend positive">+12.5%</div>
            </div>
            <div class="card-value">TZS{{ formatNumber(reportData.totalRevenue) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Total Orders</h3>
              <div class="trend positive">+8.3%</div>
            </div>
            <div class="card-value">{{ formatNumber(reportData.totalOrders) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Active Customers</h3>
              <div class="trend positive">+15.2%</div>
            </div>
            <div class="card-value">{{ formatNumber(reportData.activeCustomers) }}</div>
            <div class="card-period">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Avg Order Value</h3>
              <div class="trend negative">-2.1%</div>
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

        <div class="data-table-container">
          <h3>Inventory Summary</h3>
          <table class="data-table">
            <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Value</th>
              <th>Warehouse</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in reportData.inventoryItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.currentStock }}</td>
              <td>{{ item.minStock }}</td>
              <td>TZS{{ formatNumber(item.value) }}</td>
              <td>{{ item.warehouse }}</td>
              <td>
                  <span :class="['status', getStockStatus(item).toLowerCase()]">
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

        <div class="customer-insights">
          <div class="insight-card">
            <h3>New Customers</h3>
            <div class="insight-value">{{ reportData.customerMetrics.newCustomers }}</div>
            <div class="insight-period">This period</div>
          </div>

          <div class="insight-card">
            <h3>Returning Customers</h3>
            <div class="insight-value">{{ reportData.customerMetrics.returningCustomers }}</div>
            <div class="insight-period">{{ reportData.customerMetrics.returnRate }}% return rate</div>
          </div>

          <div class="insight-card">
            <h3>Customer Lifetime Value</h3>
            <div class="insight-value">TZS{{ formatNumber(reportData.customerMetrics.avgLifetimeValue) }}</div>
            <div class="insight-period">Average</div>
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
            <div class="change">+{{ reportData.financial.revenueGrowth }}% vs last period</div>
          </div>

          <div class="financial-card expenses">
            <h3>Total Expenses</h3>
            <div class="amount negative">TZS{{ formatNumber(reportData.financial.expenses) }}</div>
            <div class="change">+{{ reportData.financial.expenseGrowth }}% vs last period</div>
          </div>

          <div class="financial-card profit">
            <h3>Net Profit</h3>
            <div class="amount positive">TZS{{ formatNumber(reportData.financial.profit) }}</div>
            <div class="change">+{{ reportData.financial.profitGrowth }}% vs last period</div>
          </div>

          <div class="financial-card margin">
            <h3>Profit Margin</h3>
            <div class="amount">{{ reportData.financial.profitMargin }}%</div>
            <div class="change">+{{ reportData.financial.marginGrowth }}% vs last period</div>
          </div>
        </div>

        <div class="expense-breakdown">
          <h3>Expense Breakdown</h3>
          <div class="expense-list">
            <div v-for="expense in reportData.expenseBreakdown" :key="expense.category" class="expense-item">
              <div class="expense-info">
                <span class="expense-category">{{ expense.category }}</span>
                <span class="expense-amount">TZS{{ formatNumber(expense.amount) }}</span>
              </div>
              <div class="expense-bar">
                <div class="expense-fill" :style="{ width: expense.percentage + '%' }"></div>
              </div>
              <span class="expense-percentage">{{ expense.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Configs } from '@/utils/Configs'

// Reactive data
const loading = ref(true)
const selectedDateRange = ref('30')
const selectedReport = ref('overview')

const reportData = reactive({
  totalRevenue: 125000,
  totalOrders: 1250,
  activeCustomers: 320,
  avgOrderValue: 100,
  salesMetrics: {
    total: 0,
    units: 0,
    growth: 0
  },
  recentSales: [
  ],
  lowStockItems: [
    { id: 1, name: 'Product X', stock: 5, minStock: 20 },
    { id: 2, name: 'Product Y', stock: 8, minStock: 25 },
    { id: 3, name: 'Product Z', stock: 12, minStock: 30 }
  ],
  outOfStockItems: [
    { id: 1, name: 'Product M' },
    { id: 2, name: 'Product N' }
  ],
  inventoryItems: [
    { id: 1, name: 'Product A', currentStock: 150, minStock: 50, value: 15000, warehouse: 'Main Warehouse' },
    { id: 2, name: 'Product B', currentStock: 25, minStock: 30, value: 8500, warehouse: 'Secondary Warehouse' },
    { id: 3, name: 'Product C', currentStock: 200, minStock: 100, value: 25000, warehouse: 'Main Warehouse' },
    { id: 4, name: 'Product D', currentStock: 0, minStock: 20, value: 0, warehouse: 'Main Warehouse' }
  ],
  customerMetrics: {
    newCustomers: 45,
    returningCustomers: 275,
    returnRate: 85,
    avgLifetimeValue: 2500
  },
  topCustomers: [
    { id: 1, name: 'John Doe', phone: '+1234567890', totalOrders: 25, totalSpent: 15000, lastOrder: '2025-01-20', status: 'Active' },
    { id: 2, name: 'Jane Smith', phone: '+1234567891', totalOrders: 18, totalSpent: 12000, lastOrder: '2025-01-18', status: 'Active' },
    { id: 3, name: 'Bob Johnson', phone: '+1234567892', totalOrders: 22, totalSpent: 18500, lastOrder: '2025-01-15', status: 'Active' }
  ],
  financial: {
    revenue: 0,
    expenses: 0,
    profit: 0,
    profitMargin: 0,
    revenueGrowth: 12.5,
    expenseGrowth: 8.2,
    profitGrowth: 18.5,
    marginGrowth: 2.3
  },
  expenseBreakdown: [
    { category: 'Inventory Purchase', amount: 45000, percentage: 53 },
    { category: 'Staff Salaries', amount: 20000, percentage: 24 },
    { category: 'Rent & Utilities', amount: 8000, percentage: 9 },
    { category: 'Marketing', amount: 7000, percentage: 8 },
    { category: 'Other Expenses', amount: 5000, percentage: 6 }
  ]
})

// Methods

const API_BASE_URL = Configs.API_BASE_URL
const fetchReports = async () => {
  loading.value = true
  try {
    // API calls would go here
    // const response = await fetch(`/api/reports?days=${selectedDateRange.value}`)
    // const data = await response.json()
    // Object.assign(reportData, data)

    const salesMetrics = await apiCall('/sales/sales-metrics', {
      method: 'POST',
      body: JSON.stringify({"days": selectedDateRange.value})
    });

    reportData.salesMetrics = await salesMetrics;



    const sales  = await  apiCall('/sales/sales-by-days', {
      method: 'POST',
      body: JSON.stringify({"days": selectedDateRange.value})
    });



    console.log("sales:", sales);

    reportData.recentSales = sales.map(sale => ({
      id: sale.id,
      date: sale.createdAt,
      customer: sale.customer.name,
      product: sale.item.name,
      quantity: sale.quantity,
      amount: sale.amountPaid,
      status: "Completed"
    }));



    const financeReports = await apiCall('/expenses/sales-expense-breakdown', {
      method: 'POST',
      body: JSON.stringify({"days": selectedDateRange.value})
    });


    reportData.financial.revenue = financeReports.totalRevenue;
    reportData.financial.expenses = financeReports.totalExpense;
    reportData.financial.profit = financeReports.grossProfit;
    reportData.financial.profitMargin = Number(financeReports.profitMargin.toFixed(2));


    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error fetching reports:', error)
  } finally {
    loading.value = false
  }
}


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

const updateReport = () => {
  fetchReports()
}

const exportReport = () => {
  // Implementation for PDF export
  alert('Exporting report as PDF...')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStockStatus = (item) => {
  if (item.currentStock === 0) return 'Out of Stock'
  if (item.currentStock < item.minStock) return 'Low Stock'
  return 'In Stock'
}

// Lifecycle
onMounted(() => {
  fetchReports()
})

// Watchers
watch(selectedDateRange, () => {
  fetchReports()
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

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
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
}

.chart-container h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.chart {
  width: 100%;
  height: 300px;
  background: #f9fafb;
  border-radius: 8px;
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
</style>
