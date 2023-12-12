
import { filterProps } from "./../../utils/api.js"
import { cwx, __global } from "./../../../../../../../cwx/cwx.js";

const behavior = require('./../../utils/behavior');
const isArray = (arg) => {
  if (typeof arg === 'object') {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
  return false;
}

let timer;
Component({
  behaviors: [behavior],
  externalClasses: ["custom_scene_class"],
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true
  },
  properties: {
    // 商品详情
    item: {
      type: Object,
      value: {}
    },
    // 商品下标
    index: {
      type: String,
      value: 0
    },
    parentIndex: {
      type: String,
      value: 0
    },
    type: {
      type: String,
      value: "simple"
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
    // 商卡的组件信息
    sceneFormSceneComponentList: {
      type: Object,
      value: null,
    },
    // 乐高接收到的props信息
    renderData: {
      type: Object,
      value: {},
    },
    // renderData的集合
    renderDataList: {
      type: Array,
      value: [],
    },
    // sceneCode的具体
    selfApiInfo: {
      type: Object,
    },
    incrementalUpdateProduct: {
      type: Object
    },
    isLastComponent: {
      type: Boolean,
      value: false
    },
    filterProductProps: {
      type: Object
    }
  },

  data: {
    sceneBoxStyle: null,
    sceneBoxContent: null,
    sceneAllInfo: null,

    listData: [{
      itemIndex: 0,
      isDisplay: true,
      itemList: []
    }],
    itemIndex: 1,
    itemHeight: 4520,       // 每一行的高度，单位为rpx
    itemPxHeight: '',       // 转化为px高度
    aboveShowIndex: 0,      // 展示区域的上部的Index
    belowShowNum: 0,        // 显示区域下方隐藏的条数
    oldSrollTop: 0,
    prepareNum: 5,
    throttleTime: 200,
    exposureStatus: 0,      // 是否曝光
    // toAskQuestions: false,  // 当前货架单品的直播状态
    showLogInfo: true,      // 曝光提问按钮
    saleStatus: 1,
  },

  observers: {
    'incrementalUpdateProduct': function (val) {
      if (val && Object.keys(val).length) {
        if (val && val.index == this.properties.renderData.position) {
          const { renderDataList, idx } = this.properties;
          let currRenderData = renderDataList[idx]
          currRenderData[val["updateType"]] = 3;
          this.updateRender(currRenderData)
        }
      }
    },
  },

  lifetimes: {
    async attached() {
      if (!this.data.sceneBoxContent) {
        this.init();
      }
    },
    detached() {
      clearTimeout(timer);
      try {
        if (this._chunkIntersectionObserver) this._chunkIntersectionObserver.disconnect();
      } catch (error) {
        console.log(error);
      }
      this._chunkIntersectionObserver = null;
    }
  },

  observers: {
    'renderData': function (val) {
      if (this.data.sceneBoxContent && val) {
        this.update();
      }
    }
  },

  /** 组件的方法列表 */
  methods: {


    async init() {
      const { item } = this.properties;
      // console.log('货架商品数据', item)
      // const { toAskQuestions = false } = item;
      this.setData({
        saleStatus: item.saleStatus
      })
    },

    async update() {
      const { sceneFormSceneComponentList, renderData, renderDataList, idx, item } = this.properties;
      // console.log('货架商品更新了数据', item)
      this.setData({
        saleStatus: item.saleStatus,
        sceneBoxContent: this.filterSceneBoxContent(sceneFormSceneComponentList, filterProps(renderDataList[idx]))
      })
    },

    updateRender(curr) {
      const { sceneFormSceneComponentList, idx, item } = this.properties;
      // console.log('货架商品更新了数据', item)
      this.setData({
        saleStatus: item.saleStatus,
        sceneBoxContent: this.filterSceneBoxContent(sceneFormSceneComponentList, filterProps(curr))
      })
    },

    /** 刷新讲解状态 */
    refreshStatus(event) {
      const { parentIndex } = this.properties;
      const { item, index } = event.currentTarget.dataset;
      const originVal = item.originVal ? {...item.originVal} : {...item}
      try {
        if (item?.explainStatus && item.explainStatus == 1) {
          // console.log('点击触发求讲解', item)
          const detail = {
            component: {
              name: "diyField_explainStatus"
            },
            product: {
              ...originVal,
              position: Number(index) + Number(parentIndex) * 20
            },
          }
          this.triggerEvent("clickHandlers", detail);
          wx.setStorageSync('refreshSkStatus', "1")
        }
      } catch (error) { }
    },

    /** 自定义点击 */
    customClickHandle(event) {
      try {
        const { item } = event.currentTarget.dataset;
        const detail = {
          component: {
            name: "clickHandlers"
          },
          product: item,
        }
        console.log('点击了', detail)
        this.triggerEvent("clickHandlers", detail);
      } catch (error) { }
    },

    /** 宿主组件回调 */
    returnComponent(clickhandlersname, options) {
      try {
        const { renderDataList, idx, item } = this.properties;
        if (!clickhandlersname) return;
        if (clickhandlersname) {
          const currRenderData = renderDataList[idx]
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
      } catch (error) {  }
    },

    /** 获取商卡的属性 */
    async getCompInfo() {
  
    },

    /** 遍历商业卡片的内容 */
    filterSceneBoxContent(domlist, selfRender) {
      if (!selfRender || Object.keys(selfRender).length == 0) return;
      if (!isArray(domlist)) domlist = [domlist];
      const that = this;
      const customdata = selfRender;
      const typeList = ["box", "column", "container", "inline", "row"];
      domlist.forEach((item, index) => {
        const propsStyle = typeof item.props == "string" ? JSON.parse(item.props) : item.props;
        item.props = propsStyle;
        item.styles = that.filterSceneBoxStyles(propsStyle.styles);

        delete item.props.rnStyles
        delete item.props.rnSubStyles

        // 容器组件
        if (typeList.includes(item.type)) {
          if (item.type == "row") {
            item.renderDataOrgin = selfRender
          }
          function uniqueObj(list, listParents) {
            if ((list && !list.length) || !list) return;

            list.forEach(comp => {
              if (comp && comp.componentData.props) {
                // 删除不需要的东西
                delete comp.componentData.props.rnStyles
                delete comp.componentData.props.rnSubStyles
              }
              comp.wrapStyle = "";

              if (comp.width && comp.width != "auto") {
                comp.wrapStyle += `width:${comp.width};`
                comp.componentData.props["width"] = comp.width;

                const res = wx.getSystemInfoSync()
                if (res) {
                  if (comp && comp.width && comp.componentData.props.values.value == '产品画布左侧') {
                    const res = wx.getSystemInfoSync()
                    const isIphone = res.model.indexOf("iPhone") > -1 ? true : false
                    if (isIphone) {
                      comp.wrapStyle += `min-width:${comp.width};`
                    }
                  }
                }
              }
              if (comp.flex) {
                comp.wrapStyle += `flex: ${comp.flex};`
                comp.componentData.props["flex"] = comp.flex;
              }
              const currTagElement = comp.componentData.props;

              if (currTagElement.values.name) {
                currTagElement.values.typeName = currTagElement.values.name.substring(9, currTagElement.values.name.length);
              }
              if (currTagElement.values) {
                if (currTagElement.values.name) {
                  if (customdata.hasOwnProperty(currTagElement.values.typeName)) {

                    currTagElement.values.value = customdata[currTagElement.values.typeName];
                    if (currTagElement.values.name == "diyField_name") {

                    }
                    if (currTagElement.values.name == "diyField_imageUrl") {

                    }
                    if (currTagElement.values.name == "diyField_recommendStatus") {

                    }
                    if (currTagElement.values.name == "diyField_customerTags") {



                    }
                    if (currTagElement.values.name == "diyField_price") {

                    }

                    if (currTagElement.values.name == "diyField_liveStatus") {

                    }
                  } else {
                    // 定义了特殊字段，但是外部没有传递
                    currTagElement.values.value = ``;
                    if (typeof currTagElement.styles !== "string") {
                      currTagElement.styles["display"] = "none";
                    }
                  }
                } else {
                  // 产品画布直接产生的数据，非外部传递
                }
              }
              if (comp.componentData.type == 'container') {
                currTagElement.styles = that.filterSceneBoxStyles(currTagElement.styles, true, currTagElement);

              } else {
                currTagElement.styles = that.filterSceneBoxStyles(currTagElement.styles, false, currTagElement);
              }

              if (typeList.includes(item.type)) {
                if (list && list.length) {
                  listParents.childNodeTypeList = [];
                  listParents.childNodeTypeLen = 0;

                  list.forEach(comp => {
                    if (comp.componentData.props.values.typeName) {
                      listParents.childNodeTypeList.push(comp.componentData.props.values.typeName)
                    }
                    if (comp && comp.componentData.type == "label" && comp.componentData.props.values.typeName == "explainStatus") {

                      listParents.childNodeType = comp.componentData.props.values.typeName
                      listParents.childNodeValue = customdata.explainStatus || 0;
                      if (selfRender && (selfRender.saleStatus == 3 || selfRender.saleStatus == 4)) {

                        comp.componentData.props.styles += ";display: none !important;"
                      }
                    }

                    if (comp && comp.componentData.type == "row" && comp.componentData.props.values.value == "货架标签列表") {
                      const tagsChilds = comp.componentData.props.values.rowData;

                      comp.componentData.childNodeTypeLen = 0
                      tagsChilds.forEach(tagChild => {
                        tagChild.componentData.props.values.value = selfRender[tagChild.componentData.props.values.typeName]
                        if (tagChild.componentData.props.values.value && selfRender[tagChild.componentData.props.values.typeName]) {
                          comp.componentData.childNodeTypeLen += 1;
                        }
                      })

                    }
                  })

                  if (listParents.childNodeTypeList.includes("name")) {
                    if (listParents.childNodeTypeList.includes("activityTag")) {
                      listParents.wordWrapTwo = "0";
                      if (listParents.componentData.props.values.rowData.length) {
                        listParents.componentData.props.values.rowData.forEach(tagComp => {
                          tagComp.componentData.props.values.wordWrapTwo = "0";
                        })
                      }
                    } else {
                      listParents.wordWrapTwo = "2";
                      if (listParents.componentData.props.values.rowData.length) {
                        listParents.componentData.props.values.rowData.forEach(tagComp => {
                          tagComp.componentData.props.values.wordWrapTwo = "2";
                        })
                      }
                    }

                  }

                  if (listParents.childNodeTypeList.some(i => i == "rankTag")) {
                    const tagsChilds = listParents.componentData.props.values.rowData;
                    tagsChilds.forEach(tagChild => {

                      if (customdata.hasOwnProperty(tagChild.componentData.props.values.typeName)) {
                        listParents.childNodeTypeLen += 1;
                      }
                    })
                    if (listParents.childNodeTypeLen == 0 && listParents.childNodeTypeList.length > 1) {

                    }
                  }
                  // 一排里面只有1个标签数值传递，不展示左侧的|
                  if (listParents.childNodeTypeLen === 1) {
                    const tagsChilds = listParents.componentData.props.values.rowData;
                    tagsChilds.forEach(tagChild => {
                      tagChild.componentData.props.values.isShowVerticalLine = false;
                    })
                  }

                } else {
                  // 
                }
              } else {
                // console.log('%c 当前组件是容器组件且没有子组件', 'color: red', item,  '它的子组件是', list, '接口传递过来的数据')
              }
              uniqueObj(comp.componentData.props.values.rowData, comp)
            })
          }
          uniqueObj(item.props.values.rowData, item)
        }
      })
      return domlist;
    },

    /** 点击提问，触发回调 */
    handleLiveAskMessage(event) {
      try {
        const { item, parentIndex, renderData } = this.properties;
        const { index } = event.currentTarget.dataset;
        const originVal = item.originVal ? {...item.originVal} : {...item}
        const detail = {
          component: {
            name: "diyField_toAskQuestions"
          },
          product: {
            ...originVal,
            position: Number(index) + Number(parentIndex) * 20
          },
        }
        // console.log('触发提问回调 detail', detail)
        this.triggerEvent("clickHandlers", detail);
      } catch (error) { }
    },

    /** 直播live的埋点方式 */
    sendUbtTrace(key = '', data = {}) {
      // const pages = getCurrentPages();
      // let currentPage = pages?.find(page=>page.route.includes('pages/live/webcast/home'));
      // if (!currentPage) {
      //   return;
      // }
      // let liveID = currentPage.liveID + '';
      // let liveStatusText = currentPage.liveStatusText;
      // let master = currentPage.data.master || {};
      // let liveInfo = currentPage.data.liveInfo || {};
      // let innersource = currentPage.innersource;
      // let source = currentPage.source;
      // let logExt = currentPage.logExt;
      // let params = {
      //   liveID: liveID,
      //   liveState: liveStatusText,
      //   source: source + '',
      //   innersource: innersource + '',
      //   poiid: master?.poiID,
      //   districtid: master?.districtID,
      //   liveType: liveInfo?.isPrivate ? '1' : '0',
      //   recomStrategy: '', 
      //   ext: '',
      //   replayType: '',  
      //   note: '',
      // }
      // if (logExt && logExt.length > 0) {
      //   params = Object.assign({}, params, JSON.parse(logExt) || {});
      // }
      // if (__global.env !== 'prd') {
      //   console.log('%c[live accounts ubtTrace]', 'color: forestgreen;font-weight: bold', params);
      // }
      // cwx.sendUbtByPage.ubtTrace(key, Object.assign(params, data));
    },

    /** 上传提问按钮的曝光 */
    handleAskMessageTrace() {
      // const { item } = this.properties;
      // const originVal = item.originVal ? {...item.originVal} : {...item}
      // this.sendUbtTrace('o_gs_tripshoot_lvpailive_goodsask_show', {
      //   product: originVal,
      // });
    },

    /** 曝光按钮-提问 */
    startObserverChunk: function startObserverChunk() {
      // const _this2 = this;
      // try {
      //   this._chunkIntersectionObserver = this.createIntersectionObserver();
      //   this._chunkIntersectionObserver.relativeToViewport().observe('.ask_message', (res) => {
      //     var intersectionRatio = res.intersectionRatio;
      //     if (intersectionRatio === 0) {
      //       // if (_this2.data.showLogInfo) console.log('【卸载】', '提问按钮 从页面卸载');
            
      //     } else {
      //       // if (_this2.data.showLogInfo) console.log('【进入】', '提问按钮 渲染进页面');
      //       _this2.handleAskMessageTrace()
      //     }
      //   });
      // } catch (error) {
      //   console.log(error);
      // }
    }

  }
})