import { createSlice, createAsyncThunk, AnyAction } from '@reduxjs/toolkit';
import {
    getPages,
    createPage,
    deletePage,
    updatePage,
    getPageBySlug,
} from '../api/pageApi';
import { Page } from '../api/types/page';

interface PageState {
    pages: Page[];
    error: string | null;
}

const initialState: PageState = {
    pages: [],
    error: null,
};

type RejectedAction = AnyAction & { error: { message: string } };

// Async thunks
export const fetchPages = createAsyncThunk<Page[]>(
    'pages/fetchPages',
    async () => {
        return await getPages();
    },
);

export const fetchPageBySlug = createAsyncThunk<
    Page,
    string,
    { rejectValue: string }
>('pages/fetchPageBySlug', async (slug, { rejectWithValue }) => {
    const timeout = 5000;
    const fetchWithTimeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout),
    );

    try {
        const page = await Promise.race([getPageBySlug(slug), fetchWithTimeout]);
        return page as Page;
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
});

export const addPage = createAsyncThunk<Page, Partial<Page>>(
    'pages/addPage',
    async (pageData) => {
        return await createPage(pageData);
    },
);

export const updateExistingPage = createAsyncThunk<
    { id: string; pageData: Page },
    { id: string; pageData: Page }
>('pages/updateExistingPage', async ({ id, pageData }) => {
    await updatePage(id, pageData);
    return { id, pageData };
});

export const removePage = createAsyncThunk<string, string>(
    'pages/removePage',
    async (pageId) => {
        await deletePage(pageId);
        return pageId;
    },
);

// Slice
const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        updatePageContent: (state, action) => {
            const { pageId, content } = action.payload;
            const page = state.pages.find((p) => p.id === pageId);
            if (page) {
                Object.assign(page, content);
            }
        },
        addTagToPage: (state, action) => {
            const { pageId, tag } = action.payload;
            const page = state.pages.find((p) => p.id === pageId);
            if (page) {
                page.tags = page.tags ? [...page.tags, tag] : [tag];
            }
        },
        removeTagFromPage: (state, action) => {
            const { pageId, tag } = action.payload;
            const page = state.pages.find((p) => p.id === pageId);
            if (page && page.tags) {
                page.tags = page.tags.filter((t) => t !== tag);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPages.fulfilled, (state, action) => {
                state.pages = action.payload;
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(fetchPageBySlug.fulfilled, (state, action) => {
                const existingPage = state.pages.find((page) => page.id === action.payload.id);
                if (!existingPage) {
                    state.pages.push(action.payload);
                }
            })
            .addCase(fetchPageBySlug.rejected, (state, action) => {
                state.error = action.payload || 'Failed to load page';
            })
            .addCase(addPage.fulfilled, (state, action) => {
                state.pages.push(action.payload);
            })
            .addCase(updateExistingPage.fulfilled, (state, action) => {
                const { id, pageData } = action.payload;
                const existingPage = state.pages.find((page) => page.id === id);
                if (existingPage) {
                    Object.assign(existingPage, pageData);
                }
            })
            .addCase(removePage.fulfilled, (state, action) => {
                state.pages = state.pages.filter((page) => page.id !== action.payload);
            })
            .addMatcher(
                (action): action is RejectedAction => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.error = action.error.message || 'An error occurred';
                },
            );
    },
});

export const { updatePageContent, addTagToPage, removeTagFromPage } = pageSlice.actions;

export default pageSlice.reducer;