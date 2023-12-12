/**
 * CN description: 钱包微信实名改造
 * EN description: Wallet WeChat real-name transformation
 * Author: sqsun at <sqsun@trip.com>
 * Created Date: 2020-04-27 10:08:12 am
 * ------
 * Last Modified: Monday, 22nd March 2021 2:07:19 pm
 * Modified By: sqsun
 * ------
 */


import {
    cwx,
    CPage,
    _
} from '../../../cwx/cwx.js';

import {
    util
} from '../common/util.js';
import {
    WalletGetAuthCodeModel,
    WalletSetRealNameModel,
    WalletCheckAgeModel
} from '../common/model.js'

let isSubmitting = false  // 提交实名节流
let isJumpAuth = false  // 跳转授权节流

CPage({
    pageId: '10650041958',
    submitTags: { //form check tag
        name: false,
        idCard: false
    },
    optionsData: {
        token: '',
        pageSource: '',
        scene: '',
        mktOpenid: '',
        miniAppBack: false,
        submitpend: false,
        isNavBack: false
    },
    data: {
        complianceText: '',
        agreementList: [],
        agreementChecked: false, //协议是否点击
        focusKey: 0, //input foucs data
        inputKeys: {},
        focusList: { //input focusArr
            "2": false
        },
        cinputData: { //Multiple input box set val
            "2": ''
        },
        weakAuthData: null, //弱实名用户数据
        formApp: false, //是否是携程应用过来实名的
        token: '', //CBU服务端传值token
        extData: null, //跳转用户实名授权小程序所需参数
        submiting: false, // 是否可提交实名
        modelSubmit: false, //获取服务签名成功
        realNamed: false, //微信验证实名失败
        conflicted: false, //微信实名冲突
        conflictedTxt: '', //微信实名冲突提示文案
        realSuccess: false,
        realNames: false, //是否是弱实名提交
        showModal: false, //是否展示自定义的modal提示框
        appReturnData: '', //返回携程应用带上的参数
        needGetAuthCode: false,
        hasBackBtn: true, //展示返回携程应用按钮
        showModifyRemind:false, // 是否展示实名提示
        referFrom: 0,
        navbarData: {
          title: '实名认证',
          customBack: true,
          showBack: true
        },
    },
    onBack: function(){
      util.sendUbt({
          a: 'realname-onBack',
          c: 100002,
          d: 'realname click back',
          dd: '微信实名认证点击返回'
      });
      const data = {
        realNamed: this.data.realSuccess,
        realNameDatas: {
          "name": this.data.inputKeys["1"],
          "idType": 1
        }
      }
      if(this.optionsData.isNavBack && this.optionsData.navBackPath){
        this.jumpUrl(this.optionsData.navBackPath, data)
      }else{
        const currentPage = cwx.getCurrentPage();
        currentPage.navigateBack(data)
      }
    },
    onLoad: function (options) {
        const navgateData = options.data || options;
        const pageSource = navgateData.pageSource;
        const token = navgateData.token;
        const scene = navgateData.scene || '';
        const isFromWallet = navgateData.isFromWallet || 'false';
        const clientType = Number(navgateData.clientType) || 0;
        const isNavBack = navgateData.isNavBack || false;
        const navBackPath = navgateData.navBackPath;
        this.myPage = cwx.getCurrentPage();
        util.ubtTrace('133166', {
            type: 'c_payWallet_pageLoad',
            ...options
        });
        if (!pageSource && !token) {
            util.showModal('系统异常，请重试- E001', () => {
                const currentPage = cwx.getCurrentPage();
                const backData = {
                    realNamed: false,
                    realNameDatas: {}
                }
                currentPage.navigateBack(backData);
            });
            util.ubtTrace('153092', {
                type: 'c_payWallet_pageParamsErr',
                val: 'token,pageSource 都为空'
            });
        }

        if (clientType == 1) {
            //携程应用跳转过来实名的
            this.setData({
                formApp: true,
                referFrom: clientType,
            })
        }else{
            this.setData({
                referFrom: clientType,
            })
        }

        this.optionsData.token = token;
        this.optionsData.pageSource = pageSource;
        this.optionsData.scene = scene;
        this.optionsData.isNavBack = isNavBack;
        this.optionsData.isFromWallet = isFromWallet;

        if (navBackPath) {
            this.optionsData.navBackPath = decodeURIComponent(navBackPath);
        }

        this.signGet();
        util.sendUbt({
            a: 'realname-onload-data',
            c: 100002,
            d: 'Realnameonload:options.data',
            dd: '微信实名认证中间页onLoad'
        });
    },
    onShow: function (res) {
        const that = this;
        const {
            scene,
            referrerInfo = {}
        } = cwx;
        if (scene == 1038) {
            const {
                extraData
            } = referrerInfo;
            util.sendUbt({
                a: 'navigateToMiniProgram back',
                c: 100002,
                d: 'navigateToMiniProgram back success',
                dd: '收到的场景号为： ' + cwx.scene,
                referrerInfo
            });

            if (that.optionsData.miniAppBack && extraData && extraData.auth_code) {
                that.optionsData.miniAppBack = false;
                that.authToken = extraData.auth_code;
                if (!that.data.realSuccess) {
                    util.showLoading('实名认证中');
                    util.sendUbt({
                        a: 'navigateToMiniProgram back',
                        c: 100002,
                        d: 'navigateToMiniProgram back has auth_code_1',
                        dd: 'auth_code获取成功,自动提交实名'
                    });
                    that.formSubmiting({ ubtFrom: 'auth_code获取成功,自动提交实名' });
                } else {
                    util.sendUbt({
                        a: 'navigateToMiniProgram back',
                        c: 100002,
                        d: 'navigateToMiniProgram back has auth_code_2',
                        dd: 'auth_code获取成功,用户已经实名成功'
                    });
                }
            }
        }
        try {
            throw new Error(1)
        } catch (e) {
            util.sendUbt({
                a: 'get stack',
                c: 100002,
                d: 'throw error get stack',
                dd: '获取被调用栈信息：' + JSON.stringify(e.stack)
            });
        }
    },
    //all input focus action
    //CN 输入框获取焦点动作
    focusAction: function (e) {
        const that = this;
        const eKeys = Number(e.target.dataset.key);
        that.dKeys = this.data.focusKey;

        if ((that.dKeys & eKeys) != eKeys) {
            that.setData({
                focusKey: eKeys + that.dKeys
            })
        }
    },
    //all input blur action
    //CN 输入框失去焦点动作
    blurAction: function (e) {
        const that = this;
        const val = e.detail.value;
        const vLen = val.length;
        const eKeys = Number(e.target.dataset.key);
        if (vLen > 0) {
            if (eKeys == 2 && !that.submitTags.idCard) { //名字校验
                util.showToast('请输入正确的证件号码');
            }

            if ((that.dKeys & eKeys) != eKeys) {
                that.dKeys = that.dKeys + eKeys;
            }
        } else {
            if (eKeys == 1) { //名字校验
                util.showToast('请输入您的真实姓名');
            }
            if (eKeys == 2) { //名字校验
                util.showToast('请输入证件号码');
            }
            if ((that.dKeys & eKeys) == eKeys) {
                that.dKeys = that.dKeys - eKeys;
            }
        }

        that.setData({
            focusKey: that.dKeys
        })
    },
    //set card police input with val focus status
    //CN 多功能输入框点击获取焦点动作
    // activeInput: function(e) {
    //     const that = this;
    //     const key = e.target.dataset.key;
    //     const { focusList } = that.data;
    //     const activeFocus = Object.assign(focusList, {});
    //     _.map(activeFocus, function(v, name){
    //         activeFocus[name] = false;
    //     });

    //     that.setData({
    //         focusList: activeFocus
    //     }, function() {
    //         activeFocus[key] = true;
    //         that.setData({
    //             focusList: activeFocus
    //         })
    //     });
    // },
    //EN all input dom input event action
    //CN 监听所有输入框输入动作
    bindKeyInput: function (e) {
        const that = this;
        let submitBit = false;
        const val = e.detail.value;
        const key = e.target.dataset.key;

        const {
            inputKeys,
            cinputData
        } = that.data;
        const cVal = Object.assign(inputKeys, {});
        const cinputVal = Object.assign(cinputData, {});
        cVal[key] = val;

        if (key == '1') { //名字校验
            const varTrim = val.replace(/(^\s*)|(\s*$)/g, '');
            if (varTrim.length > 1) {
                that.submitTags.name = true;
            } else {
                that.submitTags.name = false;
            }
        } else if (key == '2') { //身份证校验
            const checkedId = util.checkIDCard(val);
            if (checkedId) {
                that.submitTags.idCard = true;
            } else {
                that.submitTags.idCard = false;
            }
            cinputVal[key] = util.idCardEvent(val);
            inputKeys[key] = util.idCardEvent(val);
            // console.log(inputKeys[key])
        }

        //对必填字段做特校验
        const {
            name,
            idCard
        } = that.submitTags;
        if (name && idCard && this.data.agreementChecked) {
            submitBit = true;
        }
        that.setData({
            inputKeys: cVal,
            cinputData: cinputVal,
            submiting: submitBit
        });
    },
    //EN hide customize modal component
    //CN 隐藏自定义的CONFIRM 弹出框
    hideModal() {
        util.ubtTrace('158798', {
            type: 'c_wallet_wechatrealname_abnormal_cancel',
            val: '用户点击了alert-取消按钮'
        });
        this.setData({
            showModal: false
        })
    },
    // 跳转实名授权
    submitRealname(){ 
      if(isJumpAuth){
        util.ubtTrace('133169', {
            type: 'c_payWallet_isJumpAuth',
            val: 'submitRealname 节流'
        });
        return
      }
      isJumpAuth = true
      setTimeout(() => {
        isJumpAuth = false
      }, 6000);

      util.ubtTrace('133169', {
          type: 'c_payWallet_submitRealname',
          val: '用户点击跳转授权',
          extData: this.data.extData
      });
      wx.navigateToMiniProgram({
        appId: 'wx88736d7d39e2eda6', // 要打开的小程序 appId
        path: '/pages/oauth/authindex', // 打开的页面路径，如果为空则打开首页。
        extraData: this.data.extData, // 需要传递给目标小程序的数据 
        envVersion: 'release', //这个有没有问题
        success:()=> {this.miniSuccess()},
        fail:(res)=> {this.miniFail(res)},
      })

    },
    //EN The verification of the name and ID card service failed, the user revises the operation again
    //CN 姓名与身份证服务校验失败，用户修改再次校操作
    // 不需要授权的场景
    againSubmit() {
        const that = this;
        const {
            realNames
        } = that.data;
        if (!realNames) {
            that.setData({
                showModal: false
            });
            util.sendUbt({
                a: 'againSubmit',
                c: 100002,
                d: 'againSubmit not realNames submit',
                dd: '用户再次提交实名'
            });
            that.signGet((data = {}) => {
                const {
                    code,
                    authStatus
                } = data;
                if (code == 0 && authStatus != 1) {
                    util.sendUbt({
                        a: 'againSubmit',
                        c: 100002,
                        d: 'againSubmit not realNames submit',
                        dd: '用户未实名自动再次提交实名'
                    });
                    that.formSubmiting({ ubtFrom: '用户未实名自动再次提交实名' });
                }
            });
        } else {
            util.ubtTrace('158797', {
                type: 'c_wallet_wechatrealname_abnormal_confirm',
                val: '用户点击了alert-确认按钮'
            });
            that.formSubmiting({ ubtFrom: 'againSubmit_2' });
        }
    },
    //EN Failed to obtain token service by default, user clicks OK button to obtain token service again
    //CN 默认获取token服务失败，用户点击确定按钮再次获取token服务
    doSignGet(e) {
        const that = this;
        util.ubtTrace('133169', {
            type: 'c_payWallet_tokenGetByUser',
            val: '用户点击再次获取sign服务'
        });
        that.signGet((data = {}) => {
            const {
                code,
                needAuth,
                authStatus
            } = data;
            if (code == 0) {
                const setStateData = {
                    needGetAuthCode: false
                }

                if (needAuth) {
                    setStateData.needGetAuthCode = true;
                    setStateData.showModal = true;
                    setStateData.modelSubmit = false;
                    util.ubtTrace('133169', {
                        type: 'c_payWallet_needGetAuthCode',
                        val: '用户需要点击再次获取authcode服务'
                    });
                } else {
                    if (authStatus != 1) {
                        util.sendUbt({
                            a: 'doSignGet',
                            c: 100002,
                            d: 'doSignGet not realNames',
                            dd: '未实名用户提交实名'
                        });
                        that.formSubmiting({ ubtFrom: 'doSignGet_2' });
                    }
                }

                that.setData(setStateData);
            }
        });
    },
    getAppJumpUrl(urlStr = '') {
        const that = this;
        const urlArr = urlStr.split('|');
        const formWallet = that.optionsData.isFromWallet.toLowerCase();
        if (urlArr.length < 2 || formWallet === 'true') {
            return '';
        }

        const urlLink = cwx.util.base64Encode(urlArr[1]);
        const urlType = urlArr[0];

        const backAppUrl = `ctrip://wireless/h5?url=${urlLink}&type=${urlType}`;
        return backAppUrl;
    },
    //EN Get service toke and WeChat authorization signature
    //CN 获取服务toke与微信授权签名
    signGet(callBack) {
        const that = this;
        util.ubtTrace('133168', {
            type: 'c_payWallet_tokenGet',
            val: '获取authCode sign服务开始'
        });

        // 先获取市场openid
        that.getMktOpenid(mktOpenid => {
            that.optionsData.mktOpenid = mktOpenid;
            if (!mktOpenid) {
                util.hideLoading();
                util.showModal('系统异常，请重试！-E002');
                return;
            }
            const optionsData = that.optionsData;
            const appId = cwx.appId || '';
            const {
                token,
                pageSource,
                scene
            } = optionsData;
            const signRequestData = {
                "openId": mktOpenid,
                "appId": appId,
                "scene": scene
            }

            // 有token用token，没有就传pageSource
            if (token) {
                signRequestData.token = token;
            } else {
                signRequestData.pageSource = decodeURIComponent(pageSource);
            }

            if (callBack) {
                util.showLoading();
            }
            // 请求7201获取 Info, 用来拿微信 authCode
            WalletGetAuthCodeModel(signRequestData, {
                onSuccess: function (data = {}) {
                    util.hideLoading();
                    util.ubtTrace('133168', {
                        type: 'c_payWallet_tokenGet',
                        val: '获取authCode sign服务返回成功'
                    });
                    const appReturnUrl = data.returnUrl;
                    const launchappUrl = that.getAppJumpUrl(appReturnUrl);
                    // data.rc = 0
                    if (data.rc == 0) {
                        // needAuth：是否需要用户授权
                        const {
                            needAuth,
                            info,
                            token,
                            authInfo,
                            pageSource,
                            showToAppBtn,
                            authComplianceInfo = {},
                            showModifyRemind = false,
                        } = data;
                        that.optionsData.token = token; //更新token
                        if (pageSource) {
                            that.optionsData.pageSource = pageSource;
                        }

                        const {
                            authStatus,
                            weakAuth,
                            idNo,
                            idNoCrypt,
                            userName,
                            userNameMask
                        } = authInfo;

                        if (authStatus == 1) {
                            // 已实名
                            if (weakAuth) {
                                // 弱实名
                                const setDatas = {
                                    inputKeys: {
                                        "1": userNameMask,
                                        "2": idNoCrypt
                                    },
                                    focusKey: 3,
                                    cinputData: {
                                        "2": idNo
                                    },
                                    weakAuthData: {
                                        idNo,
                                        idNoCrypt,
                                        userName,
                                        userNameMask
                                    },
                                    modelSubmit: false,
                                    realNamed: true,
                                    submiting: true,
                                    realNames: true,
                                    appReturnData: launchappUrl,
                                    hasBackBtn: showToAppBtn,
                                    showModifyRemind
                                }

                                if (needAuth) {
                                    let infoJson = null;
                                    try {
                                        infoJson = JSON.parse(info);
                                    } catch (e) { }

                                    setDatas.extData = infoJson;
                                    setDatas.modelSubmit = true;
                                    setDatas.needGetAuthCode = true;
                                }
                                that.setData(setDatas);
                            } else {
                                that.setData({
                                    weakAuthData: {
                                        idNo,
                                        idNoCrypt,
                                        userName,
                                        userNameMask
                                    },
                                    appReturnData: launchappUrl,
                                    realSuccess: true,
                                    hasBackBtn: showToAppBtn,
                                    showModifyRemind
                                })
                            }
                        } else { // 未实名
                            // 需要授权
                            if (needAuth) {
                                let infoJson = null;
                                try {
                                    infoJson = JSON.parse(info);
                                } catch (e) { }

                                that.setData({
                                    appReturnData: launchappUrl,
                                    extData: infoJson,
                                    modelSubmit: true,
                                    needGetAuthCode: true,
                                    hasBackBtn: showToAppBtn,
                                    showModifyRemind 
                                })
                            } else {
                                that.setData({
                                    appReturnData: launchappUrl,
                                    realNamed: true,
                                    hasBackBtn: showToAppBtn,
                                    showModifyRemind
                                })
                            }
                            that.setData({
                                complianceText: authComplianceInfo.complianceText,
                                agreementList: authComplianceInfo.protocolList,
                                showModifyRemind
                            })
                        }

                        if (callBack) {
                            callBack({
                                code: 0,
                                authStatus,
                                needAuth
                            });
                        }
                    } else {
                        that.setData({
                            appReturnData: launchappUrl,
                            showModifyRemind:false,
                        });

                        if (callBack) {
                            if (data.rc == 5002) {
                                const msg = data.rmsg || '系统异常，请稍后重试！-E07';
                                util.showToast(msg);
                            } else {
                                util.showToast('服务异常，请重试！-E03');
                            }
                        }
                    }
                },
                onError: function () {
                    util.hideLoading();
                    util.ubtTrace('133168', {
                        type: 'c_payWallet_tokenGet',
                        val: '获取authCode sign服务返回失败'
                    });
                    if (callBack) {
                        util.showToast('服务异常，请重试！-E04');
                    }
                }
            });
        });
    },
    checkAge(idNo) {
        return new Promise(function (resolve, reject) {
            WalletCheckAgeModel({
                idNo: idNo,
                scene: 1,
                version: 'v2',
            }, {
                onSuccess: (data) => {
                    if (data.rc === 0) {
                        resolve(data);
                    } else {
                        reject({
                            rc: data.rc,
                            rmsg: data.rmsg
                        });
                    }
                },
                onError: function (e) {
                    reject({
                        rc: 10001,
                        rmsg: '服务异常，请重试！-E08'
                    });
                }
            })
        });
    },
    //EN Submit user real name information to server for verification
    //CN 提交用户实名信息到服务端验证
    // ubtFrom：记录调用方
    formSubmiting({ ubtFrom }) {
        // 防重
        if (isSubmitting) {
            util.ubtTrace('158795', {
                type: 'c_wallet_wechatrealname_submit_retry',
                val: '提交验证实名信息_重复提交',
                ubtFrom
            });
            return
        }
        isSubmitting = true
        setTimeout(() => {
            isSubmitting = false
        }, 300);
        const that = this;
        util.ubtTrace('158795', {
            type: 'c_wallet_wechatrealname_submit',
            val: '提交验证实名信息',
            ubtFrom
        });
        const {
            submiting,
            inputKeys,
            realNames,
            weakAuthData
        } = that.data;
        const submitpend = that.optionsData.submitpend;
        if (submiting && !submitpend) {
            that.optionsData.submitpend = true;
            const id = inputKeys["2"] || ''
            const idNoEn = cwx.util.base64Encode(id.replace(/\s/g, ''));
            const userInfo = {
                "name": inputKeys["1"].replace(/(^\s*)|(\s*$)/g, ''),
                "idNo": idNoEn,
                "idType": 1
            };

            if (realNames) {
                userInfo.name = weakAuthData.userName;
            }
            const mktOpenid = that.optionsData.mktOpenid;
            const appId = cwx.appId || '';
            const realNameUpdate = {
                "token": that.optionsData.token,
                "openId": mktOpenid,
                "userInfo": userInfo,
                "authCode": that.authToken,
                "appId": appId
            };

            if (!mktOpenid) {
                util.hideLoading();
                util.showModal('系统异常，请重试！-E002');
                return;
            }
            util.showLoading('实名认证中')
            // 提交实名 7202
            WalletSetRealNameModel(realNameUpdate, {
                onSuccess: function (data = {}) {
                    util.hideLoading();
                    that.optionsData.submitpend = false;
                    const appReturnUrl = data.returnUrl;
                    const launchappUrl = that.getAppJumpUrl(appReturnUrl);
                    const currentPage = cwx.getCurrentPage();
                    if (data.rc == 0) {
                        const msg = '认证成功';
                        const backData = {
                            realNamed: true,
                            realNameDatas: {
                                "name": userInfo.name,
                                "idType": 1,
                                "idNumber": inputKeys["2"].replace(/\s/g, '')
                            }
                        }
                        if (that.optionsData.pageSource == 'ctripwechatmini_payment') {
                            util.sendUbt({
                                a: 'formSubmiting success',
                                c: 100002,
                                d: 'pageSource == ctripwechatmini_payment',
                                dd: '实名成功后返回小程序'
                            });
                            util.showModal(msg, function () {
                                currentPage.navigateBack(backData);
                            });
                        } else if (that.optionsData.isNavBack) {
                            const return_Url = data.returnUrl;
                            const navBackPath = that.optionsData.navBackPath;
                            util.sendUbt({
                                a: 'ctripwechatmini_payment_isNavBack',
                                c: 100002,
                                d: 'isNavBack',
                                dd: '实名成功后返回指定小程序,URL地址: ' + return_Url,
                                navBackPath,
                            });
                            if (!navBackPath && !return_Url) {
                                util.showToast('实名完成', 'success', () => {
                                    currentPage.navigateBack(backData);
                                });
                            } else {
                                const return_UrlArr = return_Url.split('|');
                                const backPath = navBackPath ? navBackPath : return_UrlArr[1];
                                util.showToast('实名认证完成', 'success', () => {
                                  that.jumpUrl(backPath, backData)
                                });
                            }
                        } else {
                            that.setData({
                                appReturnData: launchappUrl,
                            });
                        }
                        const identityShowInfo = data.identityShowInfo || {}
                        that.setData({
                            realSuccess: true,
                            weakAuthData: {
                                idNo: identityShowInfo.idNo,
                                userNameMask: identityShowInfo.name
                            }
                        });
                    } else if (data.rc == 6007) {
                        util.sendUbt({
                            a: 'formSubmiting success 18 forbit',
                            c: 100002,
                            d: 'pageSource == ctripwechatmini_payment rc' + data.rc,
                            dd: '您当前未满18周岁，无法为您提供实名认证服务'
                        });
                        cwx.showModal({
                            content: '您当前未满18周岁，无法为您提供实名认证服务',
                            confirmText: '知道了',
                            showCancel: false,
                            success: function (res) {

                            }
                        });

                        return;
                    } else if (data.rc == 20001 || data.rc == 20002 || data.rc == 20005 || data.rc == 20006) {
                        util.sendUbt({
                            a: 'formSubmiting',
                            c: 100002,
                            d: 'formSubmiting response conflicted',
                            dd: '实名信息冲突，服务返回RC: ' + data.rc
                        });

                        const setDatas = {
                            modelSubmit: false,
                            showModal: false,
                            realNamed: true
                        }

                        if (that.data.formApp) {
                            setDatas.conflicted = true;
                            setDatas.realSuccess = true;
                            setDatas.appReturnData = data.nextUrl;
                            setDatas.conflictedTxt = data.rmsg;
                        } else {
                            const msg = data.rmsg || '系统异常，请稍后重试！-E08';
                            util.showModal(msg);
                        }
                        that.setData(setDatas);
                    } else {
                        that.setData({
                            appReturnData: launchappUrl,
                            modelSubmit: false,
                            showModal: false,
                            realNamed: true
                        });
                        const msg = data.rmsg || '系统异常，请稍后重试！-E05';
                        util.showModal(msg, () => {
                            // 重新获取authCode,用来下次提交
                            that.signGet((data) => {
                                util.sendUbt({
                                    a: 'get_sign_on_fail',
                                    c: 100003,
                                    d: '实名失败重新获取auth成功',
                                    dd: JSON.stringify(data)
                                });
                            })
                        });

                        if (data.rc == 1003) {
                            util.ubtTrace('158796', {
                                type: 'c_wallet_wechatrealname_reenter',
                                val: msg
                            });
                        } else {
                            util.ubtTrace('158799', {
                                type: 'c_wallet_wechatrealname_notmatch',
                                val: msg
                            });
                        }
                    }
                },
                onError: function (data = {}) {
                    util.hideLoading();
                    that.optionsData.submitpend = false;
                    that.setData({
                        modelSubmit: false,
                        realNamed: true
                    });
                    const msg = data.rmsg || '系统异常，请稍后重试！-E06';
                    util.showModal(msg);
                    util.sendUbt({
                        a: 'c_payWallet_realname_submitfail',
                        c: 100002,
                        d: '验证实名信息服务返回失败',
                        dd: '服务返回信息：' + JSON.stringify(data)
                    });
                }
            })
        }
    },
    //EN Get market OPENID
    //CN 获取市场OPENID
    getMktOpenid(callBack) {
        try {
            if (cwx.cwx_mkt.openid) {
                util.sendUbt({
                    a: 'getMktOpenid',
                    c: 100002,
                    d: 'getMktOpenid by cwx.cwx_mkt.openid'
                });
                return callBack(cwx.cwx_mkt.openid);
            } else {
                let openIdObserver = (openid) => {
                    cwx.Observer.removeObserverForKey("OpenIdObserver", openIdObserver);
                    if (openid) {
                        util.sendUbt({
                            a: 'getMktOpenid',
                            c: 100002,
                            d: 'getMktOpenid by openIdObserver'
                        });
                        return callBack(openid);
                    } else {
                        util.sendUbt({
                            a: 'getMktOpenid',
                            c: 100002,
                            d: 'getMktOpenid by openIdObserver back empty'
                        });
                        return callBack('')
                    }
                }
                cwx.Observer.addObserverForKey("OpenIdObserver", openIdObserver);
            }
        } catch (e) {
            util.sendUbt({
                a: 'getMktOpenid error',
                c: 100002,
                d: 'cwx.cwx_mkt.openid catch err',
                dd: '错误信息：' + e.message
            });
        };
    },
    //EN Return APP failure callback
    //CN 返回携程应用失败回调
    launchAppError(e) {
        console.log(e.detail.errMsg)
        util.sendUbt({
            a: 'launchAppError',
            c: 100002,
            d: 'launchAppError err',
            dd: '错误信息：' + e.detail.errMsg
        });
    },
    launchAppSuccess() {
        const {
            appReturnData
        } = this.data;
        cwx.switchTab({
            url: '/pages/home/homepage'
        });
        util.sendUbt({
            a: 'launchAppSuccess',
            c: 100002,
            d: 'launchAppSuccess',
            dd: '用户点击返回携程应用成功,返回参数： ' + appReturnData
        });
    },
    //EN Jump to WeChat authorization applet success callback
    //CN 跳转微信授权小程序成功回调
    miniSuccess: function (res = '') {
        this.optionsData.miniAppBack = true;
        this.setData({
            showModal: false
        });
        util.ubtTrace('133170', {
            type: 'c_payWallet_authCode',
            val: '跳转获取authCode小程序成功'
        });
    },
    miniFail: function (res = '') {
        this.setData({
            showModal: false
        });
        let errMsg = res && res.detail && res.detail.errMsg;
        let type = res && res.type
        util.sendUbt({
            a: 'realname-navigateToMiniProgram-fail',
            c: 100002,
            d: 'realname-navigateToMiniProgramfail',
            dd: 'errMsg: ' + errMsg + 'type: ' + type
        });
    },
    toAppSence: function (e) {
        console.log(e.target.dataset.senceid)
        const senceId = e.target.dataset.senceid;
        util.ubtTrace('158800', {
            type: 'c_wallet_wechatrealname_returnapp',
            val: '从小程序跳回携程应用，当前场景为：' + senceId
        });
    },
    tapAgreementRadio: util.throttle(function (event) {
        if (this.data.agreementChecked) {
            this.setData({
                submiting: false,
                agreementChecked: false
            })
            return
        }
        util.sendUbt({
            a: 'tapAgreementRadio',
            c: 100002,
            d: '点击同意协议',
            dd: '点击同意协议'
        });
        let that = this;
        if (!this.submitTags.name) {
            util.showToast('请输入您的真实姓名');
            that.setData({
                agreementChecked: false
            });
            util.sendUbt({
                a: 'tapAgreementRadio',
                c: 100002,
                d: '点击同意协议',
                dd: '点击同意协议——请输入您的真实姓名'
            });
            return;
        }

        if (!this.submitTags.idCard) {
            const id = this.data.inputKeys[2]
            const msg = `请输入${id != '' ? '正确的' : ''}证件号码`
            util.showToast(msg);
            that.setData({
                agreementChecked: false
            });
            util.sendUbt({
                a: 'tapAgreementRadio',
                c: 100002,
                d: '点击同意协议',
                dd: msg
            });
            return;
        }

        let idNo = this.data.inputKeys['2'].replace(/\s/g, '');


        const idNoEn = cwx.util.base64Encode(idNo);
        util.showLoading();
        that.checkAge(idNoEn).then(function (result) {
            const {
                age = 18, operate, remindTitle, remindText
            } = result;
            util.hideLoading();
            util.sendUbt({
                a: 'tapAgreementRadio——checkAge',
                c: 100002,
                d: '点击同意协议',
                dd: '点击同意协议——checkAge age : ' + age
            });
            // 允许实名
            if (operate == 3) {
                that.setData({
                    submiting: true,
                    agreementChecked: true
                });
            } else if (operate == 1 || operate == 2) {
                cwx.showModal({
                    content: remindText || '您当前未满18周岁，无法为您提供实名认证服务 ',
                    confirmText: '立即验证',
                    showCancel: true,
                    success: function (res) {
                        that.setData({
                            agreementChecked: false
                        });
                        if (res.confirm) {
                            // 跳转验证
                            util.showToast('跳转验证');
                            cwx.navigateTo({
                                url: '/pages/wallet/adultInfo/index?token=' + that.optionsData.token,
                                events: {
                                    onAdultSuccess: () => {
                                        that.setData({
                                            submiting: true,
                                            agreementChecked: true
                                        });
                                    }
                                }
                            })
                        }
                    }
                });
            } else {
                util.showModal('系统异常，请重试！-E003');
                that.setData({
                    agreementChecked: false
                });
            }
        }, function (e) {
            util.hideLoading();
            util.showModal(e.rmsg);
            that.setData({
                agreementChecked: false
            });
            util.sendUbt({
                a: 'tapAgreementRadio——checkAge',
                c: 100002,
                d: '点击同意协议',
                dd: '点击同意协议——checkAge rmsg : ' + e.rmsg
            });
        });

        // const agreementChecked = !this.data.agreementChecked
        // const submitBit = agreementChecked && this.submitTags.idCard && this.submitTags.name
        // this.setData({
        //     agreementChecked,
        //     submiting: submitBit
        // })
    }, 1000),
    tapAgreement: function (e) {
        const title = e.currentTarget.dataset.ptitle
        const url = e.currentTarget.dataset.purl
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url)
            }
        });
        // cwx.navigateTo({
        //     // url: `/pages/wallet/protocolwebview/cweb?url=${encodeURIComponent(url)}`,
        //     url: '/pages/wallet/adultInfo/index'
        // });
    },
    idQaHandler:function(){
      cwx.showModal({
        title: '',
        content: '暂仅支持身份证验证，更多认证方式，请前往携程APP-我的-钱包-实名认证，进行操作',
        confirmText: '知道了',
        showCancel: false,
        success: function () {
        }
      })
    },
    modifyRealNameTipsHandler:function(){
      cwx.showModal({
        title: '',
        content: '请前往携程APP-我的-钱包处修改实名',
        confirmText: '知道了',
        showCancel: false,
        success: function () {
        }
      })
    },
    jumpUrl(backPath, backData){
      util.sendUbt({
          a: 'jumpUrl',
          c: 100002,
          d: 'jumpUrl',
          dd: '微信实名认证开始跳转',
          backPath,
          backData: JSON.stringify(backData)
      });
      if(/^http/.test(backPath)){
        backData.realNameDatas = JSON.stringify(backData.realNameDatas)
        const url = util.addParamToUrl(backPath, backData)
        console.log('jumpUrl', url)
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url),
                needLogin: true,
                isNavigate: false,
            }
        })
      }else{
        cwx.redirectTo({
          url: backPath
        })
      }
    }
})