/**
 * 授权弹窗组件
 * 支持 BU 自定义文案
 */
import { authFloatInfo } from "../../../config"
import {setApiCacheAuthorization, callNextApiFloat} from "../../ext/applyForAuth/cwx.authorization"
import { cwx } from "../../cwx"

Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    show: false, 
    // API 级别，有默认值，优先用 BU 传入的
    apiFloatInfo: {
      // action: "访问您的磁盘",
      // desc: "将获取你的存储权限，用于保存图片/视频到本地"
    }, 
    // 应用级别，从 config.js 中获取
    appFloatInfo: authFloatInfo
  },
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      let currentPage = cwx.getCurrentPage();
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace("wxapp_authorizationFloat_attached", {
        pageId: currentPage.pageId || null,
        pagePath: currentPage.route || "",
      });
      this.nextCall = [];
      this.apiScope = null;
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    callDialog:function(apiFloatInfo){
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace("wxapp_authorizationFloat_show", {
        apiFloatInfo: JSON.stringify(apiFloatInfo),
        nextCall: JSON.stringify(this.nextCall),
        apiScope: this.apiScope
      });
        //查找api涉及的类型和所有api以及显示文案
        this.setData({
          show: true,
          apiFloatInfo
        })

        //判断是不是显示状态。如果不是，直接处理
        //判断是否是同类型，如果是同类型不处理,等待显示处理结果
        //判断不是同类型，将数据放入nextCall中，apiName
    },
    hide: function () {
      this.setData({
        show: false,
        apiFloatInfo: {}
      })
      setTimeout(function() {
        callNextApiFloat();
      }, 1000)
    },
    reject: function() {
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace("wxapp_authorizationFloat_reject", {
        nextCall: JSON.stringify(this.nextCall),
        apiScope: this.apiScope
      });
      setApiCacheAuthorization({
        status: "reject", 
        apiScope: this.apiScope
      });
      this.hide();
    },
    agree: function() {
      cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace("wxapp_authorizationFloat_agree", {
        nextCall: JSON.stringify(this.nextCall),
        apiScope: this.apiScope
      });
      //api涉及的类型和所有api storage状态改变,然后flush api
      setApiCacheAuthorization({
        status: "agree", 
        apiScope: this.apiScope
      });
      this.hide();
    }
  }
})
