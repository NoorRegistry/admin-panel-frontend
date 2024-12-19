export interface IGlobalState {
  isAppReady: boolean;
  isAuthenticated: boolean;
  showStoreProducts: { open: boolean; storeId?: string };
}

export interface IGlobalActions {
  signIn: () => void;
  signOut: () => void;
  setIsAppReady: () => void;
  setShowStoreProducts: (open: boolean, storeId?: string) => void;
}
