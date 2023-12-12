/**
 * 成功率平滑过渡组件
 */

import {
    handleGrabRate,
    getTrainSuccessRangeList,
} from '../../common'

Component({
    data: {
        rate: 0, // 成功率数值
        showRate: 0,
    },
    properties: {
        successRate: {
            type: Number,
            value: 0,
            observer: function (value) {
                getTrainSuccessRangeList().then(() => {
                    this.setData({
                        showRate: handleGrabRate(value),
                    })
                }).catch(() => {
                    this.changeRate(value)
                })
            },
        },
        showPercent: {
            type: Boolean,
            value: false,
        },
    },
    detached() {
        !!this.rateInterval && clearInterval(this.rateInterval)
    },
    methods: {
        changeRate(value) {
            if (value != this.data.rate) {
                if (this.data.rate == 0) {
                    this.setData({
                        rate: this.data.successRate,
                        showRate: (this.data.successRate * 100).toFixed(1) + '%',
                    })
                } else {
                    let rate = 300
                    if (Math.abs(value - this.data.rate) >= 0.4) {
                        rate = 700
                    } else if (Math.abs(value - this.data.rate) >= 0.2) {
                        rate = 500
                    }

                    if (value > this.data.rate) {
                        !!this.rateInterval && clearInterval(this.rateInterval)
                        this.rateInterval = setInterval(() => {
                            let val = Math.floor(Math.random() * rate) / 10000
                            if (this.data.rate + val < value) {
                                this.setData({
                                    rate: this.data.rate + val,
                                    showRate: ((this.data.rate + val) * 100).toFixed(1) + '%',
                                })
                            } else {
                                !!this.rateInterval && clearInterval(this.rateInterval)
                                this.setData({
                                    rate: value,
                                    showRate: (value * 100).toFixed(1) + '%',
                                })
                            }
                        }, 1000 / 24)
                    } else {
                        !!this.rateInterval && clearInterval(this.rateInterval)
                        this.rateInterval = setInterval(() => {
                            let val = Math.floor(Math.random() * rate) / 10000
                            if (value < this.data.rate - val) {
                                this.setData({
                                    rate: this.data.rate - val,
                                    showRate: ((this.data.rate - val) * 100).toFixed(1) + '%',
                                })
                            } else {
                                !!this.rateInterval && clearInterval(this.rateInterval)
                                this.setData({
                                    rate: value,
                                    showRate: (value * 100).toFixed(1) + '%',
                                })
                            }
                        }, 1000 / 24)
                    }
                }
            } else {
                !!this.rateInterval && clearInterval(this.rateInterval)
            }
        },
    },

})
