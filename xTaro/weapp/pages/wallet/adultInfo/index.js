/**
 * CN description: 钱包个保法监护人信息收集
 * EN description: Walle realname adult info 
 * Author: jianpeng.wang
 * ------
 */


import {
    cwx,
    CPage,
    _
} from '../../../cwx/cwx.js';

import { util } from '../common/util.js';
import {
    WalletSetAdultModel
} from '../common/model.js'

CPage({
    pageId: '10650071770',
    submitTags: { //form check tag
        name: false,
        idCard: false
    },
    optionsData: {
        token: ''
    },
    data: {
        focusKey: 0, //input foucs data
        inputKeys: {},
        submitpend: false,
        navbarData: {
            customBack: true,
            showCapsule: false,
        },
    },
    onLoad: function(options) {
        const navgateData = options.data || options;
        this.optionsData.token = navgateData.token || ''
        this.myPage = cwx.getCurrentPage();
        this.myPage.ubtTrace('133166', 
            {
                type: 'c_payWallet_pageLoad',
                ...navgateData
            });
        util.sendUbt({
            a : 'adultInfo-onload-data',
            c : 100002,
            d : 'adultInfoOnload:options.data',
            dd: '监护人页onLoad'
        });
    },
    onUnload(){
        util.sendUbt({
            a : 'onUnload',
            c : 100003,
            d : 'goback adult',
            dd: '监护人信息回退'
        });
        this.myPage.ubtTrace('204620', 
        {
            type: 'c_wallet_protectorcheck_back',
            val: '监护人信息回退'
        });
    },
    
    onBack: function () {
        cwx.showModal({
            content: '您确认放弃验证监护人身份信息吗？',
            confirmText: '执意放弃',
            cancelText: "继续验证",
            showCancel: true,
            success: function(res) {
                if (res.confirm) {
                    cwx.navigateBack();
                }
            }
        });
    },
    //all input focus action
    //CN 输入框获取焦点动作
    focusAction: function(e) {
        const that = this;
        const eKeys = Number(e.target.dataset.key);
        that.dKeys = this.data.focusKey;

        if((that.dKeys & eKeys) != eKeys){
            that.setData({
                focusKey: eKeys + that.dKeys
            })
        }
    },
    //all input blur action
    //CN 输入框失去焦点动作
    blurAction: function(e) {
        const that = this;
        const val = e.detail.value;
        const vLen = val.length;
        const eKeys = Number(e.target.dataset.key);
        if(vLen > 0){
            if(eKeys == 2 && !that.submitTags.idCard){ //名字校验
                util.showToast('请输入正确的证件号码');
            }
            if((that.dKeys & eKeys) != eKeys){
                that.dKeys = that.dKeys + eKeys;
            }
        }else {
            if(eKeys == 1){ //名字校验
                util.showToast('请输入您的真实姓名');
            }
            if(eKeys == 2){ //名字校验
                util.showToast('请输入证件号码');
            }
            if((that.dKeys & eKeys) == eKeys){
                that.dKeys = that.dKeys - eKeys;
            }
        }
        that.setData({
            focusKey: that.dKeys
        })
    },
    bindKeyInput: function (e) {
        const that = this;
        let submitBit = false;
        const val = e.detail.value;
        const key = e.target.dataset.key;

        const { inputKeys } = that.data;
        const cVal = Object.assign(inputKeys, {});
        cVal[key] = val;

        if(key == '1'){ //名字校验
			const varTrim = val.replace(/(^\s*)|(\s*$)/g,'');
            if (varTrim.length > 1) {
				that.submitTags.name = true;
			}else {
                that.submitTags.name = false;
            }
        }else if(key == '2'){//身份证校验
            const checkedId = util.checkIDCard(val);
            if(checkedId){
                that.submitTags.idCard = true;
            }else {
                that.submitTags.idCard = false;
            }
            inputKeys[key] = util.idCardEvent(val);
        }

        //对必填字段做特校验
        const { name, idCard } = that.submitTags;
        if(name && idCard) {
            submitBit = true;
        }
        that.setData({
            inputKeys: cVal,
            submiting: submitBit
        });
    },
    doSubmit(){
        util.sendUbt({
            a : 'doSubmit',
            c : 100004,
            d : 'doSubmit adult',
            dd: '提交监护人信息'
        });
        this.myPage.ubtTrace('204621', 
        {
            type: 'c_wallet_protectorcheck_submit',
            val: '提交按钮'
        });
        this.formSubmiting();
    },
    formSubmiting() {
        const that = this;
        const {submiting, inputKeys} = that.data;
        const submitpend = that.optionsData.submitpend;
        if(submiting && !submitpend){
            that.optionsData.submitpend = true;
            const id = inputKeys["2"] || ''
            const idNoEn = cwx.util.base64Encode(id.replace(/\s/g, ''));
            const realNameUpdate = {
                token: this.optionsData.token,
                userName: inputKeys["1"].replace(/(^\s*)|(\s*$)/g,''),
                "idNo"  : idNoEn,
                "idType": 1,
                scene: 1
            };
            WalletSetAdultModel(realNameUpdate, {
                onSuccess: function (data={}) {
                    util.hideLoading();
                    that.optionsData.submitpend = false;
                    const currentPage = cwx.getCurrentPage();
                    if(data.rc == 0) {
                        const msg = '认证成功';
                        const backData = {
                            success: true
                        }
                        util.sendUbt({
                            a : 'ctripwechatmini_adult_success',
                            c : 100002,
                            d : 'navback',
                            dd: '监护人验证成功'
                        });
                        util.showToast(msg, 'success', () => {
                            const eventChannel = that.getOpenerEventChannel()
                            eventChannel.emit('onAdultSuccess', {data: 'test'});
                            currentPage.navigateBack(backData);
                        });
                    } else {
                        that.setData({
                            showModal: false,
                            submiting: false
                        });
                        const msg = data.rmsg || '系统异常，请稍后重试！-E10';
                        util.showModal(msg);
                    }
                },
                onError: function (data={}) {
                    util.hideLoading();
                    that.optionsData.submitpend = false;
                    that.setData({
                        modelSubmit: false,
                        realNamed: true
                    });
                    const msg = data.rmsg || '系统异常，请稍后重试！-E06';
                    util.showModal(msg);
                    util.sendUbt({
                        a : 'c_payWallet_adult_submitfail',
                        c : 100002,
                        d : '监护人验证实名信息服务返回失败',
                        dd: '服务返回信息：' + JSON.stringify(data)
                    });
                }
            })
        }
    },
})
