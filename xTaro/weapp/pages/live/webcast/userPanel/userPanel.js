
Component({
    /**
    * 组件的属性列表
    */
    properties: {
        isIphoneX:{
            type: Boolean,
            value: false
        },
        showUserPanel:{
            type: Boolean,
            value: false
        },
        userPanelInfo:{
            type: Object,
            value:{}
        }
    },

  /**
   * 组件的初始数据
   */
    data: {
        
    },

  /**
   * 组件的方法列表
   */
    methods: {
       catchtouchmove:function(e){
				//  this.triggerEvent('hidePanel');
         return false
       },
        _jumpToUserHome: function (e) {
            let url = e.currentTarget.dataset.url || '';
            let id = e.currentTarget.dataset.id || '';
            let type = e.currentTarget.dataset.type || '';
            let param = {
                url: url,
                ctripUserID: id,
                type: type
            }
            this.triggerEvent('jumpToUserHome', param);
            
        },

        _jumpToGroupChat: function (e) {
            this.triggerEvent('jumpToGrouChatForPannel', {});
        },

        _focusUser: function(e){ 
            let ctripUserID = e.currentTarget.dataset.id || '';
            let isfollow = e.currentTarget.dataset.isfollow || false;
            let myEventDetail = {
                ctripUserID: ctripUserID,
                isfollow: isfollow
            }
            console.log("_focusUser", myEventDetail)
            if(ctripUserID){
                this.triggerEvent('doPanelFollow', myEventDetail);
            }
        },

        _hidePanel: function(){
            this.triggerEvent('hidePanel');
        }
       
    }
})
