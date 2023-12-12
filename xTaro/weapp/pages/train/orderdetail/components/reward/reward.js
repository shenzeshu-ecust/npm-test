import {
    InnovationWorkCreateOrderModel,
} from '../../../common/model'
import {
    RequestSignPay,
} from '../../../common/common'
import util from '../../../common/util'

export default {
    data: {
        rewardSelectedIndex: 1,
        rewardSelectedAmount: 0,
    },
    methods: {
        chooseRewardAmount(e) {
            const { index } = e.currentTarget.dataset
            this.setData({ rewardSelectedIndex: index})
        },
        rewardSubmit() {
            this.setData({
                rewardSelectedAmount: this.data.rewardInfo.RewardAmountList[this.data.rewardSelectedIndex].RewardAmount,
            })
            let param = {
                BookSourceID: 1903,
                Channel: 'ctripwx',
                ServerFrom: 'wx/ctrip',
                OrderType: 'REWARD',
                OrderPrice: this.data.rewardSelectedAmount,
                OrderId: this.store.data.oid,
            }

            InnovationWorkCreateOrderModel(param, res => {
                if (res.RetCode == 0) {
                    const successRedirect = () => {
                        this.setData({ popType: 'rewardSuccess' })
                    }
                    const redirect = () => {}

                    let oneTic = this.store.data.orderInfo.TicketInfos[0]
                    let token = {
                        oid: res.OrderNumber,
                        title: oneTic.DepartStation + '⇀' + oneTic.ArriveStation,
                        amount: res.OrderPrice,
                    }
                    RequestSignPay({
                        token,
                    }, {
                        sbackCallback: successRedirect,
                        ebackCallback: redirect,
                        rbackCallback: redirect,
                    })
                } else {
                    util.showModal({
                        m: '打赏失败 :(',
                    })
                }
            })
        },
    },
}
