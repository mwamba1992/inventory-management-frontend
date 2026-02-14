<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-neutral-50 p-4">
    <div class="max-w-full mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-neutral-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <router-link to="/reports" class="hover:text-brand-600 transition-colors">Reports</router-link>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-neutral-700 font-medium">Product Catalogue</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
              Product Catalogue PDF
            </h1>
            <p class="text-neutral-600 mt-2">Preview and download your product catalogue as a PDF report</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <router-link
              to="/reports"
              class="bg-white/80 hover:bg-white text-neutral-700 px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon class="w-4 h-4 mr-2" />
              Back to Reports
            </router-link>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 mb-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">Filter Options</h2>
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex flex-col gap-1 min-w-[200px]">
            <label class="text-sm font-medium text-neutral-700">Category</label>
            <select
              v-model="selectedCategory"
              class="border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-neutral-700">Stock Filter</label>
            <label class="inline-flex items-center gap-2 border border-neutral-200 rounded-xl px-3 py-2 bg-white cursor-pointer hover:border-neutral-300 transition-colors">
              <input
                type="checkbox"
                v-model="inStockOnly"
                class="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
              <span class="text-sm text-neutral-700">In Stock Only</span>
            </label>
          </div>

          <button
            @click="generatePreview"
            :disabled="generatingPdf"
            class="bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white px-5 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-soft hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <EyeIcon class="w-4 h-4 mr-2" />
            {{ generatingPdf ? 'Generating...' : 'Generate Preview' }}
          </button>

          <button
            v-if="pdfBlobUrl"
            @click="downloadPdf"
            class="bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white px-5 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-soft hover:shadow-xl"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="generatingPdf" class="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
        <div class="w-10 h-10 border-4 border-neutral-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p class="text-neutral-500">Generating catalogue PDF...</p>
        <p class="text-neutral-400 text-sm mt-1">This may take a moment</p>
      </div>

      <!-- PDF Preview -->
      <div v-else-if="pdfBlobUrl" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 class="text-lg font-semibold text-neutral-900">PDF Preview</h2>
          <div class="flex items-center gap-2">
            <button
              @click="downloadPdf"
              class="bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white px-4 py-1.5 rounded-lg flex items-center text-sm transition-all duration-200"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-1.5" />
              Download
            </button>
            <button
              @click="clearPreview"
              class="bg-white/80 hover:bg-white text-neutral-700 px-4 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 flex items-center text-sm transition-all duration-200"
            >
              <XMarkIcon class="w-4 h-4 mr-1.5" />
              Close
            </button>
          </div>
        </div>
        <iframe
          :src="pdfBlobUrl"
          class="w-full border-0"
          style="height: 80vh;"
          title="Catalogue PDF Preview"
        ></iframe>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center p-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20">
        <DocumentTextIcon class="w-16 h-16 text-neutral-300 mb-4" />
        <h3 class="text-xl font-semibold text-neutral-700 mb-2">No Preview Yet</h3>
        <p class="text-neutral-500 text-center max-w-md">
          Select your filter options above and click "Generate Preview" to see your product catalogue PDF before downloading.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Configs } from '@/utils/Configs'
import SwalAlert from '@/components/common/SwalAlert.vue'
import { useUserStore } from '@/stores/user'
import {
  HomeIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

const userStore = useUserStore()
const swalAlert = ref(null)

const API_BASE_URL = Configs.API_BASE_URL

// Filter state
const selectedCategory = ref('')
const inStockOnly = ref(false)
const categories = ref([])

// PDF state
const generatingPdf = ref(false)
const pdfBlobUrl = ref(null)
const pdfBlob = ref(null)

// Fetch categories for the filter dropdown
const fetchCategories = async () => {
  try {
    const token = userStore.getToken
    const response = await fetch(`${API_BASE_URL}/item-categories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    categories.value = await response.json()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

// Build the PDF endpoint URL with query params
const buildPdfUrl = () => {
  const params = new URLSearchParams()
  if (selectedCategory.value) {
    params.append('categoryId', selectedCategory.value)
  }
  if (inStockOnly.value) {
    params.append('inStockOnly', 'true')
  }
  const queryString = params.toString()
  return `${API_BASE_URL}/reports/catalogue/pdf${queryString ? '?' + queryString : ''}`
}

// Generate PDF preview
const generatePreview = async () => {
  generatingPdf.value = true
  // Clean up previous blob URL
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
    pdfBlob.value = null
  }

  try {
    const token = userStore.getToken
    const response = await fetch(buildPdfUrl(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    pdfBlob.value = blob
    pdfBlobUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error('Failed to generate catalogue PDF:', err)
    swalAlert.value?.showError('PDF Generation Failed', err.message || 'An error occurred while generating the catalogue PDF')
  } finally {
    generatingPdf.value = false
  }
}

// Download the PDF
const downloadPdf = () => {
  if (!pdfBlobUrl.value) return

  const link = document.createElement('a')
  link.href = pdfBlobUrl.value
  link.download = `catalogue-${new Date().toISOString().split('T')[0]}.pdf`
  link.click()
}

// Clear preview
const clearPreview = () => {
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
    pdfBlob.value = null
  }
}

// Lifecycle
onMounted(() => {
  fetchCategories()
})

onUnmounted(() => {
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
  }
})
</script>
