/**
 * 自定义头部
 * @module componet/navbar
 */
var { cwx } = require('../../index.js');

// 版本号比较函数
function compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);
        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}

Component({
    properties: {
        navbarData: {
            //navbarData   由父页面传递的数据，变量名字自命名
            type: Object,
            value: {},
            observer: function (newVal, oldVal, changedPath) {
                if (newVal == null && typeof oldVal == 'object') {
                    try {
                        var _o = {};
                        var defaultData = {
                            overrideDefined: false,
                            statusBarHeight: '',
                            titleBarHeight: '',
                            navbarData: {
                                showCapsule: 1, //是否显示左上角小房子 1显示 0 不显示
                                showBack: 1, //是否显示返回 1显示 0不显示
                                showColor: 1, //navbar背景颜色 1蓝色 0白色
                                navigationBarColor: '#0086F6',
                            },
                        };

                        _o['navibarData'] = defaultData['navbarData'];
                        _o.overrideDefined = defaultData.overrideDefined;
                        this.setData(_o);
                    } catch (e) {}
                } else {
                    // var data = this.data;
                    var data = {};
                    var path = 'navibarData';
                    Object.keys(newVal).forEach((key) => {
                        data[`${path}.${key}`] = newVal[key];
                    });
                    this.setData(data);
                }
            },
        },
    },

    data: {
        overrideDefined: true,
        statusBarHeight: '',
        titleBarHeight: '',
        showNavbar: '',
        navibarData: {
            showCapsule: 0, //是否显示左上角小房子
            showBack: 1, //是否显示返回
            showColor: 1, //navbar背景颜色,
            navigationBarColor: '#0086F6',
        },
    },
    attached: function () {
        if (
            wx.getSystemInfoSync().platform.toLowerCase().indexOf('devtools') !=
            -1
        ) {
            this.setData({ showNavbar: true });
        } else {
            // 获取版本号
            const version = wx.getSystemInfoSync().version;
            if (compareVersion(version, '7.0.0') >= 0) {
                // 版本号大于7.0.0时，显示自定义头部
                this.setData({ showNavbar: true });
            } else {
                //   // 版本号低于7.0.0时，隐藏自定义头部
                this.setData({ showNavbar: false });
            }
        }
        // 定义导航栏的高度   方便对齐
        console.error(1111, cwx._pageStack);
        this.setData({
            statusBarHeight: global.globalData.statusBarHeight,
            titleBarHeight: global.globalData.titleBarHeight,
        });
    },
    ready() {
        try {
            //console.error('pageLifetimes', cwx._wxGetCurrentPages)
            var _o1 = {};
            if (this.data.overrideDefined == false) {
                if (cwx._wxGetCurrentPages.length > 1) {
                    _o1.showBack = true;
                    _o1.showCapsule = true;
                } else {
                    _o1.showBack = false;
                    if (
                        cwx._wxGetCurrentPages[0].__route__ !==
                        __wxConfig.pages[0]
                    ) {
                        _o1.showCapsule = true;
                    } else {
                        _o1.showCapsule = false;
                    }
                }
            } else {
                //无论如何返回按钮出现的规则不变
                if (cwx._wxGetCurrentPages.length > 1) {
                    _o1.showBack = true;
                } else {
                    _o1.showBack = false;
                }
            }
            this.setData({
                navibarData: Object.assign(
                    {},
                    {
                        title: __wxConfig.page[
                            cwx._wxGetCurrentPages[
                                cwx._wxGetCurrentPages.length - 1
                            ].__route__ + '.html'
                        ].window.navigationBarTitleText,
                    },
                    this.data.navibarData,
                    _o1
                ),
            });
        } catch (e) {}
    },
    methods: {
        //返回到首页
        _backhome(e) {
            if (this.data.navibarData.customHome) {
                var value = this.triggerEvent('home', e.detail, {});
            } else {
                if (__wxConfig.tabBar && __wxConfig.tabBar.list.length > 0) {
                    cwx.switchTab({
                        url: '/' + __wxConfig.pages[0],
                    });
                } else {
                    cwx.redirectTo({
                        url: '/' + __wxConfig.pages[0],
                    });
                }
            }
        },
        _backlast(e) {
            if (this.data.navibarData.customBack) {
                var value = this.triggerEvent('back', e.detail, {});
            } else {
                cwx.navigateBack();
            }
        },
    },
    pageLifetimes: {
        show() {
            //console.error('pageLifetimes', cwx._wxGetCurrentPages[0].__route__)
            //console.error('pageLifetimes', __wxConfig.page);
            //console.error('pageLifetimes', __wxConfig.page[cwx._wxGetCurrentPages[0].__route__+'.html'].navigationBarTitleText)
            //console.error(3333, this)
        },
        hide() {
            // 页面被隐藏
        },
        resize(size) {
            // 页面尺寸变化
        },
    },
});
