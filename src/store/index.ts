// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pujaReducer from './slices/pujaSlice';
import pujaProcessReducer from './slices/pujaProcessSlice';
import planReducer from './slices/planSlice';
import chadawaReducer from './slices/chadawaSlice';
import blogReducer from './slices/blogSlice';
import categoryReducer from './slices/categorySlice';
import bookingReducer from './slices/bookingSlice';
import templeReducer from './slices/templeSlice';
import authReducer from '@/store/slices/authSlice';
import pujaReducer from '@/store/slices/pujaSlice';
import planReducer from '@/store/slices/planSlice';
import chadawaReducer from '@/store/slices/chadawaSlice';
import blogReducer from '@/store/slices/blogSlice';
import categoryReducer from '@/store/slices/categorySlice';
import bookingReducer from '@/store/slices/bookingSlice';
import templeReducer from '@/store/slices/templeSlice';
import userReducer from '@/store/slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    puja: pujaReducer,
    pujaProcess: pujaProcessReducer,
    plan: planReducer,
    chadawa: chadawaReducer,
    blog: blogReducer,
    category: categoryReducer,
    booking: bookingReducer,
    temple: templeReducer,
    user: userReducer,
  },
});

// Export the store
export default store;

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;