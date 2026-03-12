import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { ProductState } from './products.state';
import { getStatusCountThunk } from './products.thunks';


const initialState: ProductState = {
  loading: false,
  error: null,
  statusCount: {},
};
const productSlice = createSlice({
  name: 'product',
initialState,
  reducers: {
    clearProductError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // 1. Success cases
      .addCase(getStatusCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.statusCount = action.payload;
      })

      // 2. Common Matchers for Loader
      // This will set loading to true whenever ANY of the thunks in this slice are pending
      .addMatcher(
        isAnyOf(getStatusCountThunk.pending), // Add other thunks here: thunk2.pending, thunk3.pending
        state => {
          state.loading = true;
          state.error = null;
        },
      )
      // This will set loading to false whenever ANY of the thunks in this slice fail
      .addMatcher(isAnyOf(getStatusCountThunk.rejected), (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
