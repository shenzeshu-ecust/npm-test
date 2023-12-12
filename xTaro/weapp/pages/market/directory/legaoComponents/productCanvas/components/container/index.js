const behavior = require('./../../utils/behavior')
Component({
  behaviors: [behavior],
  externalClasses: [],
  options: {
    multipleSlots: true
  },
  properties: {
    data: {
      type: Object,
    },
  },
  data: {
    showImageKey: "",
    showImageStatus: true,
    
  },
  methods: {
    checkImageLoadError(e) {
      if(this.data.showImageKey) return;
      this.setData({
        showImageKey: e.currentTarget.dataset.key,
        showImageStatus: false
      })
    },
    checkImageLoad(e){
      this.setData({
        showImageKey: "",
        showImageStatus: true
      })
    }
  }
})
