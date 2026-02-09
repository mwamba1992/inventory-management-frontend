<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-sm shadow-soft border-b border-neutral-100">
      <div class="px-6 py-4">
        <div class="flex items-center text-sm text-neutral-400 mb-2">
          <HomeIcon class="w-4 h-4 mr-2" />
          <span>Home</span>
          <ChevronRightIcon class="w-4 h-4 mx-2" />
          <span class="text-neutral-700 font-medium">Settings</span>
        </div>
        <h1 class="text-3xl font-bold text-neutral-900">Settings</h1>
        <p class="text-neutral-500 mt-1">Manage your system configuration</p>
      </div>
    </div>

    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Common Settings -->
        <router-link to="/settings/common" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
            <Cog6ToothIcon class="w-6 h-6 text-brand-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Common Settings</h3>
          <p class="text-sm text-neutral-500">General system configurations and preferences</p>
        </router-link>

        <!-- Suppliers -->
        <router-link to="/settings/suppliers" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <TruckIcon class="w-6 h-6 text-emerald-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Item Suppliers</h3>
          <p class="text-sm text-neutral-500">Manage supplier information and contacts</p>
        </router-link>

        <!-- Color Categories -->
        <router-link to="/settings/color-categories" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
            <SwatchIcon class="w-6 h-6 text-violet-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Color Categories</h3>
          <p class="text-sm text-neutral-500">Define and manage item color classifications</p>
        </router-link>

        <!-- Brands -->
        <router-link to="/settings/brands" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <TagIcon class="w-6 h-6 text-amber-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Brands</h3>
          <p class="text-sm text-neutral-500">Manage product brands and manufacturers</p>
        </router-link>

        <!-- Warehouses -->
        <router-link to="/settings/warehouses" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
            <BuildingStorefrontIcon class="w-6 h-6 text-cyan-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Warehouses</h3>
          <p class="text-sm text-neutral-500">Configure warehouse locations and storage</p>
        </router-link>

        <!-- Businesses -->
        <router-link to="/settings/businesses" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
            <BuildingOfficeIcon class="w-6 h-6 text-rose-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Businesses</h3>
          <p class="text-sm text-neutral-500">Manage business entities and details</p>
        </router-link>

        <!-- Accounts -->
        <router-link to="/settings/accounts" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-soft-lg transition-all duration-300 group">
          <div class="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
            <BanknotesIcon class="w-6 h-6 text-brand-600" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-1">Accounts</h3>
          <p class="text-sm text-neutral-500">Manage financial accounts and chart of accounts</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  HomeIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  TruckIcon,
  SwatchIcon,
  TagIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'
</script>
