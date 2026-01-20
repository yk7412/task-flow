import { Button, Checkbox, Dropdown, Input, type MenuProps, Modal } from 'antd'
import './TodoItem.less'
import { getAllChildIds, getPriorityColor } from "../../utils/common";
import type { AddTaskProps, Preferences, Task } from '../../store/todoSlice';
import { HolderOutlined, RightOutlined } from '@ant-design/icons';

interface TodoItemProps {
  task: Task,
  taskIds: number[]
  toggleTaskCompleted: (id: number, checked: boolean) => void
  updateTask: (id: number, value: Partial<Task>) => void
  removeTask: (id: number) => void
  addTask: (value: AddTaskProps) => void
  setFocusId: (id: number) => void
  taskItemHandleMouseDown: (id: number) => void
  toggleTaskExpand: (id: number, expand: boolean) => void
  preferences: Preferences
  taskList: Task[]
}

const actionMenu: MenuProps['items'] = [
  {
    key: '1',
    label: '添加子任务'
  }
]

const TodoItem = (props: TodoItemProps) => {
  const {
    task,
    taskIds,
    toggleTaskCompleted,
    updateTask,
    removeTask,
    addTask,
    setFocusId,
    taskItemHandleMouseDown,
    toggleTaskExpand,
    preferences,
    taskList
  } = props;

  const actionMenuOnClick = (key: string, task: Task) => {
    if (key === '1') {
      addTask({ title: '', parentId: task.id, focus: true })
    }

  }


  const inputOnKeyDown = (task: Task, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addTask({ title: '', parentId: task.parent || null, brotherId: task.id, focus: true })
    } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      const index = taskIds.findIndex(id => id === task.id)
      if (index < 0) return
      const num = (event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? +1 : 0)
      const targetIndex = index + num
      const targetId = taskIds[targetIndex]
      if (targetIndex < 0 || targetIndex === index) return
      setFocusId(targetId)
    }
  }


  return <div id={'todo-item-' + task.id} className={task.completed ? "todo-item completed" : "todo-item"} >
    <div className="todo-item-task">
      <RightOutlined
        className={`todo-item-icon todo-item-expand-handle ${task.expand ? 'todo-item-expanded' : 'todo-item-collapsed'}`}
        onClick={() => toggleTaskExpand(task.id, !task.expand)}
      />
      <HolderOutlined
        className='todo-item-icon todo-item-drag-handle'
        onMouseDown={() => taskItemHandleMouseDown(task.id)}
      />
      <Checkbox checked={task.completed} onChange={(event) => {
        if (preferences.confirmInCompleteSubtasks && event.target.checked) {
          const ids = getAllChildIds(task.id, taskList).filter(id => id !== task.id)
          const childList = taskList.filter(item => ids.includes(item.id) && item.completed === false)
          if (childList.length) {
            Modal.confirm({
              content: '该任务包含未完成的子任务，确定要完成吗',
              okText: '确认',
              cancelText: '取消',
              maskClosable: true,
              onOk: () => { toggleTaskCompleted(task.id, event.target.checked) }
            })
          } else {
            toggleTaskCompleted(task.id, event.target.checked)
          }
        } else {
          toggleTaskCompleted(task.id, event.target.checked)
        }
      }} />
      <Input
        id={String(task.id)}
        prefix={<div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: getPriorityColor(task.priority) }} ></div>}
        className="todo-item-title"
        value={task.title}
        disabled={task.completed}
        onKeyDown={event => inputOnKeyDown(task, event)}
        onChange={event => updateTask(task.id, { title: event.target.value })}
        onFocus={() => setFocusId(task.id)}
      />
      <Dropdown trigger={['click']} menu={{ items: actionMenu, onClick: event => actionMenuOnClick(event.key, task) }} >
        <Button className="todo-item-action-btn" type='primary' size="small" >更多</Button>
      </Dropdown>
      <Button className="todo-item-delete-btn" type='dashed' danger={true} size='small' onClick={() => {
        if (preferences.confirmBeforeDelete) {
          Modal.confirm({
            content: '确定要删除该任务吗',
            okText: '确定',
            cancelText: '取消',
            maskClosable: true,
            onOk: () => { removeTask(task.id) },
          })
        } else {
          removeTask(task.id)
        }
      }} >删除</Button>
    </div>
    {task.children instanceof Array && <div className="todo-item-children" >
      {task.children.map(children => {
        return <TodoItem
          key={children.id}
          task={children}
          taskIds={taskIds}
          toggleTaskCompleted={toggleTaskCompleted}
          updateTask={updateTask}
          removeTask={removeTask}
          addTask={addTask}
          setFocusId={setFocusId}
          taskItemHandleMouseDown={taskItemHandleMouseDown}
          toggleTaskExpand={toggleTaskExpand}
          preferences={preferences}
          taskList={taskList}
        />
      })}
    </div>}
  </div>
}

export default TodoItem
