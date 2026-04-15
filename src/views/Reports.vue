<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-neutral-50 p-6">
    <!-- Page Header -->
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 mb-6">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">Business Reports</h1>
      <p class="text-neutral-500 mt-2 mb-6">Detailed analytics and insights for your business</p>

      <!-- Filter Controls -->
      <div class="flex gap-4 items-center flex-wrap">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-neutral-700">Date Range:</label>
          <select v-model="selectedDateRange" @change="handleDateRangeChange" class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div v-if="selectedDateRange === 'custom'" class="flex flex-col gap-1">
          <label class="text-sm font-medium text-neutral-700">From Date:</label>
          <input
            type="date"
            v-model="customDateFrom"
            @change="fetchReports"
            class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white min-w-[150px]"
          />
        </div>
        <div v-if="selectedDateRange === 'custom'" class="flex flex-col gap-1">
          <label class="text-sm font-medium text-neutral-700">To Date:</label>
          <input
            type="date"
            v-model="customDateTo"
            @change="fetchReports"
            class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white min-w-[150px]"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-neutral-700">Report Type:</label>
          <select v-model="selectedReport" @change="updateReport" class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
            <option value="overview">Overview</option>
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="customers">Customer Report</option>
            <option value="retention">Customer Retention</option>
            <option value="shelf-time">Shelf Time / Aging</option>
            <option value="financial">Financial Report</option>
            <option value="whatsapp">WhatsApp Orders</option>
            <option value="ad-performance">Ad Performance</option>
            <option value="balance-sheet">Balance Sheet</option>
            <option value="catalogue">Product Catalogue</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-neutral-700">Brand:</label>
          <select v-model="selectedBrand" class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
            <option value="">All Brands</option>
            <option v-for="brand in availableBrands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
          </select>
        </div>
        <button @click="exportReport" class="btn-primary flex items-center text-sm gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
      <div class="w-10 h-10 border-4 border-neutral-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
      <p class="text-neutral-500">Loading reports...</p>
    </div>

    <!-- Reports Content -->
    <div v-else class="flex flex-col gap-6">

      <!-- Overview Report -->
      <div v-if="selectedReport === 'overview'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Business Overview</h2>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Revenue</h3>
              <div :class="[reportData.revenueGrowth >= 0 ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800' : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800']">
                {{ reportData.revenueGrowth >= 0 ? '+' : '' }}{{ reportData.revenueGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">TZS{{ formatNumber(reportData.totalRevenue) }}</div>
            <div class="text-xs text-neutral-400">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Orders</h3>
              <div :class="[reportData.ordersGrowth >= 0 ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800' : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800']">
                {{ reportData.ordersGrowth >= 0 ? '+' : '' }}{{ reportData.ordersGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.totalOrders) }}</div>
            <div class="text-xs text-neutral-400">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Active Customers</h3>
              <div :class="[reportData.customersGrowth >= 0 ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800' : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800']">
                {{ reportData.customersGrowth >= 0 ? '+' : '' }}{{ reportData.customersGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.activeCustomers) }}</div>
            <div class="text-xs text-neutral-400">Last {{ selectedDateRange }} days</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Avg Order Value</h3>
              <div :class="[reportData.avgOrderGrowth >= 0 ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800' : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800']">
                {{ reportData.avgOrderGrowth >= 0 ? '+' : '' }}{{ reportData.avgOrderGrowth.toFixed(1) }}%
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">TZS{{ formatNumber(reportData.avgOrderValue) }}</div>
            <div class="text-xs text-neutral-400">Last {{ selectedDateRange }} days</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="border border-neutral-100 rounded-2xl p-5 bg-white/50">
            <h3 class="text-base font-semibold text-neutral-700 mb-4">Sales Trend</h3>
            <canvas ref="salesChart" class="!w-full !h-[300px] max-w-full max-h-[300px] bg-neutral-50 rounded-lg block"></canvas>
          </div>

          <div class="border border-neutral-100 rounded-2xl p-5 bg-white/50">
            <h3 class="text-base font-semibold text-neutral-700 mb-4">Top Products</h3>
            <canvas ref="productsChart" class="!w-full !h-[300px] max-w-full max-h-[300px] bg-neutral-50 rounded-lg block"></canvas>
          </div>
        </div>
      </div>

      <!-- Sales Report -->
      <div v-if="selectedReport === 'sales'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Sales Report</h2>

        <div class="flex gap-6 mb-8 flex-wrap">
          <div class="flex flex-col gap-1 p-4 border border-neutral-100 rounded-2xl bg-white/50 min-w-[150px]">
            <label class="text-sm text-neutral-500 font-medium">Total Sales:</label>
            <span class="text-xl font-bold text-neutral-900">TZS{{ formatNumber(reportData.salesMetrics.total) }}</span>
          </div>
          <div class="flex flex-col gap-1 p-4 border border-neutral-100 rounded-2xl bg-white/50 min-w-[150px]">
            <label class="text-sm text-neutral-500 font-medium">Units Sold:</label>
            <span class="text-xl font-bold text-neutral-900">{{ formatNumber(reportData.salesMetrics.units) }}</span>
          </div>
          <div class="flex flex-col gap-1 p-4 border border-neutral-100 rounded-2xl bg-white/50 min-w-[150px]">
            <label class="text-sm text-neutral-500 font-medium">Growth Rate:</label>
            <span class="text-xl font-bold text-emerald-600">+{{ reportData.salesMetrics.growth }}%</span>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Recent Sales</h3>
          <table class="w-full border-collapse">
            <thead>
            <tr>
              <th class="table-header">Date</th>
              <th class="table-header">Customer</th>
              <th class="table-header">Product</th>
              <th class="table-header">Quantity</th>
              <th class="table-header">Amount</th>
              <th class="table-header">Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="sale in reportData.recentSales" :key="sale.id" class="table-row">
              <td class="table-cell">{{ formatDate(sale.date) }}</td>
              <td class="table-cell">{{ sale.customer }}</td>
              <td class="table-cell">{{ sale.product }}</td>
              <td class="table-cell">{{ sale.quantity }}</td>
              <td class="table-cell">TZS{{ formatNumber(sale.amount) }}</td>
              <td class="table-cell">
                  <span :class="[
                    'badge',
                    sale.status.toLowerCase() === 'completed' ? 'badge-success' :
                    sale.status.toLowerCase() === 'pending' ? 'badge-warning' :
                    sale.status.toLowerCase() === 'shipped' ? 'badge-primary' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ sale.status }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inventory Report -->
      <div v-if="selectedReport === 'inventory'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Inventory Report</h2>

        <!-- Inventory Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Items</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.inventory.totalItems) }}</div>
            <div class="text-xs text-neutral-400">In inventory</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Stock Value</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">TZS{{ formatNumber(reportData.inventory.totalStockValue) }}</div>
            <div class="text-xs text-neutral-400">Current valuation</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Low Stock Items</h3>
            </div>
            <div class="text-2xl font-bold text-amber-500 mb-1">{{ reportData.inventory.lowStockCount }}</div>
            <div class="text-xs text-neutral-400">Need reorder</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Out of Stock</h3>
            </div>
            <div class="text-2xl font-bold text-red-500 mb-1">{{ reportData.inventory.outOfStockCount }}</div>
            <div class="text-xs text-neutral-400">Urgent attention</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-orange-200 bg-orange-50">
            <h3 class="text-base font-semibold mb-3">Low Stock Items</h3>
            <div class="text-2xl font-bold mb-3">{{ reportData.lowStockItems.length }}</div>
            <ul class="list-none m-0 p-0">
              <li v-for="item in reportData.lowStockItems.slice(0, 5)" :key="item.id" class="text-sm mb-1">
                {{ item.name }} - {{ item.stock }} units left
              </li>
            </ul>
          </div>

          <div class="p-5 rounded-2xl border border-red-200 bg-red-50">
            <h3 class="text-base font-semibold mb-3">Out of Stock</h3>
            <div class="text-2xl font-bold mb-3">{{ reportData.outOfStockItems.length }}</div>
            <ul class="list-none m-0 p-0">
              <li v-for="item in reportData.outOfStockItems.slice(0, 5)" :key="item.id" class="text-sm mb-1">
                {{ item.name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Items by Category -->
        <div v-if="reportData.inventory.itemsByCategory.length > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Items by Category</h3>
          <table class="w-full border-collapse">
            <thead>
            <tr>
              <th class="table-header">Category</th>
              <th class="table-header">Item Count</th>
              <th class="table-header">Total Value</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="category in reportData.inventory.itemsByCategory" :key="category.category" class="table-row">
              <td class="table-cell">{{ category.category }}</td>
              <td class="table-cell">{{ formatNumber(category.count) }}</td>
              <td class="table-cell">TZS{{ formatNumber(category.value) }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-8">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Inventory Summary</h3>
          <table class="w-full border-collapse">
            <thead>
            <tr>
              <th class="table-header">Product Code</th>
              <th class="table-header">Product Name</th>
              <th class="table-header">Category</th>
              <th class="table-header">Current Stock</th>
              <th class="table-header">Min Stock</th>
              <th class="table-header">Value</th>
              <th class="table-header">Warehouse</th>
              <th class="table-header">Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in filteredInventoryItems" :key="item.id" class="table-row">
              <td class="table-cell"><span class="font-medium text-neutral-700">{{ item.productCode }}</span></td>
              <td class="table-cell">{{ item.name }}</td>
              <td class="table-cell">{{ item.category || 'N/A' }}</td>
              <td class="table-cell text-center">{{ formatNumber(item.currentStock) }}</td>
              <td class="table-cell text-center">{{ formatNumber(item.minStock) }}</td>
              <td class="table-cell">TZS{{ formatNumber(item.value) }}</td>
              <td class="table-cell">{{ item.warehouse }}</td>
              <td class="table-cell">
                  <span :class="[
                    'badge',
                    getStockStatus(item) === 'In Stock' ? 'badge-success' :
                    getStockStatus(item) === 'Low Stock' ? 'badge-warning' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ getStockStatus(item) }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Report -->
      <div v-if="selectedReport === 'customers'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Customer Report</h2>

        <!-- Customer Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Customers</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.customerMetrics.totalCustomers || 0) }}</div>
            <div class="text-xs text-neutral-400">All time</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Active Customers</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.customerMetrics.activeCustomers || 0) }}</div>
            <div class="text-xs text-neutral-400">This period</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">New Customers</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.customerMetrics.newCustomers) }}</div>
            <div class="text-xs text-neutral-400">This period</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Return Rate</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ reportData.customerMetrics.returnRate.toFixed(1) }}%</div>
            <div class="text-xs text-neutral-400">Returning customers</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="p-5 border border-neutral-100 rounded-2xl text-center bg-white/50 hover:shadow-soft transition-all duration-300">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Returning Customers</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ reportData.customerMetrics.returningCustomers }}</div>
            <div class="text-xs text-neutral-400">{{ reportData.customerMetrics.returnRate.toFixed(1) }}% return rate</div>
          </div>

          <div class="p-5 border border-neutral-100 rounded-2xl text-center bg-white/50 hover:shadow-soft transition-all duration-300">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Customer Lifetime Value</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">TZS{{ formatNumber(reportData.customerMetrics.avgLifetimeValue) }}</div>
            <div class="text-xs text-neutral-400">Average per customer</div>
          </div>

          <div class="p-5 border border-neutral-100 rounded-2xl text-center bg-white/50 hover:shadow-soft transition-all duration-300">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Customer Growth</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ reportData.customerMetrics.newCustomers }}</div>
            <div class="text-xs text-neutral-400">New this period</div>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Top Customers</h3>
          <table class="w-full border-collapse">
            <thead>
            <tr>
              <th class="table-header">Customer</th>
              <th class="table-header">Phone</th>
              <th class="table-header">Total Orders</th>
              <th class="table-header">Total Spent</th>
              <th class="table-header">Last Order</th>
              <th class="table-header">Status</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="customer in reportData.topCustomers" :key="customer.id" class="table-row">
              <td class="table-cell">{{ customer.name }}</td>
              <td class="table-cell">{{ customer.phone }}</td>
              <td class="table-cell">{{ customer.totalOrders }}</td>
              <td class="table-cell">TZS{{ formatNumber(customer.totalSpent) }}</td>
              <td class="table-cell">{{ formatDate(customer.lastOrder) }}</td>
              <td class="table-cell">
                  <span :class="[
                    'badge',
                    customer.status.toLowerCase() === 'active' ? 'badge-success' :
                    customer.status.toLowerCase() === 'inactive' ? 'badge-warning' :
                    'badge-primary'
                  ]">
                    {{ customer.status }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Shelf Time / Aging Report -->
      <div v-if="selectedReport === 'shelf-time'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Shelf Time & Aging Stock</h2>

        <!-- KPI cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Avg Days to First Sale</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ reportData.shelfTime.overallAvgDays }} days</div>
            <div class="text-xs text-neutral-400">Across {{ reportData.shelfTime.totalItemsSold }} sold items</div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Median Days</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ reportData.shelfTime.medianDays }} days</div>
            <div class="text-xs text-neutral-400">Half sell faster, half slower</div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Fastest Sale</h3>
            <div class="text-2xl font-bold text-emerald-600 mb-1">{{ reportData.shelfTime.fastestDays }} days</div>
            <div class="text-xs text-neutral-400">Best performer</div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Slowest Sale</h3>
            <div class="text-2xl font-bold text-red-600 mb-1">{{ reportData.shelfTime.slowestDays }} days</div>
            <div class="text-xs text-neutral-400">Worst eventually-sold</div>
          </div>
        </div>

        <!-- By Brand -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Average Shelf Time by Brand</h3>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="table-header">Brand</th>
                <th class="table-header">Items Sold</th>
                <th class="table-header">Avg Days on Shelf</th>
                <th class="table-header">Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in reportData.shelfTime.byBrand" :key="b.brand" class="table-row">
                <td class="table-cell font-medium">{{ b.brand }}</td>
                <td class="table-cell">{{ b.itemsSold }}</td>
                <td class="table-cell">{{ b.avgDays }}</td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    b.avgDays <= 30 ? 'badge-success' :
                    b.avgDays <= 60 ? 'badge-warning' : 'badge-danger'
                  ]">
                    {{ b.avgDays <= 30 ? 'Fast' : b.avgDays <= 60 ? 'Steady' : 'Slow' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Fastest + Slowest two-column -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-lg font-semibold text-neutral-700 mb-4">🚀 Fastest Movers</h3>
            <table class="w-full">
              <tbody>
                <tr v-for="m in reportData.shelfTime.fastestMovers" :key="m.code" class="border-b border-neutral-100">
                  <td class="py-2 text-sm font-medium text-neutral-600">{{ m.code }}</td>
                  <td class="py-2 text-sm text-neutral-900">{{ m.name }}</td>
                  <td class="py-2 text-sm text-emerald-600 font-bold text-right">{{ m.daysOnShelf }}d</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-lg font-semibold text-neutral-700 mb-4">🐌 Slowest (eventually sold)</h3>
            <table class="w-full">
              <tbody>
                <tr v-for="m in reportData.shelfTime.slowestMovers" :key="m.code" class="border-b border-neutral-100">
                  <td class="py-2 text-sm font-medium text-neutral-600">{{ m.code }}</td>
                  <td class="py-2 text-sm text-neutral-900">{{ m.name }}</td>
                  <td class="py-2 text-sm text-red-600 font-bold text-right">{{ m.daysOnShelf }}d</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Currently Aging Watchlist -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-neutral-700 mb-2">⚠️ Currently Aging Stock (no sale yet)</h3>
          <p class="text-sm text-neutral-500 mb-4">Items in stock that haven't sold their first unit. Sorted by oldest first.</p>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="table-header">Code</th>
                <th class="table-header">Item</th>
                <th class="table-header">Days on Shelf</th>
                <th class="table-header">On Hand</th>
                <th class="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in reportData.shelfTime.currentlyAging" :key="a.code" class="table-row">
                <td class="table-cell font-medium">{{ a.code }}</td>
                <td class="table-cell">{{ a.name }}</td>
                <td class="table-cell">{{ a.daysSinceArrival }}</td>
                <td class="table-cell">{{ a.onHand }}</td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    a.status === 'fresh' ? 'badge-success' :
                    a.status === 'normal' ? 'badge-primary' :
                    a.status === 'aging' ? 'badge-warning' : 'badge-danger'
                  ]">{{ a.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Retention Report -->
      <div v-if="selectedReport === 'retention'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Customer Retention (Lifetime)</h2>

        <!-- KPI cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Total Customers</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.retention.totalCustomersWithOrders) }}</div>
            <div class="text-xs text-neutral-400">With at least 1 order</div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Repeat Purchase Rate</h3>
            <div class="text-2xl font-bold text-emerald-600 mb-1">{{ reportData.retention.repeatPurchaseRate }}%</div>
            <div class="text-xs text-neutral-400">{{ reportData.retention.repeatCustomers }} repeat / {{ reportData.retention.oneTimeCustomers }} one-time</div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Avg Lifetime Value</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-1">TZS{{ formatNumber(reportData.retention.averageLifetimeValue) }}</div>
            <div class="text-xs text-neutral-400">Per customer</div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Avg Orders / Customer</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ reportData.retention.averageOrdersPerCustomer }}</div>
            <div class="text-xs text-neutral-400">Lifetime</div>
          </div>
        </div>

        <!-- Segments + Churn buckets -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-lg font-semibold text-neutral-700 mb-4">Loyalty Segments</h3>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">One-time (1 order)</span>
                <span class="font-bold text-neutral-900">{{ reportData.retention.segments.oneTime }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">Occasional (2–4 orders)</span>
                <span class="font-bold text-amber-600">{{ reportData.retention.segments.occasional }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">Loyal (5+ orders)</span>
                <span class="font-bold text-emerald-600">{{ reportData.retention.segments.loyal }}</span>
              </div>
            </div>
          </div>
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-lg font-semibold text-neutral-700 mb-4">Churn Status</h3>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">Active (≤30 days)</span>
                <span class="font-bold text-emerald-600">{{ reportData.retention.churnBuckets.active }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">At Risk (31–60 days)</span>
                <span class="font-bold text-amber-600">{{ reportData.retention.churnBuckets.atRisk }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">Dormant (61–90 days)</span>
                <span class="font-bold text-orange-600">{{ reportData.retention.churnBuckets.dormant }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-600">Lost (&gt;90 days)</span>
                <span class="font-bold text-red-600">{{ reportData.retention.churnBuckets.lost }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer table -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Customers</h3>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="table-header">Customer</th>
                <th class="table-header">Phone</th>
                <th class="table-header">Orders</th>
                <th class="table-header">Total Spent</th>
                <th class="table-header">Last Order</th>
                <th class="table-header">Days Since</th>
                <th class="table-header">Segment</th>
                <th class="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in reportData.retention.customers" :key="c.id" class="table-row">
                <td class="table-cell">{{ c.name }}</td>
                <td class="table-cell">{{ c.phone }}</td>
                <td class="table-cell">{{ c.totalOrders }}</td>
                <td class="table-cell">TZS{{ formatNumber(c.totalSpent) }}</td>
                <td class="table-cell">{{ formatDate(c.lastOrder) }}</td>
                <td class="table-cell">{{ c.daysSinceLastOrder }}</td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    c.segment === 'loyal' ? 'badge-success' :
                    c.segment === 'occasional' ? 'badge-warning' : 'badge-primary'
                  ]">{{ c.segment.replace('_',' ') }}</span>
                </td>
                <td class="table-cell">
                  <span :class="[
                    'badge',
                    c.bucket === 'active' ? 'badge-success' :
                    c.bucket === 'at_risk' ? 'badge-warning' :
                    c.bucket === 'dormant' ? 'badge-warning' : 'badge-danger'
                  ]">{{ c.bucket.replace('_',' ') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Financial Report -->
      <div v-if="selectedReport === 'financial'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Financial Report</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Total Revenue</h3>
            <div class="text-2xl font-bold text-emerald-600 mb-2">TZS{{ formatNumber(reportData.financial.revenue) }}</div>
            <div :class="['text-xs', reportData.financial.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600']">
              {{ reportData.financial.revenueGrowth >= 0 ? '+' : '' }}{{ reportData.financial.revenueGrowth.toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Total Expenses</h3>
            <div class="text-2xl font-bold text-red-600 mb-2">TZS{{ formatNumber(reportData.financial.expenses) }}</div>
            <div :class="['text-xs', reportData.financial.expenseGrowth >= 0 ? 'text-red-600' : 'text-emerald-600']">
              {{ reportData.financial.expenseGrowth >= 0 ? '+' : '' }}{{ reportData.financial.expenseGrowth.toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Net Profit</h3>
            <div class="text-2xl font-bold text-emerald-600 mb-2">TZS{{ formatNumber(reportData.financial.profit) }}</div>
            <div :class="['text-xs', reportData.financial.profitGrowth >= 0 ? 'text-emerald-600' : 'text-red-600']">
              {{ reportData.financial.profitGrowth >= 0 ? '+' : '' }}{{ reportData.financial.profitGrowth.toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Profit Margin</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ reportData.financial.profitMargin.toFixed(1) }}%</div>
            <div :class="['text-xs', reportData.financial.marginGrowth >= 0 ? 'text-emerald-600' : 'text-red-600']">
              {{ reportData.financial.marginGrowth >= 0 ? '+' : '' }}{{ reportData.financial.marginGrowth.toFixed(1) }}% vs last period
            </div>
          </div>
        </div>

        <div class="mt-8">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Expense Breakdown</h3>
          <div class="flex flex-col gap-3">
            <div v-for="expense in reportData.expenseBreakdown" :key="expense.category" class="flex items-center gap-3">
              <div class="flex justify-between min-w-[200px]">
                <span class="font-medium text-neutral-700">{{ formatCategory(expense.category) }}</span>
                <span class="font-semibold text-neutral-900">TZS{{ formatNumber(expense.amount) }}</span>
              </div>
              <div class="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300" :style="{ width: expense.percentage + '%' }"></div>
              </div>
              <span class="text-sm font-medium text-neutral-500 min-w-[40px] text-right">{{ expense.percentage.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Orders Report -->
      <div v-if="selectedReport === 'whatsapp'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">WhatsApp Orders</h2>

        <!-- Order Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Orders</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">{{ formatNumber(reportData.whatsappOrders.totalOrders) }}</div>
            <div class="text-xs text-neutral-400">All orders</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Pending</h3>
            </div>
            <div class="text-2xl font-bold text-amber-500 mb-1">{{ formatNumber(reportData.whatsappOrders.pendingOrders) }}</div>
            <div class="text-xs text-neutral-400">Awaiting confirmation</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Delivered</h3>
            </div>
            <div class="text-2xl font-bold text-emerald-500 mb-1">{{ formatNumber(reportData.whatsappOrders.deliveredOrders) }}</div>
            <div class="text-xs text-neutral-400">Successfully completed</div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-neutral-500">Total Revenue</h3>
            </div>
            <div class="text-2xl font-bold text-neutral-900 mb-1">TZS{{ formatNumber(reportData.whatsappOrders.totalRevenue) }}</div>
            <div class="text-xs text-neutral-400">From completed orders</div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="bg-white/50 p-6 rounded-2xl border border-neutral-100 mb-8">
          <h3 class="text-lg font-semibold text-neutral-900 mb-5">Orders by Status</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Pending</span>
              <span class="text-2xl font-bold text-neutral-900">{{ reportData.whatsappOrders.pendingOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Confirmed</span>
              <span class="text-2xl font-bold text-neutral-900">{{ reportData.whatsappOrders.confirmedOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Processing</span>
              <span class="text-2xl font-bold text-neutral-900">{{ reportData.whatsappOrders.processingOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Ready</span>
              <span class="text-2xl font-bold text-neutral-900">{{ reportData.whatsappOrders.readyOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Delivered</span>
              <span class="text-2xl font-bold text-neutral-900">{{ reportData.whatsappOrders.deliveredOrders }}</span>
            </div>
            <div class="flex flex-col items-center p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span class="text-sm text-neutral-500 mb-2">Cancelled</span>
              <span class="text-2xl font-bold text-neutral-900">{{ reportData.whatsappOrders.cancelledOrders }}</span>
            </div>
          </div>
        </div>

        <!-- Orders List -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">All Orders</h3>
          <table class="w-full border-collapse">
            <thead>
            <tr>
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
            <tbody>
            <tr v-for="order in reportData.whatsappOrders.orders" :key="order.id" class="table-row">
              <td class="table-cell"><span class="font-medium text-neutral-700">#{{ order.id }}</span></td>
              <td class="table-cell">{{ order.customerName }}</td>
              <td class="table-cell">{{ order.customerPhone }}</td>
              <td class="table-cell">{{ order.itemCount }} item(s)</td>
              <td class="table-cell">TZS{{ formatNumber(order.totalAmount) }}</td>
              <td class="table-cell">
                <select
                  :value="order.status"
                  @change="updateOrderStatus(order.id, $event.target.value)"
                  class="px-3 py-1.5 border rounded-xl text-sm font-medium bg-white cursor-pointer transition-all duration-200"
                  :class="{
                    'text-amber-500 border-amber-500 bg-amber-50': order.status === 'pending',
                    'text-brand-500 border-brand-500 bg-brand-50': order.status === 'confirmed',
                    'text-violet-500 border-violet-500 bg-violet-50': order.status === 'processing',
                    'text-cyan-500 border-cyan-500 bg-cyan-50': order.status === 'ready',
                    'text-emerald-500 border-emerald-500 bg-emerald-50': order.status === 'delivered',
                    'text-red-500 border-red-500 bg-red-50': order.status === 'cancelled',
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
                  class="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200"
                >
                  Cancel
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Balance Sheet Report -->
      <div v-if="selectedReport === 'balance-sheet'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Balance Sheet</h2>
        <div class="flex justify-center items-center py-12 px-6">
          <div class="max-w-[600px] text-center py-12 px-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl text-white shadow-soft-lg">
            <svg class="w-20 h-20 mx-auto mb-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-[28px] font-bold mb-4 text-white">View Full Balance Sheet</h3>
            <p class="text-base leading-relaxed mb-8 text-white/95">The Balance Sheet report is available on a dedicated page with advanced features including date selection, PDF export, and detailed financial position analysis.</p>
            <button @click="goToBalanceSheet" class="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-600 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg active:translate-y-0">
              View Balance Sheet Report
              <svg class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Ad Performance Report -->
      <div v-if="selectedReport === 'ad-performance'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-neutral-900">Ad Performance</h2>
          <button @click="syncMetaAds" :disabled="reportData.adPerformance.syncing" class="btn-primary flex items-center text-sm gap-2">
            <svg v-if="reportData.adPerformance.syncing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ reportData.adPerformance.syncing ? 'Syncing...' : 'Sync from Meta' }}
          </button>
        </div>

        <!-- KPI Cards Row 1: Spend, Revenue, ROAS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Total Ad Spend</h3>
            <div class="text-2xl font-bold text-red-600 mb-2">TZS{{ formatNumber(reportData.adPerformance.totalSpendTzs?.current || 0) }}</div>
            <div class="text-xs text-neutral-400 mb-1">${{ (reportData.adPerformance.totalSpendUsd?.current || 0).toFixed(2) }} USD</div>
            <div :class="['text-xs', (reportData.adPerformance.totalSpendTzs?.percentageChange || 0) >= 0 ? 'text-red-600' : 'text-emerald-600']">
              {{ (reportData.adPerformance.totalSpendTzs?.percentageChange || 0) >= 0 ? '+' : '' }}{{ (reportData.adPerformance.totalSpendTzs?.percentageChange || 0).toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Revenue</h3>
            <div class="text-2xl font-bold text-emerald-600 mb-2">TZS{{ formatNumber(reportData.adPerformance.revenue?.current || 0) }}</div>
            <div :class="['text-xs', (reportData.adPerformance.revenue?.percentageChange || 0) >= 0 ? 'text-emerald-600' : 'text-red-600']">
              {{ (reportData.adPerformance.revenue?.percentageChange || 0) >= 0 ? '+' : '' }}{{ (reportData.adPerformance.revenue?.percentageChange || 0).toFixed(1) }}% vs last period
            </div>
          </div>

          <div class="p-5 rounded-2xl border-2 border-brand-200 bg-brand-50/50">
            <h3 class="text-sm font-medium text-brand-700 mb-3">ROAS</h3>
            <div class="text-2xl font-bold text-brand-700 mb-2">{{ (reportData.adPerformance.roas?.current || 0).toFixed(1) }}x</div>
            <div class="text-xs text-neutral-500">Target: 4x</div>
          </div>
        </div>

        <!-- KPI Cards Row 2: Impressions, Clicks, CTR, Conversions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Impressions</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ formatNumber(reportData.adPerformance.totalImpressions?.current || 0) }}</div>
            <div class="text-xs text-neutral-400">Reach: {{ formatNumber(reportData.adPerformance.totalReach?.current || 0) }}</div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Clicks</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ formatNumber(reportData.adPerformance.totalClicks?.current || 0) }}</div>
            <div class="text-xs text-neutral-400">CPC: ${{ (reportData.adPerformance.avgCpc?.current || 0).toFixed(3) }}</div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">CTR</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ (reportData.adPerformance.avgCtr?.current || 0).toFixed(2) }}%</div>
            <div class="text-xs text-neutral-400">CPM: ${{ (reportData.adPerformance.avgCpm?.current || 0).toFixed(3) }}</div>
          </div>

          <div class="p-5 rounded-2xl border border-neutral-100 bg-white/50">
            <h3 class="text-sm font-medium text-neutral-500 mb-3">Conversations</h3>
            <div class="text-2xl font-bold text-neutral-900 mb-2">{{ formatNumber(reportData.adPerformance.totalConversions?.current || 0) }}</div>
            <div class="text-xs text-neutral-400">From click-to-WhatsApp</div>
          </div>
        </div>

        <!-- Spend & Clicks Chart -->
        <div class="border border-neutral-100 rounded-2xl p-5 bg-white/50 mb-8">
          <h3 class="text-base font-semibold text-neutral-700 mb-4">Daily Spend & Clicks</h3>
          <canvas ref="adSpendChart" class="!w-full !h-[300px] max-w-full max-h-[300px] bg-neutral-50 rounded-lg block"></canvas>
        </div>

        <!-- Campaign Breakdown Table -->
        <div>
          <h3 class="text-lg font-semibold text-neutral-700 mb-4">Campaign Breakdown</h3>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="table-header cursor-pointer select-none" @click="toggleSort(campaignSort, 'campaignName')">Campaign{{ sortIcon(campaignSort, 'campaignName') }}</th>
                  <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(campaignSort, 'spend')">Spend{{ sortIcon(campaignSort, 'spend') }}</th>
                  <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(campaignSort, 'impressions')">Impressions{{ sortIcon(campaignSort, 'impressions') }}</th>
                  <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(campaignSort, 'clicks')">Clicks{{ sortIcon(campaignSort, 'clicks') }}</th>
                  <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(campaignSort, 'ctr')">CTR{{ sortIcon(campaignSort, 'ctr') }}</th>
                  <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(campaignSort, 'cpc')">CPC{{ sortIcon(campaignSort, 'cpc') }}</th>
                  <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(campaignSort, 'conversions')">Conversations{{ sortIcon(campaignSort, 'conversions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in sortedCampaigns" :key="campaign.campaignId" class="table-row">
                  <td class="table-cell min-w-[350px] whitespace-normal break-words text-sm leading-snug">
                    <div class="font-medium text-neutral-900">{{ campaign.adCreativeBody || campaign.campaignName }}</div>
                    <div v-if="campaign.adCreativeBody" class="text-xs text-neutral-400 mt-1">{{ campaign.campaignName }}</div>
                  </td>
                  <td class="table-cell text-right">TZS{{ formatNumber(Math.round((campaign.spend || 0) * (reportData.adPerformance.usdToTzs || 2500))) }}</td>
                  <td class="table-cell text-right">{{ formatNumber(campaign.impressions) }}</td>
                  <td class="table-cell text-right">{{ formatNumber(campaign.clicks) }}</td>
                  <td class="table-cell text-right">{{ campaign.ctr?.toFixed(2) }}%</td>
                  <td class="table-cell text-right">${{ campaign.cpc?.toFixed(3) }}</td>
                  <td class="table-cell text-right">{{ formatNumber(campaign.conversions) }}</td>
                </tr>
                <tr v-if="!reportData.adPerformance.campaignBreakdown?.length" class="table-row">
                  <td colspan="7" class="table-cell text-center text-neutral-400 py-8">No ad data yet. Click "Sync from Meta" to pull your ad performance.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recommendations Section -->
        <div v-if="reportData.adPerformance.recommendations?.summary" class="mt-8">
          <!-- Summary Banner -->
          <div class="bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-200 rounded-2xl p-5 mb-6">
            <h3 class="text-lg font-semibold text-brand-800 mb-2">Recommendations</h3>
            <p class="text-sm text-brand-700">{{ reportData.adPerformance.recommendations.summary }}</p>
          </div>

          <!-- Budget Advice -->
          <div v-if="reportData.adPerformance.recommendations.budgetAdvice" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="p-4 rounded-2xl border border-neutral-100 bg-white/50">
              <h4 class="text-xs font-medium text-neutral-500 mb-1">Current Daily Spend</h4>
              <div class="text-lg font-bold text-neutral-900">${{ reportData.adPerformance.recommendations.budgetAdvice.currentDailySpend?.toFixed(2) }}</div>
            </div>
            <div class="p-4 rounded-2xl border border-neutral-100 bg-white/50">
              <h4 class="text-xs font-medium text-neutral-500 mb-1">Wasteful Spend (30d)</h4>
              <div class="text-lg font-bold text-red-600">${{ reportData.adPerformance.recommendations.budgetAdvice.wastefulSpend?.toFixed(2) }}</div>
            </div>
            <div class="p-4 rounded-2xl border border-neutral-100 bg-white/50">
              <h4 class="text-xs font-medium text-neutral-500 mb-1">Efficiency</h4>
              <div class="text-sm font-semibold text-neutral-700">{{ reportData.adPerformance.recommendations.budgetAdvice.efficiency }}</div>
            </div>
          </div>

          <!-- Campaign Actions -->
          <div v-if="reportData.adPerformance.recommendations.campaignActions?.length" class="mb-6">
            <h3 class="text-lg font-semibold text-neutral-700 mb-4">Campaign Actions</h3>
            <div class="flex flex-col gap-3">
              <div v-for="ca in reportData.adPerformance.recommendations.campaignActions" :key="ca.campaignId"
                class="flex items-start gap-3 p-4 rounded-xl border"
                :class="{
                  'border-emerald-200 bg-emerald-50/50': ca.action === 'scale',
                  'border-neutral-200 bg-white/50': ca.action === 'keep',
                  'border-red-200 bg-red-50/50': ca.action === 'kill'
                }">
                <span class="text-xs font-bold px-2 py-1 rounded-full uppercase whitespace-nowrap"
                  :class="{
                    'bg-emerald-100 text-emerald-800': ca.action === 'scale',
                    'bg-neutral-100 text-neutral-600': ca.action === 'keep',
                    'bg-red-100 text-red-800': ca.action === 'kill'
                  }">
                  {{ ca.action }}
                </span>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-neutral-900 text-sm truncate">{{ ca.campaignName }}</div>
                  <div class="text-xs text-neutral-500 mt-1">{{ ca.reason }}</div>
                </div>
                <div class="text-right text-xs text-neutral-500 whitespace-nowrap">
                  <div>${{ ca.spend?.toFixed(2) }} spent</div>
                  <div>{{ ca.conversions }} conv.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products to Advertise -->
          <div v-if="reportData.adPerformance.recommendations.productsToAdvertise?.length">
            <h3 class="text-lg font-semibold text-neutral-700 mb-4">Products to Advertise Next</h3>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="table-header cursor-pointer select-none" @click="toggleSort(productSort, 'name')">Product{{ sortIcon(productSort, 'name') }}</th>
                    <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(productSort, 'sellingPrice')">Price (TZS){{ sortIcon(productSort, 'sellingPrice') }}</th>
                    <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(productSort, 'profitMargin')">Margin{{ sortIcon(productSort, 'profitMargin') }}</th>
                    <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(productSort, 'stockOnHand')">Stock{{ sortIcon(productSort, 'stockOnHand') }}</th>
                    <th class="table-header text-right cursor-pointer select-none" @click="toggleSort(productSort, 'salesVelocity')">Sales (90d){{ sortIcon(productSort, 'salesVelocity') }}</th>
                    <th class="table-header">Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="prod in sortedProducts" :key="prod.itemId" class="table-row">
                    <td class="table-cell">
                      <div class="font-medium text-neutral-900">{{ prod.name }}</div>
                      <div class="text-xs text-neutral-400">{{ prod.code }}</div>
                    </td>
                    <td class="table-cell text-right">{{ formatNumber(prod.sellingPrice) }}</td>
                    <td class="table-cell text-right">
                      <span :class="prod.profitMargin >= 75 ? 'text-emerald-600 font-semibold' : 'text-neutral-700'">{{ prod.profitMargin }}%</span>
                    </td>
                    <td class="table-cell text-right">{{ prod.stockOnHand }}</td>
                    <td class="table-cell text-right">{{ prod.salesVelocity }}</td>
                    <td class="table-cell text-xs text-neutral-600 max-w-[250px]">{{ prod.reason }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Catalogue Report -->
      <div v-if="selectedReport === 'catalogue'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6">Product Catalogue</h2>
        <div class="flex justify-center items-center py-12 px-6">
          <div class="max-w-[600px] text-center py-12 px-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl text-white shadow-soft-lg">
            <svg class="w-20 h-20 mx-auto mb-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 class="text-[28px] font-bold mb-4 text-white">Product Catalogue PDF</h3>
            <p class="text-base leading-relaxed mb-8 text-white/95">Generate and preview your product catalogue as a PDF. Filter by category or stock status, preview in-browser, then download when ready.</p>
            <button @click="goToCatalogue" class="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-emerald-600 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg active:translate-y-0">
              Open Catalogue PDF
              <svg class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch, computed } from 'vue'
import api from '@/services/Api'
import SwalAlert from '@/components/common/SwalAlert.vue'
import { Chart, registerables } from 'chart.js'
import { useRouter } from 'vue-router'

// Register Chart.js components
Chart.register(...registerables)

// Router for navigation
const router = useRouter()

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// Chart refs
const salesChart = ref(null)
const productsChart = ref(null)
const adSpendChart = ref(null)
let salesChartInstance = null
let productsChartInstance = null
let adSpendChartInstance = null

// Table sorting state
const campaignSort = reactive({ key: 'spend', dir: 'desc' })
const productSort = reactive({ key: 'score', dir: 'desc' })

const toggleSort = (sortState, key) => {
  if (sortState.key === key) {
    sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.key = key
    sortState.dir = 'desc'
  }
}

const sortedCampaigns = computed(() => {
  const rows = [...(reportData.adPerformance.campaignBreakdown || [])]
  const { key, dir } = campaignSort
  return rows.sort((a, b) => {
    const av = a[key] ?? 0
    const bv = b[key] ?? 0
    return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })
})

const brandMatches = (item) => {
  if (!selectedBrand.value) return true
  const bid = selectedBrand.value.toString()
  if (item.brandId && item.brandId.toString() === bid) return true
  if (item.brand?.id && item.brand.id.toString() === bid) return true
  if (item.brand && item.brand.toString() === bid) return true
  // match by brand name if API returned string
  const brand = availableBrands.value.find(b => b.id.toString() === bid)
  if (brand) {
    const name = (item.brand?.name || item.brand || '').toString().toLowerCase()
    if (name === brand.name.toLowerCase()) return true
    // fallback: match on item name starting with brand (case-insensitive)
    const itemName = (item.name || item.productName || '').toLowerCase()
    if (itemName.includes(brand.name.toLowerCase())) return true
  }
  return false
}

const filteredInventoryItems = computed(() =>
  (reportData.inventoryItems || []).filter(brandMatches)
)
const filteredTopProducts = computed(() =>
  (reportData.topProducts || []).filter(brandMatches)
)

const sortedProducts = computed(() => {
  const rows = [...(reportData.adPerformance.recommendations?.productsToAdvertise || [])]
  const { key, dir } = productSort
  return rows.sort((a, b) => {
    const av = a[key] ?? 0
    const bv = b[key] ?? 0
    return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })
})

const sortIcon = (sortState, key) => {
  if (sortState.key !== key) return ' \u2195'
  return sortState.dir === 'asc' ? ' \u2191' : ' \u2193'
}

// Reactive data
const loading = ref(true)
const selectedDateRange = ref('30')
const selectedBrand = ref('')
const availableBrands = ref([])

const loadBrands = async () => {
  try {
    const res = await api.get('/brands')
    availableBrands.value = res.data || []
  } catch (e) {
    availableBrands.value = []
  }
}
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
  shelfTime: {
    overallAvgDays: 0,
    medianDays: 0,
    fastestDays: 0,
    slowestDays: 0,
    totalItemsSold: 0,
    byBrand: [],
    fastestMovers: [],
    slowestMovers: [],
    currentlyAging: []
  },
  retention: {
    totalCustomersWithOrders: 0,
    oneTimeCustomers: 0,
    repeatCustomers: 0,
    repeatPurchaseRate: 0,
    averageOrdersPerCustomer: 0,
    averageLifetimeValue: 0,
    totalLifetimeRevenue: 0,
    segments: { oneTime: 0, occasional: 0, loyal: 0 },
    churnBuckets: { active: 0, atRisk: 0, dormant: 0, lost: 0 },
    customers: []
  },
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
  },
  adPerformance: {
    totalSpendUsd: { current: 0, previous: 0, percentageChange: 0 },
    totalSpendTzs: { current: 0, previous: 0, percentageChange: 0 },
    totalImpressions: { current: 0, previous: 0, percentageChange: 0 },
    totalClicks: { current: 0, previous: 0, percentageChange: 0 },
    totalConversions: { current: 0, previous: 0, percentageChange: 0 },
    totalReach: { current: 0, previous: 0, percentageChange: 0 },
    avgCpc: { current: 0, previous: 0, percentageChange: 0 },
    avgCtr: { current: 0, previous: 0, percentageChange: 0 },
    avgCpm: { current: 0, previous: 0, percentageChange: 0 },
    roas: { current: 0, previous: 0, percentageChange: 0 },
    revenue: { current: 0, previous: 0, percentageChange: 0 },
    dailyBreakdown: [],
    campaignBreakdown: [],
    syncing: false,
    recommendations: {
      campaignActions: [],
      productsToAdvertise: [],
      budgetAdvice: { currentDailySpend: 0, recommendedDailySpend: 0, topCampaignToScale: null, wastefulSpend: 0, efficiency: '' },
      summary: ''
    }
  }
})

// Methods

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

    // Fetch retention report (lifetime, no date filter)
    try {
      const retentionReport = await apiCall('/reports/retention');
      reportData.retention = retentionReport || reportData.retention;
    } catch (e) {
      console.error('Failed to load retention report', e);
    }

    // Fetch shelf-time report (lifetime, no date filter)
    try {
      const shelfTimeReport = await apiCall('/reports/shelf-time');
      reportData.shelfTime = shelfTimeReport || reportData.shelfTime;
    } catch (e) {
      console.error('Failed to load shelf-time report', e);
    }

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

    // Fetch ad performance data + recommendations
    try {
      const [adData, adRecs] = await Promise.all([
        apiCall(`/reports/ad-performance${queryParams}`),
        apiCall('/meta-ads/recommendations'),
      ]);
      reportData.adPerformance = { ...reportData.adPerformance, ...adData, recommendations: adRecs };
    } catch (e) {
      console.error('Failed to load ad performance report', e);
    }

    // Render charts after data is loaded
    if (selectedReport.value === 'overview') {
      setTimeout(() => {
        renderCharts();
      }, 100);
    }
    if (selectedReport.value === 'ad-performance') {
      setTimeout(() => {
        renderAdSpendChart();
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
  const topProductsData = filteredTopProducts.value
  if (topProductsData.length > 0) {
    try {
      const ctx = productsChart.value.getContext('2d');
      productsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: topProductsData.map(item => item.name),
          datasets: [{
            label: 'Revenue (TZS)',
            data: topProductsData.map(item => item.revenue),
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
                  const product = topProductsData[context.dataIndex];
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

const syncMetaAds = async () => {
  try {
    reportData.adPerformance.syncing = true
    await apiCall('/meta-ads/sync')
    swalAlert.value?.showSuccess('Sync Complete', 'Ad data synced from Meta')
    await fetchReports()
  } catch (error) {
    swalAlert.value?.showError('Sync Failed', error.message || 'Failed to sync Meta Ads data')
  } finally {
    reportData.adPerformance.syncing = false
  }
}

const renderAdSpendChart = () => {
  if (!adSpendChart.value) return
  if (adSpendChartInstance) {
    adSpendChartInstance.destroy()
    adSpendChartInstance = null
  }

  const daily = reportData.adPerformance.dailyBreakdown || []
  if (daily.length === 0) return

  adSpendChartInstance = new Chart(adSpendChart.value, {
    type: 'line',
    data: {
      labels: daily.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Ad Spend (TZS)',
          data: daily.map(d => d.spendTzs || 0),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'Clicks',
          data: daily.map(d => d.clicks),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          ticks: { callback: v => 'TZS ' + v.toLocaleString() }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false }
        }
      }
    }
  })
}

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

const goToBalanceSheet = () => {
  router.push('/reports/balance-sheet')
}

const goToCatalogue = () => {
  router.push('/reports/catalogue')
}

// Lifecycle
onMounted(() => {
  loadBrands()
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
  if (selectedReport.value === 'ad-performance') {
    setTimeout(() => {
      renderAdSpendChart()
    }, 100)
  }
})

// Re-render top products chart when brand filter changes (on overview tab)
watch(selectedBrand, () => {
  if (selectedReport.value === 'overview') {
    setTimeout(() => renderCharts(), 50)
  }
})
</script>
