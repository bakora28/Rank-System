import { create } from 'zustand';
import type { Permission, User } from '@/types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
  setUser: (user: User | null) => void;
  setStatus: (status: AuthState['status']) => void;
  can: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'guest' }),
  setStatus: (status) => set({ status }),
  can: (permission) => get().user?.permissions.includes(permission) ?? false,
}));
