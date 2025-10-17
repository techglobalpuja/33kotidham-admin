import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Chadawa type based on API response
export interface Chadawa {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  requires_note: boolean;
}

// Define ChadawaState type
export interface ChadawaState {
  chadawas: Chadawa[] | null;
  selectedChadawa: Chadawa | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChadawaState = {
  chadawas: null,
  selectedChadawa: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching all chadawas
export const fetchChadawas = createAsyncThunk(
  'chadawa/fetchChadawas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/chadawas');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single chadawa by ID
export const fetchChadawaById = createAsyncThunk(
  'chadawa/fetchChadawaById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/chadawas/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for creating a new chadawa
export const createChadawa = createAsyncThunk(
  'chadawa/createChadawa',
  async (chadawaData: Omit<Chadawa, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/chadawas/', chadawaData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating a chadawa
export const updateChadawa = createAsyncThunk(
  'chadawa/updateChadawa',
  async ({ id, chadawaData }: { id: number; chadawaData: Partial<Chadawa> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/chadawas/${id}`, chadawaData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for deleting a chadawa
export const deleteChadawa = createAsyncThunk(
  'chadawa/deleteChadawa',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/chadawas/${id}`);
      return { id, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for uploading chadawa image
export const uploadChadawaImage = createAsyncThunk(
  'chadawa/uploadChadawaImage',
  async (image: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await axiosInstance.post('/api/v1/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.file_url;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const chadawaSlice = createSlice({
  name: 'chadawa',
  initialState,
  reducers: {
    setSelectedChadawa: (state, action: PayloadAction<Chadawa | null>) => {
      state.selectedChadawa = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch chadawas cases
    builder
      .addCase(fetchChadawas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChadawas.fulfilled, (state, action: PayloadAction<Chadawa[]>) => {
        state.isLoading = false;
        state.chadawas = action.payload;
      })
      .addCase(fetchChadawas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch chadawa by ID cases
      .addCase(fetchChadawaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChadawaById.fulfilled, (state, action: PayloadAction<Chadawa>) => {
        state.isLoading = false;
        state.selectedChadawa = action.payload;
      })
      .addCase(fetchChadawaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create chadawa cases
      .addCase(createChadawa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChadawa.fulfilled, (state, action: PayloadAction<Chadawa>) => {
        state.isLoading = false;
        // Add the new chadawa to the chadawas array
        if (state.chadawas) {
          state.chadawas.push(action.payload);
        } else {
          state.chadawas = [action.payload];
        }
      })
      .addCase(createChadawa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update chadawa cases
      .addCase(updateChadawa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateChadawa.fulfilled, (state, action: PayloadAction<Chadawa>) => {
        state.isLoading = false;
        // Update the chadawa in the chadawas array
        if (state.chadawas) {
          const index = state.chadawas.findIndex(chadawa => chadawa.id === action.payload.id);
          if (index !== -1) {
            state.chadawas[index] = action.payload;
          }
        }
        // Also update selectedChadawa if it's the same chadawa
        if (state.selectedChadawa && state.selectedChadawa.id === action.payload.id) {
          state.selectedChadawa = action.payload;
        }
      })
      .addCase(updateChadawa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete chadawa cases
      .addCase(deleteChadawa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteChadawa.fulfilled, (state, action: PayloadAction<{ id: number; message: string }>) => {
        state.isLoading = false;
        // Remove the chadawa from the chadawas array
        if (state.chadawas) {
          state.chadawas = state.chadawas.filter(chadawa => chadawa.id !== action.payload.id);
        }
      })
      .addCase(deleteChadawa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload image cases
      .addCase(uploadChadawaImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadChadawaImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadChadawaImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedChadawa, clearError } = chadawaSlice.actions;
export default chadawaSlice.reducer;
