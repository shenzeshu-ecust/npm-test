import { cwx, CPage, __global } from '../../../../cwx/cwx';

CPage({
    onLoad (options = {}) {
        const { hotelid } = options;
        const host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ctrip.fat369.qa.nt.ctripcorp.com';
        const data = {
            url: encodeURIComponent(`https://${host}/webapp/hotel/album?hotelid=${hotelid}&tab=0&hiddenback=1`),
            hideShareMenu: true // 是否隐藏分享按钮
        };
        try {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_photolist_source', options);
        } catch (e) {}

        cwx.redirectTo({
            url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
        });
    }
});
