import detailtrace from '../common/trace/detailtrace.js';
import { __global, cwx } from '../../../cwx/cwx';
import components from '../components/components.js';
import reqUtil from './requtil';

const setChooseEntry = function (back, hotelId, onSuccess, onError) {
    cwx.getShareInfo({
        shareTicket: cwx.shareTicket,
        success: (res) => {
            const requestData = {
                encryptedData: res.encryptedData, // 微信分享信息加密数据
                iv: res.iv, // 加密初始向量
                mktOpenId: cwx.cwx_mkt.openid, // 市场 openId
                hotelId: back === 1 ? 0 : hotelId // 添加进列表的酒店 ID
            };
            reqUtil.updateSharingListReq(requestData, (result) => {
                onSuccess && onSuccess(result);
            }, () => {
                onError && onError();
            });
        }
    });
};

const updateSharingList = function (onSuccess) {
    wx.login({
        success (res) {
            if (res.code) {
                // 发起网络请求
                const marketObj = cwx.mkt.getUnion();
                const mPage = cwx.getCurrentPage();
                const params = {
                    appID: cwx.appId,
                    code: res.code,
                    platformType: cwx.wxSystemInfo.platform || 'ios',
                    allianceID: (marketObj.allianceid || '') + '',
                    sID: (marketObj.sid || '') + '',
                    oUID: (marketObj.ouid || '') + '',
                    sourceID: (marketObj.sourceid || '') + '',
                    exMKTID: (marketObj.exmktid || '') + '',
                    pageID: mPage ? (mPage.pageid ? mPage.pageid + '' : mPage.pageId + '') : '10650028227'
                };
                reqUtil.updateSharingList(params, () => {
                    onSuccess && onSuccess();
                });
            } else {
                console.log('登录失败！' + res.errMsg);
            }
        }
    });
};

const goToShareList = function (e, options) {
    if (wx.getUserProfile) {
        wx.getUserProfile({
            desc: '获取您的头像昵称', // 声明获取用户个人信息后的用途
            success: (result) => {
                if (result.userInfo) {
                    updateUser(result.userInfo, options);
                } else {
                    jumpChooseHotel(options);
                }
            },
            fail: (result) => {
                jumpChooseHotel(options);
            }
        });
    } else {
        const { nickName, avatarUrl } = JSON.parse(e?.detail?.rawData);
        const userInfo = {
            avatar: avatarUrl,
            nickname: nickName
        };
        updateUser(userInfo, options);
    }
};
const jumpChooseHotel = function ({ params, page }) {
    const { inDay, outDay, openGId, hotelId, total } = params;
    detailtrace.chooseHotelEntranceClick(page, {
        hotelid: hotelId,
        gid: openGId,
        count: total
    });
    const host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.fat369.qa.nt.ctripcorp.com';
    components.webview({
        url: `https://${host}/webapp/hotels/choosehotel?gid=${openGId}&inday=${inDay}&outday=${outDay}&seo=0`,
        needLogin: true
    });
};

const updateUser = (userInfo, options) => {
    const req = {
        avatar: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        openId: cwx.cwx_mkt.openid
    };
    reqUtil.updateUser(req, (res) => {
        jumpChooseHotel(options);
    }, (err) => {
        jumpChooseHotel(options);
    });
};
// 一起选酒店
export default {
    setChooseEntry,
    goToShareList,
    jumpChooseHotel,
    updateSharingList
};
