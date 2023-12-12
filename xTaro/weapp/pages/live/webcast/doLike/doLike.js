// pages/live/webcast/doLike/doLike.js
import { cwx } from '../../../../cwx/cwx.js';
import common from '../../common/common.js';
import { messageType, getLocalMessage } from '../liveMessage/liveMessageUtil'
import LiveUtil from '../../common/LiveUtil';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    commentKeybordBottom:{
      type:Number,
      value:0
    },
    likeCounts:{
      type:Number,
      value:0,
      observer: function (likeCounts) {
        this.setData({
          likeCount:likeCounts
        })
     }

    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    bubbleList: [], ////点赞气泡
    comboLikeCount: 0, //喜欢连击次数
    messageBubbleList: [], //灌水的冒泡
    // commentKeybordBottom:0,
    // isFocused:false,
    likeCount:0,
    showLikeAnimation:false

  }, 
  preComboLikeCountTime: 0, //上次点击到时间，短于1秒就算连击
  preMessageBubbleTime: 0, //上一次灌水的时间
  lifetimes: {
    ready() {
      this.currentPage = cwx.getCurrentPage() || {}; 
    },
    detached() {
      
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
     doLike(){
       if (!cwx.user.isLogin()) {
        this.currentPage.toLogin();
        } else {
            let self = this;
            self.likeAnimation && clearTimeout(this.likeAnimation);
            self.setData({
                showLikeAnimation: false
            })
            setTimeout(() => {
              self.setData({
                    showLikeAnimation: true
                }) 
                self.likeAnimation = setTimeout(() => {
                  self.setData({
                          showLikeAnimation: false
                    }) 
                 }, 600);
            }, 20);
           
            LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_like_click');
            //气泡
            this.addPraiseBubble();
        }
     },
     addPraiseBubble: function(){
      let b = Math.floor(Math.random() * 8) + 1;
      let bl = Math.floor(Math.random() * 11) + 1; // bl1~bl11
      let className = `bubble b${b} bl${bl}`;
      let bubbleList = this.data.bubbleList;
      let comboLikeCount = this.data.comboLikeCount;
      let preComboLikeCountTime = this.preComboLikeCountTime;
      let currentTime = new Date().getTime();
      let listLen = bubbleList.length;
      let currentLikeCount = 1;
      if(currentTime - preComboLikeCountTime < 1000){
          if(comboLikeCount < 99) {
              comboLikeCount ++;
              currentLikeCount = comboLikeCount;
          }
          if(this.comboLikeCountTimer){
              clearTimeout(this.comboLikeCountTimer);
              this.comboLikeCountTimer = null;
          }
          
      } else {
          comboLikeCount = 1;
      }
      
      this.preComboLikeCountTime = currentTime;
      let bubbleObj = {
          className: className,
          datat: JSON.stringify(Date.now())
      }
      //bubbleList.push(bubbleObj);
      // 是手机发生较短的震动
      wx.vibrateShort({ //仅在 iPhone 7 / 7 Plus 以上及 Android 机型生效
          type: 'heavy',
          complete: (res)=>{
              console.log("vibrateShort",res)
          }
      })
      this.setData({
          comboLikeCount: comboLikeCount,
          [`bubbleList[${listLen}]`]: bubbleObj,
          likeCount: this.data.likeCount +1
      },()=>{
          this.comboLikeCountTimer = setTimeout(()=>{
              this.currentPage.sendChatroomMessages(messageType.Fabulous, currentLikeCount);
              clearTimeout(this.comboLikeCountTimer);
              this.comboLikeCountTimer = null;
          },1000)
          setTimeout(()=>{
              if(new Date().getTime() - this.preComboLikeCountTime >= 3000){
                  this.setData({
                      bubbleList: [],
                      comboLikeCount: 0
                  })
              }
          },3000)
      })
  },
  //灌水冒泡
  messageBubble: function(){  
      let b = Math.floor(Math.random() * 8) + 1;
      let bl = Math.floor(Math.random() * 11) + 1; // bl1~bl11
      let className = `bubble b${b} bl${bl}`;
      let bubbleList = this.data.messageBubbleList;
      let currentTime = new Date().getTime();
      let preMessageBubbleTime = this.preMessageBubbleTime;
      let listLen = bubbleList.length;
      let bubbleObj = {
          className: className,
          datat: JSON.stringify(Date.now())
      }
      this.preMessageBubbleTime = currentTime;
      this.setData({
          [`messageBubbleList[${listLen}]`]: bubbleObj

      },()=>{
          setTimeout(()=>{
              if(new Date().getTime() - this.preMessageBubbleTime >= 3000){
                  this.setData({
                      messageBubbleList: [],
                  })
              }
          },3000)
      })

  },
  }
})
