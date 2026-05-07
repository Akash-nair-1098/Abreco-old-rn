import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRole, login, LoginPayload, register, RegisterPayload } from '../../../services';
import { showError } from '../../../utilities/toast';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const data = await login(payload);

        await AsyncStorage.setItem('ACCESS_TOKEN', data.access);
         await AsyncStorage.setItem('REFRESH_TOKEN', data.refresh);
      return data;
    } catch (error: any) {
          const message =
            error || error?.message || 'Login failed';

          showError(message);
          return rejectWithValue(message);
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await register(payload);
    } catch (error: any) {
         showError(error.response?.data?.message);
      return rejectWithValue(
        error.response?.data?.message || 'Register failed',
      );
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('ACCESS_TOKEN');
});


export const bootstrapAuthThunk = createAsyncThunk(
  'auth/bootstrap',
  async () => {
    const token = await AsyncStorage.getItem('ACCESS_TOKEN');
    return token;
  },
);


export const fetchRolesThunk = createAsyncThunk(
  'auth/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      // console.log('role api called');
      const response = await getRole(); 
      // API returns: { message: "Success", results: { data: [...] } }
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch roles';

      // console.error('Role fetch error:', message);
      return rejectWithValue(message);
    }
  },
);