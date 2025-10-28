import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';
import { Temple, TempleState } from '@/types';

const initialState: TempleState = {
  temples: null,
  selectedTemple: null,
  isLoading: false,
  error: null,
};

// Async thunk for creating a temple
export const createTemple = createAsyncThunk(
  'temple/createTemple',
  async (templeData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/temples/', templeData);
      return response?.data as Temple;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching temples
export const fetchTemples = createAsyncThunk(
  'temple/fetchTemples',
  async (params: { skip?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { skip = 0, limit = 100 } = params;
      const response = await axiosInstance.get(`/api/v1/temples/?skip=${skip}&limit=${limit}`);
      return response?.data as Temple[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single temple by ID
export const fetchTempleById = createAsyncThunk(
  'temple/fetchTempleById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/temples/${id}`);
      return response?.data as Temple;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating a temple
export const updateTemple = createAsyncThunk(
  'temple/updateTemple',
  async (updateData: { 
    id: number; 
    name: string; 
    description: string; 
    image_url: string; 
    location: string; 
    slug: string;
    recommended_puja_ids?: number[];
    chadawa_ids?: number[];
  }, { rejectWithValue }) => {
    try {
      const { id, ...templeData } = updateData;
      const response = await axiosInstance.put(`/api/v1/temples/${id}`, templeData);
      return response?.data as Temple;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for deleting a temple
export const deleteTemple = createAsyncThunk(
  'temple/deleteTemple',
  async (templeId: number, { rejectWithValue }) => {
    try {
      if (!templeId || typeof templeId !== 'number') {
        throw new Error('Valid temple ID is required');
      }
      
      await axiosInstance.delete(`/api/v1/temples/${templeId}`);
      return templeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for setting recommended pujas for a temple
export const setRecommendedPujas = createAsyncThunk(
  'temple/setRecommendedPujas',
  async ({ templeId, pujaIds }: { templeId: number; pujaIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/v1/temples/${templeId}/recommended`, pujaIds);
      return response?.data as Temple;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for uploading temple image
export const uploadTempleImage = createAsyncThunk(
  'temple/uploadTempleImage',
  async (imageFile: File, { rejectWithValue }) => {
    try {
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error('Valid image file is required');
      }

      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await axiosInstance.post('/api/v1/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const templeSlice = createSlice({
  name: 'temple',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create temple cases
    builder
      .addCase(createTemple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTemple.fulfilled, (state, action: PayloadAction<Temple>) => {
        state.isLoading = false;
        state.selectedTemple = action.payload;
        state.error = null;
      })
      .addCase(createTemple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch temples cases
      .addCase(fetchTemples.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemples.fulfilled, (state, action: PayloadAction<Temple[]>) => {
        state.isLoading = false;
        state.temples = action.payload;
        state.error = null;
      })
      .addCase(fetchTemples.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch temple by ID cases
      .addCase(fetchTempleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTempleById.fulfilled, (state, action: PayloadAction<Temple>) => {
        state.isLoading = false;
        state.selectedTemple = action.payload;
        state.error = null;
      })
      .addCase(fetchTempleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update temple cases
      .addCase(updateTemple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTemple.fulfilled, (state, action: PayloadAction<Temple>) => {
        state.isLoading = false;
        state.selectedTemple = action.payload;
        if (state.temples) {
          const index = state.temples.findIndex(temple => temple.id === action.payload.id);
          if (index !== -1) {
            state.temples[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateTemple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete temple cases
      .addCase(deleteTemple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTemple.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.error = null;
        if (state.selectedTemple && state.selectedTemple.id === action.payload) {
          state.selectedTemple = null;
        }
      })
      .addCase(deleteTemple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Set recommended pujas cases
      .addCase(setRecommendedPujas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setRecommendedPujas.fulfilled, (state, action: PayloadAction<Temple>) => {
        state.isLoading = false;
        state.selectedTemple = action.payload;
        if (state.temples) {
          const index = state.temples.findIndex(temple => temple.id === action.payload.id);
          if (index !== -1) {
            state.temples[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(setRecommendedPujas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload temple image cases
      .addCase(uploadTempleImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadTempleImage.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(uploadTempleImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default templeSlice.reducer;
