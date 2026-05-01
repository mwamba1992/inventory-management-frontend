<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-neutral-50 p-4">
    <div class="max-w-full mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-neutral-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>Finance</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-neutral-700 font-medium">Cash</span>
      </div>

      <!-- Header -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
              Cash Tracking
            </h1>
            <p class="text-neutral-600 mt-2">Track every shilling in and out of the shop</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refresh"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-neutral-700 px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="syncFromSalesAndExpenses"
              :disabled="syncing"
              class="bg-white/80 hover:bg-white text-neutral-700 px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': syncing }" />
              {{ syncing ? 'Syncing…' : 'Sync from Sales' }}
            </button>
            <button
              @click="openPurchaseModal"
              class="bg-white/80 hover:bg-white text-neutral-700 px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ShoppingCartIcon class="w-4 h-4 mr-2" />
              Record Purchase
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-soft hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Record Movement
            </button>
          </div>
        </div>
      </div>

      <!-- Balance cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
          <p class="text-sm font-medium text-neutral-600">Total Cash</p>
          <p
            class="text-2xl font-bold mt-1"
            :class="balance.total >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            TZS {{ formatAmount(balance.total) }}
          </p>
          <p class="text-xs text-neutral-500 mt-1">across all methods</p>
        </div>
        <div
          v-for="m in CASH_METHODS"
          :key="m.value"
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20"
        >
          <p class="text-sm font-medium text-neutral-600">{{ m.label }}</p>
          <p class="text-2xl font-bold text-neutral-900 mt-1">
            TZS {{ formatAmount(balance.byMethod[m.value] || 0) }}
          </p>
        </div>
      </div>

      <!-- Runway + 30-day statement summary -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20">
          <p class="text-sm font-medium text-neutral-600">Runway (last 30d burn)</p>
          <p
            class="text-2xl font-bold mt-1"
            :class="runway.weeksRemaining === null ? 'text-green-600' : 'text-orange-600'"
          >
            {{
              runway.weeksRemaining === null
                ? 'Cash flow positive'
                : runway.weeksRemaining + ' weeks'
            }}
          </p>
          <p class="text-xs text-neutral-500 mt-1">
            Net daily: TZS {{ formatAmount(runway.netDailyChange) }}
          </p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20">
          <p class="text-sm font-medium text-neutral-600">In (this period)</p>
          <p class="text-2xl font-bold text-green-600 mt-1">
            TZS {{ formatAmount(statement.totalIn) }}
          </p>
          <p class="text-xs text-neutral-500 mt-1">
            {{ statement.inflows?.length || 0 }} source(s)
          </p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20">
          <p class="text-sm font-medium text-neutral-600">Out (this period)</p>
          <p class="text-2xl font-bold text-red-600 mt-1">
            TZS {{ formatAmount(statement.totalOut) }}
          </p>
          <p class="text-xs text-neutral-500 mt-1">
            Net: TZS {{ formatAmount(statement.net) }}
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-white/20 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            v-model="filters.startDate"
            type="date"
            class="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
            placeholder="Start date"
          />
          <input
            v-model="filters.endDate"
            type="date"
            class="px-3 py-2 rounded-xl border border-neutral-200 text-sm"
            placeholder="End date"
          />
          <select v-model="filters.type" class="px-3 py-2 rounded-xl border border-neutral-200 text-sm">
            <option value="">All types</option>
            <option v-for="t in CASH_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <select v-model="filters.method" class="px-3 py-2 rounded-xl border border-neutral-200 text-sm">
            <option value="">All methods</option>
            <option v-for="m in CASH_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <select v-model="filters.source" class="px-3 py-2 rounded-xl border border-neutral-200 text-sm">
            <option value="">All sources</option>
            <option v-for="s in CASH_SOURCES" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div class="flex justify-end mt-3 gap-2">
          <button
            @click="resetFilters"
            class="px-3 py-1.5 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            Reset
          </button>
          <button
            @click="loadMovements"
            class="px-4 py-1.5 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700"
          >
            Apply
          </button>
        </div>
      </div>

      <!-- Movements table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-neutral-700">Date</th>
                <th class="text-left px-4 py-3 font-medium text-neutral-700">Type</th>
                <th class="text-left px-4 py-3 font-medium text-neutral-700">Source</th>
                <th class="text-left px-4 py-3 font-medium text-neutral-700">Method</th>
                <th class="text-right px-4 py-3 font-medium text-neutral-700">Amount</th>
                <th class="text-left px-4 py-3 font-medium text-neutral-700">Notes</th>
                <th class="text-right px-4 py-3 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="px-4 py-8 text-center text-neutral-500">Loading…</td>
              </tr>
              <tr v-else-if="movements.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-neutral-500">
                  No movements yet — click "Record Movement" to set your opening balance
                </td>
              </tr>
              <tr
                v-for="m in movements"
                :key="m.id"
                class="border-b border-neutral-100 hover:bg-neutral-50"
              >
                <td class="px-4 py-3 text-neutral-700">{{ formatDate(m.occurredAt) }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="m.type === 'in'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'"
                    class="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                  >
                    {{ m.type }}
                  </span>
                </td>
                <td class="px-4 py-3 text-neutral-700">{{ sourceLabel(m.source) }}</td>
                <td class="px-4 py-3 text-neutral-700">{{ methodLabel(m.method) }}</td>
                <td
                  class="px-4 py-3 text-right font-medium"
                  :class="m.type === 'in' ? 'text-green-700' : 'text-red-700'"
                >
                  {{ m.type === 'in' ? '+' : '−' }} TZS {{ formatAmount(m.amount) }}
                </td>
                <td class="px-4 py-3 text-neutral-600 max-w-xs truncate">{{ m.notes || '—' }}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    @click="openEditModal(m)"
                    class="text-brand-600 hover:text-brand-800 text-xs mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(m)"
                    class="text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Movement Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 class="text-xl font-bold text-neutral-900 mb-4">
          {{ editingId ? 'Edit Cash Movement' : 'Record Cash Movement' }}
        </h2>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Type</label>
            <select v-model="form.type" class="w-full px-3 py-2 rounded-xl border border-neutral-200">
              <option v-for="t in CASH_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Source</label>
            <select v-model="form.source" class="w-full px-3 py-2 rounded-xl border border-neutral-200">
              <option v-for="s in CASH_SOURCES" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Payment Method</label>
            <select v-model="form.method" class="w-full px-3 py-2 rounded-xl border border-neutral-200">
              <option v-for="m in CASH_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Amount (TZS)</label>
            <input
              v-model.number="form.amount"
              type="number"
              min="1"
              step="1"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
              placeholder="e.g. 200000"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Date</label>
            <input
              v-model="form.occurredAt"
              type="date"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Notes (optional)</label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
              placeholder="e.g. Opening balance — M-Pesa as of today"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="closeModal"
            class="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            @click="submitMovement"
            :disabled="submitting || !form.amount"
            class="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {{ submitting ? 'Saving…' : (editingId ? 'Update Movement' : 'Save Movement') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Record Purchase Modal -->
    <div
      v-if="showPurchaseModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="closePurchaseModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 class="text-xl font-bold text-neutral-900 mb-1">Record Inventory Purchase</h2>
        <p class="text-sm text-neutral-500 mb-4">
          Records the inventory transaction, marks units as in-transit, and logs the cash-out — all in one action.
        </p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Item</label>
            <SearchableSelect
              v-model="purchaseForm.itemId"
              :items="items"
              :format-label="(i) => (i.code ? `${i.code} — ${i.name}` : i.name)"
              :filter-fn="(i, q) => (i.name || '').toLowerCase().includes(q) || (i.code || '').toLowerCase().includes(q)"
              placeholder="Select item…"
              search-placeholder="Search by code or name…"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Warehouse</label>
            <SearchableSelect
              v-model="purchaseForm.warehouseId"
              :items="warehouses"
              placeholder="Select warehouse…"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
              <input
                v-model.number="purchaseForm.quantity"
                type="number"
                min="1"
                step="1"
                class="w-full px-3 py-2 rounded-xl border border-neutral-200"
                placeholder="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Total Cost (TZS)</label>
              <input
                v-model.number="purchaseForm.totalCost"
                type="number"
                min="1"
                step="1"
                class="w-full px-3 py-2 rounded-xl border border-neutral-200"
                placeholder="290000"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Payment Method</label>
            <select v-model="purchaseForm.method" class="w-full px-3 py-2 rounded-xl border border-neutral-200">
              <option v-for="m in CASH_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Order Date</label>
            <input
              v-model="purchaseForm.orderDate"
              type="date"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Supplier (optional)</label>
            <input
              v-model="purchaseForm.supplierName"
              type="text"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
              placeholder="e.g. eBay UK — thephonefunshop"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Reference / Order # (optional)</label>
            <input
              v-model="purchaseForm.referenceNumber"
              type="text"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
              placeholder="e.g. eBay order 27-12345"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Notes (optional)</label>
            <textarea
              v-model="purchaseForm.notes"
              rows="2"
              class="w-full px-3 py-2 rounded-xl border border-neutral-200"
              placeholder="e.g. Refurb-excellent, activation lock cleared"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="closePurchaseModal"
            class="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            @click="submitPurchase"
            :disabled="purchaseSubmitting || !canSubmitPurchase"
            class="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {{ purchaseSubmitting ? 'Saving…' : 'Save Purchase' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import {
  HomeIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'
import SwalAlert from '@/components/common/SwalAlert.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import CashService, {
  CASH_TYPES,
  CASH_SOURCES,
  CASH_METHODS,
} from '@/services/cashService'
import api from '@/services/Api'

const swalAlert = ref(null)
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const showPurchaseModal = ref(false)
const purchaseSubmitting = ref(false)
const syncing = ref(false)
const editingId = ref(null)
const movements = ref([])
const balance = ref({ total: 0, byMethod: {} })
const items = ref([])
const warehouses = ref([])
const runway = ref({
  currentBalance: 0,
  avgDailyOutflow: 0,
  avgDailyInflow: 0,
  netDailyChange: 0,
  daysRemaining: null,
  weeksRemaining: null,
})
const statement = ref({ inflows: [], outflows: [], totalIn: 0, totalOut: 0, net: 0 })

const filters = reactive({
  startDate: '',
  endDate: '',
  method: '',
  type: '',
  source: '',
})

const form = reactive({
  type: 'in',
  source: 'opening_balance',
  method: 'cash',
  amount: null,
  occurredAt: new Date().toISOString().split('T')[0],
  notes: '',
})

const purchaseForm = reactive({
  itemId: null,
  warehouseId: null,
  quantity: 1,
  totalCost: null,
  method: 'mpesa',
  orderDate: new Date().toISOString().split('T')[0],
  supplierName: '',
  referenceNumber: '',
  notes: '',
})

const canSubmitPurchase = computed(
  () =>
    purchaseForm.itemId &&
    purchaseForm.warehouseId &&
    purchaseForm.quantity > 0 &&
    purchaseForm.totalCost > 0,
)

const formatAmount = (n) => Number(n || 0).toLocaleString('en-US')

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const sourceLabel = (val) =>
  CASH_SOURCES.find((s) => s.value === val)?.label || val

const methodLabel = (val) =>
  CASH_METHODS.find((m) => m.value === val)?.label || val

const refresh = async () => {
  await Promise.all([loadBalance(), loadMovements(), loadRunway(), loadStatement()])
}

const loadRunway = async () => {
  try {
    runway.value = await CashService.getRunway()
  } catch (err) {
    // non-critical
  }
}

const loadStatement = async () => {
  try {
    statement.value = await CashService.getStatement(
      filters.startDate || undefined,
      filters.endDate || undefined,
    )
  } catch (err) {
    // non-critical
  }
}

const loadBalance = async () => {
  try {
    const data = await CashService.getBalance()
    balance.value = data || { total: 0, byMethod: {} }
  } catch (err) {
    swalAlert.value?.error?.('Failed to load balance')
  }
}

const loadMovements = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.method) params.method = filters.method
    if (filters.type) params.type = filters.type
    if (filters.source) params.source = filters.source
    movements.value = await CashService.list(params)
  } catch (err) {
    swalAlert.value?.error?.('Failed to load movements')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.startDate = ''
  filters.endDate = ''
  filters.method = ''
  filters.type = ''
  filters.source = ''
  loadMovements()
}

const openAddModal = () => {
  editingId.value = null
  form.type = 'in'
  form.source = 'opening_balance'
  form.method = 'cash'
  form.amount = null
  form.occurredAt = new Date().toISOString().split('T')[0]
  form.notes = ''
  showModal.value = true
}

const openEditModal = (movement) => {
  editingId.value = movement.id
  form.type = movement.type
  form.source = movement.source
  form.method = movement.method
  form.amount = Number(movement.amount)
  form.occurredAt = movement.occurredAt
    ? new Date(movement.occurredAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]
  form.notes = movement.notes || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const submitMovement = async () => {
  if (!form.amount || form.amount <= 0) {
    swalAlert.value?.error?.('Amount must be greater than 0')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await CashService.update(editingId.value, { ...form })
      swalAlert.value?.success?.('Movement updated')
    } else {
      await CashService.create({ ...form })
      swalAlert.value?.success?.('Movement recorded')
    }
    closeModal()
    await refresh()
  } catch (err) {
    swalAlert.value?.error?.(
      err?.response?.data?.message || 'Failed to save movement',
    )
  } finally {
    submitting.value = false
  }
}

const loadItemsAndWarehouses = async () => {
  try {
    const [itemsRes, warehousesRes] = await Promise.all([
      api.get('/items'),
      api.get('/warehouses'),
    ])
    items.value = itemsRes.data || []
    warehouses.value = warehousesRes.data || []
  } catch (err) {
    console.error('Failed to load items/warehouses', err)
  }
}

const openPurchaseModal = async () => {
  purchaseForm.itemId = null
  purchaseForm.warehouseId = warehouses.value[0]?.id ?? null
  purchaseForm.quantity = 1
  purchaseForm.totalCost = null
  purchaseForm.method = 'mpesa'
  purchaseForm.orderDate = new Date().toISOString().split('T')[0]
  purchaseForm.supplierName = ''
  purchaseForm.referenceNumber = ''
  purchaseForm.notes = ''
  if (items.value.length === 0 || warehouses.value.length === 0) {
    await loadItemsAndWarehouses()
    purchaseForm.warehouseId = warehouses.value[0]?.id ?? null
  }
  showPurchaseModal.value = true
}

const closePurchaseModal = () => {
  showPurchaseModal.value = false
}

const syncFromSalesAndExpenses = async () => {
  syncing.value = true
  try {
    const result = await CashService.syncFromSalesAndExpenses()
    await refresh()
    swalAlert.value?.success?.(
      `Synced: +${result.salesAdded} sale(s) (TZS ${formatAmount(result.totalIn)}), -${result.expensesAdded} expense(s) (TZS ${formatAmount(result.totalOut)})`,
    )
  } catch (err) {
    swalAlert.value?.error?.(
      err?.response?.data?.message || 'Failed to sync from sales/expenses',
    )
  } finally {
    syncing.value = false
  }
}

const submitPurchase = async () => {
  if (!canSubmitPurchase.value) {
    swalAlert.value?.error?.('Item, warehouse, quantity and total cost are required')
    return
  }
  purchaseSubmitting.value = true
  try {
    await CashService.recordPurchase({ ...purchaseForm })
    closePurchaseModal()
    await refresh()
    swalAlert.value?.success?.('Purchase recorded — stock and cash updated')
  } catch (err) {
    swalAlert.value?.error?.(
      err?.response?.data?.message || 'Failed to record purchase',
    )
  } finally {
    purchaseSubmitting.value = false
  }
}

const confirmDelete = async (movement) => {
  const ok = await swalAlert.value?.confirm?.(
    `Delete this ${movement.type.toUpperCase()} movement of TZS ${formatAmount(movement.amount)}?`
  )
  if (!ok) return
  try {
    await CashService.remove(movement.id)
    await refresh()
    swalAlert.value?.success?.('Movement deleted')
  } catch (err) {
    swalAlert.value?.error?.('Failed to delete')
  }
}

onMounted(() => {
  refresh()
  loadItemsAndWarehouses()
})
</script>
