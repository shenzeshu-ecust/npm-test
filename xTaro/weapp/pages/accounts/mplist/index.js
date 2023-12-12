import { cwx, CPage } from '../../../cwx/cwx.js';
import { loginCommon } from '../common';
import LogUtil, { createLogMonitor } from '../src/utils/LogUtil'
import { ERROR_CODE_MAP } from '../src/conf/logConf';

var getOrderAndAssociateUrl = "soa2/13775/associateByTokenAndGetOrder.json";
var t;
var messagecode = "S200041";
var mobileToken = "";
var numberMap = new Map();

const orderSearchByMobileMonitor = createLogMonitor({
    scene: 'orderSearchByMobile',
    traceType: 'ordersearch'
})();

CPage({
    checkPerformance: true,
    pageId: '10650014926',
    data: {
        errorMsg: "错误提示",
        errorMsgShow: 'none',
        loginTabShow: 'display:none',
        dynamicLoginShow: 'none',
        normalLoginShow: 'none',
        rediectLoginShow: 'block',
        currentTab_dynamic: ' tab-item_current',
        currentTab_normal: '',
        getdynamictitle: '获取动态码',
        getdynamicabled: true,
        invitecodeShow: 'display:none',
        addInviteCodeShow: 'display:block',
        invitecode1Show: 'display:none',
        addInviteCode1Show: 'display:block',
        mobilephonewarn: '', //'  color-warn'
        dyncpwdwarn: '',
        imgcodewarn: '',
        loginnamewarn: '',
        pwdwarn: '',
        avatarUrl: '',//头像
        avatarShow: 'display:none',//控制头像是否显示
        rediectLoginBtnShow: 'display:none',
        nickname: '携程会员',//昵称
        nicknameShow: 'display:none',
        showname: '',//手机/邮箱/用户名
        shownameShow: 'display:none',
        imgCodeShow: 'display:none',
        imgCodeUrl: '',
        captchaID: '',
        signature: "",
        // 当前用户是否登录
        isLogin: false,
        // 登录前是否勾选同意隐私协议
        isCheckedAgreement: false
    },
    pageData: {
        // 查单成功去往的地址
        mobileSearchSuccessResultUrl: ''
    },
    inputContent: {},
    onLoad: function (options) {
        LogUtil.monitor(true, { scene: 'pageview', stage: 'mplist' });

        this.pageData.mobileSearchSuccessResultUrl = this.getFromQueryViaOptions(options);

        // 检查用户是否登录
        cwx.user.checkLoginStatusFromServer(isLogin => {
            // console.log('[checkLoginStatusFromServer]', isLogin);
            this.setData({
                isLogin
            });
        });
    },

    /**
     * 获取查单页 from 参数（查单成功后跳转使用，必填）
     * @description 查单页提供两种接入方式，因此参数获取有两种方式
     * @See https://pages.release.ctripcorp.com/basebiz-f2e/group-doc/accounts/tinyapp/modules/cwx.user.html#cwx-user-mobilequeryorder
     * @param {*} options 页面初始时的 options 对象
     */
    getFromQueryViaOptions(options = {}) {
        let result = '';

        const isViaWxNavigateTo = options.hasOwnProperty('from');

        // 直跳方式(H5 页面或 scheme url 方式跳转)，类似 wx.navigateTo({ url: `/pages/accounts/mplist/index?from=${encodeURIComponent(your_url)}` })
        if (isViaWxNavigateTo) {
            result = decodeURIComponent(options.from || '');
            // 否则认为是 cwx.user.mobileQueryOrder({ from: your_url }) 方式接入（内部使用 cPage.navigateTo() 方法）
        } else {
            result = options.data && options.data.from;
        }

        LogUtil.logDevTrace({
            stage: 'getFromQueryViaOptions',
            fromQuery: result,
            isViaWxNavigateTo
        });

        return result;
    },

    onUnload: function () {
        if (!(cwx.user.isLogin())) {
            this.invokeCallback({ "ReturnCode": "-1", "Message": "返回操作" })
        }
    },
    onShow: function () {
    },
    onReady: function () {
        this.changeOtherLogin();
    },

    onCheckAgreement() {
        // console.log('onCheckAgreement', this.data.isCheckedAgreement)
        this.setData({
            isCheckedAgreement: !this.data.isCheckedAgreement
        });
    },

    changeOtherLogin: function () {
        this.setData({
            rediectLoginShow: 'none',
            loginTabShow: 'block',
            dynamicLoginShow: 'block',
            normalLoginShow: 'none'
        });
    },
    callback: function (data) {
        //在跳转之前，倒计时关闭
        if (t) {
            clearTimeout(t);
            numberMap.clear();
        }
        this.navigateBack(data);
    },
    mobileQueryOrderClick: function () {
        // total
        orderSearchByMobileMonitor.start();

        var self = this;
        var errormsgtotal = "";
        var errorElement = {};
        if (this.inputContent["mobilephone"] == undefined || this.inputContent["mobilephone"].trim().length == 0) {
            //隐藏提示框
            errormsgtotal = '请输入手机号';
            errorElement["mobilewarn"] = '1';
        }
        if (this.inputContent["dyncpwd"] == undefined || this.inputContent["dyncpwd"].trim().length == 0) {
            if (errormsgtotal.length > 0) {
                errormsgtotal = errormsgtotal + "和动态码";
                errorElement["mobilewarn"] = '3'; //手机号和动态密码都有问题
            } else {
                errormsgtotal = "请输入动态码";
                errorElement["mobilewarn"] = '2';  //只是动态密码有问题
            }
        }

        if (errormsgtotal && errormsgtotal != "") {
            this.errorMsgShow(errormsgtotal, 1, errorElement);

            // fail with input error
            orderSearchByMobileMonitor.fail(ERROR_CODE_MAP.VALIDATE_INPUT_ERROR);

            return false;
        }

        const { isLogin, isCheckedAgreement } = this.data;
        // 登录前提示勾选隐私协议
        if (!isLogin && !isCheckedAgreement) {
            cwx.showToast({
                title: '请先阅读并同意相关协议和政策',
                icon: 'none'
            });

            // fail with agreement
            orderSearchByMobileMonitor.fail(ERROR_CODE_MAP.VALIDATE_AGREEMENT_ERROR);

            return ;
        }

        var _success = function (res1) {
            var retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
            var response_text = {
                "101": "手机号码不能为空",
                "102": "验证码不能为空",
                "201": "手机号码格式错误",
                "301": "您输入的验证码已过期，请重新获取",
                "302": "请输入正确的验证码",
                "304": "您输入的验证码已过期，请重新获取", //"24小时内未向该手机发送验证码 ",
                "305": "您输入的验证码已过期，请重新获取",
                "303": "您输入的验证码已过期，请重新获取",
                "900": "网络不给力,请稍候重试！"
            };

            if (retcode == 0) {
                var result = JSON.parse(res1.data.Result);
                var inretcode = result ? result.returnCode : '904';
                if (inretcode == 0) {
                    mobileToken = result.token;
                    console.log("dynamicLoginClick0, 请求成功, token:" + mobileToken);
                    // 关联并获取ticket
                    self.getOrderAndAssociate(mobileToken);
                } else if (response_text[inretcode]) {
                    console.log("dynamicLoginClick0, 请求成功, 返回码, inretcode:" + inretcode);
                    self.errorMsgShow(response_text[inretcode], 3);
                } else {
                    console.error("dynamicLoginClick0, 请求成功, 无法处理的返回码, inretcode:" + inretcode);
                    self.errorMsgShow("请求校验动态码失败，请稍候再试(" + inretcode + ")", 3);
                }

                // fail with gateway
                if (inretcode != 0) {
                    orderSearchByMobileMonitor.fail(inretcode);
                }
            } else {
                console.error("dynamicLoginClick0, 请求成功, 无法处理AccountGateway的返回码, retcode:" + retcode);
                self.errorMsgShow("请求校验动态码失败，请稍候再试(" + retcode + ")", 3);

                // fail with accountgateway
                orderSearchByMobileMonitor.fail(retcode);
            }
        };
        var _fail = function () {
            console.error("dynamicLoginClick0, AccountGateway请求失败");
            self.errorMsgShow("请求校验动态码失败，请稍候再试(900)", 3);

            // fail with network
            orderSearchByMobileMonitor.fail(ERROR_CODE_MAP.NETWORK_ERROR);
        };
        var data = {
            AccountHead: {},
            Data: {
                messageCode: messagecode,
                code: self.inputContent["dyncpwd"].trim(),
                countryCode: '86',
                mobilePhone: this.inputContent["mobilephone"].trim()
            }
        };
        //发送服务
        cwx.request(loginCommon.getGatewayRequestObj("soa2/11448/checkPhoneCode.json", data, _success, _fail));
    },

    //文本框改变
    textChange: function (e) {
        var self = this;
        this.inputContent[e.currentTarget.id] = e.detail.value;
        if ("mobilephone" == e.currentTarget.id) {
            var mobilephone = e.detail.value;
            if (mobilephone == undefined || mobilephone.trim().length == 0) {
                return;
            }
            var reg = /^1([3456789]\d{9})$/;
            if (!reg.test(mobilephone.trim())) {
                return;
            }
            var s = 0;
            if (numberMap.has(mobilephone.trim())) {
                s = numberMap.get(mobilephone.trim());
            }
            if (s <= 0) {
                self.setData({
                    getdynamictitle: "获取动态码",
                    getdynamicabled: true
                });
                clearTimeout(t);
                self.timeCountDownSlient(mobilephone.trim(), s);
            } else {
                self.setData({
                    getdynamictitle: s + "s后重新发送",
                    getdynamicabled: false
                });
                clearTimeout(t);
                self.timeCountDown(mobilephone.trim(), s);
            }
        }
    },

    //倒计时功能
    timeCountDownSlient: function (phoneNumber, countdown) {
        numberMap.set(phoneNumber, countdown);
        var settime = function () {
            numberMap.forEach(function (item, key, mapObj) {
                if (item > 0) {
                    item--;
                }
                if (item > countdown) {
                    countdown = item;
                }
                numberMap.set(key, item);
            });
            if (countdown >= 0) {
                t = setTimeout(settime, 1000);
            } else {
                if (t) {
                    clearTimeout(t);
                }
            }
        };
        settime();
    },

    errorMsgShow: function (msg, logintype, errorElement) {
        console.log("errormsg 出现,当前登录类型：");
        var self = this;
        if (logintype == '1') {
            //当前登录是手机登录
            if (errorElement["mobilewarn"] == '1') {
                //mobile error
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    mobilephonewarn: ' color-warn'
                });
            } else if (errorElement["mobilewarn"] == '2') {
                //dynamicpwd error
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    dyncpwdwarn: ' color-warn'
                });
            } else if (errorElement["mobilewarn"] == '3') {
                //手机号,动态密码有错出错
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    mobilephonewarn: ' color-warn',
                    dyncpwdwarn: ' color-warn'
                });
            } else if (errorElement["imgcodewarn"] == '1') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    imgcodewarn: ' color-warn'
                });

            } else {
                //服务端返回登录错误
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block'
                    //mobilephonewarn: ' color-warn',
                    //dyncpwdwarn: ' color-warn'
                });
            }
        } else if (logintype == '2') {
            //普通登录
            if (errorElement["loginwarn"] == '1') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    loginnamewarn: ' color-warn'
                });
            } else if (errorElement["loginwarn"] == '2') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    pwdwarn: ' color-warn'
                });
            } else if (errorElement["loginwarn"] == '3') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    loginnamewarn: ' color-warn',
                    pwdwarn: ' color-warn'

                });
            } else {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    // loginnamewarn: ' color-warn',©
                    // pwdwarn: ' color-warn'
                });
            }
        } else {
            this.setData({
                errorMsg: msg,
                errorMsgShow: 'block'
            });
        }

        setTimeout(function () {
            self.setData({
                errorMsg: "",
                errorMsgShow: 'none'
            });
        }, 3000);

    },

    //倒计时功能
    timeCountDown: function (phoneNumber, countdown) {
        var self = this;
        numberMap.set(phoneNumber, countdown);
        var maxValue = countdown;
        var settime = function () {
            numberMap.forEach(function (item, key, mapObj) {
                if (item > 0) {
                    item--;
                }
                if (item > maxValue) {
                    maxValue = item;
                }
                numberMap.set(key, item);
            });
            if (countdown <= 0) {
                self.setData({
                    getdynamictitle: "获取动态码",
                    getdynamicabled: true
                });
                countdown = -1;
            } else {
                self.setData({
                    getdynamictitle: countdown + "s后重新发送",
                    getdynamicabled: false

                });
                countdown--;
            }
            if (maxValue >= 0) {
                t = setTimeout(settime, 1000);
            } else {
                if (t) {
                    clearTimeout(t);
                }
            }
        };
        settime();
    },

    getImageCode: function () {
        //仅输入正确的手机号判断是否出风控
        var self = this;
        var mobilephone = self.inputContent["mobilephone"];
        if (mobilephone == undefined || mobilephone.trim().length == 0) {
            return false;
        }
        var reg = /^1([3456789]\d{9})$/;
        if (!reg.test(mobilephone.trim())) {
            return false;
        }

        var data = {
            "AccountHead": {},
            "Data": {
                "CountryCode": "86", "MobilePhone": mobilephone.trim(),
                "sendScene": "RegistCode", "CheckMobilePhoneNumber": "NoCheck",
                "Context": [
                    { "Key": "clientID", "Value": cwx.clientID },
                    { "Key": "Version", "Value": '1.0' },
                    { "Key": "Url", "Value": 'accounts/mplist/index' },
                    { "Key": "Platform", "Value": 'MINIAPP' },
                    { "Key": "page_id", "Value": self.pageId }
                ]
            }
        };

        var _success = function (res) {
            if (res && res.data) {
                var data = res.data;
                if (data.ReturnCode == 0) {
                    console.log("risk result:" + data.Result);
                    //var result = JSON.parse(data.Result);
                    var result = data.Result;

                    if (result && result.ReturnCode == 1001) {
                        console.log("risk ReturnCode:" + result.ReturnCode + ", Message:" + result.Message);
                        //需要风控验证码
                        var imgUrl = "data:image/gif;base64," + result.ImgCode;
                        self.setData({
                            imgCodeShow: 'display:block',
                            imgCodeUrl: imgUrl,
                            captchaID: result.CaptchaId,
                            signature: result.Signature
                        });
                        return;
                    }
                }
            }

            self.setData({
                imgCodeShow: 'display:none'
            });
        };
        var _fail = function (res) {
            self.setData({
                imgCodeShow: 'display:none'
            });

        }

        cwx.request(loginCommon.getGatewayRequestObj('risk/11448/sendMessageByPhoneLogin.json', data, _success, _fail))

    },

    sendVerifyCodeWithRiskControl: function () {
        var self = this;
        var errormsgtotal = "";
        var errorElement = {};
        console.log("发送动态密码");
        var mobilephone = self.inputContent["mobilephone"];
        if (mobilephone == undefined || mobilephone.trim().length == 0) {
            //隐藏提示框
            errormsgtotal = "请输入手机号";
            errorElement['mobilewarn'] = '1';
            self.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        }


        var reg = /^1([3456789]\d{9})$/;
        if (!reg.test(mobilephone.trim())) {
            //隐藏提示框
            errormsgtotal = "手机号格式不正确";
            errorElement['mobilewarn'] = '1';
            self.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        }


        var imgCode = self.inputContent["img_code_box"];

        if (self.data.imgCodeShow == 'display:block') {
            if (imgCode == undefined || imgCode.length == 0) {
                errormsgtotal = "请输入图片验证码";
                errorElement['imgcodewarn'] = '1';
                self.errorMsgShow(errormsgtotal, 1, errorElement);//todo
                return false;
            }
        }

        cwx.showToast({
            title: '发送验证码...',
            icon: 'loading',
            duration: 10000,
            mask: true
        });
        //send vcode
        var _success = function (res) {
            cwx.hideToast();
            if (res && res.data && res.data.ReturnCode == 0) {
                var result = JSON.parse(res.data.Result);
                console.log("result:" + res.data.Result);
                var returnCode;
                if (result.ReturnCode != undefined) {
                    returnCode = result.ReturnCode;
                } else {
                    returnCode = result.returnCode;
                }

                var errMsgs = {
                    102: "请输入手机号码",
                    202: "请输入正确的手机号码",
                    201: "手机号格式不正确",
                    301: "该手机号码发送超过次数限制",
                    303: "60秒内不能重发",
                    401: "每隔60s才能获取一次验证码",
                    402: "验证码发送次数已达上限",
                    1004: "请输入正确的图片验证码",
                    1005: "请输入正确的图片验证码",
                    1002: "您的帐号已锁定,如有疑问请拨打客服电话！",
                    1003: "您的帐号已锁定,请30分钟后再试！",
                    900: "网络不给力,请稍候重试！"
                }
                if (result && returnCode == 0) {
                    clearTimeout(t);
                    self.timeCountDown(mobilephone.trim(), 60);
                    return;
                } else if (result && returnCode == 1002) {
                    //长锁
                    errormsgtotal = "您的帐号已锁定,如有疑问请拨打客服电话！";

                } else if (result && returnCode == 1003) {
                    //短锁
                    errormsgtotal = "您的帐号已锁定,请30分钟后再试！";
                } else if (result && errMsgs[returnCode]) {
                    errormsgtotal = errMsgs[returnCode];
                    errorElement['mobilewarn'] = '1';
                } else {
                    console.log("无法解析的返回码， result.ReturnCode:" + returnCode);
                    errormsgtotal = "发送失败(" + returnCode + ")";
                    errorElement['mobilewarn'] = '1';
                }
            } else {
                errormsgtotal = "发送失败";
            }

            if (errormsgtotal && errormsgtotal != "") {
                self.errorMsgShow(errormsgtotal, 1, errorElement);
            }
            self.getImageCode();

        };
        var _fail = function (res) {
            cwx.hideToast();
            console.log("发送失败");
            console.log(res);
            errormsgtotal = "发送失败";
            self.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        };

        var data = {
            "AccountHead": {
                "ImageCaptcha": {
                    "Signature": self.data.signature,
                    "ImgCode": imgCode,
                    "CaptchaId": self.data.captchaID
                }
            },
            "Data": {
                "messageCode": messagecode, "CountryCode": "86", "MobilePhone": mobilephone.trim(),
                "sendScene": "SMS-LOGIN-SITE", "CheckMobilePhoneNumber": "NoCheck",
                "extension": [
                    { "Key": "clientID", "Value": cwx.clientID },
                    { "Key": "Version", "Value": '1.0' },
                    { "Key": "Url", "Value": 'accounts/mplist/index' },
                    { "Key": "Platform", "Value": 'MINIAPP' },
                    { "Key": "page_id", "Value": self.pageId },
                    { "Key": "SceneType", "Value": "SMS-LOGIN-SITE" }
                ]
            }
        };

        cwx.request(loginCommon.getGatewayRequestObj('soa2/11448/sendMessageByPhoneLogin.json', data, _success, _fail));
    },

    onMobileSearchSuccess() {
        const { mobileSearchSuccessResultUrl: url } = this.pageData;
        if (!url) {
            return;
        }

        if (/^http(s)?:/i.test(url)) {
            cwx.component.cwebview({
                data: {
                    url: encodeURIComponent(url),
                    needLogin: true,
                    isNavigate: false
                }
            });
        } else {
            cwx.redirectTo({
                url
            });
        }
    },

    getOrderAndAssociate: function (token) {
        var params = {};
        var self = this;
        var unionData = cwx.mkt.getUnion() || {};
        params.Data = {
            AccountHead: { platform: "MINIAPP" },
            token: token,
            strategyCode: 'CTRIP_MOBILE_MINIAPP_GETORDER',
            loginStrategyCode: "DC62E83C8FD72BDA",
            loginNameType: "mobile",
            platform: "miniapp",
            ticketVersion: 2,
            context: {
                allianceid: `${unionData.allianceid || ''}`,
                sid: `${unionData.sid || ''}`
            }
        };
        var _success = function (res) {
            console.log(res)
            var result = JSON.parse(res.data.Result);
            if (result && result.resultStatus.returnCode == 0) {
                // 跳转 到订单页
                if (!!result.isTicketNew) {
                    cwx.user.auth = result.ticket;
                }

                // success
                orderSearchByMobileMonitor.success(!!result.isTicketNew ? 'haslogin' : 'nologin');

                self.onMobileSearchSuccess();
            } else {
                // 报错
                var msg = "手机号查单失败[" + result.resultStatus.message + "]";
                var errorElement = {};
                errorElement["mobilewarn"] = '3';
                self.errorMsgShow(msg, 1, errorElement);

                // fail with gateway
                orderSearchByMobileMonitor.fail(
                    result && result.resultStatus && typeof result.resultStatus.returnCode !== 'undefined'
                        ? result.resultStatus.returnCode
                        : ERROR_CODE_MAP.NETWORK_ERROR
                );
            }
            console.log(result);
        }
        var _fail = function (data) {
            console.log(data);

            // fail with network
            orderSearchByMobileMonitor.fail(ERROR_CODE_MAP.NETWORK_ERROR);
        }
        cwx.request(loginCommon.getGatewayRequestObj(getOrderAndAssociateUrl, params, _success, _fail));
    },

    showLoading(c) {
        cwx.showToast({
            title: c || '加载中',
            icon: 'loading',
            duration: 10000,
            mask: true
        })
    },
    hideLoading() {
        cwx.hideToast()
    },
    showToast(t) {
        cwx.showToast({
            title: t,
            icon: 'success',
            duration: 3000
        })
    },
    hideToast() {
        cwx.hideToast()
    },

    onJump(e) {
        const target = e.currentTarget || e.target || {};
        const { dataset } = target;
        const jumpType = dataset && dataset.jumptype ? dataset.jumptype : '';
        let url;
        switch (jumpType) {
            case 'agreement': {
                url = 'https://m.ctrip.com/webapp/abouth5/common/agreement?type=1&back=true';
                break;
            }
            case 'policy': {
                url = 'https://contents.ctrip.com/activitysetupapp/mkt/index/infopectionguide';
                break;
            }
            default: {
                break;
            }
        }
        if (!url) {
            return;
        }
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url),
                needLogin: false
            }
        });
    },
});
