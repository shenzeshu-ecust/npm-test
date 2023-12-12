import cDate from '../../cDate'
import { shared } from '../../trainConfig'
export default {
    data: {
        showType: '',
        otherDates: [],
        otherTrainDates: [],
        otherDateStr: '',
        disabledDate: '',
        disabledDates: [],
    },
    methods: {
        getOtherTrainDates(DepartTimeStamp) {
            let formatDepartDate = new cDate(DepartTimeStamp)
            let prevDate = []
            let nextDate = []
            for (let i = 0; i < 3; i++) {
                let prev =
                    formatDepartDate.getTime() - 1000 * 60 * 60 * 24 * (i + 1)
                prev = new Date(prev)
                if (prev <= new Date().getTime()) {
                    let next =
                        formatDepartDate.getTime() +
                        1000 * 60 * 60 * 24 * (i + 1)
                    let cDateNext = new cDate(next)
                    let _next = cDateNext.format('n月j日')

                    nextDate.push({
                        millinSeconds: next,
                        monthDayStr: _next,
                        dayStr: cDateNext.format('Y-m-d'),
                        weekDay: cDateNext.format('D') || cDateNext.format('w'),
                    })
                } else {
                    let next =
                        formatDepartDate.getTime() + 1000 * 60 * 60 * 24 * (i + 1)
                    let cDateNext = new cDate(next)
                    let _next = cDateNext.format('n月j日')
                    let prev =
                        formatDepartDate.getTime() - 1000 * 60 * 60 * 24 * (i + 1)
                    let cDatePrev = new cDate(prev)
                    let _prev = cDatePrev.format('n月j日')

                    const LASTROBDAY = new cDate().addDay(shared.preRobDays).getTime()

                    /**
                     * 出发日期为可抢票最后一天时不显示后面的备选日期
                     */
                    if (LASTROBDAY >= next) {
                        nextDate.push({
                            millinSeconds: next,
                            monthDayStr: _next,
                            dayStr: cDateNext.format('Y-m-d'),
                            weekDay: cDateNext.format('D') || cDateNext.format('w'),
                        })
                    }
                    prevDate.push({
                        millinSeconds: prev,
                        monthDayStr: _prev,
                        dayStr: cDatePrev.format('Y-m-d'),
                        weekDay: cDatePrev.format('D') || cDatePrev.format('w'),
                    })
                }
            }

            prevDate = prevDate.reverse()
            let depDate = {
                millinSeconds: formatDepartDate.getTime(),
                monthDayStr: formatDepartDate.format('n月j日'),
                dayStr: formatDepartDate.format('Y-m-d'),
                weekDay:
                    formatDepartDate.format('D') || formatDepartDate.format('w'),
            }

            let otherTrainDates = prevDate.concat(depDate).concat(nextDate)

            return otherTrainDates
        },
        showOtherDates(disabledDates, otherDates) {
            let otherTrainDates = this.data.otherTrainDates
            otherTrainDates.forEach((d, idx) => {
                if (otherDates.indexOf(d.dayStr) >= 0) {
                    otherTrainDates[idx].selected = true
                } else {
                    otherTrainDates[idx].selected = false
                }
                if (disabledDates.indexOf(d.monthDayStr) >= 0) {
                    otherTrainDates[idx].disabled = true
                } else {
                    otherTrainDates[idx].disabled = false
                }
            })

            this.setData({
                showType: 'date',
                otherTrainDates,
            })
        },
        selectDate(e) {
            const dates = this.data.otherTrainDates

            let date = dates[e.currentTarget.dataset.index]
            if (date.monthDayStr == this.data.disabledDate || this.data.disabledDates.indexOf(date.monthDayStr) > -1) return

            date.selected = !date.selected
            this.setData({
                otherTrainDates: dates,
            })
        },
        confirmChooseDate() {
            let dateList = this.data.otherTrainDates
            let otherDates = []
            let otherDateStrList = []
            dateList.forEach(s => {
                if (s.selected) {
                    otherDates.push(s.dayStr)
                    otherDateStrList.push(s.monthDayStr)
                }
            })

            this.setData({
                otherDates,
                otherDateStr: otherDateStrList.toString(),
            })
            this.getBasicSuccessRate && this.getBasicSuccessRate()
            this.hideBackDrop && this.hideBackDrop()
        },
        cancelChooseDate() {
            let otherDates = this.data.otherDates
            this.data.otherTrainDates.forEach(s => {
                if (otherDates.indexOf(s.dayStr)) {
                    s.selected = true
                } else {
                    s.selected = false
                }
            })

            this.hideBackDrop && this.hideBackDrop()
        },
    },
}
