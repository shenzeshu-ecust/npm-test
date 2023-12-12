import {
  cwx,
  __global
} from "../../../../cwx/cwx.js";
import model from './model'
import service from './service'
const UTILS = require('../../common/utils.js');
// import {
//   eventMenu
// } from '../task/index'


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tempid: {
      type: String,
      value: ''
    },
    compid: {
      type: String,
      value: ''
    },
    channelCodeForce: {
      type: String,
      value: ''
    },
  },

  observers: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    env: __global.env,
    channelCode: '',
    legaoInfo: null,
    taskList: [],
    isLogin: false,
    showSharePanel: false,
    shareConfig: null
  },

  attached: function () {
    this.initPageBind = this.initPage.bind(this)
    this.initPage()
    cwx.Observer.addObserverForKey('dynamicLoginSuccess', this.initPageBind);
  },

  detached: function () {
    try {
      cwx.Observer.removeObserverForKey('dynamicLoginSuccess', this.initPageBind);
    } catch (error) {}
  },

  pageLifetimes: {
    show: function () {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async initPage() {
      await this.fetchTemplateData()
      if (!this.data.legaoInfo) {
        return
      }

      this.getInviteInfo()
    },

    /**
     * 获取任务信息
     */
    async getInviteInfo() {
      const channelCode = this.data.channelCodeForce || this.data.legaoInfo.channelCode
      const res = await service.getTaskList({
        channelCode
      })
      this.setData({
        taskList: res.taskList,
        channelCode: res.channelCode,
        isLogin: res.isLogin,
      })
    },
    /**
     * 根据传入的tempid，compid找到对应的组件配置
     */
    fetchTemplateData: async function () {
      const templateCode = this.data.tempid
      if (!templateCode) {
        return
      }
      const res = await model.loadLegaoTemplate({
        templateCode,
      })
      if (res.code == 0 && res.template) {
        try {
          const pageComps = res.components
          let _legaoInfo = pageComps.find(item => item.id == this.data.compid)
          _legaoInfo = JSON.parse(_legaoInfo.property)
          this.setData({
            legaoInfo: _legaoInfo
          })
        } catch (e) {
          console.log('tpl JSON parse err: ', e)
        }
      }
      this.logTrace({
        type: 'fetchTemplateData',
        data: res
      })
    },

    initUnionData() {
      return new Promise((resolve) => {
        cwx.mkt.getUnion((unionData) => {
          let mktUnionData = {}
          mktUnionData['allianceid'] = String(unionData.allianceid) || ''
          mktUnionData['sid'] = String(unionData.sid) || ''
          mktUnionData['ouid'] = String(unionData.ouid) || ''
          mktUnionData['sourceid'] = String(unionData.sourceid) || ''
          let extUnionData = JSON.parse(unionData.exmktid)
          mktUnionData['pushcode'] = String(extUnionData.pushcode) || ''
          mktUnionData['innersid'] = String(extUnionData.innersid) || ''
          mktUnionData['innerouid'] = String(extUnionData.innerouid) || ''
          this.mktUnionData = mktUnionData
          resolve(mktUnionData)
        })
      })
    },

    toLogin() {
      cwx.user.login({
        param: {
          sourceId: "market"
        },
      });
    },

    /**
     * 点击去完成
     * @param {*} taskItem 
     */
    async handleReceiveTask(e) {
      const id = e.detail?.id || e.id
      const taskItem = this.data.taskList.find(item => item.id === id)
      if (taskItem) {
        await service.todoTask(taskItem, this)
      }
    },

    async handleReceiveAward(e) {
      const id = e.detail?.id || e.id
      const taskItem = this.data.taskList.find(item => item.id === id)
      if (taskItem) {
        const res = await service.receiveAward(taskItem, this)
        if (res.code === 100) {
          return
        }
        if (res.code === 200) {
          UTILS.showToast('领取成功')
          this.initPage()
        } else {
          UTILS.showToast(res.message)
        }
      }
    },

    async handleClickSmallAward(e) {
      const id = e.detail?.id || e.id
      const index = e.detail?.index || e.index
      const taskItem = this.data.taskList.find(item => item.id === id)
      if (taskItem) {
        const res = await service.receiveSmallAward(taskItem, index)
        if (res.code === 100) {
          return
        }
        if (res.code === 200) {
          UTILS.showToast('领取成功')
          this.initPage()
        } else {
          UTILS.showToast(res.message)
        }
      }
    },

    handleCloseSharePanel() {
      this.setData({
        showSharePanel: false
      })
    },

    _triggerEvent(type, data) {
      console.log('【taskAssist组件 triggerEvent】', type, data)
      switch (type) {
        case 'batchReceiveResult':
          this.triggerEvent('batchReceiveResult', data)
          break;
        case 'closePopup':
          this.triggerEvent('closePopup', data)
          break;
        case 'userLogin':
          this.triggerEvent('userLogin', data)
          break;
        case 'bindInvite':
          this.triggerEvent('bindInvite', data)
          break;
          // 弹窗结果
        case 'taskAssistPopupResult':
          this.triggerEvent('taskAssistPopupResult', data)
          break;
      }
    },

    logTrace: function (params) {
      try {
        const _params = {
          "openid": cwx.cwx_mkt.openid || '',
          "pageid": this.pageId,
          ...params
        }
        console.log('o_mkt_miniapp_taskAssist->', _params)
        this.mPage && this.mPage.ubtDevTrace && this.mPage.ubtDevTrace('o_mkt_miniapp_taskAssist', _params);
      } catch (error) {}
    }
  }
})