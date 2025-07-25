import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useItemsStore = defineStore('items', () => {
  const items = ref([
    {
      id: 31,
      name: 'redmi active 5',
      description: 'redmi watch 5 active',
      tax: 'No Tax',
      defaultQty: 1,
      price: 160000.00,
      stockcode: 'REDMI1234',
      category: 'Electronics',
      supplier: "Joe's Fruit&Veg.Supplies"
    }
  ])

  const loading = ref(false)

  const fetchItems = async () => {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // items.value = await api.getItems()
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      loading.value = false
    }
  }

  const addItem = (item) => {
    const newItem = {
      ...item,
      id: Math.max(...items.value.map(i => i.id)) + 1
    }
    items.value.push(newItem)
  }

  const updateItem = (id, updatedItem) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updatedItem }
    }
  }

  const deleteItem = (id) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  return {
    items,
    loading,
    fetchItems,
    addItem,
    updateItem,
    deleteItem
  }
})
