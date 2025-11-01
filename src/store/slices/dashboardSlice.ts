import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';
import { AdminStats } from '@/types';

// Define DashboardState type
export interface DashboardState {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching dashboard statistics from multiple endpoints
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching dashboard statistics...');
      
      // Fetch data from all relevant endpoints in parallel
      const [usersRes, pujasRes, pujaBookingsRes, chadawaBookingsRes, blogsRes, chadawaItemsRes] = await Promise.all([
        axiosInstance.get('/api/v1/users/?skip=0&limit=100'),
        axiosInstance.get('/api/v1/pujas'),
        axiosInstance.get('/api/v1/bookings/puja'),
        axiosInstance.get('/api/v1/bookings/temple-chadawa'),
        axiosInstance.get('/api/v1/blogs/admin/all'),
        axiosInstance.get('/api/v1/chadawas'),
      ]);

      const users = usersRes?.data || [];
      const pujas = pujasRes?.data || [];
      const pujaBookings = pujaBookingsRes?.data || [];
      const chadawaBookings = chadawaBookingsRes?.data || [];
      const blogs = blogsRes?.data || [];
      const chadawaItems = chadawaItemsRes?.data || [];

      console.log('✅ API Responses:', {
        totalUsers: users.length,
        totalPujas: pujas.length,
        totalPujaBookings: pujaBookings.length,
        totalChadawaBookings: chadawaBookings.length,
        totalBlogs: blogs.length,
        totalChadawaItems: chadawaItems.length,
      });

      // Calculate total earnings from bookings
      const totalEarnings = [...pujaBookings, ...chadawaBookings].reduce((sum, booking: any) => {
        const planPrice = parseFloat(booking.plan?.discounted_price || booking.plan?.actual_price || 0);
        const chadawaPrice = booking.booking_chadawas?.reduce((cSum: number, bc: any) => 
          cSum + parseFloat(bc.chadawa?.price || 0), 0) || 0;
        return sum + planPrice + chadawaPrice;
      }, 0);

      // Calculate monthly growth (simplified - comparing last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const calculateGrowth = (items: any[], dateField: string = 'created_at') => {
        const recentCount = items.filter(item => 
          new Date(item[dateField]) >= thirtyDaysAgo
        ).length;
        const previousCount = items.filter(item => {
          const date = new Date(item[dateField]);
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        }).length;
        
        if (previousCount === 0) return recentCount > 0 ? 100 : 0;
        return parseFloat((((recentCount - previousCount) / previousCount) * 100).toFixed(1));
      };

      const stats: AdminStats = {
        totalUsers: users.length,
        totalPujas: pujas.length,
        totalEarnings: Math.round(totalEarnings),
        totalOrders: pujaBookings.length + chadawaBookings.length,
        totalPujaBookings: pujaBookings.length,
        totalChadawaBookings: chadawaBookings.length,
        totalBlogs: blogs.length,
        totalChadawaItems: chadawaItems.length,
        monthlyGrowth: {
          users: calculateGrowth(users),
          pujas: calculateGrowth(pujas),
          earnings: calculateGrowth([...pujaBookings, ...chadawaBookings], 'booking_date'),
          orders: calculateGrowth([...pujaBookings, ...chadawaBookings], 'booking_date'),
          pujaBookings: calculateGrowth(pujaBookings, 'booking_date'),
          chadawaBookings: calculateGrowth(chadawaBookings, 'booking_date'),
        },
      };

      console.log('📈 Final Dashboard Stats:', stats);
      return stats;
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<AdminStats>) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
