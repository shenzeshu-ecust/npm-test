import { apiServer, filterProps } from "./utils/api"
import { cwx, _ } from './../../../../../cwx/cwx'
const behavior = require('./utils/behavior');
const isArray = (arg) => {
  if (typeof arg === 'object') {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
  return false;
}

Component({
  behaviors: [behavior],
  externalClasses: ["list_scene_box", "custom_scene_class"],
  options: {
    multipleSlots: true
  },
  properties: {
    // 预加载
    preData: {
      type: Array,
      value: [],
    },
    // 渲染类型
    type: {
      type: String,
      value: "simple",
    },
    // 商卡的下标
    idx: {
      type: Number,
      value: 0
    },
    // 商卡的版本
    sceneCode: {
      type: String,
      value: "",
    },
    // 商卡的场景信息
    sceneFormFieldInfos: {
      type: Object,
      value: null
    },
    // 商卡的组件信息
    sceneFormSceneComponentList: {
      type: Object,
      value: null
    },
    // renderData的集合
    renderDataList: {
      type: Array,
      value: [],
    },
    // 乐高接收到的props信息
    renderData: {
      type: Object,
      value: {},
    },
    // 乐高接收到的props信息(历史兼容)
    profile: {
      type: Object,
      value: {}
    },
    // 接收到的自定义方法
    customMethods: {
      type: Array,
      value: []
    },
    // 增量更新的产品
    incrementalUpdateProduct: {
      type: Object
    },
    // 列表更新的类型 update 是增量刷新，refresh是重载
    updateType: {
      type: String,
      value: "update"
    }
  },

  data: {
    sceneBoxStyle: null,
    sceneBoxContent: null,
    sceneAllInfo: null,
    selfApiInfo: null,
    showItems: 200,
    showPage: true,
    showLoading: false,
    prevRenderList: [],
    renderDataListSuccess: [],
    renderDataListSuccessLen: 30,
    incrementalUpdateProduct: {},
    simpleComponentWidth: "432rpx",
    pushSceneInfo: null,
    explainIng: [],
    showLoadingMore: true,
    listProduct: [],
    filterProductProps: null,
    afterRenderData: null,
  },

  observers: {
    'renderDataList': function (val) {
      if (val && val.length) {
        // 单个组件本身不除了内容，其他不去 set ，全部由 容器来set;
        // 20230615手动将所有传递过来的position重置一下
        // val.forEach((item, index) => {
        //   item.position = index
        // })
        // console.log('%c外部传递过来的数据', 'color: red', val)
        this.incrementalUpdate(val)
      }
    },
    'renderData': function (val) {
      console.log('接口原始返回值', val)
      if (val) {
        this.init()
      }
    }
  },

  lifetimes: {
    async attached() {
      cwx.Observer.addObserverForKey('live_sk_component_handleScrollLower', () => {
        this.transferSkComponent()
      });
      wx.removeStorageSync('refreshSkStatus')
      this.init()
    },
    detached() {
      cwx.Observer.removeObserverForKey(`scene_${this.properties.sceneCode}_sceneAllInfo`);
    },
  },

  methods: {
    transferSkComponent() {
      this.loadMore()
    },
    handleScrollLower() {
      this.loadMore()
    },
    loadMore() {
      const { renderDataList } = this.properties;
      const { listProduct } = this.data;
      // console.log('刷新组件页面', listProduct)

      let allList = 0;
      listProduct.forEach(item => {
        allList += item.length
      })
      // console.log('当前已经渲染得总数量', allList)
      if (allList >= renderDataList.length) return;
      let startIndex = renderDataList.length <= 20 ? 0 : 20 * this.data.listProduct.length;
      let endIndex = renderDataList.length <= 20 ? 20 : 20 * (this.data.listProduct.length + 1);
      let demoList = this.getList(20, startIndex, endIndex)
      demoList.forEach(item => {
        item = this.filterProductAttr(item)
      })
      // console.log('%c正在更新的列表', 'color: red', startIndex, endIndex, demoList)
      this.setData({
        [`listProduct[${this.data.listProduct.length}]`]: demoList
      })
    },
    getList(num, startIndex, endIndex) {
      const { renderDataList } = this.properties;
      if (startIndex > renderDataList.length) startIndex = renderDataList.length - 1;
      if (endIndex > renderDataList.length) endIndex = renderDataList.length;
      if (startIndex == endIndex) return []
      const list = []
      for (let i = startIndex; i < endIndex; i++) {
        if (renderDataList[i]) {
          list.push(renderDataList[i])
        }
      }
      return list
    },

    simpleCssStyle(event) {
      if (event.detail) {
        this.setData({
          simpleComponentWidth: event.detail
        })
      }
    },

    incrementalUpdate() {
      const refreshStorageValue = wx.getStorageSync('refreshSkStatus');
      const { updateType, renderDataList } = this.properties;
      const { listProduct } = this.data;
      // 求讲解
      if (updateType === "update") {
        let newListProduct = listProduct.map((item, index) => {
          let obj = []
          if (item) {
            obj = renderDataList.slice(20 * index, 20 * (index + 1))
            obj.forEach(i => {
              i = this.filterProductAttr(i)
            })
          }
          return obj
        })
        this.setData({
          listProduct: newListProduct
        })
        wx.removeStorageSync('refreshSkStatus')
      }
      // 刷新tab
      if (!listProduct.length || updateType === "refresh") {
        if (!refreshStorageValue) {
          // 触发的点击切换讲解状态
          this.setData({
            listProduct: []
          }, () => {
            this.loadMore()
          })
        } else {
          // 正常切换tab
          let newListProduct = listProduct.map((item, index) => {
            let obj = []
            if (item) {
              obj = renderDataList.slice(20 * index, 20 * (index + 1))
              obj.forEach(i => {
                i = this.filterProductAttr(i)
              })
            }
            return obj
          })
          this.setData({
            listProduct: newListProduct
          })
          wx.removeStorageSync('refreshSkStatus')
        }
      }
    },

    bottomTouchMove() {
      return false
    },


    async init() {
      const { type, sceneCode, renderDataList, renderData } = this.properties;
      if (!type || type == "simple") {
        this.setData({
          pushSceneInfo: null
        }, async () => {
          const selfApiInfo = await this.getSceneCode(sceneCode);
          const pushSceneInfo = await this.getSceneCode(this.properties.sceneCode)
          const originVal = {...renderData};
          this.setData({
            pushSceneInfo: pushSceneInfo,
            selfApiInfo: selfApiInfo,
            afterRenderData: originVal,
          })
        })
      }
      if (type == "list") {
        const selfApiInfo = await this.getSceneCode(sceneCode);
        this.setData({
          selfApiInfo: selfApiInfo
        })
        try {
          const currItem = renderDataList[0]
          const filterProductProps = this.filterSceneBoxContent(selfApiInfo.formSceneComponentList, filterProps(currItem)) || {}
          const filterNodeTag = {}
          Object.keys(filterProductProps).forEach(key => {
            const item = {}
            const currNode = filterProductProps[key];
            Object.keys(currNode).forEach(nodeKey => {
              if (["background-color", "background-image", "background-size", "border-radius", "color", "font-size", "font-weight", "margin-bottom", "margin-top", "margin-left", "margin-right", "padding", "text-align", "white-space"].includes(nodeKey)) {
                item[nodeKey] = currNode[nodeKey]
              }
            })
            if (item && Object.keys(item)) {
              filterNodeTag[key] = item;
            }
          })
          const resultFilterNode = {}
          Object.keys(filterNodeTag).forEach(item => {
            resultFilterNode[item] = ""
            Object.keys(filterNodeTag[item]).forEach(itemKey => {
              if (itemKey && filterNodeTag[item][itemKey]) {
                resultFilterNode[item] += `${itemKey}: ${filterNodeTag[item][itemKey]};`
              }
            })
          })
          // console.log('当前组件接收到的值  过滤后的对象属性是', resultFilterNode)
          this.setData({
            filterProductProps: resultFilterNode
          })
        } catch (error) { }
        // console.log('首页接口请求乐高接口 2 :', this.data.selfApiInfo)
      }
    },

    // showProduct(event) {
    //   const { type, renderDataList } = this.properties;
    //   const { showPage, showLoading, showItems } = this.data;
    //   const currPageNo = event.detail;
    //   if (showPage && showLoading && currPageNo >= ((type == "simple" || renderDataList.length < 5) ? 0 : 3)) {
    //     this.setData({
    //       showLoading: false
    //     })
    //   }
    //   if (showItems < renderDataList.length) {
    //     if (showItems - currPageNo < 4 && ((currPageNo + 3) >= this.data.showItems)) {
    //       this.setData({
    //         showItems: currPageNo + 100,
    //       })
    //     }
    //   } else {
    //     this.setData({
    //       showItems: this.properties.renderDataList.length
    //     })
    //   }
    // },

    // exposureCompTrace(event) {
    //   const currPageNo = event.detail;
    //   const { renderDataList } = this.properties;
    //   try {
    //     const triggerEventTrace = {
    //       id: renderDataList[currPageNo].id,
    //       goodsId: renderDataList[currPageNo].goodsId,
    //       index: renderDataList[currPageNo].index,
    //       name: renderDataList[currPageNo].name,
    //     }
    //     this.triggerEvent("exposureTrace", triggerEventTrace);
    //   } catch (error) {
    //     console.log('BU传递过来的商品数据有误，不上报UBT')
    //   }
    // },

    // showProductOver(event) {
    //   let { renderDataListSuccessLen, renderDataListSuccess } = this.data;
    //   let currPageNo = event.detail, explainIng = [];
    //   if (currPageNo < renderDataListSuccessLen ? true : false) return;

    //   let observer = this.createIntersectionObserver();
    //   observer.relativeToViewport().observe(`.list_scene_box_${currPageNo}`, (res) => {
    //     if (res.intersectionRatio > 0) {
    //       if (renderDataListSuccessLen > currPageNo) return;
    //       if (renderDataListSuccess.length >= this.properties.renderDataList.length) return;
    //       let currNewPageNo = currPageNo + 30;
    //       let renderDataListSuccessNew = [...this.properties.renderDataList]
    //       if (currNewPageNo >= this.properties.renderDataList.length) {
    //         currNewPageNo = this.properties.renderDataList.length
    //       }
    //       renderDataListSuccessNew.length = currNewPageNo;
    //       if (currNewPageNo > this.data.renderDataListSuccessLen) {
    //         renderDataListSuccessNew.forEach((item, index) => {
    //           item.keyId = `${item.id + '' + item.position}`
    //         });
    //         if (renderDataListSuccessNew.length && renderDataListSuccessNew[0].explainStatus === 2) {
    //           explainIng = [renderDataListSuccessNew[0]]
    //         }
    //         this.setData({
    //           renderDataListSuccess: renderDataListSuccessNew,
    //           renderDataListSuccessLen: currNewPageNo,
    //           explainIng: explainIng
    //         })
    //       }
    //     }
    //   })
    // },

    async getSceneCode(sceneCode) {
      const sceneAllInfo = await apiServer("batchQueryFormSceneInfo", { "sceneCodeList": [sceneCode], "versionType": 0 });
      return sceneAllInfo.formInfoObjectList[0]
    },

    clickHandlers(options) {
      try {
        if (this.properties.type == "list") {
          const detail = options.detail;
          if (!detail || (detail && !detail.product)) return;

          this.triggerEvent("clickHandlers", detail);
          wx.removeStorageSync('currModuleName')
          wx.removeStorageSync('currModule')
        } else {
          if (options && options.type !== "tap") return;
          const detail = {
            component: options.currentTarget.dataset,
            product: this.properties.renderData,
          }
          this.triggerEvent("clickHandlers", detail);
          wx.removeStorageSync('currModuleName')
          wx.removeStorageSync('currModule')

        }
      } catch (error) { }
    },

    // clickHandlersSimple(options) {
    //   try {
    //     const detail = options.detail;
    //     this.triggerEvent("clickHandlers", detail);
    //     wx.removeStorageSync('currModuleName')
    //     wx.removeStorageSync('currModule')
    //   } catch (error) {  }
    // },

    /** 宿主组件回调 */
    returnComponent(clickhandlersname, options) {
      const { renderData, renderDataList, idx } = this.properties;
      if (!clickhandlersname) return;

      try {
        if (clickhandlersname) {
          const currRenderData = Object.keys(renderData).length ? renderData : renderDataList[idx];
          const detail = clickhandlersname == "empty" ? {
            component: {
              name: "空白",
              notice: "",
              typeName: "",
              uuid: "",
              value: "",
            },
            product: currRenderData,
          } : {
              component: options.props.values,
              product: currRenderData,
            }
          this.triggerEvent("clickHandlers", detail);
          wx.removeStorageSync('currModuleName')
          wx.removeStorageSync('currModule')
        }
      } catch (error) { }
    },

    /** 商卡组件的属性判断 */
    filterProductAttr(item) {
      if (!item || (item && !item.goodsId)) return {};
      /** 新增一个历史数据 */
      item.originVal = {...item};

      function disableShopCard(card) {
        if (card.saleStatus == 2 || card.saleStatus == 3 || card.saleStatus == 4) {
          return true
        }
        return false;
      }

      function isBigCard(card, height = 20) {
        if (height < 20 && !card.reducedPrice && !card.discount) {
          return false
        }
        if (scoreBigThan45(card)) {
          return true;
        } else {
          if (hasRankInfo(card)) {
            return true;
          }
          if (hasTagInfo(card)) {
            return true;
          }
          return false;
        }
      }

      function titleLineNum(card) {
        if (isBigCard(card)) {
          return 2;
        }
        if (card.reducedPrice || card.discount) {
          return 1;
        } else {
          return 2;
        }
      }

      function priceText(card, source) {
        if (!card.fromPrice || !card.fromPrice.price) {
          return '';
        }
        if (card.priceType == 1) {
          return pointHandler(card.fromPrice.price, source);
        } else if (card.priceType == 2) {
          if (priceLength(card.fromPrice.price, source)) {
            return pointHandler(card.fromPrice.price, source);
          }
          return pointHandler(card.fromPrice.price, source) + (card.toPrice.price ? '-' + pointHandler(card.toPrice.price, source) : '');
        } else if (card.priceType == 3) {
          return pointHandler(card.fromPrice.price, source);
        }
        return ''
      }

      function pointHandler(num = '', source) {
        return num;
      }
      function priceLength(price, source) {
        if (source == 'push_shop_card') {
          let p = price + '';
          if (p.length >= 6) {
            return true;
          }
        }
        return false;
      }

      function scoreBigThan45(card) {
        return card && card.score && parseFloat(card.score) > 0;
      }

      function hasRankInfo(card) {
        return card && card.rankTag && card.rankTag.length > 0;
      }

      function commentNumBigThan200(card) {
        return card && card.commentNum && card.commentNum > 200;
      }

      function hasTagInfo(card) {
        return card && card.customerTags && card.customerTags.length > 0;
      }

      function saleStatusText(card) {
        if (card.saleStatus == 2) {
          // return '- 待开抢 -'
        }
        if (card.saleStatus == 3) {
          return '- 已抢光 -'
        }
        if (card.saleStatus == 4) {
          return '- 已下架 -'
        }
        return '';
      }

      function handleMarketPrice(val) {
        // 折扣价格
        if (val["marketPrice"] && val["price"]) {
          const processedPrice = Number(val["price"]);
          const processedMarketPrice = Number(val["marketPrice"]);
          let discount, reduction;
          try {
            if (processedPrice === 0 || processedMarketPrice === 0 || processedMarketPrice === processedPrice) {
              val["discount"] = {
                "showMarketPrice": false,
                "count": ""
              }
              // console.log('没有折扣', val)
            } else {
              if (val["discount"]) {
                discount = (Math.ceil((processedPrice / processedMarketPrice) * 100) / 10).toFixed(1);
                if (discount === '0.0' || discount.includes('-')) {
                  val["discount"] = {
                    "showMarketPrice": false,
                    "count": discount
                  }
                } else {
                  val["discount"] = {
                    "showMarketPrice": true,
                    "count": discount
                  }
                  // console.log('有折扣', val)
                }
              } else {
                discount = (Math.ceil((processedPrice / processedMarketPrice) * 100) / 10).toFixed(1);
                if (discount === '0.0' || discount.includes('-')) {
                  showMarketPrice = false;
                  val["marketPrice"] = ""
                }
                if (discount > 9.0) {
                  val["discount"] = {
                    "showMarketPrice": false,
                    "count": ""
                  }
                } else {
                  val["discount"] = {
                    "showMarketPrice": true,
                    "count": discount
                  }
                }
                reduction = (processedMarketPrice - processedPrice).toFixed(0);
                if (reduction === '0' || reduction.includes('-')) {
                  val["reduction"] = {
                    "showMarketPrice": false,
                    "count": ""
                  }
                } else {
                  val["reduction"] = {
                    "showMarketPrice": true,
                    "count": reduction
                  }
                }
              }
            }

          } catch (error) {
            // console.log('报错了', error)
            return val
          }
          return val
        } else {
          return val
        }
      }

      function fixProductPriceText(val) {
        if(val && val.priceText == "" && !val.price) {
          if (val.originVal && !val.originVal.price && val.originVal.priceText) {
            val.priceText = val.originVal.priceText
            return val
          }
        }
        return val
      }

      item = handleMarketPrice(item)
      item.titleLineNum = titleLineNum(item);
      item.priceText = priceText(item, "push_shop_card");
      item.scoreBigThan45 = scoreBigThan45(item);
      item.hasRankInfo = hasRankInfo(item);
      item.commentNumBigThan200 = commentNumBigThan200(item);
      item.hasTagInfo = hasTagInfo(item);
      item.saleStatusText = saleStatusText(item) || "";
      item.disableShopCard = disableShopCard(item);
      item = fixProductPriceText(item);
      
      return item
    },

    /** 遍历商业卡片的内容 */
    filterSceneBoxContent(domlist, selfRender) {
      try {
        if (!selfRender || Object.keys(selfRender).length == 0) return;
        if (!isArray(domlist)) domlist = [domlist];
        let tags = {};
        const that = this;
        const typeList = ["box", "column", "container", "inline", "row"];
        domlist.forEach((item, index) => {
          const propsStyle = typeof item.props == "string" ? JSON.parse(item.props) : item.props;
          item.props = propsStyle;
          item.styles = that.filterSceneBoxStyles(propsStyle.styles);
          delete item.props.rnStyles
          delete item.props.rnSubStyles
          if (typeList.includes(item.type)) {
            function uniqueObj(list, listParents) {
              if ((list && !list.length) || !list) return;
              list.forEach(comp => {
                if (comp && comp.componentData.props) {
                  delete comp.componentData.props.rnStyles
                  delete comp.componentData.props.rnSubStyles
                }
                if (comp.width && comp.width != "auto") {
                  comp.wrapStyle += `width:${comp.width};`
                  comp.componentData.props["width"] = comp.width;
                }
                if (comp.flex) {
                  comp.wrapStyle += `flex: ${comp.flex};`
                  comp.componentData.props["flex"] = comp.flex;
                }
                const currTagElement = comp.componentData.props;
                if (currTagElement.values.name) {
                  currTagElement.values.typeName = currTagElement.values.name.substring(9, currTagElement.values.name.length);
                  tags[currTagElement.values.typeName] = currTagElement.styles
                }
                if (!currTagElement.values.name && currTagElement.values.value) {
                  tags[currTagElement.values.value] = currTagElement.styles
                }
                uniqueObj(comp.componentData.props.values.rowData, comp)
              })
            }
            uniqueObj(item.props.values.rowData, item)
          }
        })
        return tags
      } catch (error) {
        return false
      }

    },

    /** 货架商品组件曝光 */
    productExposure(event) {
      const { id, goodsId, index, name } = event.detail;
      if (id) {
        const triggerEventTrace = { id, goodsId, index, name }
        this.triggerEvent("exposureTrace", triggerEventTrace);
      }
    }

  }
})
