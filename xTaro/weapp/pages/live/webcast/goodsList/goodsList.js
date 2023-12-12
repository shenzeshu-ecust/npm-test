// pages/live/webcast/goodsList/goodsList.js
import LiveUtil from '../../common/LiveUtil';
import {substrByByte} from '../util/utils'
import {
  cwx,
  __global
} from '../../../../cwx/cwx.js';
import common from '../../common/common.js';
import DeviceUtil from '../../common/device.js';
import {
  getGoodsList,
  postSuggestExplainGoods
} from '../service/webcastRequest.js';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    env:{
      type:String,
      value:'prd'
    },
    pageType: {
      type: Number,
      value: 0
    },
    functionSwitch: {
      type: Object,
      value: {}
    },
  },
  lifetimes: {
    ready() {
			this.currentPage = cwx.getCurrentPage() || {};
      // 搜索历史
      wx.getStorage({
        key: 'live_search_history',
        success: (res) => {
          this.setData({
            searchRecordsList: JSON.parse(res.data)
          })
        }
      })
      cwx.Observer.addObserverForKey('live_open_goods', (value) => {
         this.showShopWrapper()
        
      })
    },
    detached() {
      
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    proListHeight: parseInt(DeviceUtil.windowHeight * 0.3),
    filteredGoodsList: [],
    filteredBannerGoodsList: [],
    goodsTabList: [],
    goodsCount: 0,
    updateType: 'refresh',
    showGoodsListWrapper:false,
    activeIndex: 0,
    inputSearchValue: '',
    searchRecordsList: [], // 历史记录
    hasClickSearchIcon: false, // 是否点击过货架的搜索按钮
    hasSearchGoods: false, // 是否搜索过商品
    needFocus: false,
    searchGoodsList: [], // 商卡
    nonSearchGoodsList: [], // 非商卡
    formInfoObjectList: [],
    incrementalUpdateProduct: {},
		loading:1,
		// goodsShopInfo:{
		// 	shopName:substrByByte('啦啦啦啦啦啦啦啦啦啦haha',20),
		// 	shopUrl:'https://www.baidu.com',
		// 	vIcon:'https://pages.c-ctrip.com/livestream/live/live_pro_icon.png'
		// },
		couponPageUrl:''
    
  },


  /**
   * 组件的方法列表
   */
  methods: {
    catchtouchmove:function(){
       return false
    },
    shelvesBannerClick: function (params) {
      this.triggerEvent('shelvesBannerClick', params);
    },

    shelvesBannerScroll:function(){
      this.handleGoodsFilterBannerExpo()
     },

    reFreshGoodsList(param,type) {
     
      Object.assign(param, {
				component: 1,
				needShopInfo:true// 添加是否需要店铺信息

      })
      this.handleGetGoodsList(param,type)

		},
		handleGetGoodsList: function (param,type) {
      var self = this;
      var goodsList = [];
      var nonGoodsList = [];
      // var hotSaleCard = {};
      let proListHeight = this.data.proListHeight;
      let windowHeight = DeviceUtil.windowHeight;
      getGoodsList(param, function (res) {
        if (common.checkResponseAck(res)) {
          goodsList = res.data && res.data.liveGoods || [];
          nonGoodsList = res.data && res.data.nonGoodsList || [];
          let tabs = res.data && res.data.tabs || [];
          if (goodsList && goodsList.length > 0) {
            if (goodsList.length <= 2) {
              proListHeight = parseInt(windowHeight * 0.4);
            } else {
              proListHeight = parseInt(windowHeight * 0.7);
            }

          }
        
            goodsList = goodsList.map((t, i) => {
              t.renderData = common.tryJSONParse(t.componentData) || {};
              let {
                saleStatus,
                explainStatus,
                index,
                recommendStatus,
                wxUrl,
                couponInfo,
                goodsId,
                tabTags,
                title
              } = t;
              let {
                rankTag,
                zoneName
              } = t.renderData;
              let commonObj = {
                // saleStatus,
                explainStatus,
                index,
                recommendStatus,
                id: goodsId,
                goodsId,
                url: wxUrl,
                coupon: couponInfo,
                position: i,
                tabTags,
                name: title, // 搜索字段需要用到,
                title // 商品搜索用的
              }
              // if (self.data.pageType == 5) commonObj.explainStatus = 1;
              Object.assign(t.renderData, commonObj)
              //++++++++++++++++++++货架列表++++++++++++++++++++
              // rankTag || zoneName || showCommentsCount
              // 有榜单时，展示榜单信息
              // 无榜单有位置商圈信息时，展示位置商圈信息
              // 无榜单无位置商圈信息，有点评数时，展示点评
              // 以上都没有时，不展示该字段
              if (rankTag) {
                delete t.renderData.showCommentsCount; // 点评数
                delete t.renderData.zoneName; // 位置商圈
              } else if (zoneName) { // 位置商圈
                delete t.renderData.showCommentsCount;
              }
              delete t.componentData
              return {
                ...t.renderData,
              };
            })

          let selectedTab = self.getLiveGoodsCurrentTab(self.data.goodsTabList, tabs);
          let filterData = self.filterGoodsList(selectedTab.name, selectedTab.type, goodsList, tabs);
          let filterBannerData = self.filterLiveGoodsList(selectedTab.name, selectedTab.type, nonGoodsList, tabs);

          let goodsCount = res.data.totalCount || "";
          if (nonGoodsList.length > 0 && !goodsCount) {
            goodsCount = " ";
          }
          // self.proListHeightValue = proListHeight;
          self.data.goodsList = JSON.parse(JSON.stringify(goodsList));
          if(self.hasClickShopWrapperIcon){
						let goodsShopInfo = res?.data?.goodsShopInfo;
				  	if(goodsShopInfo){
							goodsShopInfo.shopName= substrByByte(goodsShopInfo.shopName,20);
							LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_shop');
						} 
						let couponPageUrl = res?.data?.couponPageUrl;
						if(couponPageUrl){
							LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_coupon');
						}
            self.setData({
              goodsCount:goodsCount,
              loading:2,
              proListHeight: proListHeight,
              goodsTabList: filterData.tabList,
              filteredGoodsList: JSON.parse(JSON.stringify(filterData.filteredGoodsList)),
              nonGoodsList: nonGoodsList,
							filteredBannerGoodsList: filterBannerData.filteredGoodsList,
							goodsShopInfo,
							couponPageUrl,
              updateType: self.data.showGoodsListWrapper ? 'update' : 'refresh' // 要看货架是不是打开的状态，如果打开的话
            })

          }else{
            self.setData({
              goodsCount:goodsCount,
              proListHeight: proListHeight,
              updateType: self.data.showGoodsListWrapper ? 'update' : 'refresh' // 要看货架是不是打开的状态，如果打开的话
            })
              // 默认商卡组件
              if(type!=='hide'){
                if(!self.isexplaing && self.data.pageType==3){
                  self.handleLiveMessageCard(goodsList,filterBannerData.filteredGoodsList)
                  self.isexplaing = true
                }
               
              }
         
          }
         
        
        }else{
          self.setData({
            loading:2
          })
        }
      })
    },
    handleLiveMessageCard: function (goodsList,filteredBannerGoodsList) { // 非商卡没有默认推送逻辑 商卡有默认推送逻辑
      // 判断直播内商卡是否有正在讲解的商卡
      let goodsIndex = goodsList.findIndex(t=>t.explainStatus==2);
    
      let bannerIndex = filteredBannerGoodsList.findIndex(t=>t.explainStatus==2);
      // 如果没有找到正在推送的卡片 
      if(goodsIndex<0 && bannerIndex <0 && goodsList?.length){
        //推送商品卡片增加默认逻辑
        if (goodsList.length == 1) { // 只有一个的商品的时候 要推送默认的商品逻辑
          // this.currentPage?.selectComponent('.liveMessage')?.handleDefaultRecommendCard(goodsList[0]);
          this.triggerEvent("handleDefaultRecommendCard",goodsList[0])
         }else{
          // 判断该主播是否在名单里 
          if(this.data.functionSwitch?.pushFirstGoodsCard ==1){  // 不在名单里 则显示
              // 默认推送序号最小的商品卡片10s
              // this.currentPage?.selectComponent('.liveMessage')?.handleDefaultRecommendCard(goodsList[0]);
              this.triggerEvent("handleDefaultRecommendCard",goodsList[0])
              
          }
        }
      }
    },
    getLiveGoodsCurrentTab: function (oldTabs = [], newTabs = []) {
      // let selectedTab = (oldTabs.filter((tab) => tab.selected) || [])[0] || {}; //上次选中的tab
      // let tabs = newTabs.filter((tab) => tab.name == selectedTab.name); //新的是否包含上次的tab
      // if (tabs && tabs.length > 0) {
      //   //包含就还是选中上次的
      //   return tabs[0];
      // } else {
      //   //不包含默认选中第一个（全部）
      //   if (newTabs[0]) {
      //     newTabs[0].selected = true;
      //   }
      //   return newTabs[0] || {}
      // }
      let tabs = newTabs.filter((tab,index)=>this.data.activeIndex==index);
      if (tabs && tabs.length > 0) {
        //包含就还是选中上次的
        return tabs[0];
      } else {
        //不包含默认选中第一个（全部）
        return newTabs[0] || {}
      }
    },
    filterGoodsList: function (currentTabName = '全部', currentTabType = -1, goodsList = [], tabList = []) {
      let filteredGoodsList = [];
      let filteredLeftGoodsList = []
      if (currentTabType == -1) { //全部，不筛选
        filteredGoodsList = goodsList;
      } else {
        goodsList.map((goods, index) => {
          let tabTags = goods.tabTags || [];
          let tempTags = tabTags.filter((goodsTag) => goodsTag.name == currentTabName && goodsTag.type == 1);
          if (tempTags.length > 0) {
            filteredGoodsList.push(goods)
          } else {
            filteredLeftGoodsList.push(goods);
          }
        });
      }

      // this.ABTestingManager == 'A' && filteredGoodsList.map((goods, index) => {
      //   this.handleShopCardData(goods);
      // });
      return {
        filteredGoodsList,
        tabList,
        filteredLeftGoodsList
      }
    },

    filterLiveGoodsList: function (currentTabName = '全部', currentTabType = -1, goodsList = [], tabList = []) {

      let filteredGoodsList = [];
      goodsList.map((goods, index) => {
        if (goods.explainStatus === 2) {
          filteredGoodsList.unshift(goods)
        } else {
          filteredGoodsList.push(goods)
        }
      });
      // if (tabList[0]) {
      //   tabList[0].selected = true;
      // }

      // filteredGoodsList.map((goods, index) => {
      //   this.handleShopCardData(goods);
      // });

      return {
        filteredGoodsList,
        // tabList
      }
    },

    //货架商品筛选项点击
    filterGoodsTabClick: function (e) {
      let {
        name: tagName,
        type: tagType,
        position,
        index
      } = e.currentTarget.dataset;
      if (this.data.activeIndex == index) return;

      let filterData = this.filterGoodsList(tagName, tagType, this.data.goodsList, this.data.goodsTabList);
      this.setData({
        activeIndex: index,
        // goodsTabList: filterData.tabList,
        filteredGoodsList: JSON.parse(JSON.stringify(filterData.filteredGoodsList)),
        scrollTop: 0.1,
        updateType: 'refresh'
      });

      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodstab_click', {
        position: position
      })
    },

    // handleShopCardData: function (card, source) {
    //   card.titleLineNum = titleLineNum(card);
    //   card.priceText = priceText(card, source);
    //   card.priceTextSuffix = priceTextSuffix(card, source);
    //   card.originPriceText = originPriceText(card, source) + '';
    //   card.scoreBigThan45 = scoreBigThan45(card);
    //   card.hasRankInfo = hasRankInfo(card);
    //   card.commentNumBigThan200 = commentNumBigThan200(card);
    //   card.hasTagInfo = hasTagInfo(card);
    //   card.saleStatusText = saleStatusText(card);
    //   card.disableShopCard = disableShopCard(card);
    // },

    handleGoodsSearch: function () {
      // LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_search_click', {
      //   liveID: this.liveID,
      //   liveState: this.liveStatusText,
      // });
      this.setData({
        hasClickSearchIcon: true,
        needFocus: true,
      }, () => {
        this.handelSetHeight()
        this.handleGoodsRecordsExpo()
        // 垃圾桶按钮曝光
        if (this.data.searchRecordsList && this.data.searchRecordsList.length) {
          LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_deletehistory_show');
        }

      })
    },
    handelSetHeight: function () {
      this.createSelectorQuery().select('.head11').boundingClientRect(rects => {
        if (!rects || !rects.height) return;
        this.createSelectorQuery().select('.search-item-wrap').boundingClientRect(rects1 => {
          if (!rects1 || !rects1.height) {
            this.setData({
              barHeight: this.data.proListHeight - rects.height // 
            })
            return;
          }
          let barHeight = (this.data.proListHeight - rects.height) / rects1.height; //可以占几行
          this.barHeight = barHeight;
          this.setData({
            barHeight: rects1.height * Math.floor(barHeight) // 可以一共展示的多少条
          })
        }).exec()
      }).exec()
    },
    commentSearchGoodsInput: function (e) {
      let value = e.detail && e.detail.value || '';
      if (value.length > 20) {
        wx.showToast({
          title: `最多只可以输入20个字哦`,
          icon: 'none'
        })
      }
      this.setData({
        inputSearchValue: value.slice(0, 20)
      })

    },
    handleGoodsBack: function () {
      this.destroyGoodsFilterTabExpo(1);
      this.setData({
        hasClickSearchIcon: false, // 用来切换搜索页面还是商品页面的
        hasSearchGoods: false,
        needFocus: false,
        inputSearchValue: '',
        nonSearchGoodsList: [],
        searchGoodsList: []
      })
    },
    sendSearchGoodsComment: function () {
      if (!this.data.inputSearchValue) return;

      let findIndex = this.data.searchRecordsList.findIndex(item => item.name == this.data.inputSearchValue);
      if (findIndex >= 0) {
        // 找到的话， 将该内容移除掉 并放到第一位置上
        this.data.searchRecordsList.splice(findIndex, 1);
        this.data.searchRecordsList.unshift({
          name: this.data.inputSearchValue,
        })
      } else { // 没有添加
        if (this.data.searchRecordsList.length >= 20) { //替换第一个
          this.data.searchRecordsList.unshift({
            name: this.data.inputSearchValue,
          })
          // 删除最后一个
          this.data.searchRecordsList.splice(-1, 1)
        } else {
          this.data.searchRecordsList.unshift({
            name: this.data.inputSearchValue,
          })
          //   LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_searchhistory_show',{
          //     liveID: this.liveID,
          //     liveState: this.liveStatusText,
          //     order:1,
          //     content:this.data.inputSearchValue
          // });

        }

      }
      let finalSearchList = [];
      let findItem = this.data.goodsTabList?.find(item => item.name.includes(this.data.inputSearchValue));
      if (findItem) {
        let {
          name,
          type
        } = findItem;
        let {
          filteredGoodsList,
          filteredLeftGoodsList
        } = this.filterGoodsList(name, type, this.data.goodsList, this.data.goodsTabList);
        finalSearchList = filteredLeftGoodsList.filter((goods, index) => {
          if ((goods.index + '').includes(this.data.inputSearchValue) || goods.title.includes(this.data.inputSearchValue)) {
            return goods;
          }
        }).concat(filteredGoodsList).sort((a, b) => a.index - b.index)
      } else {
        finalSearchList = this.data.goodsList.filter((goods, index) => {
          if ((goods.index + '').includes(this.data.inputSearchValue) || goods.title.includes(this.data.inputSearchValue)) {
            return goods;
          }
        });
      }
      this.setData({
        hasSearchGoods: true,
        searchRecordsList: this.data.searchRecordsList,
        searchGoodsList: finalSearchList,
        nonSearchGoodsList: this.data.nonGoodsList.filter((goods, index) => {
          if ((goods.index + '').includes(this.data.inputSearchValue) || (goods.title).includes(this.data.inputSearchValue)) {
            return goods;
          }
        })
      }, () => {
        // 并把searchGoodsRecords 存到localstorage里
        try {
          wx.setStorageSync('live_search_history', JSON.stringify(this.data.searchRecordsList))
        } catch (e) {
          // Do something when catch error
        }

        this.handleSearchGoodsListExpo()
        this.handleNonSearchGoodsListExpo();
      })
    },
    //搜索出的商品卡片曝光
    handleSearchGoodsListExpo: function () {
      if (!this.data.searchGoodsList.length) {
        return;
      }
      // this.handleGoodsListExpo()

    },
    //搜索出的非商品卡片曝光
    handleNonSearchGoodsListExpo: function () {
      if (!this.data.nonSearchGoodsList.length) {
        return;
      }
      this.handleGoodsFilterBannerExpo();
    },
    //搜索历史记录曝光
    handleGoodsRecordsExpo: function () {
      if (!this.data.searchRecordsList.length) {
        return;
      }
      this.destroyGoodsFilterTabExpo(2);
      this._observer2 = wx.createIntersectionObserver(this, {
        thresholds: [0.5],
        initialRatio: 0.5,
        observeAll: true
      })
      this._observer2
        .relativeTo('.search-history-record')
        .observe('.search-item', (res) => {
          if (res.intersectionRatio > 0.5) { //出现
            LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_searchhistory_show', {
              order: res.dataset.order,
              content: res.dataset.name
            });
          }
        })

    },


    handleGoodsRecords: function (e) { //搜索历史记录点击
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_searchhistory_click', {
        order: e.currentTarget.dataset.order,
        content: e.currentTarget.dataset.name || ''
      });
      this.setData({
        inputSearchValue: e.currentTarget.dataset.name || '',
        hasSearchGoods: true,
      }, () => {
        this.sendSearchGoodsComment();
      })

    },
    handleClearGoodsSearch: function () { // 点击input上的x 按钮
      this.setData({
        inputSearchValue: '',
        hasSearchGoods: false,
        nonSearchGoodsList: [],
        searchGoodsList: [],
        needFocus: false,
      }, () => {
        // 如果barHeight=0 ,需要重新更新下历史记录的高度
        console.log('this.barHeight====>', this.barHeight)
        this.setData({
          needFocus: true
        })
        if (!Math.floor(this.barHeight)) {
          this.handelSetHeight();
        }
      })
    },

    handleClearRecords: function () { // 点击垃圾桶按钮
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_deletehistory_click');
      this.setData({
        searchRecordsList: []
      }, () => {
        // 清除历史
        try {
          wx.clearStorageSync('live_search_history')
        } catch (e) {
          // Do something when catch error
        }
      })

    },
    // 乐高组件的回调
    clickHandlersCallback: function (e) {
      this.triggerEvent('clickHandlersCallback', e?.detail)
    },

    destroyGoodsFilterTabExpo: function (index) {
      // console.log('index======>',index,this[`_observer${index}`])
      if (this[`_observer${index}`]) {
        this[`_observer${index}`].disconnect();
      }

    },
    //求讲解
    askToExplain: common.debounceFn(function (e) {
      let goodsList = this.data.filteredGoodsList;
      let goodsId = e.currentTarget.dataset.id || 0;
      let index = e.currentTarget.dataset.index || 0;
      let position = e.currentTarget.dataset.position || 0;
      let self = this;
      let param = {
        goodsId: goodsId
      }
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_consult_click', {
        goodID: goodsId,
        index: index,
        note: '',
      });
      postSuggestExplainGoods(param, function (res) {
        if (common.checkResponseAck(res) && res.data.code == 200) {
          wx.showToast({
            title: '主播已收到提醒',
            icon: 'none'
          })
          self.setData({
            [`filteredGoodsList[${position}].explainStatus`]: 3,
            incrementalUpdateProduct: {
              product: goodsList[position],
              index: position,
              goodsId: goodsId,
              updateType: 'explainStatus'
            }
          })
        } else {
          wx.showToast({
            title: '操作失败，请重试',
            icon: 'none'
          })
        }
      })
    },200),

    // goodsListScroll: common.debounceFn(function (e) {
    //   this.handleGoodsListExpo()
    // }, 800),

    // handleGoodsListExpo: function () {
    //   this.destroyGoodsFilterTabExpo(1);
    //   this._observer1 = wx.createIntersectionObserver();
    //   this._observer1.relativeToViewport().observe('.scene_box', (res) => {
    //       debugger
    //       if (res.intersectionRatio > 0.5) { //出现
    //         if (this.data.hasClickSearchIcon) {
    //           LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_searchresult_show', {
    //             goodID: res.dataset.id,
    //             index: +res.dataset.index,
    //           });
    //         } else {
    //           LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodsitem_show', {
    //             goodID: res.dataset.id,
    //             goodlist: 1,
    //             // order: res.dataset.index,
    //             index: res.dataset.index,
    //             note: '',
    //           });
    //         }

    //       }
    //     })
    // },

    exposureTrace: function (e) { // 每10个10个的曝光
      let {
        index,
        goodsId
      } = e?.detail || {};
      if (this.data.hasClickSearchIcon) {
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_searchresult_show', {
          goodID: goodsId,
          index: index,
        });
      } else {
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodsitem_show', {
          goodID: goodsId,
          index: index,
          goodlist: 1,
          // order: res.dataset.index,
          note: '',
        });
      }

    },


    handleScrollLower() {
      try {
        cwx.Observer.noti("live_sk_component_handleScrollLower", {
          refresh: "true"
      })
      } catch (error) { }
    },

    handleGoodsFilterTabExpo:function() {
        if (this.data.goodsTabList.length < 1 || !this.data.showGoodsListWrapper) {
            return;
        }
        let self = this;
        this.destroyGoodsFilterTabExpo(0);
        this._observer0 = wx.createIntersectionObserver(this,{thresholds:[0.5],initialRatio:0.5,observeAll:true})
        this._observer0
        .relativeTo('.filter-view')
        .observe('.filter-item', (res) => {
            if (res?.intersectionRatio > 0.5) {//出现
              LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_goodstab_show',{
                    position:res?.dataset?.position
                });
            }
        })
    },
    // 货架banner曝光
    handleGoodsFilterBannerExpo:function(){
      // this.destroyGoodsFilterBannerExpo();
      this.destroyGoodsFilterTabExpo(3);
      let child = this.selectComponent('#shelves_banenr');
      if(child){
        this._observer3 = wx.createIntersectionObserver(child,{
          thresholds:[0.5],initialRatio:0.5,observeAll:true})
        this._observer3.relativeTo('.filter-view-banner')
        .observe('.filter-view-item', (res) => {
            if (res.intersectionRatio > 0.5) {//出现
                if(this.data.hasClickSearchIcon){ // 搜索结果
                  LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_searchresult_show', {
                    goodID: res.dataset.item.goodsId,
                    index: res.dataset.item.index,
                });
                }else{
                  LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_shelfcard_show', {
                    cardID: res.dataset.item.goodsId,
                    cardorder: res.dataset.item.index,
                });
                }
               
            }
        })
      }
    },

    showShopWrapper: function(){
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodslist_click');

       LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_search_show');
  
         this.setData({
          showGoodsListWrapper: true,
         },()=>{
            // 没有打开过 请求一下
          if(!this.hasClickShopWrapperIcon){
            this.triggerEvent("reFreshGoodsList")
          }
          this.hasClickShopWrapperIcon = true;
         })
        setTimeout(() => {
            // 货架列表的方法
            // this.selectComponent('.goods-list')?.handleGoodsListExpo(); // 货架的商品卡片的曝光
            this.handleGoodsFilterTabExpo(); // 货架的tab 曝光
            this.handleGoodsFilterBannerExpo(); //货架的banner 曝光
        },2000)
   
      
    },

    hideShopWraper:function(){
      this.setData({
        showGoodsListWrapper:false,
        needFocus:false
      })
		},
		goJump:function(e){
			let jumpUrl = e?.currentTarget?.dataset?.url;
			let type = e?.currentTarget?.dataset?.type;
			if(type == 'coupon'){
				LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_coupon');
				if (!cwx.user.isLogin()) {
					this.currentPage.toLogin();
			  }else{
				 common.jumpToDetail(jumpUrl);
			  }
			}else{
				LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_shop');
				common.jumpToDetail(jumpUrl);
			}
		
      
		}

  }
})
