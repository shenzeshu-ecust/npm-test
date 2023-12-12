import { cwx, CPage } from '../../../cwx/cwx.js';
const UTILS = require('../common/utils.js');

CPage({
  pageId: "10650012625",
  data: {
    count: 0
  },
  onLoad(options) {
    const {q='',qrpageid=''}=options
    if (!q && !qrpageid) {
      wx.showToast({
        title:'二维码信息有误',
        icon:'loading',
        duration: 5000
      })
      return;
    }
    let params = {},auth = '',h5Url='';
    if(q){
      //'https://m.ctrip.com/webapp/market-app/wechat/commonMidpage?QRPageID=1&id=215&inday=2018-11-19&outday=2018-12-01'
      h5Url = decodeURIComponent(q)  
      params['qrPageID'] = UTILS.getUrlQuery(h5Url, 'QRPageID') ? UTILS.getUrlQuery(h5Url, 'QRPageID') : 1;
      // 如果有auth则是 易试等渠道传递来的 一次性的二维码，否则为普通永久二维码
      auth = UTILS.getUrlQuery(h5Url, 'auth')||''
    }else{
      params['qrPageID']=qrpageid
    }
    params['platform'] = 'WechatUrl';
    cwx.request({
      url: "/restapi/soa2/12673/getQrcodeConfigRule",
      data: params,
      success: (res)=> {
        // 获取规则成功埋点
        this.ubtTrace(102646, { pageName: 'common_midPage_wechat', step: 'getRuleSuccess', pageId: '10650012625', ruleConfig: res.data.rule, openid: cwx.cwx_mkt.openid || '' })
        if (res.data && res.data.rule) {
          const rulePath = res.data.rule
          // 判断是否一次性
          if (auth.length > 0) {
            this.delQrcodeConfigRule(params.qrPageID, auth, rulePath)
          } else {
            this.goTargetUrl(rulePath)
          }
        } else {
          this.goHome()
        }
      },
      fail: (error)=> {
        console.log('信息获取失败:', error)
        // 获取规则失败埋点
        this.ubtTrace(102646, { pageName: 'common_midPage_wechat', step: 'getRuleFail', pageId: '10650012625', openid: cwx.cwx_mkt.openid || '', errorMessage: error })
        this.goHome()
      }
    })
    // 进入中间页进行埋点
    this.ubtTrace(102646, {
      pageName: 'common_midPage_wechat',
      step: 'pageOnload',
      pageId: '10650007823',
      h5Url: h5Url,
      openid: cwx.cwx_mkt.openid || ''
    })
  },
  /**
   * 跳转到目标页
   */
  goTargetUrl(targetUrl) {
    if (targetUrl) {
      if (targetUrl.indexOf('pages/home/homepage') !== -1) {
        cwx.reLaunch({ url: "/" + targetUrl.trim() });
      }else if (targetUrl.includes('pages/you/destination/destination') || targetUrl.includes('pages/you/lvpaiHome/lvpaiHome')|| targetUrl.includes('pages/schedule/index/index')|| targetUrl.includes('pages/myctrip/index/index')) {
        cwx.switchTab({url: "/" + targetUrl.trim()});
      } else {
        let _targetUrl = targetUrl.trim()
        if(_targetUrl[0] != '/') {
          _targetUrl = '/' + _targetUrl
        }
        cwx.redirectTo({
          url: _targetUrl,
          fail: (e)=> {
            this.ubtTrace(102646, {
              targetUrl: targetUrl,
              errmsg: "错误信息：" + (e && e.errMsg)
            });
            this.goHome();
          }
        });
      }
    } else {
      this.ubtTrace(102646, {
        targetUrl: "目标页为空"
      });
      this.goHome();
    }
  },

  /**
   * 跳转到首页
   */
  goHome() {
    cwx.switchTab({
      url: "/pages/home/homepage"
    });
  },
  /**
 *  请求删除
 */
  delQrcodeConfigRule(pageid, auth, rulePath) {
    var that = this;
    cwx.request({
      url: "/restapi/soa2/12673/delQrcodeConfigRule",
      data: { 'qrPageID': pageid, 'auth': auth },
      success: function (response) {
        // 删除成功后进行跳转
        if (parseInt(response.data.errcode) === 0) {
          that.goTargetUrl(rulePath)
        } else {
          that.setData({
            count: that.data.count + 1
          })
          if (that.data.count > 2) {
            that.goHome()
          } else {
            that.delQrcodeConfigRule(pageid, auth, rulePath)
          }
        }
      },
      fail: function (e) {
        that.setData({
          count: that.data.count + 1
        })
        if (that.data.count > 2) {
          that.goHome()
        } else {
          that.delQrcodeConfigRule(pageid, auth, rulePath)
        }
      }
    })
  }
})