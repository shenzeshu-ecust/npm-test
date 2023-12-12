Component({
    /**
     * 组件的属性列表
     */
    properties: {
        data: {
            type: Object,
            value: {}
        },
        inviteBtn: {
            type: Object,
            value: {}
        },
        onClickInviteHelp: {
            type: Function,
            value: () => {}
        },
        isOpen: {
            type: Function,
            value: true
        },
        onClickClose: {
            type: Function,
            value: () => {}
        },
        isLogin: {
            type: Boolean,
            value: true
        },
        userInfo: {
            type: Object,
            value: null
        },
        toLogin: {
          type: Function,
          value: () => {}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        canIUse: wx.canIUse('getUserProfile')
    },

    attached() {
        console.log('inviteHelp Component data', this.data)  
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClickClose: function(){
            this.triggerEvent('popupClose')
        },
        onClickInviteHelp: function() {
            this.triggerEvent('inviteHelp')
        },
        toLoginPhone: function(e) {
            this.triggerEvent('loginPhone', e)
        },
        toLogin: function() {
          this.triggerEvent('toLogin')
        },
        setUserProfile(e){
            this.triggerEvent('setUserProfile', e)
        }
    }
})
