import { createSlice } from '@reduxjs/toolkit';

interface EditModeState {
    isEditMode: boolean;
}

const initialState: EditModeState = {
    isEditMode: false,
};

const editModeSlice = createSlice({
    name: 'editMode',
    initialState,
    reducers: {
        toggleEditMode(state) {
            state.isEditMode = !state.isEditMode;
        },
    },
});

export const { toggleEditMode } = editModeSlice.actions;
export default editModeSlice.reducer;