// stores/userStore.js (or wherever you define your store)

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        id: null,
        name: null,
        token: null,
        refreshToken: null,
        permissions: []
    }),
    getters: {
        getId(state) {
            return state.id
        },
        getName(state) {
            return state.name
        },
        getToken(state) {
            return state.token
        },
        getPermissions(state) {
            return state.permissions
        },
        getRefreshToken(state) {
            return state.refreshToken
        }
    },
    actions: {
        setUser(user) {
            this.id = user.id
            this.token = user.token
            this.name = user.name
            this.refreshToken = user.refreshToken
            this.permissions = user.permissions || []
        },
        clearUser() {
            this.id = null
            this.token = null
            this.name = null
            this.permissions = []
            this.refreshToken = null
        }
    },
    persist: true // Add this line to persist the state
})
