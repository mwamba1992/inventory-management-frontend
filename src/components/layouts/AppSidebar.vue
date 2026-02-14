<template>
  <aside class="bg-white shadow-soft w-64 min-h-screen border-r border-neutral-100">
    <div class="p-6">
      <!-- Brand Logo/Header -->
      <div class="mb-8 pb-6 border-b border-neutral-100">
        <h1 class="text-xl font-bold text-neutral-900">Global Authentic TZ</h1>
        <p class="text-xs text-neutral-500 mt-1">Inventory Portal</p>
      </div>

      <nav class="space-y-1">
        <div v-for="item in sidebarItems" :key="item.key" class="mb-1">
          <!-- Menu with sub-items -->
          <div v-if="item.subItems">
            <div
              class="sidebar-item"
              :class="isMenuActive(item.key) ? 'sidebar-item-active' : 'sidebar-item-inactive'"
              @click="toggleSubMenu(item.key)"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3 flex-shrink-0" />
              <span class="flex-1">{{ item.label }}</span>
              <ChevronDownIcon
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus[item.key] }"
              />
            </div>

            <!-- Submenu items -->
            <div v-if="expandedMenus[item.key]" class="ml-8 mt-2 space-y-1">
              <router-link
                v-for="subItem in item.subItems"
                :key="subItem.key"
                :to="subItem.route"
                class="block w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200"
                :class="
                  isSubItemActive(subItem.route)
                    ? 'bg-brand-100 text-brand-700 font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                "
              >
                <span class="mr-2 text-neutral-400">→</span>{{ subItem.label }}
              </router-link>
            </div>
          </div>

          <!-- Menu without sub-items -->
          <router-link
            v-else
            :to="item.route"
            class="sidebar-item"
            :class="isActive(item.route) ? 'sidebar-item-active' : 'sidebar-item-inactive'"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  CogIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EyeIcon,
  HomeIcon,
  PresentationChartLineIcon,
  QuestionMarkCircleIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()

// Track open submenus
const expandedMenus = ref({})

// Sidebar menu config
const sidebarItems = [
  { icon: HomeIcon, label: 'Dashboard', key: 'dashboard', route: '/' },
  { icon: CurrencyDollarIcon, label: 'Sales', key: 'pos-sales', route: '/pos-sales' },
  { icon: CurrencyDollarIcon, label: 'Expenses', key: 'expense', route: '/expense' },
  { icon: UsersIcon, label: 'Customers', key: 'customers', route: '/customers' },
  {
    icon: CubeIcon,
    label: 'Items',
    key: 'items',
    route: '/items',
    subItems: [
      { label: 'Items', key: 'items', route: '/items/item' },
      { label: 'Items-Price', key: 'item-price', route: '/items/item-price' },
      { label: 'Inventory', key: 'inventory', route: '/items/inventory' },
      { label: 'Accounts Mapping', key: 'accounts', route: '/items/account-mappings' },
    ],
  },
  {
    icon: CogIcon,
    label: 'Settings',
    key: 'settings',
    route: '/settings',
    subItems: [
      { label: 'Common', key: 'common', route: '/settings/common' },
      { label: 'Item Suppliers', key: 'item-suppliers', route: '/settings/suppliers' },
      { label: 'Color Categories', key: 'color-categories', route: '/settings/color-categories' },
      { label: 'Brands', key: 'brands', route: '/settings/brands' },
      { label: 'Warehouses', key: 'warehouses', route: '/settings/warehouses' },
      { label: 'Businesses', key: 'businesses', route: '/settings/businesses' },
      { label: 'Accounts', key: 'accounts', route: '/settings/accounts' },
    ],
  },
  {
    icon: UsersIcon,
    label: 'User Management',
    key: 'users',
    route: '/users',
    subItems: [
      { label: 'Users', key: 'users', route: '/users/user' },
      { label: 'Roles', key: 'users', route: '/users/roles' },
    ],
  },
  {
    icon: DocumentTextIcon,
    label: 'Reports',
    key: 'reports',
    route: '/reports',
    subItems: [
      { label: 'All Reports', key: 'all-reports', route: '/reports' },
      { label: 'Balance Sheet', key: 'balance-sheet', route: '/reports/balance-sheet' },
      { label: 'Product Catalogue', key: 'catalogue', route: '/reports/catalogue' },
    ],
  },
  { icon: ChatBubbleLeftRightIcon, label: 'WhatsApp Orders', key: 'whatsapp-orders', route: '/whatsapp-orders' },
  { icon: QuestionMarkCircleIcon, label: 'Help and Support', key: 'help', route: '/help' },
]

// Is this route exactly active?
const isActive = (routePath) => route.path === routePath

// Is this submenu active based on current route?
const isMenuActive = (menuKey) => {
  const item = sidebarItems.find((i) => i.key === menuKey)
  return item && route.path.startsWith(item.route)
}

// Is specific submenu item active?
const isSubItemActive = (routePath) => route.path === routePath

// Toggle submenu open/close
const toggleSubMenu = (menuKey) => {
  expandedMenus.value[menuKey] = !expandedMenus.value[menuKey]
}

// Auto-open correct submenu based on current route
watch(
  () => route.path,
  (newPath) => {
    sidebarItems.forEach((item) => {
      if (item.subItems && newPath.startsWith(item.route)) {
        expandedMenus.value[item.key] = true
      }
    })
  },
  { immediate: true }
)
</script>

<style scoped>
.sidebar-item {
  @apply flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium text-sm;
}

.sidebar-item-active {
  @apply bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3;
}

.sidebar-item-inactive {
  @apply text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
