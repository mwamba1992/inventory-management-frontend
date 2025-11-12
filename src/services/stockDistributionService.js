import api from './Api'

const StockDistributionService = {
  // Get all stock distributions
  async getAll() {
    try {
      const response = await api.get('/items/item-stock-distributions')
      return response.data
    } catch (error) {
      console.error('Error fetching stock distributions:', error)
      throw error
    }
  },

  // Get stock distributions for a specific item stock
  async getByItemStock(itemStockId) {
    try {
      const response = await api.get('/items/item-stock-distributions')
      // Filter on frontend since backend returns all distributions
      const filtered = response.data.filter(dist => dist.itemStock?.id === itemStockId)
      return filtered
    } catch (error) {
      console.error(`Error fetching stock distributions for item stock ${itemStockId}:`, error)
      throw error
    }
  },

  // Get single stock distribution by ID
  async getById(id) {
    try {
      const response = await api.get(`/items/item-stock-distributions/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching stock distribution ${id}:`, error)
      throw error
    }
  },

  // Create new stock distribution
  async create(distributionData) {
    try {
      console.log('📤 Creating stock distribution with data:', distributionData)
      console.log('🌐 Endpoint: POST /items/item-stock-distributions')
      const response = await api.post('/items/item-stock-distributions', distributionData)
      console.log('✅ Stock distribution created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error creating stock distribution:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      throw error
    }
  },

  // Update stock distribution
  async update(id, distributionData) {
    try {
      const response = await api.put(`/items/item-stock-distributions/${id}`, distributionData)
      return response.data
    } catch (error) {
      console.error(`Error updating stock distribution ${id}:`, error)
      throw error
    }
  },

  // Delete stock distribution
  async delete(id) {
    try {
      const response = await api.delete(`/items/item-stock-distributions/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting stock distribution ${id}:`, error)
      throw error
    }
  }
}

export default StockDistributionService
