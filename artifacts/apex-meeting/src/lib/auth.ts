import { create } from 'zustand';
import { setAuthTokenGetter } from '@workspace/api-client-react';

const TOKEN_KEY = 'apex_meeting_token';

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>((set) => {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  
  return {
    token: storedToken,
    isAuthenticated: !!storedToken,
    setToken: (token) => {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      set({ token, isAuthenticated: !!token });
    },
    clearToken: () => {
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, isAuthenticated: false });
    },
  };
});

// Configure API client to use token from store
setAuthTokenGetter(() => {
  const token = useAuthStore.getState().token;
  return token || undefined;
});
