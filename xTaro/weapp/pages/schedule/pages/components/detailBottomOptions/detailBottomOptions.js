import { isiPhoneX } from '../../calendar/utils/util';
import { SHARE_CARD_LIST_BUTTON } from '../../constant';
import {
  cwx
} from '../../../../../cwx/cwx.js';
import { addCard, batchAddCards} from '../../sendService.js'
import { logClick } from '../../../utils/actionCode';
let ubt = cwx.sendUbtByPage;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    smartTripId:{
      type: String,
      value: ''
    },
    smartTripIds: {//批量用“,”隔开
      type: String,
      value: ''
    },
    theme:{
      type:Number,
      value:0//0=分享+添加，1=分享
    },
    addActionCode:{
      type:String,
      value:''
    },
    checktripActionCode: {//去行程查看埋点
      type: String,
      value: ''
    },
    fromUid: {//卡片所属用户
      type: Number,
      value: ''
    },
    isShowRealnameEntry: {
      type: Boolean,
      value: false
    },
    addBtnStatus: { //分享列表接口返回的按钮状态 0可添加 1已添加可查看 2失效
      type: Number,
      value: ''
    },
    isShowTraveler: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isiPhoneX: isiPhoneX,
  },

  ready:function(){
    this.animation = wx.createAnimation()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onAddClick: function() {
      let localThis = this;

      if (localThis.data.addBtnStatus === SHARE_CARD_LIST_BUTTON.LOOK_MY_SCHEDULE) {
        localThis.logCardShareAddBtn();
        return cwx.reLaunch({
          url: '/pages/schedule/index/index',
        })
      }
      let smartTripId = this.data.smartTripId;
      if (this.data.addActionCode) {
        ubt.ubtTrace(102325, {
          actionCode: this.data.addActionCode,
          actionType: 'click',
        });
      }
      this.triggerEvent('addCardEvent', {}, {});
      this.startLogin(function () {
        let promise;
        if (localThis.data.smartTripIds){
          promise = batchAddCards(localThis.data.smartTripIds, localThis.data.isShowTraveler);
        }
        else{
          promise = addCard(smartTripId)
        }
        promise.then(res => {
          if (localThis.data.theme === 3) {
            wx.showToast({
              icon: "none",
              title: '已添加至我的行程',
            })
            localThis.triggerEvent('addschedule');
            // 埋点：统一落地分享页 添加按钮成功埋点
            const importedTypes = res?.importedIdMapping?.map(t => t.cardType) || [];
            localThis.logCardShareAddBtn(true, importedTypes.join(','));
          } else {
            localThis.animation.translateY(0).step({ duration: 200});
            localThis.animation.translateY(50).step({ duration: 200,delay:5000 });
            localThis.setData({
              animationData: localThis.animation.export(),
            });
          }
        }).catch(error => {
          // 埋点：统一落地分享页 添加按钮失败埋点
          if (localThis.data.theme === 3) {
            localThis.logCardShareAddBtn(false);
          }
          if (error&&error.resultMessage) {
            wx.showToast({
              icon: "none",
              title: error.resultMessage,
            })
          } else {
            wx.showToast({
              icon: "none",
              title: '添加失败',
            })
          }
        });
      })
    },

    logCardShareAddBtn: function(isAddSuccess, importedTypes) {
      const ifAddSuccessObj = isAddSuccess !== undefined ? {
        ifAddSuccess: Number(isAddSuccess)
      } : {}; // 0失败,1成功
      const smartTripIds = this.data.smartTripIds?.split(',');

      logClick({
        AC: 'schedule_cardShare_add_button',
        EXT: {
          addButtonType: this.data.addBtnStatus,
          addCount: smartTripIds.length, // 添加数量
          businessType: importedTypes || '', // 添加成功的卡片业务类型
          ...ifAddSuccessObj
        }
      })
    },

    gotoTimeline:function(event) {
      // console.log('formId='+event.detail.formId);
      // console.log('openId=' + cwx.cwx_mkt.openid);
      if (this.data.checktripActionCode) {
        ubt.ubtTrace(102325, {
          actionCode: this.data.checktripActionCode,
          actionType: 'click',
        });
      }
      cwx.reLaunch({
        url: '/pages/schedule/index/index'
      })
    },

    startLogin: function (callback) {
      if (cwx.user.isLogin()) {
        callback();
      } else {
        cwx.user.login({
          callback: callback
        });
      }
    },
    onGoToRealname: function() {
      // http://conf.ctripcorp.com/pages/viewpage.action?pageId=330608990
      const currentPage = cwx.getCurrentPage();
      const realNameData = {
        pageSource: "ctripwechatmini_xingcheng_realname",
        isNavBack: true,
      };
      logClick({
        AC: 'schedule_cardShare_CFTips',
      })
      currentPage.navigateTo({    
          url : '/pages/wallet/setrealname/index',
          data: realNameData,
          callback : function(returnData){
          },
          success : function(){
          },
          fail : function(err){
          }  
      });
    }
  }
})
