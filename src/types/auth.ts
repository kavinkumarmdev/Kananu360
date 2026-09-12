export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  avatar?: string;
  pin?: string;
  currency?: string;
  role?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type AuthMode = 'login' | 'pin';

export interface LoginCredentials {
  emailOrUsername: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  username?: string;
  email: string;
  password?: string;
  pin?: string;
  currency?: string;
  role?: string;
}

