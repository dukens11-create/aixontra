import { create } from 'zustand';
import { Profile } from '@/types';
import { supabaseBrowser } from '@/lib/supabase/browser';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setUser: (user) => {
    set({ user, isLoading: false });
  },

  setSession: (session) => {
    set({ session });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setInitialized: (isInitialized) => {
    set({ isInitialized });
  },

  signOut: async () => {
    try {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  refreshUser: async () => {
    try {
      set({ isLoading: true });
      const supabase = supabaseBrowser();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: null, session: null, isLoading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({ 
        user: profile, 
        session,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error refreshing user:', error);
      set({ user: null, session: null, isLoading: false });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectSession = (state: AuthStore) => state.session;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsAuthenticated = (state: AuthStore) => !!state.user;
export const selectIsAdmin = (state: AuthStore) => state.user?.role === 'admin';
