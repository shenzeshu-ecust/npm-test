import { cwx, _, getHost, locateSource } from '../common.js';
var ticketmodel = require('../service/ticketmodel.js');
import CWebviewBaseClass from '../../../cwx/component/cwebview/CWebviewBaseClass';

class WebView extends CWebviewBaseClass {
    constructor(props) {
        super(props);
        Object.assign(this, {
            onLoad: function (options) {
                this._pageUrl = this.formatUrl(options);
                if (this._pageUrl.length <= 0){
                  this.showUrlError();
                  return;
                }
                this.getLocation(() => this.cwebviewLoad(options));
              },
               // cwebview 的onload copy 过来
              cwebviewLoad: function(options) {
                var data = options.data || {};
                if(typeof data === 'string'){
                  try{
                    data = JSON.parse(data);
                  }catch(e){
                    this.showUrlError()
                  }
                }
                try{
                    var t= {};
                    for(var p in data){
                      if(data[p]){
                        t[p] = data[p];
                      }
                    }
                    this.setData(t);
                }catch(e){
                    //
                    console.error('onload assign', e)
                }
                var url = data.url || options.url ||  this._pageUrl;
                url = decodeURIComponent(url)
                if ( url.length <= 0){
                  this.showUrlError()
                  return
                }
                var needLogin = data.needLogin;
                var envIsMini = data.envIsMini || false
                var isNavigate = true   //默认true
                if (typeof data.isNavigate != 'undefined'){
                  isNavigate = data.isNavigate
                }
                var loginErrorUrl = decodeURIComponent((data.loginErrorUrl || url))
                this.setData({
                  envIsMini: envIsMini,
                  isNavigate: isNavigate,
                  loginErrorUrl: loginErrorUrl
                })

                if(!needLogin){
                  var auth = cwx.user.auth
                  if (!auth || auth.length<=0){ //没有登录每次去除登录态
                    url = this.getLoginTokenUrl('',url)
                  }
                  this.webLoadUrl(url)
                }else{
                  this.webGetToken(url)
                }
              },

              formatUrl: function (options) {
                let data = options.data;
                if(!data && options.pagename) {
                  data = `${options.pagename}?`;
                  const opkeys = Object.keys(options);
                  data = opkeys.reduce((accdata,cur) => {
                    if(cur === 'pagename') {
                      return accdata;
                    }
                    accdata += `${cur}=${options[cur]}&`;
                    return accdata;
                  },data);
                  opkeys.length > 1 && (data = data.slice(0,-1));
                }else {
                  !data && (data = 'https%3A%2F%2Fm.ctrip.com%2Fwebapp%2Fticket%2Fgrouplist%3Fpopup%3Dclose');
                }
                if(!/^http/.test(data)) {
                  const host = getHost();
                  //判断是否有aid，sid，没有补全
                  if(data.indexOf('allianceid') < 0 && data.indexOf('sid') < 0 ) {
                    cwx.mkt.getUnion(({allianceid, sid}) => {
                      if(allianceid && sid) {
                        data += `&allianceid=${allianceid}&sid=${sid}`;
                      }
                    })
                  }
                  return `https://${host}/webapp/ticket/${data}`;
                  // return 'http://localhost:3055/voicepoidetail?optionid=1000624081';
                }
                console.log('data url is:', data)
                return data;
              },

              getLocation: function(callback) {
                cwx.locate.startGetCtripCity((data) => {
                  let geoCity = data && data.data && data.data.CityEntities || [];
                  console.log(geoCity);
                  if (!_.isEmpty(geoCity)) {
                    this.getCityInfo({
                      pageid: this.pageId,
                      cityId: geoCity[0].cityID || geoCity[0].CityID
                    }, callback)
                    return;
                  }
                  callback();
                }, locateSource)
              },

              getCityInfo: function(data, callback) {
                ticketmodel.GetCityInfoModel.request({
                  data: data,
                  success: function(res) {
                    if (res && res.provinceId) {
                      this._pageUrl = `${this._pageUrl}&provinceid=${res.provinceId}`
                    }
                    callback()
                  }.bind(this),
                  fail: function(e) {
                    callback();
                  }
                })
              },
        });
    }
}
new WebView().register();
