import { cwx } from '../../../../cwx/cwx.js';

Component({
    /**
    * 组件的属性列表
    */
    properties: {
        isIphoneX:{
            type: Boolean,
            value: false
        },
        showFollowGuide:{
            type: Boolean,
            value: false
        },
        userPanelInfo:{
            type: Object,
            value:{}
        },
        liveID:{
            type:Number,
            value:0
        }
    },

  /**
   * 组件的初始数据
   */
    data: {
        countdown:8
    },

    lifetimes: {
        attached: function() {
          this.tick();
        },
        detached: function() {
          this.clearTick();
          // 在组件实例被从页面节点树移除时执行
        },
      },

  /**
   * 组件的方法列表
   */
    methods: {
        catchtouchmove:function(e){
          return false;
        },
        _focusUser: function(e){ 
            let ctripUserID = e.currentTarget.dataset.id || '';
            let isfollow = e.currentTarget.dataset.isfollow || false;
            let myEventDetail = {
                ctripUserID: ctripUserID,
                isfollow: isfollow
            }
            cwx.sendUbtByPage.ubtTrace('c_gs_tripshoot_lvpailive_guide_follow', {
                liveID:this.data.liveID,
                follow: !isfollow ? 'true' : 'false' // 用户点击后取消关注，参数为false.用户点击后关注，参数为true
            });
            if(ctripUserID){
                if (!cwx.user.isLogin()) {
                    this.clearTick();
                }
                this.triggerEvent('doGuideFollow', myEventDetail);
            }
        },

        _hidePanel: function(){
            cwx.sendUbtByPage.ubtTrace('o_gs_tripshoot_lvpailive_guide_autohide', {
                liveID:this.data.liveID
            });
            this.clearTick();
            this.triggerEvent('hideFollowGuide');
        },

        clearTick: function(){
            clearInterval(this.timer);
        },

        tick:function(){
            this.timer = setInterval(() => {
                if (this.data.countdown <= 0) {
                  clearInterval(this.timer);
                  this._hidePanel();
                } else {
                  this.setData({
                      countdown: --this.data.countdown
                  });
                }
            }, 1000);
        },

        continueTick: function() {
            this.tick();
        }
       
    }
})
