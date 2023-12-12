import { cwx, CPage, _ } from "../../../../cwx/cwx.js";
import utils from '../../common/utils';
cwx.config.init();

function judgeProtect(successCb) {
  if (wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '1' || wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '2') {
    successCb && successCb()
  } else {
    cwx.Observer.addObserverForKey("privacy_authorize", (e) => {
      if (e.agree) {
        successCb && successCb()
      } else {
        wx.exitMiniProgram({
          success: () => {
          },
          fail: () => {
          },
          complete: () => { },
        });
      }
    })
  }
}
/**
 * 获取openid
 * 07-05 加unionid判断逻辑，可同时获取unionid
 * @param {function} onSuccess [成功回调]
 * @param {function} onError [失败回调]
 */
const getOpenid = utils.getOpenid
const eventKey = 'dcs_ediath_dev_log'
const aresImg = 'https://pages.c-ctrip.com/car_dcs/vtm/'
const apiUrl = '/restapi/soa2/13310/json/'
const ubtDevTrace = cwx.sendUbtByPage.ubtDevTrace
const CONSTANT = {
  errorText: '系统异常',
  groupInfo: '已有300位旅友进群，累计服务3000w用户！',
  theme: {
    A: 'blue',
    B: 'bgimg',
    C: 'liveCode',
  },
  qrcodeTraceKey: {
    A: {
      longtap: 'g_qr_click',
      tap: 'g_qr_click',
    },
    B: {
      longtap: 'gst_qrcode_bqlong_click',
      tap: 'gst_qrcode_bqshort_click',
    },
    C: {
      longtap: 'gst_qrcode_cqlong_click',
      tap: 'gst_qrcode_cqshort_click',
    }
  },
  btnTraceKey: {
    B: {
      longtap: 'gst_qrcode_banlong_click',
      tap: 'gst_qrcode_banshort_click'
    },
    C: {
      longtap: 'gst_qrcode_canlong_click',
      tap: 'gst_qrcode_canshort_click'
    }
  },
  icon: aresImg + 'icon2.png',
  bgimgList: [{
    icon: aresImg + 'icon4.png',
    text: '免费向导答疑'
  }, {
    icon: aresImg + 'icon3.png',
    text: '地道玩法推荐'
  }, {
    icon: aresImg + 'icon1.png',
    text: '同行旅游分享'
  }, {
    icon: aresImg + 'icon5.png',
    text: '全球紧急救援SOS'
  }]
}

CPage({
  pageId: "10650093036",
  data: {
    bgimgList: CONSTANT.bgimgList,
    groupData: {
      theme: "",
      groupName: "",  // 微领队 8/1玩乐在成都及周边
      errorText: "",
      qrCode: '',
      qrCodeCategory: 1, // 1 前端截图 2 无需截图 3 活码，跳转url
      groupInfo: CONSTANT.groupInfo,
      theme: ''
    },
    aresImg,
    abtResult: '', //C活码 B其他
    btnTop:0
  },

  onLoad({ destCityId, destsetId, destSetId, destsetType, destSetType, addQuickGroup, loginToken, aid, edata, pushtime, ctm_ref }) {
    this.query = {
      aid,
      destCityId,
      addQuickGroup,
      destsetId: destSetId || destsetId,
      destsetType: destSetType || destsetType,
      loginToken,
      edata,
      pushtime,
      ctm_ref
    }
    const systemInfo = wx.getSystemInfoSync();
    const {statusBarHeight, screenWidth} = systemInfo
    const imgPixel =  screenWidth / 350
    let barHeight = statusBarHeight / 2
    barHeight = barHeight <= 10 ? 20 : barHeight
    const btnTop = imgPixel * 346 + barHeight
    this.setData({
      height: systemInfo.screenHeight,
      width: systemInfo.screenWidth,
      btnTop: btnTop
    })
    this.init()
  },
  init() {
    if (this.query.loginToken) {
      cwx.user.writeCrossTicket(this.query.loginToken, function () { });
    }
    wx.login({
      success: (res) => {
        this.getEncData()
      },
      complete: (res) => {
        ubtDevTrace(eventKey, {
          title: "wei_wx_login_complete",
          data: res
        })
      },
    });

  },
  getEncData() {
    const isLogin = cwx.user.isLogin()
    if (this.query.edata && !isLogin) {
      cwx.request({
        url: `${apiUrl}vtmGetJumpUrlDecData`,
        data: {
          encData: this.query.edata
        },
        complete: (res) => {
          const { data } = res ?? {}
          const { decData } = data?.data ?? {}
          if (decData) {
            const obj = JSON.parse(decData)
            if (obj.uid) {
              this.query.uid = obj.uid
              this.requestServer()
            } else {
              this.getQrCode()
            }
          } else {
            this.getQrCode()
            ubtDevTrace(eventKey, {
              title: "miniprogram_vtm_decData_no_decData",
            })
          }
        }
      });
    } else {
      this.getQrCode()
    }
  },

  getQrCode() {
    const isLogin = cwx.user.isLogin()
    if (isLogin) {
      this.requestServer()
    } else {
      ubtDevTrace(eventKey, {
        title: "miniprogram_vtm_no_login",
      })
      judgeProtect(() => {
        cwx.user.login({
          callback: () => {
            ubtDevTrace(eventKey, {
              title: "miniprogram_vtm_login_success",
            })
            this.requestServer()
          }
        });
      })
    }
  },

  onImageLoad: function (e) {
    ubtDevTrace(eventKey, {
      title: "miniprogram_vtm_qrcode_load"
    })
  },

  onImageError: function (e) {
    ubtDevTrace(eventKey, {
      title: "miniprogram_vtm_qrcode_error"
    })
  },
  btnOnPress: function (e) {
    try {
      this.ubtTrace(CONSTANT.btnTraceKey[this.data.abtResult][e.type], {});
    } catch (error) {

    }
  },
  imageOnPress: function (e) {
    try {
      this.ubtTrace(CONSTANT.qrcodeTraceKey[this.data.abtResult][e.type], {});
    } catch (error) {

    }
  },
  startmessage: function (e) {
    ubtDevTrace(eventKey, {
      title: 'miniprogram_vtm_startmessage'
    })
  },
  completemessage: function (e) {
    ubtDevTrace(eventKey, {
      title: 'miniprogram_vtm_completemessage'
    })
  },
  requestServer() {
    ubtDevTrace(eventKey, {
      title: 'miniprogram_vtm_vtmWeAppGetQrCode'
    })
    getOpenid(() => {
      const { destCityId, addQuickGroup, destsetId, destsetType, aid, uid, pushtime, ctm_ref } = this.query
      cwx.request({
        url: `${apiUrl}vtmWeAppGetQrCode`,
        data: {
          uid: uid,
          destCityId,
          mktOpenId: cwx.cwx_mkt.openid,
          unionId: cwx.cwx_mkt.unionid,
          sourceId: 101,
          addQuickGroup,
          destsetId,
          destsetType
        },
        complete: (res) => {
          const { data, statusCode } = res ?? {}
          const { retCode, retMsg } = data ?? {}
          const { qrCode, qrType, groupName, qrCodeCategory, backgroundImage, colorBlockBegin, colorBlockEnd } = data?.data ?? {}
          const bgImg = backgroundImage || (aresImg + 'topImgDefault.png')
          const qrCategory = qrCodeCategory || 1
          const abtRes = qrCategory === 3 ? 'C' : backgroundImage ? 'B' : 'A'
          const isSuccess = statusCode === 200 && retCode === 0
          const color1 = colorBlockBegin || '#006FF6'
          const color2 = (colorBlockEnd && colorBlockEnd.includes('rgba')) ? colorBlockEnd : 'rgba(255,255,255,0)'
          this.setData({
            abtResult: abtRes,
            groupData: {
              ...this.data.groupData,
              errorText: isSuccess ? '' : retMsg || CONSTANT.errorText,
              qrCode,
              qrType,
              groupName,
              theme: CONSTANT.theme[abtRes],
              qrCodeCategory: qrCategory
            },
            backgroundImage: bgImg,
            color1,
            color2
          })
          if (isSuccess) {
            this.ubtTrace(`gst_wqrcode1_expo_expo`, { aid, destCityId, uid, destcityid: destCityId, destsegroupid: destsetId, pushtime, ctm: ctm_ref });
          } else {
            ubtDevTrace(eventKey, {
              title: "miniprogram_vtm_no_qrcode"
            })
          }
        },
      });
    }, () => {
      ubtDevTrace(eventKey, {
        title: 'miniprogram_vtm_getopenid_error'
      })
    })
  }
});
