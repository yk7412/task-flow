import { Button, Input } from "antd"
import { useEffect, useRef, useState } from "react"
import './InputGroup.less'
import type { AddTaskProps } from "../../store/todoSlice"

interface AddInputProps {
    addTask: (value: AddTaskProps) => void
}

const AddInput = (props: AddInputProps) => {

    const {addTask} = props
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        // @ts-ignore
        inputRef.current.focus()
    }, [])
    
    function handleOk (value: string){
        addTask({title: value})
        setInputValue('')
    }

    return <div className="todo-input-group" style={{display: 'flex'}} >
        <Input className="todo-input" ref={inputRef} placeholder='输入文本回车或点击按钮添加任务' value={inputValue} onChange={event => setInputValue(event.target.value)} onKeyDown={(event) => {
            if(event.key === 'Enter') {
                handleOk(inputValue)
            }
        }} />
        <Button className="todo-button" type='primary' onClick={() => handleOk(inputValue)} >添加</Button>
    </div>
}

export default AddInput
