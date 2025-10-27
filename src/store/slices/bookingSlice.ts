import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define User type
export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Define PujaBenefit type
export interface PujaBenefit {
  id: number;
  benefit_title: string;
  benefit_description: string;
  puja_id: number;
  created_at: string;
}

// Define PujaImage type
export interface PujaImage {
  id: number;
  image_url: string;
}

// Define Puja type
export interface Puja {
  id: number;
  name: string;
  sub_heading: string;
  description: string;
  date: string;
  time: string;
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
  created_at: string;
  updated_at: string;
  benefits: PujaBenefit[];
  images: PujaImage[];
  plan_ids: number[];
  chadawas: any[]; // You can define a more specific type if needed
}

// Define Plan type
export interface Plan {
  id: number;
  name: string;
  description: string;
  image_url: string;
  actual_price: string;
  discounted_price: string;
  created_at: string;
}

// Define Chadawa type
export interface Chadawa {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: string;
  requires_note: boolean;
}

// Define BookingChadawa type
export interface BookingChadawa {
  id: number;
  chadawa_id: number;
  note: string | null;
  chadawa: Chadawa;
}

// Define Booking type
export interface Booking {
  id: number;
  puja_id: number;
  plan_id: number;
  booking_date: string;
  mobile_number: string;
  whatsapp_number: string;
  gotra: string;
  user_id: number;
  status: string;
  puja_link: string | null;
  created_at: string;
  user: User;
  puja: Puja;
  plan: Plan;
  booking_chadawas: BookingChadawa[];
}

// Define BookingState type
export interface BookingState {
  bookings: Booking[] | null;
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: null,
  selectedBooking: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching bookings
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/bookings/');
      return response?.data as Booking[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single booking by ID
export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/bookings/${id}`);
      return response?.data as Booking;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch bookings cases
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch booking by ID cases
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default bookingSlice.reducer;