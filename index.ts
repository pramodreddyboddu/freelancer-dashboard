import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pitchReducer from './slices/pitchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pitch: pitchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
