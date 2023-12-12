import {
    cwx,
    CPage,
    __global
} from '../../cwx/cwx.js';
const CLIENT_ID_KEY = 'clientID';

CPage({
    pageId: 10650067849,
    data: {
        // 展示
        envVersion: __global.envVersion || "release",
        envVersionMap: {
            "develop": "开发版",
            "trial": "体验版",
            "release": "正式版"
        },
        isLogin: false,
        clientID: '',
        openid: '',
        vid: '',

        // 控制弹窗 / 浮层 todo??? toast 的初始值都写上来
        currentToastKey: '',
        showMask: false,
        showEnvSelector: false, // 网络环境
        showCanarySelector: false, // 堡垒
        showNavMiniappToast: false, // 跳转到其他小程序
        showNavH5Toast: false, // h5页面跳转
        showSystemInfo: false, // 系统信息
        showStorageToast: false, // 本地缓存
        showScanCodeToast: false, // 扫码

        // 是否打开调试开关
        enableDebug: false,
        debugMode: false,

        // 设置网络环境
        env: __global.env,
        envTextMap: {
            prd: '生产',
            uat: 'UAT',
            fat: 'FAT'
        },
        inputSubEnv: __global.subEnv,

        // 是否访问堡垒
        useCanary: __global.useCanary,
        // 酒店测试环境的请求URL转发到mars平台
        hotelMarsClose: false,

        // 小程序内部跳转
        navPagePath: '',

        // h5
        needLogin: false,
        needSocket: false,
        h5urlPagePath: '',
        h5url: '',

        systemInfo: {}, // 系统信息

        // 缓存
        storageKey: '',
        currentStorageValue: '此处将显示查询缓存key相应的值',
        storageValue: '',
        storageInfo: {},

        // cid
        inputCid: '',

        qrCodeContent: '',
    },

    // 统一处理 input 赋值
    handleInputChange: function (e) {
        let key = e.currentTarget.dataset.key;
        let value = e.detail.value;
        this.setData({
            [key]: value
        }, () => {
            if (key === 'h5url') {
                this.processUrl()
            }
        })
    },
    // 统一展示弹窗
    handleShowModal: function (e) {
        let key = e.currentTarget.dataset.key;
        this.setData({
            [key]: true,
            currentToastKey: key,
            showMask: true
        })
    },
    // 统一关闭弹窗
    handleHideMask: function () {
        let currentToastKey = this.data.currentToastKey;
        this.setData({
            [currentToastKey]: false,
            currentToastKey: '',
            showMask: false
        })
    },
    // 统一拷贝到剪切板
    copyToClipboard: function (e) {
        let data = e.currentTarget.dataset.value;
        cwx.setClipboardData({
            data: data,
            success() {
                cwx.showToast({
                    title: `复制成功`,
                })
            },
            fail(res) {
                cwx.showModal({
                    title: `复制失败`,
                    content: `原因：${JSON.stringify(res)}`
                })
            },
        })
    },
    // 统一清理 input 框
    clearInput: function (e) {
        this.setData({
            [`${e.currentTarget.dataset.key}`]: ''
        })
    },
    modifySubEnv: function (e) {
        let value = this.data.inputSubEnv;
        console.log('选择网络子环境：', value)
        wx.setStorageSync("NET_SUBENV_CACHE", JSON.stringify({
          val: value,
          expire: new Date().getTime() + 1 * 60 * 60 * 1000 // 默认1小时过期
        }))
        wx.showToast({
          title: `subEnv: ${value}`,
        })
    },

    // 2.1 设置是否打开调试开关。此开关对正式版也能生效。（基础库 1.4.0 开始支持）
    debugModeChange: function (e) {
        const value = (e.detail && (e.detail.value || e.detail.checked)) || false;

        cwx.setEnableDebug({
            enableDebug: value,
        })

        this.setData({
            debugMode: value,
        })
    },
    // 2.2 选择网络环境
    selectGlobalEnv: function (e) {
        let selectedType = e.currentTarget.dataset.type;
        if (selectedType === this.data.type) {
            return;
        }
        let that = this;

        cwx.showModal({
            title: '提示',
            content: selectedType === 'uat' ? 'UAT环境无法获取到相应环境下的 mktOpenid, 请谨慎切换' : `正在切换到 ${that.data.envTextMap[selectedType]} 环境, 切换后将关闭小程序, 需要重新打开`,
            success: function(res) {
                if (res.confirm) { // 确认切换
                    // 2.2.1 如果选择 uat 环境，则不清理 mktOpenid, 也不重新获取（市场这边没有 uat 环境的 openid）
                    if (selectedType !== 'uat') {
                        wx.removeStorageSync('cwx_market_new')
                        cwx.cwx_mkt.openid = '';
                        that.setData({
                            openid: cwx.cwx_mkt.openid
                        })
                    }

                    // 2.2.2 退出登录，清理登录态
                    if (that.data.isLogin) {
                        cwx.user.logout((success) => {
                            // success 目前都是true
                            that.setData({
                                isLogin: cwx.user.isLogin()
                            })
                        });
                    }

                    // 2.2.3 将 __global.env 改成选择的值
                    wx.setStorageSync("globalEnvSetting", selectedType);

                    // 2.2.4 展示网络环境为选择的环境
                    that.setData({
                        env: selectedType
                    })

                    // 2.2.5 退出小程序（重启才能请求刚选择的网络环境下的接口）
                    // 2.2.5.1 切到 测试环境的时候，反正都要退出小程序重新进入，就直接通过开启调试来退出小程序
                    if(['fat', 'uat'].indexOf(selectedType) > -1) {
                        cwx.setEnableDebug({
                            enableDebug: true,
                        })
                    }
                    if (cwx.canIUse('exitMiniProgram')) {
                        cwx.exitMiniProgram({
                            fail: (e) => {
                                console.log(e);
                                wx.showModal({
                                    title: '自动退出小程序失败',
                                    content: '请手动结束当前小程序进程并重新进入！！！'
                                })
                                that.handleHideMask();
                            }
                        });
                    } else {
                        wx.showModal({
                            title: '当前基础库不支持 wx.exitMiniProgram',
                            content: '请手动结束当前小程序进程并重新进入！！！'
                        })
                        that.handleHideMask();

                    }
                }
            },
            confirmText: '切换'
        })
    },
    // 2.3 指定访问堡垒
    selectCanary: function (e) {
        let value = e.currentTarget.dataset.value || false;
        console.log('选择堡垒：', value)
        wx.setStorageSync("NET_CANARY_CACHE", JSON.stringify({
          val: value,
          expire: new Date().getTime() + 1 * 60 * 60 * 1000 // 默认1小时过期
        }))
        this.setData({
            useCanary: value,
        })
        this.handleHideMask();
    },
    // 2.4.1 酒店堡垒测试开关
    getHotelBastion: function () {
        var hotelBastion = '0';
        try {
            var _hotelBastion = wx.getStorageSync('P_HOTEL_BASTION_TEST');
            if (_hotelBastion && _hotelBastion.length) {
                hotelBastion = _hotelBastion;
            }
        } catch (e) {
            // ignore
        }

        return hotelBastion;
    },
    // 2.4.1 酒店请求加解密
    getHotelEncodeReq: function() {
        var hotelEncodeReq = '1';
        try {
            var _hotelEncodeReq = wx.getStorageSync('P_HOTEL_ENCODE_REQ');
            if (_hotelEncodeReq && _hotelEncodeReq.length) {
                hotelEncodeReq = _hotelEncodeReq;
            }
        } catch (e) {
            // ignore
        }

    return hotelEncodeReq;
    },
    // 2.4.3 酒店测试环境的请求URL转发到mars平台
    getHotelMarsState: function () {
        let hotelMarsClose = false;
        try {
            hotelMarsClose = wx.getStorageSync('P_HOTEL_MARS_CLOSE');
        } catch (e) {
            // ignore
        }
        return hotelMarsClose;
    },
    // 开启/关闭酒店mars mock
    handleHotelMarsChange: function (e) {
        wx.setStorageSync('P_HOTEL_MARS_CLOSE', e.detail.value === '1');
        cwx.reLaunch({
            url: '/pages/hotel/inquire/index'
        });
    },
    // 2.5 汽车票
    busHeaderControl: function () {
        let busHeaderControl = '';
        try {
            let cbusHeaderControl = wx.getStorageSync('BUS_:HEADER_CONTROL');
            if (cbusHeaderControl && cbusHeaderControl.length) {
                busHeaderControl = cbusHeaderControl;
            }
        } catch (e) {
            // ignore
        }

        return busHeaderControl;
    },
    busHeaderChange: function (e) {

        let busHeaderControl = e.detail.value;

        wx.setStorageSync('BUS_:HEADER_CONTROL', busHeaderControl);
        this.setData({
            itemBusHeader: [{
                    name: 'SHAOY',
                    value: 'SHAOY',
                    checked: busHeaderControl == 'SHAOY'
                },
                {
                    name: '关闭',
                    value: '',
                    checked: busHeaderControl.length == 0
                }
            ],
        });
    },
    navToMiniapp: function (type) {
        if(this.data.miniappId && this.data.miniappPagePath) {                        
            cwx.cwx_navigateToMiniProgram({
                appId: this.data.miniappId,
                path: this.data.miniappPagePath,
                envVersion: type,
                success: function(e) {
                    this.handleHideMask();
                }, 
                fail: function(e) {
                  cwx.showToast({
                      icon: 'none',
                      title: e && e.errMsg || '跳转失败',
                      duration: 2000
                  })
                }
            })   
        } else {
            cwx.showToast({
                icon: 'none',
                title: '小程序 appId 和 页面路径 为必填项！',
                duration: 2000
            })
        }
    },
    // 2.6 统一跳转
    handleNavigate: function (e) {
        let navType = e.currentTarget.dataset.type;
        let that = this;
        try {
            switch (navType) {
                case 'navPage':
                    cwx.navigateTo({
                        url: this.data.navPagePath,
                        fail: function(e) {
                            cwx.showModal({
                                title: '跳转失败',
                                content: JSON.stringify(e)
                            })
                        }
                    })
                    break;
                case 'rediPage':
                    cwx.redirectTo({
                        url: this.data.navPagePath
                    })
                    break;
                case 'switchPage':
                    cwx.switchTab({
                        url: this.data.navPagePath
                    })
                    break;
                case 'navToMiniappRelease':
                    that.navToMiniapp("release");
                    break;
                case 'navToMiniappTrial':
                    that.navToMiniapp("trial");
                    break;
                case 'navToMiniappDev':
                    that.navToMiniapp("develop");
                    break;
                case 'navToH5url':
                    cwx.component.cwebview({
                        data: {
                            url: encodeURIComponent(this.data.h5url),
                            needLogin: this.data.needLogin,
                            needSocket: this.data.needSocket
                        }
                    })
                    break;
            }
        } catch(e) {
            cwx.showModal({
                title: '跳转失败',
                content: JSON.stringify(e)
            })
        }
    },
    // 2.6.2 h5页面跳转
    processUrl: function () {
        let data = {
            url: encodeURIComponent(this.data.h5url), //需要跳转的H5方式地址
            needLogin: this.data.needLogin, // 页面打开时是否需要登录态
            needSocket: this.data.needSocket
        }
        this.setData({
            h5urlPagePath: `/cwx/component/cwebview/cwebview?data=${JSON.stringify(data)}`
        })
    },
    handleNeedLogin: function (e) {
        this.setData({
            needLogin: e.detail.value
        }, () => {
            this.processUrl()
        })
    },
    handleNeedSocket: function (e) {
        this.setData({
          needSocket: e.detail.value
        }, () => {
          this.processUrl()
        })
    },
    // 2.7 查询/修改本地缓存
    getStorageSync: function () {
        if (!this.data.storageKey) {
            cwx.showToast({
                icon: 'none',
                title: '请填入需要查看的本地缓存keyName',
                duration: 2000
            })
            return;
        }

        let currentStorageValue = wx.getStorageSync(this.data.storageKey) || '无';
        let dataType = typeof currentStorageValue;
        if (!["string", "number", "bigint", "boolean", "null", "undefined", "symbol"].includes(dataType)) {
            try {
                currentStorageValue = JSON.stringify(currentStorageValue)
                cwx.showToast({
                    icon: 'none',
                    title: `缓存值为 ${dataType} 类型数据, 将展示为JSON.stringify处理后的值`,
                    duration: 2000
                })
            } catch (e) {
                console.log(e);
                cwx.showToast({
                    icon: 'fail',
                    title: `缓存值为 ${dataType} 类型数据, JSON.stringify 处理失败`,
                    duration: 2000
                })
            }
        }
        this.setData({
            currentStorageValue
        })
    },
    handleSetStore: function () {
        wx.setStorageSync(this.data.storageKey, this.data.storageValue)
        
        cwx.showToast({
          icon: 'success',
          title: '缓存设置成功',
          duration: 2000
        })
        this.setData({
            storageInfo: wx.getStorageInfoSync()
        })
    },
    // 2.10 设置 clientID
    modifyClientID: function () {
        if (!this.data.inputCid) {
            cwx.showToast({
                icon: 'none',
                title: 'clientID值将被设置为空字符串',
                duration: 2000
            })
        };
        cwx.clientID = this.data.inputCid;
        wx.setStorage({
            key: CLIENT_ID_KEY,
            data: cwx.clientID
        });
        this.setData({
            clientID: cwx.clientID
        })
    },
    handleScanCode: function(){
        let that = this;
        // 测试页面，不走授权弹窗
        wx.scanCode({
            success: function(res) {
               console.log('二维码结果', res);
               let qrCodeContent = JSON.stringify(res);
               that.setData({
                    qrCodeContent
                })
                cwx.showModal({
                    title: '扫码结果',
                    content: qrCodeContent,
                    success() {
                        cwx.setClipboardData({
                            data: qrCodeContent,
                            success() {
                                cwx.showToast({
                                    title: `复制成功`,
                                })
                            },
                            fail(res) {
                                cwx.showModal({
                                    title: `复制失败`,
                                    content: `原因：${JSON.stringify(res)}`
                                })
                            },
                        })
                    },
                    confirmText: '复制'
                })
            }
        })
    },

    onLoad: function () {
        cwx.sharkShark = true;
        clearTimeout(cwx.timeoutCLearShark);
    },
    onShow: function () {
        clearTimeout(cwx.timeoutCLearShark);
        cwx.sharkShark = true;

        // 重置一些内容
        this.setData({
            isLogin: cwx.user.isLogin(),
            // navPagePath: '',
            storageInfo: wx.getStorageInfoSync(),
            useCanary: __global.useCanary
        })

        var bastion = this.getHotelBastion();
        var hotelEncodeReq = this.getHotelEncodeReq();
        const hotelMarsClose = this.getHotelMarsState();

        var busHeaderControl = this.busHeaderControl();
        this.setData({
            itemsEnv: [{
                    name: 'fat',
                    value: 'fat',
                    checked: this.env == 'fat'
                },
                {
                    name: 'uat',
                    value: 'uat',
                    checked: this.env == 'uat'
                },
                {
                    name: 'prd',
                    value: 'prd',
                    checked: this.env == 'prd'
                }
            ],
            itemsHotelBastion: [{
                    name: '堡垒开启',
                    value: '1',
                    checked: bastion == '1'
                },
                {
                    name: '镜像开启',
                    value: '2',
                    checked: bastion == '2'
                },
                {
                    name: '关闭',
                    value: '0',
                    checked: bastion != '1' && bastion != '2'
                }
            ],
            itemsHotelEncodeReq: [{
                    name: '请求加密',
                    value: '1',
                    checked: hotelEncodeReq == '1'
                },
                {
                    name: '请求解密',
                    value: '0',
                    checked: hotelEncodeReq == '0'
                }
            ],
            itemsHotelMars: [
                {
                    name: 'mars开启',
                    value: '0',
                    checked: !hotelMarsClose
                },
                {
                    name: 'mars关闭',
                    value: '1',
                    checked: hotelMarsClose
                }
            ],
            itemBusHeader: [{
                    name: 'SHAOY',
                    value: 'SHAOY',
                    checked: busHeaderControl == 'SHAOY'
                },
                {
                    name: '关闭',
                    value: '',
                    checked: busHeaderControl.length == 0
                }
            ],
            hotelMarsClose,
        })
    },
    onReady: function () {
        // 设置初始值
        this.setData({
            debugMode: __wxConfig && __wxConfig.debug || false,
            env: __global.env,
            isLogin: cwx.user.isLogin(),
            openid: cwx.cwx_mkt && cwx.cwx_mkt.openid || '',
            vid: __global.vid || "",
            clientID: cwx.clientID,
            inputCid: cwx.clientID,
            subEnv: __global.subEnv,
            systemInfo: cwx.wxSystemInfo || cwx.getSystemInfoSync(),
            storageInfo: wx.getStorageInfoSync()
        })
        cwx.Observer.addObserverForKey("OpenIdObserver", () => {
            this.setData({
                openid: cwx.cwx_mkt && cwx.cwx_mkt.openid || ''
            })
        });
    },
    onUnload: function () {
        cwx.sharkShark = false;
    },

    envChange: function (e) {
        console.log('radio发生change事件, 携带value值为：', e.detail.value)
        wx.setStorageSync("globalEnvSetting", e.detail.value)
        wx.setEnableDebug({
            enableDebug: true
        })
        wx.navigateBack();
    },
    hotelBastionChange: function (e) {
        console.error('>>>>>> hotelBastionChange, e:', e);
        wx.setStorageSync('P_HOTEL_BASTION_TEST', e.detail.value);
        wx.reLaunch({
            url: '/pages/hotel/inquire/index'
        })
    },
    hotelEncodeReqChange: function (e) {
        wx.setStorageSync('P_HOTEL_ENCODE_REQ', e.detail.value);
        cwx.reLaunch({
            url: '/pages/hotel/inquire/index'
        });
    }
})
