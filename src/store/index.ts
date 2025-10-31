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
  },
});

// Export the store
export default store;

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;