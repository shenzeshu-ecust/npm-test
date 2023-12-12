// pages/you/place/webcast/liveShelvesBanner/shelvesBanner.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    filteredGoodsList: {
      type: Object,
      value: null
    },
  },
  lifetimes: {
    created: function () {
      // this.getElement()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    rects: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    shelvesBannerClick: function (params) {
      this.triggerEvent('shelvesBannerClick', params);
    },

    bannerScroller(e) {
      // this.getElement()
      this.triggerEvent('shelvesBannerScroll');
    },
    
    // getElement() {
    //   const query = wx.createSelectorQuery()
    //   query.in(this).selectAll('.filter-view-item').boundingClientRect()
    //   // query.selectViewport().scrollOffset()
    //   query.exec((rects) => {
    //     debugger
    //     let left = 0;
    //     let right = 0;
    //     rects.map((rect, index) => {
    //       rect.map((res, i) => {
    //         if (res.id === "item_goods_banner") {
    //           left = res.left;
    //           right = res.right;
    //         } else {
    //           if ((res.left >= left && res.left <= right) || (res.right >= left && res.right <= right)) {
    //             if(res.dataset && res.dataset.item){
    //               this.triggerEvent('shelvesBannerShow', {item:res.dataset.item,
    //                 index: res.dataset.index});
    //             }
    //           }
    //         }
    //       })
    //     })
    //   })
    // }
  }
})
