import { Button, Checkbox, Dropdown, Input, type MenuProps, Modal } from 'antd'
import './TodoItem.less'
import { getAllChildIds, getPriorityColor } from "../../utils/common";
import type { AddTaskProps, Preferences, Task } from '../../store/todoSlice';
import { HolderOutlined, RightOutlined } from '@ant-design/icons';
import type { TodoListProps } from '.';

interface TodoItemProps extends Pick<TodoListProps, 'mode' | 'taskList' | 'actions'> {
  task: Task,
  taskIds: number[]
  taskItemHandleMouseDown: (id: number) => void
  preferences: Preferences
}


const TodoItem = (props: TodoItemProps) => {
  const {
    task,
    taskIds,
    taskItemHandleMouseDown,
    preferences,
    taskList,
    actions,
    mode
  } = props;

  const actionMenu: MenuProps['items'] = [
    {
      key: '1',
      label: '添加子任务'
    },
    ...(mode === 'material' ? [{
      key: '2',
      label: '添加到任务列表'
    }] : [])
  ]

  const actionMenuOnClick = (key: string, task: Task) => {
    if (key === '1') {
      actions.addTask({ title: '', parentId: task.id, focus: true })
    }
  
    if (key === '2') {
      actions.addTaskToTodoList?.(task.id)
    }
  
  }


  const inputOnKeyDown = (task: Task, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      actions.addTask({ title: '', parentId: task.parent || null, brotherId: task.id, focus: true })
    } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      const index = taskIds.findIndex(id => id === task.id)
      if (index < 0) return
      const num = (event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? +1 : 0)
      const targetIndex = index + num
      const targetId = taskIds[targetIndex]
      if (targetIndex < 0 || targetIndex === index) return
      actions.setFocusId(targetId)
    }
  }


  return <div id={'todo-item-' + task.id} className={task.completed ? "todo-item completed" : "todo-item"} >
    <div className="todo-item-task">
      <RightOutlined
        className={`todo-item-icon todo-item-expand-handle ${task.expand ? 'todo-item-expanded' : 'todo-item-collapsed'}`}
        onClick={() => actions.toggleTaskExpand(task.id, !task.expand)}
      />
      <HolderOutlined
        className='todo-item-icon todo-item-drag-handle'
        onMouseDown={() => taskItemHandleMouseDown(task.id)}
      />
      {mode === 'todo' && <Checkbox checked={task.completed} onChange={(event) => {
        if (preferences.confirmInCompleteSubtasks && event.target.checked) {
          const ids = getAllChildIds(task.id, taskList).filter(id => id !== task.id)
          const childList = taskList.filter(item => ids.includes(item.id) && item.completed === false)
          if (childList.length) {
            Modal.confirm({
              content: '该任务包含未完成的子任务，确定要完成吗',
              okText: '确认',
              cancelText: '取消',
              maskClosable: true,
              onOk: () => { actions.toggleTaskCompleted(task.id, event.target.checked) }
            })
          } else {
            actions.toggleTaskCompleted(task.id, event.target.checked)
          }
        } else {
          actions.toggleTaskCompleted(task.id, event.target.checked)
        }
      }} />}
      <Input
        id={String(task.id)}
        prefix={<div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: getPriorityColor(task.priority) }} ></div>}
        className="todo-item-title"
        value={task.title}
        disabled={task.completed}
        onKeyDown={event => inputOnKeyDown(task, event)}
        onChange={event => actions.updateTask(task.id, { title: event.target.value })}
        onFocus={() => actions.setFocusId(task.id)}
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
            onOk: () => { actions.removeTask(task.id) },
          })
        } else {
          actions.removeTask(task.id)
        }
      }} >删除</Button>
    </div>
    {task.children instanceof Array && <div className="todo-item-children" >
      {task.children.map(children => {
        return <TodoItem
          key={children.id}
          task={children}
          taskIds={taskIds}
          actions={actions}
          taskItemHandleMouseDown={taskItemHandleMouseDown}
          preferences={preferences}
          taskList={taskList}
          mode={mode}
        />
      })}
    </div>}
  </div>
}

export default TodoItem
