// pages/market/directory/duobao/index.js
import { cwx, __global, CPage } from "../../../../cwx/cwx.js";
import { fetch } from './model'
CPage({
  pageId: '10650084803',
  checkPerformance: true,  
    /**
     * 页面的初始数据
     */
    data: {
        env: __global.env,
        navbarData: {
          showCapsule: 1, //是否显示头部左上角小房子 1显示 0 不显示
          showBack: 1, //是否显示返回 1显示 0不显示
          showColor: 0, //navbar背景颜色 1蓝色 0白色
          bgTransparent: true,
          iconColor: 'white',
          titleColor: 'white'
        },
        detailList: [],
        yoNumber: 0,
        pageNo: 1,
        pageSize: 20
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu()
        this.initData()
        this.initYoNumber()
    },
    async initYoNumber() {
        const res = await fetch('yoTicketNumQuery')
        if (res.errcode == 0) {
            this.setData({
                yoNumber: res.yoTicketNum
            })
        } else {
    
        }
        this.logTrace({
          type: 'yoTicketNumQuery',
          res
        })
      },
    async initData() {
      if (this.isLoading) return
      this.isLoading = true
      const pageNo = this.data.pageNo
        const res = await fetch('yoTicketDetailQuery', {
          pageNo: pageNo,
          pageSize: this.data.pageSize
        })
        this.logTrace({
          type: 'yoTicketDetailQuery',
          pageNo: pageNo,
          pageSize: this.data.pageSize,
          res
        })
        const detailList = this.data.detailList
        if (res.errcode == 0) {
            this.setData({
              pageNo: pageNo + 1,
              detailList: [...detailList, ...res.detailList]
            })
        }
      this.isLoading = false
    },
    // wxml已注释，则JS不用的逻辑暂时也注释，20231122，防止被统计
    // jumpIndex: function() {
    //     cwx.navigateBack()
    //     return
    // },

    onReachBottom: function () {
      this.initData()
    },
    onPageScroll (e) { 
      const scrollTop = e.scrollTop
      if (scrollTop > 150) {
        this.setData({
          'navbarData.bgTransparent': false
        })
      } else {
        this.setData({
          'navbarData.bgTransparent': true
        })
      }
    },

    logTrace(args = {}){
      try{
        this.ubtTrace(225994, { 
          openid: cwx.cwx_mkt.openid,
          ...args
       });
      }catch(e){
        //异常
      }
    }
})