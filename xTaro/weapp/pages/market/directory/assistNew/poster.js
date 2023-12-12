import { cwx, CPage, _ } from "../../../../cwx/cwx.js";
var utils = require('../../common/utils');
var Picture = require('../mktCommon/picture.js')
let model = require('./model');

CPage({
  pageId: '10650061112',
  ubtCode: 193800,
  keyname: 'mkt_newAssistActivity',
  checkPerformance: true,  
  data: {
    renderData: null,
    poster: null,
    avatarUrl: '',
    activityId: ''
  },
  onLoad(options) {
    let that = this;
    console.log(options);

    let activityId = decodeURIComponent(options.activityId);
    let qrUrl = decodeURIComponent(options.qrUrl);
    let avatarUrl = (options && options.avatarUrl) ? decodeURIComponent(options.avatarUrl) : that.data.defaultHeading;
    let nickName = (options && options.nickName) ? decodeURIComponent(options.nickName) : that.data.defaultName;
    that.setData({
      'poster.qrUrl': qrUrl,
      avatarUrl: avatarUrl,
      nickName: nickName,
      activityId: activityId
    });
    that.getActivityConfig(); // 获取活动规则配置
    this.logTrace('posterLoad', {
      actionMsg: '海报页PV'
    })
  },
  // 获取活动配置
  async getActivityConfig() {
    let that = this;
    const { activityId } = this.data
    const res = await model.api.getActivityConfig({ activityId })
    if (res.errcode == 0) {
      let actConf = res.activitlyConfig;
      let activityCustomfields = res.activityCustomfields;
      let activityConf = { ...actConf, ...activityCustomfields }
      that.setData({
        renderData: activityConf
      })
      wx.setNavigationBarTitle({
        title: activityConf.pageTitle
      })

      let { headSize, headCoordinate, nicknameSize, nicknameColor, nicknameCoordinate, qrCodeSize, qrCodeCoordinate } = activityConf
      console.log('headSize', headSize)
      console.log('headCoordinate', headCoordinate)
      console.log('nicknameSize', nicknameSize)
      console.log('nicknameColor', nicknameColor)
      console.log('nicknameCoordinate', nicknameCoordinate)
      console.log('qrCodeSize', qrCodeSize)
      console.log('qrCodeCoordinate', qrCodeCoordinate)
      
      // 昵称
      nicknameSize = nicknameSize > 0 ? nicknameSize / 2 : 0
      nicknameColor = nicknameColor || '#333'
      let nicknamePosition = normalizePosition(nicknameCoordinate)
      // 头像
      headSize = headSize > 0 ? headSize / 2 : 0
      let headPosition = normalizePosition(headCoordinate)
      // 太阳码
      qrCodeSize = qrCodeSize > 0 ? qrCodeSize / 2 : 0
      let qrCodePosition = normalizePosition(qrCodeCoordinate)

      let pic = new Picture('mycanvas', 375, 603);
      pic.getImgInfo(that.data.renderData.posterBg, (data) => {
        // 背景图
        pic.drawImg(data.path, { left: 0, top: 0 }, { width: 375, height: 603 })
        // 昵称
        pic.drawText(decodeURIComponent(that.data.nickName), 
          { size: nicknameSize, color: nicknameColor, align: 'center'}, 
          { left: nicknamePosition[0], top: nicknamePosition[1] }
        )
        // 头像
        pic.getImgInfo(that.data.avatarUrl, (data) => {
          pic.imgToArc(data.path, 
            { left: headPosition[0] - headSize / 2, top: headPosition[1] - headSize / 2 }, 
            { width: headSize, height: headSize, radius: headSize / 2 }
          )
          // 绘制
          pic.draw()
          //b码 
          pic.getImgInfo(that.data.poster.qrUrl, (data) => {
            pic.imgToArc(data.path, 
              { left: qrCodePosition[0] - qrCodeSize / 2, top: qrCodePosition[1] - qrCodeSize / 2 }, 
              { width: qrCodeSize, height: qrCodeSize, radius: qrCodeSize / 2 }
            )
            //绘制
            pic.draw(() => {
              pic.canvasToImgPath((path) => {
                that.setData({
                  img: path
                });
              })
            });
          })
        })
      });
    } else {
      that.logTrace('getActivityConfig', {
        type: 'error',
        result: res,
      })
    }
  },
  savePic() {
    utils.toSave(this.data.img)
    this.logTrace('savepic')
  },
  logTrace(action, more = {}) {
    let that = this;
    action = action.split(',')
    try {
      _.map(action, (item, index) => {
        this.ubtTrace(this.ubtCode, {
          actioncode: item,
          openid: cwx.cwx_mkt.openid,
          clientID: cwx.clientID,
          allianceid: that.data.renderData?.allianceid,
          sid: that.data.renderData?.sid,
          keyname: this.keyname,
          pageId: that.pageId,
          activityID: that.data.activityId,
          ...more
        })
      })
    } catch (e) {
      console.log(e)
    }
  }
})

function normalizePosition(str) {
  let pos = str.replace('，', ',').trim()
  return pos ? pos.split(',').map(v => v / 2) : [0, 0]
}