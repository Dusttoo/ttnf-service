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

// Async actions to handle API calls
export const fetchPages = createAsyncThunk('pages/fetchPages', async () => {
    const pages = await getPages();
    return pages;
});

export const fetchPageBySlug = createAsyncThunk('pages/fetchPageBySlug', async (slug: string) => {
    const page = await getPageBySlug(slug);
    return page;
});

export const addPage = createAsyncThunk('pages/addPage', async (pageData: Partial<Page>) => {
    const page = await createPage(pageData);
    return page;
});

export const updateExistingPage = createAsyncThunk('pages/updateExistingPage', async ({ id, pageData }: { id: string, pageData: Page }) => {
    await updatePage(id, pageData);
    return { id, pageData };
});

export const removePage = createAsyncThunk('pages/removePage', async (pageId: string) => {
    await deletePage(pageId);
    return pageId;
});

const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        // Content manipulation actions should work with raw HTML now
        updatePageContent: (state, action) => {
            const { pageId, content } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
                page.content = content; // Directly updating HTML content
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
            .addCase(fetchPageBySlug.fulfilled, (state, action) => {
                const existingPage = state.pages.find(page => page.id === action.payload.id);
                if (!existingPage) {
                    state.pages.push(action.payload);
                }
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

// Export the actions
export const { updatePageContent, addTagToPage, removeTagFromPage } = pageSlice.actions;

// Export the reducer
export default pageSlice.reducer;