<template>
  <SwalAlert ref="swalAlert" />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-500 mb-6">
        <HomeIcon class="w-4 h-4 mr-2" />
        <span>Home</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span>System</span>
        <ChevronRightIcon class="w-4 h-4 mx-2" />
        <span class="text-gray-700 font-medium">Users</span>
      </div>

      <!-- Header Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              User Management
            </h1>
            <p class="text-gray-600 mt-2">Manage system users, roles and permissions</p>
          </div>
          <div class="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              @click="refreshUsers"
              :disabled="loading"
              class="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
            <button
              @click="openAddModal"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <UsersIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeUsers }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-xl">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Logged In</p>
              <p class="text-2xl font-bold text-gray-900">{{ loggedInUsers }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-xl">
              <UserIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">New Accounts</p>
              <p class="text-2xl font-bold text-gray-900">{{ newAccounts }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <UserPlusIcon class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Users Table -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">

        <div class="p-6 border-b border-gray-200/50">
          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-700">Show</span>
                <select
                  v-model="entriesPerPage"
                  @change="currentPage = 1"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="text-sm font-medium text-gray-700">entries</span>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  v-model="searchTerm"
                  @input="currentPage = 1"
                  type="text"
                  placeholder="Search users..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
            <tr>
              <th class="p-4 text-left">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectAll"
                  @change="handleSelectAll"
                />
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('id')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">ID</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th
                class="p-4 text-left cursor-pointer hover:bg-gray-100/50 transition-colors duration-200"
                @click="sortBy('username')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">User</span>
                  <ArrowsUpDownIcon class="w-4 h-4 text-gray-400" />
                </div>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Contact Info</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Roles</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Status</span>
              </th>
              <th class="p-4 text-left">
                <span class="text-sm font-semibold text-gray-900">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
            <tr v-if="loading">
              <td colspan="7" class="p-12 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Loading users...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="7" class="p-12 text-center text-gray-500">
                <UsersIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p class="text-lg font-medium">
                  {{ searchTerm ? 'No users found' : 'No users yet' }}
                </p>
                <p class="text-sm">
                  {{
                    searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Create your first user to get started'
                  }}
                </p>
              </td>
            </tr>
            <tr
              v-else
              v-for="user in paginatedUsers"
              :key="user.id"
              class="hover:bg-gray-50/50 transition-colors duration-200"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :checked="selectedItems.has(user.id)"
                  @change="handleSelectItem(user.id, $event.target.checked)"
                />
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-900">#{{ user.id }}</span>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center relative"
                  >
                      <span class="text-white text-sm font-semibold">{{
                          user.name.charAt(0).toUpperCase()
                        }}</span>
                    <div
                      v-if="user.isLoggedIn"
                      class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
                      title="Currently logged in"
                    ></div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-500">@{{ user.username }}</p>
                    <p v-if="user.checkNumber" class="text-xs text-blue-600">
                      Check #{{ user.checkNumber }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="space-y-1">
                  <p class="text-xs text-gray-600 flex items-center">
                    <EnvelopeIcon class="w-3 h-3 mr-1 text-gray-400" />
                    {{ user.email }}
                  </p>
                  <p v-if="user.mobileNumber" class="text-xs text-gray-600 flex items-center">
                    <PhoneIcon class="w-3 h-3 mr-1 text-gray-400" />
                    {{ user.mobileNumber }}
                  </p>
                  <p v-if="user.address" class="text-xs text-gray-600 flex items-center">
                    <MapPinIcon class="w-3 h-3 mr-1 text-gray-400" />
                    <span class="max-w-xs truncate">{{ user.address }}</span>
                  </p>
                </div>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                    <span
                      v-for="role in user.rolesList || []"
                      :key="role.id"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {{ role.name }}
                    </span>
                  <span v-if="!user.rolesList || user.rolesList.length === 0" class="text-xs text-gray-400">
                      No roles assigned
                    </span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex flex-col space-y-1">
                    <span
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': user.enabled,
                        'bg-red-100 text-red-800': !user.enabled
                      }"
                    >
                      {{ user.enabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  <span
                    v-if="user.newAccount"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                      New Account
                    </span>
                  <span
                    v-if="!user.accountNonLocked"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                      Locked
                    </span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(user)"
                    class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit User"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewUserDetails(user)"
                    class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="View Details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    class="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                    :title="user.enabled ? 'Disable User' : 'Enable User'"
                  >
                    <LockClosedIcon v-if="user.enabled" class="w-4 h-4" />
                    <LockOpenIcon v-else class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete User"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Section -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-t border-gray-200/50"
        >
          <div class="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {{ startIndex }} to {{ endIndex }} of {{ filteredUsers.length }} entries
          </div>

          <div v-if="totalPages > 1" class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors duration-200"
                :class="
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                "
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Selection Info -->
        <div
          v-if="selectedItems.size > 0"
          class="mx-6 mb-6 p-4 bg-blue-50/50 border border-blue-200 rounded-xl"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-blue-700">
              {{ selectedItems.size }} user{{ selectedItems.size !== 1 ? 's' : '' }} selected
            </p>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkDelete"
                class="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Edit User' : 'Create New User' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveUser" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon class="w-5 h-5 mr-2" />
                  Basic Information
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                <input
                  v-model="form.username"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <div class="relative">
                  <EnvelopeIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                <div class="relative">
                  <PhoneIcon
                    class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="form.mobileNumber"
                    type="tel"
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <div class="relative">
                  <MapPinIcon
                    class="w-5 h-5 absolute left-3 top-3 text-gray-400"
                  />
                  <textarea
                    v-model="form.address"
                    rows="2"
                    required
                    class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter full address"
                  ></textarea>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Check Number</label>
                <input
                  v-model="form.checkNumber"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Employee check number"
                />
              </div>

              <div v-if="!isEditing">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input
                  v-model="form.password"
                  type="password"
                  :required="!isEditing"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter password"
                />
              </div>

              <!-- Role Assignment -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon class="w-5 h-5 mr-2" />
                  Role Assignment
                </h4>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Roles</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div
                    v-for="role in availableRoles"
                    :key="role.id"
                    class="flex items-center"
                  >
                    <input
                      :id="`role-${role.id}`"
                      v-model="form.selectedRoles"
                      :value="role.id"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      :for="`role-${role.id}`"
                      class="ml-2 text-sm text-gray-700 cursor-pointer"
                    >
                      {{ role.name }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Account Settings -->
              <div class="md:col-span-2">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CogIcon class="w-5 h-5 mr-2" />
                  Account Settings
                </h4>
              </div>

              <div class="md:col-span-2">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="flex items-center">
                    <input
                      id="enabled"
                      v-model="form.enabled"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="enabled" class="ml-2 text-sm text-gray-700">
                      Enabled
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="newAccount"
                      v-model="form.newAccount"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="newAccount" class="ml-2 text-sm text-gray-700">
                      New Account
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="accountNonExpired"
                      v-model="form.accountNonExpired"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="accountNonExpired" class="ml-2 text-sm text-gray-700">
                      Non-Expired
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="accountNonLocked"
                      v-model="form.accountNonLocked"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="accountNonLocked" class="ml-2 text-sm text-gray-700">
                      Non-Locked
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="credentialsNonExpired"
                      v-model="form.credentialsNonExpired"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="credentialsNonExpired" class="ml-2 text-sm text-gray-700">
                      Credentials Valid
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <span v-if="submitting" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ isEditing ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>
                  {{ isEditing ? 'Update User' : 'Create User' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-600 mr-3" />
              <h3 class="text-lg font-bold text-gray-900">Delete User</h3>
            </div>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete user "{{ userToDelete?.name }}" (@{{ userToDelete?.username }})? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                :disabled="submitting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50"
              >
                <span v-if="submitting" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  HomeIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  UserIcon,
  UserPlusIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  CogIcon,
} from '@heroicons/vue/24/outline'

import SwalAlert from '@/components/common/SwalAlert.vue'

// Create a ref to the SwalAlert component
const swalAlert = ref(null)

// API Configuration
const API_BASE_URL = 'http://localhost:3000'

// Reactive data
const users = ref([])
const availableRoles = ref([])
const searchTerm = ref('')
const entriesPerPage = ref(10)
const currentPage = ref(1)
const selectedItems = ref(new Set())
const selectAll = ref(false)
const sortField = ref('')
const sortDirection = ref('asc')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const userToDelete = ref(null)

// Form data
const form = ref({
  id: null,
  username: '',
  name: '',
  email: '',
  password: '',
  address: '',
  mobileNumber: '',
  checkNumber: '',
  enabled: true,
  newAccount: true,
  accountNonExpired: true,
  accountNonLocked: true,
  credentialsNonExpired: true,
  isLoggedIn: false,
  loginAttempt: 0,
  selectedRoles: [],
})

// API Functions
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error('API call failed:', err)
    throw err
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiCall('/users')
    users.value = data
  } catch (err) {
    swalAlert.value?.showError('Failed to fetch users', err.message)
    error.value = `Failed to fetch users: ${err.message}`
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const data = await apiCall('/roles')
    availableRoles.value = data
  } catch (err) {
    console.error('Failed to fetch roles:', err)
    // Fallback roles if API fails
    availableRoles.value = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Manager' },
      { id: 3, name: 'User' },
      { id: 4, name: 'Viewer' }
    ]
  }
}

const createUser = async (userData) => {
  submitting.value = true
  try {
    const newUser = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    users.value.push(newUser)
    swalAlert.value?.showSuccess('User created successfully')
    return newUser
  } catch (err) {
    swalAlert.value?.showError('Failed to create user', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const updateUser = async (id, userData) => {
  submitting.value = true
  try {
    const updatedUser = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    swalAlert.value?.showSuccess('User updated successfully')
    return updatedUser
  } catch (err) {
    swalAlert.value?.showError('Failed to update user', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const deleteUserApi = async (id) => {
  submitting.value = true
  try {
    await apiCall(`/users/${id}`, {
      method: 'DELETE',
    })
    users.value = users.value.filter((u) => u.id !== id)
    selectedItems.value.delete(id)
    swalAlert.value?.showSuccess('User deleted successfully')
  } catch (err) {
    swalAlert.value?.showError('Failed to delete user', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

const toggleUserStatusApi = async (id, enabled) => {
  submitting.value = true
  try {
    const updatedUser = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    })
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    swalAlert.value?.showSuccess(`User ${enabled ? 'enabled' : 'disabled'} successfully`)
    return updatedUser
  } catch (err) {
    swalAlert.value?.showError('Failed to update user status', err.message)
    throw err
  } finally {
    submitting.value = false
  }
}

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (user.mobileNumber && user.mobileNumber.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (user.checkNumber && user.checkNumber.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
      (user.address && user.address.toLowerCase().includes(searchTerm.value.toLowerCase()))
  )

  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value] || ''
      let bVal = b[sortField.value] || ''

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value
  return filteredUsers.value.slice(start, start + entriesPerPage.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / entriesPerPage.value)
})

const startIndex = computed(() => {
  return filteredUsers.value.length > 0
    ? (currentPage.value - 1) * entriesPerPage.value + 1
    : 0
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * entriesPerPage.value, filteredUsers.value.length)
})

// Stats computed properties
const activeUsers = computed(() => {
  return users.value.filter((u) => u.enabled).length
})

const loggedInUsers = computed(() => {
  return users.value.filter((u) => u.isLoggedIn).length
})

const newAccounts = computed(() => {
  return users.value.filter((u) => u.newAccount).length
})

// Table selection methods
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set()
    selectAll.value = false
  } else {
    selectedItems.value = new Set(paginatedUsers.value.map((user) => user.id))
    selectAll.value = true
  }
}

const handleSelectItem = (userId, checked) => {
  const newSelected = new Set(selectedItems.value)
  if (checked) {
    newSelected.add(userId)
  } else {
    newSelected.delete(userId)
  }
  selectedItems.value = newSelected
  selectAll.value =
    newSelected.size === paginatedUsers.value.length && paginatedUsers.value.length > 0
}

// Sorting methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Pagination methods
const goToPage = (page) => {
  currentPage.value = page
  selectedItems.value = new Set()
  selectAll.value = false
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const getPageNumbers = () => {
  const pageNumbers = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return pageNumbers
}

// CRUD Operations
const openAddModal = () => {
  isEditing.value = false
  form.value = {
    id: null,
    username: '',
    name: '',
    email: '',
    password: '',
    address: '',
    mobileNumber: '',
    checkNumber: '',
    enabled: true,
    newAccount: true,
    accountNonExpired: true,
    accountNonLocked: true,
    credentialsNonExpired: true,
    isLoggedIn: false,
    loginAttempt: 0,
    selectedRoles: [],
  }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditing.value = true
  form.value = {
    ...user,
    selectedRoles: user.rolesList ? user.rolesList.map(role => role.id) : [],
    password: '' // Don't populate password for editing
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    username: '',
    name: '',
    email: '',
    password: '',
    address: '',
    mobileNumber: '',
    checkNumber: '',
    enabled: true,
    newAccount: true,
    accountNonExpired: true,
    accountNonLocked: true,
    credentialsNonExpired: true,
    isLoggedIn: false,
    loginAttempt: 0,
    selectedRoles: [],
  }
  error.value = ''
}

const saveUser = async () => {
  try {
    // Prepare data for API
    const userData = {
      username: form.value.username,
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      mobileNumber: form.value.mobileNumber || null,
      checkNumber: form.value.checkNumber || null,
      enabled: form.value.enabled,
      newAccount: form.value.newAccount,
      accountNonExpired: form.value.accountNonExpired,
      accountNonLocked: form.value.accountNonLocked,
      credentialsNonExpired: form.value.credentialsNonExpired,
      isLoggedIn: form.value.isLoggedIn,
      loginAttempt: form.value.loginAttempt,
      roleIds: form.value.selectedRoles, // Send role IDs for backend to handle
    }

    // Only include password for new users or if explicitly provided for updates
    if (!isEditing.value && form.value.password) {
      userData.password = form.value.password
    } else if (isEditing.value && form.value.password) {
      userData.password = form.value.password
    }

    if (isEditing.value) {
      await updateUser(form.value.id, userData)
    } else {
      await createUser(userData)
    }

    closeModal()
  } catch (err) {
    // Error is already handled in the API functions
    console.error('Failed to save user:', err)
  }
}

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (userToDelete.value) {
    try {
      await deleteUserApi(userToDelete.value.id)
      showDeleteModal.value = false
      userToDelete.value = null
    } catch (err) {
      // Error is already handled in deleteUserApi
      console.error('Failed to delete user:', err)
    }
  }
}

const bulkDelete = async () => {
  if (selectedItems.value.size === 0) return

  const confirmBulkDelete = confirm(
    `Are you sure you want to delete ${selectedItems.value.size} user${
      selectedItems.value.size > 1 ? 's' : ''
    }?`
  )

  if (confirmBulkDelete) {
    const deletePromises = Array.from(selectedItems.value).map((id) => deleteUserApi(id))

    try {
      await Promise.all(deletePromises)
      selectedItems.value = new Set()
      selectAll.value = false
      swalAlert.value?.showSuccess('Selected users deleted successfully')
    } catch (err) {
      console.error('Failed to delete some users:', err)
      swalAlert.value?.showError('Failed to delete some users', 'Please try again')
    }
  }
}

const toggleUserStatus = async (user) => {
  try {
    await toggleUserStatusApi(user.id, !user.enabled)
  } catch (err) {
    console.error('Failed to toggle user status:', err)
  }
}

const viewUserDetails = (user) => {
  const roles = user.rolesList ? user.rolesList.map(role => role.name).join(', ') : 'No roles'
  const status = []
  if (user.enabled) status.push('Enabled')
  if (user.newAccount) status.push('New Account')
  if (!user.accountNonLocked) status.push('Locked')
  if (user.isLoggedIn) status.push('Logged In')

  alert(
    `User Details:\nName: ${user.name}\nUsername: ${user.username}\nEmail: ${user.email}\nMobile: ${user.mobileNumber || 'N/A'}\nAddress: ${user.address}\nCheck Number: ${user.checkNumber || 'N/A'}\nRoles: ${roles}\nStatus: ${status.join(', ')}\nLogin Attempts: ${user.loginAttempt || 0}`
  )
}

// Other actions
const refreshUsers = async () => {
  await fetchUsers()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchRoles()])
})
</script>
