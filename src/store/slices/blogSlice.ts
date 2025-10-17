import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/services/apiConfig';

// Define Blog type based on API response
export interface Blog {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  thumbnail_image: string;
  meta_description: string;
  tags: string;
  category_id: number;
  is_featured: boolean;
  is_active: boolean;
  publish_time: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

// Define BlogState type
export interface BlogState {
  blogs: Blog[] | null;
  selectedBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  blogs: null,
  selectedBlog: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching all blogs
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/blogs/admin/all');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for fetching a single blog by ID
export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/blogs/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for creating a new blog
export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData: Omit<Blog, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/blogs/', blogData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating a blog
export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, blogData }: { id: number; blogData: Partial<Blog> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/blogs/${id}`, blogData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for deleting a blog
export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/blogs/${id}`);
      return { id, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for uploading blog thumbnail
export const uploadBlogThumbnail = createAsyncThunk(
  'blog/uploadBlogThumbnail',
  async (image: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await axiosInstance.post('/api/v1/uploads/blog-thumbnails', formData, {
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

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setSelectedBlog: (state, action: PayloadAction<Blog | null>) => {
      state.selectedBlog = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch blogs cases
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action: PayloadAction<Blog[]>) => {
        state.isLoading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch blog by ID cases
      .addCase(fetchBlogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.isLoading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create blog cases
      .addCase(createBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.isLoading = false;
        // Add the new blog to the blogs array
        if (state.blogs) {
          state.blogs.push(action.payload);
        } else {
          state.blogs = [action.payload];
        }
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update blog cases
      .addCase(updateBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.isLoading = false;
        // Update the blog in the blogs array
        if (state.blogs) {
          const index = state.blogs.findIndex(blog => blog.id === action.payload.id);
          if (index !== -1) {
            state.blogs[index] = action.payload;
          }
        }
        // Also update selectedBlog if it's the same blog
        if (state.selectedBlog && state.selectedBlog.id === action.payload.id) {
          state.selectedBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete blog cases
      .addCase(deleteBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action: PayloadAction<{ id: number; message: string }>) => {
        state.isLoading = false;
        // Remove the blog from the blogs array
        if (state.blogs) {
          state.blogs = state.blogs.filter(blog => blog.id !== action.payload.id);
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload thumbnail cases
      .addCase(uploadBlogThumbnail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadBlogThumbnail.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(uploadBlogThumbnail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedBlog, clearError } = blogSlice.actions;
export default blogSlice.reducer;
