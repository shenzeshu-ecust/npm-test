import { cwx, CPage, __global } from '../../cwx/cwx.js';
import tips from './tips';
import defaultHomePage from "./defaultHomePage";
import { formatDuring, abValue, logWithUbtTrace, logWithUbtMetric, logWithUbtDevTrace, currentEnv, version } from './common/utils';
import { URL_MAP } from './common/confs/fetchConfs';

// 是否支持WebView
const SupportWebView = cwx.canIUse('web-view');

let coordinate = {
    type: null,
    latitude: null,
    longitude: null,
    overSea: false
}

CPage({
    pageId: "10320613574",
    // 白屏检测接入文档： http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=3192    张秋雨
    checkPerformance: true,  // 添加白屏检测标志位
    data: {
        source: 'wxhome',
        appId: '99999999',
        ignoreLocation: true,
        skipLoad: true,
        fakeData: true, // true:local false:online
        isSupportCustom: true, // 是否支持自定义头部，默认支持
        AdvertiseDataWidth: 0,
        AdvertiseDataHeight: 0,
        activities: [],
        abtest: {},
        equityShow: false,
        indicatorDots: true,
        vertical: false,
        autoplay: false,
        interval: 2000,
        duration: 500,
        slideVideo: {
            dotPosition: 'center',
            dotColor: '#FFF',
            dotCurrentColor: '#FFF',
        },
        secondScreenHotSaleData: null, // 特价爆款
        secondScreenLiveData: null,// 携程直播
        currentSpecialDot: 0, // 当前显示的特价爆款index
        swiperHeight: 350, // 宫格滑动 第一屏高度350
        swiperPoint: 0, // 宫格滑动 第一屏为0 第二屏为1
        lonAndLat: {
            isEnable: false
        },
        secondScreenVersion: 'B', //固定B版，不展示首页的二屏。
        extra: "{\"getCardListRequest\":\"{\\\"ext\\\": {\\\"cver\\\": \\\"9999.000\\\"}}\"}",
        defaultSign: true, // 若当天未签到，展示gif动画。其他情况都是展示默认图。
        homeBgGray: false // 首页背景色是否为灰色，特殊时期使用
    },

    // 分享至朋友圈组件
    onShareTimeline: function () {},

    // 分享
    onShareAppMessage: function () {
        return {
            title: '携程旅行--酒店机票火车票汽车票预订',
            desc: '欢迎使用携程旅行，预定酒店机票火车票汽车票！',
            path: '/pages/home/homepage'
        }
    },

    onLoad: function (opt) {

        var self = this;

        const rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
        const isSupport = !!(rect && rect.left)
        wx.getSystemInfo({
            success: res => {
                const ios = !!(res.system.toLowerCase().search('ios') + 1)
                self.setData({
                    ios,
                    barHeight: rect.height,
                    statusBarHeight: res.statusBarHeight,
                    innerWidth: isSupport ? `width:${rect.left}px` : '',
                    innerPaddingRight: isSupport ? `padding-right:${res.windowWidth - rect.left}px` : '',
                    isSupportCustom: !!version(res.version, '7.0.3')
                })
            },
        })

        // 市场部 有toUrl时 经过首页跳转至目标页
        try {
            if (opt.toUrl) {
                this.setData({
                    skipLoad: true
                })
                if (cwx.__firstToUrl) {
                    cwx.__firstToUrl = null;
                }
                this.navigateTo({
                    url: decodeURIComponent(opt.toUrl),
                    complete: function () {
                        setTimeout(function () {
                            this.setData({
                                skipLoad: false
                            })
                            opt.toUrl = null;
                            this._onLoad(opt);
                        }.bind(this), 3000)
                    }.bind(this)
                })
                // 从模板消息进入页面，点击左上角的回到首页icon，跳转到了签到页。此逻辑不合理，点击首页icon应该回到首页才对。和尹安确认，当初可能是为了给签到页引流才加的。现在影响使用，故注释掉此段代码。
                // } else if ((opt.toUrl == null || opt.toUrl == '') && cwx.scene == '1043' && !cwx.__firstToUrl && (cwx.__firstToPath == null || /home\/homepage/.test(cwx.__firstToPath)
                // )) {
                //     self.setData({
                //         skipLoad: true
                //     })
                //     self.navigateTo({
                //         url: decodeURIComponent('/pages/market/signIn/index?activityid=wechat_signin_activity'),
                //         complete: function () {
                //             setTimeout(function () {
                //                 self.setData({
                //                     skipLoad: false
                //                 })
                //                 opt.toUrl = null;
                //                 self._onLoad(opt);
                //             }.bind(this), 3000)
                //         }.bind(this)
                //     })
            } else {
                self.setData({
                    skipLoad: false
                })
            }
        } catch (e) {
            self.setData({
                skipLoad: false
            })
            console.error(e);
        }

        // 动态计算广告banner的宽高
        try {
            let query = wx.createSelectorQuery()
            query.select('.slider-show').boundingClientRect();
            query.exec(function (res) {
                self.setData({
                    AdvertiseDataWidth: (res[0] && res[0].width) || (cwx.wxSystemInfo.windowWidth - 24),
                    AdvertiseDataHeight: (res[0] && res[0].height) || (cwx.wxSystemInfo.windowWidth - 24) * 0.25
                })
            });
        } catch (error) {
            self.setData({
                AdvertiseDataWidth: cwx.wxSystemInfo.windowWidth - 24,
                AdvertiseDataHeight: (cwx.wxSystemInfo.windowWidth - 24) * 0.25
            })
        }

        /**
         * AB需求
         */
        if (opt.customAB == 'A') {
            self._homeABTest = 'A'
        } else if (opt.customAB == 'B') {
            self._homeABTest = 'B'
        } else {
            if (cwx._homeABTest == "B") {
                self._homeABTest = "B"
            } else {
                self._homeABTest = "A"
            }
        }

        // 首页宫格AB实验模板
        // let Homestay = 'abtest.Homestay';
        // self.setData({
        //     [Homestay]: cwx.ABTestingManager.valueForKeySync("210127_BBZ_inn")
        // })
        // let expResult = cwx.ABTestingManager.valueForExpresultSync("210127_BBZ_inn");
        // self.ubtSet('abtest', expResult) // 埋点ab上报

        // 机票宫格AB实验
        // const homeFlight = 'abtest.flight';
        // const homeFlightValue = cwx.ABTestingManager.valueForKeySync("220329_FLT_tsyep") || '';

        if (!self.data.skipLoad) {
          self._onLoad(opt);
          // try {
          //   self.setData({
          //       [homeFlight]: homeFlightValue
          //   }, () => {
          //     self._onLoad(opt);
          //   })
          // } catch (error) {
          //   self._onLoad(opt);
          // }
        }
    },
    _onLoad: function (opt) {
        var self = this;
        console.log('用户的clientId', cwx.clientID);
        /**
         * ABTest，这里可以强制指定A还是B
         * cwx._homeABTest = 'A'
         */

        if (self._homeABTest == null) {
            self._homeABTest = cwx._homeABTest;
        }

        self.initGridInfo();

        self.getActivityInfo();

        // 获取下发的更多页面数据
        cwx.configService.watch('More', function (data) {
            // data = [
            //     {
            //         "position":10,
            //         "bu": "conference",
            //         "buName": "公司会务",
            //         "ubt": "conference",
            //         "h5url": "https://mice.ctrip.com/purposeh5",
            //         "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/more/more-conference.png"
            //     },
            //     {

            //     "bu": "card",
            //     "buName": "333",
            //     "ubt": "card",
            //     "h5url": "https://pages.c-ctrip.com/Finance/201907/media/index.html?from_native_page=1&title=银行卡优惠",
            //     "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/more/more-card.png"
            // },
            // {
            //     "delete":true,
            //     "bu": "join",
            //     "buName": "加盟合作11",
            //     "ubt": "join",
            //     "h5url": "https://m.ctrip.com/webapp/more/cooperation.html",
            //     "imgUrl": "http://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/more/more-join.png"
            //   },
            // ]

            if (data && data.length) {
                let temp = self.data.cusitems;
                data.forEach(item => {
                    if (!item.bu || !item.buName || !item.ubt) {
                        return;
                    }
                    let isThere = temp.find(moreItem => moreItem.bu == item.bu);
                    if (isThere) {
                        temp = temp.filter(moreItem => moreItem.bu !== item.bu);
                    }
                    if (!item.delete) {
                        if (item.position) {
                            temp.splice(item.position - 1, 0, item);
                        } else {
                            temp.push(item)
                        }
                    }
                })
                self.setData({
                    cusitems: temp
                })
            }
        })

        // 首页背景色
        cwx.configService.watch('homeBgColor', function (data) {
            if (data && data.backgroundColor === 'gray') {
                self.setData({
                    homeBgGray: true
                })
            }
        })
    },
    onShow: function () {
        let self = this;

        // cwx.locate.startGetCtripCity(function (res) {
        //     // console.log('首页启动拿到的定位信息', res)
        //     if (res.statusCode == 200 && res.data.ResponseStatus.Ack == "Success") {
        //         coordinate = {
        //             type: res.data.LBSType.toString(),
        //             latitude: res.data.CityLatitude,
        //             longitude: res.data.CityLongitude,
        //             overSea: false
        //         };
        //     }
        //     self.initSecondScreenInfo();
        // });


        // 获取签到数据
        self.getSignTodayInfoProxy((status) => {
            self.setData({
                defaultSign: status
            })
        });

        self.Selected = false;

        logWithUbtMetric({
            "type": "explore",
            "position": "grid"
        })

    },
    onUnload: function () {
        this.endSetInter();
    },
    onHide: function () {
        this.endSetInter();
    },
    homeADeve: function (e) {
        this.setData({
            equityShow: !e.detail.length
        })
    },
    // 宫格数据处理
    initGridInfo: function () {
        let self = this;
        // 数据AB处理
        // if (defaultHomePage && defaultHomePage.items) {
        //     defaultHomePage.items = abValue(defaultHomePage.items, self.data.abtest);
        // }

        // let itemsString = '', abtestString = '';
        // try {
        //   itemsString = JSON.stringify(defaultHomePage.items);
        //   abtestString = JSON.stringify(self.data.abtest);
        // } catch (error) {} 

        // logWithUbtDevTrace({
        //   "tinyapp": "weixin",
        //   "stage": "initGridInfo value -> items and abtest",
        //   "items": itemsString,
        //   "abtest": abtestString
        // })

        self.setData(Object.assign(defaultHomePage, {
          fakeData: true
        }));

        self._tipsFill();
        self.Selected = false;
    },
    // tips
    _tipsFill: function () {
        tips.init(function (tip) {
            var n = tips.arrange(tip);
            [this.data.items, this.data.cusitems].forEach(function (item) {
                item && item.length && item.forEach(function (o) {
                    if (o.buName in n) {
                        o.tip = n[o.buName];
                    }
                })
            })
            this.setData({
                items: this.data.items,
                cusitems: this.data.cusitems
            })
        }.bind(this));
    },
    // 滑动完成 
    swiperAnimationFinish: function (e) {
        if (e.detail.current === 0) {
            this.setData({
                swiperHeight: Math.ceil(this.data.items.length / 5) * 118 - 4,
                swiperPoint: 0
            })
        }
        if (e.detail.current === 1) {
            this.setData({
                swiperHeight: Math.ceil(this.data.cusitems.length / 5) * 118 - 4,
                swiperPoint: 1
            })
            logWithUbtMetric({
                "type": "explore",
                "position": "second-grid"
            })
        }
    },
    // 二屏和信息流数据初始化
    initSecondScreenInfo: function () {
        this.getSecondScreenInfo((res) => {
            let secondScreenData = null;
            if (res.statusCode == 200 && res.data.ResponseStatus.Ack == "Success" && res.data.items && res.data.items.length > 0) {
                secondScreenData = JSON.parse(res.data.items[0]).items;
                // 特价爆款数据处理
                let tempSecondScreenHotSaleData = secondScreenData[0];
                // 选择同时有title、url的前三个数据
                let tempHotSaleItems = tempSecondScreenHotSaleData?.items?.filter((item) => item.title && item.url).splice(0, 3) || [];

                let isSloganPoll = false; // 是否进入爆款状态轮询
                tempHotSaleItems.map((item) => {
                    item.showSlogan = item.slogan;
                    if (item.secKill && item.secKill.beginTime && item.secKill.endTime && item.secKill.beginTime.length && item.secKill.endTime.length) {
                        let beginTime = new Date(item.secKill.beginTime).getTime();
                        let endTime = new Date(item.secKill.endTime).getTime();
                        let nowTime = new Date().getTime();
                        if (nowTime < beginTime) {
                            item.showSlogan = `距开始${formatDuring(beginTime - nowTime)}`;
                        }
                        if (nowTime > beginTime && nowTime < endTime) {
                            item.showSlogan = `距结束${formatDuring(endTime - nowTime)}`;
                        }
                        isSloganPoll = true;
                    }
                })

                tempSecondScreenHotSaleData.items = tempHotSaleItems;

                if (isSloganPoll) {
                    this.startSetInter();
                }

                // 直播数据处理
                let tempSecondScreenLiveData = secondScreenData[1];
                let tempLiveItems = tempSecondScreenLiveData?.items?.filter((item) => item.title && item.url).splice(0, 1) || [];

                if (tempLiveItems.length && tempLiveItems[0].user) {
                    let isbusinessuser = tempLiveItems[0].user.isbusinessuser;
                    tempLiveItems[0].user.vicon = isbusinessuser === '0' ? 'https://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home/C-user.png' : isbusinessuser === '1' ? 'https://pic.c-ctrip.com/platform/h5/mini_programe/v2021.1.7/home/B-user.png' : '';
                }

                tempSecondScreenLiveData.items = tempLiveItems;

                this.setData({
                    secondScreenHotSaleData: tempHotSaleItems.length ? tempSecondScreenHotSaleData : [],
                    secondScreenLiveData: tempLiveItems.length ? tempSecondScreenLiveData : []
                })

            } else {
                this.setData({
                    secondScreenHotSaleData: [],
                    secondScreenLiveData: []
                })
            }
            // console.log('getSecondScreenInfo----resultData', secondScreenData)
        })
    },
    // 获取二屏数据
    getSecondScreenInfo: function (fn) {
        cwx.request({
            url: URL_MAP.getSecondScreenInfo,
            // header: { 'x-ctrip-canary-req': '1' },
            data: {
                "coordinate": coordinate,
                "ext": {
                    "cver": '9999.000' // 为了解决版本号的问题，传入的"9999.000"，保证获取的都是新版数据
                }
            },
            success: (res) => {
                fn(res);
            },
            fail: (res) => {
                fn(res);
            }
        })
    },
    // 特价爆款
    changeSpecialDot: function (e) {
        this.setData({ currentSpecialDot: e.detail.current })
    },
    // 轮询时间,查看秒杀状态
    startSetInter: function () {
        var that = this;
        //将计时器赋值给setInter
        that.data.setInter = setInterval(
            function () {
                let tempSecondScreenHotSaleData = that.data.secondScreenHotSaleData;
                that.setData({
                    secondScreenHotSaleData: tempSecondScreenHotSaleData
                })
            }
            , 1000)
    },
    endSetInter: function () {
        var that = this;
        //清除计时器  即清除setInter
        clearInterval(that.data.setInter)
    },
    // 特价爆款、携程直播跳转
    secondScreenTap: function (e) {},
    // 获取活动数据
    getActivityInfo: function () {
        let self = this;
        cwx.request({
            url: URL_MAP.getActivityInfo,
            data: {
                "activityId": "CTRIP_HomePage"
            },
            success: (res) => {
                if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == 'Success' && res.data.list && res.data.list.length) {
                    let { list } = res.data;
                    self.setData({
                        activities: this.mapActivityInfo(list).slice(0, 6)
                    })
                } else {
                    self.setData({
                        activities: []
                    })
                }
            },
            fail: (e) => {
                self.setData({
                    activities: []
                })
            }
        })
    },
    // 活动数据处理
    mapActivityInfo: function (data) {
        let list = [];
        data.forEach((item) => {
            let { actTitle, actSubTitle, actImgUrl, actUrl, ubt, customInfo } = item;
            try {
                let { appId = '', ...configure } = JSON.parse(customInfo || "{}");
                let path = '', h5url = '', url = '';

                if (actTitle && actUrl) {

                    if (appId) {
                        path = actUrl;
                    } else if (/^https?:\/\//i.test(actUrl)) {
                        h5url = actUrl;
                    } else {
                        url = actUrl
                    }

                    list.push({
                        ubt,
                        title: actTitle,
                        subTitle: actSubTitle,
                        imgUrl: actImgUrl,
                        h5url,
                        url,
                        appId,
                        path,
                        configure
                    })
                }
            } catch (error) {
            }

        })
        return list;
    },
    // 宫格、活动跳转
    clickGridAction: function (e) {
        let { item, position } = e.currentTarget.dataset;
        this.goToTap(item, position);
    },
    // 跳转
    goToTap: function (item, position) {
        var self = this;
        if (self.Selected == true) {
            return;
        }
        self.Selected = true;
        logWithUbtTrace({
            "block": item.ubt
        });
        let itemString = '';
        try {
            itemString = JSON.stringify(item);
        } catch (error) {
            
        } 
        logWithUbtDevTrace({
          "tinyapp": "weixin",
          "stage": "goToTap click",
          "item": itemString,
          "position": position || 'home'
        })
        logWithUbtMetric({
            "bu": item.ubt,
            "type": "click",
            "position": position || 'home'
        })
        if (item.appId) {
            //跳转到独立小程序
            cwx.user.getToken((token) => {
                // http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=1158
                let path = item.path;
                path += path.indexOf('?') > -1 ? '&' : '?';
                path += `__userToken=${token}`;
                cwx.cwx_navigateToMiniProgram({
                    appId: item.appId,
                    path,
                    envVersion: "release",
                    openEmbedded: true,
                    extraData: {
                        __userToken: token
                    },
                    complete: function () {
                        self.Selected = false
                    }
                })
            });
        } else if (SupportWebView && item.h5url) { // 如果支持WebView且有配置H5的地址, 则加载H5的地址
            self._itemH5UrlHandle(item);
            self.Selected = false;
        } else {
            self.navigateTo({
                url: item.url,
                complete: function () {
                    self.Selected = false
                }
            })
        }
    },
    // h5跳转
    _itemH5UrlHandle: function (item) {
        let { configure } = item;
        let h5url = (currentEnv === 'prd' ? item.h5url : (item.testh5url || item.h5url));
        h5url = h5url.replace(/[\u4e00-\u9fa5]+/g, function (str) { return encodeURIComponent(str) })
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(h5url),
                ...configure
            }
        });
    },
    // 获取信息流组件实例，e.detail是组件实例，此方法与 waterfall的 bindgetref 绑定
    getWaterfallRef: function (e) {
        this.waterfall = e.detail;
    },
    // 瀑布流加载，此方法需与 scroll-view 的 bindscrolltolower 绑定
    getWaterfallListMore: function () {
        this.waterfall && this.waterfall.getListMore();
    },
    // 获取今日签到情况
    getSignTodayInfoProxy: function (fn) {
        const { auth } = cwx.user;
        if(!auth) {
            fn(true);
            return;
        }
        // 访问堡垒环境，以下两种方法都可以
        // 1、在链接中加?isCtripCanaryReq=1
        // url: `${URL_MAP.getSignTodayInfoProxy}?isCtripCanaryReq=1`, 
        // 2、header中加x-ctrip-canary-req=1
        // header: { "x-ctrip-canary-req": "1" },
        cwx.request({
            url: URL_MAP.getSignTodayInfoProxy,
            success: (res) => {
                try {
                    if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == 'Success' && res.data.responseJson && res.data.responseJson.length) {
                        let { responseJson } = res.data;
                        let signData = JSON.parse(responseJson);
                        if(signData && signData.ResponseStatus && signData.ResponseStatus.Ack == 'Success' && signData.message && signData.message === "成功" && !signData.sign) {
                            fn(false);
                        } else {
                            fn(true);
                        }
                    } else {
                        fn(true);
                    }
                } catch (error) {
                    fn(true);
                }
                
            },
            fail: (err) => {
                fn(true);
            }
        })
    },
    // 更多活动点击
    clickMoreActivityAction: function () {
      const item = {
        "ubt": "more_activity",
        "url": "/pages/market/web/index?from=https%3A%2F%2Fcontents.ctrip.com%2Factivitysetupapp%2Fmkt%2Findex%2Fmoreactivities%3Finnersid%3Dwxgd"
      };
      this.goToTap(item, "more_activity");
    }
});
