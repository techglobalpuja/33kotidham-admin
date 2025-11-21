import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Product Category type
export interface ProductCategory {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Define ProductCategoryState type
export interface ProductCategoryState {
    categories: ProductCategory[] | null;
    selectedCategory: ProductCategory | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductCategoryState = {
    categories: null,
    selectedCategory: null,
    isLoading: false,
    error: null,
};

// Async thunk for fetching product categories
export const fetchProductCategories = createAsyncThunk(
    'productCategory/fetchProductCategories',
    async (params: {
        skip?: number;
        limit?: number;
        is_active?: boolean;
    } = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
            if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

            const url = `/api/v1/products/categories?${queryParams.toString()}`;
            const response = await axiosInstance.get(url);
            return response.data as ProductCategory[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for fetching a single product category by ID
export const fetchProductCategoryById = createAsyncThunk(
    'productCategory/fetchProductCategoryById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/products/categories/${id}`);
            return response.data as ProductCategory;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for creating a product category
export const createProductCategory = createAsyncThunk(
    'productCategory/createProductCategory',
    async (categoryData: {
        name: string;
        description: string;
        is_active: boolean;
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/v1/products/categories', categoryData);
            return response.data as ProductCategory;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for updating a product category
export const updateProductCategory = createAsyncThunk(
    'productCategory/updateProductCategory',
    async ({ id, categoryData }: {
        id: number;
        categoryData: {
            name?: string;
            description?: string;
            is_active?: boolean;
        };
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/v1/products/categories/${id}`, categoryData);
            return response.data as ProductCategory;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for deleting a product category
export const deleteProductCategory = createAsyncThunk(
    'productCategory/deleteProductCategory',
    async (id: number, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/v1/products/categories/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const productCategorySlice = createSlice({
    name: 'productCategory',
    initialState,
    reducers: {
        setSelectedCategory: (state, action: PayloadAction<ProductCategory | null>) => {
            state.selectedCategory = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch product categories cases
        builder
            .addCase(fetchProductCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductCategories.fulfilled, (state, action: PayloadAction<ProductCategory[]>) => {
                state.isLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchProductCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch product category by ID cases
            .addCase(fetchProductCategoryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductCategoryById.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
                state.isLoading = false;
                state.selectedCategory = action.payload;
            })
            .addCase(fetchProductCategoryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create product category cases
            .addCase(createProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
                state.isLoading = false;
                // Add the new category to the categories array
                if (state.categories) {
                    state.categories.push(action.payload);
                } else {
                    state.categories = [action.payload];
                }
            })
            .addCase(createProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update product category cases
            .addCase(updateProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
                state.isLoading = false;
                // Update the category in the categories array
                if (state.categories) {
                    const index = state.categories.findIndex(category => category.id === action.payload.id);
                    if (index !== -1) {
                        state.categories[index] = action.payload;
                    }
                }
                // Also update selectedCategory if it's the same category
                if (state.selectedCategory && state.selectedCategory.id === action.payload.id) {
                    state.selectedCategory = action.payload;
                }
            })
            .addCase(updateProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete product category cases
            .addCase(deleteProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProductCategory.fulfilled, (state, action: PayloadAction<number>) => {
                state.isLoading = false;
                // Remove the category from the categories array
                if (state.categories) {
                    state.categories = state.categories.filter(category => category.id !== action.payload);
                }
                // Clear selectedCategory if it was the deleted one
                if (state.selectedCategory && state.selectedCategory.id === action.payload) {
                    state.selectedCategory = null;
                }
            })
            .addCase(deleteProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedCategory, clearError } = productCategorySlice.actions;
export default productCategorySlice.reducer;
