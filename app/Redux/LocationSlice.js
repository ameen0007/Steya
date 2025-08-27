import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  locationData: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocationData: (state, action) => {
      state.locationData = action.payload;
    },
    clearLocationData: (state) => {
      state.locationData = null;
    },
  },
});

export const { setLocationData, clearLocationData } = locationSlice.actions;
export default locationSlice.reducer;