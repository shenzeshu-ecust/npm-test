import { cwx, CPage, __global } from '../../../cwx/cwx';
import urlUtil from '../common/utils/url';

CPage({
    onLoad (options = {}) {
        const qs = urlUtil.param(options);
        const host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ctrip.fat369.qa.nt.ctripcorp.com';
        const data = {
            url: encodeURIComponent(`https://${host}/webapp/hotels/commentlist?${qs}&ftype=v&disablemoreroom=1`),
            hideShareMenu: true // 是否隐藏分享按钮
        };
        cwx.redirectTo({
            url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
        });
        try {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_newcomment_source', options);
        } catch (e) {}
    }
});
