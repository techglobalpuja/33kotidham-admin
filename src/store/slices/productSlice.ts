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

// Define Product Image type
export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
}

// Define Product type based on API response
export interface Product {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    long_description: string;
    mrp: string;
    selling_price: string;
    discount_percentage: string;
    stock_quantity: number;
    sku: string;
    weight: string;
    dimensions: string;
    material: string;
    meta_description: string;
    tags: string;
    is_featured: boolean;
    is_active: boolean;
    allow_cod: boolean;
    category_id: number | null;
    category: ProductCategory | null;
    images: ProductImage[];
    total_sales: number;
    created_at: string;
    updated_at: string;
}

// Define ProductState type
export interface ProductState {
    products: Product[] | null;
    selectedProduct: Product | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: null,
    selectedProduct: null,
    isLoading: false,
    error: null,
};

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (params: {
        skip?: number;
        limit?: number;
        category_id?: number;
        is_active?: boolean;
        is_featured?: boolean;
        search?: string;
    } = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
            if (params.category_id !== undefined) queryParams.append('category_id', params.category_id.toString());
            if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
            if (params.is_featured !== undefined) queryParams.append('is_featured', params.is_featured.toString());
            if (params.search) queryParams.append('search', params.search);

            const url = `/api/v1/products/?${queryParams.toString()}`;
            const response = await axiosInstance.get(url);
            return response.data as Product[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for fetching a single product by ID
export const fetchProductById = createAsyncThunk(
    'product/fetchProductById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/products/${id}`);
            return response.data as Product;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for fetching a product by slug
export const fetchProductBySlug = createAsyncThunk(
    'product/fetchProductBySlug',
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/products/slug/${slug}`);
            return response.data as Product;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for creating a product
export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (productData: {
        name: string;
        slug: string;
        short_description: string;
        long_description: string;
        mrp: number;
        selling_price: number;
        discount_percentage: number;
        stock_quantity: number;
        sku: string;
        weight: number;
        dimensions: string;
        material: string;
        meta_description: string;
        tags: string;
        is_featured: boolean;
        is_active: boolean;
        allow_cod: boolean;
        category_id?: number;
        image_urls: string[];
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/v1/products/', productData);
            return response.data as Product;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for updating a product
export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async ({ id, productData }: {
        id: number;
        productData: {
            name?: string;
            slug?: string;
            category_id?: number;
            short_description?: string;
            long_description?: string;
            mrp?: number;
            selling_price?: number;
            discount_percentage?: number;
            stock_quantity?: number;
            sku?: string;
            weight?: number;
            dimensions?: string;
            material?: string;
            meta_description?: string;
            tags?: string;
            is_featured?: boolean;
            is_active?: boolean;
            allow_cod?: boolean;
        };
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/v1/products/${id}`, productData);
            return response.data as Product;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for deleting a product
export const deleteProduct = createAsyncThunk(
    'product/deleteProduct',
    async (id: number, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/v1/products/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for adding a product image
export const addProductImage = createAsyncThunk(
    'product/addProductImage',
    async ({ productId, imageData }: {
        productId: number;
        imageData: {
            image_url: string;
            is_primary: boolean;
            display_order: number;
        };
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/v1/products/${productId}/images`, imageData);
            return response.data as ProductImage;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for deleting a product image
export const deleteProductImage = createAsyncThunk(
    'product/deleteProductImage',
    async ({ productId, imageId }: { productId: number; imageId: number }, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/v1/products/${productId}/images/${imageId}`);
            return { productId, imageId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk for uploading product images
export const uploadProductImages = createAsyncThunk(
    'product/uploadProductImages',
    async (uploadData: { productId: number; images: File[] }, { rejectWithValue }) => {
        try {
            const { productId, images } = uploadData;

            // Validate images
            if (!images || images.length === 0) {
                throw new Error('No images provided for upload');
            }

            // Store results of all uploads
            const uploadResults = [];

            // Upload each image separately
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                if (image instanceof File) {
                    const formData = new FormData();
                    formData.append('file', image);

                    try {
                        const response = await axiosInstance.post(`/api/v1/uploads/images`, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        // After uploading to storage, add to product
                        const imageUrl = response.data.file_url;
                        const imageResponse = await axiosInstance.post(`/api/v1/products/${productId}/images`, {
                            image_url: imageUrl,
                            is_primary: i === 0, // First image is primary
                            display_order: i,
                        });

                        uploadResults.push(imageResponse.data);
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

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
            state.selectedProduct = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch products cases
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.isLoading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch product by ID cases
            .addCase(fetchProductById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
                state.isLoading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch product by slug cases
            .addCase(fetchProductBySlug.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductBySlug.fulfilled, (state, action: PayloadAction<Product>) => {
                state.isLoading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create product cases
            .addCase(createProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.isLoading = false;
                state.selectedProduct = action.payload;
                // Add the new product to the products array
                if (state.products) {
                    state.products.push(action.payload);
                } else {
                    state.products = [action.payload];
                }
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update product cases
            .addCase(updateProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.isLoading = false;
                state.selectedProduct = action.payload;
                // Update the product in the products array
                if (state.products) {
                    const index = state.products.findIndex(product => product.id === action.payload.id);
                    if (index !== -1) {
                        state.products[index] = action.payload;
                    }
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete product cases
            .addCase(deleteProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
                state.isLoading = false;
                // Remove the product from the products array
                if (state.products) {
                    state.products = state.products.filter(product => product.id !== action.payload);
                }
                // Clear selectedProduct if it was the deleted one
                if (state.selectedProduct && state.selectedProduct.id === action.payload) {
                    state.selectedProduct = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add product image cases
            .addCase(addProductImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addProductImage.fulfilled, (state, action: PayloadAction<ProductImage>) => {
                state.isLoading = false;
                // Add the image to selectedProduct if it exists
                if (state.selectedProduct && state.selectedProduct.id === action.payload.product_id) {
                    state.selectedProduct.images.push(action.payload);
                }
            })
            .addCase(addProductImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete product image cases
            .addCase(deleteProductImage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProductImage.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the image from selectedProduct if it exists
                if (state.selectedProduct) {
                    state.selectedProduct.images = state.selectedProduct.images.filter(
                        img => img.id !== action.payload.imageId
                    );
                }
            })
            .addCase(deleteProductImage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Upload product images cases
            .addCase(uploadProductImages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(uploadProductImages.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(uploadProductImages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
