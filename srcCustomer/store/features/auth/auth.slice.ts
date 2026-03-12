import { createSlice } from '@reduxjs/toolkit';
import { AuthState } from './auth.state';
import { loginThunk, registerThunk, logoutThunk, bootstrapAuthThunk, fetchRolesThunk } from './auth.thunks';

const initialState: AuthState = {
  loading: false,
  token: null,
  error: null,
  authChecked: false,
  roles: [],
  rolesLoading: false,
  rolesError: null,
  selectedRole: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Optional: if you want to select a role manually
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearAuthError: state => {
      state.error = null;
      state.rolesError = null;
    },
  },
  extraReducers: builder => {
    builder
      // LOGIN
      .addCase(loginThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // REGISTER
      .addCase(registerThunk.pending, state => {
        state.loading = true;
      })
      .addCase(registerThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // LOGOUT
      .addCase(logoutThunk.fulfilled, state => {
        state.token = null;
      })

      //check for if token avaialbel
      .addCase(bootstrapAuthThunk.pending, state => {
        state.loading = true;
      })

      .addCase(bootstrapAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.authChecked = true;
      })

      .addCase(bootstrapAuthThunk.rejected, state => {
        state.loading = false;
        state.authChecked = true;
      })

      // === FETCH ROLES ===
      .addCase(fetchRolesThunk.pending, state => {
        state.rolesLoading = true;
        state.rolesError = null;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload as string;
      });
  },
});

export const { setSelectedRole, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
