import { cwx, _ ,__global} from '../../../cwx/cwx.js';

var unionConfig = {
  "wx0e6ed4f51db9d078": { //主版
    "rcKey": 100340,
    "ouKey": 100354,
    "aid": 262684,
    "sid": 711465,
    "ouid": "",
    "sourceid": 55552689,
    "txCpsId":"",   //计佣id 商卡跳入链接携带 产品 林志远 tx_cps_id
    "amsPid":"",   //达人id   ams_pid
    "xhs_click_id":"" //小红书 点击位 唤醒中间页跳目标页携带
  }
};
const utils = require('../../market/common/utils.js');
var gUnionCfg = unionConfig[cwx.appId] || unionConfig['wx0e6ed4f51db9d078'];
var gStorageKey = "mkt_union";
var gPlatform = "WECHAT";
var Market = {};

/**
 * 数据写入localstorage
 * 业绩参数优先级：传入业绩参数 -> 原locastorage中存储的业绩参数 -> 初始化空值
 * @param {obejct} pOptions 业绩参数，包括
 *   . allianceid,sid,ouid,sourceid,gdt_vid,xhs_click_id  【url中携带】
 *   . fromallianceid、fromsid、fromouid、fromsourceid,fromopenid 【mktshare解析后获取】
 * @param {string} pReferralCode 推荐码
 */
var _setLocalstorage = function (pOptions, pReferralCode) {
  var mPage = cwx.getCurrentPage(),
    storedData = cwx.getStorageSync(gStorageKey),
    oldUnion = {},
    parsedData = null,
    parsedExmktId = null,
    mktshareObj = null,
    lwOptions = {},
    allianceid = gUnionCfg.aid || 0,
    sid = gUnionCfg.sid || 0,
    ouid = gUnionCfg.ouid || "",
    txCpsId=gUnionCfg.txCpsId||"",
    amsPid=gUnionCfg.amsPid||"",
    sourceid = gUnionCfg.sourceid || 0,
    gdt_vid = "",
    xhs_click_id="",
    referralCode = "",
    fromopenid = "",
    fromallianceid = 0,
    fromsid = 0,
    fromouid = "",
    fromsourceid = 0,
    lsData = "",
    innersid="",
    innerouid="",
    pushcode="";

  //获取localstorage中存储的数据
  if (storedData) {
    parsedData = JSON.parse(storedData);
  }
  // 针对ouid过长的情况，限制字符最大长度200，长度超过200则将ouid设为空字符串【2020.09.11】
  if (parsedData && parsedData.ouid && parsedData.ouid.length > 200) {
    parsedData.ouid = '';
  }

  if (parsedData && parsedData.exmktid) {
    parsedExmktId = JSON.parse(parsedData.exmktid);
  }

  //统一key为小写，避免url参数大小写不一致，无法取出业绩参数的情况
  if (pOptions && Object.prototype.toString.call(pOptions) == "[object Object]") {
    _.each(pOptions, function (value, key) {
      lwOptions[key.toLowerCase()] = value;
    });
  }

  //获取分享加密串
  if (lwOptions && lwOptions.mktshare) {
    try {
      mktshareObj = JSON.parse(cwx.util.mktBase64Decode(lwOptions.mktshare.replace(/\(\)/g, "=")));
    } catch (e) {
      mPage && mPage.ubtTrace && mPage.ubtTrace(101470, {
        "mktshare": lwOptions.mktshare
      });
    }
  }
  //allianceid、sid、ouid成对出现，前两者都不为空，才可写入 (变更：2020/5/15改为ouid可单独写入，给直播页用)
  if (lwOptions && parseInt(lwOptions.allianceid) && parseInt(lwOptions.sid)) {
    allianceid = parseInt(lwOptions.allianceid);
    sid = parseInt(lwOptions.sid);
    ouid = lwOptions.ouid || ouid;
    txCpsId=lwOptions.tx_cps_id||""
    amsPid=lwOptions.ams_pid||""
  } else if (mktshareObj && parseInt(mktshareObj.allianceid) && parseInt(mktshareObj.sid)) {
    allianceid = parseInt(mktshareObj.allianceid);
    sid = parseInt(mktshareObj.sid);
    ouid = mktshareObj.ouid || ouid;
    txCpsId=mktshareObj.tx_cps_id||""
    amsPid=mktshareObj.ams_pid||""
  } else if (parsedData && parseInt(parsedData.allianceid) && parseInt(parsedData.sid)) {
    allianceid = parseInt(parsedData.allianceid);
    sid = parseInt(parsedData.sid);
    ouid = parsedData.ouid || ouid;
    txCpsId=parsedExmktId.txCpsId||""
    amsPid=parsedExmktId.amsPid||""
  }

  //ouid可以单独写入  去掉ouid单独写入 2023/7/26 
  // if (lwOptions && lwOptions.ouid) {
  //   ouid = lwOptions.ouid||ouid;
  // } else if (mktshareObj && mktshareObj.ouid) {
  //   ouid = mktshareObj.ouid || ouid;
  // } else if (parsedData && parsedData.ouid) {
  //   ouid = parsedData.ouid || ouid;
  // }

  //sourceid可以单独写入
  if (lwOptions && parseInt(lwOptions.sourceid)) {
    sourceid = parseInt(lwOptions.sourceid);
  } else if (mktshareObj && parseInt(mktshareObj.sourceid)) {
    sourceid = parseInt(mktshareObj.sourceid);
  } else if (parsedData && parseInt(parsedData.sourceid)) {
    sourceid = parseInt(parsedData.sourceid);
  }

  //gdt_vid可以单独写入
  if (lwOptions && lwOptions.gdt_vid) {
    gdt_vid = lwOptions.gdt_vid;
  } else if (mktshareObj && mktshareObj.gdt_vid) {
    gdt_vid = mktshareObj.gdt_vid;
  } else if (parsedData && parsedData.gdt_vid) {
    gdt_vid = parsedData.gdt_vid;
  }

  //xhs_click_id可以单独写入
  if (lwOptions && lwOptions.xhs_click_id) {
    xhs_click_id = lwOptions.xhs_click_id;
  } else if (mktshareObj && mktshareObj.xhs_click_id) {
    xhs_click_id = mktshareObj.xhs_click_id;
  } else if (parsedExmktId && parsedExmktId.xhs_click_id) {
    xhs_click_id = parsedExmktId.xhs_click_id;
  }

  //获取分享mktshare传入的fromopenid
  if (mktshareObj && mktshareObj.fromopenid) {
    fromopenid = mktshareObj.fromopenid;
  } else if (parsedExmktId && parsedExmktId.fromopenid) {
    fromopenid = parsedExmktId.fromopenid;
  }

  //获取url或分享mktshare传入的fromallianceid、fromsid、fromouid、fromsourceid(2020/5/15改为ouid可单独写入)
  if (lwOptions && parseInt(lwOptions.fromallianceid) && parseInt(lwOptions.fromsid)) {
    fromallianceid = parseInt(lwOptions.fromallianceid);
    fromsid = parseInt(lwOptions.fromsid);
    fromouid = lwOptions.fromouid || fromouid;
  } else if (mktshareObj && parseInt(mktshareObj.fromallianceid) && parseInt(mktshareObj.fromsid)) {
    fromallianceid = parseInt(mktshareObj.fromallianceid);
    fromsid = parseInt(mktshareObj.fromsid);
    fromouid = mktshareObj.fromouid || fromouid;
  } else if (parsedExmktId && parseInt(parsedExmktId.fromallianceid) && parseInt(parsedExmktId.fromsid)) {
    fromallianceid = parseInt(parsedExmktId.fromallianceid);
    fromsid = parseInt(parsedExmktId.fromsid);
    fromouid = parsedExmktId.fromouid || fromouid;
  }

  //fromouid可以单独写入
  // if (lwOptions && lwOptions.fromouid) {
  //   fromouid = lwOptions.fromouid || fromouid;
  // } else if (mktshareObj && mktshareObj.fromouid) {
  //   fromouid = mktshareObj.fromouid || fromouid;
  // } else if (parsedExmktId && parsedExmktId.fromouid) {
  //   fromouid = parsedExmktId.fromouid || fromouid;
  // }
  
  // 针对ouid过长的情况，限制字符最大长度200，长度超过200则将ouid设为空字符串【2020.09.11】
  if (ouid && ouid.length > 200) {
    ouid = '';
  }
  if (fromouid && fromouid.length > 200) {
    fromouid = '';
  }

  //fromsourceid可以单独写入
  if (lwOptions && parseInt(lwOptions.fromsourceid)) {
    fromsourceid = parseInt(lwOptions.fromsourceid);
  } else if (mktshareObj && parseInt(mktshareObj.fromsourceid)) {
    fromsourceid = parseInt(mktshareObj.fromsourceid);
  } else if (parsedExmktId && parseInt(parsedExmktId.fromsourceid)) {
    fromsourceid = parseInt(parsedExmktId.fromsourceid);
  }

  //innersid 站内业绩参数
  if (lwOptions && lwOptions.innersid) {
    innersid = lwOptions.innersid||innersid;
  } else if (mktshareObj && mktshareObj.innersid) {
    innersid = mktshareObj.innersid || innersid;
  } else if (parsedExmktId && parsedExmktId.innersid) {
    innersid = parsedExmktId.innersid;
  }

  //innerouid 站内业绩参数
  if (lwOptions && lwOptions.innerouid) {
    innerouid = lwOptions.innerouid||innerouid;
  } else if (mktshareObj && mktshareObj.innerouid) {
    innerouid = mktshareObj.innerouid || innerouid;
  } else if (parsedExmktId && parsedExmktId.innerouid) {
    innerouid = parsedExmktId.innerouid;
  }

  //pushcode 站内业绩参数
  if (lwOptions && lwOptions.pushcode) {
    pushcode = lwOptions.pushcode||pushcode;
  } else if (mktshareObj && mktshareObj.pushcode) {
    pushcode = mktshareObj.pushcode || pushcode;
  } else if (parsedExmktId && parsedExmktId.pushcode) {
    pushcode = parsedExmktId.pushcode;
  }

  //获取推荐码
  if (pReferralCode) {
    referralCode = pReferralCode;
  } else if (parsedExmktId && parsedExmktId.ReferralCode) {
    referralCode = parsedExmktId.ReferralCode;
  }

  //埋点记录：业绩更替新旧数据值 (前提：新旧数据不同)
  if (parsedData && (parsedData.allianceid != allianceid || parsedData.sid != sid || parsedData.ouid != ouid || parsedData.sourceid != sourceid || parsedData.gdt_vid != gdt_vid)) {
    oldUnion = {
      "allianceid": parsedData.allianceid,
      "sid": parsedData.sid,
      "ouid": parsedData.ouid,
      "sourceid": parsedData.sourceid,
      "gdt_vid": parsedData.gdt_vid,
      "timestamp": _formatDate(new Date(), "yyyy-MM-dd hh:mm:ss")
    }
  } else if (parsedExmktId) {
    oldUnion = parsedExmktId.oldUnion;
  }

  let _exmktid=JSON.stringify({
    "oldUnion": oldUnion,
    "openid": cwx.cwx_mkt.openid,
    "unionid": cwx.cwx_mkt.unionid,
    "scene": cwx.scene,
    "ReferralCode": referralCode,
    "fromopenid": fromopenid,
    "fromallianceid": fromallianceid,
    "fromsid": fromsid,
    "fromouid": fromouid,
    "fromsourceid": fromsourceid,
    "channelUpdateTime":new Date().getTime(),
    "serverFrom":"WAP/WECHATAPP",
    "innersid":innersid,
    "innerouid":innerouid,
    "pushcode":pushcode,
    "txCpsId":txCpsId,
    "amsPid":amsPid,
    "gdt_vid":gdt_vid,
    "xhs_click_id":xhs_click_id
  })

  lsData = JSON.stringify({
    "allianceid": allianceid,
    "sid": sid,
    "ouid": ouid,
    "sourceid": sourceid,
    "gdt_vid": gdt_vid,
    "exmktid": _exmktid
  });

  //执行本地同步缓存
  try {
    cwx.setStorageSync(gStorageKey, lsData);
  } catch (e) {
    //异步补偿机制
    cwx.setStorage({
      key: gStorageKey,
      data: lsData
    });
    //埋点统计
    mPage && mPage.ubtTrace && mPage.ubtTrace(100819, {
      errmsg: "业绩参数存储异常：" + JSON.stringify(e)
    });
  }
  try{
    //业绩更新时记录
    if (lwOptions && (lwOptions.allianceid || lwOptions.sid|| lwOptions.sourceid || lwOptions.gdt_vid)) {
      var mPage = cwx.getCurrentPage()||{};
      var pageId = mPage ? (mPage.pageid || mPage.pageId || "") : "";
      mPage && mPage.ubtTrace && mPage.ubtTrace(139346, {
          "appid": cwx.appId,
          "mktopenid":cwx.cwx_mkt.openid,
          "allianceid":oldUnion.allianceid?oldUnion.allianceid+"":"0",
          "sid":oldUnion.sid?oldUnion.sid+"":"0",
          "ouid":oldUnion.ouid?oldUnion.ouid+"":"",
          "sourceid":oldUnion.sourceid?oldUnion.sourceid+"":"",
          "newAllianceid":allianceid?allianceid+"":"0",
          "newSid":sid?sid+"":"0",
          "newOuid":ouid?ouid+"":"0",
          "newSourceid":sourceid?sourceid+"":"0",
          "exmktid":_exmktid||"",
          "pageId":pageId.toString(),
          "timestamp":_formatDate(new Date(), "yyyy-MM-dd hh:mm:ss")
      });
    }
  }catch(e){

  }
};
/**
 * 格式化日期
 */
var _formatDate = function (date, fmt) {
  var o = {
    "M+": date.getMonth() + 1,                 //月份
    "d+": date.getDate(),                    //日
    "h+": date.getHours(),                   //小时
    "m+": date.getMinutes(),                 //分
    "s+": date.getSeconds(),                 //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds()             //毫秒
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }

  return fmt;
}

/**
 * 获取localstorage数据
 */
var _getLocalstorage = function () {
  var lsData = null,
    rData = null,
    rAllianceid = gUnionCfg.aid || 0,
    rSid = gUnionCfg.sid || 0,
    rOuid = gUnionCfg.ouid || "",
    rSourceid = gUnionCfg.sourceid || 0;

  //如果localstorage为空，则初始化
  //
  //增加渠道变更时间，缓存重写
  !cwx.getStorageSync(gStorageKey) && _setLocalstorage();

  //获取并解析localstorage数据
  lsData = JSON.parse(cwx.getStorageSync(gStorageKey));
  //检查数据有效性，为空则返回默认值
  if (parseInt(lsData.allianceid) && parseInt(lsData.sid)) {
    rAllianceid = parseInt(lsData.allianceid);
    rSid = parseInt(lsData.sid);
    rOuid = lsData.ouid;
  }

  if (parseInt(lsData.sourceid)) {
    rSourceid = parseInt(lsData.sourceid);
  }

  //生成返回值
  rData = {
    "allianceid": rAllianceid,
    "sid": rSid,
    "ouid": rOuid,
    "sourceid": rSourceid,
    "exmktid": lsData.exmktid
  }

  return rData;
};

/**
 * 将搜索来源场景值写入localstorage
 */
var _setSceneSearchUnion = function () {
  var mPage = cwx.getCurrentPage(),
    lsData = Market.getUnion(),
    sOptions = {},
    sceneUnionCfg = {},
    sceneUnion = {};

  sceneUnionCfg = {
    1005: {
      "allianceid": 263528,
      "sid": 1105084,
      "ouid": "mini1005",
      "sourceid": 55555546
    },
    1006: {
      "allianceid": 263528,
      "sid": 1105085,
      "ouid": "mini1006",
      "sourceid": 55555547
    },
    1042: {
      "allianceid": 263528,
      "sid": 1105086,
      "ouid": "mini1042",
      "sourceid": 55555548
    },
    1053: {
      "allianceid": 1314167,
      "sid": 4258862,
      "ouid": "mini1053",
      "sourceid": 55555549
    },
    1026: {
      "allianceid": 586924,
      "sid": 1207881,
      "ouid": "mini1026",
      "sourceid": 55555594
    },
    1043:{
      "allianceid": 7225,
      "sid": 13758153,
      "ouid": "",
      "sourceid": 0
    },
    1107:{
      "allianceid": 7225,
      "sid": 13758055,
      "ouid": "",
      "sourceid": 0
    },
    1014:{
      "allianceid": 7225,
      "sid": 13758055,
      "ouid": "",
      "sourceid": 0
    }
  };

  sceneUnion = sceneUnionCfg[Number(cwx.scene)];

  if (sceneUnion && sceneUnion.allianceid && sceneUnion.sid) {
    sOptions.allianceid = sceneUnion.allianceid;
    sOptions.sid = sceneUnion.sid;
    sOptions.ouid = sceneUnion.ouid;
    sOptions.sourceid = sceneUnion.sourceid;

    //重写搜索场景的业绩
    _setLocalstorage(sOptions);

    //埋点记录业绩替换轨迹
    mPage && mPage.ubtTrace && mPage.ubtTrace(100820, {
      "scene": cwx.scene,
      "openid": cwx.cwx_mkt.openid,
      "time": new Date(),
      "oldChannel": {
        "allianceid": lsData.allianceid,
        "sid": lsData.sid,
        "ouid": lsData.ouid,
        "sourceid": lsData.sourceid
      },
      "newChannel": {
        "allianceid": sOptions.allianceid,
        "sid": sOptions.sid,
        "ouid": sOptions.ouid,
        "sourceid": sOptions.sourceid
      }
    });
  }
}

/**
 * 将公众号来源场景值写入localstorage
 * @param {object} options 业绩参数，包括allianceid,sid,ouid,sourceid
 */
var _setSceneGzhUnion = function (options) {
  var mPage = cwx.getCurrentPage(),
    lsData = Market.getUnion(),
    channelReplaceRes = null,
    allianceid = 0,
    sid = 0,
    ouid = "",
    sourceid = 0;

  //将当前业绩参数值（优先级：url中的业绩参数值 -> 用户本地缓存的值）传给服务端，便于后端做历史记录
  if (options && parseInt(options.allianceid) && !isNaN(parseInt(options.allianceid)) && parseInt(options.sid) && !isNaN(parseInt(options.sid))) {
    allianceid = parseInt(options.allianceid);
    sid = parseInt(options.sid);
    ouid = options.ouid || ouid;

    if (parseInt(options.sourceid) && !isNaN(parseInt(options.sourceid))) {
      sourceid = parseInt(options.sourceid);
    }
  }
  if (!allianceid || !sid) {
    allianceid = lsData.allianceid;
    sid = lsData.sid;
    ouid = lsData.ouid;
    sourceid = lsData.sourceid;
  }

  //请求service，查询该用户关注公众号时的渠道业绩，以便更新
  cwx.request({
    url: "/restapi/soa2/12673/channelInfoReplace",
    method: "POST",
    data: {
      "unionId": cwx.cwx_mkt.unionid,
      "appId": options.appid || '',
      "aid": allianceid.toString(),
      "sid": sid.toString(),
      "ouid": ouid.toString(),
      "sourceId": sourceid.toString()
    },
    success: function (res) {
      if (res && res.data && res.data.isChanged && res.data.aid && res.data.sid) {
        channelReplaceRes = res.data;

        _setLocalstorage({
          "allianceid": channelReplaceRes.aid,
          "sid": channelReplaceRes.sid,
          "ouid": channelReplaceRes.ouid,
          "sourceid": channelReplaceRes.sourceId
        });
      }
    },
    fail: function (e) { }
  });
}

/**
 * 获取GPS定位信息
 * @param {string} orderID 订单号，用于埋点统计时定位到具体出错的订单号
 * @param {function} callback 获取位置信息成功后的回调方法
 */
var _beginLocate = function (orderID, callback) {
  var locationRes = {},
    locationItem = {},
    locationCtrip = {},
    LC_ADDRESS = "ADDRESS",
    LC_CTRIP_CITY = "CTRIP_CITY",
    cachedAddress = cwx.locate.getCachedAddress(),
    cachedCtripCity = cwx.locate.getCachedCtripCity(),
    mPage = cwx.getCurrentPage();

  //处理GPS信息并执行回调
  var handleLocation = function (res, type) {
    //地理位置获取失败埋点，记录订单号（方便以后风控GPS信息缺失问题排查）、GPS信息类型、错误信息
    if (res.error) {
      mPage && mPage.ubtTrace && mPage.ubtTrace(100796, {
        "orderID": orderID,
        "type": type,
        "error": res.error
      });
    }

    //拼接完整的GPS信息
    switch (type) {
      case LC_ADDRESS:
        locationItem = {
          "address": res.address || ""
        };
        break;
      case LC_CTRIP_CITY:
        locationCtrip = res.data || null;

        if (locationCtrip) {
          _.extend(locationItem, {
            "cityLongitude": locationCtrip.CityLongitude,
            "cityLatitude": locationCtrip.CityLatitude,
            "countryName": locationCtrip.CountryName,
            "provinceName": locationCtrip.ProvinceName
          });

          locationCtrip.CityEntities && locationCtrip.CityEntities.length > 0 && _.extend(locationItem, {
            "cityID": locationCtrip.CityEntities[0].CityID,
            "cityName": locationCtrip.CityEntities[0].CityName
          });
        } else {
          _.extend(locationItem, {
            "cityID": '',
            "cityName": ''
          });
        }
        break;
    }

    _.extend(locationRes, locationItem);

    //两部分位置信息均获取成功，则执行回调
    locationRes.hasOwnProperty("address") && locationRes.hasOwnProperty("cityName") && _.isFunction(callback) && callback(locationRes);
  };

  //获取精准位置信息，e.g. {"address":上海市黄浦区西藏南路2号"}
  if (cachedAddress) {
    handleLocation(cachedAddress, LC_ADDRESS);
  } else {
    handleLocation({}, LC_ADDRESS);
    //去掉没拿到缓存定位弹窗授权的逻辑-20220311
    // cwx.locate.startGetAddress(function (res) {
    //   handleLocation(res, LC_ADDRESS);
    // }, "marketluckyactivity-lbs");
  }

  //获取携程位置信息，e.g. {"cityLongitude":121.473701,"cityLatitude":31.230416,"countryName":"中国","provinceName":"","cityName":"上海"}
  if (cachedCtripCity) {
    handleLocation(cachedCtripCity, LC_CTRIP_CITY);
  } else {
    handleLocation({}, LC_CTRIP_CITY);
    // cwx.locate.startGetCtripCity(function (res) {
    //   handleLocation(res, LC_CTRIP_CITY);
    // }, "marketluckyactivity-lbs");
  }
};

/**
 * 保存订单/渠道/位置等信息
 * @param {object} data 待落地的订单/渠道/位置等信息
 * @param {object} context 上下文
 */
var _saveOrderUnion = function (data, context) {
  cwx.request({
    url: "/restapi/soa2/12673/saveWechatAppOrderUnion",
    method: "POST",
    data: data,
    success: function (res) {
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success" && res.data.resultCode == "0") {
        //请求成功，直接校验DB落地情况
      } else {
        context && context.ubtTrace(101471, {
          "errmsg": "保存订单业绩失败：" + JSON.stringify(res),
          "errcode": -1
        });
      }
    },
    fail: function (e) {
      //请求失败，埋点记录
      context && context.ubtTrace(101471, {
        "errmsg": "保存订单业绩请求异常：" + JSON.stringify(e),
        "errcode": -2
      });
    }
  });
};

/**
 * 微信卡券添加成功后，同步发券code
 * @param {ObjectArray} cardList 微信卡券添加结果列表，由微信接口wx.addCard返回，包含code，cardId，cardExt，isSuccess
 * @param {object} mPage 当前页面上下文
 * @param {object} pageId 页面id，用于埋点记录时定位到具体页面
 */
var _saveWechatCardInfo = function (cardList, mPage, pageId) {
  var params = {
    "cardList": cardList,
    "appid": cwx.appId,
    "mktOpenid": cwx.cwx_mkt.openid
  };

  cwx.request({
    url: "/restapi/soa2/13364/saveWechatCardInfo",
    method: "POST",
    data: params,
    success: function (res) {
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success" && res.data.resultCode == "0") {
        //请求成功，校验DB
      } else {
        mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
          "data": JSON.stringify(res),
          "pageid": pageId,
          "errcode": 5
        });
      }
    },
    fail: function (e) {
      //请求失败，埋点记录
      mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
        "data": JSON.stringify(e),
        "pageid": pageId,
        "errcode": 6
      });
    }
  });
};

/**
 * 监听openId并记录场景值等信息
 */
var _listenSceneOpenid = function () {
  var that = this;

  if (cwx.cwx_mkt.openid) {
    _saveSceneOpenid(1);
  } else {
    var openIdObserver = function (openid) {
      cwx.Observer.removeObserverForKey("OpenIdObserver", openIdObserver);

      if (openid) { //通过观察者模式侦听到 openid
        _saveSceneOpenid(2);
      } else { //如果观察者模式没有侦听到 openid，则开启定时器模式。检查 100 * 60 毫秒后，依然没有检测到openid，则停止检测，openid获取失败
        var checkCount = 60;
        var interval = setInterval(function () {
          checkCount--;

          if (checkCount < 0) {
            clearInterval(interval);
          } else if (cwx.cwx_mkt.openid) {
            clearInterval(interval);
            _saveSceneOpenid(3);
          }
        }, 100);
      }
    };

    cwx.Observer.addObserverForKey("OpenIdObserver", openIdObserver);
  }
};

/**
 * 落地场景值和openid等信息
 * @param {type} string 获取到openid的方式：1 - 已存在的openid   2 - 观察真模式侦听到   3 - 定时器模式侦听到
 * 注：落地的业绩为客户端已有数据，而非新加载的页面url指定的渠道，因为 app onLaunch 在页面navigator.js写入渠道之前执行
 */
var _saveSceneOpenid = function (type) {
  var lsData = _getLocalstorage();
  var mPage = cwx.getCurrentPage();

  if (cwx && cwx.scene && ["1103", "1104", "1089"].includes(cwx.scene.toString())) {
    var params = {
      "platform": gPlatform,
      "appid": cwx.appId,
      "mktOpenID": cwx.cwx_mkt.openid,
      "scene": cwx.scene.toString(),
      "allianceId": lsData.allianceid.toString(),
      "sId": lsData.sid.toString(),
      "ouId": lsData.ouid,
      "sourceId": lsData.sourceid.toString()
    };

    cwx.request({
      url: "/restapi/soa2/13447/saveUserSceneKey",
      method: "POST",
      data: params,
      success: function (res) {
        if (res && res.data && res.data.resultCode === "0") {
          //请求成功，校验DB
          mPage && mPage.ubtTrace && mPage.ubtTrace(102388, {
            "params": params,
            "res": JSON.stringify(res),
            "type": type,
            "errcode": 0
          });
        } else {
          mPage && mPage.ubtTrace && mPage.ubtTrace(102388, {
            "params": params,
            "res": JSON.stringify(res),
            "type": type,
            "errcode": 1
          });
        }
      },
      fail: function (e) {
        //请求失败，埋点记录
        mPage && mPage.ubtTrace && mPage.ubtTrace(102388, {
          "params": params,
          "data": JSON.stringify(e),
          "type": type,
          "errcode": 2
        });
      }
    });
  }
};


/**
 * 将业绩参数写入localstorage
 * @param {object} options 业绩参数，包括allianceid,sid,ouid,sourceid,gdt_vid
 * 业绩替换优先级：
 *   . 公众号来源场景值 (1035, 1043)
 *   . path中携带的业绩
 *   . 搜索来源场景值 (1005, 1006, 1042, 1053, 1026)
 */
Market.setUnion = function (options) {
  var lwOptions = {},
    scene = Number(cwx.scene), //当前场景值
    sceneGzhAccountCfg = [1035, 1043], //公众号来源场景值
    sceneSearchCfg = [1005, 1006, 1042, 1053, 1026,1043,1107,1014]; //搜索来源场景值

  //统一key为小写，避免url参数大小写不一致，无法取出业绩参数的情况
  if (options && Object.prototype.toString.call(options) == "[object Object]") {
    _.each(options, function (value, key) {
      lwOptions[key.toLowerCase()] = value;
    });
  }

  //业绩写入
  if ((_.indexOf(sceneGzhAccountCfg, scene) != -1) && cwx.cwx_mkt.unionid && lwOptions && (lwOptions.gzhsource == "1")) {
    _setSceneGzhUnion(lwOptions);
  } else if (lwOptions && ((lwOptions.allianceid && lwOptions.sid) || lwOptions.mktshare || lwOptions.gdt_vid|| lwOptions.innersid || lwOptions.innerouid|| lwOptions.pushcode||lwOptions.xhs_click_id)) {
    _setLocalstorage(lwOptions);
  } else if ((_.indexOf(sceneSearchCfg, scene) != -1) && lwOptions && lwOptions.isapplaunch) {
    _setSceneSearchUnion();
  }  else if ((cwx.getSystemInfoSync().host && cwx.getSystemInfoSync().host.env == 'SDK' && cwx.getSystemInfoSync().host.appId == 'wx64f9cf5b17af074d') && lwOptions && lwOptions.isapplaunch) {
    _setLocalstorage({"allianceid":1314167,"sid":4288206});
  } 

  //启动小程序时，记录场景值和openid等信息，用于活动等消费场景值数据
  lwOptions && lwOptions.isapplaunch && _listenSceneOpenid();
};
/**
 * 广告 clickId 推送 
 * @actionTime 行为发生时间戳(秒) 可采用页面加载时的时间戳
 */
Market.saveClickId = function (actionTime) {
  var mPage = cwx.getCurrentPage();
  var url = mPage.route || "pages/home/homepage";
  var storedData = cwx.getStorageSync(gStorageKey);
  var parsedData = {};
  var clickId = "";
  var openid = cwx.cwx_mkt.openid || "";
  var mp_appid = cwx.appId || "wx0e6ed4f51db9d078";
  var gzh_appid = "wx0a4845e45aaf634a"; // 携程微信公众号APPID  非小程序的

  if (!Number.isInteger(actionTime)) {
    // 如果没有传递时间戳 则取当前时间
    actionTime = new Date().getTime();
  }

  actionTime = parseInt(actionTime / 1000);

  if (storedData) {
    try {
      if (typeof JSON.parse(storedData) == "object") {
        parsedData = JSON.parse(storedData);
        clickId = parsedData["gdt_vid"] || "";
      }
    } catch (e) {
      console.log('storedData is not an object', e)
    }
  }

  if (!clickId && parsedData.exmktid) {
    try {
      if (typeof JSON.parse(parsedData.exmktid) == "object") {
        const exmktidObj = JSON.parse(parsedData.exmktid)
        clickId = exmktidObj["gdt_vid"] || "";
      }
    } catch (e) {
      console.log('parsedData.exmktid is not an object', e)
    }
  }
  let params = {
    "userId": JSON.stringify({
      "openid": openid
    }),
    "actionTime": actionTime,
    "adSource": "wechat",
    "org": "mini_program",
    "paramData": JSON.stringify({
      "click_id": clickId,
      "appid": gzh_appid,
      "mp_appid": mp_appid,
      "url": "https://www." + url
    })
  }

  cwx.request({
    url: "/restapi/soa2/13218/ocpxActivityMsgChannel",
    method: "POST",
    data: params,
    success: function (res) {
      mPage && mPage.ubtTrace && mPage.ubtTrace(104412, { "res": res, "params": params })
    },
    fail: function (err) {
      mPage && mPage.ubtTrace && mPage.ubtTrace(104412, { "err": err, "params": params })
    }
  })
};
/**
 * 基础获取到openid或unionid后，通知市场更新ls
 */
Market.updateCache = function () {
  _setLocalstorage();
};

/**
 * 获取业绩参数和推荐码,e.g. {"allianceid": "262684", "sid": "711465", "ouid": "', "sourceid": "55552689", "exmktid":"{\"... ...\"}"}
 * @param {function} callback 异步回调方法，可不传，会兼容成同步方法
 * @param {string} bustype 调用方BU类型，可不传，金融支付调用方需传
 * @param {string} orderid 订单id，可不传，金融支付调用方需传
 */
Market.getUnion = function (callback, bustype, orderid) {
  var lsData = null,
    unionData = null,
    ubtTraceData = "",
    ubtBusType = "",
    ubtOrderid = "",
    mPage = cwx.getCurrentPage();

  //兼容不传回调的同步方法
  if (callback && !_.isFunction(callback) && arguments.length < 3) {
    ubtBusType = callback;
    ubtOrderid = bustype;
  } else {
    ubtBusType = bustype;
    ubtOrderid = orderid;
  }

  //获取localstorage数据
  lsData = _getLocalstorage();

  //生成推荐码和业绩参数
  unionData = {
    "allianceid": lsData.allianceid,
    "sid": lsData.sid,
    "ouid": lsData.ouid && lsData.ouid.length<200?lsData.ouid:"",
    "sourceid": lsData.sourceid,
    "exmktid": lsData.exmktid
  }

  //接口调用信息埋点（1.判断支付调用方：ubtBusType & ubtOrderid 2.判断BU调用方：pageid）
  ubtTraceData = {
    "pageid": mPage ? (mPage.pageid || mPage.pageId || "") : "",
    "scene": cwx.scene,
    "bustype": (ubtBusType || "").toString(),
    "orderid": (ubtOrderid || "").toString(),
    "allianceid": lsData.allianceid,
    "sid": lsData.sid,
    "ouid": lsData.ouid && lsData.ouid.length<200?lsData.ouid:"",
    "sourceid": lsData.sourceid,
    "exmktid": lsData.exmktid
  };

  mPage && mPage.ubtTrace && mPage.ubtTrace(100713, ubtTraceData);

  //返回业绩参数
  if (callback && _.isFunction(callback)) {
    try {
      callback(unionData);
    } catch (e) {
      mPage && mPage.ubtTrace && mPage.ubtTrace(100782, _.extend(ubtTraceData, {
        errmsg: "执行回调错误：" + e
      }));
    }
  } else {
    return unionData;
  }
};

/**
 * 获取完整的cookie字符串,e.g. Union=OUID=v1c0a5s6_BTEAZAM2UWNQZlZmVTtdZVdiAW4DcQ==&AllianceID=108336&SID=552138&SourceID=2189
 */
Market.getUnionForCookie = function () {
  var lsData = null,
    unionCookie = null;

  //获取localstorage数据
  lsData = _getLocalstorage();

  //生成cookie字符串
  unionCookie = "Union=OUID=" + lsData.ouid + "&AllianceID=" + lsData.allianceid + "&SID=" + lsData.sid + "&SourceID=" + lsData.sourceid;

  //返回推荐码和业绩参数
  return unionCookie;
};

/**
 * 将推荐码写入localstorage；推送UBT，包括推荐码、DUID、注册or登录
 * @param {object} context 上下文
 * @param {object} params，包括：referralCode-地推码，isRegister-注册或登录
 */
Market.setReferralCode = function (context, params) {
  var ubtTraceData = "";

  if (!context || !context.ubtTrace || !_.isFunction(context.ubtTrace)) {
    console.log('mkt.setReferralCode ubt');
    return;
  }
  if (!params) {
    console.log('mkt.setReferralCode null');
    return;
  }

  //写入localstorage
  _setLocalstorage(null, params.referralCode);

  //生成UBT trace推送数据
  ubtTraceData = {
    "platform": gPlatform,
    "appid": cwx.appId,
    "duid": cwx.user.duid || "",
    "referralCode": params.referralCode || "",
    "isRegister": params.isRegister || false
  };

  //写入UBT
  context.ubtTrace(gUnionCfg.rcKey, ubtTraceData);
};

/**
 * 推送UBT，包括订单号、业绩参数、推荐码
 * @param {object} context 上下文
 * @param {string} orderID 订单号
 * @param {string} buType  BU
 */
Market.sendUnionTrace = function (context, orderID, buType) {
  var lsData = null,
    parsedExmktId = {},
    resData = {},
    orderid = orderID.toString() || "",
    butype = buType ? buType.toString() : "";

  if (!context || !context.ubtTrace || !_.isFunction(context.ubtTrace)) {
    return;
  }
  if (!orderid) {
    return;
  }

  //获取localstorage数据
  lsData = _getLocalstorage();

  if (lsData && lsData.exmktid) {
    parsedExmktId = JSON.parse(lsData.exmktid);

    if (!parsedExmktId.openid) {
      parsedExmktId.openid = cwx.cwx_mkt.openid;
    }
    if (!parsedExmktId.unionid) {
      parsedExmktId.unionid = cwx.cwx_mkt.unionid;
    }
  }

  //生成待落地的订单和业绩数据
  resData = {
    "platform": gPlatform,
    "appid": cwx.appId,
    "mktOpenID": cwx.cwx_mkt.openid,
    "unionID": cwx.cwx_mkt.unionid,
    "allianceId": lsData.allianceid.toString(),
    "sId": lsData.sid.toString(),
    "ouId": lsData.ouid,
    "sourceId": lsData.sourceid.toString(),
    "exMktId": JSON.stringify(parsedExmktId),
    "orderId": orderid,
    "buType": butype
  };

  //提交订单时，调框架接口，传入orderid，以便框架将orderid加入pageview埋点
  //【用于首页广告banner监测MKT和订单数据，因为我们订单抛 ubttrace 埋点，而广告从 pageview 埋点拉取广告数据】
  try{
    cwx.sendUbtByPage.ubtSet && cwx.sendUbtByPage.ubtSet("orderid", orderid);
  }catch(e){
    context.ubtTrace(169635, {
      errmsg: "提交订单id埋点异常:" + JSON.stringify(e)
    });
  }
  

  //订单和GPS信息埋点
  try {
    _beginLocate(orderid, function (location) {
      //订单及业绩写入UBT
      parsedExmktId.location = location.address;
      resData.exMktId = JSON.stringify(parsedExmktId);

      //变更：考虑UBT有3%-5%的损耗，因此变更为接口方式落地数据
      //context.ubtTrace(gUnionCfg.ouKey, JSON.stringify(resData));
      _saveOrderUnion(resData, context);

      //GPS位置和订单写入UBT，并由UBT消费服务抛给风控（orderID、cityLongitude、cityLatitude、countryName、provinceName、cityName、cityID、address）
      context.ubtTrace(100845, _.extend(location, {
        "orderID": orderid,
        "buType": butype
      }));
    });
  } catch (e) {
    //变更：考虑UBT有3%-5%的损耗，因此变更为接口方式落地数据
    //context.ubtTrace(gUnionCfg.ouKey, JSON.stringify(resData));
    _saveOrderUnion(resData, context);

    //获取地理位置异常埋点
    context.ubtTrace(100797, {
      errmsg: "获取地理位置异常：" + JSON.stringify(e)
    });
  }
};

/**
 * 获取需要分享出去的参数，并加密返回
 */
Market.getShareUnion = function () {
  var lsData = null,
    parsedExmktId = null,
    shareObj = {},
    shareStr = "";

  //获取localstorage数据
  lsData = _getLocalstorage();

  //拼接待传递业绩参数
  if (lsData) {
    shareObj = {
      "allianceid": lsData.allianceid,
      "sid": lsData.sid,
      "ouid": lsData.ouid,
      "sourceid": lsData.sourceid,
    };

    if (lsData.exmktid) {
      parsedExmktId = JSON.parse(lsData.exmktid);
    }
  }

  if (parsedExmktId) {
    shareObj = _.extend(shareObj, {
      "fromallianceid": parsedExmktId.fromallianceid,
      "fromsid": parsedExmktId.fromsid,
      "fromouid": parsedExmktId.fromouid,
      "fromsourceid": parsedExmktId.fromsourceid,
      "fromopenid": parsedExmktId.openid,
      "innersid":parsedExmktId.innersid,
      "innerouid":parsedExmktId.innerouid,
      "pushcode":parsedExmktId.pushcode
    });
  }

  //加密分享数据
  shareStr = "mktshare=" + cwx.util.mktBase64Encode(JSON.stringify(shareObj)).replace(/=/g, '()');

  //返回分享数据
  return shareStr;
};

/**
 * 获取跳出当前小程序时，url需携带的业绩参数
 */
Market.getReferrerUnion = function () {
  var lsData = null,
    referrerUnion = "";

  //获取localstorage数据
  lsData = _getLocalstorage();

  //拼接url业绩参数
  referrerUnion = "allianceid=" + lsData.allianceid + "&sid=" + lsData.sid + "&ouid=" + lsData.ouid + "&sourceid=" + lsData.sourceid;

  //返回小程序跳转携带的业绩参数
  return referrerUnion;
};

/**
 * 添加微信卡券
 * @param {array} list 策略id / 卡券id 数组
 * @param {string} type 类型，包含卡券/策略
 * @param {function} successCbk 成功回调
 * @param {function} failCbk 失败回调
 */
Market.addCard = function (list, type, successCbk, failCbk) {
  var mPage = cwx.getCurrentPage();
  var pageId = mPage ? (mPage.pageid || mPage.pageId || "") : "";
  var params = {
    "appId": cwx.appId,
    "mktOpenid": cwx.cwx_mkt.openid
  };

  list = [].concat(list);

  if (list.length == 0) {
    wx.showModal({
      title: "提示",
      content: "没有待添加的微信卡券",
      showCancel: false,
      success: function (res) {
        failCbk && _.isFunction(failCbk) && failCbk();
      }
    })
    mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
      "data": "策略id/卡券id列表数据为空",
      "type": type,
      "pageid": pageId,
      "errcode": -1
    });
    return;
  }

  if (!wx.addCard || !_.isFunction(wx.addCard)) {
    wx.showModal({
      title: "提示",
      content: "微信客户端版本较低，暂不支持卡券添加，请升级后重试",
      showCancel: false,
      success: function (res) {
        failCbk && _.isFunction(failCbk) && failCbk();
      }
    })
    mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
      "data": "微信客户端版本低，不支持小程序添加卡券",
      "pageid": pageId,
      "errcode": -2
    });
    return;
  }

  switch (type) {
    case "CARD":
      _.extend(params, {
        "parameterType": "cardid",
        "cardIdList": list
      });
      break;
    case "STRATEGY":
      _.extend(params, {
        "parameterType": "strategyid",
        "strategyIDList": list
      });
      break;
  }

  cwx.request({
    url: "/restapi/soa2/13364/getWechatCardExt",
    method: "POST",
    data: params,
    success: function (res) {
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
        if (res.data.resultCode == "0" && res.data.cardExtList.length > 0) {
          wx.addCard({
            cardList: res.data.cardExtList,
            success: function (res) {
              res && res.cardList && _saveWechatCardInfo(res.cardList, mPage, pageId);
              successCbk && _.isFunction(successCbk) && successCbk();
              mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
                "data": JSON.stringify(res),
                "pageid": pageId,
                "errcode": 0
              });
            },
            fail: function (e) {
              failCbk && _.isFunction(failCbk) && failCbk();
              mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
                "data": JSON.stringify(e),
                "pageid": pageId,
                "errcode": 1
              });
            }
          })
        } else {
          failCbk && _.isFunction(failCbk) && failCbk();
          mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
            "data": JSON.stringify(res.data),
            "pageid": pageId,
            "errcode": 2
          });
        }
      } else {
        failCbk && _.isFunction(failCbk) && failCbk();
        mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
          "data": JSON.stringify(res.data),
          "pageid": pageId,
          "errcode": 3
        });
      }
    },
    fail: function (e) {
      failCbk && _.isFunction(failCbk) && failCbk();
      mPage && mPage.ubtTrace && mPage.ubtTrace(101110, {
        "data": JSON.stringify(e),
        "pageid": pageId,
        "errcode": 4
      });
    }
  });
};

/**
 * 保存formid
 * @param {string} formId数据
 * @param {string} pId bu类型
 */
Market.saveUserFormID = function (formId, pId) {
  // if (!formId) {
  //   return;
  // }

  // var mPage = cwx.getCurrentPage();
  // var pageId = mPage ? (mPage.pageid || mPage.pageId || "") : "";

  // var params = {
  //   "platformType": "WECHAT",
  //   "appID": cwx.appId,
  //   "mktOpenID": cwx.cwx_mkt.openid,
  //   "formID": formId
  // };

  // if (pId) {
  //   params["productLineId"] = Number(pId);
  // }


  // var url = "/restapi/soa2/13555/saveUserFormID";

  // var success = function (res) {
  //   if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
  //     if (res.data.resultCode == "0") {
  //       mPage && mPage.ubtTrace && mPage.ubtTrace(101519, {
  //         "pageid": pageId,
  //         "request": params,
  //         "response": JSON.stringify(res.data)
  //       });
  //     } else {
  //       mPage && mPage.ubtTrace && mPage.ubtTrace(101124, {
  //         "pageid": pageId,
  //         "request": params,
  //         "response": JSON.stringify(res.data)
  //       });
  //     }
  //   } else {
  //     mPage && mPage.ubtTrace && mPage.ubtTrace(101125, {
  //       "pageid": pageId,
  //       "request": params,
  //       "response": JSON.stringify(res || "")
  //     });
  //   }
  // };

  // var fail = function (e) {
  //   mPage && mPage.ubtTrace && mPage.ubtTrace(101126, {
  //     "pageid": pageId,
  //     "request": params,
  //     "response": "错误信息" + e
  //   });
  // };

  // cwx.request({
  //   url: url,
  //   data: params,
  //   success: success,
  //   fail: fail
  // });
};


/**
 * 获取订阅消息状态
 * @param {string} formId数据
 * @param {string} pId bu类型
 */
Market.getSubscribeMsgInfo = function (templateIdList, onSuccess, onFail) {
  if (utils.subcribeVersionCompare()) {
    utils.getOpenid(function(){
      var mPage = cwx.getCurrentPage();
      var pageId = mPage ? (mPage.pageid || mPage.pageId || "") : "";
      cwx.request({
        url: "/restapi/soa2/18624/queryTemplateSubscribeStateInfo",
        method: "POST",
        data: {
          "templateIds": templateIdList,
          "openId": cwx.cwx_mkt.openid
        },
        success: function (res) {
          console.log(templateIdList)
          //console.log(cwx.cwx_mkt.openid)
          if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
            onSuccess && _.isFunction(onSuccess) && onSuccess(res.data);
            mPage && mPage.ubtTrace && mPage.ubtTrace(112944, {
              "actionCode": "pushswitch_control_Mini_program_nostyle",
              "openid": cwx.cwx_mkt.openid,
              "clientid": cwx.clientId,
              "pageid": pageId,
              "data": JSON.stringify(res.data)
            });
          } else {
            onFail && _.isFunction(onFail) && onFail(res);
            mPage && mPage.ubtTrace && mPage.ubtTrace(101621, {
              "data": JSON.stringify(res.data),
              "pageid": pageId
            });
          }
        },
        fail: function (e) {
          onFail && _.isFunction(onFail) && onFail(e);
          mPage && mPage.ubtTrace && mPage.ubtTrace(101621, {
            "data": JSON.stringify(e),
            "pageid": pageId
          });
        }
      });

    },function(){
      //获取openid异常
      onFail && _.isFunction(onFail) && onFail({ msg:'获取openid异常'});
    })
  }else{
    console.log('version fail')
    onFail && _.isFunction(onFail) && onFail({msg:'版本过低'});
  }

  
};


/**
 * 订阅消息
 * @param {string} formId数据
 * @param {string} pId bu类型
 */
Market.subscribeMsg = function (templateIdList, onSuccess, onFail) {
  console.log(templateIdList)
  var mPage = cwx.getCurrentPage();
  var pageId = mPage ? (mPage.pageid || mPage.pageId || "") : "";
  if (utils.subcribeVersionCompare()){
    wx.requestSubscribeMessage({
      tmplIds: templateIdList,
      success(res) {
        console.log('[wx.requestSubscribeMessage]-success')
        console.log(res)
        mPage && mPage.ubtTrace && mPage.ubtTrace(129292, {
          "actionCode": "wx.requestSubscribeMessage-success",
          "openid": cwx.cwx_mkt.openid,
          "clientid": cwx.clientId,
          "pageid": pageId,
          "data": JSON.stringify(res)
        });
        if (res.errMsg == 'requestSubscribeMessage:ok') {
          let agreeList = []
          for (let i in res) {
            if (res[i] == 'accept') {
              agreeList.push(i)
            }
          }
          if(agreeList.length==0){
            //用户取消订阅
            onSuccess && _.isFunction(onSuccess) && onSuccess(res);
          }else{
            //新活动通知订阅记录2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk
            _saveActivityPushData(agreeList)
            _subscribeMsg(agreeList, onSuccess, onFail)
          }

        } else {
          onFail && _.isFunction(onFail) && onFail(res);
        }
      },
      fail(res) {
        console.log('[wx.requestSubscribeMessage]-fail')
        console.log(res)
        mPage && mPage.ubtTrace && mPage.ubtTrace(129293, {
          "actionCode": "wx.requestSubscribeMessage-fail",
          "openid": cwx.cwx_mkt.openid,
          "clientid": cwx.clientId,
          "pageid": pageId,
          "data": JSON.stringify(res)
        });
        onFail && _.isFunction(onFail) && onFail(res);
      }
    })
  }else{
    console.log('version fail')
    onFail && _.isFunction(onFail) && onFail({ msg: '版本过低' });
  }
  
};



var _saveActivityPushData = function (agreeList){
    if(agreeList && agreeList.includes('2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk')){
      cwx.request({
        url: "/restapi/soa2/12673/saveActivityPushData",
        method: "POST",
        data: {
          "appId": cwx.appId,
          "mktOpenId": cwx.cwx_mkt.openid
        },
        success: function (res) {
          
        },
        fail: function (e) {
        
        }
      });
   }
}

var _subscribeMsg = function (agreeList, onSuccess, onFail){
  var mPage = cwx.getCurrentPage();
  var pageId = mPage ? (mPage.pageid || mPage.pageId || "") : "";
  console.log("subscribeTemplate==================")
  console.log(agreeList)
  //先获取订阅状态，未订阅推给通讯平台，防止重复插入
  Market.getSubscribeMsgInfo(agreeList, function (data) {
    var notSubscribeList = []
    _.map(data.templateSubscribeStateInfos, (item, index) => {
      if (!item.subscribeState) {
        notSubscribeList.push(item.templateId)
      }
    })
    console.log(notSubscribeList)
     cwx.request({
      url: "/restapi/soa2/18624/subscribeTemplate",
      method: "POST",
      data: {
        "templateIds": notSubscribeList,
        "openId": cwx.cwx_mkt.openid
      },
      success: function (res) {
        console.log('subscribe success')
        console.log(res)
        if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
          onSuccess && _.isFunction(onSuccess) && onSuccess(res.data);
          mPage && mPage.ubtTrace && mPage.ubtTrace(112944, {
            "actionCode": "pushswitch_control_Mini programt_followshow_nostyle",
            "openid": cwx.cwx_mkt.openid,
            "clientid": cwx.clientId,
            "pageid": pageId,
            "data": JSON.stringify(res.data)
          });
        } else {
          onFail && _.isFunction(onFail) && onFail(res);
          mPage && mPage.ubtTrace && mPage.ubtTrace(101622, {
            "data": JSON.stringify(res.data),
            "pageid": pageId
          });
        }
      },
      fail: function (e) {
        console.log('subscribe fail')
        console.log(res)
        onFail && _.isFunction(onFail) && onFail(e);
        mPage && mPage.ubtTrace && mPage.ubtTrace(101622, {
          "data": JSON.stringify(e),
          "pageid": pageId
        });
      }
    });
  }, function (res) {
    onFail && _.isFunction(onFail) && onFail(res);
  })
}


/**
* 发券--第三方入口进入
* @param {string}
*/
Market.receiveWeixinCoupon = function() {
  try{
      cwx.user.checkLoginStatusFromServer(checkLoginRes => {
          console.log('登录态'+checkLoginRes)
          if (checkLoginRes) {
              _receiveWeixinCoupon()
              
          } else {
              cwx.Observer.addObserverForKey('dynamicLoginSuccess', function () {
                  //console.log('登录成功')
                  _receiveWeixinCoupon()
                  
              });
          }
      });
  }catch(e){
      console.log('发券异常')
  }

}

var _receiveWeixinCoupon=function(){
  let mPage = cwx.getCurrentPage();
  utils.getOpenid(function(){
      let params={
          "openId":cwx.cwx_mkt.openid
      }
      cwx.request({
          url:"/restapi/soa2/12673/receiveCtripCouponByOpenId",
          method: "POST",
          data: params,
          success: function(res) {
              if (res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
                  mPage && mPage.ubtTrace && mPage.ubtTrace(179541, {
                      "errCode":res.data.errCode,
                      "request": params,
                      "response": "success:"+JSON.stringify(res.data)
                  });
              }else {
                  mPage && mPage.ubtTrace && mPage.ubtTrace(179541, {
                      "request": params,
                      "response": "fail:"+JSON.stringify(res)
                  });
              }
          },
          fail: function(e) {
              mPage && mPage.ubtTrace && mPage.ubtTrace(179541, {
                  "request": params,
                  "response": "error：" + JSON.stringify(e)
              });
          }
      })
      _saveUidOpenid()
  })

}

var _saveUidOpenid=function(){
  let mPage = cwx.getCurrentPage();
  try{
    let params={
        "appId": cwx.appId,
        "platform":"wechat_miniapp",
        "mktOpenid":cwx.cwx_mkt.openid
    }
    cwx.request({
        url:"/restapi/soa2/12429/mappingUidAndOpenId",
        method: "POST",
        data: params,
        success: function(res) {
            if (res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
              mPage && mPage.ubtTrace && mPage.ubtTrace(189546, {
                  "request": params,
                  "response": "success:"+JSON.stringify(res.data)
              });
            }else {
              mPage && mPage.ubtTrace && mPage.ubtTrace(189546, {
                  "request": params,
                  "response": "fail:"+JSON.stringify(res)
              });
            }
        },
        fail: function(e) {
          mPage && mPage.ubtTrace && mPage.ubtTrace(189546, {
              "request": params,
              "response": "error：" + JSON.stringify(e)
          });
        }
    })
  }catch (e) {
    mPage && mPage.ubtTrace && mPage.ubtTrace(189546, {
      "response": "catch：" + JSON.stringify(e)
    });
  }
}


const getEnv = function () {
  let re = {
      cid: cwx.clientID,
      appid: __global.appId
  };
  re.mpopenid = cwx.cwx_mkt && cwx.cwx_mkt.openid || "";
  re.mpunionid = cwx.cwx_mkt && cwx.cwx_mkt.unionid || "";

  try {
      let unionData = cwx.mkt.getUnion();
      re.allianceid = unionData.allianceid.toString();
      re.sid = unionData.sid.toString();
      re.ouid = unionData.ouid.toString();
      re.sourceid = unionData.sourceid.toString();

      const addKeyWhiteList = [
          "channelUpdateTime", 
          "openid",
          "unionid",
          "swanid", // 百度
          "serial", // 快应用
          "serverFrom", // 头条
          "innersid",
          "innerouid",
          "pushcode",
          "txCpsId",
          "amsPid",
          "gdt_vid",
          "xhs_click_id"
      ]
      const exmktid = {};

      if (unionData.exmktid) {
          if (typeof unionData.exmktid === "string") {
              try {
                  unionData.exmktid = JSON.parse(unionData.exmktid);
              } catch (e) {

              }
          }

          for (let key in unionData.exmktid) {
              if (addKeyWhiteList.indexOf(key) === -1) {
                  continue;
              }
              exmktid[key] = (unionData.exmktid[key] || '').toString();
          }
      }

      re.exmktID = JSON.stringify(exmktid);
      //re.referrerInfo = cwx.referrerInfo;
      re.scene = cwx.scene;
  } catch (e) {
      console.error('getEnv', e);
  }

  return encodeURIComponent(JSON.stringify(re));
}

/**
* webview业绩参数拼接
* @param {string}
*/
Market.urlRewrite=function(h5url){
  let unionData = cwx.mkt.getUnion()||{};

  h5url = h5url.replace(/[\u4e00-\u9fa5]+/g, function (str) {
      return encodeURIComponent(str)
  });

  let reg = /#[\s\S]*?$/;
  let hash = h5url.match(reg);
  h5url = h5url.replace(reg, '');

  /**
   * 注入小程序自带的参数
   */
  // let delta = "?";
  // if (/\?.+/.test(h5url)) {
  //     delta = "&";
  // }
  // if (h5url.slice(-1) !== "&") {
  //     h5url += delta;
  // }

  const mktIdObj = {
      fromminiapp:"weixin",  //给bu用的
      allianceid:unionData['allianceid']||'',
      sid:unionData['sid']||'',
      ouid:unionData['ouid']||'', 
      sourceid:unionData['sourceid']||'',
      _cwxobj:getEnv()
  }

  for( let key in mktIdObj ) {
      if (mktIdObj[key]) {
          let replaceStr = `${key}=${mktIdObj[key]}`;
          let reg = new RegExp("([?&])"+key + "=([^&]+)", 'i');

          // 添加&更新
          if (!reg.test(h5url)) {
              h5url += (h5url.match(/\?/) ? '&' : '?')+replaceStr;
          }else{
              h5url = h5url.replace(reg, '$1'+replaceStr)
          }
      }
  }

  //去除最后的&符号
  if (h5url.slice(-1) === "&") {
      h5url = h5url.slice(0, -1); //去除最后的&符号
  }

  h5url = h5url + (hash?hash:'');
  console.log('h5url',h5url)

  return h5url;
}

/**
* webview拼接业绩参数obj
*/
Market.unionObj=function(){
  let unionData = cwx.mkt.getUnion()||{};

  const mktIdObj = {
      fromminiapp:"weixin",  //给bu用的
      allianceid:unionData['allianceid']||'',
      sid:unionData['sid']||'',
      ouid:unionData['ouid']||'', 
      sourceid:unionData['sourceid']||'',
      _cwxobj:getEnv()
  }


  return mktIdObj;
}

module.exports = Market;
