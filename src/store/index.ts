// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import pujaReducer from '@/store/slices/pujaSlice';
import planReducer from '@/store/slices/planSlice';
import chadawaReducer from '@/store/slices/chadawaSlice';
import blogReducer from '@/store/slices/blogSlice';
import categoryReducer from '@/store/slices/categorySlice';
import bookingReducer from '@/store/slices/bookingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    puja: pujaReducer,
    plan: planReducer,
    chadawa: chadawaReducer,
    blog: blogReducer,
    category: categoryReducer,
    booking: bookingReducer,
  },
});

// Export the store
export default store;

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;