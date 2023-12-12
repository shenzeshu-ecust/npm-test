import { cwx, CPage, _ } from '../../../cwx/cwx.js';


export const unlimitQRCode = {
    data: {

    },
    onLoad(options) {
      var optionScene = options.scene ? decodeURIComponent(options.scene) : "";
      //var optionScene = 'mkt_DB90890C45EB84AB'; //todo 测试

      this.ubtDevTrace('mkt_Bcode_midpage', {scene: optionScene});

      if (optionScene) {
          this.getSceneConfig(optionScene);
      }
    },
    /**
    * 处理无限量二维码，根据url中的scene，获取对应的配置地址并跳转
    */
  getSceneConfig(optionScene) {
    var that = this,
        params = {},
        beforeRequestTime = new Date();

    params = {
      "appid": cwx.appId,
      "scene": optionScene,
      "path": this.route,
      "exInfo": null
    };

    this.ubtDevTrace('mkt_Bcode_midpage', {action: 'getSceneConfig', request: params, requestTime: beforeRequestTime});

    cwx.request({
        url: "/restapi/soa2/12673/exchangeAppPath",
        method: "POST",
        data: params,
        success: function(res) {
            if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
                if (Number(res.data.errcode) == 0) {
                  that.goTargetUrl(res.data.fullpath);
                } else {
                  that.ubtDevTrace('mkt_Bcode_midpage', {action:'getSceneConfig success',timeDuration: (new Date() - beforeRequestTime) + "ms", errcode: res.data.errcode, errmsg: res.data.errmsg});
                  that.goHome();
                }
            } else {
                that.ubtDevTrace('mkt_Bcode_midpage', {action: 'getSceneConfig ResponseStatus not success', timeDuration: (new Date() - beforeRequestTime) + "ms", response: JSON.stringify(res || "")});
                that.goHome();
            }
        },
        fail: function(e) {
            that.ubtDevTrace('mkt_Bcode_midpage', {action: 'getSceneConfig fail', timeDuration: (new Date() - beforeRequestTime) + "ms", response: "错误信息：" + e});
            that.goHome();
        }
    });
    },

    /**
    * 跳转到目标页
    */
    goTargetUrl(targetUrl) {
      var that = this;
      if (targetUrl.indexOf('pages/home/homepage') !== -1) {
        //针对首页
        cwx.reLaunch({ url: "/" + targetUrl.trim() });
      } else if (targetUrl.includes('pages/you/destination/destination') || targetUrl.includes('pages/you/lvpaiHome/lvpaiHome')|| targetUrl.includes('pages/schedule/index/index')|| targetUrl.includes('pages/myctrip/index/index')) {
        //针对tab切换页，手动写入业绩
        var targetQuery = decodeURIComponent(targetUrl);
        cwx.mkt.setUnion({
          allianceid: this.getUrlQuery(targetQuery, 'allianceid') || '',
          sid: this.getUrlQuery(targetQuery, 'sid') || '',
          ouid: this.getUrlQuery(targetQuery, 'ouid') || '',
          sourceid: this.getUrlQuery(targetQuery, 'sourceid') || ''
        });
        cwx.switchTab({url: "/" + targetUrl.trim()});
      } else if (targetUrl) {
        cwx.redirectTo({
          url: "/" + targetUrl.trim(),
          fail: function (err) {
            cwx.reLaunch({
              url: "/" + targetUrl.trim(),
              fail: function (e) {
                that.ubtDevTrace('mkt_Bcode_midpage', { action:'goTargetUrl error', targetUrl: targetUrl, errmsg: "错误信息：" + (e.errMsg || e) });
                that.goHome();
              }
            })
          }
        });
      } else {
        that.goHome();
      }
    },

    /**
    * 跳转到首页
    */
    goHome() {
      cwx.switchTab({ url: "/pages/home/homepage" });
    },

    getUrlQuery(url, key) {
      var locationArr = url.split('?')

      if (locationArr.length < 2) {
        return
      }

      var query = locationArr[1]

      if (!query) {
        return
      }

      var params = query.split('&')

      for (let i = 0; i < params.length; i++) {
        var pair = params[i].split('=')

        if (pair[0] === key) {
          return pair[1]
        }
      }

      return
    }
}