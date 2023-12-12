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
        showWinners:{
            type: Boolean,
            value: false
        },
        winnerList:{
            type:Array,
            value:[]
        },
        listLoadingState:{
            type:Number,
            value:4
        }
    },

  /**
   * 组件的初始数据
   */
    data: {
        listLoadingState: 0 ,//0=正常，1=加载更多中，2=加载更多失败， 3=加载没有更多，4=全局加载中，5=全局加载无数据，6=全局加载出错
    },

    lifetimes: {
        attached: function() {
            
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
					this._hidePanel();
				},
        catchtouchmove:function(){
					// this._hidePanel();
          return false;
        },
        _hidePanel: function(){
            // cwx.sendUbtByPage.ubtTrace('o_gs_tripshoot_lvpailive_guide_autohide', {
            // });
            this.triggerEvent('hideWinners');
        },

        showWinners:function(){
            this.triggerEvent('showWinners');
        },

        backAction:function(){
            this.triggerEvent('hideWinners');
        }
    }
})
