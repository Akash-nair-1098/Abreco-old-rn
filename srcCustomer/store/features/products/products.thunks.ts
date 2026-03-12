import { createAsyncThunk } from '@reduxjs/toolkit';
import { getStatusCount } from '../../../services/api/home/home.api';
import { showError } from '../../../utilities/toast';
import { getProductTabUIConfig } from '../../../utilities/funtions';
import { TabItem } from '../../../utilities/commonTypes';

export const getStatusCountThunk = createAsyncThunk(
  'product/getStatusCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStatusCount();
      return response;
    } catch (error: any) {
      const msg =
        error.response?.data?.message || 'Failed to load status options';
      showError(msg);
      return rejectWithValue(msg);
    }
  },
);

// You can export more thunks here (e.g., fetchProductsThunk)
