import { cwx, _ } from '../../../cwx/cwx.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
var Controllers = require('../../thirdPlugin/pay/controllers/index.js').CPayPopbox;

var paymentStore = require('../../thirdPlugin/paynew/models/stores.js');
var orderDetailStore = paymentStore.OrderDetailStore();
var extendDataStore = paymentStore.OrderDetailExtendStore();
var debounceTime = null;

module.exports.CardPay = {
    //error alert tip
    errAlert: function (str) {
        cwx.showModal({
            title: '提示',
            content: str,
            showCancel: false,
            success: function() {}
        });
    },
    //all input focus action
    focusAction: function(e) {
        const that = this;
        const eKeys = Number(e.target.dataset.key);
        that.dKeys = this.data.focusKey;

        if((that.dKeys & eKeys) !== eKeys){
            that.setData({
                focusKey: eKeys + that.dKeys
            })
        }
    },
    //all input blur action
    blurAction: function(e) {
        const that = this;
        const val = e.detail.value;
        const vLen = val.length;
        const eKeys = Number(e.target.dataset.key);
        if(vLen > 0){
            if((that.dKeys & eKeys) !== eKeys){
                that.dKeys = that.dKeys + eKeys;
            }
        }else {
            if((that.dKeys & eKeys) === eKeys){
                that.dKeys = that.dKeys - eKeys;
            }
        }

        that.setData({
            focusKey: that.dKeys
        })
    },
    //out h5Tip link webview open action
    quickTip: function(e) {
        const that = this;
        const id = e.target.dataset.id;
        const urlLists = {
            "0": 'https://pages.c-ctrip.com/Finance/WechatMiniPages/tip.htm?v=1',
            "1": 'https://secure.ctrip.com/webapp/payment2/paytips?pathid=tips_1&from=index&env=h5',
            "2": 'https://secure.ctrip.com/webapp/payment2/warmtips?from=index'
        }
        const openUrl = urlLists[id] + '&headhide=true';
        that.openUrl(openUrl);
    },
    //open webview
    openUrl: function(url) {
        cwx.navigateTo({
            url: '/pages/pay/directback/index?cb=' + encodeURIComponent(url),
            success: function(res){
                Business.sendUbtTrace({a:'openUrl', c:1001011, dd:'openUrl success', d:'openUrl success!'});
            },
            fail: function(res){
                Business.sendUbtTrace({a:'openUrl', c:1001012, dd:'openUrl error', d:'openUrl fail! res::::' + JSON.stringify(res || '')});
            }
        })
    },
    //show card cvv, date tipbox
    showTips: function(e) {
        const that = this;
        const eKeys = e.target.dataset.key;
        const tipsData = {
            "1": {
                img: 'https://webresource.c-ctrip.com/ares2/h5paymentsdk/smallprogram/1.0.11/default/img/cardcss-icon/data_x2.png?v=201912101651',
                title: '卡有效期',
                subTitle: '格式为：月/年',
                desc: '信用卡有效期通常在卡正面的卡号下方'
            },
            "2": {
                img: 'https://webresource.c-ctrip.com/ares2/h5paymentsdk/smallprogram/1.0.11/default/img/cardcss-icon/cvv_x2.png?v=201912101651',
                title: '卡验证码',
                subTitle: '',
                desc: '也称信用卡安全码，或CVV2，是指信用卡背面签名栏附近的3或4位数字，位置参见上图，个别卡片位置有所不同。'
            }
        }
        setTimeout(function(){
            that.setData({
                cardBin: false,
                introTextData: tipsData[eKeys],
                instructionsModalHidden: false
            })
        })
    },
    //card bin submit function
    cardBinSubmit: function() {
        const that = this;
        const { inputKeys, focusList } = that.data;
        const activeFocus = Object.assign(focusList, {});
        const cardNum = inputKeys["256"];
        activeFocus[256] = true;

        if(cardNum.length < 1){
            cwx.showToast({
                title: '请输入您的银行卡号',
                mask: true,
                icon: 'none',
                duration: 1500,
                complete: function() {
                    setTimeout(() => {
                        that.setData({
                            focusList: activeFocus
                        })
                    }, 1600);
                }
            });
            return;
        }
        
        //request cardbin server
        Controllers.requestCardBinQuery(cardNum, function (cardInfos) {
            if(cardInfos){
                const { inputKeys, cinputData } = that.data;
                const cVal = Object.assign(inputKeys, {});
                const cinputVal = Object.assign(cinputData, {});
                const cardTypeid = cardInfos.typeid;
                let cardCvvMax = 3;
                _.map(cVal, function(v, name){
                    cVal[name] = ''
                });

                _.map(cinputVal, function(v, name){
                    cinputVal[name] = ''
                });

                //American Express Card Change Card Verification Code Copy
                if (cardTypeid == 8 || cardTypeid == 58) {
                    cardCvvMax = 4;
                }

                that.setData({
                    instructionsModalHidden: true,
                    cardBinScuess: true,
                    cardInfos: cardInfos,
                    inputKeys: cVal,
                    cinputData: cinputVal,
                    focusKey: 0,
                    cardCvvMax: cardCvvMax,
                    policy: cardInfos.policyPass
                })
            }else{
                that.clearInput({
                    target:{
                        dataset:{
                            key:256
                        }
                    }
                });
            }
        })
    },
    //setting card date format and val
    cardDataEvent: function(key, val) {
        const that = this;
        const { inputKeys, cinputData } = that.data;
        let dataV = val.replace(/[^\d]/g,'');
        
        const dataArr = dataV.split('');
        const cVal = Object.assign(inputKeys, {});
        const cinputVal = Object.assign(cinputData, {});
        const firstNum = dataArr[0];
        const secNum   = dataArr[1] || '';
        const thirdNum = dataArr[2] || '';
        const fourNum  = dataArr[3] || '';

        if(firstNum > 1){
            dataV = '0' + firstNum + '/';
        }

        if(secNum > 2 && firstNum == 1){
            dataV = firstNum + '2/';
        }else if(secNum){
            if(firstNum == 0 && secNum == 0){
                dataV = '01/';
            }else{
                dataV = dataV.substr(0, 2) + '/';
            }
        }

        if(thirdNum){
            if(thirdNum <= 1 ){
                dataV = dataV + '2';
            }else {
                dataV = dataV.substr(0, 2) + '/' + thirdNum
            }
        }

        dataV = dataV + fourNum;

        cVal[key] = dataV;
        cinputVal[key] = dataV.replace('/', '');

        console.log('有效期============', cinputVal, cVal)
        that.setData({
            cinputData: cinputVal,
            inputKeys: cVal
        })
    },
    //card cvv input event
    cardCvvEvent: function(key, val) {
        const that = this;
        const { inputKeys, cinputData } = that.data;
        const cVal = Object.assign(cinputData, {});
        const iVal = Object.assign(inputKeys, {});
        const iKeyVal = iVal[key];
        const vLen = val.length;
        const iLen = iKeyVal.length;
        iVal[512] = val;
        cVal[key] = val;
        clearTimeout(debounceTime);
        
        if(vLen >= iLen){
            iVal[key] = iKeyVal + val.substr(vLen - 1, 1);  
        }else{
            iVal[key] = iKeyVal.substr(0, vLen);
        }

        that.setData({
            inputKeys: iVal
        });

        iVal[key] = val.replace(/[\d]/g, '*');
        debounceTime = setTimeout(function() {
            that.setData({
                cinputData: cVal,
                inputKeys: iVal
            });
        }, 500);
    },
    //card bin input format function
    cardBinEvent: function(key, val){
        const that = this;
        const { inputKeys } = that.data;
        const cardV = val.replace(/[^\d]/g,'').replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
        const cVal = Object.assign(inputKeys, {});
        let clearIconStat = false;
        cVal[key] = cardV;

        if(cardV.length < 1){
            clearIconStat = true;
        }else{
            clearIconStat = false;
        }

        that.setData({
            clearIconHide: clearIconStat,
            inputKeys: cVal
        })
    },
    //all input dom input event action
    bindKeyInput: function (e) {
        const that = this;
        const val = e.detail.value;
        const key = e.target.dataset.key;

        if(key === '256'){
            return that.cardBinEvent(key, val);
        }

        if(key === '1'){
            return that.cardDataEvent(key, val);
        }else if(key === '2'){
            return that.cardCvvEvent(key, val);
        }else{
            const { inputKeys } = that.data;
            const cVal = Object.assign(inputKeys, {});
            cVal[key] = val
            that.setData({
                inputKeys: cVal
            })
        }
    },
    //set card police input with val focus status
    activeInput: function(e) {
        const that = this;
        const key = e.target.dataset.key;
        const { focusList } = that.data;
        const activeFocus = Object.assign(focusList, {});
        _.map(activeFocus, function(v, name){
            activeFocus[name] = false;
        });
        
        that.setData({
            focusList: activeFocus
        }, function() {
            activeFocus[key] = true;
            that.setData({
                focusList: activeFocus
            })
        });
    },
    //clear card bin input val
    clearInput: function(e) {
        const that = this;
        const { inputKeys, focusList, cinputData } = that.data;
        const key = e.target.dataset.key;

        const cVal = Object.assign(inputKeys, {});
        const activeFocus = Object.assign(focusList, {});
        const cinputVal = Object.assign(cinputData, {});
        activeFocus[key] = true;
        cVal[key] = '';
        cinputVal[256] = '';

        that.setData({
            cinputData: cinputVal,
            inputKeys: cVal,
            focusList: activeFocus,
            clearIconHide: true
        })
    },
    //open card bin scene
    cardBinScene: function(e={}) {
        const that = this;
        const key = e.target.dataset.key || 0;
        const { focusList, inputKeys, carData, cinputData } = that.data;
        const activeFocus = Object.assign(focusList, {});
        const inputKey = Object.assign(inputKeys, {});
        const cinputVal = Object.assign(cinputData, {});
        const selectCard = _.find(carData, function(card) {
            const keyNum = Number(key);
            return card.typeid === keyNum
        });
        let sceneTxt = '银行卡';
        if(selectCard){
            sceneTxt = selectCard.typename + ' 信用卡'
        }
        activeFocus[256] = true;
        inputKey[256] = '';
        cinputVal[256] = '';

        that.setData({
            cardBin: true,
            cardBinTxt: sceneTxt,
            cinputData: cinputVal,
            instructionsModalHidden: false,
            focusList: activeFocus,
            inputKeys: inputKey,
            clearIconHide: true
        })
    },
    //request cardPay server
    cardPaysubmit: function() {
        const that = this;
        const { inputKeys, cardInfos, cardCvvMax } = that.data;
        const cardNum = cardInfos.cardNum;
        const policyPass = cardInfos.policyPass;
        const cardDate = inputKeys[1] || '';
        const cardCvv = inputKeys[512] || '';
        const cardHolder = inputKeys[4] || '';
        const orderDetail = orderDetailStore.get() || {};
        let buExpTimeStr = extendDataStore.getAttr("lastGuranteeDay");
        let cDateFormat = '';
        if((policyPass & 64) === 64){
            if(cardDate === ''){
                that.errAlert('请输入您的卡有效期');
                return;
            }else if(cardDate.length < 5){
                that.errAlert('请填写正确的卡有效期，月份/年份');
                return;
            }else{
                const dateArr = cardDate.split('/');
                const tDateTime = +new Date();
                let lDateTime = Number(dateArr[0]);
                let cDateTime = '';
                let expTime;
                if(lDateTime > 12){
                    dateArr[1] = Number(dateArr[1]) + 1;
                }else{
                    if(lDateTime < 10){
                        dateArr[0] = '0' + lDateTime;
                    }else{
                        dateArr[0] = lDateTime;
                    }
                }

                if(buExpTimeStr){
                    const buExpTimeArr = buExpTimeStr.split('-');
                    buExpTimeStr = buExpTimeArr[0] + '/' + buExpTimeArr[1] + '/' + buExpTimeArr[2];
                    expTime = new Date(buExpTimeStr).getTime();
                }

                cDateFormat = '20' + dateArr[1] + '/' + dateArr[0] + '/01 00:00:00';
                cDateTime = new Date(cDateFormat).getTime();
                if(cDateTime - tDateTime < 0){
                    that.errAlert('您的卡已过期,请更换新卡');
                    return;
                }else if(expTime && (cDateTime - expTime) <= 0){
                    that.errAlert('您的卡即将过期,请更换新卡');
                    return;
                }
            }
        }
        
        if((policyPass & 1) === 1){
            if(cardCvv === '' || cardCvv.length < cardCvvMax){
                that.errAlert(`请输入您的${cardCvvMax}位卡验证码`);
                return;
            }
        }
        
        if((policyPass & 2) === 2){
            if(cardHolder === ''){
                that.errAlert('请输入持卡人名字');
                return;
            }
        }
        
        const cardInfo = {
            "opttype": cardInfos.opttype || "1",
            "cardamount": orderDetail.amount,
            "statusmap": cardInfos.statusmap,
            "addinfo":{
                "typemain": cardInfos.typemain,
                "typeid": cardInfos.typeid,
                "cardno": cardNum.replace(/\s+/g,""),
                "islast4": false,
                "category": cardInfos.category
            },
            "paymentwayid": cardInfos.paymentwayid,
            "brandid": cardInfos.brandid,
            "brandtype": cardInfos.brandtype,
            "channelid": cardInfos.channelid,
            "chargemode": cardInfos.chargemode
        }

        //cvv policy
        if(cardCvv){
            cardInfo.addinfo.cvv2 = cardCvv
        }

        //Expiration date
        if(cDateFormat){
            cardInfo.addinfo.expire = cDateFormat
        }

        //cardholder
        if(cardHolder){
            cardInfo.addinfo.holder = cardHolder
        }

        if(cardInfo.bindid){
            cardInfo.bindid = cardInfos.bindid;
        }
        Business.sendUbt({a:'d-cardpay-submit-start', c:100005, d:'d-cardpay-submit-start', dd : '开始提交支付 cardpay-submit-start'});
		Controllers.showLoading('卡支付提交中.');
		Controllers.requestSubmit(cardInfo);
		Business.sendUbt({a:'d-cardpay-submit-end', c:100006, d:'d-cardpay-submit-end', dd : '结束提交支付 cardpay-submit-end'});
    }
}
