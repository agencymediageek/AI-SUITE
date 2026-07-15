import { create } from 'zustand';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ai_suite_token');
  }
  return null;
};

export const useAuth = create<AuthState>((set) => ({
  token: getInitialToken(),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('ai_suite_token', token);
    } else {
      localStorage.removeItem('ai_suite_token');
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('ai_suite_token');
    set({ token: null });
  },
}));

// Setup token getter for API client
setAuthTokenGetter(() => useAuth.getState().token);
