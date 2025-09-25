import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import { apiService } from '@/services/api';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, mobile, password }: { name: string; email: string; mobile: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await apiService.signup(name, email, mobile, password);
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      
      // Clear auth token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_type');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = { ...action.payload, isAuthenticated: true };
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

export default authSlice.reducer;