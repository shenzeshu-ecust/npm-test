// import { cwx } from '../../../../../cwx/cwx.js';

Component({
    /**
    * 组件的属性列表
    */
    properties: {
        isIphoneX:{
            type: Boolean,
            value: false
        },
        showLuckyBag:{
            type: Boolean,
            value: false
        },
        userPanelInfo:{
            type: Object,
            value:{}
        },
        drawResult:{
            type: Object,
            value:null
        },
        windowWidth:{
            type:Number,
            value:0
        },
        windowHeight:{
            type:Number,
            value:0
        },
        showOpenLuckyLoading:{
            type: Boolean,
            value: true
        }
    },

  /**
   * 组件的初始数据
   */
    data: {
        headImageHeight:0,
        tips: []
    },
    observers:{
      drawResult: function(params) {
        if(params && params.tip != null){
          let tips = params.tip.split('\n')
          this.setData({
            tips
          })
        }
      }
    },
    lifetimes: {
        attached: function() {
          this.setData({
              headImageHeight:this.data.windowWidth * 12/53
          })
          // console.log("1231231" + JSON.stringify(this.data))
        },
        detached: function() {
          // 在组件实例被从页面节点树移除时执行
        },
      },

  /**
   * 组件的方法列表
   */
    methods: {
			  catchtouchstart:function(){
					this._hidePanel()
				},
        catchtouchmove:function(){
					// this._hidePanel()
          return false;
        },
        _hidePanel: function(){
            // cwx.sendUbtByPage.ubtTrace('o_gs_tripshoot_lvpailive_guide_autohide', {
            // });
            this.triggerEvent('hideLuckyBag');
        },
        viewWinners:function(){
            this.triggerEvent('viewWinners');
        },

        goViewMyLottery:function(){
            this.triggerEvent('goViewMyLottery');
        },

        viewMyLottery:function(){
            this.triggerEvent('viewMyLottery');
        }
    }
})
