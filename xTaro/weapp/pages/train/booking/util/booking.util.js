import cwx, { _ } from '../../../../cwx/cwx'
import { RequestSignPay } from '../../common/common'

// 非前置扣位下单
export function pay(_data, { title, type, subscribeVip, grabWithVip }) {
    function redirect(res) {
        goDetail(res.orderID)
    }

    function sucRirect(res) {
        let goDetailShowType
        if (type == 'grab') {
            if (subscribeVip) {
                goDetailShowType = 'subscribeVip-popup'
            } else {
                // 使用vip抢票时 到详情页不出现送助力弹窗 前端patch 应该是后端做
                if (!grabWithVip) {
                    goDetailShowType = 'robsuccess-popup'
                }
            }
        }
        goDetail(res.orderID, goDetailShowType)
    }

    let token = {
        oid: _data.OrderId,
        title,
        amount: _data.OrderAmount,
    }

    RequestSignPay(
        {
            token,
        },
        {
            sbackCallback: sucRirect,
            ebackCallback: redirect,
            rbackCallback: redirect,
        },
    )
}

export function goDetail(oid, goDetailShowType, isFastPay) {
    let url = '/pages/train/orderdetail/orderdetail?oid=' + oid
    if (goDetailShowType) {
        url = url + '&showType=' + goDetailShowType
    }
    if (isFastPay) {
        url += '&isFastPay=1'
    }
    console.log(url)
    // todo: 修改booking页跳转
    cwx.redirectTo({
        url,
    })
}

