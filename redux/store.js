import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slice/authslice";
import tourReducer from "./slice/tourslice";
import bookingReducer from "./slice/bookingslice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tours: tourReducer,
    bookings: bookingReducer,
  },
});
