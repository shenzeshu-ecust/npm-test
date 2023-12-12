import CWebviewBaseClass from '../../../cwx/component/cwebview/CWebviewBaseClass';
import { __global } from '../../../cwx/cwx';

const URL_MAP = {
    fat: 'https://m.ctrip.fat466.qa.nt.ctripcorp.com/webapp/mytravels/travels',
    uat: 'https://m.site.uat.qa.nt.ctripcorp.com/webapp/mytravels/travels',
    prd: 'https://m.ctrip.com/webapp/mytravels/travels'
};
const getMyTravelsWebViewData = (source) => {
    let url = URL_MAP[__global.env] || URL_MAP.prd;
    url += `?source=${source}`;
    const data = {
        url: encodeURIComponent(url),
        needLogin: true,
        isNavigate:  true
    };
    return JSON.stringify(data);
}

class WebView extends CWebviewBaseClass {
    constructor() {
        super();

        this._superOnLoad = this.onLoad;
        Object.assign(this, {
            onLoad(options) {
                const { source } = options || {};

                if (typeof source === 'string' && source) {
                    const newOptions = {
                        ...(options || {}),
                        data: getMyTravelsWebViewData(source)
                    };
                    this._superOnLoad(newOptions);
                    return;
                }

                // 保持旧版
                this._superOnLoad(options);
            }
        });
    }
}

new WebView().register();
