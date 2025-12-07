import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define OrderItem type
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  created_at: string;
}

// Define Order type based on API response
export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: string;
  status: string;
  payment_status: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
    mobile: string;
  };
  order_items?: OrderItem[];
}

// Define OrderState type
export interface OrderState {
  orders: Order[] | null;
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: null,
  selectedOrder: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params: {
    skip?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.payment_status) queryParams.append('payment_status', params.payment_status);

      const url = `/api/v1/orders/all?${queryParams.toString()}`;
      const response = await axiosInstance.get(url);
      return response.data as Order[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single order by ID
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/orders/${id}`);
      return response.data as Order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch orders cases
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch order by ID cases
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;