import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tours: [],
  singleTour: null,
  loading: false,
};

const tourSlice = createSlice({
  name: "tours",
  initialState,
  reducers: {
    setTours: (state, action) => {
      state.tours = action.payload;
    },

    setSingleTour: (state, action) => {
      state.singleTour = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setTours,
  setSingleTour,
  setLoading,
} = tourSlice.actions;

export default tourSlice.reducer;