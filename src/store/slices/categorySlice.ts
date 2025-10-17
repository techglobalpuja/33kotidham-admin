import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Category type based on API response
export interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define CategoryState type
export interface CategoryState {
  categories: Category[] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching all categories
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/blogs/categories/?skip=0&limit=50&active_only=true');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for creating a new category
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/blogs/categories/', categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories cases
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create category cases
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        // Add the new category to the categories array
        if (state.categories) {
          state.categories.push(action.payload);
        } else {
          state.categories = [action.payload];
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;