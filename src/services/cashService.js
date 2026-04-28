import api from './Api'

const CashService = {
  async getBalance() {
    try {
      const response = await api.get('/cash/balance')
      return response.data
    } catch (error) {
      console.error('Error fetching cash balance:', error)
      throw error
    }
  },

  async list(filters = {}) {
    try {
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.method) params.method = filters.method
      if (filters.type) params.type = filters.type
      if (filters.source) params.source = filters.source
      const response = await api.get('/cash/movements', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching cash movements:', error)
      throw error
    }
  },

  async getOne(id) {
    try {
      const response = await api.get(`/cash/movements/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching cash movement ${id}:`, error)
      throw error
    }
  },

  async create(payload) {
    try {
      const response = await api.post('/cash/movements', payload)
      return response.data
    } catch (error) {
      console.error('Error creating cash movement:', error)
      throw error
    }
  },

  async update(id, payload) {
    try {
      const response = await api.put(`/cash/movements/${id}`, payload)
      return response.data
    } catch (error) {
      console.error(`Error updating cash movement ${id}:`, error)
      throw error
    }
  },

  async remove(id) {
    try {
      const response = await api.delete(`/cash/movements/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting cash movement ${id}:`, error)
      throw error
    }
  },

  async recordPurchase(payload) {
    try {
      const response = await api.post('/cash/purchases', payload)
      return response.data
    } catch (error) {
      console.error('Error recording purchase:', error)
      throw error
    }
  },
}

export default CashService

export const CASH_TYPES = [
  { value: 'in', label: 'Cash In' },
  { value: 'out', label: 'Cash Out' },
]

export const CASH_SOURCES = [
  { value: 'opening_balance', label: 'Opening Balance' },
  { value: 'sale', label: 'Sale' },
  { value: 'expense', label: 'Expense' },
  { value: 'purchase', label: 'Inventory Purchase' },
  { value: 'owner_contribution', label: 'Owner Contribution' },
  { value: 'owner_draw', label: 'Owner Draw' },
  { value: 'transfer', label: 'Transfer Between Methods' },
  { value: 'manual_adjustment', label: 'Manual Adjustment' },
]

export const CASH_METHODS = [
  { value: 'cash', label: 'Physical Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'tigo_pesa', label: 'Tigo Pesa' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'bank', label: 'Bank' },
]
