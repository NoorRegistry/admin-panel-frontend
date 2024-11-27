export interface IGlobalState {
  isAppReady: boolean;
  isAuthenticated: boolean;
}

export interface IGlobalActions {
  signIn: () => void;
  signOut: () => void;
  setIsAppReady: () => void;
}
