import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    login as loginApi,
    register as registerApi,
    logout as logoutApi,
    fetchCurrentUser as fetchCurrentUserApi,
} from '../api/authApi';
import { RootState, AppDispatch } from '../store';
import { User } from '../api/types/core';

// Define AuthState
interface AuthState {
    user: User | null;
    error: string | null | undefined;
    sessionValidated: boolean;
}

// Initial state
const initialState: AuthState = {
    user: null,
    error: null,
    sessionValidated: false,
};

// Thunks
export const login = createAsyncThunk<
    any,
    { username: string; password: string },
    { dispatch: AppDispatch }
>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginApi(credentials);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to login');
        }
    },
);

export const register = createAsyncThunk<
    any,
    { username: string; email: string; password: string },
    { dispatch: AppDispatch }
>(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await registerApi(userData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to register');
        }
    },
);

export const logout = createAsyncThunk<
    void,
    void,
    { dispatch: AppDispatch }
>(
    'auth/logout',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await logoutApi();
            dispatch(authSlice.actions.resetSession()); // Reset session flag on logout
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to logout');
        }
    },
);

export const validateSession = createAsyncThunk<
    any,
    void,
    { dispatch: AppDispatch }
>(
    'auth/validateSession',
    async (_, { rejectWithValue }) => {
        try {
            const user = await fetchCurrentUserApi();
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to validate session');
        }
    },
);

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetSession(state) {
            state.sessionValidated = false;
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.error = null;
                state.sessionValidated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Register
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.sessionValidated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.sessionValidated = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Validate session
            .addCase(validateSession.fulfilled, (state, action) => {
                state.user = action.payload;
                state.sessionValidated = true;
            })
            .addCase(validateSession.rejected, (state, action) => {
                state.error = action.payload as string;
                state.sessionValidated = true; // Prevents revalidation loops
            });
    },
});

export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectSessionValidated = (state: RootState) => state.auth.sessionValidated;