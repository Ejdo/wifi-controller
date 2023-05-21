export interface ApiToken {
  type: 'X-CSRFToken';
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
}
