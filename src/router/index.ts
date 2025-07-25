import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../components/layouts/AppLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Items from '@/views/items/Items.vue'
import Reports from '@/views/Reports.vue'
import Settings from '@/views/Settings.vue'
import Inventory from '@/views/items/Inventory.vue'
import Suppliers from '@/views/settings/Suppliers.vue'
import ItemCategories from '@/views/settings/ItemCategories.vue'
import Users from '@/views/settings/Users.vue'
import Invoices from '@/views/sales/Invoices.vue'
import WareHouses from '@/views/settings/WareHouses.vue'
import Sales from '@/views/sales/Sales.vue'
import Businesses from '@/views/settings/Businesses.vue'
import Accounts from '@/views/settings/Accounts.vue'
import CommonConfigs from '@/views/settings/CommonConfigs.vue'
import ItemPrice from '@/views/items/ItemPrice.vue'
import ItemAccount from '@/views/items/ItemAccount.vue'
import Customer from '@/views/settings/Customer.vue'
import Expense from '@/views/expense/Expense.vue'
import Login from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Login route - standalone without layout
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },

    // Main application routes with AppLayout
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true }, // Add authentication guard
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard,
        },
        {
          path: '/items/item',
          name: 'Items-Stored',
          component: Items,
        },
        {
          path: '/items/item-price',
          name: 'Items-Price',
          component: ItemPrice,
        },
        {
          path: '/items/inventory',
          name: 'Items-Inventory',
          component: Inventory,
        },
        {
          path: '/items/account-mappings',
          name: 'Items-Accounts',
          component: ItemAccount,
        },
        {
          path: '/settings/suppliers',
          name: 'Settings-suppliers',
          component: Suppliers,
        },
        {
          path: '/settings/item-categories',
          name: 'Settings-item-categories',
          component: ItemCategories,
        },
        {
          path: '/settings/common',
          name: 'Settings-Common',
          component: CommonConfigs,
        },
        {
          path: '/settings/warehouses',
          name: 'Settings-warehouses',
          component: WareHouses,
        },
        {
          path: '/settings/businesses',
          name: 'Settings-businesses',
          component: Businesses,
        },
        {
          path: '/settings/accounts',
          name: 'Settings-accounts',
          component: Accounts,
        },
        {
          path: '/invoices',
          name: 'invoices',
          component: Invoices,
        },
        {
          path: '/expense',
          name: 'expense',
          component: Expense,
        },
        {
          path: '/pos-sales',
          name: 'pos-sales',
          component: Sales,
        },
        {
          path: '/customers',
          name: 'customer',
          component: Customer,
        },
        {
          path: '/users/user',
          name: 'Settings-Users',
          component: Users,
        },
        {
          path: '/reports',
          name: 'Reports',
          component: Reports,
        },
        {
          path: '/settings',
          name: 'Settings',
          component: Settings,
        },
      ],
    },

    // Catch all route - redirect to login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Check if user is authenticated (you'll need to implement this based on your auth system)
  const isAuthenticated = checkAuthStatus() // Replace with your auth check

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access login
    next('/')
  } else {
    next()
  }
})

// Helper function to check authentication status
// Replace this with your actual authentication logic
function checkAuthStatus() {
  // Example: Check for token in localStorage
  return localStorage.getItem('authToken') !== null

  // Or check Pinia/Vuex store
  // return store.getters.isAuthenticated

  // Or check cookies
  // return document.cookie.includes('authToken')
}

export default router
