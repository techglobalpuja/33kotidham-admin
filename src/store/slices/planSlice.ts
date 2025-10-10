import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Plan type based on API response
export interface Plan {
  id: number;
  name: string;
  description: string;
  image_url: string;
  actual_price: string;
  discounted_price: string;
  created_at: string;
}

// Define PlanState type
export interface PlanState {
  plans: Plan[] | null;
  selectedPlan: Plan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlanState = {
  plans: null,
  selectedPlan: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching all plans
export const fetchPlans = createAsyncThunk(
  'plan/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/plans/?skip=0&limit=100');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single plan by ID
export const fetchPlanById = createAsyncThunk(
  'plan/fetchPlanById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/plans/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for creating a new plan
export const createPlan = createAsyncThunk(
  'plan/createPlan',
  async (planData: Omit<Plan, 'id' | 'created_at'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/plans/', planData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating a plan
export const updatePlan = createAsyncThunk(
  'plan/updatePlan',
  async ({ id, planData }: { id: number; planData: Partial<Plan> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/plans/${id}`, planData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for deleting a plan
export const deletePlan = createAsyncThunk(
  'plan/deletePlan',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/plans/${id}`);
      return { id, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for uploading plan image
export const uploadPlanImage = createAsyncThunk(
  'plan/uploadPlanImage',
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

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
      state.selectedPlan = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch plans cases
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Plan[]>) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch plan by ID cases
      .addCase(fetchPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create plan cases
      .addCase(createPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        // Add the new plan to the plans array
        if (state.plans) {
          state.plans.push(action.payload);
        } else {
          state.plans = [action.payload];
        }
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update plan cases
      .addCase(updatePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action: PayloadAction<Plan>) => {
        state.isLoading = false;
        // Update the plan in the plans array
        if (state.plans) {
          const index = state.plans.findIndex(plan => plan.id === action.payload.id);
          if (index !== -1) {
            state.plans[index] = action.payload;
          }
        }
        // Also update selectedPlan if it's the same plan
        if (state.selectedPlan && state.selectedPlan.id === action.payload.id) {
          state.selectedPlan = action.payload;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete plan cases
      .addCase(deletePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action: PayloadAction<{ id: number; message: string }>) => {
        state.isLoading = false;
        // Remove the plan from the plans array
        if (state.plans) {
          state.plans = state.plans.filter(plan => plan.id !== action.payload.id);
        }
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload image cases
      .addCase(uploadPlanImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadPlanImage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadPlanImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedPlan, clearError } = planSlice.actions;
export default planSlice.reducer;