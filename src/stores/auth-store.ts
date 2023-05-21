import { defineStore } from 'pinia';
import { User } from 'src/models';
import { authService, authManager } from 'src/services';
import { LoginCredentials } from 'src/models/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    getName: (state) => state.user.username
  },
  actions: {
    async check() {
      try {
        this.user = await authService.me();
        return this.user !== null;
      } catch (err) {
        throw err;
      }
    },
    async login(credentials: LoginCredentials) {
      try {
        const apiToken = await authService.login(credentials);
        authManager.setToken(apiToken.token);
        return apiToken;
      } catch (err) {
        throw err;
      }
    },
    async logout() {
      try {
        authManager.removeToken();
        this.user = null;
      } catch (err) {
        throw err;
      }
    }
  }
});
