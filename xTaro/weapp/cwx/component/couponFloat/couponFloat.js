import { cwx } from "../../cwx.js";

let mPage, pageId="",_this,openid='';
const ServerUrls = {
  getActivityConfig: '/restapi/soa2/18083/getActivityConfig', // 获取浮层配置
  sendCoupon: '/restapi/soa2/12673/ReceiveCouponByAwardId', // 执行发券
  getPromotionCoupon: '/restapi/soa2/12673/queryCouponByPackageId', // 有登录态  查询领券状态
}

const requestUrl = (urlName, params, successCallback, errCallback) => {
  cwx.request({
    url: ServerUrls[urlName],
    data: params,
    success: function (res) {
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
        successCallback && successCallback(res.data);
      } else {
        errCallback && errCallback(res);
      }
    },
    fail: function (res) {
      errCallback && errCallback(res);
    }
  });
} 

Component({
  properties: {
    
  },
  data: {
    floatConfig: {},
    isShowFloat: false,
    loginStatus: false,
    id:0,
    allianceid: '',
    sid: '',
    specialParameters: '',   // 有点时候根据特殊参数控制展示浮层
    floatStep: 1,   // 领券步骤  1 2 3
    getBtnWidthLogin: false,
    couponList: [],
    hasReceive: false,    // 已经领取过券（无论是否全部领取）
    activityId:''
  },
  pageLifetimes: {
    show: function() {
      mPage = cwx.getCurrentPage()
      pageId = mPage ? (mPage.pageid || mPage.pageId || "") : ""
      _this=getCurrentPages()[getCurrentPages().length - 1] || {}
      openid= cwx.cwx_mkt?.openid || ''
      this.setData({
        activityId: _this.options?.activityid || '',
        allianceid: _this.options?.allianceid || '',
        sid: _this.options?.sid || '',
        specialParameters: _this.options?.specialParameters || ''
      })
      
      // this.initComp(_this.options.activityid)
    }
  },
  lifetimes: {
    // taro页面会先进入ready方法 2021-11-04
    ready: function() {
      _this=getCurrentPages()[getCurrentPages().length - 1] || {}
      
      if(!this.data.activityId) {
        this.setData({
          activityId: _this?.options?.activityid || '',
          allianceid: _this?.options?.allianceid || '',
          sid: _this?.options?.sid || '',
          specialParameters: _this?.options?.specialParameters || ''
        }, () => {
          this.initComp(this.data.activityId || _this?.options?.activityid)
        })
      } else {
        this.initComp(this.data.activityId || _this?.options?.activityid)
      }

      mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
        "openid":cwx.cwx_mkt.openid || '',
        "action": "lifetimesReady",
        "platform":"wechat",
        "pageid": mPage ? (mPage.pageid || mPage.pageId || "") : "",
        "activityId": this.data.activityId || _this.options?.activityid
      });
    },
  },
  methods: {
    initComp(activityId) {
      if(!activityId) {
        return
      }
      const that = this
      const floatCfgPromise = new Promise((resolve, reject) => {
        that.getActivityConfig(activityId,resolve,reject)
      })

      const userStatePromise = new Promise((resolve, reject) => {
        that.checkLogin(resolve, reject)
      })

      Promise.all([floatCfgPromise, userStatePromise]).then(resultList => {
        // 检查是否展示浮层
        // 2020.12.08  新增是否有库存判断
        that.checkStock((resultList)=>{
          if(resultList && resultList[0] && resultList[0].isShowFloat) {
            // 设置初始步骤
            let stepCount = that.data.floatConfig.step - 0 
            let initStep = stepCount > 2 ? 1 : 2
            if(resultList[1] && resultList[1].loginStatus) {
              // 如果全部领取了  就不出浮层了
              if(!resultList[1].hasUnReceive) {
                that.setData({
                    isShowFloat: false
                  });
              } else if(resultList[1].hasReceive) {
                // 已登录  已领券
                that.setData({
                  isShowFloat: true,
                  floatStep: 3
                },()=>{
                  mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
                    "openid":openid,
                    "action": "showCouponFloat",
                    "platform":"wechat",
                    "pageid": pageId,
                    "allianceid": that.data.allianceid,
                    "sid": that.data.sid,
                    "activityId": that.data.activityId
                  });
                })
              } else {
                // 已登录  未领券  检查新老客(这个检查过程  只要传递了券包ID后  服务端自动判断)  获取该展示的优惠券列表
                  that.getPromotionCoupon()
                  that.setData({
                    isShowFloat: true,
                    floatStep: initStep
                  },()=>{
                    mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
                      "openid":openid,
                      "action": "showCouponFloat",
                      "platform":"wechat",
                      "pageid": pageId,
                      "allianceid": that.data.allianceid,
                      "sid": that.data.sid,
                      "activityId": that.data.activityId
                    });
                  })
              }
            } else {
              // 未登录  保留初始状态
              that.getPromotionCoupon()
              that.setData({
                isShowFloat: true,
                floatStep: initStep
              },()=>{
                mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
                  "openid":openid,
                  "action": "showCouponFloat",
                  "platform":"wechat",
                  "pageid": pageId,
                  "allianceid": that.data.allianceid,
                  "sid": that.data.sid,
                  "activityId": that.data.activityId
                });
              })
            }
          } else {
            that.setData({
              isShowFloat: false
            })
            return;
          }
        },resultList)
        
      }).catch(error => {
        console.log(error)
      });
    },

    getActivityConfig(activityId, resolve, reject) {
      const that = this
      if(!activityId) {
        reject('no activityId');
      } else {
        requestUrl('getActivityConfig',{
          activityId: activityId
        }, res => {
          if(res.errcode == 0) {
            res.activitlyConfig.startTime= that.getTimeStamp(res.activitlyConfig.startTime)
            res.activitlyConfig.endTime= that.getTimeStamp(res.activitlyConfig.endTime)

            let floatConfig = Object.assign({},res.activitlyConfig, res.activityCustomfields)
            that.setData({
              floatConfig: floatConfig
            },()=>{
              that.handleIsShowFloat(resolve, reject)
            })
          } else {
            reject('getActivityConfig error')
          }
          mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
            "openid":openid,
            "action": "getActivityConfig",
            "platform":"wechat",
            "pageid": pageId,
            "activityId": that.data.activityId,
            "res": res
          });
        }, error => {
          mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
            "openid":openid,
            "action": "getActivityConfig Error",
            "platform":"wechat",
            "error": JSON.stringify(error),
            "pageid": pageId
          });
          reject('getActivityConfig error')
        })
      }
    },

    handleIsShowFloat(resolve,reject) {
      const {floatConfig, allianceid, sid, specialParameters} = this.data
      let _show = true;
      const now = new Date().getTime()
      // 分渠道展示
	  console.log('分渠道展示floatConfig', floatConfig)
      if(floatConfig.fullDisplay == 'false' || !floatConfig.fullDisplay) {
		  
        if(floatConfig.pageId && floatConfig.pageId != _this.pageId) {
          // pageId 不匹配  不展示
          _show= false
        }
        if(floatConfig.allianceid && floatConfig.allianceid != allianceid) {
          // allianceid 不匹配  不展示
		  console.log('渠道错误 不展示浮层')
          _show= false
        }
        if(floatConfig.sid && floatConfig.sid != sid) {
          // sid 不匹配  不展示
          _show= false
        }
        if(floatConfig.specialParameters && floatConfig.specialParameters != specialParameters) {
          // specialParameters 不匹配  不展示
          _show= false
        }
      } 

      if(now > floatConfig.endTime || now < floatConfig.startTime) {
        // 当前时间不在活动时间范围内
        _show= false
      }  

      if(_show) {
        resolve({
          isShowFloat: true
        })
      } else {
        resolve({
          isShowFloat: false
        })
      }
    },

    checkLogin(resolve,reject) {
      var that = this;
      cwx.user.checkLoginStatusFromServer(function (checkLoginRes) {
        if (!checkLoginRes) {
          that.setData({
            loginStatus: false,
            getBtnWidthLogin: false
          },()=>{
            resolve({ loginStatus: false })
          })
        } else {
          that.setData({ 
            loginStatus: true,
            getBtnWidthLogin: true
          }, ()=>{
            // 如果已经登陆了  检查是否领取过券
          that.getPromotionCoupon(resolve, reject)
          });
        }        
        console.log("============islogin=" + checkLoginRes + "====================")
      });
    },

    checkStock(cb,cbAgs) {
      const _packageId = this.data.floatConfig && this.data.floatConfig.packageId - 0 || 0
      requestUrl('getPromotionCoupon',{
        packageId: _packageId
      }, res => {
        mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
          "openid":openid,
          "action": "checkStock",
          "platform":"wechat",
          "pageid": pageId,
          "packageId": _packageId,
          "res": res
        });
        if(res.errcode == 0 && res.couponList && res.couponList.some) {
          // 新增逻辑 判断是否全部无库存了  任意一个大于0  就需要出浮层
          let hasStock = res.couponList.some(item => {
            return item.generateCountLeft > 0
          })
          if(hasStock) {
            cb && cb(cbAgs)
          }
        } else {
          return false
        }
      })
    },

    /*
    *  查询领券详情
    */
   getPromotionCoupon(resolve,reject) {
      const that = this
      const _packageId = this.data.floatConfig && this.data.floatConfig.packageId - 0 || 0
      requestUrl('getPromotionCoupon',{
        packageId: _packageId
      }, res => {
        mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
          "openid":openid,
          "action": "getPromotionCoupon",
          "platform":"wechat",
          "pageid": pageId,
          "packageId": _packageId,
          "res": res
        });
        if(res.errcode == 0) {
          // 判断是否全部领取了
          let _hasUnReceive = res.couponList.some(item => {
            return item.status == 0
          })

          // 判断有没有领取过任意一张优惠券
          let _hasReceive = res.couponList.some(item => {
            return item.status == 1
          })

          res.couponList.map(item => {
            // item.formatDisableDate = this.formatTime(item.disableDate)
            if(item.deductionType == 1) {
              item.discount = (100-item.discountAmount)/10 + ''
              item.discount1 = item.discount.split('.')[0]
              item.discount2 = item.discount.split('.')[1] ? '.'+item.discount.split('.')[1] : ''
            }
            return item
          })

          that.setData({
            couponList: res.couponList
          })
          resolve && resolve({
            loginStatus: true,
            hasReceive: _hasReceive,
            hasUnReceive: _hasUnReceive
          })
        } else {
          reject && reject('getPromotionCoupon error')
        }
      })
    },

    /*
    *  登录
    */
    handleLogin(res) {
      let awardId = res.target && res.target.dataset && res.target.dataset.awardid

      const that = this;
      cwx.user.login({
        callback: function (ret) {
          if(ret && ret.ReturnCode == "0") {
            that.setData({ 
              loginStatus: true,
              getBtnWidthLogin: true
            })
            if(that.data.floatStep == 1) {
              that.setData({ 
                floatStep: 2
              })
            }
            // 登录后 重新获取登录态下的券列表
            // 如果是点击具体优惠券  立即领取 过来的登录  将执行静默发券
            if(awardId) {
              that.handleSendCoupon(res,that.getPromotionCoupon.bind(that))
            } else {
              that.getPromotionCoupon()
            }
          } else {
            that.setData({ receiveLoading: false })
            wx.showToast({ title: '登录失败', icon: 'none' })
          }
        }
      })
    },

    openRedEnvelope() {
      this.setData({
        floatStep: 2
      })
    },
    /*
    *  领券
    */
   handleSendCoupon(e,cb) {
     let _awardId = e.target && e.target.dataset && e.target.dataset.awardid || 0

     mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
      "openid":openid,
      "action": "handleSendCoupon",
      "platform":"wechat",
      "pageid": pageId,
      "allianceid": this.data.allianceid,
      "sid": this.data.sid,
      "activityId": this.data.activityId,
      "awardId": _awardId
    });
    const _packageId = this.data.floatConfig.packageId - 0 || -1
    const _ts = new Date().getTime();
    const _nonce = Math.random().toString().slice(2,10)
    const _sign = cwx.md5(`${_packageId}_${_awardId}_${_ts}${_nonce}gk3y582mkth5ni28a9`);

    requestUrl('sendCoupon',{
      packageId: _packageId,
      awardId: _awardId,
      ts: _ts,
      nonce: _nonce,
      sign:_sign
    }, res => {
      if(res.errcode == 0) {
        // 领取完毕后  将该奖品详情 合并到列表中
        let _list = this.data.couponList.map(item => {
          if(item.awardId == _awardId) {
            item.status = 1
            this.triggerEvent('sendCouponSuccess',item.userProductLineIDsName);
          }
          return item
        })
        this.setData({
          couponList: _list
        })
        mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
          "openid":openid,
          "action": "sendCouponSuccess",
          "platform":"wechat",
          "pageid": pageId,
          "allianceid": this.data.allianceid,
          "sid": this.data.sid,
          "activityId": this.data.activityId,
		  "_awardId": _awardId
        });
      } else if(res.errcode == 111){
        wx.showToast({
          title: '您已领取过',
          icon:'none'
        })
      } else {
        wx.showToast({
          title: '领取失败',
          icon:'none'
        })
        mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
          "openid":openid,
          "action": "sendCouponError",
          "platform":"wechat",
          "pageid": pageId,
          "error": res,
		  "_awardId": _awardId
        });
      }
      cb && typeof cb == 'function' && cb()
    }, error => {
      wx.showToast({
        title: error,
        icon:''
      })
      mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_coupon_float_comp', {
        "openid":openid,
        "action": "sendCouponError",
        "platform":"wechat",
        "pageid": pageId,
        "error": error,
		"_awardId": _awardId
      });
    })
   },
   getTimeStamp(str) {
      if(!str) {
        return 0
      }
      return str.match(/\d{13}/) && str.match(/\d{13}/)[0] && str.match(/\d{13}/)[0]-0
    },
    formatTime(disableTime) {
      disableTime = disableTime.match(/\d{13}/) && disableTime.match(/\d{13}/)[0] && disableTime.match(/\d{13}/)[0]-0

      const year = new Date(disableTime).getFullYear();
      const month = (new Date(disableTime).getMonth() + 1) < 10 ? '0' + (new Date(disableTime).getMonth() + 1) : (new Date(disableTime).getMonth() + 1)
      const day = new Date(disableTime).getDate() < 10 ? '0' + new Date(disableTime).getDate() : new Date(disableTime).getDate()

      return year + '-' + month + '-' + day + '前可用'
    },
    goTargetUrl (e) {
      let targetUrl = e.target && e.target.dataset && e.target.dataset.url;
      const that = this;

      if(!targetUrl) {
        this.setData({
          isShowFloat: false
        })
        return
      }
      if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
        // 跳转H5页面
        cwx.component.cwebview({
          data: {
            url: encodeURIComponent(targetUrl)
          }
        })
      } else {
        targetUrl.trim()
        if(targetUrl[0] != '/') {
          targetUrl = '/' + targetUrl.trim()
        }
        cwx.navigateTo({
          url: targetUrl,
          fail: function (e) {
            that.setData({
              isShowFloat: false
            })
          }
        });
      }
    },
    closeFloat() {
      this.setData({
        isShowFloat: false
      })
    }
  }
})