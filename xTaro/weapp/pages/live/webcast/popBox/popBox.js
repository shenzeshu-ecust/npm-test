
Component({
    /**
    * 组件的属性列表
    */
    properties: {
        showPopBox:{
            type: Boolean,
            value: false
        },
        popBoxContent:{
            type: Object,
            value:{}
        },
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
        _cancelAction: function(){
            this.triggerEvent('hidePopBox');
        },
        _confirmAction: function(){
            this.triggerEvent('confirmAction');
        }
    }
})
