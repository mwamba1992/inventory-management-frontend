<template>
  <aside class="bg-white shadow-lg w-64 min-h-screen">
    <div class="p-4">
      <nav class="space-y-1">
        <div v-for="item in sidebarItems" :key="item.key" class="mb-1">
          <!-- Menu with sub-items -->
          <div v-if="item.subItems">
            <div
              class="sidebar-item cursor-pointer"
              :class="isMenuActive(item.key) ? 'sidebar-item-active' : 'sidebar-item-inactive'"
              @click="toggleSubMenu(item.key)"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              <span>{{ item.label }}</span>
              <ChevronDownIcon
                class="w-4 h-4 ml-auto transition-transform"
                :class="{ 'rotate-180': expandedMenus[item.key] }"
              />
            </div>

            <!-- Submenu items -->
            <div v-if="expandedMenus[item.key]" class="ml-8 mt-2 space-y-1">
              <router-link
                v-for="subItem in item.subItems"
                :key="subItem.key"
                :to="subItem.route"
                class="block w-full text-left p-2 text-sm rounded transition-colors"
                :class="
                  isSubItemActive(subItem.route)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                "
              >
                <span class="mr-2">→</span>{{ subItem.label }}
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
            <component :is="item.icon" class="w-5 h-5 mr-3" />
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
  { icon: DocumentTextIcon, label: 'Reports', key: 'reports', route: '/reports' },
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
  @apply flex items-center p-3 rounded-lg transition-colors;
}

.sidebar-item-active {
  @apply bg-blue-50 text-blue-600 border-r-4 border-blue-600;
}

.sidebar-item-inactive {
  @apply text-gray-600 hover:bg-gray-50;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
