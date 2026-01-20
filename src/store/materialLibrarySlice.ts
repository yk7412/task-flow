import { createSlice } from '@reduxjs/toolkit'
import { todoSliceInitialState, todoSliceReducer, type Reducers, type TodoState } from './todoSlice'

const reducers: Reducers<TodoState> = {
    ...todoSliceReducer
}

const materialLibrarySlice = createSlice({
    name: 'materialLibrary',
    initialState: todoSliceInitialState,
    reducers: reducers
})

export const {
    addTask,
    toggleTaskCompleted,
    updateTask,
    removeTask,
    moveTask,
    setFocusId,
    updateTagList,
    toggleTaskExpand,
    updatePreferences
} = materialLibrarySlice.actions
export default materialLibrarySlice.reducer