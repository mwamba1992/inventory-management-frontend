import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        id: null,
        name: null,
        token: null,
        refreshToken: null,
        permissions: [],
        businessId: null,
        businessName: null
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
        },
        getBusinessId(state) {
            return state.businessId
        },
        getBusinessName(state) {
            return state.businessName
        }
    },
    actions: {
        setUser(user) {
            this.id = user.id
            this.token = user.token
            this.name = user.name
            this.refreshToken = user.refreshToken
            this.permissions = user.permissions || []
            this.businessId = user.businessId || null
            this.businessName = user.businessName || null
        },
        clearUser() {
            this.id = null
            this.token = null
            this.name = null
            this.permissions = []
            this.refreshToken = null
            this.businessId = null
            this.businessName = null
        }
    },
    persist: true
})
