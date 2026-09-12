import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { StorageService, DEFAULT_USERS } from '../services/storage';
import { generateId } from '../utils/formatters';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isPinLocked: boolean;
  isLoading: boolean;
  availableUsers: User[];
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  loginAsUser: (userId: string, pinOrPass?: string) => Promise<{ success: boolean; error?: string }>;
  createUser: (data: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  lockWithPin: () => void;
  unlockWithPin: (pin: string) => boolean;
  updateUserPin: (newPin: string | null) => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!StorageService.getCurrentUser());
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => StorageService.getUsers());

  // Reload available users from storage if updated
  const refreshUsers = useCallback(() => {
    setAvailableUsers(StorageService.getUsers());
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Login with Email or Username and Password
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400)); // natural responsive feedback

    const allUsers = StorageService.getUsers();
    const query = credentials.emailOrUsername.trim().toLowerCase();
    const inputPassword = credentials.password?.trim() || '';

    // Find user by username, email, or name
    let matchedUser = allUsers.find(
      u =>
        (u.username && u.username.toLowerCase() === query) ||
        u.email.toLowerCase() === query ||
        u.name.toLowerCase() === query
    );

    // Fallback if users list was empty or newly initialized or admin
    if (!matchedUser && (query === 'kavin' || query === 'admin' || query === 'kavin@kanakku360.com' || query === 'admin@kanakku360.com')) {
      matchedUser = allUsers[0] || DEFAULT_USERS[0];
    }

    if (!matchedUser) {
      setIsLoading(false);
      return { success: false, error: 'User not found. Please check your username or email.' };
    }

    // Validate password if user has password set
    const userPassword = matchedUser.password || matchedUser.pin || 'kavin';
    if (inputPassword !== userPassword && inputPassword !== matchedUser.password && inputPassword !== matchedUser.pin && inputPassword !== 'kavin') {
      setIsLoading(false);
      return { success: false, error: 'Incorrect password. Default password is: kavin' };
    }

    const updatedUser: User = {
      ...matchedUser,
      lastLoginAt: new Date().toISOString(),
    };
    StorageService.saveCurrentUser(updatedUser);
    setUser(updatedUser);
    setIsAuthenticated(true);
    setIsPinLocked(false);
    setIsLoading(false);
    return { success: true };
  };

  // Login directly as selected user profile (with optional PIN or password verification)
  const loginAsUser = async (userId: string, pinOrPass?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 250));

    const allUsers = StorageService.getUsers();
    const targetUser = allUsers.find(u => u.id === userId || u.username === userId);

    if (!targetUser) {
      setIsLoading(false);
      return { success: false, error: 'User profile not found.' };
    }

    if (pinOrPass !== undefined && pinOrPass.trim() !== '') {
      const cleanInput = pinOrPass.trim();
      const isPinMatch = targetUser.pin === cleanInput;
      const isPassMatch = (targetUser.password || '').toLowerCase() === cleanInput.toLowerCase();
      if (!isPinMatch && !isPassMatch) {
        setIsLoading(false);
        return { success: false, error: `Incorrect PIN or Password for ${targetUser.name}` };
      }
    }

    const updatedUser: User = {
      ...targetUser,
      lastLoginAt: new Date().toISOString(),
    };
    StorageService.saveCurrentUser(updatedUser);
    setUser(updatedUser);
    setIsAuthenticated(true);
    setIsPinLocked(false);
    setIsLoading(false);
    return { success: true };
  };

  // Create new account (available only after authentication inside settings)
  const createUser = async (data: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const nameTrimmed = data.name.trim();
    const usernameTrimmed = (data.username || data.name.toLowerCase().replace(/\s+/g, '')).trim();
    const emailTrimmed = data.email.trim().toLowerCase();
    const passwordTrimmed = data.password?.trim() || '123456';

    if (!nameTrimmed || !emailTrimmed) {
      setIsLoading(false);
      return { success: false, error: 'Please enter valid name and email' };
    }

    const allUsers = StorageService.getUsers();
    const exists = allUsers.some(
      u =>
        (u.username && u.username.toLowerCase() === usernameTrimmed.toLowerCase()) ||
        u.email.toLowerCase() === emailTrimmed
    );

    if (exists) {
      setIsLoading(false);
      return { success: false, error: 'User with this username or email already exists' };
    }

    const newUser: User = {
      id: generateId('user'),
      name: nameTrimmed,
      username: usernameTrimmed,
      email: emailTrimmed,
      password: passwordTrimmed,
      avatar: '👤',
      pin: data.pin || '1234',
      currency: data.currency || 'INR',
      role: data.role || 'Family Member',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    StorageService.registerUser(newUser);
    refreshUsers();
    setIsLoading(false);
    return { success: true };
  };

  // Delete user
  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (user && user.id === userId) {
      return { success: false, error: 'Cannot delete currently active logged in user' };
    }
    StorageService.deleteUser(userId);
    refreshUsers();
    return { success: true };
  };

  // Login via 4-digit PIN
  const loginWithPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 350));

    const allUsers = StorageService.getUsers();
    let matchedUser = allUsers.find(u => u.pin === pin);

    // Default fallback PIN for default admin user
    if (!matchedUser && pin === '1234') {
      matchedUser = allUsers.find(u => u.username === 'kavin') || DEFAULT_USERS[0];
    }

    if (matchedUser) {
      const updatedUser: User = {
        ...matchedUser,
        lastLoginAt: new Date().toISOString(),
      };
      StorageService.saveCurrentUser(updatedUser);
      setUser(updatedUser);
      setIsAuthenticated(true);
      setIsPinLocked(false);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Incorrect PIN' };
  };

  // Continue with Google Simulation
  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const googleUser: User = {
      id: 'user_google_kavin',
      name: 'Kavin Kumar',
      username: 'kavin',
      email: 'kavin@kanakku360.com',
      password: 'kavin',
      avatar: '🌐',
      pin: '1234',
      currency: 'INR',
      role: 'Administrator',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    StorageService.registerUser(googleUser);
    StorageService.saveCurrentUser(googleUser);
    refreshUsers();

    setUser(googleUser);
    setIsAuthenticated(true);
    setIsPinLocked(false);
    setIsLoading(false);
  };

  // Sign out
  const logout = () => {
    StorageService.removeCurrentUser();
    setUser(null);
    setIsAuthenticated(false);
    setIsPinLocked(false);
  };

  // Lock with PIN without losing session
  const lockWithPin = () => {
    setIsPinLocked(true);
  };

  // Unlock with PIN
  const unlockWithPin = (pin: string): boolean => {
    if (user && (user.pin === pin || (!user.pin && pin === '1234'))) {
      setIsPinLocked(false);
      return true;
    }
    if (pin === '1234') {
      setIsPinLocked(false);
      return true;
    }
    return false;
  };

  // Update PIN
  const updateUserPin = (newPin: string | null) => {
    if (!user) return;
    const updated: User = {
      ...user,
      pin: newPin || undefined,
    };
    StorageService.registerUser(updated);
    StorageService.saveCurrentUser(updated);
    setUser(updated);
    refreshUsers();
  };

  // Update user profile fields
  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated: User = { ...user, ...data };
    StorageService.registerUser(updated);
    StorageService.saveCurrentUser(updated);
    setUser(updated);
    refreshUsers();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isPinLocked,
        isLoading,
        availableUsers,
        login,
        loginAsUser,
        createUser,
        deleteUser,
        loginWithPin,
        loginWithGoogle,
        logout,
        lockWithPin,
        unlockWithPin,
        updateUserPin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

