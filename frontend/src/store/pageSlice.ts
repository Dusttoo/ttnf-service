import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPages, createPage, deletePage, updatePage, getPageBySlug } from '../api/pageApi';
import { Page } from '../api/types/page';

interface PageState {
    pages: Page[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: PageState = {
    pages: [],
    status: 'idle',
    error: null,
};

export const fetchPages = createAsyncThunk<Page[]>('pages/fetchPages', async () => {
    const pages = await getPages();
    return pages;
});

export const fetchPageBySlug = createAsyncThunk<Page, string, { rejectValue: string }>(
    'pages/fetchPageBySlug',
    async (slug: string, { rejectWithValue }) => {
        const timeout = 5000;
        const fetchWithTimeout = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        );

        try {
            const page = await Promise.race([getPageBySlug(slug), fetchWithTimeout]);
            return page as Page;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('An unknown error occurred');
            }
        }
    }
);

export const addPage = createAsyncThunk<Page, Partial<Page>>('pages/addPage', async (pageData) => {
    const page = await createPage(pageData);
    return page;
});

export const updateExistingPage = createAsyncThunk<{ id: string; pageData: Page }, { id: string; pageData: Page }>(
    'pages/updateExistingPage',
    async ({ id, pageData }) => {
        await updatePage(id, pageData);
        return { id, pageData };
    }
);

export const removePage = createAsyncThunk<string, string>('pages/removePage', async (pageId) => {
    await deletePage(pageId);
    return pageId;
});

const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        updatePageContent: (state, action) => {
            const { pageId, content } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
                page.content = content;
            }
        },
        addTagToPage: (state, action) => {
            const { pageId, tag } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
                if (!page.tags) {
                    page.tags = [];
                }
                page.tags.push(tag);
            }
        },
        removeTagFromPage: (state, action) => {
            const { pageId, tag } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page && page.tags) {
                page.tags = page.tags.filter(t => t !== tag);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPages.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPages.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pages = action.payload;
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            })
            .addCase(fetchPageBySlug.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPageBySlug.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const existingPage = state.pages.find(page => page.id === action.payload.id);
                if (!existingPage) {
                    state.pages.push(action.payload);
                }
            })
            .addCase(fetchPageBySlug.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to load page';
            })
            .addCase(addPage.fulfilled, (state, action) => {
                state.pages.push(action.payload);
            })
            .addCase(updateExistingPage.fulfilled, (state, action) => {
                const { id, pageData } = action.payload;
                const existingPage = state.pages.find(page => page.id === id);
                if (existingPage) {
                    Object.assign(existingPage, pageData);
                }
            })
            .addCase(removePage.fulfilled, (state, action) => {
                state.pages = state.pages.filter(page => page.id !== action.payload);
            });
    },
});

export const { updatePageContent, addTagToPage, removeTagFromPage } = pageSlice.actions;

export default pageSlice.reducer;