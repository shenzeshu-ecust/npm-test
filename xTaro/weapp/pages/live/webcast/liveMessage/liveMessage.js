import common from '../../common/common.js';
import LiveUtil from '../../common/LiveUtil';
import {
  getMessage,
  getLiveGoods
} from '../service/webcastRequest.js';

const TAG = "LiveMessage"

import { messageType } from './liveMessageUtil'
import {processCemojiText}  from "../../processCemojiText.js";
import {substrByByte} from '../util/utils'
Component({
  observers: {
    '_messages': function (messages) {
      if (messages.length > 200) {
        messages.splice(0, messages.length - 200);
      }
      this.setData(this._setLastIndex({
        messageList: messages,
      }, messages[messages.length - 1]));
    },
    '_tMessage': function (tMessage) {
      let result = this.data._messages.concat([tMessage])
      this.setData(this._setLastIndex({
        messageList: result,
      }, tMessage))
    },
  },

  lifetimes: {
    created: function () {
      this.touched = false;
      this.userId = '';// 用户id
      this.anchorID = '';
      // this.timmer = 0;// 定时器句柄
      this.frequency = 1000;
      this.lastMsgId = 0;//上一个拉取消息返回的id，初始化为0
      this.nextMessageKey = ''; //替换lastmessageid，单一lastMessageId不够灵活，优化后便于拓展多消息队列，多优先级队列
      this.showUnReadMsg = false;// 开始计算未读消息
      this.once = 0;
      this.needShowCardAnimationAgain = true;
      this.liveId = 0;
    }, attached: function () {
    }, detached: function () {
      console.log('xixixi卸载卸载卸载',this.liveId)
      this[`chatRoom${this.liveId}`]= -1;
      clearTimeout(this[`timmer${this.liveId}`]);
      clearTimeout(this.defaultGoodsCardTimer);
      this[`timmer${this.liveId}`]=null;
      this.defaultGoodsCardTimer = null;
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
  	liveID: {
      type: Number,
      value: 0
    },
    master:{
        type: Object,
        value:{}
    },
    liveStatus:{
        type: Number,
        value:0
    },
    formInfoObjectList:{
      type: Object,
      value:[]
    },
    env:{
      type:String,
      value:'prd'
    },
    functionSwitch:{
      type:Object,
      value:{}
    },
    pageType:{
      type:Number,
      value:0
    },
    commentKeybordBottom:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    card:{},
    messageList: [], // 消息列表
    topMessage: null, //顶部消息
    showCard: false,
    showCardAnimation:false,//是否显示商品卡片动画
    inAdjustMessageHeight:false,//调整消息列表高度
    // chatRoomId: 0,// 聊天室id
    lastIndex: "",
    _messages: [], // 房间消息
    _tMessage: null, // 临时消息
    unReadCount: 0, // 未读消息数
    topMessageGift: [{
      index: 0,
      message: null
    },{
      index:1,
      message: null
    }], //顶部礼物消息
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 更新房间信息 主播和用户id
    updateInfo(chatRoomId, anchorID, userId,liveId) {
      console.log('xixixiLiveId+++',this.data.liveID,liveId)
      this.liveId = liveId;
      this._startPullMessage(liveId) // 开始消息
      this.anchorID = anchorID;
      this.userId = userId;

    },

    showDefaultRecommendShopCard(shopCard) {//显示讲解中卡片
      clearTimeout(this.defaultGoodsCardTimer);
      this.defaultGoodsCardTimer = null;
      this.setData({
        card:shopCard
      },()=>{
        this.showShopCard();
      });
    },

    hideDefaultRecommendShopCard() {
      // this.needShowCardAnimationAgain = true;
      this.setData({
        showCard: false,
        card:{goodsId:-1},
      });
    },

    updateGoodCard(card){
      //console.log("updateGoodCard",card);
        this.setData({
          card:card,
        });
    },
    _startPullMessage: function (liveId) {
      if (this[`chatRoom${this.liveId}`]== -1) { // 代表卸载掉过
        console.log('xixixi之前没卸载过的，需要卸载掉',this.liveId)
        clearTimeout(this[`timmer${this.liveId}`]);
        this[`timmer${this.liveId}`]=null;
        return
		  }
      let self = this;
      getMessage({
        //lastMessageId: this.lastMsgId,
        //chatRoomId: this.data.chatRoomId,
        nextMessageKey: this.nextMessageKey,
        liveId: liveId
      }, function (res) {
        if (common.checkResponseAck(res) && res.data) {
          // console.log('xixixi++++++',liveId,self.data.liveID)
          const result = res.data;
          if (result.frequency != null && result.frequency != 0) {
            self.frequency = result.frequency;
          }
          //if (result.lastMessageId) {
            self.lastMsgId = result.lastMessageId;
            self.nextMessageKey = result.nextMessageKey || self.nextMessageKey;
            // if (self.lastMsgId == 0) {
            //   self.lastMsgId = 1
            //}
          //}
          if (result.roomMessage && result.roomMessage.length > 0) {
            console.log("message", result)
            self._coverMessage(result.roomMessage)
          }
        }
        console.log('success get message');

        self._delayRequest(liveId)
      }, function (res) {
        if (self.frequency < 5000) {
          self.frequency += 1000
        }
        console.log('fail get message');
        self._delayRequest()
      })
    },
    _delayRequest(liveId) {
      clearTimeout(this[`timmer${this.liveId}`]);
      this[`timmer${this.liveId}`] =null;
      this[`timmer${this.liveId}`] = setTimeout(() => { // 轮询接口
          //if(this.once < 10){
            this._startPullMessage(liveId);
            this.once ++ ;
          //}
          
      }, this.frequency);
    },
    _coverMessage(messages) {
      let roomMsgs = [];
      let giftMsgs = this.data.topMessageGift;
      let tempMsgs = [];
      let isNeedRefreshUsers = false;
      let isNeedCallBack = false;
      messages && messages.forEach(message => {
        let liveMessage = JSON.parse(message.body) || {};
        let type = liveMessage.messageType;
        let colorValue = liveMessage.msgColor ? liveMessage.msgColor : '#ffffff';
        if (type == 1 || type == 111) {
            let inputObj = {
                text: liveMessage.message || '',
                wrapperStyle: `word-break:break-all; line-height:18px; font-size: 14px; color: ${colorValue}`, // 组件壳的行内样式（注意：行内样式中，尺寸单位应为 px）
                cemojiStyle: 'width:34rpx; height:34rpx; vertical-align:middle;'
                }
                liveMessage.originMessage = liveMessage.message;
                processCemojiText(liveMessage.message, inputObj.cemojiStyle, (res) => {
                liveMessage.message = res;
                })
        }
        //liveMessage.inputObj = inputObj;
        message.liveMessage = liveMessage;
        delete message.body;
        if (this.userId != null && this.userId === message.fromUid) { // 自己的消息 如果是主播 只保留 12 13 14 16 如果是观众只保留 8 9 
          
          // 小程序都是观众
          if (type != 9 && type != 8 && type != 15 && type != 207) {
            if(message.localId){
              let localInfo = wx.getStorageSync('gs_live_room_local_ids');
              if(localInfo?.list?.includes(message.localId)&&localInfo.flag){
                localInfo.flag = false;
                wx.setStorageSync('gs_live_room_local_ids',localInfo);
                return;
              }
            }else{
              return;
            }
           
            
          }
        }
        if (this.anchorID === message.fromUid) {
          // 如果关注收到主播的消息。不保留关注和分享
          if (type == 9 || type == 8) {
            return;
          }
        }
        // console.log("_coverMessage",messages,type);
        switch (type) {
          case messageType.Notice:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.Message:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.REPLY_TO_COMMENTS:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.Join:
            isNeedRefreshUsers = true;
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.Fabulous:
            isNeedCallBack = true;
            break
          case messageType.Exit:
          case messageType.Kick:
            isNeedRefreshUsers = true;
            break
          case messageType.At:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.Follow:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.Share:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break
          case messageType.Poi:
            break
          case messageType.End:
            isNeedCallBack = true;
            break
          case messageType.Reward:
            break
          case messageType.Mission:
            break
          case messageType.Cutoff:
            isNeedCallBack = true;
            break
          case messageType.Gift:
            let nindex = -1;
            giftMsgs.map((item,index)=>{
              if(item.message == null && nindex == -1){
                nindex = index;
              }
            })
            if(nindex != -1){
              this._showTopGift(message,nindex);
              this._insertMsgQueue(message, tempMsgs, roomMsgs);
            }
            
            break
          case messageType.Alert:
            break
          case messageType.Drift:
            break
          case messageType.STAT_LIVE:
            isNeedCallBack = true;
            break
          case messageType.REFRESH_SHELVES:
            isNeedCallBack = true;
            break
          case messageType.SHOW_SHOP_CARD:
            isNeedCallBack = false;
            if (this.data.liveStatus == 3||this.data.liveStatus==5) {
              // 直播才需要显示推送卡片
              isNeedCallBack = true;
              this.showShopCard(); 
            }
            break
          case messageType.HIDE_SHOP_CARD:
          	isNeedCallBack = true;
            this._hideShopCard();
            break
          case messageType.TOP_MESSAGE:
            this._showTopMessage(message);
            break;
          case messageType.SHOW_LOTTERY:
            isNeedCallBack = true;
            break;
          case messageType.HIDE_LOTTERY:
            isNeedCallBack = true;
            break;
          case messageType.SHOW_HOTBANNER:
            isNeedCallBack = true;
              break;
          case messageType.HIDE_HOTBANNER:
            isNeedCallBack = true;
              break;
          case messageType.CHANGE_PULLSTREAM:
            isNeedCallBack = true;
              break;
          case messageType.REFRESH_LIVE:
            isNeedCallBack = true;
              break;
          case messageType.MICROCONNECT:
            isNeedCallBack = true;
            break;
          case messageType.ASK_GOODS_EXPLAIN:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break; 
          case messageType.SHOW_LOTTERY_RESULT:
            isNeedCallBack = true;
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break;
          case messageType.RELOAD_DATA:
            isNeedCallBack = true;
            break;
          case messageType.Notify:
            this._insertMsgQueue(message, tempMsgs, roomMsgs);
            break;
        }
        if (isNeedCallBack) {
          this.triggerEvent("onLiveMessageCallBack", message)
        }
      });

      if (isNeedRefreshUsers) {
        // 刷新用户
        this.triggerEvent("refreshUsers")
      }
      if (roomMsgs.length > 0) {
        let result = this.data._messages.concat(roomMsgs);
        const data = {
          _messages: result,
        };
        if (this.showUnReadMsg) {
          data.unReadCount = this.data.unReadCount + roomMsgs.length;
        }
        this.setData(data);
      }
      if (tempMsgs.length > 0) {
        tempMsgs.forEach(element => {
          this.setData({
            _tMessage: element,
          });
        });
      }
      // if (this.data.topMessageGift1 == null || this.data.topMessageGift2 == null) {
      //     this.setData({
      //       topMessageGift: giftMsgs,
      //     });
      // }
    },
    _setLastIndex(data, message) {
      if (!this.showUnReadMsg) {
        data.lastIndex = "item-" + message?.id +"-"+ message?.liveMessage?.messageType;
      }
      // 昵称超过20个字符打点
      let msgList = data?.messageList || this.data.messageList || []
      data.messageList = msgList?.map((item)=>{
         item.nickName =  substrByByte(item.nickName,20);
         return item
      })||[];
      return data;
    },
    _insertMsgQueue(message, tempMsgs, roomMsgs) {
      if (!message.isTempMsg) {
        roomMsgs.push(message)
      } else {
        tempMsgs.push(message)
      }
    },
    _showTopMessage(message) {
      //console.log("_coverMessage11show", message)
      if (!this.data.topMessageShow) {
        this.setData({
          topMessage: message,
          topMessageShow: true
        })
        const self = this;
        setTimeout(() => {
          self.setData({
            topMessageShow: false
          })
        }, 2000);
      }
    },
   
    showShopCard() {
      this.setData({
        showCard:true, //真正展示商卡
      });
      // this.triggerEvent('showShopCard', {}, {})
      // this.needShowCardAnimationAgain = false;
    },
    _hideShopCard() {
      // this.needShowCardAnimationAgain = true;
      this.setData({
        showCard: false,
        card:{goodsId:-1}
      })
    },
    sendMessage(message) {
      if (message) {
        console.log(TAG, message);
        if (message.isTempMsg) {
          let data = {
            _tMessage: message,
          };
          this.setData(this._setLastIndex(data, message));
        } else {
          message.liveMessage.originMessage = message.liveMessage.message;
          processCemojiText(message.liveMessage.message, message.liveMessage.inputObj.cemojiStyle, (res) => {
            message.liveMessage.message = res;
            this.data._messages.push(message)
            let data = {
              _messages: this.data._messages
            };
            this.setData(this._setLastIndex(data, message));
          })
         
        }
      }
      
    },
    scrollChage: function (e) {
      if (e.type == 'scroll') {
        if (this.touched) {
          this.showUnReadMsg = true;
        }
      } else if (e.type == 'scrolltolower') {
        this.showUnReadMsg = false;
        if (this.data.unReadCount != 0) {
          this.setData({
            unReadCount: 0,
          })
        }
      } else if (e.type == 'touchend') {
        this.touched = false;
      } else if (e.type == 'touchstart') {
        this.touched = true;
      }
    },
    tipsClick() {
      this.showUnReadMsg = false;
      this.setData(
        this._setLastIndex({
          unReadNumber: 0,
        }, this.data.messageList[this.data.messageList.length - 1]))
    },
    // _doShopping(e) {
    //   if(this.data.ABTestingManager=='B') return;
    //   let myEventDetail = {
    //     id: e.currentTarget.dataset.id || 0,
    //     url: e.currentTarget.dataset.url || '',
    //     coupon: e.currentTarget.dataset.coupon || '',
    //     cardType:e.currentTarget.dataset.cardtype || '',
    //     clickposition:e.currentTarget.dataset.clickposition || '',
    //   } // detail对象，提供给事件监听函数
    //   let myEventOption = {} // 触发事件的选项
    //   //console.log("_doShopping", myEventDetail)
    //   this.triggerEvent('doCard', myEventDetail, myEventOption)
    // },
    clickHandlersCallback(e){
      this.triggerEvent('clickHandlersCallback', {...e?.detail,clickposition:'goodscard'})
    },

    _showTopGift(message, index){
      console.log("_showTopGift",message,index)
      let topMessageGift = this.data.topMessageGift;
      message.show = true;
      topMessageGift[index].message = message;

      this.setData({
        topMessageGift: topMessageGift
      },()=>{
        //console.log("topMessageGift",this.data.topMessageGift)
      })

      let self = this;
      setTimeout(() => {
        topMessageGift[index].message.show = false;
        self.setData({
          topMessageGift:topMessageGift
        })
        setTimeout(()=>{
          self.data.topMessageGift[index].message = null;
        },320)

      },5000)

    },
    _showMessageReportPanel(){
      this.triggerEvent('showMessageReportPanel')    
    },
    _showMessageUserPanel(e){
      let uid = e && e.currentTarget &&  e.currentTarget.dataset && e.currentTarget.dataset.uid || '';
      let myEventDetail = {
        ctripUserID: uid
      }
      this.triggerEvent('showMessageUserPanel', myEventDetail)      
    },

    _updateCommentMessage: function(commentState){
        let messageList = this.data._messages;
        let newList = [];
        if(commentState == 2 || commentState == 3) {
            messageList.map((item,index)=>{
                if(item.fromUid == null || item.fromUid == this.data.master.masterID || item.nickName == '直播助理'){
                    newList.push(item)
                }
            })
            this.setData({
                _messages: newList
            })
        }
    },
    getLiveGoods:async function(param){
      Object.assign(param, {
        component: 1
      })
      getLiveGoods(param, (res) => {
        if (common.checkResponseAck(res)) {
          let item = res.data && res.data.goods || [];
          // 处理数据
          item = this.handlePushCardData(item);
          this.showDefaultRecommendShopCard(item);
          this.showCardTrace(item.goodsId)
        }
      })
    },
    showCardTrace: function(id){
      LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_goodscard_show', {
          goodID: id,
          type:'jiangjie',
      });
},

    handlePushCardData:function(item,parmas){
      if(parmas=='default'){
        let {rankTag} = item;
        //有榜单时展示榜单、无榜单时展示产品标签，都没有时不展示该字段
          if(rankTag){
              delete item.customerTags;
          }
          delete item.explainStatus; // 默认推送的卡片不需要讲解字段
        return {
          ...item,
        };
      }
      item.renderPushData = common.tryJSONParse(item.componentData)||{};
      let {index,recommendStatus,wxUrl,couponInfo,goodsId,tabTags,title} = item;
      let commonObj ={
      // salesStatus,
      explainStatus:2, // 推送中的卡片必然是讲解状态的
      index,recommendStatus,
      id:goodsId,
      goodsId,
      url :wxUrl,
      coupon:couponInfo,
      // position:i,
      tabTags,
      name:title
      }
      // if(this.data.pageType == 5)  commonObj.explainStatus=1;
      Object.assign(item.renderPushData,commonObj)
          let {rankTag} = item;
        //有榜单时展示榜单、无榜单时展示产品标签，都没有时不展示该字段
          if(rankTag){
              delete item.renderPushData.customerTags;
          }
          delete item.componentData
          return {
           ...item.renderPushData
          };
    },
  
  
  // 推送卡片 展示默认的卡片
      handleDefaultRecommendCard:function(data) {
        let self = this;
        let item = JSON.parse(JSON.stringify(data)); // 取商卡第一个
         // 处理数据
          item = this.handlePushCardData(item,'default');
         item.cardType = 'moren';
         this.showDefaultRecommendShopCard(item); // 获取到子组件的实例
         LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_goodscard_show', {
             goodID: item.goodsId,
             type:item.cardType,
         });
         clearTimeout(this.defaultGoodsCardTimer);
         this.defaultGoodsCardTimer = null;
         this.defaultGoodsCardTimer = setTimeout(()=>{
             this.hideDefaultRecommendShopCard();
         }, 10000);//10s消失
      },
    //   handleShopCardData:function(card, source) {
    //     card.isBigCard = isBigCard(card,this.cardTitleHeight);
    //     card.titleLineNum = titleLineNum(card);
    //     card.priceText = priceText(card, source);
    //     card.priceTextSuffix = priceTextSuffix(card, source);
    //     card.originPriceText = originPriceText(card, source)+'';
    //     card.scoreBigThan45 = scoreBigThan45(card);
    //     card.hasRankInfo = hasRankInfo(card);
    //     card.commentNumBigThan200 = commentNumBigThan200(card);
    //     card.hasTagInfo = hasTagInfo(card);
    //     card.saleStatusText = saleStatusText(card);
    //     card.disableShopCard = disableShopCard(card);

    // },
    _showMessageActionPanel:function(e){
      let dataset = e?.currentTarget?.dataset;
      this.triggerEvent('showMessageActionPanel',dataset)
    }
   
  },
})
