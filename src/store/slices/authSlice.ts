import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  authenticated: boolean;
  user: User | null;
};

const initialState: AuthState = {
  authenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.authenticated = true;
    },
    logout(state) {
      state.user = null;
      state.authenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
