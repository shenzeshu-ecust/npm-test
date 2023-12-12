
import { cwx, CPage, _, __global } from "../../../../cwx/cwx";
const model = require('./model.js');
const utils = require('./utils')
const UTILS = require('../../common/utils')

CPage({
  pageId: '10650068579', 
  checkPerformance: true,  
  /**
   * 页面的初始数据
   */
  data: {
    isFat: __global.env === 'fat',
    pageScale: 1,
    componentList: [],
    taskList: [],
    sceneCode: '',
    channelCode: '',
    taskinvite: '',
    formSceneInfo: null,
    inviteInfo: null,
    taskBtn: {
      status: 0, // 0 客态 任务未完成 展示任务， 1 客态任务；领奖励 2 客态 任务已完成    3，客态有问题 跳到活动落地页，4 主态
      btnText: ''
    },
    subscribeStstus: 0,
    pageBg: '', // 页面背景
    pageHeight: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置页面比例
    this.setPageTransform()
    this.checkLogin()

    const { sceneCode, taskinvite } = options
    if (!sceneCode) {
      // UTILS.showToast('缺少路由参数 sceneCode')
      // return 
    }
    
    this.setData({
      sceneCode,
      taskinvite
    })
    
    this.initPage()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initPage()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  initPage: async function() {
    if (this.isInitPageLoading) return
    this.isInitPageLoading = true
    console.log('-------------> initPage')

    this.logTrace({
      action: 'initPage',
    })

    // 获取邀请数据
    await this.getInviteInfo()
    // 绑定被邀请用户
    await this.bindInvite()
    await this.getPageDataTotal()

    // 设置页面
    this.setPageHeight()
    // 获取订阅状态
    this.getSubscribeState()
    // 设置页面标题
    this.setPageConfig()

    this.isInitPageLoading = false
  },

  getPageDataTotal: async function () {
    if (this.getPageDataTotalLoading) return
    this.getPageDataTotalLoading = true
    console.log('===============> getPageDataTotal')

    const { sceneCode, channelCode } = this.data
    if (!sceneCode) {
      return 
    }

    let componentList = await this.getComponentList(sceneCode)
    let [fieldMenu, formSceneInfo] = await this.getFieldMap(sceneCode)
    const taskList = await this.fetchTaskList(channelCode)
    const taskBtn = this.computeTaskBtn(taskList, this.data.inviteInfo)
    componentList = this.buildComponentList(componentList, fieldMenu, taskList, formSceneInfo, taskBtn)

    this.logTrace({
      action: 'getPageDataTotal',
      taskList,
      taskBtn,
    })

    this.setData({
      componentList,
      taskList,
      formSceneInfo,
      taskBtn,
      fieldMenu,
      pageBg: formSceneInfo?.extension?.pageBg || ''
    })

    this.getPageDataTotalLoading = false
  },

  // 0 客态 任务未完成 展示任务， 1 客态任务；领奖励 2 客态 任务已完成    3，客态有问题 跳到活动落地页，4 主态
  /**
   *主态：不能为自己助力哦！
    客态：
    没有拉取到B任务，被风控状态：您尚未满足活动参与条件
    A助力成功，B任务已完成：已助力，我也要参与。打开别人邀请的A助力页面：助力次数已达上线，我也要参与。
    B任务未完成，无论点开哪个一个助力页面，显示 任务按钮文案。
    A助力已满，但是有人有绑定关系，B任务未完成，可以让用户完成。 B未绑定成功（B任务未领取）提示：助力已满，我也要参与。
    A任务过期提示：助力已过期，我也要参与。
   */
  computeTaskBtn: function(taskList, inviteInfo) {
    const { masterState, msgCode } = inviteInfo
    const currentTask = taskList[0]
    if (masterState == 1) {
      // 主态
      return {
        status: 4,
        btnText: '不能为自己助力哦'
      }
    }
    // B任务被风控
    if (taskList.length == 0) {
      return {
        status: 3,
        btnText: '您尚未满足活动参与条件'
      }
    }
    if (currentTask.status == 2) {
      return {
        status: 1,
        btnText: '领奖励'
      }
    }
    // A助力成功 B任务已完成
    if (msgCode == 4) {
      return {
        status: 3,
        btnText: '之前已助力，我也要参与'
      }
    }
    if (msgCode == 5) {
      return {
        status: 3,
        btnText: '助力次数已达上限'
      }
    }
    if (msgCode == 1) {
      UTILS.showToast('token无效')
      return {
        status: 3,
        btnText: 'token无效'
      }
    }
    if (msgCode == 2) {
      return {
        status: 3,
        btnText: '助力已过期，我也要参与'
      }
    }
    if (msgCode == 3) {
      if (currentTask.status == 0 || currentTask.status == 3) {
        return {
          status: 3,
          btnText: '助力已满，我也要参与'
        }
      } else {
        return {
          status: 1,
          btnText: ''
        }
      }
    }
    if (currentTask.status == 3) {
      return {
        status: 2,
        btnText: '已完成'
      }
    }
    
    return this.data.taskBtn
  },

  getComponentList: async function(sceneCode) {
    const res = await model.api.queryFormSceneComponent({
      sceneCode
    })
    if (res.code == 200) {
      return res.formSceneComponentList
    } else {
      return []
    }
  },

  getFieldMap: async function(sceneCode) {
    const res = await model.api.queryFormSceneInfo({
      sceneCode
    })
    let formFields = {}
    let formSceneInfo = {}
    if (res.code == 0) {
      let formFieldInfos = res.formFieldInfos
      formFieldInfos.forEach(item => {
        formFields[item.code] = item.alias
      })

      formSceneInfo = res.formSceneInfo
      formSceneInfo.extension = utils.jsonParse(formSceneInfo.extension)
      formSceneInfo.property = utils.jsonParse(formSceneInfo.property)
    }
    return [formFields, res.formSceneInfo]
  },

  buildComponentList: function(componentList, fieldMenu, taskList, formSceneInfo, taskBtn) {
    const currentTask = taskList[0] || {}
    const { displayName, awardDesc, buttonText } = currentTask
    const { inviteInfo } = this.data
    const { extension: { taskDoneImg, taskDoneColor, taskReceiveAwardImg, taskReceiveAwardColor } } = formSceneInfo
    const { nickName, headUrl, infoMap: { activityName } } = inviteInfo

    return componentList.map((item => {
      if (typeof item.props == 'string') { item.props = utils.jsonParse(item.props) }
      item.styles = utils.resolveStyles(item.props.styles)
      item.props.key = fieldMenu[item.props?.values?.name] || ''
      
      this.resolveComponentData(item, currentTask, inviteInfo, taskBtn, { displayName, awardDesc, buttonText, nickName, headUrl, activityName, taskDoneImg, taskDoneColor, taskReceiveAwardImg, taskReceiveAwardColor })
      return item
    }))
  },

  resolveComponentData: function (componentItem, currentTask, inviteInfo, taskBtn, displayOptions) {
    switch(componentItem.props.key) {
      case 'nickname_text':
        componentItem.props.values.value = displayOptions.nickName
        break;
      case 'task_currency':
        componentItem.props.values.value = displayOptions.awardDesc
        break;
      case 'task_btn':
        if (taskBtn.status == 1 && displayOptions.taskReceiveAwardImg) {
          componentItem.props.values.src = displayOptions.taskReceiveAwardImg
        }
        if (taskBtn.status == 2 && displayOptions.taskDoneImg) {
          componentItem.props.values.src = displayOptions.taskDoneImg
        }
        break;
      case 'task_btn_text':
        // a 任务不能再助力 就是使用自定义文案
        if (![0, 1].includes(taskBtn.status)) {
          componentItem.props.values.value = displayOptions.buttonText
        }
        if (taskBtn.status == 1 && displayOptions.taskReceiveAwardColor) {
          componentItem.props.styles.color = displayOptions.taskReceiveAwardColor
          componentItem.styles = utils.resolveStyles(componentItem.props.styles)
        }
        if (taskBtn.status == 2 && displayOptions.taskDoneColor) {
          componentItem.props.styles.color = displayOptions.taskDoneColor
          componentItem.styles = utils.resolveStyles(componentItem.props.styles)
        }
        break;
      case 'task_title':
        componentItem.props.values.value = displayOptions.displayName
        break;
      case 'activityName':
        componentItem.props.values.value = displayOptions.activityName
        break;
      case 'avatar':
        componentItem.props.values.src = displayOptions.headUrl
        break;
      default:
        console.log(`暂无【${componentItem.props.key}】的插值`)
        break;
    }
  },

  fetchTaskList: async function(channelCode) {
    const taskId = this.data.inviteInfo.infoMap._taskId
    const res = await model.api.getTaskList({
      channelCode,
      version: '3'
    })
    if (res.code == 200) {
      let list = [...res.todoTaskList, ...res.finishTaskList] // .filter(v => v.id == taskId)
      return list
    } else {
      return []
    }
  },

  setPageTransform: async function() {
    const defaultWidth = 375;
    let ret = 1
    const res = await utils.getSystemInfo()
    if (res.screenWidth) {
      ret = res.screenWidth / defaultWidth
    }

    this.logTrace({ 
      action: 'setPageTransform',
      screenWidth: res.screenWidth,
      data: ret
    })

    this.setData({
      pageScale: ret
    }) 
  },

  setPageConfig: async function() {
    const { extension } = this.data.formSceneInfo
    const { pageTitle, barColor, barBg } = extension
    wx.setNavigationBarColor({
      frontColor: barColor || '#ffffff',
      backgroundColor: barBg || '#19A0F0',
    })
    wx.setNavigationBarTitle({
      title: pageTitle
    })
  },

  getTaskComponent: function () {
    if (this.taskComponentIns) {
      return this.taskComponentIns
    }
    const ins = this.selectComponent('.abTask');
    this.taskComponentIns = ins
    return ins
  },

  getInviteInfo: async function() {
    const token = this.data.taskinvite
    if (!token) return

    let res = await model.api.inviteInfo({
      eventType: 'INVITE_HELP',
      token
    })
    this.logTrace({
      action: 'getInviteInfo',
      data: res
    })
    if (res.code === 200) {
      const infoMap = res.inviteInfoDto.infoMap
      this.setData({
        inviteInfo: res.inviteInfoDto,
        channelCode: infoMap._channelCode,
        sceneCode: infoMap._sceneCode,
      })
    } else {
      // TODO
    }
  },

  handleClick: function(e) {
    const dataset = e.currentTarget.dataset || e.target.dataset
    const item = dataset.item
    this.logTrace({
      action: "handleClick",
      data: item
    })

    if (!item?.props?.key) return

    const { taskList, inviteInfo } = this.data
    const { infoMap: { _activityStartUrl } } = inviteInfo

    switch(item.props.key){
      case 'invite_btn':
        UTILS.goTargetUrl(_activityStartUrl)
        break;

      case 'sub_btn':
        if (this.data.subscribeStstus == 0) {
          this.subscribeMsg();
        } else {
          UTILS.showToast('已订阅')
        }
        break;

      case 'task_btn_text':
        if (this.data.taskBtn.status == 3 || this.data.taskBtn.status == 4) {
          UTILS.goTargetUrl(_activityStartUrl)
        }
        break;
    }
  },

  // 被邀请用户 先绑定
  bindInvite: async function() {
    const { taskinvite } = this.data
    if (!taskinvite) return

    const res = await model.api.taskAssistant({
      businessType: 'INVITE_HELP_TASK_BIND',
      paramMap: {
        token: taskinvite
      }
    })

    this.logTrace({
      action: 'bindInvite',
      data: res
    })
    return res
  },

  checkLogin: async function() {
    return new Promise((resolve, reject) => {
      UTILS.checkLogin(() => {
        this.logTrace({ 
          action: 'checkLogin',
          data: true
        })
        resolve(true)
      })
    })
  },

  subscribeMsg: function() {
    let { templateIdList } = this.data.formSceneInfo.extension
    if (!templateIdList) {
      UTILS.showToast('缺少参数 templateIdList')
      return
    }
    templateIdList = templateIdList.split(',')
    cwx.mkt.subscribeMsg(templateIdList, async (data) => {
      if (data && data.templateSubscribeStateInfos) {
        UTILS.showToast('订阅成功')
        this.setData({
          subscribeStstus: 1
        })
        console.log('-------------mkt task component 订阅消息成功---------------------');
      } else {
        console.error('----------------订阅消息失败-----------------', JSON.stringify(data));
      }
    }, (err) => {
      UTILS.showToast('订阅失败')
      console.error('----------------订阅消息失败 err-----------------', JSON.stringify(err));
    })
  },

  async setPageHeight() {
    const ele = await getRect('.page_bg_img')
    this.setData({
      pageHeight: ele.height + 'px'
    })
  },

  getSubscribeState(){
    let { templateIdList } = this.data.formSceneInfo.extension
    if (!templateIdList) {
      UTILS.showToast('缺少参数 templateIdList')
      return
    }
    templateIdList = templateIdList.split(',')
    cwx.mkt.getSubscribeMsgInfo(templateIdList, (data) => {
      this.logTrace({
        action: 'getSubscribeMsgInfo',
        templateIdList,
        data
      })
      //接口调用正常
      if (data.templateSubscribeStateInfos && data.templateSubscribeStateInfos[0]?.subscribeState) {
        this.setData({
          subscribeStstus: 1
        })
      }
    },(err)=>{
      this.logTrace({
        action: 'getSubscribeMsgInfo',
        templateIdList,
        err
      })
    })
  },

  userAcceptPrize: async function() {
    const taskBtn = {
      status: 2,
      btnText: '已完成'
    }
    let { componentList, fieldMenu, taskList, formSceneInfo } = this.data
    componentList = await this.buildComponentList(componentList, fieldMenu, taskList, formSceneInfo, taskBtn)
    this.setData({
      taskBtn,
      componentList
    })
  },

  receiveTask: function() {
    
  },

  completeTask: async function() {
    const taskBtn = {
      status: 1,
      btnText: ''
    }
    const { componentList, fieldMenu, taskList, formSceneInfo } = this.data
    componentList = await this.buildComponentList(componentList, fieldMenu, taskList, formSceneInfo, taskBtn)
    this.setData({
      taskBtn,
      componentList
    })
  },

  logTrace: function(args) {
    const commonParams = {
      openid: cwx.cwx_mkt.openid,
      taskinvite: this.data.taskinvite,
    }
    const sendParams = {
      ...commonParams,
        ...args
    }
    console.log('【logTrace a+b】', sendParams)
    this.ubtTrace('o_mkt_miniapp_task_ab', sendParams)
  },

  getTaskList: function(...args) {
    console.log('【logTrace】getTaskList', args)
  }
})

function getRect (selector) {
  return new Promise((reolve, reject) => {
    wx.createSelectorQuery().select(selector).boundingClientRect(function(rect){
      reolve(rect)
    }).exec()
  })
}