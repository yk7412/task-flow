import { SettingOutlined, SignatureOutlined } from "@ant-design/icons"
import { Button, Input, message, Modal, Select, type SelectProps } from "antd"
import { useEffect, useState } from "react"
import './TagSelect.less'

/** 标签选择框组件参数 */
interface TagSelectProps extends SelectProps {
    tagList: string[]
    updateTagList: (tag: string[]) => void
}

/** 标签选择框 */
const TagSelect = (props: TagSelectProps) => {

    const { tagList, updateTagList, ...otherProps } = props

    // 标签管理弹窗显示状态
    const [modalVisible, setModalVisible] = useState(false)
    /** 新增标签输入框文本 */
    const [inputValue, setInputValue] = useState('')
    /** 本地Tag列表缓存 */
    const [tags, setTags] = useState<string[]>([])
    /** 当前正在编辑的Tag */
    const [editTag, setEditTag] = useState<string | null>(null)
    /** 当前编辑Tag最新文本 */
    const [editTagValue, setEditTagValue] = useState<string>('')

    useEffect(() => {
        // 更新本地Tag列表
        setTags(tagList)
    }, [tagList])

    return <div className="tag-select">
        <Select
            mode='multiple'
            allowClear
            options={tagList.map(item => ({ label: item, value: item }))}
            popupRender={(menu) => (<>
                {menu}
                <Button
                    style={{ width: '100%' }}
                    onClick={() => setModalVisible(true)}
                >
                    <SettingOutlined style={{ marginRight: 5 }} />
                    <span>管理</span>
                </Button>
            </>)}
            {...otherProps}
        />
        <Modal
            title='标签管理'
            className='tag-select-modal'
            open={modalVisible}
            onCancel={() => {
                // 取消-关闭弹窗并还原本地数据
                setInputValue('')
                setTags(tagList)
                setModalVisible(false)
            }}
            onOk={() => {
                // 确认-关闭弹窗更新全局Tag列表
                setInputValue('')
                updateTagList(tags)
                setModalVisible(false)
            }}
            maskClosable={true}
            okText='确认'
            cancelText='取消'
        >
            <div className="tag-select-modal-top">
                <Input
                    placeholder="输入文本回车或点击按钮添加标签"
                    value={inputValue}
                    onChange={event => setInputValue(event.target.value)}
                    onKeyDown={event => {
                        // 回车新增标签
                        if (event.key !== 'Enter') return
                        if (!inputValue) return message.error('请输入文本')
                        setTags(list => ([...list, inputValue]))
                        setInputValue('')
                    }}
                />
                <Button type='primary' onClick={() => {
                    // 点击按钮新增标签
                    if (!inputValue) return message.error('请输入文本')
                    setTags(list => ([...list, inputValue]))
                    setInputValue('')
                }} >添加</Button>
            </div>
            <div className="tag-select-modal-tags">
                {
                    tags && tags.map(tag => (<div key={'tags-item-' + tag} className="tags-item" >
                        {
                            editTag === tag ?
                                <Input
                                    value={editTagValue}
                                    onChange={event => setEditTagValue(event.target.value)}
                                    onBlur={() => {
                                        // 输入框失焦时且内容为有效值，更新标签
                                        if(editTagValue) {
                                            setTags(list => list.map(t => {
                                                if(t === tag) {
                                                    return editTagValue
                                                }
                                                return t
                                            }))
                                        }
                                        // 重置编辑状态
                                        setEditTag(null);
                                        setEditTagValue('');
                                    }}
                                />
                                :
                                <span>{tag}</span>
                        }
                        <div className="button-group">
                            <Button type='text' onClick={() => {
                                // 点击编辑Icon将tag变为输入框
                                setEditTag(tag);
                                setEditTagValue(tag)
                            }} ><SignatureOutlined /></Button>
                            {/* 点击删除Icon删除本地缓存中对应标签 */}
                            <Button type='text' onClick={() => setTags(list => list.filter(t => t !== tag))} >X</Button>
                        </div>
                    </div>))
                }
            </div>
        </Modal>
    </div>
}

export default TagSelect