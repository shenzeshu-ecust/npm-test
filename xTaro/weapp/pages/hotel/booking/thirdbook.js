import { CPage, cwx } from '../../../cwx/cwx.js';
import urlUtil from '../common/utils/url.js';
import commonfunc from '../common/commonfunc';

CPage({
    data: {
        isQuickApp: commonfunc.isQuickApp()
    },
    onLoad (options) {
        const queryStr = urlUtil.paramString({
            disableplatformdiscount: options.disableplatformdiscount || 0,
            hotelid: options.hotelid,
            roomid: options.roomid,
            paytype: correctPaytype(),
            subpaytype: options.subpaytype,
            outdate: options.outdate,
            indate: options.indate,
            shadowid: options.shadowid,
            ceckid: options.ceckid,
            rateid: options.rateid,
            rateadult: options.rateadult,
            checkavid: options.checkavid,
            rateplanid: options.rateplanid,
            passfromdetail: options.passfromdetail,
            eid: options.eid, // 联合会员员工码ID
            fromscan: options.fromscan, // 联合会员扫码延住渠道
            price_decimal: options.price_decimal,
            appscan: options.appscan,
            third: 1 // 第三方
        });

        const bookingUrl = `/pages/hotel/booking/index?${queryStr}`;

        cwx.redirectTo({ url: bookingUrl });

        // 兼容之前投放URL，如百度；目前paytype支持 0:(PP)预付, 1:(FG):现付。
        function correctPaytype () {
            return options.paytype === '2' ? '0' : options.paytype;
        }
    },
    handleCustomBack (e) {
        this.navigateBack();
    }
});
