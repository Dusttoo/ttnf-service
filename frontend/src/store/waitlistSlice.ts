import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    filterWaitlistEntries,
    createWaitlistEntry,
    updateWaitlistEntry,
    deleteWaitlistEntry,
} from '../api/waitlistApi';
import {
    WaitlistEntry,
    WaitlistCreate,
    WaitlistUpdate,
} from '../api/types/admin';

interface WaitlistState {
    entries: WaitlistEntry[];
    loading: boolean;
    error: string | null;
}

const initialState: WaitlistState = {
    entries: [],
    loading: false,
    error: null,
};

export const fetchWaitlistEntries = createAsyncThunk(
    'waitlist/fetchWaitlistEntries',
    async (params: {
        page: number;
        page_size: number;
        sire_id?: number;
        dam_id?: number;
        color?: string;
    }) => {
        const data = await filterWaitlistEntries(params);
        return data;
    },
);

export const addWaitlistEntry = createAsyncThunk(
    'waitlist/addWaitlistEntry',
    async (entry: WaitlistCreate) => {
        const data = await createWaitlistEntry(entry);
        return data;
    },
);

export const editWaitlistEntry = createAsyncThunk(
    'waitlist/editWaitlistEntry',
    async ({ id, entry }: { id: number; entry: WaitlistUpdate }) => {
        const data = await updateWaitlistEntry(id, entry);
        return data;
    },
);

export const removeWaitlistEntry = createAsyncThunk(
    'waitlist/removeWaitlistEntry',
    async (id: number) => {
        await deleteWaitlistEntry(id);
        return id;
    },
);

const waitlistSlice = createSlice({
    name: 'waitlist',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWaitlistEntries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWaitlistEntries.fulfilled, (state, action) => {
                state.entries = action.payload.items;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchWaitlistEntries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load waitlist entries';
            })
            .addCase(addWaitlistEntry.fulfilled, (state, action) => {
                state.entries.push(action.payload);
                state.error = null;
            })
            .addCase(editWaitlistEntry.fulfilled, (state, action) => {
                const index = state.entries.findIndex(
                    (entry) => entry.id === action.payload.id,
                );
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(removeWaitlistEntry.fulfilled, (state, action) => {
                state.entries = state.entries.filter(
                    (entry) => entry.id !== action.payload,
                );
                state.error = null;
            });
    },
});

export default waitlistSlice.reducer;
