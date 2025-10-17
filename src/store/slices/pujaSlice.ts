import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Puja type
export interface Benefit {
  title: string;
  description: string;
}

// Add Image interface
export interface Image {
  id: number;
  image_url: string;
}

export interface Puja {
  id: string;
  name: string;
  sub_heading: string;
  description: string;
  date: string | null;
  time: string | null;
  temple_image_url: string;
  temple_address: string;
  temple_description: string;
  prasad_price: number;
  is_prasad_active: boolean;
  dakshina_prices_inr: string;
  dakshina_prices_usd: string;
  is_dakshina_active: boolean;
  manokamna_prices_inr: string;
  manokamna_prices_usd: string;
  is_manokamna_active: boolean;
  category: string;
  is_active?: boolean;
  is_featured?: boolean;
  puja_images?: string[];
  created_date?: string;
  selected_plan?: string;
  benefits?: Benefit[];
  selected_plan_ids?: number[];
  images?: Image[]; // Add this property to match API response
}

// Define PujaState type
export interface PujaState {
  pujas: Puja[] | null;
  selectedPuja: Puja | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PujaState = {
  pujas: null,
  selectedPuja: null,
  isLoading: false,
  error: null,
};

// Async thunk for creating a puja
export const createPuja = createAsyncThunk(
  'puja/createPuja',
  async (pujaData: Puja, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/pujas', pujaData);
      return response?.data as Puja;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching pujas
export const fetchPujas = createAsyncThunk(
  'puja/fetchPujas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/pujas');
      return response?.data as Puja[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single puja by ID
export const fetchPujaById = createAsyncThunk(
  'puja/fetchPujaById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/pujas/${id}`);
      return response?.data as Puja;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating a puja
export const updatePuja = createAsyncThunk(
  'puja/updatePuja',
  async (updateData: { 
    id: string; 
    name: string; 
    sub_heading: string; 
    description: string; 
    date: string | null; 
    time: string | null; 
    temple_image_url: string; 
    temple_address: string; 
    temple_description: string; 
    prasad_price: number; 
    is_prasad_active: boolean; 
    dakshina_prices_inr: string; 
    dakshina_prices_usd: string; 
    is_dakshina_active: boolean; 
    manokamna_prices_inr: string; 
    manokamna_prices_usd: string; 
    is_manokamna_active: boolean; 
    category: string;
    is_active: boolean;
    is_featured: boolean;
    benefits: Benefit[];
    selected_plan_ids: number[];
  }, { rejectWithValue }) => {
    try {
      const { id, ...pujaData } = updateData;
      const response = await axiosInstance.put(`/api/v1/pujas/${id}`, pujaData);
      return response?.data as Puja;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for deleting a puja
export const deletePuja = createAsyncThunk(
  'puja/deletePuja',
  async (pujaId: string, { rejectWithValue }) => {
    try {
      if (!pujaId || typeof pujaId !== 'string') {
        throw new Error('Valid puja ID is required');
      }
      
      await axiosInstance.delete(`/api/v1/pujas/${pujaId}`);
      return pujaId; // Return the deleted puja ID
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for adding a benefit to a puja
export const addPujaBenefit = createAsyncThunk(
  'puja/addPujaBenefit',
  async ({ pujaId, benefit }: { pujaId: string; benefit: { benefit_title: string; benefit_description: string } }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/v1/pujas/${pujaId}/benefits`, benefit);
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for uploading puja images
export const uploadPujaImages = createAsyncThunk(
  'puja/uploadPujaImages',
  async (uploadData: { pujaId: string; images: File[] }, { rejectWithValue }) => {
    try {
      const { pujaId, images } = uploadData;
      
      // Validate images
      if (!images || images.length === 0) {
        throw new Error('No images provided for upload');
      }
      
      if (images.length > 6) {
        throw new Error('Maximum 6 images allowed');
      }
      
      // Store results of all uploads
      const uploadResults = [];
      
      // Upload each image separately (as per the cURL example)
      for (const image of images) {
        if (image instanceof File) {
          const formData = new FormData();
          formData.append('file', image);
          
          try {
            const response = await axiosInstance.post(`api/v1/uploads/puja-images/${pujaId}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            uploadResults.push(response.data);
          } catch (error) {
            console.error(`Failed to upload image ${image.name}:`, error);
            // Continue with other images even if one fails
          }
        }
      }
      
      return uploadResults;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const pujaSlice = createSlice({
  name: 'puja',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create puja cases
    builder
      .addCase(createPuja.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPuja.fulfilled, (state, action: PayloadAction<Puja>) => {
        state.isLoading = false;
        state.selectedPuja = action.payload;
        state.error = null;
      })
      .addCase(createPuja.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch pujas cases
      .addCase(fetchPujas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPujas.fulfilled, (state, action: PayloadAction<Puja[]>) => {
        state.isLoading = false;
        state.pujas = action.payload;
        state.error = null;
      })
      .addCase(fetchPujas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch puja by ID cases
      .addCase(fetchPujaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPujaById.fulfilled, (state, action: PayloadAction<Puja>) => {
        state.isLoading = false;
        state.selectedPuja = action.payload;
        state.error = null;
      })
      .addCase(fetchPujaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update puja cases
      .addCase(updatePuja.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePuja.fulfilled, (state, action: PayloadAction<Puja>) => {
        state.isLoading = false;
        state.selectedPuja = action.payload;
        if (state.pujas) {
          const index = state.pujas.findIndex(puja => puja.id === action.payload.id);
          if (index !== -1) {
            state.pujas[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updatePuja.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete puja cases
      .addCase(deletePuja.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePuja.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.error = null;
        // Clear selectedPuja if it was the deleted one
        if (state.selectedPuja && state.selectedPuja.id === action.payload) {
          state.selectedPuja = null;
        }
        // Note: We don't filter the pujas array here since we fetch fresh data from server
      })
      .addCase(deletePuja.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload puja images cases
      .addCase(uploadPujaImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPujaImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(uploadPujaImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add puja benefit cases
      .addCase(addPujaBenefit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPujaBenefit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Optionally update the selectedPuja with the new benefit
        if (state.selectedPuja && state.selectedPuja.benefits) {
          state.selectedPuja.benefits.push({
            title: action.payload.benefit_title,
            description: action.payload.benefit_description
          });
        }
      })
      .addCase(addPujaBenefit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default pujaSlice.reducer;