import util from '../util'

import { ConfigInfoModel } from '../model'

/**
 * @file 下单相关服务
 * todo: 先迁移一部分下单服务
 */

/**
 * 代购按钮（带套餐）第二行文案
 */
export function getBookingSecondaryBtnText() {
    const deferred = util.getDeferred()
    ConfigInfoModel(
        {
            ConfigKey: 'train_wx_booking_daigou_btn_sectxt',
        },
        res => {
            if (res && res.ConfigInfo && res.ConfigInfo.Content) {
                deferred.resolve(res.ConfigInfo.Content)
            } else {
                deferred.reject(res)
            }
        },
        () => deferred.reject,
    )

    return deferred.promise
}

