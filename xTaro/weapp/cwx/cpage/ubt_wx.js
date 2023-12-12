/**
 * @module cwx\ubt_wx
 */
 let cAppOnError = require("../ext/app/cwx.cAppOnError.js").default;
 let __global = require('../ext/global.js').default;
 let UZip = require('../ext/uzip').default;
 let cwx = __global.cwx || {};
 let ubtConfig = __global.ubtConfig || {};
 let VERSION = '3.2.1';
 let STORAGE_KEY = 'CTRIP_UBT_M';
 let SESSION_MAX_LIEFTIME = 1800000;
 let SDK_AGENT_ENV = 'weixin';
 let noop = function () { }

 cwx.Observer.addObserverForKeyOnly("CIDReady", function () {
    cwx.configService.watch('ubtConfig', (res) => {
        Object.assign(__global.ubtConfig, res);
        if (__global.ubtConfig.isMultiPost) {
            SS.startIntervalSend();
        } else {
            SS.closeIntervalSend();
        }
    })
 })



 // cwx.clientID = wx.getStorageSync("clientID") || ""
 // var cwxscoket = require('../ext/cwx.socket.js');
 //获取开关需要等CID，改代码造成载入卡顿
 //希望添加到CID服务返回之后~ tczhu
 // cwx.request({
 //   url: '/restapi/soa2/10290/GetConfigData.json?category=ubt-wechat&ver=1.0&rev=-1&format=json',
 //   method: "GET",
 //   success: function(res){
 //     if (res.statusCode == 200 && res.data){
 //       res = res.data.Result;
 //       try{
 //         res = JSON.parse(res);
 //         useSocket = res.properties.websocket;
 //       }catch(e){}
 //     }
 //   }
 // })
 // var useSocket = 0;
 
 // var cwxscoket = require('../ext/cwx.socket.js');
 //
 // if (cwx.clientID && cwx.clientID.length) {
 // 	isUseSocket();
 // } else {
 // 	cwx.Observer.addObserverForKey('CIDReady', function () {
 // 		isUseSocket();
 // 	})
 // }
 // function isUseSocket() {
 // 	//console.error(cwx.clientID);
 // 	var url = 'https://m.ctrip.com/restapi/socketio/abService/getConfig?version=4&cwxClientId=' + cwx.clientID;
 // 	if (__global.env.toLowerCase() === 'uat') {
 // 		url = 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/socketio/abService/getConfig?version=4&cwxClientId=' + cwx.clientID;
 // 		//console.error('uat');
 // 	}
 // 	wx.request({
 // 		url: url,
 // 		method: "GET",
 // 		success: function (res) {
 // 			if (res.statusCode == 200 && res.data) {
 // 				res = res.data;
 // 				//console.error(res);
 // 				try {
 // 					if (typeof (res) == 'string') {
 // 						res = JSON.parse(res);
 // 					}
 // 					//console.error(res);
 // 					useSocket = res.ABTesting;
 // 					if (useSocket == 0 || useSocket == 'False' || useSocket == '0') {
 // 						cwx._useSocket = '0';
 // 						wx.setStorageSync('globalUseSocket', '0');
 // 					} else {
 // 						cwx._useSocket = '1';
 // 						wx.setStorageSync('globalUseSocket', '1');
 // 					}
 // 					//useSocket = 0;
 // 				} catch (e) {
 // 					console.error(e);
 // 				}
 // 			}
 // 		}
 // 	})
 // }
 
 const Y = {
     _data_: {},
 
     now: function () {
         return new Date().getTime()
     },
 
     isNStr: function (obj) {
         var t = typeof obj;
         return obj && (t === "number" || t === "string" || t === 'boolean');
     },
 
     isNumeric: function (obj) {
         var t = typeof obj;
         return (t === "number" || t === "string") && !isNaN(obj - parseFloat(obj));
     },
     isFunction: function (fun) {
         return typeof fun === 'function';
     },
     isArray: function (obj) {
         return Array.isArray(obj);
     },
 
     makeSlice: function (l, v) {
         var arr = [];
         for (var i = 0; i < l; i++) {
             arr[i] = v;
         }
         return arr;
     },
 
     hash: function (str) {
         var hash = 1, charCode = 0, idx;
         if (!!str) {
             hash = 0;
             for (idx = str.length - 1; idx >= 0; idx--) {
                 charCode = str.charCodeAt(idx);
                 hash = (hash << 6 & 268435455) + charCode + (charCode << 14);
                 charCode = hash & 266338304;
                 hash = charCode != 0 ? hash ^ charCode >> 21 : hash;
             }
         }
         return hash;
     },
     random: function () {
         return ("" + Math.random()).slice(-8);
     },
     uniqueID: function () {
         return Y.random() ^ Y.now() & 2147483647;
     },
     check_tags: function (tag) {
         var keys = Object.keys(tag),
             l = keys.length;
         if (l > 50) return 10;
         for (var i = 0; i < l; i++) {
             var v = tag[keys[i]],
                 t = typeof v;
             if (typeof v == 'string') {
                 tag[keys[i]] = v.substring(0, 300);
             } else if (t == 'number' || t == 'boolean') {
                 //nothing
             } else if (t == 'undefined') {
                 tag[keys[i]] = 'undefined'
             } else {
                 return 110;
             }
         }
         return 1;
     },
 
     encode: function (str) {
         return encodeURIComponent(str);
     },
 
     store: function (name, value, fn) {
         if (typeof value == 'object') {
             value = JSON.stringify(value);
         }
 
         try {
            WxStorageKeeper.setStorageSync(name, value)
         } catch (e) { }
 
         fn(1);
     },
 
     getStore: function (name, fn) {
         var value = WxStorageKeeper.getStorageSync(name)
         if (value) {
             return fn(JSON.parse(value));
         } else {
             return fn('');
         }
     },
 
     validName: function (k) {
         return k && (typeof k == 'string' || this.isNumeric(k));
     },
 
     validMap: function (m) {
         if(m == null) return false;
         var keys = Object.keys(m);
         var len = keys.length;
         for (var i = 0; i < len; i++) {
             var k = keys[i];
             var v = m[k];
             var _type = typeof v;
             if (!(_type == 'string' || this.isNumeric(v) || _type == 'boolean')) {
                 return false;
             }
         }
         return true;
     },

    /**
     * UbtData转换
     * @param data 
     * @returns 
     */
     transformUbtData: function(data) {
        if(!data) return data;
        //非Object不做处理
        if (Object.prototype.toString.call(data) != '[object Object]') {
            return data;
        }
        let res = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                switch (typeof data[key]) {
                    case 'undefined':
                        res[key] = '';
                        break;
                    case 'object':
                        res[key] = JSON.stringify(data[key]);
                        break;
                    default:
                        res[key] = data[key];
                        break;
                }
            }
        }
        return res;
     },
 
     sendUbtByPost(data, callback) {
         let requestStr = '', _pre = 'm1Legacy!';
         if (Y.isArray(data)) {
             data.forEach(item => {
                 requestStr += `${_pre}${item}\r\n`;
             })
         } else {
             requestStr = _pre + data;
         }
         wx.request({
             url: 'https://s.c-ctrip.com/bee/collect',
             method: 'POST',
             data: {
                 d: `f00${new Date().getTime()}!${requestStr}`
             },
             complete: function (res) {
                 callback && callback(res);
             }
         })
     },
 
     sendUbtByImg(data, callback) {
         wx.request({
             url: `https://s.c-ctrip.com/bf.gif?${data}`,
             header: {
                 'Content-Type': 'image/gif'
             },
             method: 'GET',
             dataType: 'image',
             complete: function (res) {
                 callback && callback(res);
             }
         })
     }
 }
 
 /**
  * 获取信息
  */
 // var defaultClientId = ('').padEnd(20, '0');
 var defaultClientId = '00000000000000000000';
 var agentInfo = (function () {
     var data = {
         clientID: defaultClientId
     };
     //= 通过wx接口获取的设备数据
     function initDevice() {
         if (typeof wx == 'object') {
             wx.getNetworkType({
                 success: function (res) {
                     data['networkType'] = res.networkType
                 }
             });
 
             wx.getSystemInfo({
                 success: function (res) {
                     if (res.errMsg == 'getSystemInfo:ok') {
                         data['language'] = res.language;
                         data['version'] = res.version;
                         data['model'] = res.model; //'iPhone 6'
                         data['pixelRatio'] = res.pixelRatio;
                         data['windowWidth'] = res.windowWidth;
                         data['windowHeight'] = res.windowHeight;
 
                         data['system'] = res.system;
                         data['platform'] = res.platform;
                         data['ver'] = res.SDKVersion;
                     }
                 }
             });
 
         }
     }
 
 
     function setGeoCity(resp) {
         if (resp && resp.data) {
             try {
                 data['ctripcity'] = resp.data.CityEntities[0].CityName;
             } catch (e) { }
         }
     }
     //=
     function initCWXData() {
         if (typeof cwx == 'object') {
             data['clientID'] = cwx.clientID || defaultClientId;
             data['user'] = cwx.user;
 
             if (cwx.mkt) {
                 cwx.mkt.getUnion(function (unionData) {
                     let exmktid;
                     unionData = unionData || {};
                     try {
                         exmktid = JSON.parse(unionData['exmktid'])
                     } catch (e) {
                         exmktid = {}
                     }
 
                     unionData = unionData || {};
                     //{"allianceid": "262684", "sid": "711465", "ouid": "', "sourceid": "55552689", "exmktid":"{\"ReferralCode\":\"A5D6\"}"}
                     data['allianceid'] = unionData['allianceid'];
                     data['alliancesid'] = unionData['sid'];
                     data['allianceouid'] = unionData['ouid'];
                     data['sourceid'] = unionData['sourceid'];
                     data['exmktid'] = unionData['exmktid'];
                     data['innerouid'] = exmktid['innerouid'];
                     data['innersid'] = exmktid['innersid'];
                     data['pushcode'] = exmktid['pushcode'];
                 });
             }
 
             if (cwx.locate) {
                 let c_point = cwx.locate.getCachedGeoPoint();
                 let c_city = cwx.locate.getCachedCtripCity();
 
                 if (c_city) {
                     setGeoCity(c_city)
                 }
 
 
                 if (c_point) {
                     data['geo'] = {
                         "latitude": c_point.latitude || 0,
                         "longitude": c_point.longitude || 0
                     }
                 }
 
                 if (c_city && c_city.data) {
                     if (typeof data['geo'] === 'undefined' && c_city.data.gpsInfo && c_city.data.ctripPOIInfo) {
                         data['geo'] = {};
                     }
                     if (c_city.data.gpsInfo) {
                         data.geo['gpsLatitude'] = c_city.data.gpsInfo.latitude || 0;
                         data.geo['gpsLongitude'] = c_city.data.gpsInfo.longitude || 0;
                     }
                     if (c_city.data.ctripPOIInfo) {
                         data.geo['gpsCity'] = c_city.data.ctripPOIInfo.districtName || '';
                         data.geo['gpsCityId'] = c_city.data.ctripPOIInfo.districtID || 0;
                         data.geo['gpsCountry'] = c_city.data.ctripPOIInfo.country || '';
                     }
                 }
 
             }
         }
     }
 
     if (typeof cwx == 'object') {
         data['clientID'] = cwx.clientID || defaultClientId;
 
         /**
          *  1、cwx.user.auth：当前登录态
          *	2、cwx.user.duid： UBT 使用duid 加密串
          *	3、cwx.user.checkLoginStatusFromServer(callback); //立即网络请求检测，异步
          *	4、cwx.user.isLogin(); //内存判断，同步
          */
         data['user'] = cwx.user;
     }
 
     return {
 
         get: function (name, defaultValue) {
             return data[name] || defaultValue;
         },
 
         init: function () {
             initDevice();
             initCWXData();
         }
     }
 })();
 
 /**
  *  只能占用一个request请求，所有数据走通过Q发送
  */
 var Q = (function (_extend) {
     var queue = [],
         leisure = true;
 
     function send() {
         leisure = false;
         var data = queue.shift();
         if (data._extend.method && data._extend.method.toUpperCase() === "POST") {
             Y.sendUbtByPost(data.data, () => {
                 if (queue.length < 1) {
                     leisure = true;
                 } else {
                     setTimeout(function () {
                         send();
                     }, 50)
                 }
             })
         } else {
             Y.sendUbtByImg(data.data, () => {
                 if (queue.length < 1) {
                     leisure = true;
                 } else {
                     setTimeout(function () {
                         send();
                     }, 50)
                 }
             });
         }
     }
 
     return {
         add: function (data, priority, _extend) {
             if (typeof data == 'string') {
                 let _data = {
                     data,
                     _extend
                 };
                 priority ? queue.unshift(_data) : queue.push(_data);
                 if (leisure) {
                     send();
                 }
                 return queue.length;
             } else {
                 return false;
             }
         },
 
         length: function () {
             return queue.length;
         }
     }
 })();

function getValueSize(value) {
  return Number(((value.length * 2) / Math.pow(2, 10)).toFixed(2));
}

class StorageKeeper {
  currentSize = 0
  currentKeys = new Set()
  constructor() {
    var storageInfo = wx.getStorageInfoSync() || {};
    const storageKeys = (storageInfo.keys || []).filter(k=>k === "CTRIP_UBT_M" || /^cwx_ubt_pending_\d+$/.test(k));
    this.currentKeys = new Set(storageKeys);
    var currentSize = storageKeys.reduce((size, key) => {
        try {
            var value = wx.getStorageSync(key);
            var valueSize = getValueSize(value);
            return size + valueSize;
        } catch (error) {
            return size;
        }
    }, 0);
    this.currentSize = currentSize;
  }
  getStorageSync(key) {
      return wx.getStorageSync(key)
  }
  setStorageSync(key, value) {
    var valueSize = getValueSize(value);
    wx.setStorageSync(key, value);
    this.currentSize += valueSize
    this.currentKeys.add(key);
  }
  removeStorageSync(key) {
      var value = this.getStorageSync(key) || "";
      var valueSize = getValueSize(value);
      if(value) { 
        wx.removeStorageSync(key);
        this.currentKeys.delete(key);
        this.currentSize -= valueSize;
      }
  }
}

var WxStorageKeeper = new StorageKeeper();
 /**
  * StorageSender
  * 本地缓存发送
  */
 class SS {
     //轮询调度timer
     static timer = null;
     //处于发送中的项
     static sendingItems = new Set();
     //ubt缓存存储Key前缀
     static UBT_STORAGE_PENDING_PREFIX = "cwx_ubt_pending";
     //ubt缓存存储Key前缀
     static UBT_STORAGE_SENDING = "cwx_ubt_sending";
 
     /**
      * 添加待发送数据
      * @param {*} data 
      * @returns 
      */
     static addPendingItme(data) {
         try {
             let storageSize = WxStorageKeeper.currentKeys.size;
             //预留10个位置，当超出个数限制走image发送
             if (storageSize <= ubtConfig.mpStoreMaxCount
                && WxStorageKeeper.currentSize <= ubtConfig.storageMaxSize
                //  && storagInfo.keys.length <= ubtConfig.mpStoreMaxCount
                //  && (storagInfo.limitSize - storagInfo.currentSize > ubtConfig.reserveStorageSize)
             ) {
                 let hashData = Y.hash(data);
                 WxStorageKeeper.setStorageSync(`${SS.UBT_STORAGE_PENDING_PREFIX}_${hashData}`, data);
                 return true;
             }
         } catch (error) {
             console.log(error)
         }
         return false;
     }
 
     //添加正在发送中的项
     static addSendingItems(keys) {
         if (keys == null) return;
         if (Y.isArray(keys)) {
             keys.forEach(key => SS.sendingItems.add(key));
         } else {
             SS.sendingItems.add(keys)
         }
     }
 
     //删除正在发送中的项
     static removeSendingItems(keys) {
         if (keys == null) return;
         if (Y.isArray(keys)) {
             keys.forEach(key => SS.sendingItems.delete(key));
         } else {
             SS.sendingItems.delete(keys)
         }
     }
 
     /**
      * 获取待发送ubt列表
      * @returns 
      */
     static getWillSendingUbts() {
         let keys = [], vals = [], size = 0;
         try {
             let storageKeys = [...WxStorageKeeper.currentKeys.values()];
             for (let i = 0; i < storageKeys.length; i++) {
                 let curKey = storageKeys[i];
                 if (size >= ubtConfig.mpMaxSize){
                    break;
                 }
                     
                 if (keys.length >= ubtConfig.mpMaxCount) {
                    break;
                 }
                     // if (keys.length >= 200)
                     
                 //确保不会重复发送
                 if (SS.sendingItems.has(curKey))
                     continue;
                 if (/^cwx_ubt_pending_\d+$/.test(curKey)) {
                     let curVal = WxStorageKeeper.getStorageSync(curKey);
                     if (curVal) {
                         size += curVal.length;
                         vals.push(curVal);
                         keys.push(curKey);
                        } else {
                         WxStorageKeeper.removeStorageSync(curKey);
                     }
                 }
             }
         } catch (error) {
             console.log(error);
         }
         return {
             keys,
             vals
         }
     }
 
     /**
      * 发送ubt处理函数
      * @param {boolean} isAll 是否处理全部
      * @returns 
      */
     static processSend(clear) {
         try {
             let { keys, vals } = SS.getWillSendingUbts();
             if (keys == 0 || vals.length == 0) return;
             //将即将发送埋点添加到sendingItems
             SS.addSendingItems(keys);
             //正式发送
             Y.sendUbtByPost(vals, (res) => {
                // console.log("res",res)
                if(res.statusCode == 200){
                    keys.forEach(key => {
                        //从localStorage移除
                        WxStorageKeeper.removeStorageSync(key);
                    })
                }
                //从正发送队列移除
                SS.removeSendingItems(keys);
                if (clear) {
                    SS.processSend(true);
                }
             });
         } catch (error) {
             console.log(error);
         }
     }
 
     /**
      * 开启定时发送
      */
     static startIntervalSend() {
         console.log("start interval")
         if (SS.timer != null) {
             clearInterval(SS.timer)
         }
         SS.timer = setInterval(SS.processSend,
             ubtConfig.mpIntervalTime);
     }
 
     /**
      * 关闭定时发送
      */
     static closeIntervalSend() {
         console.log("close interval");
         if (SS.timer != null) {
             clearInterval(SS.timer);
         }
         // 清空剩余未发送队列
         SS.processSend(true)
     }
 }
 
 class Pageview {
 
     constructor(options, fn, first) {
         this.queue = [];
         this.ts = Y.now();
         this.isfirst = first;
         this.ubtSeqNum = 0;
 
         this.status = {
             newsid: 0,
             newvid: 0,
             ready: 0
         }
 
         this.data = {
             url: "",
             refer: '',
             orderid: "",
             abtest: "",
             pid: 0,
             vid: "",
             sid: 0,
             pvid: 0,
             tid: "", //=Correction ID
             ppv: 0,
             ppi: 0
         }
 
         this.callback = typeof fn == "function" ? fn : noop;
         this.init(options);
     }
 
     addUbtSeqNum() {
         this.ubtSeqNum++;
     }
 
     getUbtSeqNum() {
         return this.ubtSeqNum;
     }
 
     setOptions(options) {
         if (typeof options == "object") {
             if (typeof options["pageId"] != "undefined") {
                 this.data.pid = options.pageId;
                 this.status.ready += 1;
             }
 
             if (typeof options["url"] == "string") {
                 this.data.url = options["url"];
             } else {
                 if (cwx.getCurrentPage() && cwx.getCurrentPage().route) {
                     this.data.url = cwx.getCurrentPage().route;
                 }
             }
 
             if (typeof options["refer"] == "string") {
                 this.data.refer = options["refer"];
             }
 
             if (typeof options["orderid"] == "string" || typeof options["orderid"] == "number") {
                 this.data.orderid = options["orderid"];
             }
 
             if (options["tid"]) {
                 this.data.tid = options["tid"]
             }
 
 
             this.data.isBack = options['isBack'] ? 1 : 0;
 
         }
         this.checkSend();
     }
 
     init(options) {
 
         var that = this;
 
         this.user = agentInfo.get('user', {});
         this.setOptions(options);
 
         var fn = function () {
             that.status.ready += 1;
             that.checkSend();
         }
 
         Y.getStore(STORAGE_KEY, function (data) {
             var ts = Y.now();
 
             if (data && typeof data == 'object') {
                 if (ts - data.ts * 1 > SESSION_MAX_LIEFTIME) {
                     that.status.newsid = 1;
                     data.sid = data.sid * 1 + 1;
                     that.data.ppi = 0;
                     that.data.ppv = 0;
                 } else {
                     that.data.ppi = data.pid;
                     that.data.ppv = data.pvid;
                 }
                 data.pvid = data.pvid * 1 + 1;
                 data.ts = ts;
             } else {
                 data = {
                     vid: ts + '.' + Y.uniqueID().toString(36),
                     sid: 1,
                     pvid: 1,
                     ts: ts,
                     create: ts
                 }
 
                 that.status.newvid = 1;
                 that.status.newsid = 1;
             }
 
             that.update(data, fn);
         });
 
     }
 
     syncPageInfo() {
         var that = this;
         Y.getStore(STORAGE_KEY, function (storeData) {
             var ts = Y.now();
             if (storeData && typeof storeData == 'object') {
                 if (ts - storeData.ts * 1 > SESSION_MAX_LIEFTIME) {
                     that.data.ppi = 0;
                     that.data.ppv = 0;
                 } else {
                     that.data.ppi = storeData.pid;
                     that.data.ppv = storeData.pvid;
                 }
                 Y.store(STORAGE_KEY, Object.assign({}, storeData, {
                     pid: that.data.pid,
                 }), function () { });
             }
         });
     };
     update(data, fn) {
         // 如果this.data.pid还未赋值，不更新storageData的pid
         if (this.data.pid) {
             data.pid = this.data.pid;
         }
         this.data.vid = data.vid;
         this.data.sid = data.sid;
         this.data.pvid = data.pvid;
         //
         // __global.vid = this.data.vid;
         // __global.pid = this.data.pid;
         // __global.sid = this.data.sid;
         // __global.pvid = this.data.pvid;
         //
         Y.store(STORAGE_KEY, data, fn);
     }
 
     isLogin() {
         return this.user.duid && this.user.auth;
     }
 
     isReady() {
         return this.status.ready == 10;
     }
 
     getCommon() {
         __global.vid = this.data.vid;
         __global.pid = this.data.pid;
         __global.sid = this.data.sid;
         __global.pvid = this.data.pvid;
         //
         return [
             this.data.pid,
             this.data.vid,
             this.data.sid,
             this.data.pvid,
             this.data.tid,
             this.getABtest(),
             "", //offline module
             VERSION, //version
             "", //fp
             "", //TCP Agent
             cwx.appId || "",
             '',//deviceImei
             '',//deviceMac
             '',//userId
             SDK_AGENT_ENV, //= ENV
             '',	//webServerIdc
             ubtConfig.isReportSeq ? this.getUbtSeqNum() : '',	//seq
             agentInfo.get('clientID', ""),	//clientId
             this.data.url //url
         ];
     }
 
     getABtest() {
         return Y._data_['abtest'] || this.data.abtest;
     }
 
     isSampled(sample) {
         if (sample >= 100) return true;
         var h = Y.hash(this.data.vid);
         return h && (h % 100) > (100 - sample * 1);
     }
 
     makeData() {
         var info = Y.makeSlice(43, '');
         info[0] = 17; // 版本号
         info[1] = this.data.ppi;
         info[2] = this.data.ppv;
         info[3] = this.data.url;
         info[4] = agentInfo.get('windowWidth', 0)
         info[5] = agentInfo.get('windowHeight', 0);
         info[7] = agentInfo.get('language', "zh_CN");
 
         info[10] = this.data.refer;
         info[11] = this.getABtest();
         info[12] = this.status.newvid;
         info[13] = this.isLogin();
         info[14] = agentInfo.get('nickName', "") || Y._data_['loginName'];
 
         // alliance
         info[18] = agentInfo.get('allianceid', ""); // 18	alliance_id
         info[19] = agentInfo.get('alliancesid', ""); // 19	alliance_sid
         info[20] = agentInfo.get('allianceouid', ""); // 20	alliance_ouid
 
         info[21] = Y._data_['orderid'] || this.data.orderid;
         info[22] = this.user.duid; //duid;
         info[26] = agentInfo.get('clientID', "");
         info[28] = JSON.stringify({
             version: agentInfo.get('version', ""),
             ver: agentInfo.get('ver', ''),
             net: agentInfo.get('networkType', "None"), //5.9加入，返回当前网络状态 2G/3G/4G/WIFI/None
             platform: agentInfo.get('platform', ''),
             wxver: __global.version || '',
         })
         info[29] = SDK_AGENT_ENV;
         info[30] = agentInfo.get('pixelRatio', 1);;
         info[31] = this.status.newsid; //session标识
         info[32] = JSON.stringify({
             isBack: this.data.isBack,
             // platform: agentInfo.get('platform', ''),
             system: agentInfo.get('system', ''),
             model: agentInfo.get('model', ""), //device version
             // version: agentInfo.get('version', ""),		//weixin version
             // ver: agentInfo.get('ver', ''),
             // networkType: agentInfo.get('networkType', ""),	// networkType
             city: agentInfo.get('ctripcity', ""),
             geo: agentInfo.get('geo', {}),
             openid: cwx.cwx_mkt && cwx.cwx_mkt.openid || "",
             sourceid: agentInfo.get("sourceid", ''),
             launch: this.isfirst,
             cwxVer: __global.cwxVersion || '',
             wxBuildVer: wx.buildVersion || '',
             mcdAppId: cwx.mcdAppId || '',
             wxVerInfo: wx.version || '',
         });
         info[34] = cwx.scene || "";
         info[40] = agentInfo.get('innerouid', "");
         info[41] = agentInfo.get('innersid', "");
         info[42] = agentInfo.get('pushcode', "");
         return info;
     }
 
     checkSend() {
         if (this.status.ready > 1) {
             this.status.ready = 10;
 
             agentInfo.init();
             this.sendData("uinfo", this.makeData(), 99, { isPv: true });
 
             for (var i = 0; i < this.queue.length; i++) {
                 this._send_by_http(this.queue[i]);
             }
             if (typeof this.callback == "function") this.callback(1);
         };
     }
 
     /**
      *  更新为http数据发送格式
      */
     sendData(type, data, priority, _extend) {
         var obj = {
             "dataType": type,
             "priority": priority || 0,
             "d": data,
             "_extend": _extend || {},
         }
         if (this.isReady()) {
             this._send_by_http(obj);
         } else if (this.queue.length < 50) {
             this.queue.push(obj);
         }
     }
 
     _send_by_http(o) {
         var obj;
         var params = '';
         //开关控制是否上报seq
         if (ubtConfig.isReportSeq) {
             this.addUbtSeqNum();
         }
         switch (o.dataType) {
             case 'matrix':
                 obj = [
                     [4, o.dataType],
                     this.getCommon(),
                     [o.d]
                 ];
                 params = 'ac=a&d=';
                 break;
             case 'useraction':
                 obj = [
                     [3, o.dataType],
                     this.getCommon(),
                     [o.d]
                 ];
                 params = 'ac=a&d='; //ctype 指定压缩方式:
                 // params += cwx.util.lz77.encodeURIComponent(JSON.stringify(obj))+'&v=' + VERSION;
                 break;
             case 'tiled_tl':
                 obj = {
                     type: 'tiled_tl',
                     common: this.getCommon(),
                     data: [o.d]
                 };
                 params = 'ac=ntl&d=';
                 break;
             case 'exposure':
                 obj = {
                     type: 'exposure',
                     header: {
                         version: VERSION,
                         ts: +new Date(),
                         vid: this.data.vid,
                         pid: this.data.pid,
                         sid: this.data.sid,
                         pvid: this.data.pvid,
                         tid: this.data.tid,
                         abtest: this.getABtest(),
                         appId: cwx.appId || "",
                         e_type: "",
                         clientId: agentInfo.get('clientID', ""),
                         seq: this.getUbtSeqNum()
                     },
                     body: {
                         key: o.d.key,
                         data: o.d.data,
                         duration: o.d.duration
                     }
                 };
                 params = 'ac=n&d=';
                 break;
             default:
                 obj = {
                     c: this.getCommon(),
                     d: {}
                 }
                 obj.d[o.dataType] = o.d;
                 params = 'ac=g&d=';
                 break;
         }
         params += UZip.compress(JSON.stringify(obj)) + '&c=1&v=' + VERSION + '&t=' + (+new Date());
         //是否走批量POST发送
         let doMultiPost = ubtConfig.isMultiPost && o._extend.isPv !== true;
         let multiPostResult = true;
         if (doMultiPost) {
             multiPostResult = SS.addPendingItme(params);
         }
         if (!doMultiPost || !multiPostResult) {
             Q.add(params, o.priority, o._extend);
         }
     }
 
     tracklog(options) {
         options._extend = options._extend || {};
         const {
             name,
             value,
             _extend
         } = options;
 
         if (!_extend || typeof _extend.callback !== "function") {
             _extend.callback = function () { }
         }
         if (Y.isNStr(name) && Y.isNStr(value)) {
             this.sendData("t", [
                 8,
                 name,
                 value,
                 this.user.duid, // duid
                 agentInfo.get('clientID', ""), // clientID
                 SDK_AGENT_ENV, //
                 (cwx.scene || "")
             ], null, _extend);
             _extend.callback(true, {
                 status: 0,
             });
         } else {
             _extend.callback(false, {
                 status: 1,
                 message: 'Invalid key or value !'
             });
         }
     }
 
     exposure(options) {
         options._extend = options._extend || {};
         const {
             key,
             data,
             _extend,
         } = options;
 
         if (!_extend || typeof _extend.callback !== "function") {
             _extend.callback = function () { }
         }
 
         if (Y.isNStr(key) && Y.isNStr(data)) {
             // if (Y.isNStr(key) && Y.validMap(data)) {
             // options["applet_scene"] = (cwx.scene || "") + "";
             this.sendData('exposure', options, null, options._extend);
             _extend.callback(true, {
                 status: 0,
             });
         } else {
             _extend.callback(false, {
                 status: 1,
                 message: 'Invalid key or value !'
             });
         }
     }
 
     trace(options) {
        try {
            options._extend = options._extend || {};
            const {
                _extend
            } = options;
            if (!_extend || typeof _extend.callback !== "function") {
                _extend.callback = function () { }
            }
            options.val = Y.transformUbtData(options.val);
            if (options && Y.validName(options.key) && Y.validMap(options.val)) {
                options["applet_scene"] = (cwx.scene || "") + "";
                options['duid'] = this.user.duid, // duid
                options['clientid'] = agentInfo.get('clientID', ""), // clientID
                this.sendData('tiled_tl', options, null, options._extend);
                _extend.callback(true, {
                    status: 0,
                });
            } else {
                _extend.callback(false, {
                    status: 1,
                    message: 'Invalid key or value !'
                });
            }
        } catch (error) {
            console.error(error);
        }
     }
 
     trackMetric(options) {
         var result = 0;
 
         if (typeof options == "object") {
             var param = Object.assign({
                 name: "",
                 tag: {},
                 value: 0,
                 ts: Y.now(),
                 callback: noop,
                 sample: 100
             }, options);
 
             if (this.isSampled(param.sample)) {
                 if (Y.isNStr(param.name) && Y.isNumeric(param.value)) {
                     if ((result = Y.check_tags(param.tag)) == 1) {
                         this.sendData("matrix", {
                             name: param.name,
                             tags: param.tag,
                             value: param.value,
                             ts: param.ts,
                             clientCode: agentInfo.get('clientID', "")
                         })
                     }
                 }
             }
 
             if (typeof param.callback == "function") {
                 param.callback(result);
             }
         }
 
         return result;
     }
 
     getErrorEnvData() {
         let currentPage = cwx.getCurrentPage();
         let cachedCtripCity = cwx.locate.getCachedCtripCity() || {};
         let pOIInfo = (cachedCtripCity && cachedCtripCity.data && cachedCtripCity.data.pOIInfo) || {};
         let systemInfo = cwx.wxSystemInfo;
         let date = new Date();
         let [buildId] = (wx.buildVersion || '').match(/(\d+)(?=_\d+_\d+)/) || []
         return {
             env_clientcode: agentInfo.get('clientID', "") || null, // CID， cwx.clientID
             env_DUID: (cwx.user && cwx.user.duid) || null, // cwx.user.duid
             env_appVersion: __global.version, // 线上小程序版本号 __global.version ( wx.getAccountInfoSync() 返回的 version )
             productName: currentPage.route || null, // 报错页面路径 pagePath 按此纬度区分数据
             env_buildID: buildId || '', // 代码构建时间 wx.buildVersion ( mini_build_version.js 中 )
             meta_sdkver: systemInfo.SDKVersion || null, // 客户端基础库版本	cwx.wxSystemInfo.SDKVersion
             env_osVersion: systemInfo.system || null, // 操作系统及版本 cwx.wxSystemInfo.system
             // env_networkType: null, // wx.getNetworkType() 异步返回的 res.networkType, 转全部大写
             env_country: pOIInfo.country || null, // _cachedCtripCity.data.pOIInfo.country
             log_from: "weapp", // 小程序类型： weapp, swan, alipay, tt, quickapp
             env_deviceType: systemInfo.model || null, // 设备型号 cwx.wxSystemInfo.model
             appEnv: "PROD", // 网络环境类型
             env_os: systemInfo.platform || null, // 客户端平台 cwx.wxSystemInfo.platform
             env_logtime: cwx.util.formatTime(date), // todo??? 报错时间，自己转成 yyyy-mm-dd hh:mm:ss 的格式
             framework: "weapp", // 小程序类型： weapp, swan, alipay, tt, quickapp
             env_city: pOIInfo.city || null, // _cachedCtripCity.data.pOIInfo.city
             time: date.getTime(), // 报错时间戳
             env_province: pOIInfo.province || null, // _cachedCtripCity.data.pOIInfo.province
             env_version: systemInfo.version || null, // 微信版本号 cwx.wxSystemInfo.version
             env_brand: systemInfo.brand || null, // 设备品牌 cwx.wxSystemInfo.brand
             cwxVersion: __global.cwxVersion || null, // 使用的cwx框架版本号 __global.cwxVersion
             appId: cwx.mcdAppId || null, // cwx.mcdAppId
             scene: cwx.scene, // 场景值 cwx.scene
             miniappAppId: cwx.appId || null, // 小程序的appId cwx.appId
         }
     }
 
     trackError(options) {
         var { version, stack, extendedField, organizationId, appVer, _extend } = options;
         var _version = version || 12;
         var category = 'Miniapp-error';
         var keys = ["version", "message", "line", "file", "category", "framework", "time", "repeat", "islogin", "name", "column"];
         var data = [_version, "", 0, "", category, "", Y.now() - this.ts, 1, this.isLogin(), "", 0];
         for (var i = 0, l = keys.length; i < l; i++) {
             var key = keys[i];
             if (options[key]) {
                 var _v = options[key] + "";
 
                 switch (key) {
                     case "message":
                     case "file":
                         _v = _v.substring(0, 500);
                         break;
                     case "category":
                     case "framework":
                     case "name":
                         _v = _v.substring(0, 100);
                         break;
                     case "time":
                         _v = parseInt(_v, 10);
                         break;
                     case "column":
                         _v = parseInt(_v, 10);
                         break;
                     default:
                         _v = parseInt(_v, 10) || 0;
                 }
 
                 data[i] = _v;
             }
         }
 
         var _stack = '';
         if (stack) {
             _stack = stack;
         } else if (typeof cQuery != 'undefined' && Y.isFunction(cQuery.trace)) {
             _stack = cQuery.trace();
             if (Y.isArray(_stack)) {
                 _stack = _stack.join('');
             }
         }
         _stack = _stack.slice(data.join('').length - 2000);
 
         data.push(_stack);
         if (+_version >= 10) {
             var _extendedField = this.getErrorEnvData();
             if (extendedField) {
                 Object.assign(_extendedField, extendedField);
                 _extendedField = JSON.stringify(_extendedField, (key, value) => {
                     if (key && typeof value !== 'string') {
                         return JSON.stringify(value);
                     }
                     return value;
                 });
             }
             data.push(_extendedField);//data[12] extendedField
             data.push(organizationId);//data[13] organizationId
             data.push(appVer || __global.version);//data[14] appVer 客户端本地上传版本
         }
 
         this.sendData("error", data, null, _extend);
     }
 
     /**
     * 用于发送UBT的数据接口，需要和PV强关联的数据请使用此接口发送统计数据。
     *
     * @method send
     * @param {type}  	(pv|tracelog|metric|error)
     * @param {mixin}	传对应的type接口数据
     * @example
     * ```
     *
     * // 发送PV数据
     * Log.send('pv', {
     * 	page_id: "",		//页面pageid，通过CMS系统上申请维护的pageID值，通过pageid可以直接查询UBT数据报表
     * 	url: "",
     * 	orderid: "",		//订单信息
     * 	refer: ""			//上一个页面的URL
     * })
     *
     * // 发送tracelog数据
     * Log.send('tracelog', {
     * 	name: "",
     * 	value: ""
     * })
  
     * // 发送metric数据
     * Log.send('metric', {
     * 	name: 'metric.name',	//Metric name
     * 	tag: {		//自定义Tag项
     * 		tag1: 'tag value'
     * 	},
     * 	value: 0	//number
     * })
     *
     * // 发送Error统计
     * Log.send('error', {
     * 	message: "",
     * 	file: "",
     * 	category: "",
     * 	framework: "",
     * 	name: "",
     * 	time: 0,
     * 	column: 0
     * });
     *
     *
     * ```
     */
     send(atype, options) {
         if (!atype) return this;
         switch (atype) {
             case 'pv':
                 if (this.isReady()) {
                     return new Pageview(options);
                 } else {
                     this.setOptions(options);
                     this.syncPageInfo();
                 }
                 break;
             case 'exposure':
                 this.exposure(options)
                 break;
             case 'tracelog':
                 this.tracklog(options)
                 break;
             case 'trace':
                 this.trace(options);
                 break;
             case 'metric':
                 this.trackMetric(options);
                 break;
             case 'error':
                 this.trackError(options);
                 break;
             case 'useraction':
                 this.sendData(atype, options);
         }
 
         return this;
     }
 }
 
 Pageview.__data__ = [];
 Pageview.first_pv = true;
 Pageview.instance = new Pageview({}, noop, Pageview.first_pv);
 
 let createPV = function (option, fn) {
     option = option || {};
     fn = fn || noop;
 
     if (Pageview.first_pv) {
         Pageview.first_pv = false;
         /**
          * 第一个PV，需要在初始化之前同步下Agent信息，避免出现空值 如：cwx.user等
          */
         agentInfo.init();
         Pageview.instance.setOptions(option); // 之前是 Pageview.instance.init(option);
         for (var i = 0; i < Pageview.__data__.length; i++) {
             let item = Pageview.__data__[i];
             if (item.type) {
                 Pageview.instance.send(item.type, item.data);
             }
             // Pageview.instance.trackMetric(Pageview.__data__[i]);
         }
         Pageview.__data__ = [];
 
         setTimeout(function () {
             let tag = {};
             let exmktid = agentInfo.get('exmktid', '');
             if (exmktid) {
                 try {
                     exmktid = typeof exmktid === 'string' ? JSON.parse(exmktid) : exmktid;
                     tag.openid = exmktid.openid || "";
                     tag.unionid = exmktid.unionid || "";
                 } catch (e) { }
             }
 
             tag['allianceid'] = agentInfo.get('allianceid', ""); // 18	alliance_id
             tag['alliancesid'] = agentInfo.get('alliancesid', ""); // 19	alliance_sid
             tag['allianceouid'] = agentInfo.get('allianceouid', "");
             tag['sdkver'] = agentInfo.get('ver', "");
             Pageview.instance.send("metric", {
                 name: "wxxcx_launch",
                 tag: tag,
                 value: 1
             })
         }, 300)
     } else {
         Pageview.instance = new Pageview(option, fn, Pageview.first_pv);
     }
     return Pageview.instance;
 }
 
 /**
  * 以下几个重复声明的api fn，是否可以去除？需要确认
  */

 let ubtMetric = function (option) {
     Pageview.instance.send('metric', option);
 }
 
 let ubtTrace = function (name, value, _extend) {
     let valueStr = '';
     if (typeof value == 'string') {
         valueStr = value;
     } else {
         valueStr = JSON.stringify(value);
     }
 
     let option = {
         name: name,
         value: valueStr,
         _extend: _extend || {},
     }
 
     Pageview.instance.send('tracelog', option);
 }
 
 let ubtDevTrace = function (name, value, _extend) {
     let option = {
         "$.ubt.hermes.topic.classifier": "DebugCustom",
         key: name,
         val: typeof value != 'object' ? {
             data: value + ''
         } : value,
         applet_scene: (cwx.scene || "") + "",
         _extend: _extend || {},
     }
     Pageview.instance.send('trace', option);
 }
 
 let ubtExposure = function (name, value, _extend) {
     const {
         duration,
         ...rest
     } = value || {};
     rest.scene = cwx.scene || ""
 
     let option = {
         key: name,
         data: JSON.stringify(rest),
         duration: duration || 0,
         _extend: _extend || {},
     }
 
     Pageview.instance.send('exposure', option);
 }
 
 let ubtTrackError = function (options) {
     Pageview.instance.send('error', options);
 }
 
 
 let set = function (name, value) {
     Y._data_[name] = value;
 }
 
 let getState = function () {
     var data = Pageview.instance.getCommon();
     return {
         vid: data[1],
         pid: data[0],
         sid: data[2],
         pvid: data[3],
         cid: cwx.clientID
     }
 }
 
 export default {
     createPV,
     ubtMetric,
     ubtTrace,
     ubtDevTrace,
     ubtExposure,
     ubtTrackError,
     set,
     getState
 }
 
 export const StorageSender = SS;