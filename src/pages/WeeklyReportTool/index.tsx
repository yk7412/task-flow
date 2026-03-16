import { Button, DatePicker, Input } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import './index.less'
import { useState } from "react"
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type RangeValue = Dayjs | null | undefined
const useGetWeekTime = () => {

    const [date, setDate] = useState<[RangeValue, RangeValue]>([dayjs().startOf('week'), dayjs().endOf('week')])

    /** 获取上周时间范围 */
    const getLastWeek = () => {
        setDate(date => {
            const [startDate, endDate] = date
            // @ts-ignore
            const b = endDate.valueOf() - startDate.valueOf()
            const c = (1000 * 60 * 60 * 24 * 7)
            console.log(b, c, b === c, 'aaaa')
            return [startDate?.subtract(7, 'day'), endDate?.subtract(7, 'day')]
        })
    }

    /** 获取下周时间范围 */
    const getNextWeek = () => {
        setDate(date => {
            const [startDate, endDate] = date
            return [startDate?.add(7, 'day'), endDate?.add(7, 'day')]
        })
    }

    /** 获取本周 */
    const getThisWeek = () => {
        setDate([dayjs().startOf('week'), dayjs().endOf('week')])
    }

    return {
        date,
        /** 获取上周时间范围 */
        getLastWeek,
        /** 获取下周时间范围 */
        getNextWeek,
        /** 获取本周时间范围 */
        getThisWeek
    }
}

const WeeklyReportTool = () => {

    /** 任务列表 */
    // const taskList = useSelector((store: RootStore) => store.todo.taskList)

    const {date, getLastWeek, getNextWeek, getThisWeek} = useGetWeekTime()

    return <div className="weekly-report-tool">
        <div className="weekly-report-tool-preview">
            <Input.TextArea/>
        </div>
        <div className="line"></div>
        <div className="weekly-report-tool-configuration">
            <h3>配置项</h3>
            <div className="configuration-date">
                <Button onClick={() => getLastWeek()} >{"<"}</Button>
                <DatePicker.RangePicker value={date} />
                <Button onClick={() => getNextWeek()} >{">"}</Button>
                <Button onClick={() => getThisWeek()}>本周</Button>
            </div>
        </div>
    </div>
}

export default WeeklyReportTool
