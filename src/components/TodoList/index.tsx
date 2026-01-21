import { useEffect, useMemo, useRef, useState } from "react"
import TodoItem from "./TodoItem"
import AddInput from "./InputGroup"
import './index.less'
import TodoItemDetail from "./TodoItemDetail"
import type { AddTaskProps, Preferences, Task, TodoState } from "../../store/todoSlice"
import { useDispatch, useSelector } from "react-redux"
import type { RootStore } from "../../store"
import { moveTask as moveTaskReducer } from "../../store/todoSlice"
import { getAllChildIds } from "../../utils/common"
import { Button, message } from "antd"
import PreferencesModal from "./PreferencesModal"

/** 拖拽功能目标任务信息 */
interface TargetInfo {
    /** 任务Id */
    id: number | null,
    /** 任务移动形式(兄弟任务/子任务) */
    edge: 'brother' | 'son',
    /** 鼠标当前位置与目标任务中心的垂直距离 */
    dist: number,
    /** 相对视口顶部的垂直距离 */
    y: number | null
}

/** 拖拽功能任务项位置信息 */
interface TaskCoordinateItem {
    /** 任务Id */
    id: number
    /** 任务项上边沿与视口顶部的距离(用于确定任务项的垂直范围) */
    top: number
    /** 任务项中心与视口顶部的距离(用于计算鼠标与任务项中心的距离) */
    center: number
    /** 任务项底边与视口顶部的距离(用于确定任务项的垂直范围) */
    bottom: number
    /** 任务项左边沿与视口左侧的距离 */
    left: number
    /** 任务标题 */
    title: string
}

/**
 * 鼠标拖拽排序Hook
 * 
 * 鼠标点击拖拽柄
 * 监听鼠标位置
 * 获取所有任务项上下边缘位置
 * 鼠标移动监听回调实时计算举例鼠标最近的边缘线
 * 在边缘线位置动态插入元素，记录当前任务项id
 * 松开鼠标调整任务项位置到目标任务项前/后
 * 
 * 鼠标离开TodoList、视窗的处理逻辑
 * 目标位置在当前视窗外自动滚动页面
 */
const useTaskItemHandleDrag = () => {

    /** 任务列表 */
    const taskList = useSelector((state: RootStore) => state.todo.taskList)
    const dispatch = useDispatch()
    // 源任务Id
    const [sourceId, setSourceId] = useState<number | null>(null)
    /** 目标任务信息 */
    const targetInfo = useRef<TargetInfo>(null)
    // 所有任务的位置信息
    const [taskCoordinateList, setTaskCoordinateList] = useState<TaskCoordinateItem[]>([])
    useEffect(() => {
        const result: TaskCoordinateItem[] = []

        if (!(taskList instanceof Array) || !taskList.length) return;

        // 记录所有任务项的基本信息以及相对位置信息
        taskList.forEach(task => {
            const dom = document.getElementById(`${task.id}`)
            const inputDom = document.getElementById(String(task.id))
            if (!dom || !inputDom) return
            const { top, bottom, left } = dom.getBoundingClientRect();
            const { top: inputTop, bottom: inputBottom } = inputDom?.getBoundingClientRect()
            result.push({
                id: task.id,
                top: top,
                center: (inputTop + inputBottom) / 2,
                bottom: bottom,
                left,
                title: task.title
            })

        })

        setTaskCoordinateList(result)
    }, [taskList])

    useEffect(() => {
        // 初始化拖拽标示线
        const dropIndicator = document.createElement('div')
        dropIndicator.id = 'task-drop-indicator'
        Object.assign(dropIndicator.style, {
            height: '3px',
            width: '100%',
            background: '#1976d2',
            position: 'absolute',
            left: '0',
            zIndex: '999',
            display: 'none'
        })
        document.body.appendChild(dropIndicator)

        // 组件卸载清除标示线
        return () => {
            document.body.removeChild(dropIndicator)
        }
    }, [])

    useEffect(() => {

        if (sourceId === null) return
        /** 拖拽标示线 */
        const dropIndicator = document.getElementById('task-drop-indicator')
        if (!dropIndicator) return

        /** 拖拽功能鼠标移动回调 */
        const taskItemHandleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event

            /** 目标任务信息 */
            let closest: TargetInfo = {
                id: null,
                edge: 'brother',
                dist: Infinity,
                y: null
            }

            // 获取查找与鼠标指针垂直距离最小的任务
            taskCoordinateList.forEach(item => {
                const dist = Math.abs(clientY - item.center)
                if (dist < closest.dist) {
                    closest = { id: item.id, dist, edge: 'brother', y: item.bottom }
                }
            })

            const inputDom = document.querySelector(`#todo-item-${closest.id} .ant-input-affix-wrapper`)
            if (!inputDom) return
            const { left, width } = inputDom.getBoundingClientRect()
            // 以任务项输入框左边框为基准线
            // 鼠标指针位于基准线左侧将源任务添加为目标任务的兄弟任务
            // 位于右侧添加为子任务
            closest.edge = clientX > left ? 'son' : 'brother'
            targetInfo.current = closest
            // 移动拖拽标示线到目标任务下边沿
            Object.assign(dropIndicator.style, {
                display: 'block',
                top: `${closest.y as number + window.scrollY}px`,
                left: `${left + window.scrollX + (closest.edge === 'son' ? 20 : 0)}px`,
                width: `${width - (closest.edge === 'son' ? 20 : 0)}px`
            })
        }

        /** 拖拽功能鼠标按键抬起回调 */
        const taskItemHandleMouseUp = () => {
            const ids = getAllChildIds(sourceId, taskList)
            // 当目标任务为源任务的子任务时,取消拖拽操作并提示
            if (!ids.includes(targetInfo.current?.id as number)) {
                // 更新任务位置
                dispatch(moveTaskReducer({ sourceId, targetId: targetInfo.current?.id, edge: targetInfo.current?.edge }))
            } else {
                message.error('不能将父任务移动到子任务下')
            }
            // 重置目标任务/源任务/拖拽标示线/页面文字可选状态
            targetInfo.current = null
            setSourceId(null)
            dropIndicator.style.display = 'none'
            document.body.style.userSelect = ''
        }

        // 任务项更新/鼠标点击任务项拖拽柄,添加鼠标监听事件
        window.addEventListener('mousemove', taskItemHandleMouseMove)
        window.addEventListener('mouseup', taskItemHandleMouseUp)

        // 移除鼠标监听
        return () => {
            window.removeEventListener('mousemove', taskItemHandleMouseMove)
            window.removeEventListener('mouseup', taskItemHandleMouseUp)
        }

    }, [taskCoordinateList, sourceId])

    /** 任务项拖拽柄鼠标按键按下回调 */
    const taskItemHandleMouseDown = (id: number) => {
        // 更新源任务信息
        setSourceId(id)
        // 拖拽过程中页面文字禁止选中(优化体验)
        document.body.style.userSelect = 'none'
    }

    return {
        taskItemHandleMouseDown
    }
}

/** 任务树数据结构 */
interface TaskTreeItem extends Task {
    children: Task[]
}

export interface TodoListProps {
    actions: {
        addTask: (props: AddTaskProps) => void,
        toggleTaskCompleted: (id: number, checked: boolean) => void,
        updateTask: (id: number | null, value: Partial<Task>) => void,
        removeTask: (id: number) => void,
        toggleTaskExpand: (id: number, expand: boolean) => void,
        setFocusId: (id: number) => void,
        preferencesOnChange: (changeValue: Partial<Preferences>) => void
        updateTagList: (tagList: string[]) => void
        addTaskToTodoList?: (id: number) => void
    }
    /** 任务列表 */
    taskList: TodoState['taskList']
    /** 焦点任务Id */
    focusId: TodoState['focusId']
    /** 标签选项列表 */
    tagList: TodoState['tagList']
    /** 优先级选项列表 */
    priorityList: TodoState['priorityList']
    /** 偏好配置 */
    preferences: TodoState['preferences']
    /** 组件模式 todo-任务列表 material-素材库 */
    mode?: 'todo' | 'material'
}

function TodoList(props: TodoListProps) {

    const {
        actions,
        taskList,
        focusId,
        tagList,
        priorityList,
        preferences,
        mode = 'todo'
    } = props

    // 初始化拖拽功能
    const { taskItemHandleMouseDown } = useTaskItemHandleDrag()

    // 更新当前焦点任务
    useEffect(() => {
        if (focusId) {
            const dom = document.getElementById(String(focusId))
            dom && dom.focus()
        }
    }, [focusId])

    /** 提取任务树中所有任务Id */
    const getTaskIdsFromTree = (taskTree: TaskTreeItem[]): number[] => {
        // flatMap自动摊平次一级数组
        return taskTree.flatMap(task => {
            return [task.id, ...getTaskIdsFromTree(task.children || [])]
        })
    }

    /** 任务树 */
    const taskTree = useMemo(() => {
        /** 顶级任务列表 */
        const rootTaskList: TaskTreeItem[] = []
        const taskMap = new Map<number, TaskTreeItem>()
        // 将所有任务项以id为索引添加到Map中
        taskList.forEach(task => {
            taskMap.set(task.id, { ...task, children: [] })
        })
        taskList.forEach(task => {
            if (task.parent === null) {
                // 任务项没有parent（父任务），添加到rootTaskList作为任务树的顶级任务
                rootTaskList.push(taskMap.get(task.id)!)
            } else {
                /*
                    有parent（父任务）的任务项
                    将父任务从Map中提取出来，将任务加入父任务的children列表中
                    因为复杂数据类型的引用关系
                    Map中提取的父任务加入了子任务后
                    rootTaskList任务树中对应的任务也就同步添加了子任务
                    以此实现任务树的构建
                */
                const parent = taskMap.get(task.parent)
                parent?.children.push(taskMap.get(task.id)!)
            }
        })
        return rootTaskList
    }, [taskList])

    /** 所有任务Id集合 */
    const taskIds = useMemo(() => getTaskIdsFromTree(taskTree), [taskTree])

    return (
        <div className="todo-list">
            <div className="todo-list-box">
                <div className="todo-list-center">
                    <Button onClick={() => {
                        localStorage.removeItem('task_flow_state')
                        window.location.reload()
                    }} >清除数据</Button>
                    <div className="todo-list-center-top">
                        <AddInput addTask={actions.addTask} />
                        <PreferencesModal
                            tagList={tagList}
                            priorityList={priorityList}
                            value={preferences}
                            onChange={actions.preferencesOnChange}
                            updateTagList={actions.updateTagList}
                        />
                    </div>
                    <div className='todo-list-items' >
                        {taskTree.map(task => (
                            <TodoItem
                                key={task.id}
                                task={task}
                                taskIds={taskIds}
                                actions={actions}
                                taskItemHandleMouseDown={taskItemHandleMouseDown}
                                preferences={preferences}
                                taskList={taskList}
                                mode={mode}
                            />
                        ))}
                    </div>
                </div>
                <div className="todo-list-right">
                    <TodoItemDetail
                        focusId={focusId}
                        taskList={taskList}
                        updateTask={actions.updateTask}
                        tagList={tagList}
                        priorityList={priorityList}
                        updateTagList={actions.updateTagList}
                        mode={mode}
                    />
                </div>
            </div>
        </div>
    )
}

export default TodoList
