// pages/market/activity/activity.js
import { cwx, CPage, _ } from '../../../cwx/cwx'
import util, { model } from 'common/util'
import { avilibleTemplate } from 'common/config'

const log = console.log.bind(console)

CPage({
  pageId: 'ignore_page_pv',
	/**
	 * 页面的初始数据
	 */
  data: {
    actid: '',
    dataList: [],         // 组件列表
    shareData: {},        // 分享信息
    pageProps: {},        // 页面属性: [backgroundcolor]
    isHomeBtn: false,     // 回到首页
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad(options) {
    let self = this
    let actid = options.actid

    //pv uv埋点
    let traceData={ 
      tplName: actid,
      openid: cwx.cwx_mkt.openid,
      category: 'page_view',
      time:new Date().getTime()
    }
    console.log(traceData);
    cwx.getCurrentPage().ubtTrace(188746, traceData);

    if (!this.isCompatible()) {
      this.setData({
        isHomeBtn: true
      })      
      return
    }

    if (actid) {
      this.setData({
        actid: actid
      })
      this.fetchTemplateData(actid)
    } else {
      wx.showModal({
        title: '提示',
        content: '活动不存在，请稍后再试',
        showCancel: false,
        confirmText: '知道了',
        success(res) {
          if (res.confirm) {
            self.setData({
              isHomeBtn: true
            })
          }
        }
      })
    }
  },
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
  onReady() {

  },

	/**
	 * 生命周期函数--监听页面显示
	 */
  onShow() {
    // log('>>>>>>>>>>>', this.data)
  },

  isCompatible() {
    let sysInfo = wx.getSystemInfoSync()
    let ver = sysInfo.SDKVersion

    let compatible = util.compareVersion(ver, '1.6.3') > 0

    if (!compatible) {
      wx.showModal({
       title: '提示',
       content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      log('微信版本过低', ver)
      return false
    }
    return true
  },
	/**
	 * 获取模板数据
	 * @param  {String} tempid 模板id
	 */
  fetchTemplateData(tempid) {
    let self = this
    wx.showToast({
      title: "加载活动中",
      icon: "loading",
      duration: 60000
    })

    model('13458', 'loadTemplate')({
      data: {
        templateCode: tempid
      },
      success(res) {
        if (res.code == 0) {
          wx.hideToast()
          if (res.template) {
            let pageId = res.template.wxOriginalMiniAppEnbedH5PageId;  //微信小程序pageid
            self.ubtSendPV({
              pageId: pageId,
              url:  `/pages/market/activity/activity?actid=${tempid}`
            });
            let shareInfo = {},
                pageInfo = {};
            try {
              shareInfo = JSON.parse(res.template.share)
              pageInfo = JSON.parse(res.template.property)
            } catch (e) {
              log('tpl JSON parse err: ', e)
            }
            self.setData({
              shareData: shareInfo,
              pageProps: pageInfo
            })
            wx.setNavigationBarTitle({
              title: res.template.title || '携程旅行'
            })
          }
          let templateInfo = {
            tplId:res.template.id,
            tplName:res.template.name
          };
          let components = res.components;
          let loginStatus = res.template.loginStatus || 0;  //乐高页面登录状态： 0：无登录；1：可登录（不强制）；2：强制登录
          if (cwx.user.isLogin() || loginStatus == 0) { //已登录状态 或者 0：无登录 直接渲染
            self.commitData(components, templateInfo)
          }else{  //1:可登录（不强制）；2:强制登录 且 无登录状态
            cwx.user.login({
              callback: function (res) {
                //登录成功执行为避免刷新仅 2：强制登录 登录成功后执行渲染
                if(res && res.ReturnCode == "0" && loginStatus == 2){
                  self.commitData(components, templateInfo)
                }
              }
            });
            if(loginStatus == 1){ //1：可登录（不强制）不论登录与否 都会执行
              self.commitData(components, templateInfo)
            }
          }
        } else {
          util.errorHandler(res.code)
        }
      },
      fail() {
        wx.hideToast()
        self.setData({ isHomeBtn: true })
        wx.showModal({
          title: '提示',
          content: '网络繁忙，请稍后再试',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  },

	/**
	 * 依据配置中可用模板列表对数据重新组装
	 * tpl 加载模板名称
	 * id 用来标识唯一事件
	 * data wxml所需数据
	 */
  commitData(list, templateInfo) {
    let cList = []
    list.forEach(item => {
      if (Object.keys(avilibleTemplate).includes(item.name)) {
        let props = {}
        try {
          props = JSON.parse(item.property)
        } catch (e) {
          log('commitData:', e)
        }
        let obj = {
          tplId: templateInfo.tplId, //页面id
          tplName: templateInfo.tplName, //页面英文名称
          componentName: item.name, //组件名称
          tpl: avilibleTemplate[item.name].tpl || '', //组件模板名称
          componentId: item.id, //组件id
          data: props //组件参数
        }
        cList.push(obj)
      }
    })
    console.log('clist', cList)
    this.setData({
      dataList: cList
    })
  },

  jump(e) {
    let url = e.currentTarget.dataset.url

    if (!url) {
      return
    } else if (url.includes('/myctrip/index') || url.includes('/home/homepage')) {
      cwx.switchTab({ url: url })
    } else {
      cwx.navigateTo({ url: url })      
    }
  },
  share() {
    log('share')
  },
  buildFn(e) {
    if (e && e.detail.ctx && e.detail.ctx.share) {
      this.share = e.detail.ctx.share
    }
  },
	/**
	 * 用户点击右上角分享
	 */
  onShareAppMessage() {
    console.log('ssss');
    let obj = this.data.shareData
    let self = this
    let path = `/pages/market/activity/activity?actid=${this.data.actid}`
    return {
      title: obj.title,
      desc: obj.desc,
      path: path,
      imageUrl: obj.icon,
      success(res) {
        self.share()
        wx.showToast({
          title: "分享成功",
          icon: "success",
          duration: 2000
        })
      },
      fail() {
        log('fail')
      }
    }
  }
})
