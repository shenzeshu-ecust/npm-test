import { cwx, CPage } from '../../../cwx/cwx.js';

let DEFAULT_IMAGE = 'https://pages.c-ctrip.com/you/wechat/default_640x360.png',
  currentDistrictId = 0;

function removeHtmlTagAddBr (str) {
  str = str || ''; // undefined posibility
  str = str.replace(/<\/p>/g, '<br><\/p>');
  str = str.replace(/<\/div>/g, '<br><\/div>');
  str = str.replace(/<(?!\/?br)[^<>]*>/g, '');
  str = str.replace(/<\/?[^>]*>/ig, '\r\n\n');
  return str;
}

function removeHtmlTag (str) {
  str = str || ''; // undefined posibility
  str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
  str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
  //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
  //str = str.replace(/ /ig, ''); //去掉
  return str;
}

function removeHtmlTagA(str) {
  str = str || '';
  str = str.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g,''); //去除 <a> 标签
  return str;
}

function replaceFromUrl(str) {
  str = str || '';
  str = str.replace(/##/g,'&');
  str = str.replace(/@@/g,'?');
  str = str.replace(/%%/g,'=');
  return str;
}


function storeHomeHistory(type, id, name) {
  if(type && id && name) {
    let homeHistory = getHomeHistory(),
        uniqueHistory = [], uniqueEntities = {}, entity;
    homeHistory.unshift({type: String(type), id: String(id), name: String(name)});
    for(let i = 0, len = homeHistory.length; i <  len && uniqueHistory.length < 4; i++) { // 最多只存四个历史
      entity = JSON.stringify(homeHistory[i]);
      if(!uniqueEntities[entity]) {
        uniqueEntities[entity] = true;
        uniqueHistory.push(homeHistory[i]);
      }
    }
    cwx.setStorage({
      key: 'GS_HOME_HISTORY_CACHE',
      data: uniqueHistory
    });
  }
}

function getHomeHistory() {
  return cwx.getStorageSync('GS_HOME_HISTORY_CACHE') || [];
}

function changeDistrict(districtPage, districtId, districtName, type, historyLen) {
  currentDistrictId = districtId;
  districtPage.districtChanged(districtId, districtName, type);
  if(historyLen > 0) {
    wx.navigateBack({delta: historyLen});
  }
}

function checkDistrictType(districtId, callback) {
  if(!districtId) {
    callback && calback();
  }

  let cachedDistrictTypeInfo = cwx.getStorageSync('GS_DISTRICT_TYPE_INFO_CACHE') || {},
    districtInfo = cachedDistrictTypeInfo[districtId];
  if(!districtInfo) { // 没有缓存, 从服务端读取
    let currentPage = cwx.getCurrentPage();
    showLoading();
    cwx.request({
      url: '/restapi/soa2/10011/GetDistrictDetail',
      data: {
        districtids: districtId,
      },
      success: (res) => {
        hideLoading();
        if(res.data && res.data.Result && res.data.Result[0]) {
          let type = res.data.Result[0].PageType < 400 ? 'country' : 'city', name = res.data.Result[0].Name;
          cachedDistrictTypeInfo[districtId] = {type: type, name: name};
          cwx.setStorageSync('GS_DISTRICT_TYPE_INFO_CACHE', cachedDistrictTypeInfo);
          callback && callback(type, name);
        } else {
          callback && calback();
        }
      }
    });
  } else {
    callback && callback(districtInfo.type, districtInfo.name);
  }
}

/**
 * 根据id判断跳转城市/国家页
 * @param districtId -- 目的地id
 * @param isRedirect -- false(default): 页面跳转, true: 页面重定向
 * @param silence -- false(default): 切换目的地前是否显示提示信息
 */
function gotoDistrictPage(districtId, isRedirect, silence) {
  let currentPage = cwx.getCurrentPage(), pages = getCurrentPages(),
    idx = -1, historyLen = pages.length - idx - 1, isSearchPage = /destination\/search/.test(currentPage.__route__);
  districtId = parseInt(districtId);

  for(let i = 0; i < pages.length; i++) {
    if(/destination\/(?:home|country)/.test(pages[i].__route__)) {
      idx = i;
      historyLen = pages.length - idx - 1
      break;
    }
  }

  if(districtId) {
    checkDistrictType(districtId, (type, districtName) => {
      if(type) { // 合法的目的地
        if(idx >=0) { // 历史栈中存在目的地页
          if(silence) {
            storeHomeHistory('district', districtId, districtName);
            changeDistrict(pages[idx], districtId, districtName, type, historyLen);
          } else {
            let content;
            if(districtId === currentDistrictId) {
              content = '确认要返回当前目的地的首页吗?';
            } else {
              content = '确认要切换目的地至"' + districtName + '"吗?';
            }
            wx.showModal({
              title: '提示',
              content: content,
              success: (res) => {
                if(res.confirm) { // 确认
                  storeHomeHistory('district', districtId, districtName);
                  changeDistrict(pages[idx], districtId, districtName, type, historyLen);
                }
              }
            });
          }
        } else {
          storeHomeHistory('district', districtId, districtName);
          currentDistrictId = districtId;
          let params = {
            url: '/pages/gs/destination/home',
            data: {
              districtId: districtId,
              districtName: districtName,
              districtType: type,
            },
          };
          if(isRedirect) {
            wx.redirectTo({
                url: '/pages/gs/destination/home?districtId='+districtId+'&districtName='+districtName+'&districtType='+type
            })
          } else {
            currentPage.navigateTo(params);
          }
        }
      }
    });
  }
}

function showLoading(msg){
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    });
}

function hideLoading(){
    wx.hideToast();
}



function pageError(title, options) {
  let currentPage = cwx.getCurrentPage();
  let url = (currentPage.__route__.indexOf('/') !== 0 ? '/' : '') + currentPage.__route__;

  let redirectToUrl = '/pages/gs/common/error?title='+title+'&fromUrl='+url;

  for(var key in options){
    if(redirectToUrl.indexOf('@@')>0){
      redirectToUrl=redirectToUrl +'##'+ key + '%%' + options[key];
    }else{
      redirectToUrl=redirectToUrl +'@@'+ key + '%%' + options[key];
    };
  }
  console.log(redirectToUrl);

  wx.redirectTo({
    url: redirectToUrl
  });
}


function search (options, that) {

    function isEncodeJson (str){
        return typeof str === 'string' && str.trim()[0] === '%';
    }

    function getWidgetParam (paramName, data) {
        if (paramName === 'query') {
            if ('wxSearchQuery' in data) {
                return decodeURIComponent(data.wxSearchQuery);
            }
            return data.query;
        }
        if (!data[paramName]) {
            return;
        }
        if (isEncodeJson(data[paramName])) {
            return JSON.parse(decodeURIComponent(data[paramName]));
        }
        else {
            return JSON.parse(data[paramName]);
        }
    }

    let query = getWidgetParam('wxParamData', options); //用户输入关键字转成的意图，结构类似如下：
    //"{"type":16,"slot_list":[{"key":"country","value":"中国"},{"key":"province","value":"贵州"},{"key":"city","value":"遵义"},{"key":"district","value":"遵义"},{"key":"gps_city","value":"上海"},{"key":"scenic_name","value":"飞龙湖"}]}"

    //非搜索场景，无需埋点
    if (!query){
        return {};
    }
    let param = query && query.slot_list || [];
    let scene = query && query.type; //场景类型 64景点
    // let activityflag = query && query.activity_flag; //营销标志
    // let searchid = getWidgetParam('searchId', options) || ''; //搜索id，用来统计分析用户单次搜索场景
    let result = getWidgetParam('widgetData', options); //携程回给微信的数据，也是widget中拿到的数据
    let list = result && result.data_list ||[];
    // let origin = getWidgetParam('query', options) || ''; //用户原始搜索值，微信说有，实际上埋点发现没有

    //市场所需要的埋点
    // let openid = cwx.cwx_mkt.openid || '';

    // that.ubtTrace(101183, {
    //     pageId: that.pageId,
    //     eventname: 'wxsearch',
    //     openid: openid,
    //     searchid: searchid,
    //     origin: origin,
    //     param: query,
    //     result: result
    // });

    return {
        //origin: origin,
        query : query, //拆分
        param : param,
        scene : scene,
        // activityflag : activityflag,
        result: result,
        list: list
    }
}

function json2url (json){
    if (!json) {
        return '';
    }
    var tmps =[];
    for (var key in json){
      tmps.push(key + '=' + json[key]);
    }
    return tmps.join('&');
}

//获取 url中的value参数值
function getQueryString(url, key) {
  var reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
  var r = url.match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

function strcharacterDiscodef(str){
  str = str || '';
  // str = str.replace(/&amp;quot;/g, '"');
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&#x09;/g, '\t');
  str = str.replace(/&#x0A;/g, '\n');
  str = str.replace(/&#x0C;/g, '\f');
  str = str.replace(/&#x0D;/g, '\r');
  str = str.replace(/&#x20;/g, ' ');
  str = str.replace(/&nbsp;/g, ' ');
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&#39;/g, '\'');
  str = str.replace(/&#x2F;/g, '/');
  str = str.replace(/&lt;/g, '<');
  str = str.replace(/&gt;/g, '>');
  str = str.replace(/&#x5C;/g, '\\');
  str = str.replace(/&#x2028;/g, '\u2028');
  str = str.replace(/&#x2029;/g, '\u2029');
  str = str.replace(/&#160;/g, '');
  str = str.replace(/&middot;/g, '·');
  str = str.replace(/&#183;/g, '·');
  str = str.replace(/&ldquo;/g, '“');
  str = str.replace(/&rdquo;/g, '”');
  str = str.replace(/&rsquo;/g, '‘');
  str = str.replace(/&rdquo;/g, '’');
  str = str.replace(/&ndash;/g, '–');
  str = str.replace(/&mdash;/g, '—');
  str = str.replace(/&rarr;/g, '→');
  str = str.replace(/&darr;/g, '↓');
  str = str.replace(/&uarr;/g, '↑');
  str = str.replace(/&larr;/g, '←');

  return str;
}

/*
    比较小程序版本

  */
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}
function isH5Url(target){
  return /^http(s)?:\/\/[A-Za-z0-9\-]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\:+!]*([^<>])*$/.test(target);
}
module.exports = {
  DEFAULT_IMAGE,
  currentDistrictId,
  removeHtmlTagAddBr,
  removeHtmlTag,
  removeHtmlTagA,
  replaceFromUrl,
  storeHomeHistory,
  getHomeHistory,
  gotoDistrictPage,
  showLoading,
  hideLoading,
  pageError,
  search,
  json2url,
  getQueryString,
  strcharacterDiscodef,
  compareVersion,
  isH5Url
}
