import { cwx, CPage, __global } from '../../../../cwx/cwx';

CPage({
    onLoad (options) {
        try {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_sellingpoint_source', options);
        } catch (e) {}
        const { id: hotelId, rivettab: levelID } = options;
        const host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.ctrip.fat369.qa.nt.ctripcorp.com';
        let qs = `hotelid=${hotelId}`;
        const levelIDMap = {
            'notice-level01': 'notice', // 订房必读
            'notice-level02': 'policy' // 酒店政策
        };
        levelIDMap[levelID] && (qs += `&type=${levelIDMap[levelID]}`);
        const data = {
            url: encodeURIComponent(`https://${host}/webapp/hotels/sellingpoint?${qs}`),
            hideShareMenu: true // 是否隐藏分享按钮
        };
        cwx.redirectTo({
            url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(data)
        });
    }
});
