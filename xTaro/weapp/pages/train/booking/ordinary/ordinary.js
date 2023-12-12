// pages/train/2019fanxian/index.js
import {cwx} from '../../../../cwx/cwx'
import util from '../../common/util'
import TPage from '../../common/TPage'

const page = {
    data: {
    },

    onLoad(options) {
        console.log('booking params', options)
        util.devTrace('train_tinyapp_dev_log', {
            desc: 'oldBookingPageShow',
            options
        })
        cwx.redirectTo({
            url: `/pages/trainBooking/booking/ordinary/index?${util.stringifyQuery(options, true)}`,
        })

        return
    },
}
TPage(page)
