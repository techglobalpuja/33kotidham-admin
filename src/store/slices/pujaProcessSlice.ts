import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define PujaProcess type
export interface PujaProcess {
  id: string;
  name: string;
  date: string | null;
  temple_address: string;
  total_bookings: number;
  process_status: string;
  is_active: boolean; // Added is_active field
  sub_heading: string; // Added sub_heading field
  created_date: string; // Added created_date field
  video_url?: string; // Added video_url field
}

// Define PujaProcessState type
export interface PujaProcessState {
  pujas: PujaProcess[] | null;
  selectedPuja: PujaProcess | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PujaProcessState = {
  pujas: null,
  selectedPuja: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching pujas with process information
export const fetchPujasWithProcess = createAsyncThunk(
  'pujaProcess/fetchPujasWithProcess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/pujas');
      // Transform the data to include process information
      const pujasWithProcess = response?.data?.map((puja: any) => ({
        id: puja.id,
        name: puja.name,
        date: puja.date,
        temple_address: puja.temple_address,
        total_bookings: puja.total_bookings || 0,
        process_status: puja.process_status || 'Scheduled',
        is_active: Boolean(puja.is_active ?? true), // Added is_active field
        sub_heading: puja.sub_heading || '', // Added sub_heading field
        created_date: puja.created_date || new Date().toISOString(), // Added created_date field
        video_url: puja.video_url || '' // Added video_url field
      })) || [];
      return pujasWithProcess as PujaProcess[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating puja process status
export const updatePujaProcessStatus = createAsyncThunk(
  'pujaProcess/updatePujaProcessStatus',
  async ({ id, process_status, video_url }: { id: string; process_status: string; video_url?: string }, { rejectWithValue }) => {
    try {
      const payload: { process_status: string; video_url?: string } = { process_status };
      
      // Include video URL only if status is Shared Video and URL is provided
      if (process_status === 'Shared Video' && video_url) {
        payload.video_url = video_url;
      }
      
      const response = await axiosInstance.patch(`/api/v1/pujas/${id}/process`, payload);
      return response?.data as PujaProcess;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const pujaProcessSlice = createSlice({
  name: 'pujaProcess',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch pujas with process cases
    builder
      .addCase(fetchPujasWithProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPujasWithProcess.fulfilled, (state, action: PayloadAction<PujaProcess[]>) => {
        state.isLoading = false;
        state.pujas = action.payload;
        state.error = null;
      })
      .addCase(fetchPujasWithProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update puja process status cases
      .addCase(updatePujaProcessStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePujaProcessStatus.fulfilled, (state, action: PayloadAction<PujaProcess>) => {
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
      .addCase(updatePujaProcessStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default pujaProcessSlice.reducer;