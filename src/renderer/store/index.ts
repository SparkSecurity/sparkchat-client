import { configureStore } from "@reduxjs/toolkit";
import { Middleware, combineReducers } from 'redux';
import contextReducer from "./contextSlice";

const localStorageMiddleware: Middleware<{}, RootState> = ({ getState }) => {
  return next => action => {
    const result = next(action);
    localStorage.setItem('contexts', JSON.stringify(getState().context.contexts));
    return result;
  }
}

const loadFromLocalStorage = (): RootState => {
  return {
    context: {
      activeContext: null,
      contexts: JSON.parse(localStorage.getItem('contexts') || '[]')
    }
  }
}

const rootReducer = combineReducers({
  context: contextReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState: loadFromLocalStorage(),
});

export default store;
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch