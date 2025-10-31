import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { axiosInstance } from '@/services/apiConfig';
import { storeAuthToken, getAuthToken, clearAuthToken } from '@/utils/auth';

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

// Check if user is already authenticated on initial load
const { token } = getAuthToken();
if (token) {
  // If token exists, set user as authenticated
  initialState.user = {
    isAuthenticated: true
  } as User;
}

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
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An unknown error occurred');
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
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk for logout
export const adminLogout = createAsyncThunk(
  'auth/adminLogout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear token from localStorage
      clearAuthToken();
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reset error state
    resetError: (state) => {
      state.error = null;
    },
    // Set user manually (for initial auth check)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // Clear user (for logout)
    clearUser: (state) => {
      state.user = null;
    }
  },
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
        if (action.payload.access_token && action.payload.token_type) {
          storeAuthToken(action.payload.access_token, action.payload.token_type);
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
        if (action.payload.access_token && action.payload.token_type) {
          storeAuthToken(action.payload.access_token, action.payload.token_type);
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Admin logout cases
      .addCase(adminLogout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(adminLogout.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { resetError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;