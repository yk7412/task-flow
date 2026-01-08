import { Form, Input, Select, Switch } from "antd"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { getPriorityColor } from "../../utils/common"
import './TodoItemDetail.less'
import type { Task, TodoState } from "../../store/todoSlice"
import TagSelect from "./TagSelect"

interface TodoItemDetailProps {
    focusId: number | null
    taskList: Task[]
    updateTask: (id: number | null, value: Partial<Task>) => void
    tagList: TodoState['tagList']
    priorityList: TodoState['priorityList']
    updateTagList: (tagList: string[]) => void
}

const TodoItemDetail = (props: TodoItemDetailProps) => {
    const { focusId, taskList, updateTask, tagList, priorityList, updateTagList } = props
    const [form] = Form.useForm()

    const [isFirstChange, setIsFirstChange] = useState(true)
    const [formDisabled, setFormDisabled] = useState(false)
    const [currentId, setCurrentId] = useState<number | null>(null)
    // const [inputTag, setInputTag] = useState<string>('')

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

    // const addNewTag = () => {
    //     if (!inputTag) return
    //     if (tagList.includes(inputTag)) {
    //         return message.error('请勿添加重复标签')
    //     }
    //     addTag(inputTag)
    //     setInputTag('')
    // }

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
                <Form.Item className='todo-item-detail-completed' name='completed' >
                    <Switch
                        disabled={false}
                        checkedChildren='已完成'
                        unCheckedChildren='未完成'
                    />
                </Form.Item>
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
                    {/* <Select
                        mode='multiple'
                        allowClear
                        options={tagList.map(tag => ({ label: tag, value: tag }))}
                        menuItemSelectedIcon={null}
                        optionRender={option => (<Space style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }} >
                            <span>{option.label}</span>
                            <Button
                                type='text'
                                onClick={event => {
                                    event.stopPropagation()
                                    removeTag(option.value as string)
                                }}
                            >X</Button>
                        </Space>)}
                        popupRender={(menu) => (<>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <Space>
                                <Input
                                    value={inputTag}
                                    onChange={event => setInputTag(event.target.value)}
                                    onKeyDown={event => event.key === 'Enter' && addNewTag()}
                                />
                                <Button
                                    onClick={() => addNewTag()}
                                >添加</Button>
                            </Space>
                        </>)}
                    /> */}
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
