import { CPage, cwx, __global } from '../../../cwx/cwx';
import ENTRY_INFOS from './confs/entryConfs';
import IMAGES from './confs/imageUrlConfs';
import { checkLogin, login, logout, jumpToMobileValidate } from '../common/utils/user';
import { currentEnv } from '../common/utils/common';
import { getQConfigInfo } from '../common/utils/fc';
import {jumpToH5, jumpWithLogin, jumpToMiniProgram, jump} from '../common/utils/jump';
import { fetch } from '../common/utils/fetch';
import { logWithUbtMetric } from '../common/utils/common';
import { URL_MAP } from '../common/confs/fetchConfs';
import { TRACE_KEY, METRIC_KEY_MYCTRIP_HOME } from '../common/confs/ubtConf';
import {
    getUserAvatar, getUserName,
    getPointCount, getCouponCount,
    getIsShowSuperVip, getUserGradeText,
    setUserNameToStorage
} from './src/userInfo';
import { DEFAULT_USER_AVATAR, LOGINOUT_H5_CTICKET_URL } from './src/indexConfs';

// 点击metric埋点中metricId的默认值
const DEFAULT_METRIC_ID = 'unknown';
// 新旧版本替换过程，给新版手机号查单结果页使用
// FIXME: 待下个wx小程序版本删除newTempEntryUrl，继续保持使用url，并且更新qconfig中的entryUrl为新版地址
const NEW_TEMP_MOBILE_ENTRY_URL = '/pages/myctrip/list/list?data={"id": "mobilesearch"}';
// 小程序版本号正则
const REGEXP_VERSION = /^\d+\.\d+\.\d+$/;

CPage({
    data: {
        isLogin: false, // 是否登录
        loginHeadIconStyle: 'head-icon', // 登录状态下头部icon的样式
        headIconTop: 0, // 登录状态下头部icon的样式
        headContentTop: 0, // 头部高度
        isClickLoginBtn: false, // 是否点击了“登录／注册”按钮
        userName: getUserName(), // 会员昵称
        userAvatar: '', // 会员头像
        isShowUserVerify: true, // 是否显示实名认证入口
        mobileSearchListData: ENTRY_INFOS.mobileSearchListData,  // 手机号查单链接
        settingData: ENTRY_INFOS.setting,  // 设置链接
        signInData: ENTRY_INFOS.signIn,  // 签到链接
        avatarData: ENTRY_INFOS.avatar,  // 头像链接
        favoriteData: ENTRY_INFOS.favorite, // 收藏链接
        favoriteCount: 0, // 收藏数量
        pointData: ENTRY_INFOS.point, // 积分链接
        pointCount: 0, // 积分数量
        couponData: ENTRY_INFOS.coupon, // 优惠券链接
        couponCount: 0, // 优惠券数量
        orderEntryData: ENTRY_INFOS.orders, // 订单入口信息
        vipLevelData: ENTRY_INFOS.vipLevel, // 会员等级
        toVerifyData: ENTRY_INFOS.toVerify, // 去实名 链接
        isShowActivityCenter: false, // 是否展示活动中心
        activityCenterData: [], // 活动中心信息
        activityCenterMoreData: null, // 活动中心 - 更多 链接
        activityCenterTitleData: '', // 活动中心模块的title
        toolsData: ENTRY_INFOS.tools, // 我的工具信息
        isShowSuperVipTag: false, // 是否展示超级会员tag入口
        businessLicense: ENTRY_INFOS.businessLicense, // 营业执照
        userHomeData: ENTRY_INFOS.userHome, // 个人主页
        useOldCustomerEntry: false, // 是否使用旧版客服入口
        images: IMAGES // 我携首页需要用到的图片资源地址
    },
    checkPerformance: true,  // 添加标志位
    pageId: 10320655461,
    //options(Object)
    onLoad: function(options){
        this.setHeaderIconTop();
        this.setIsOldCustomerEntry();
    },
    setHeaderIconTop: function() {
        try {
            // 获取胶囊按钮的布局信息
            const {
                height = 0,
                top = 0 // 验证下来，top应该是指胶囊按钮距离状态栏的距离
            } = cwx.getMenuButtonBoundingClientRect();

            // 获取状态栏的高度
            const { statusBarHeight } = cwx.getSystemInfoSync();

            // 处理头部icon与胶囊按钮的位置关系
            this.setData({
                headIconTop: `${height/2 + top + statusBarHeight}rpx`,
                headContentTop: `${height + top + statusBarHeight + 44}rpx`,
                headHeight: `${height + top + statusBarHeight + 249 + 24}rpx` // 360 - 111(会员中心的高度) = 249
            });
        } catch (e) {
            this.ubtTrace(TRACE_KEY, {
                message: e.message
            });
        }
    },
    onShow: function(){
        this.fetchEntryInfo();

        this.getMyCtripActivity();

        // 从登录页回到我携首页时展示loading，避免checkLogin api中调用接口的响应过慢一直停留在未登录我携首页的UI上让用户产生疑惑
        if (!this.data.isLogin && this.data.isClickLoginBtn) {
            cwx.showLoading();
        }

        checkLogin((isLogin) => {
            this.setData({
                isLogin
            });

            cwx.hideLoading();

            this.setHeaderColor(isLogin);

            if(isLogin) {
                this.setData({
                    isClickLoginBtn: false
                });
                // 请求
                this.getUserInfo();
                this.getFavoriteCount();
                this.getUserVerify();
            }
        })
    },
    onPageScroll: function(obj) {
        const { scrollTop = 0 } = obj;
        const loginHeadIconStyle = scrollTop >= 10 || scrollTop < 0 ? 'head-icon head-icon-login' : 'head-icon'
        this.setData({
            loginHeadIconStyle
        });
    },
    // 设置头部状态栏文字的颜色和背景色
    setHeaderColor: function(isLogin) {
        if (!isLogin) {
            cwx.setNavigationBarColor({
                frontColor: '#ffffff', // 白色
                backgroundColor: '#ffffff'
            });
        } else {
            cwx.setNavigationBarColor({
                frontColor: '#000000', // 头部状态栏文字颜色 黑色
                backgroundColor: '#099fde' // 头部背景色
            });
        }
    },
    // 从qconfig获取我携首页入口的配置信息
    fetchEntryInfo: function() {
        getQConfigInfo('wxEntryInfo')
            .then((resp) => {
                this.setEntryInfoData(resp);
            })
            .catch((e) => {
                this.setEntryInfoData(ENTRY_INFOS);

                this.ubtTrace(TRACE_KEY, {
                    channel: 'wx',
                    type: 'fetchEntryInfo catch',
                    message: `${e.message}`
                });
            });
            // 不使用finally 的原因：在微信7.0.2版本 & 基础版本库 2.5.2 中不支持finally，使用后会报错
    },
    setEntryInfoData: function(entryInfo) {

        this.setData({
            mobileSearchListData: entryInfo.mobileSearchListData, // 手机号查单 链接
            avatarData: entryInfo.avatar,  // 头像链接
            favoriteData: entryInfo.favorite, // 收藏链接
            pointData: entryInfo.point, // 积分链接
            couponData: entryInfo.coupon, // 优惠券链接
            orderEntryData: entryInfo.orders, // 订单入口信息
            vipLevelData: entryInfo.vipLevel, // 会员等级，使用配置中的url、埋点信息，会员等级名用我携服务下发
            toVerifyData: entryInfo.toVerify, // 去实名 链接
            toolsData: entryInfo.tools, // 我的工具信息
            businessLicense: entryInfo.businessLicense, // 营业执照
            userHomeData: entryInfo.userHome, // 个人主页
            settingData: entryInfo.setting,  // 设置链接
        });
    },
    // 获取用户信息
    getUserInfo: function () {
        let userName = '';
        let userAvatar = '';
        let userGrade = '';
        let pointCount = 0;
        let couponCount = 0;
        let isShowSuperVipTag = false;

        fetch({
            url: URL_MAP.getUserInfo,
            onSuccess: (data) => {
                if (data && data.Result && data.Result.ResultCode == 0) {
                    userName = setUserNameToStorage(data);
                    userAvatar = getUserAvatar(data);
                    userGrade = getUserGradeText(data);
                    pointCount = getPointCount(data);
                    couponCount = getCouponCount(data);
                    isShowSuperVipTag = getIsShowSuperVip(data);
                }
            },
            onComplete: () => {
                this.setData({
                    userName: getUserName(),
                    userAvatar: userAvatar || DEFAULT_USER_AVATAR,
                    userGrade,
                    pointCount,
                    couponCount,
                    isShowSuperVipTag
                });
            }
        });
    },
    // 获取收藏数量
    getFavoriteCount: function() {
        fetch({
            url: URL_MAP.getMyFavorite,
            params: {
                QueryList: [{
                    BizType: 'ALL'
                }],
                NextCursor: '',
                SortBy: 'CREATE_TIME',
                SortType: 0,
                ReturnCount: 25
            },
            onSuccess: (res) => {
                let {
                    TotalRecord: favoriteCount = 0
                } = res;

                if (favoriteCount > 500) {
                    favoriteCount = '>500';
                }

                this.setData({
                    favoriteCount
                });
            },
            onError: (e) => {
                this.ubtTrace(TRACE_KEY, {
                    channel: 'wx',
                    type: 'getFavoriteCount fn',
                    message: `getFavoriteCount with error: ${e.message}`
                });
            }
        });
    },
    // 获取是否实名的信息
    getUserVerify: function () {
        fetch({
            url: URL_MAP.getUserVerify,
            onSuccess: (data) => {
                // 这样代表接口成功，是否已经实名才有效
                if (data && data.Result && data.Result.ResultCode === 0) {
                    // 若未实名认证，则展示实名认证入口
                    const isShowUserVerify = data.RealNameStatus !== 1;
                    this.setData({
                        isShowUserVerify
                    });
                }
            }
        });
    },
    // 登录
    loginHandler: function () {
        login((isLogin) => {
            this.handleClickMetric({
                name: 'weixin',
                type: 'myctrip-home',
                operate: 'click',
                metricId: '登录/注册'
            });

            this.setData({
                isClickLoginBtn: isLogin
            });
        });
    },
    // 退出登录
    logoutHandler: function () {
        this.ubtTrace('c_click_wxmp_logout', {
            fn: 'logoutHandler',
            entryUrl: '退出登录'
        });

        this.handleClickMetric({
            name: 'weixin',
            type: 'myctrip-home',
            operate: 'click',
            metricId: '退出登录'
        });

        logout((success) => {
            if (success) {
                this.setData({
                    isLogin: false,
                    couponCount: 0,
                    favoriteCount: 0,
                    pointCount: 0
                });
                wx.pageScrollTo({ // 点击确认退出时，滚动至顶部。再次登录后，确保页面在顶部。
                    scrollTop: 0
                });
                jumpToH5(LOGINOUT_H5_CTICKET_URL[currentEnv], false);
            }
        })
    },
    // 跳转订单详情页
    jumpToList: function(e) {
        const {
            currentTarget: {
                dataset: {
                    item: {
                        entryUrl: url = '',
                        id = '',
                        metricId = DEFAULT_METRIC_ID
                    }
                }
            }
        } = e;

        if (!url) {
            return;
        }

        this.handleClickMetric({
            name: 'weixin',
            type: 'myctrip-home',
            operate: 'click',
            metricId
        });

        const query = JSON.stringify({"id": id});
        const urlForJump = `${url}?data=${query}`;

        this.ubtTrace(id, {
            fn: 'jumpToList',
            url,
            entryUrl: urlForJump
        });

        jumpWithLogin(`${url}?data=${query}`);
    },
    /**
     * 获取入口的跳转链接
     */
    getEntryUrl: function(item) {
        const {
            entryUrl: oldEntryUrl = ''
        } = item;
        const appVersion = __global.version;

        if (!item || !appVersion) {
            return oldEntryUrl;
        }

        try {
            const versions = Object.keys(item).filter(key => REGEXP_VERSION.test(key));

            if (!versions || versions.length === 0) {
                return oldEntryUrl;
            }
    
            const finalVersion = versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
                .find(version => version <= appVersion);
            const entryUrlInfo = finalVersion ? item[finalVersion] : null;
            const { entryUrl } = entryUrlInfo || {};
            
            return entryUrl || oldEntryUrl;
        } catch (e) {
            this.ubtTrace(TRACE_KEY, {
                channel: 'wx',
                type: 'getEntryUrl catch',
                message: `${e.message}`
            });
        }

        return oldEntryUrl;
    },
    /**
     * 通用跳转处理。处理入口的跳转，支持跳转：
     * 1 当前小程序页面
     * 2 https协议的h5页面
     * 3 其他小程序页面
     *
     * @param {*} e
     * @returns
     */
    handleEntryJump: function(e){
        const {
            currentTarget: {
                dataset: {
                    item
                }
            }
        } = e;
        const {
            id = '',
            // 是否校验登录态（未登录下，拉起登录页）
            needLogin = true,
            appId = '',
            needPhoneLogin = false,
            metricId = DEFAULT_METRIC_ID
        } = item;
        const appVersion = __global.version;

        const entryUrl = this.getEntryUrl(item);
        let url = entryUrl;

        if (entryUrl && typeof entryUrl === 'object') {
            url = entryUrl[currentEnv] || '';
        }

        if (!url) {
            this.ubtTrace(TRACE_KEY, {
                channel: 'wx',
                type: 'handleEntryJump without entry url',
                appVersion
            });
            return;
        }

        const isHttpsUrl = url.indexOf('//') > -1 || url.indexOf('https://') > -1;
        const isMiniProgramUrl = !!appId;

        this.ubtTrace(id, {
            fn: 'handleEntryJump',
            entryUrl,
            needLogin,
            appVersion
        });

        this.handleClickMetric({
            name: 'weixin',
            type: 'myctrip-home',
            operate: 'click',
            metricId
        });

        if(needPhoneLogin) {
            jumpToMobileValidate(NEW_TEMP_MOBILE_ENTRY_URL);
            return;
        }

        if (isHttpsUrl) {
            jumpToH5(url, needLogin);
        } else if (isMiniProgramUrl) {
            jumpToMiniProgram({
                appId,
                appPath: url
            });
        } else {
            needLogin ? jumpWithLogin(url) : jump(url);
        }
    },
    imageErrorHandler: function(e, errDescription = '图片展示失败') {
        const {
            detail: {
                errMsg = ''
            }
        } = e;
        this.ubtTrace(TRACE_KEY, {
            channel: 'wx',
            type: 'image error',
            message: `${errDescription}: ${errMsg}`,
        });
    },
    // 处理头像展示失败时 使用默认头像进行展示
    avatarErrorHandler: function(e) {
        this.imageErrorHandler(e, '使用默认头像');
        this.setData({
            userAvatar: DEFAULT_USER_AVATAR
        });
    },
    // 手机号查单跳转登录
    jumpToMobileList: function() {
        let { mobileSearchListData } = this.data;
        const { metricId = DEFAULT_METRIC_ID } = mobileSearchListData;
        this.handleClickMetric({
            name: 'weixin',
            type: 'myctrip-home',
            operate: 'click',
            metricId
        });
        jumpToMobileValidate(NEW_TEMP_MOBILE_ENTRY_URL);
    },
    /**
     * 我携首页入口点击埋点记录
     * @param opt
     */
    handleClickMetric: function (opt = {
        name: 'weixin',
        type: 'myctrip-home',
        operate: 'click',
        metricId: DEFAULT_METRIC_ID
    }) {
        logWithUbtMetric(opt, METRIC_KEY_MYCTRIP_HOME);
    },
    // 获取活动中心数据
    getMyCtripActivity: function() {
        cwx.request({
            url: URL_MAP.getMyCtripActivity,
            data: {
                "activityId": "MYCTRIP"
            },
            success: (res) => {
                if(res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == 'Success' && res.data.list && res.data.list.length) {
                    let { list, description, descriptionUrl, title } = res.data;
                    let activityList = this.mapMyCtripActivity(list);
                    this.setData({
                        isShowActivityCenter: !!activityList.length,
                        activityCenterData: activityList,
                        activityCenterMoreData: {
                            title: description,
                            entryUrl: descriptionUrl,
                            needLogin: true,
                            id: "c_click_myctrip_more"
                        },
                        activityCenterTitleData: title
                    });
                } else {
                    this.setData({
                        isShowActivityCenter: false,
                        activityCenterData: [],
                        activityCenterMoreData: null,
                        activityCenterTitleData: ''
                    });
                }
            },
            fail: (e) => {
                this.setData({
                    isShowActivityCenter: false,
                    activityCenterData: [],
                    activityCenterMoreData: null,
                    activityCenterTitleData: ''
                });
                this.ubtTrace(TRACE_KEY, {
                    channel: 'wx',
                    type: 'getMyCtripActivity fn',
                    message: `getMyCtripActivity with error: ${e}`
                });
            }
        })
    },
    // 活动中心数据字段key修改
    mapMyCtripActivity: function(data) {
        let list = [];
        data.forEach((item) => {
            let { actTitle, actSubTitle, actImgUrl, actUrl, ubt, customInfo } = item;
            try {
                // 活动中心的数据是bu下发的，默认给needLogin=true做登录态校验，如果bu不需要
                // 可以自己在下发的needLogin中进行控制
                let { needLogin = true, appId = '', metricId = DEFAULT_METRIC_ID } = JSON.parse(customInfo || "{}");
                if(actTitle && actUrl) {
                    list.push({
                        title: actTitle,
                        description: actSubTitle,
                        iconUrl: actImgUrl,
                        entryUrl: actUrl,
                        id: ubt,
                        needLogin,
                        appId,
                        metricId
                    })
                }
            } catch (error) {
            }
        })
        return list;
    },
    // 跳转客服 埋点用
    jumpToCustomer: function() {
        this.ubtTrace('c_click_call', {
            fn: 'jumpToCustomer',
            entryUrl: '咨询客服'
        });
        this.handleClickMetric({
            name: 'weixin',
            type: 'myctrip-home',
            operate: 'click',
            metricId: '咨询客服'
        });

        if (wx.openCustomerServiceChat) {
            const url = 'https://work.weixin.qq.com/kfid/kfcc170b906ee7a5882';
            const corpId = 'ww4433701329588794';

            try {
                wx.openCustomerServiceChat({
                    extInfo: { url },
                    corpId,
                    fail: () => {
                        this.setData({
                            useOldCustomerEntry: true
                        });
                    },
                    complete: (data) => {
                        this.ubtTrace('c_click_call', {
                            message: `jumpToCustomer, 使用新版客服, ${data.errMsg}`
                        });
                    }
                });
            } catch (e) {
                this.setData({
                    useOldCustomerEntry: true
                });
            }
        }
    },
    setIsOldCustomerEntry: function() {
        // 是否使用旧版客服入口
        this.setData({
            useOldCustomerEntry: !(wx && wx.openCustomerServiceChat)
        });
    }
});