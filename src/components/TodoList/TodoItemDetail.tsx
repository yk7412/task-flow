import { Form, Input, Select, Switch } from "antd"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { getPriorityColor } from "../../utils/common"
import './TodoItemDetail.less'
import type { Task } from "../../store/todoSlice"
import TagSelect from "./TagSelect"
import type { TodoListProps } from "."

interface TodoItemDetailProps extends Pick<TodoListProps, 'mode' | 'taskList' | 'tagList' | 'focusId' | 'priorityList'> {
    updateTask: (id: number | null, value: Partial<Task>) => void
    updateTagList: (tagList: string[]) => void
}

const TodoItemDetail = (props: TodoItemDetailProps) => {
    const { focusId, taskList, updateTask, tagList, priorityList, updateTagList, mode } = props
    const [form] = Form.useForm()

    const [isFirstChange, setIsFirstChange] = useState(true)
    const [formDisabled, setFormDisabled] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)

    useEffect(() => {
        if (focusId === null) return
        setCurrentId(focusId)
        setIsFirstChange(false)
        const task = taskList.find(task => task.id === focusId)
        if (!task) return
        form.setFieldsValue({
            ...task,
            tag: task.tag || null,
            remark: task.remark || null,
            createTime: task.createTime ? dayjs(task.createTime).format('YYYY-MM-DD HH:mm:ss') : null,
            updateTime: task.updateTime ? dayjs(task.updateTime).format('YYYY-MM-DD HH:mm:ss') : null
        })
        setFormDisabled(task.completed)
    }, [focusId, taskList])

    const PriorityDot = (<div style={{ width: 5, height: 5 }} ></div>)

    return <div className="todo-item-detail">
        {isFirstChange ? <div className="todo-item-detail-empty" ></div> : (
            <Form
                form={form}
                disabled={formDisabled}
                onValuesChange={(value) => {
                    updateTask(currentId, value)
                }}
            >
                <Form.Item className='todo-item-detail-title' name='title' >
                    <Input />
                </Form.Item>
                {mode === 'todo' && <Form.Item className='todo-item-detail-completed' name='completed' >
                    <Switch
                        disabled={false}
                        checkedChildren='已完成'
                        unCheckedChildren='未完成'
                    />
                </Form.Item>}
                {mode === 'material' && <Form.Item className="todo-item-detail-repeatType" name='repeatType' label='重复类型' >
                    <Select
                        options={[
                            {label: '一次性', value: 1},
                            {label: '循环', value: 0}
                        ]}
                    />
                </Form.Item>}
                <Form.Item className='todo-item-detail-createTime' name='createTime' label='创建时间' >
                    <Form.Item noStyle shouldUpdate >
                        {({ getFieldValue }) => <span>{getFieldValue('createTime')}</span>}
                    </Form.Item>
                </Form.Item>
                <Form.Item className='todo-item-detail-updateTime' name='updateTime' label='修改时间' >
                    <Form.Item noStyle shouldUpdate >
                        {({ getFieldValue }) => <span>{getFieldValue('updateTime')}</span>}
                    </Form.Item>
                </Form.Item>
                <Form.Item className='todo-item-detail-priority' name='priority' label='优先级' >
                    <Select
                        prefix={PriorityDot}
                        styles={(values) => {
                            const { props } = values
                            return {
                                prefix: {
                                    backgroundColor: getPriorityColor(props.value),
                                    borderRadius: '50%'
                                }
                            }
                        }}
                        options={priorityList} />
                </Form.Item>
                <Form.Item className='todo-item-detail-tag' name='tag' label='标签' >
                    <TagSelect
                        tagList={tagList}
                        updateTagList={updateTagList}
                    />
                </Form.Item>
                <Form.Item className='todo-item-detail-remark' name='remark' label='备注' >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        )}

    </div>
}

export default TodoItemDetail
