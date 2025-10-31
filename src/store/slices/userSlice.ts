import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

export interface User {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface UserState {
  users: User[] | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: null,
  selectedUser: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: { skip?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { skip = 0, limit = 100 } = params;
      const response = await axiosInstance.get(`/api/v1/users/?skip=${skip}&limit=${limit}`);
      return response?.data as User[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single user by ID
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/users/${id}`);
      return response?.data as User;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users cases
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user by ID cases
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
