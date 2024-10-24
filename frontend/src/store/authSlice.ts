import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  fetchCurrentUser as fetchCurrentUserApi,
} from '../api/authApi';
import { RootState, AppDispatch } from '../store';
import { startLoading, stopLoading } from './loadingSlice'; // Import loading actions
import { User } from '../api/types/core';

// Define AuthState
interface AuthState {
  user: User | null;
  error: string | null | undefined;
}

// Initial state
const initialState: AuthState = {
  user: null,
  error: null,
};

// Thunks
export const login = createAsyncThunk<
  any,
  { username: string; password: string },
  { dispatch: AppDispatch }
>(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading()); // Start loading
      const response = await loginApi(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

export const register = createAsyncThunk<
  any,
  { username: string; email: string; password: string },
  { dispatch: AppDispatch }
>(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading()); // Start loading
      const response = await registerApi(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to register');
    }
  }
);

export const logout = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading()); // Start loading
      await logoutApi();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to logout');
    }
  }
);

export const validateSession = createAsyncThunk<
  any,
  void,
  { dispatch: AppDispatch }
>(
  'auth/validateSession',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(startLoading()); // Start loading
      const user = await fetchCurrentUserApi();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to validate session');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.error = null;
        stopLoading(); // Stop loading here after user is set
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload as string;
        stopLoading(); // Stop loading on failure
      })

      // Register
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        stopLoading(); // Stop loading after user is set
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload as string;
        stopLoading(); // Stop loading on failure
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        stopLoading(); // Stop loading after logout
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
        stopLoading(); // Stop loading on failure
      })

      // Validate session
      .addCase(validateSession.fulfilled, (state, action) => {
        state.user = action.payload;
        stopLoading(); // Stop loading when user is validated
      })
      .addCase(validateSession.rejected, (state, action) => {
        state.error = action.payload as string;
        stopLoading(); // Stop loading on failure
      });
  },
});

export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthUser = (state: RootState) => state.auth.user;