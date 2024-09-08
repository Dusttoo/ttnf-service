import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPages, createPage, deletePage, updatePage, getPageBySlug } from '../api/pageApi';
import { Page, Block, PageContent } from '../types';

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

// Utility function to parse the content string to PageContent
const parseContent = (content: string): PageContent => {
    try {
        const parsedContent = JSON.parse(content);
        return parsedContent;
    } catch (error) {
        console.error('Failed to parse page content:', error);
        return { blocks: [] };
    }
};

// Utility function to serialize PageContent to a string
const serializeContent = (content: PageContent): string => {
    try {
        return JSON.stringify(content);
    } catch (error) {
        console.error('Failed to serialize page content:', error);
        return '';
    }
};

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

export const updateExistingPage = createAsyncThunk('pages/updateExistingPage', async ({ id, pageData }: { id: number, pageData: Page }) => {
    await updatePage(id, pageData);
    return { id, pageData };
});

export const removePage = createAsyncThunk('pages/removePage', async (pageId: number) => {
    await deletePage(pageId);
    return pageId;
});

const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        addBlockToPage: (state, action) => {
            const { pageId, block } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
                const content: PageContent = parseContent(page.content);
                content.blocks.push(block);
                page.content = serializeContent(content);
            }
        },
        updateBlockInPage: (state, action) => {
            const { pageId, blockId, blockData } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
                const content: PageContent = parseContent(page.content);
                const blockIndex = content.blocks.findIndex((b: Block) => b.id === blockId);
                if (blockIndex >= 0) {
                    content.blocks[blockIndex] = { ...content.blocks[blockIndex], ...blockData };
                    page.content = serializeContent(content);
                }
            }
        },
        removeBlockFromPage: (state, action) => {
            const { pageId, blockId } = action.payload;
            const page = state.pages.find(p => p.id === pageId);
            if (page) {
                const content: PageContent = parseContent(page.content);
                content.blocks = content.blocks.filter((b: Block) => b.id !== blockId);
                page.content = serializeContent(content);
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

export const { addBlockToPage, updateBlockInPage, removeBlockFromPage } = pageSlice.actions;

export default pageSlice.reducer;