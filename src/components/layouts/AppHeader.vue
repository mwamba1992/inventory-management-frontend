<template>
  <header class="bg-brand-600 text-white shadow-soft">
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 w-full">
        <!-- Left side - Logo and Title -->
        <div class="flex items-center space-x-3 flex-shrink-0">
          <!-- Logo -->
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-xl font-semibold text-white whitespace-nowrap">
            Global Authentic TZ
          </h1>
        </div>

        <!-- Right side - Search and User -->
        <div class="flex items-center space-x-4 flex-shrink-0 ml-auto">
          <!-- Quick search -->
          <div class="hidden lg:block relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Quick search..."
              class="bg-brand-500 border border-brand-400 rounded-xl px-4 py-2 text-white placeholder-brand-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-brand-500 transition-all duration-200 w-48"
            />
            <MagnifyingGlassIcon class="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-200" />
          </div>

          <!-- Notifications -->
          <button class="relative p-2 text-brand-100 hover:text-white hover:bg-brand-500 rounded-xl transition-all duration-200">
            <BellIcon class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
              <span class="text-xs text-white font-bold">3</span>
            </span>
          </button>

          <!-- User Profile -->
          <div class="relative" ref="profileDropdown">
            <button
              @click="toggleProfileMenu"
              class="flex items-center space-x-2 text-brand-100 hover:text-white hover:bg-brand-500 rounded-xl px-3 py-2 transition-all duration-200"
            >
              <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-white" />
              </div>
              <span class="hidden sm:block text-sm font-medium whitespace-nowrap">{{ userName}}</span>
              <ChevronDownIcon
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': profileMenuOpen }"
              />
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="profileMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft-lg border border-neutral-200 z-50 overflow-hidden"
              >
                <div class="px-4 py-3 border-b border-neutral-100">
                  <p class="text-sm font-medium text-neutral-900">{{ currentUser.name }}</p>
                  <p class="text-xs text-neutral-600">{{ currentUser.email }}</p>
                </div>

                <div class="py-1">
                  <a href="#" class="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <UserCircleIcon class="w-4 h-4 mr-3 text-neutral-400" />
                    Profile
                  </a>
                  <a href="#" class="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <Cog6ToothIcon class="w-4 h-4 mr-3 text-neutral-400" />
                    Settings
                  </a>
                  <div class="border-t border-neutral-100"></div>
                  <button
                    @click="logout"
                    class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// Reactive data
const searchQuery = ref('')
const profileMenuOpen = ref(false)
const profileDropdown = ref(null)
const userName = ref('')

// User data (this would typically come from a store/API)
const currentUser = ref({
  name: 'John Doe',
  email: 'john.doe@mwendavano.com',
  role: 'Administrator'
})

// Methods
const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

const logout = () => {
  // Close any open menus
  profileMenuOpen.value = false

  // Implement logout logic
  console.log('Logout clicked')
  useUserStore().clearUser()
  router.push('/login')
}

// Click outside to close menus
const handleClickOutside = (event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
    profileMenuOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  userName.value = useUserStore().getName;
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
