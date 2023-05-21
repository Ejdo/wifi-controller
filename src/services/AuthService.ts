import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiToken, LoginCredentials, User } from 'src/models';
import { api } from 'src/boot/axios';

class AuthService {
  async me(dontTriggerLogout = false): Promise<User | null> {
    return api
      .get('users/user/', { dontTriggerLogout } as AxiosRequestConfig)
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }
        return Promise.reject(error);
      });
  }

  async login(credentials: LoginCredentials): Promise<ApiToken> {
    const response = await api.post<ApiToken>('users/token/', credentials);
    return response.data;
  }
}

export default new AuthService();
