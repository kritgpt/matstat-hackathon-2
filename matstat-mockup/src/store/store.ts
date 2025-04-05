import { configureStore } from '@reduxjs/toolkit';
import athletesReducer from './athletesSlice';

export const store = configureStore({
  reducer: {
    athletes: athletesReducer,
    // Add other reducers here if needed
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {athletes: AthletesState, ...}
export type AppDispatch = typeof store.dispatch;
