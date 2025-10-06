import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define User and AuthState types
export interface User {
  id?: string;
  name?: string;
  email?: string | null;
  mobile?: string;
  role?: string;
  access_token?: string;
  token_type?: string;
  isAuthenticated?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Async thunk for signup
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (
    { name, email, mobile, role, password }: { name: string; email: string | null; mobile: string; role: string; password: string | null },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/create-admin', {
        name,
        email,
        mobile,
        role,
        password,
      });
      return response?.data as User;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (
    {
      username,
      password,
    }: { username: string; password: string;},
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/admin-login', {
        username,
        password,
      });
      return response?.data as User;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Signup cases
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = { ...action.payload, isAuthenticated: true };
        state.error = null;

        // Store auth token in localStorage
        if (typeof window !== 'undefined' && action.payload.access_token && action.payload.token_type) {
          localStorage.setItem('token', action.payload.access_token);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Admin login cases
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = { ...action.payload, isAuthenticated: true };
        state.error = null;

        // Store auth token in localStorage
        if (typeof window !== 'undefined' && action.payload.access_token && action.payload.token_type) {
          localStorage.setItem('token', action.payload.access_token);
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;