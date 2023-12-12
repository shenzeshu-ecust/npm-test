import { cwx } from '../../../cwx/cwx.js';
import HPage from '../common/hpage/hpage.js';
import urlUtil from '../common/utils/url.js';
import commonfunc from '../common/commonfunc.js';

HPage({
    pageId: '10650005463',
    data: {
        isQuickApp: commonfunc.isQuickApp()
    },
    onLoad: function (options) {
        const queryStr = urlUtil.paramString({
            code: options.code || '',
            hotelid: options.hotelid || '',
            hotel: options.hotel || '',
            channelCode: options.channelCode || ''
        });
        try {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_cinvoice_source', options);
        } catch (e) {}
        this.cinvoiceLoad(options.hotelid);
        const url = `/pages/hotelplanning/cinvoice/index?${queryStr}`;

        cwx.redirectTo({ url });
    },
    cinvoiceLoad: function (hotelid) {
        try {
            this.ubtTrace && this.ubtTrace('htl_invoice_qrcode_basic', {
                masterhotelid: hotelid,
                scanchannel: '微信小程序',
                source: 'hotel'
            });
        } catch (e) {
            // console.error(e);
        }
    }
});
