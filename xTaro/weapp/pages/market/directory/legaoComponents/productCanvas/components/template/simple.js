import {
  apiServer,
  filterSimpleProps
} from "./../../utils/api"
import {
  cwx,
  _
} from './../../../../../../../cwx/cwx'
let timer;
let mPage, pageId = "";
const behavior = require('./../../utils/behavior');
const isArray = (arg) => {
  if (typeof arg === 'object') {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }
  return false;
}

Component({
  behaviors: [behavior],
  externalClasses: ["custom_scene_class"],
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true
  },
  properties: {
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
    // 乐高信息
    sceneAllInfo: {
      type: Object,
    },
    // 乐高接收到的props信息
    renderData: {
      type: Object,
      value: {},
    },
    // sceneCode的具体
    selfApiInfo: {
      type: Object,
    },
    pushSceneInfo: {
      type: Object
    }
  },

  data: {
    sceneBoxStyle: null,
    sceneBoxContent: null, // 当前场景值的内容
    originVal: null, // 原始数据
    currVal: null, // 现在的数据
  },


  pageLifetimes: {
    show() {
      mPage = cwx.getCurrentPage();
      pageId = mPage ? (mPage.pageid || mPage.pageId || '') : '';
    },
  },


  lifetimes: {
    async attached() {

    },
    detached() {
      clearTimeout(timer);
    },
  },

  observers: {
    'renderData': function (val) {
      if (val && Object.keys(val).length) {
        this.changFormData(val)
      }
    },
  },

  /** 组件的方法列表 */
  methods: {
    /** 现在的数据 */
    changFormData(start, end) {
      const curr = {
        ...start
      }
      this.setData({
        originVal: curr
      }, () => {
        this.init(filterSimpleProps(start, this.data.originVal, "simple"));
      })
    },
    /** 埋点 */
    logTrace(actioncode, actionMsg, content = "") {
      try {
        // console.log('%c 看看直播推送接口都传过来了什么数据 上报', 'color: skyblue', content)
        mPage && mPage.ubtTrace && mPage.ubtTrace(201002, {
          keyName: "mkt_2021Activity",
          activityName: "直播商卡",
          actioncode: actioncode || '',
          actionMsg: actionMsg || '',
          pageId: pageId || '',
          openId: cwx.cwx_mkt.openid || '',
          content: content || '',
        });
      } catch (error) {
        console.log('埋点报错', error)
      }
    },
    async init(val) {
      this.getCompInfo(val)
      // this.timer = setTimeout(() => {
      //   console.log('重新刷新推送商卡，防止字段展示有误')
      //   this.getCompInfo(val)
      // }, 3000)
      this.logTrace('init', '初始化推送商卡的数据', val || "")
    },

    /** 宿主组件回调 */
    returnComponent(clickhandlersname, options) {
      const {
        renderData
      } = this.properties;
      if (!clickhandlersname) {
        return
      };
      if (clickhandlersname) {
        const currRenderData = renderData
        const detail = {
          component: options.props.values,
          product: currRenderData,
        }
        this.triggerEvent("clickHandlers", detail);
        wx.removeStorageSync('currModuleName')
        wx.removeStorageSync('currModule')
      }
    },

    // async getSceneCode(sceneCode) {
    //   const sceneAllInfo = await apiServer("batchQueryFormSceneInfo", {
    //     "sceneCodeList": [sceneCode],
    //     "versionType": 0
    //   });
    //   return sceneAllInfo.formInfoObjectList[0]
    // },

    /** 获取商卡的属性 */
    async getCompInfo(renderData) {
      const {
        idx,
        sceneCode,
        sceneAllInfo,
        pushSceneInfo
      } = this.properties;
      const selfApiInfo = pushSceneInfo;

      if (selfApiInfo && renderData) {
        const sceneInfo = {
          code: 0,
          formSceneInfo: selfApiInfo.formSceneInfo
        }
        const sceneComponent = {
          code: '200',
          formSceneComponentList: selfApiInfo.formSceneComponentList
        };
        if (sceneInfo && sceneInfo.code == 0 && sceneComponent && sceneComponent.code == "200") {
          let sceneInfoForm = sceneInfo.formSceneInfo;
          if (sceneInfoForm.extension && (typeof sceneInfoForm.extension == "string")) {
            sceneInfoForm.extension = typeof sceneInfoForm.extension === "string" ? JSON.parse(sceneInfoForm.extension) : sceneInfoForm.extension;
          }
          const cardStyles = this.filterSceneBoxStyles(sceneInfo.formSceneInfo.extension.styles);
          const list = [renderData].map((item, index) => {
            let obj = {}
            obj.name = item.name
            obj.goodsId = item.goodsId
            obj.index = item.index
            obj.sceneCode = sceneCode
            obj.renderData = item
            obj.sceneBoxStyle = cardStyles + ";overflow: hidden;"
            obj.sceneBoxContent = this.filterSceneBoxContent(sceneComponent.formSceneComponentList, item);
            obj.showSelf = true
            return obj
          })
          const nameLen = this.getInputSize(renderData.name.content)
          this.triggerEvent("simpleCssStyle", sceneInfo.formSceneInfo.extension.styles["width"]);
          // const pageHeight = nameLen >= 11 ? 2 : 1;
          let pageHeight = renderData.name.wrap == "two" ? 2 : 1;
          if (pageHeight == 1) {
            if ( nameLen >= 11 ) {
              pageHeight = 2
            }
          }

          // console.log('当前商卡的内容', list[0].sceneBoxContent)
          this.setData({
            sceneBoxContent: list[0].sceneBoxContent,
            sceneBoxStyle: list[0].sceneBoxStyle,
            pageHeight,
          })
        }
      }
    },
    getInputSize(value) {
      // console.log('即将计算', value)
      if (!value) {
        return 0
      }
      const charCount = value.split('').reduce((prev, curr) => {
        // 英文字母和数字等算一个字符；这个暂时还不完善；
        if (/[a-z]|[0-9]|[,;.!@#-+/\\$%^*()<>?:"'{}~]/i.test(curr)) {
          return prev + 1.2
        }
        // 其他的算是2个字符
        return prev + 2
      }, 0)

      // 向上取整，防止出现半个字的情况
      return Math.ceil(charCount / 2)
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
        item.stylesOrigin = {
          ...propsStyle.styles
        }
        item.styles = that.filterSceneBoxStyles(propsStyle.styles);

        delete item.props.rnStyles
        delete item.props.rnSubStyles

        // 容器组件
        if (typeList.includes(item.type)) {
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
                    // console.log('此时的标签类型', currTagElement.values.name,  '对应的值:',  customdata[currTagElement.values.typeName],  '整个props是', currTagElement.values)
                    currTagElement.values.value = customdata[currTagElement.values.typeName];
                    if (currTagElement.values.name == "diyField_name") {
                      // console.log('有产品名称字段 此产品的外部props', customdata)

                      // console.log('有产品名称字段', currTagElement.values.value)
                    }
                    if (currTagElement.values.name == "diyField_imageUrl") {
                      // console.log('有图片字段', currTagElement.values)
                    }
                    if (currTagElement.values.name == "diyField_recommendStatus") {

                    }
                    if (currTagElement.values.name == "diyField_customerTags") {
                      // console.log('活动标签的配置', currTagElement)
                    }
                    if (currTagElement.values.name == "diyField_price") {
                      // console.log('展示的价格', currTagElement.values)
                    }

                    if (currTagElement.values.name == "diyField_rankTag") {
                      try {
                        currTagElement.stylesPaddingLeft = currTagElement.stylesOrigin["padding"]
                      } catch (err) {}
                    }
                    if (currTagElement.values.name == "diyField_liveStatus") {
                      // console.log('是否展示默认正在直播', currTagElement)
                    }
                  } else {
                    // 定义了特殊字段，但是外部没有传递
                    // console.log('定义了没触发', currTagElement.values)
                    // console.log('定义了没触发', currTagElement.styles)
                    currTagElement.values.value = ``;
                    if (typeof currTagElement.styles === "string" && currTagElement.values.typeName === "nights") {
                      currTagElement.styles += "display: none !important;"
                    }
                    if (typeof currTagElement.styles !== "string" && currTagElement.values.typeName === "nights") {
                      currTagElement.styles["display"] = "none !important;"
                    }
                  }
                } else {
                  // 产品画布直接产生的数据，非外部传递
                }
              }
              if (comp.componentData.type == 'container') {
                currTagElement.stylesOrigin = {
                  ...currTagElement.styles
                }
                currTagElement.styles = that.filterSceneBoxStyles(currTagElement.styles, true, currTagElement);
                // console.log('当前节点类型', currTagElement)
              } else {
                currTagElement.stylesOrigin = {
                  ...currTagElement.styles
                }
                currTagElement.styles = that.filterSceneBoxStyles(currTagElement.styles, false, currTagElement);
              }



              if (typeList.includes(item.type)) {
                if (list && list.length) {
                  // console.log('%c 当前组件是容器组件且有子组件', 'color: red', item,  '它的子组件是', list, '接口传递过来的数据')
                  listParents.childNodeTypeList = [];
                  listParents.childNodeTypeLen = 0;

                  list.forEach(comp => {
                    if (comp.componentData.props.values.typeName) {
                      listParents.childNodeTypeList.push(comp.componentData.props.values.typeName)
                    }
                    if (comp && comp.componentData.type == "label" && comp.componentData.props.values.typeName == "explainStatus") {
                      // console.log('%c 当前组件是容器组件且有子组件 有直播状态组件', 'color: red', comp.componentData.props.values, list ,listParents)
                      listParents.childNodeType = comp.componentData.props.values.typeName
                      listParents.childNodeValue = customdata.explainStatus || 0
                    }
                  })
                  // console.log('同时含有商品名称和商品标签', listParents)
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
                    // console.log('同时含有商品名称和商品标签', listParents)
                  }
                  if (listParents.childNodeTypeList.some(i => i == "rankTag")) {
                    const tagsChilds = listParents.componentData.props.values.rowData;
                    // console.log('标签组件列表', listParents.componentData.props)
                    tagsChilds.forEach((tagChild, tagChildIndex) => {
                      if (customdata.hasOwnProperty(tagChild.componentData.props.values.typeName)) {
                        listParents.childNodeTypeLen += 1;
                      }
                      try {
                        // console.log('定义了字段但是没接收到值 1', tagChild.componentData.props.values)
                        if (typeof tagChild.componentData.props.styles === "string") {
                          if (tagChild.componentData.props.values.value === "") {
                            tagChild.componentData.props.styles += ";display: none;"
                          } else {
                            tagChild.componentData.props.styles += ";display: inline-flex;"
                          }
                        } else {
                          if (tagChild.componentData.props.values.value === "") {
                            tagChild.componentData.props.styles["display"] = "none;"
                          } else {
                            tagChild.componentData.props.styles["display"] = "inline-flex;"
                          }
                        }
                      } catch (error) {}
                    })
                  }
                } else {

                }
              } else {

              }
              uniqueObj(comp.componentData.props.values.rowData, comp)
            })
          }
          uniqueObj(item.props.values.rowData, item)
        }
      })
      return domlist;
    },

  }
})