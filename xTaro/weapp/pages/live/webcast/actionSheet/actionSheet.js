Component({
  externalClasses: ['i-class', 'i-class-mask', 'i-class-header'],

  options: {
      multipleSlots: true
  },

  properties: {
    bottomSafe:{
      type: Number,
      value: 0
    },
      visible: {
          type: Boolean,
          value: false
      },
      maskClosable: {
          type: Boolean,
          value: true
      },
      showCancel: {
          type: Boolean,
          value: false
      },
      cancelText: {
          type: String,
          value: '取消'
      },
      actions: {
          type: Array,
          value: []
      }
  },

  methods: {
      catchtouchmove(){
        return false
      },
      handleClickMask () {
          if (!this.data.maskClosable) return;
          this.handleClickCancel();
      },

      handleClickItem ({ currentTarget = {} }) {
          const dataset = currentTarget.dataset || {};
          const { index } = dataset;
          this.triggerEvent('click', { index });
      },

      handleClickCancel () {
          this.triggerEvent('cancel');
      }
  }
});
