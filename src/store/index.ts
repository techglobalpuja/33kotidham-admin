// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import pujaReducer from '@/store/slices/pujaSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    puja: pujaReducer,
  },
});

// Export the store
export default store;

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;