import api from './Api'

const BrandService = {
  // Get all brands
  async getAll() {
    try {
      const response = await api.get('/brands')
      return response.data
    } catch (error) {
      console.error('Error fetching brands:', error)
      throw error
    }
  },

  // Get active brands only
  async getActive() {
    try {
      const response = await api.get('/brands/active')
      return response.data
    } catch (error) {
      console.error('Error fetching active brands:', error)
      throw error
    }
  },

  // Get total count
  async getTotal() {
    try {
      const response = await api.get('/brands/total')
      return response.data
    } catch (error) {
      console.error('Error fetching total brands count:', error)
      throw error
    }
  },

  // Get active count
  async getActiveCount() {
    try {
      const response = await api.get('/brands/active/count')
      return response.data
    } catch (error) {
      console.error('Error fetching active brands count:', error)
      throw error
    }
  },

  // Get single brand by ID
  async getById(id) {
    try {
      const response = await api.get(`/brands/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching brand ${id}:`, error)
      throw error
    }
  },

  // Create new brand
  async create(brandData) {
    try {
      const response = await api.post('/brands', brandData)
      return response.data
    } catch (error) {
      console.error('Error creating brand:', error)
      throw error
    }
  },

  // Update brand
  async update(id, brandData) {
    try {
      const response = await api.put(`/brands/${id}`, brandData)
      return response.data
    } catch (error) {
      console.error(`Error updating brand ${id}:`, error)
      throw error
    }
  },

  // Delete brand
  async delete(id) {
    try {
      const response = await api.delete(`/brands/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting brand ${id}:`, error)
      throw error
    }
  }
}

export default BrandService
