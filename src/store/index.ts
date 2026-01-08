import {configureStore, type Middleware} from '@reduxjs/toolkit'
import todoReducer from './todoSlice'

const preloadedState = (): Partial<{todo: any}> => {
    const state = localStorage.getItem('task_flow_state')
    if(!state) return {};
    try {
        return JSON.parse(state)
    } catch (error) {
        console.error(error)
        return {}
    }
}

const throttle = (fn: (props?: any) => void, delay: number = 1000) => {
    let timeout: number | undefined;
    return (...argus: any) => {
        if(timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            fn(...argus);
            timeout = undefined
        }, delay)
    }
}

const middleware: Middleware = store => next => action => {
    const result = next(action)
    stateSaveToLocalStorage(store.getState())
    return result
}

const stateSaveToLocalStorage = throttle((state: any) => {
    const payload = {todo: state.todo}
    const stateString = JSON.stringify(payload)
    localStorage.setItem('task_flow_state', stateString)
})

const store = configureStore({
    reducer: {
        todo: todoReducer
    },
    preloadedState: preloadedState(),
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(middleware)
})

export type RootStore = ReturnType<typeof store.getState>
export default store