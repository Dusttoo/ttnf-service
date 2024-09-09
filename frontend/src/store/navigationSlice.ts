import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNavLinks, createNavLink, updateNavLink, deleteNavLink } from '../api/navigationApi';
import { NavLink } from '../api/types/navigation';

interface NavigationState {
    links: NavLink[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: NavigationState = {
    links: [],
    status: 'idle',
    error: null,
};

export const fetchNavLinks = createAsyncThunk('navigation/fetchNavLinks', async () => {
    const response = await getNavLinks();
    return response;
});

export const addNavLink = createAsyncThunk('navigation/addNavLink', async (navLink: Partial<NavLink>) => {
    const response = await createNavLink(navLink);
    return response;
});

export const updateExistingNavLink = createAsyncThunk('navigation/updateExistingNavLink', async (navLink: Partial<NavLink>) => {
    const response = await updateNavLink(navLink);
    return response;
});

export const removeNavLink = createAsyncThunk('navigation/removeNavLink', async (id: string) => {
    await deleteNavLink(id);
    return id;
});

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNavLinks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNavLinks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.links = action.payload;
            })
            .addCase(fetchNavLinks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            })
            .addCase(addNavLink.fulfilled, (state, action) => {
                state.links.push(action.payload);
            })
            .addCase(updateExistingNavLink.fulfilled, (state, action) => {
                const index = state.links.findIndex(link => link.id === action.payload.id);
                if (index !== -1) {
                    state.links[index] = action.payload;
                }
            })
            .addCase(removeNavLink.fulfilled, (state, action) => {
                state.links = state.links.filter(link => link.id !== action.payload);
            });
    },
});

export default navigationSlice.reducer;