/**
 * 自定义头部
 * @module componet/navbar
 */
var __global = require('../../ext/global.js').default;
var cwx = __global.cwx;

const app = getApp()

// 版本号比较函数
function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])
        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}


Component({
    properties: {
        navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
            type: Object,
            value: {},
            observer: function (newVal, oldVal, changedPath) {
                if (newVal == null && typeof (oldVal) == 'object') {
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
                                navigationBarColor: '#ffffff',
                                bgTransparent: false, // true 背景为透明 false 不透明(下面两个属性也不生效)
                                iconColor: 'black', // white 左侧icon颜色
                                titleColor: '#000000' // 可以指定title具体色值
                            }
                        }

                        _o['navibarData'] = defaultData['navbarData']
                        _o.overrideDefined = defaultData.overrideDefined;
                        this.setData(_o);
                    } catch (e) {

                    }
                } else {
                    // var data = this.data;
                    var data = {};
                    var path = 'navibarData';
                    Object.keys(newVal).forEach(key => {
                        data[`${path}.${key}`] = newVal[key];
                    })
                    this.setData(data);
                }
            }
        }
    },

    data: {
        overrideDefined: true,
        statusBarHeight: '',
        titleBarHeight: '',
        showNavbar: '',
        menuButtonInfo:{},
        navibarData: {
            showCapsule: 0, //是否显示左上角小房子
            showBack: 1, //是否显示返回
            showColor: 1, //navbar背景颜色,
            navigationBarColor: '#ffffff',
            bgTransparent: false, // true 背景为透明 false 不透明(下面两个属性也不生效)
            iconColor: 'black', // white 左侧icon颜色
            titleColor: '#000000' // 可以指定title具体色值
        }
    },
    attached: function () {
        if (wx.getSystemInfoSync().platform.toLowerCase().indexOf('devtools') != -1) {
            this.setData({showNavbar: true});
        } else {
            // 获取版本号
            const version = wx.getSystemInfoSync().version
            if (compareVersion(version, '7.0.0') >= 0) {
                // 版本号大于7.0.0时，显示自定义头部
                this.setData({showNavbar: true})
            } else {
                //   // 版本号低于7.0.0时，隐藏自定义头部
                this.setData({showNavbar: false})
            }
        }
        // 定义导航栏的高度   方便对齐
        console.log(`%c 1111 ${cwx._pageStack}`,'color:#0f0;')

        this.setData({
            statusBarHeight: app.globalData.statusBarHeight,
            titleBarHeight: app.globalData.titleBarHeight
        });
        //获取右上角胶囊的大小，为显示自定义icon做准备
        this.setData({
          menuButtonInfo:wx.getMenuButtonBoundingClientRect()
            });
    },
    ready() {
        try {
            //console.error('pageLifetimes', cwx._wxGetCurrentPages)
            var _o1 = {}
            if (this.data.overrideDefined == false) {
                if (cwx._wxGetCurrentPages.length > 1) {
                    _o1.showBack = true;
                    _o1.showCapsule = true;
                } else {
                    _o1.showBack = false;
                    if (cwx._wxGetCurrentPages[0].__route__ != 'pages/home/homepage') {
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
                navibarData: Object.assign({}, {title: __wxConfig.page[cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1].__route__ + '.html'].window.navigationBarTitleText}, this.data.navibarData, _o1)
            }, () => {
                console.log(this.data.navibarData)
            })

        } catch (e) {

        }
    },
    methods: {
        //返回到首页
        _backhome(e) {
            if (this.data.navibarData.customHome) {
                var value = this.triggerEvent('home', e.detail, {});
            } else {
                wx.switchTab({
                    url: '/pages/home/homepage',
                });
            }
        },
        _backlast(e) {
            if (this.data.navibarData.customBack) {
                var value = this.triggerEvent('back', e.detail, {});
            } else {
                cwx.navigateBack();
            }
        },
        //自定义icon的点击事件，返回对应的type值
        _icontap:function(e){
          this.triggerEvent('icontap',{type:e.currentTarget.dataset.type},{});
        }
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
        }
    }

})
