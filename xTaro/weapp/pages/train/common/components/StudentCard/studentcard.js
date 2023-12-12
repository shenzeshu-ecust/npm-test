import {
    StudentCardInfoModel,
} from '../../model'
import util from '../../util'

export default {
    data: {},
    methods: {
        /**
         * 学生权益相关 包含是否可以领取学生权益
         */
        getStudentRightsInfo(FromType = 1, self) {
            const params = {
                ChannelName: 'ctripwx',
                FromType,
            }
            const defferd = util.getDeferred()
            StudentCardInfoModel(params, res => {
                if (res.RetCode == 1) {
                    const {
                        IsCanReceive,
                        IsReceived,
                        ReceiveCardUrl,
                        CardDetailUrl,
                    } = res
                    if (self && self.setData) {
                        self.setData({
                            studentCardInfo: {
                                IsCanReceive,
                                IsReceived,
                                ReceiveCardUrl,
                                CardDetailUrl,
                            },
                        })
                    }
                    defferd.resolve()
                } else {
                    defferd.reject()
                }
            })

            return defferd.promise
        },
        toStudentCardPage(e) {
            const { url } = e.currentTarget.dataset
            util.jumpToUrl(url)
        },
    },
}
