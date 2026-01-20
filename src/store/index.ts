import { configureStore, type Middleware } from '@reduxjs/toolkit'
import todoReducer from './todoSlice'
import materialLibraryReducer from './materialLibrarySlice'

/** 初始化redux仓库数据 */
const preloadedState = (): Partial<{ todo: any }> => {
    const state = localStorage.getItem('task_flow_state')
    if (!state) return {};
    try {
        return JSON.parse(state)
    } catch (error) {
        console.error(error)
        return {}
    }
}

/** 防抖函数 */
const throttle = (fn: (props?: any) => void, delay: number = 1000) => {
    let timeout: number | undefined;
    return (...argus: any) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            fn(...argus);
            timeout = undefined
        }, delay)
    }
}

/** redux中间件，action执行完成后运行自定义逻辑 */
const middleware: Middleware = store => next => action => {
    const result = next(action)
    /** 缓存redux数据到本地localstorage */
    stateSaveToLocalStorage(store.getState())
    return result
}

/** 存储redux数据到本地 */
const stateSaveToLocalStorage = throttle((state: any) => {
    const payload = { todo: state.todo, materialLibrary: state.materialLibrary }
    const stateString = JSON.stringify(payload)
    localStorage.setItem('task_flow_state', stateString)
})

const store = configureStore({
    reducer: {
        todo: todoReducer,
        materialLibrary: materialLibraryReducer

    },
    preloadedState: preloadedState(),
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(middleware)
})

export type RootStore = ReturnType<typeof store.getState>
export default store