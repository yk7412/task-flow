import { Badge, Calendar } from "antd"
import type { RootStore } from "../../store"
import { useSelector } from "react-redux"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import './index.less'

const WeeklyReportTool = () => {

    /** 任务列表 */
    const taskList = useSelector((store: RootStore) => store.todo.taskList)

    /** 获取任务列表中年份、月份、日期对应的任务 */
    const getListData = (value: Dayjs, type: string) => {
        return taskList.filter(task => {
            if (!task.completedTime) {
                return false
            }
            let result = false
            const completedTime = dayjs(task.completedTime)
            console.log(completedTime, 'completedTime')
            if (type === 'date') {
                if (
                    value.year() === completedTime.year() &&
                    value.month() === completedTime.month() &&
                    value.date() === completedTime.date()
                ) {
                    result = true
                } else {
                    result = false
                }
            }

            if (type === 'month') {
                if (
                    value.year() === completedTime.year() &&
                    value.month() === completedTime.month()
                ) {
                    result = true
                } else {
                    result = false
                }
            }

            return result

        })
    }

    return <div className="weekly-report-tool">
        <Calendar
            fullscreen={true}
            cellRender={(current, info) => {
                const list = getListData(current, info.type)
                if (list.length) {
                    return (<div className="weekly-report-tool-date" >
                        <ul>
                            {list.map(task => (<li key={'"weekly-report-tool-date-' + task.id}>
                                <Badge status={'success'} text={task.title} />
                            </li>))}
                        </ul>
                    </div>)
                }
                return <div></div>
            }}
        />
    </div>
}

export default WeeklyReportTool
