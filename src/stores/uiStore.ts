import { create } from 'zustand';

// Modal types
type ModalType = 
  | 'upload-track'
  | 'edit-track'
  | 'create-playlist'
  | 'edit-playlist'
  | 'add-to-playlist'
  | 'edit-profile'
  | 'report'
  | null;

interface ModalData {
  trackId?: string;
  playlistId?: string;
  commentId?: string;
  [key: string]: any;
}

interface UIState {
  // Modals
  activeModal: ModalType;
  modalData: ModalData | null;
  
  // Sidebar (mobile)
  isSidebarOpen: boolean;
  
  // Loading states
  isUploading: boolean;
  uploadProgress: number;
  
  // Search
  isSearchOpen: boolean;
}

interface UIActions {
  // Modal actions
  openModal: (modal: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  // Upload actions
  setUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  
  // Search actions
  toggleSearch: () => void;
  setSearchOpen: (isOpen: boolean) => void;
  
  // Reset
  reset: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  activeModal: null,
  modalData: null,
  isSidebarOpen: false,
  isUploading: false,
  uploadProgress: 0,
  isSearchOpen: false,
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,

  // Modal actions
  openModal: (modal, data) => {
    set({ activeModal: modal, modalData: data || null });
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },

  // Upload actions
  setUploading: (isUploading) => {
    set({ isUploading, uploadProgress: isUploading ? 0 : 0 });
  },

  setUploadProgress: (progress) => {
    set({ uploadProgress: Math.max(0, Math.min(100, progress)) });
  },

  // Search actions
  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  setSearchOpen: (isOpen) => {
    set({ isSearchOpen: isOpen });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectActiveModal = (state: UIStore) => state.activeModal;
export const selectModalData = (state: UIStore) => state.modalData;
export const selectIsSidebarOpen = (state: UIStore) => state.isSidebarOpen;
export const selectIsUploading = (state: UIStore) => state.isUploading;
export const selectUploadProgress = (state: UIStore) => state.uploadProgress;
export const selectIsSearchOpen = (state: UIStore) => state.isSearchOpen;
