import { cwx, CPage, _ } from '../../../cwx/cwx.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
var paymodels = require('../../thirdPlugin/pay/models/models.js');
var paymentStore = require('../../thirdPlugin/paynew/models/stores.js');
var RealNameStore = paymentStore.RealNameStore();
var RealNameModel = paymodels.RealNameModel;

CPage({
    pageId: '10650012534',
    checkPerformance: true, // 白屏检测
    data: {
        realNamed: false,
        toastTxt: '',
        toastShow: false,
        navbarData: {
            showCapsule: 0, //是否显示左上角小房子
            showBack: 0, //是否显示返回
            showColor: 1 //navbar背景颜色
        }
    },
    onLoad: function(options) {
      if(options.data){
        const navgateData = options.data || {};
        this.uid = navgateData.uid;
		    this.realNamePath = navgateData.realNamePath;
      }else{
        const navgateData = options || {};
        this.uid = navgateData.uid;
		    this.realNamePath = decodeURIComponent(navgateData.realNamePath);
      }
        Business.sendUbt({
            a : 'realname-onload-data',
            c : 100002,
            d : JSON.stringify(options),
            dd: '支付完成后跳转到微信实名认证中间页'
        });
    },
	onShow: function (res) {

    },
    //Toast 错误提示
    showToast: function(str='网络不给力，请稍候重试', duration=2000, callback){
        const that = this;
        that.setData({
            toastTxt: str,
            toastShow: true
        },function(){
            setTimeout(() => {
                that.setData({
                    toastShow: false,
                    toastTxt: '',
                });
                if(callback){
                    return callback();
                }
            }, duration);
        });
    },
    setRealNameInfo: function(resJson={}) {
        const that = this;
        const reqData = {
            ver: '8.0.0',
            plat: 50,
            cver: '7.16',
            mchild: 'CTRP', 
            appsource: 8,
            authtoken: resJson.auth_token || ''
        };
        let rData = {
            serviceCode: '32007105',
            ver: '1.0',
            reqbody: JSON.stringify(reqData)
        };

        RealNameModel({
			data: rData,
			success: function(res={}){
                let resCode = res.rc;
                let resBody = JSON.parse(res.resbody || '{}');
				if(resCode === 0 && resBody.rc === 0){
                    that.setData({
                        realNamed: true
                    })
                    Business.sendUbt({
                        a : 'set-realname-info-success',
                        c : 100002,
                        d : 'setRealnameInfo:success',
                        dd: '同步设置微信小程序实名服务成功'
                    });
                } else {
                    that.showToast('实名认证未成功，请重新认证 -2');
                    Business.sendUbt({
                        a : 'set-realname-info-rcfail',
                        c : 100002,
                        d : 'setRealnameInfo:rcfail',
                        dd: '同步设置微信小程序实名服务失败,rc!=0'
                    });
                }
			},
			fail: function(res={}){
                that.showToast('实名认证未成功，请重新认证');
				Business.sendUbt({
                    a : 'set-realname-info-fail',
                    c : 100002,
                    d : 'setRealnameInfo:fail',
                    dd: '同步设置微信小程序实名服务失败, 返回数据：' + JSON.stringify(res)
                });
			},
			complete: function(res){
                cwx.hideLoading();
			}
		}).excute();
    },
    getAuthInfo: function(res) {
        const that = this;
        const authDetail = res.detail || {};
        const errMsg = authDetail.errMsg || '';
        
        if(errMsg.includes('openRealnameAuth:cancel')){
            Business.sendUbt({
                a : 'open-realname-auth-cancel',
                c : 100002,
                d : 'openRealnameAuth:cancel',
                dd: '用户取消了微信小程序实名'
            });
        }else if(errMsg.includes('openRealnameAuth:fail')){
            that.showToast('获取实名信息失败，请重新认证');
            Business.sendUbt({
                a : 'open-realname-auth-fail',
                c : 100002,
                d : 'openRealnameAuth:fail',
                dd: '微信小程序实名返回错误，详细错误信息：' + JSON.stringify(res || '')
            });
        }else{
            cwx.showLoading({
                title: '实名更新中'
            });
            setTimeout(() => {
                that.setRealNameInfo(authDetail);
            }, 1000);
        }
        Business.sendUbt({
            a : 'pay_wechatrlname',
            c : 100002,
            d : 'pay_wechatrlname',
            dd: '用户点击了立即认证按钮, 返回数据： ' + JSON.stringify(authDetail)
        });
    },
    callSback: function() {
        const currentPage = cwx.getCurrentPage();
        //Business.clearStore(); //清除缓存
        try {
            const eventChannel = this.getOpenerEventChannel()
            eventChannel && eventChannel.emit('onRealnameBack', {type: 'sback'});
        } catch (error) {
            Business.sendUbt({
                a : 'sendChannel',
                c : 100005,
                d : '实名回调emit catch',
                dd: JSON.stringify(error)
            });
        }
        currentPage.navigateBack({
            type : 'sback'
        });
        Business.sendUbt({
            a : 'realname-callSback',
            c : 100002,
            d : 'RealnameAuth:callSbackEnd',
            dd: '执行服务成功返回函数完成'
        });
    },
	cancelBack: function() {
        const that = this;
        const uid = that.uid;

        let realNameStoreVal = RealNameStore.get() || {};
        realNameStoreVal[uid] = +new Date();
        RealNameStore.set(realNameStoreVal);

        that.callSback();
        Business.sendUbt({
            a : 'pay_wechatrlname_skip',
            c : 100002,
            d : 'pay_wechatrlname_skip',
            dd: '用户点击了暂不认证按钮'
        });
	},
	goRealNamed: function() {
		const that = this;
		const currentPage = cwx.getCurrentPage();
		const realNamePath = this.realNamePath;
		var realNameData = {
			pageSource: "ctripwechatmini_payment",
			returnCallBack: function(data){
				RealNameStore.setAttr("realNamedDatas", data);
				that.setData({
					realNamed: true
				});
			}
		};
		currentPage.navigateTo({
			url : realNamePath,
			data : realNameData,
			callback : function(returnData){
				//returnData 实名返回结果数据
				return realNameData.returnCallBack(returnData);		
			},
			success : function(){
				Business.sendUbt({
					a: 'hasRealNameNavigate',
					c: 3003,
					d: '跳转到用户实名引导页成功'
				});
			},
			fail : function(){
				Business.sendUbt({
					a: 'hasRealNameNavigate',
					c: 3003,
					d: '跳转到用户实名引导页失败'
				});
			},
			complete : function(){

			}		
		});
	},
    succeedBack: function() {
        const that = this; 
        that.callSback();
        Business.sendUbt({
            a : 'realname-succeed-button-back',
            c : 100002,
            d : 'realname-succeed-button-backfunction',
            dd: '实名认证成功后，用户点击完成按钮返并执行BU传入的sbackCallback函数'
        });
    }
})
