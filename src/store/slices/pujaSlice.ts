import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Puja type
export interface Benefit {
  title: string;
  description: string;
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
  selected_plan_ids?: string[];
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
    selected_plan_ids: string[];
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
      });
  },
});

export default pujaSlice.reducer;