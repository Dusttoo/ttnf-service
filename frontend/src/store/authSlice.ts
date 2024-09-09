import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/authApi';
import { RootState } from '../store';

interface AuthState {
    user: any;
    token: string | null;
    error: string | null | undefined;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token') || null, 
    error: null,
};

// Thunks
export const login = createAsyncThunk('auth/login', async (credentials: { username: string; password: string }) => {
    const response = await loginApi(credentials);
    localStorage.setItem('token', response.accessToken);  
    return response;
});

export const register = createAsyncThunk('auth/register', async (userData: { username: string; email: string; password: string }) => {
    const response = await registerApi(userData);
    return response;
});

export const logout = createAsyncThunk('auth/logout', async () => {
    await logoutApi();
    localStorage.removeItem('token');  
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                
            })
            .addCase(login.fulfilled, (state, action) => {
                state.token = action.payload.accessToken;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(register.pending, (state) => {
                
            })
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
            })
            .addCase(register.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(logout.pending, (state) => {
                
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthUser = (state: RootState) => state.auth.user;