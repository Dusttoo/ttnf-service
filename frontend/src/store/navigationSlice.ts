import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNavLinks, createNavLink, updateNavLink, deleteNavLink } from '../api/navigationApi';
import { NavLink } from '../api/types/navigation';
import { buildNavTree } from '../utils/buildNavTree';

interface NavigationState {
    links: NavLink[];
    error: string | null;
}

const initialState: NavigationState = {
    links: [],
    error: null,
};

// Async Thunks
export const fetchNavLinks = createAsyncThunk('navigation/fetchNavLinks', async () => {
    const response = await getNavLinks();
    return buildNavTree(response);
});

export const addNavLink = createAsyncThunk('navigation/addNavLink', async (navLink: Partial<NavLink>) => {
    const response = await createNavLink(navLink);
    return response;
});

export const updateExistingNavLink = createAsyncThunk('navigation/updateExistingNavLink', async (navLink: Partial<NavLink>) => {
    const response = await updateNavLink(navLink);
    return response;
});

export const removeNavLink = createAsyncThunk('navigation/removeNavLink', async (id: number) => {
    await deleteNavLink(id);
    return id;
});

// Slice
const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNavLinks.fulfilled, (state, action) => {
                state.links = action.payload;
            })
            .addCase(fetchNavLinks.rejected, (state, action) => {
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
            })
            .addCase(addNavLink.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(updateExistingNavLink.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(removeNavLink.rejected, (state, action) => {
                state.error = action.error.message || null;
            });
    },
});

export default navigationSlice.reducer;