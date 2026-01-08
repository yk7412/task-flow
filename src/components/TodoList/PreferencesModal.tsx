import { SettingOutlined } from "@ant-design/icons"
import { Form, Modal, Select, Switch } from "antd"
import { useEffect, useState } from "react"
import './PreferencesModal.less'
// import { useSelector } from "react-redux"
// import type { RootStore } from "../../store"
import type { Preferences, TodoState } from "../../store/todoSlice"
import TagSelect from "./TagSelect"

interface PreferencesModalProps {
    priorityList: TodoState['priorityList']
    tagList: TodoState['tagList']
    value: Preferences
    onChange: (changeValue: Partial<Preferences>) => void
    updateTagList: (tagList: string[]) => void
}

const PreferencesModal = (props: PreferencesModalProps) => {

    const {value, onChange, updateTagList, priorityList, tagList} = props

    const [form] = Form.useForm()

    // const priorityList = useSelector((state: RootStore) => state.todo.priorityList)
    // const tagList = useSelector((state: RootStore) => state.todo.tagList)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if(!value) return
        if(visible) form.setFieldsValue(value)
    }, [value, visible])

    // useEffect(() => {
    //     if(visible) {
    //         form.setFieldsValue(value)
    //     }
    // }, [visible])

    return <div className="preferences">
        <SettingOutlined className="preferences-handle" onClick={() => setVisible(true)} />
        <Modal
            title='偏好设置'
            className="-preferences-modal"
            open={visible}
            onOk={() => {setVisible(false); onChange(form.getFieldsValue())}}
            onCancel={() => {setVisible(false)}}
            okText='确认'
            cancelText='取消'
        >
            <Form
                form={form}
                // onValuesChange={changeValue => {
                //     onChange(changeValue)
                // }}
            >
                <Form.Item name='confirmBeforeDelete' label='任务删除二次确认'>
                    <Switch/>
                </Form.Item>
                <Form.Item name='confirmInCompleteSubtasks' label='完成任务时子任务未完成提醒'>
                    <Switch/>
                </Form.Item>
                <Form.Item name='defaultPriority' label='默认优先级'>
                    <Select options={priorityList} />
                </Form.Item>
                <Form.Item name='defaultTag' label='默认标签'>
                    {/* <Select options={tagList.map(tag => ({label: tag, value: tag}))} mode='multiple' /> */}
                    <TagSelect
                        tagList={tagList}
                        updateTagList={updateTagList}
                    />
                </Form.Item>
            </Form>
        </Modal>
    </div>
}

export default PreferencesModal