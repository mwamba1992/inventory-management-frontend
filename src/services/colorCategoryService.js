import api from './Api'

const ColorCategoryService = {
  // Get all color categories
  async getAll() {
    try {
      const response = await api.get('/color-categories')
      return response.data
    } catch (error) {
      console.error('Error fetching color categories:', error)
      throw error
    }
  },

  // Get single color category by ID
  async getById(id) {
    try {
      const response = await api.get(`/color-categories/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching color category ${id}:`, error)
      throw error
    }
  },

  // Create new color category
  async create(colorCategoryData) {
    try {
      const response = await api.post('/color-categories', colorCategoryData)
      return response.data
    } catch (error) {
      console.error('Error creating color category:', error)
      throw error
    }
  },

  // Update color category
  async update(id, colorCategoryData) {
    try {
      const response = await api.put(`/color-categories/${id}`, colorCategoryData)
      return response.data
    } catch (error) {
      console.error(`Error updating color category ${id}:`, error)
      throw error
    }
  },

  // Delete color category
  async delete(id) {
    try {
      const response = await api.delete(`/color-categories/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting color category ${id}:`, error)
      throw error
    }
  }
}

export default ColorCategoryService
