import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import type { Theme } from './themeSlice';

export interface RootState {
  theme: {
    current: Theme;
  };
}

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export type AppDispatch = typeof store.dispatch; 