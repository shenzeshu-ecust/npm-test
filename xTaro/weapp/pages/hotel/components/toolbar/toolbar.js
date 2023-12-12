// eslint-disable-next-line no-unused-vars
import { cwx, _, __global } from '../../../../cwx/cwx.js';

import DateUtil from '../../common/utils/date.js';
import util from '../../common/utils/util.js';
import huser from '../../common/hpage/huser.js';
import components from '../../components/components.js';
import commonfunc from '../../common/commonfunc';

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        currentPage: {
            type: String,
            value: ''
        },
        secondScreen: {
            type: Boolean,
            value: false
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        isIphoneX: util.isIPhoneX(),
        isLoggedin: cwx.user.isLogin(), // 登录引导
        isWechat: commonfunc.isWechat(), // 是否微信小程序
        isQuickApp: commonfunc.isQuickApp() // 是否快应用
    },
    attached: function () {
        this.onPageLoad();
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onPageLoad: function () {
            const isLoggedin = cwx.user.isLogin();
            if (isLoggedin) {
                this.setData({
                    isLoggedin
                });
            }
        },
        doLogin: function (callback) {
            huser.login({
                param: null,
                callback: function (data) {
                    if (data && data.ReturnCode === '0') {
                        callback && callback();
                    } else {
                        cwx.showToast({
                            title: '登录失败',
                            icon: 'none',
                            duration: 3000
                        });
                    }
                }
            });
        },
        toHotelHomePage (pages) {
            const prevPage = pages[pages.length - 2];
            if (prevPage && prevPage.route.indexOf('inquire') > -1) {
                cwx.navigateBack();
            } else {
                cwx.redirectTo({
                    url: '/pages/hotel/inquire/index'
                });
            }
        },
        toBrowseHotel (pageRoute, type) {
            const inDay = DateUtil.today();
            const outDay = DateUtil.tomorrow();
            const path = '/pages/hotel/browsehotellist/index';
            const qs = `?inday=${inDay}&outday=${outDay}&type=${type}`;
            const jumpUrl = path + qs;
            const mn = pageRoute.indexOf('inquire') > -1
                ? 'navigateTo'
                : 'redirectTo';
            cwx[mn]({ url: jumpUrl });
        },
        toMyOrder (pageRoute) {
            const query = JSON.stringify({ id: 'hotel' });
            const jumpUrl = `/pages/myctrip/list/list?data=${query}`;

            const mn = pageRoute.indexOf('inquire') > -1
                ? 'navigateTo'
                : 'redirectTo';
            cwx[mn]({ url: jumpUrl });
        },

        toMyCoupon () {
            const host = __global.env === 'prd'
                ? 'm.ctrip.com'
                : 'm.fat43.qa.nt.ctripcorp.com';
            components.webview({
                url: `https://${host}/webapp/hotel/wechatlab/couponlist/`,
                hideShare: true,
                needLogin: true
            });
        },
        switchAction (type) {
            const pages = getCurrentPages();
            const pageIdx = pages.length - 1;
            const pageRoute = pages[pageIdx] ? pages[pageIdx].route : '';
            if (type === 'homepage') { // 查询首页
                this.toHotelHomePage(pages);
            } else if (type === 'collection') { // 收藏浏览
                this.toBrowseHotel(pageRoute, type);
            } else if (type === 'order') { // 我的订单
                this.toMyOrder(pageRoute);
            } else if (type === 'score') { // 我的积分
                cwx.navigateTo({
                    url: '/pages/hotel/market/funscore/index'
                });
            }
        },
        /**
         * 底部bar跳转
         */
        switchTap (e) {
            const dataset = e.currentTarget.dataset;
            const type = dataset.type;
            const typeConf = {
                homepage: 0,
                collection: 1,
                score: 2,
                order: 4
            };
            try {
                const tPage = cwx.getCurrentPage() || {};
                tPage.ubtTrace && tPage.ubtTrace('143520', {
                    type: typeConf[type],
                    pageid: tPage.pageId
                });
            } catch (e) {
                // ignore
            }

            const { currentPage } = this.data;
            if (currentPage === 'homepage' && type === 'homepage') {
                // 查询页点击回到顶部
                this.triggerEvent('toTop', '');
                return;
            }
            if (currentPage === type) return;

            const isLogin = cwx.user.isLogin();
            const needLogin = ~~dataset.loginRequired === 1;
            if (needLogin && !isLogin) {
                this.doLogin(() => {
                    this.switchAction(type);
                });
            } else {
                this.switchAction(type);
            }
        }
    }
});
