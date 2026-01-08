import type { Task } from "../store/todoSlice";

/** 根据优先级返回对应颜色 */
export const getPriorityColor = (priority: 0 | 1 | 2) => {
    let color;
    switch (priority) {
        case 0:
            color = '#e53935';
            break
        case 1:
            color = '#1e88e5';
            break
        case 2:
            color = '#4caf50';
            break
        default:
            color = '#9e9e9e';
    }
    return color
}

/** 获取当前任务下的所有子任务Id(包含当前任务) */
export const getAllChildIds = (id: number, taskList: Task[]): number[] => {
    const childTasks = taskList.filter(task => task.parent === id)
    return [id, ...childTasks.flatMap(task => [task.id, ...getAllChildIds(task.id, taskList)])]
}