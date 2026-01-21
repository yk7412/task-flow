import { createSlice } from '@reduxjs/toolkit'
import { getAllChildIds } from '../utils/common'

/** 任务项 */
export interface Task {
    id: number
    /** 任务标题 */
    title: string
    /** 已完成 */
    completed: boolean
    /** 父任务Id */
    parent: number | null
    /** 是否展开 */
    expand: boolean
    /** 是否隐藏 */
    hidden: boolean
    /** 创建时间 */
    createTime: number
    /** 更新时间 */
    updateTime: number
    /** 优先级 0-高； 1-中； 2-低 */
    priority: 0 | 1 | 2
    /** 标签 */
    tag?: string[]
    /** 备注 */
    remark?: string
    /** 子任务集合 */
    children: Task[]
    /** 重复类型 0-循环 1-一次性 */
    repeatType: 0 | 1
}

/** 偏好配置 */
export interface Preferences {
    /** 删除任务前二次确认 */
    confirmBeforeDelete: boolean
    /** 完成任务时若存在未完成子任务二次确认 */
    confirmInCompleteSubtasks: boolean
    /** 默认优先级 */
    defaultPriority: 0 | 1 | 2
    /** 默认标签 */
    defaultTag?: null
}

/** Todo页面数据 */
export interface TodoState {
    /** 任务列表 */
    taskList: Task[]
    /** 隐藏任务列表 */
    hiddenTaskList: Task[]
    /** 焦点任务Id */
    focusId: number | null
    /** 可选标签列表 */
    tagList: string[]
    /** 可选优先级列表 */
    priorityList: { label: string, value: number }[]
    /** 偏好配置 */
    preferences: Preferences
}

export const todoSliceInitialState: TodoState = {
    taskList: [],
    hiddenTaskList: [],
    focusId: null,
    tagList: ['工作', '学习', '生活', '娱乐'],
    priorityList: [
        {
            label: '高',
            value: 0
        },
        {
            label: '中',
            value: 1
        },
        {
            label: '低',
            value: 2
        }
    ],
    preferences: {
        confirmBeforeDelete: false,
        confirmInCompleteSubtasks: true,
        defaultPriority: 0,
        defaultTag: null
    }
}

/** 任务项添加函数参数配置 */
export interface AddTaskProps {
    title: string,
    parentId?: number | null,
    brotherId?: number | null,
    focus?: boolean
}

/** 自定义Reducers数据结构 */
export interface Reducers<T = TodoState> { [key: string]: (state: T, action: { type: string, payload: any }) => void }

// export const todoSliceReducer: {[key: string]: CaseReducer<TodoState, PayloadAction<any>>} = {
export const todoSliceReducer: Reducers = {
    /** 增加任务项 */
    addTask: (state, action) => {
        const { title, parentId = null, brotherId = null, focus }: AddTaskProps = action.payload
        const id = state.taskList.reduce((max, t) => Math.max(max, t.id), 0) + 1
        // 任务数据初始化
        const task: Task = {
            id,
            title: title,
            completed: false,
            parent: parentId,
            expand: false,
            hidden: false,
            createTime: Date.now(),
            updateTime: Date.now(),
            priority: state.preferences.defaultPriority || 0,
            tag: state.preferences.defaultTag || undefined,
            children: [],
            repeatType: 1
        }
        // 添加为子任务时自动展开父任务
        if (parentId) {
            const parent = state.taskList.find(item => item.id === parentId)
            if (parent) {
                parent.expand = true
            }
        }
        // 兄弟任务添加到相邻位置
        if (brotherId) {
            const index = state.taskList.findIndex(t => t.id === brotherId)
            if (index !== -1) {
                state.taskList.splice(index + 1, 0, task)
            }
        } else {
            state.taskList.push(task)
        }
        // 自动获取焦点
        if (focus) {
            state.focusId = id
        }
    },
    /** 更新任务 */
    updateTask: (state, action) => {
        const { id, value }: { id: number | null, value: Partial<Task> } = action.payload
        const task = state.taskList.find(task => id === task.id)
        if (task) {
            Object.assign(task, value)
            task.updateTime = Date.now()
        }
    },
    /** 删除任务 */
    removeTask: (state, action) => {
        const { id }: { id: number } = action.payload
        const ids = getAllChildIds(id, state.taskList)
        state.taskList = state.taskList.filter(task => !ids.includes(task.id))
    },
    /** 移动任务 */
    moveTask: (state, action) => {
        const { sourceId, targetId, edge }: { sourceId: number, targetId: number, edge: 'brother' | 'son' } = action.payload
        /** 源任务索引 */
        const sourceIndex = state.taskList.findIndex(task => task.id === sourceId)
        /** 目标任务索引 */
        const targetIndex = state.taskList.findIndex(task => task.id === targetId)
        // 源任务=目标任务;找不到源任务/目标任务 直接结束
        if (sourceId === targetId || sourceIndex < 0 || targetIndex < 0) return
        // 将源任务从任务列表中提取出来
        const [source] = state.taskList.splice(sourceIndex, 1)
        /** 新目标任务索引(提取完源任务,目标任务位置可能发生变化,需要重新获取) */
        const newTargetIndex = state.taskList.findIndex(task => task.id === targetId)
        /** 目标任务 */
        const target = state.taskList[newTargetIndex]
        // 找不到目标任务时的保护任务
        if (!target) {
            state.taskList.push(source)
            return
        }
        // 添加为目标任务的子任务
        if (edge === 'son') {
            source.parent = target.id
            target.expand = true
        } else {
            // 添加为目标任务的兄弟任务(设置共同的父任务Id)
            source.parent = target.parent;
        }
        source.updateTime = Date.now();
        // const insertIndex = edge === 'top' ? newTargetIndex : newTargetIndex + 1
        state.taskList.splice(newTargetIndex + 1, 0, source)
    },
    /** 切换任务展开收起状态 */
    toggleTaskExpand: (state, action) => {
        const { id, expand }: { id: number, expand: boolean } = action.payload
        const task = state.taskList.find(task => task.id === id)
        // 找不到任务直接结束
        if (!task) return
        // 更新展开收起状态
        task.expand = expand
        if (expand) {
            // 展开任务-将子任务从隐藏列表提取到任务列表
            const childIds = getAllChildIds(id, state.hiddenTaskList).filter(item => item !== id)
            const childTasks: Task[] = state.hiddenTaskList.filter(item => childIds.includes(item.id))
            state.taskList = state.taskList.concat(childTasks)
            state.hiddenTaskList = state.hiddenTaskList.filter(item => !childIds.includes(item.id))
        } else {
            // 收起任务-将子任务从任务列表提取到隐藏任务列表
            const childIds = getAllChildIds(id, state.taskList).filter(item => item !== id)
            const childTasks: Task[] = state.taskList.filter(item => childIds.includes(item.id))
            state.taskList = state.taskList.filter(item => !childIds.includes(item.id))
            state.hiddenTaskList = state.hiddenTaskList.concat(childTasks)
        }
    },
    /** 切换焦点任务 */
    setFocusId: (state, action) => {
        const id: number | null = action.payload
        state.focusId = id
    },
    /** 新增标签 */
    // addTag: (state, action) => {
    //     const tag: string = action.payload
    //     state.tagList.push(tag)
    // },
    /** 删除标签 */
    // removeTag: (state, action: {type: string, payload: string}) => {
    //     const tag: string = action.payload
    //     state.tagList = state.tagList.filter(t => t !== tag)
    // },
    /** 更新完整tag列表 */
    updateTagList: (state, action: { type: string, payload: string[] }) => {
        const tagList = action.payload
        if (!Array.isArray(tagList)) return
        state.tagList = tagList
    },
    /** 更新偏好配置 */
    updatePreferences: (state, action) => {
        const changeValue: Partial<Preferences> = action.payload
        if (!changeValue) return
        Object.assign(state.preferences, changeValue)
    },
    addTasksBatch: (state, action) => {

        if (!action.payload || !action.payload.tasks?.length || !action.payload.sourceId) return

        /** 需要添加的任务列表 */
        const tasks: Task[] = action.payload.tasks
        /** 选中任务Id */
        const sourceId: number = action.payload.sourceId


        let startId = state.taskList.reduce((id, item) => Math.max(id, item.id), 0) + 1
        const newIdMap: { [key: number]: number } = {}
        tasks.forEach(task => {
            newIdMap[task.id] = startId++
        })

        const nowDate = Date.now()
        const newTasks: Task[] = tasks.map(task => {

            let newParentId = null
            if (task.id !== sourceId && task.parent !== null && newIdMap[task.parent]) {
                newParentId = newIdMap[task.parent]
            }

            return {
                ...task,
                id: newIdMap[task.id],
                parent: newParentId,
                createTime: nowDate,
                updateTime: nowDate,
                completed: false,
                hidden: false,
                expand: !!task.expand
            }
        })

        state.taskList.push(...newTasks)
    }
}


const reducers: Reducers = {
    ...todoSliceReducer,
    /** 切换任务完成状态 */
    toggleTaskCompleted: (state, action) => {
        const { id, checked }: { id: number, checked: boolean } = action.payload
        const task = state.taskList.find(task => id === task.id)
        if (task) {
            task.completed = checked
            task.updateTime = Date.now()

            // 同步更新所有子任务状态
            const ids = getAllChildIds(task.id, state.taskList).filter(taskId => taskId !== task.id)
            if (!ids.length) return
            state.taskList.forEach(item => {
                if (ids.includes(item.id)) {
                    item.completed = checked
                }
            })
        }
    }
}

const todoSlice = createSlice({
    name: 'todo',
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
    updatePreferences,
    addTasksBatch
} = todoSlice.actions
export default todoSlice.reducer
