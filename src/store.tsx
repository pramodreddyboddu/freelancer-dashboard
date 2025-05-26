// src/store.tsx
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {}, // Add reducers here later if needed
});

// TypeScript types for the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
