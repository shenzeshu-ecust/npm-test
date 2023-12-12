import { cwx, __global } from './cwx/index';
import BusConfig from './busConfig';
import { Pservice } from './productservice';
const DEFAULT_UTMSOURCE = 'ctripbus_xcx_share';
const SHARE_TITLE_DEFAULT = '携程旅行';
const SHARE_DESC_DEFAULT = '携程在手，说走就走';
const SHARE_URL_DEFAULT = '/pages/bus/index/index';
const SHARE_JUMP_NAVIGATE = 'navigateTo';

const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';

let share = {
    /**
     * 获取分享参数
     * @param  {String} options.title    分享的title 默认为携程旅行
     * @param  {String} options.url      将当前页面，以及参数拼好
     * @param  {String} options.jumpType 跳转方式，有navigateTo和redirectTo,reLaunch三种种
     * @return {Object}                  返回title，以及shareUrl
     *
     * 这样做是为了分享出去的页面，能够从首页跳转，然后可以返回首页用到其他的入口。不至于返回的时候直接关闭小程序。
     * url比如：'/pages/bus/share/index'
     */
    getParam: ({
        url,
        jumpType,
        utmSource = DEFAULT_UTMSOURCE,
        title = SHARE_TITLE_DEFAULT,
        desc = SHARE_DESC_DEFAULT,
        imageUrl,
    }) => {
        let path,
            homeUrl = SHARE_URL_DEFAULT + '?utmSource=' + utmSource;

        if (!url) {
            path = SHARE_URL_DEFAULT;
        } else {
            jumpType = jumpType || SHARE_JUMP_NAVIGATE;
            homeUrl += '&' + jumpType + '=';
            path = homeUrl + encodeURIComponent(url);
        }
        return { title, path, desc, imageUrl };
    },
};

const promotionPrefix = [
    'ctripwx_jt_',
    'ctripwx_xc_',
    'ctripwx_qn_',
    'ctripwx_cz_',
    'busweixin_',
    'ticketmachinev2_',
    'tmv2_',
    'offzhcz_',
];

const otherKeyinfo = {
    wjgtj: {
        click: {
            key: 'wjgtj_click',
            keyid: '138769',
            key_des: '无结果推荐模块_点击',
        },
        show: {
            key: 'wjgtj_exp',
            keyid: '138766',
            key_des: '无结果推荐模块_曝光',
        },
    },
};

var Utils = {
    isPromotionOrder(utmSource) {
        if (!utmSource) return false;
        let len = promotionPrefix.length;
        for (let i = 0; i < len; i++) {
            if (utmSource.indexOf(promotionPrefix[i]) > -1) {
                return true;
            }
        }
        return false;
    },
    getUtmSource(options) {
        var utm = options && (options.utmsource || options.utmSource);
        // 这其实是前缀
        var utmSuffix = (options && options.utmSuffix) || '';
        if (!utm) {
            var utmSource = cwx.getStorageSync('BUS_UTMSOURCE');
            if (utmSource && utmSource.timeStamp) {
                var now = Date.parse(new Date()) / 1000;
                if (now - utmSource.timeStamp > 1800) {
                    utm = 'ctrip_xcx_c';
                } else {
                    if (utmSource.source) {
                        if (
                            typeof utmSource.source == 'object' &&
                            utmSource.source.constructor == Array
                        ) {
                            utm = utmSource.source.join('_');
                        } else {
                            utm = utmSource.source;
                        }
                    } else {
                        utm = 'ctrip_xcx_c';
                    }
                }
            } else {
                utm = 'ctrip_xcx_c';
            }
        }
        if (BusConfig.suffix.length > 0 && utm.indexOf(BusConfig.suffix) < 0) {
            utm = utm + BusConfig.suffix;
        }

        let len = promotionPrefix.length;
        for (let i = 0; i < len; i++) {
            if (utm.indexOf(promotionPrefix[i]) > -1) {
                utm = utm.replace(promotionPrefix[i], `${utmSuffix}_`);
                break;
            }
        }
        return utm;
    },
    addUtmSource(source, isPre) {
        var now = Date.parse(new Date()) / 1000;
        var utmSource = cwx.getStorageSync('BUS_UTMSOURCE') || '';
        var sourceList = [];
        if (
            typeof utmSource.source == 'object' &&
            utmSource.source.constructor == Array
        ) {
            sourceList = utmSource.source;
        } else {
            if (utmSource.source) {
                sourceList = [utmSource.source];
            }
        }
        if (isPre) {
            source.unshift(source);
        } else {
            source.push(source);
        }
        cwx.setStorageSync('BUS_UTMSOURCE', {
            source: sourceList,
            timeStamp: now,
        });
    },
    saveUtmSource(source) {
        var now = Date.parse(new Date()) / 1000;
        cwx.setStorageSync('BUS_UTMSOURCE', {
            source: source,
            timeStamp: now,
        });
    },
    share: share,
    getRoundomNumber: function getRoundomNumber(min = 0, max = 100) {
        var randomNum = Math.floor(Math.random() * 1000); // 可均衡获取min到max的随机整数。
        var roundom = min + (randomNum % (max - min));
        return roundom;
    },
    generateQrcode: function generateQrcode({ path, pathName, centerUrl }) {
        return Pservice.getWxqrCode({
            appId: cwx.appId,
            newStyle: 1,
            path: path,
            centerUrl:
                centerUrl ||
                'https://is4-ssl.mzstatic.com/image/thumb/Purple128/v4/be/75/e9/be75e982-831e-4f29-af71-a11e31ef504d/AppIcon-1x_U007emarketing-85-220-3.png/246x0w.jpg',
            page: 'pages/market/midpage/midpage',
            pathName: pathName || 'midpage',
            fromId: '10320614135',
            needData: false,
            autoColor: false,
            lineColor: { r: '0', g: '0', b: '0' },
            buType: 'bus',
            // autoColor: true,
            // buType: 'BUS',
        })
            .then((res) => {
                console.log(res);
                if (res.qrUrl && res.qrUrl) {
                    return res;
                } else {
                    throw res;
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.qrUrl && err.qrUrl) {
                    return err;
                } else {
                    return {};
                }
            });
    },

    // 船票接口需要传入的参数
    getBaseCommonTypes: function () {
        const baseCommonTypes = {
            channel: 'ctrip',
            clientType: 'h5',
            partner: 'ctrip.h5',
            head: {
                cid: cwx.clientID,
                ctok: '',
                cver: __global.version,
                lang: '01',
                sid: '',
                extension: [
                    { name: 'appId', value: cwx.appId || '' },
                    { name: 'scene', value: (cwx.scene || '') + '' },
                ],
                syscode: (cwx.systemCode || '').toString(),
                auth: cwx.user.auth,
                sauth: '',
            },
            ref: 'ctrip.h5',
            utmSource: '',
            version: '101.079',
        };
        return baseCommonTypes;
    },
    sendExposeTrace: function (typeSnd, info, otherKey) {
        Utils.sendUbtTrace('show', typeSnd, info, otherKey);
    },
    sendClickTrace: function (typeSnd, info, otherKey) {
        Utils.sendUbtTrace('click', typeSnd, info, otherKey);
    },
    sendUbtTrace(type, typeSnd, data, otherKey) {
        const currentPage = cwx.getCurrentPage();
        if (!currentPage) {
            return;
        }
        let pageId = currentPage.pageId;
        let utmSource = Utils.getUtmSource();
        let key = '';
        let keyid = '';
        let key_des = '';
        if (!otherKey) {
            key =
                type === 'click'
                    ? 'bus_ctrip_wxxcx_allpage_click'
                    : 'bus_ctrip_wxxcx_allpage_show';
            keyid = type === 'click' ? '200534' : '200558';
            key_des =
                type === 'click'
                    ? '汽车票小程序点击全埋点'
                    : '汽车票小程序曝光全埋点';
        } else {
            key = otherKeyinfo[otherKey][type].key;
            keyid = otherKeyinfo[otherKey][type].keyid;
            key_des = otherKeyinfo[otherKey][type].key_des;
        }
        let info = {
            keyid,
            key_des,
            pageId: pageId,
            type: BusConfig.traceType || 'ctripwxxcx',
            utmSource: utmSource || '',
            typeSnd,
            ...data,
        };
        cwx.sendUbtByPage.ubtTrace(key, info);
    },
    uuid(len) {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            (c) => {
                const r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
            }
        );
        if (len) {
            return uuid.slice(0, len);
        }
        return uuid;
    },
    formatHighLight(string) {
        if (!string) return null;
        const matchJson = [];
        string.replace(
            /\(([^()]*)\)|\[([^\[\]]*)\]|\{([^\{\}]*)\}|([^()\[\]\{\}]*)/g,
            (match, p1, p2, p3, p4) => {
                if (p1) {
                    matchJson.push({
                        text: p1,
                        highLight: true,
                    });
                }
                if (p2) {
                    matchJson.push({
                        text: p2,
                        highLight: true,
                    });
                }
                if (p3) {
                    matchJson.push({
                        text: p3,
                        highLight: true,
                    });
                }
                if (p4) {
                    matchJson.push({
                        text: p4,
                    });
                }
            }
        );
        return matchJson;
    },
    randomString(e) {
        e = e || 32;
        let n = '';
        let i = 0;
        let a = t.length;
        while (i < e) {
            n += t.charAt(Math.floor(Math.random() * a));
            i++;
        }
        return n;
    },
};

export default Utils;
