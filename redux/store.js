import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import tourReducer from "./slices/tourSlice";
import bookingReducer from "./slices/bookingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tours: tourReducer,
    bookings: bookingReducer,
  },
});