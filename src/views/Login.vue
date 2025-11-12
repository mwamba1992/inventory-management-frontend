<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <!-- Login Container -->
    <div class="w-full max-w-md">
      <!-- Logo and Branding -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
        <p class="text-gray-600">Sign in to Mwendavano Inventory System</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your email"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email }"
            />
            <p class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 pr-10"
                placeholder="Enter your password"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            <a href="#" class="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </span>
            <span v-else>
              Sign In
            </span>
          </button>

          <!-- Error Message -->
          <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex items-center">
              <ExclamationTriangleIcon class="w-5 h-5 text-red-400 mr-2" />
              <p class="text-sm text-red-700">{{ loginError }}</p>
            </div>
          </div>
        </form>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a href="#" class="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">
            Sign up here
          </a>
        </p>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500">
          © 2025 Mwendavano Inventory System. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import router from '@/router'
import { SetupService as LoginService } from '@/services/LoginService'
import { useUserStore } from '@/stores/user'

// Reactive form data
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Component state
const loading = ref(false)
const showPassword = ref(false)
const loginError = ref('')
const errors = reactive({
  email: '',
  password: ''
})

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = () => {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }

  return true
}

const user = useUserStore();


// Login handler
async function handleLogin() {
  loading.value = true;
  try {
    const response = await LoginService.login(form.email, form.password);

    if (response && response.access_token) {
      let userDetails = base64UrlDecode(response.access_token.split('.')[1]);
      user.setUser({
        id: userDetails.sub,
        name: userDetails.username,
        permissions: userDetails.permissions.map((permission) => permission.name),
        token: response.access_token,
        refreshToken: response.refresh_token
      });
      await router.push('/');
    } else {
      loginError.value = 'Invalid credentials';
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    loginError.value = 'Login failed: ' + error.message;
  } finally {
    loading.value = false;
  }
}


// Decode Base64URL strings
function base64UrlDecode(base64Url) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(base64);
  return JSON.parse(decoded);
}

</script>
