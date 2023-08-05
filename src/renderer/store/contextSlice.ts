import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '.';

export interface Context {
  backendURL: string
  userID: string
  name: string
}
export interface ContextState {
  contexts: Context[]
  activeContext: Context | null
}

const initialState: ContextState = {
  contexts: [],
  activeContext: null,
}

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    addContext: (state, action: PayloadAction<Context>) => {
      state.contexts.push(action.payload)
    },
    removeContext: (state, action: PayloadAction<number>) => {
      state.contexts.splice(action.payload, 1)
    },
    setActiveContext: (state, action: PayloadAction<Context>) => {
      state.activeContext = action.payload;
    },
  },
});

export const selectActiveContext = (state: RootState) => state.context.activeContext;
export const selectContexts = (state: RootState) => state.context.contexts;

export const { addContext, removeContext, setActiveContext } = contextSlice.actions;

export default contextSlice.reducer;