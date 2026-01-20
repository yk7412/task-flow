import { useDispatch, useSelector } from "react-redux"
import TodoList from "../../components/TodoList"
import type { RootStore } from "../../store"
import type { AddTaskProps, Preferences, Task } from "../../store/todoSlice"
import {
    addTask as addTaskReducer,
    toggleTaskCompleted as toggleTaskCompletedReducer,
    updateTask as updateTaskReducer,
    removeTask as removeTaskReducer,
    // moveTask as moveTaskReducer,
    setFocusId as setFocusIdReducer,
    updateTagList as updateTagListReducer,
    toggleTaskExpand as toggleTaskExpandReducer,
    updatePreferences
} from "../../store/materialLibrarySlice"

const MaterialLibrary = () => {
    const dispatch = useDispatch()

    /** 任务列表 */
    const taskList = useSelector((store: RootStore) => store.materialLibrary.taskList)
    /** 焦点任务Id */
    const focusId = useSelector((store: RootStore) => store.materialLibrary.focusId)
    /** 标签选项列表 */
    const tagList = useSelector((store: RootStore) => store.materialLibrary.tagList)
    /** 优先级选项列表 */
    const priorityList = useSelector((store: RootStore) => store.materialLibrary.priorityList)
    /** 偏好配置 */
    const preferences = useSelector((store: RootStore) => store.materialLibrary.preferences)

    const actions = {
        addTask: (props: AddTaskProps) => dispatch(addTaskReducer(props)),
        toggleTaskCompleted: (id: number, checked: boolean) => dispatch(toggleTaskCompletedReducer({ id, checked })),
        updateTask: (id: number | null, value: Partial<Task>) => dispatch(updateTaskReducer({ id, value })),
        removeTask: (id: number) => dispatch(removeTaskReducer({ id })),
        toggleTaskExpand: (id: number, expand: boolean) => dispatch(toggleTaskExpandReducer({ id, expand })),
        setFocusId: (id: number) => dispatch(setFocusIdReducer(id)),
        preferencesOnChange: (changeValue: Partial<Preferences>) => dispatch(updatePreferences(changeValue)),
        updateTagList: (tagList: string[]) => dispatch(updateTagListReducer(tagList))
    }

    return <div className="material-library">
        <TodoList
            actions={actions}
            taskList={taskList}
            focusId={focusId}
            tagList={tagList}
            priorityList={priorityList}
            preferences={preferences}
        />
    </div>
}

export default MaterialLibrary