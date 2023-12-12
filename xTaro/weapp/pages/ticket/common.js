import {_, CPage, cwx, __global} from "../../cwx/cwx.js";
// var __global = require('../../cwx/ext/global');
const app = getApp();
var base = {
    spotid: 762,
    requestParam: {
        ver: '8.25.1.0605144030'
    },
    channel: 10131, //默认网关
    restful: '/restapi/soa2/{channel}/json/{url}',
    bu: 'ticket', //哪个bu，公用组件需要埋点
    bustype: 7, //支付bu号
    titleheight: app.globalData.statusBarHeight + app.globalData.titleBarHeight, //标题高度
    //storageWhiteList: 'mkt,cwx,ctrip,auth,duid,clientid' //存储白名单，以免超过限制
}


var page = {
    list: {pageid: 10320629341, title: ''}, //列表页
    citylist: {pageid: 0, title: '请选择目的地'}, //目的地列表
    detail: {pageid: 10320629438, title: ''}, //详情页
    //notice : {pageid : 10320629594, title : '预订说明'}, //预订说明
    //descript : {pageid : 10320629603, title : '景点介绍'}, //景点介绍
    //addmore : {pageid : 10320629652, title : '添加更多门票'}, //添加更多
    //comment : {pageid : 10320629666, title : '景点评论'}, //景点评论
    //album : {pageid : 0, title : '景点图片'}, //景点图片
    //map : {pageid : 10320629760, title : '景点地图'}, //景点地图
    // booking: {pageid: 10320629717, title: '订单填写'}, //订单填写
    //ordercomplete : {pageid : 10320629726, title : '订单完成'}, //订单完成
    orderdetail: {pageid: 10320629735, title: '订单详情'}, //订单详情
    // coupon: {pageid: 10320660313, title: '选择优惠'}, //优惠券列表
    // search:{pageid:10320666572,title:'加载中...'},
    default: {pageid: 0, title: ''}, //默认
    // groupresdetail: {pageid: 10650003175, title: ''},
    // groupdetail: {pageid:10650003176, title: ''},
    // twebview: {pageid: 10650006623, title:''},
    // ttdpay: {pageid: 10650016238, title: ''}, // 支付页
    promotions: {pageid: 10650025773, title: ''},
    // promotionshare: {pageid: 10650025775, title: ''},
}

var store = {

    // s秒 m分钟 h 小时 d 天 n月 y 年

    //城市选择历史
    //城市列表切新接口，不兼容旧store，所以修改key
    CityHistory: {
        key: 'CityHistory2',
        expire: '3n'
    },

    //城市列表
    // CityList: {
    //     key: 'CityList',
    //     expire: '1h'
    // },

    //反查城市中心经纬度
    // Geo: {
    //     key: 'GSLocation',
    //     expire: '1h'
    // },

    //预订信息
    // BookingParam: {
    //     key: 'BookingParam',
    //     expire: '1h'
    // },

    //价格
    PriceList: {
        key: 'PriceList',
        expire: '1m'
    },

    //景点信息
    // SpotInfo: {
    //     key: 'Detail',
    //     expire: '1m'
    // },

    //资源信息-- 不要做缓存，目前的缓存机制会导致秒杀更新不来。。。
    // ResourceInfo: {
    //     key: 'Resource',
    //     expire: '1m'
    // },

    //出行人信息
    CustomerInfo: {
        key: 'CustomerInfo',
        expire: '1h'
    },

    //用户选择的城市
    TicketCityInfo: {
        key: 'CityInfo2',
        expire: '30d'
    },

    //用户定位
    PosCity: {
        key: 'PosCity',
        expire: '1h'
    },


}


var model = {

    //列表查询
    ListSearch: {
        url: 'ticketSpotSearch',
        channel: 12530
    },
    //一日游
    // RecommendProductByCategoryPoi: {
    //     url: 'getRecommendProductByCategoryPoi',
    //     channel: 12530
    // },
    //城市列表
    // CityList: {
    //     url: 'AvailableCityListQOC',
    //     param: {
    //         limit: 10000
    //     }//,
    //     //store: store.CityList
    // },
    //城市列表
    CityList12530: {
        url: 'cityList',
        channel:12530,
        param: {
            limit: 10000
        }//,
        //store: store.CityList
    },
    //景点详情
    // SpotDetail: {
    //     url: 'scenicSpotDetails',
    //     channel: 12530,
    //     param: {
    //         spotid: 0,
    //         imgsize: 'C_750_380',
    //     }//,
    //     //store: store.SpotInfo
    // },
    // SpotDetailOld: {
    //     url: 'ViewSpotInfoV1QOC',
    //     param: {
    //         id: 0,
    //         imgsize: 'C_640_360',
    //         imglimit: 18,
    //         iskill: false
    //     }//,
    //     //store: store.SpotInfo
    // },
    //资源详细信息
    ResourceInfo: {
        url: 'resourceAddInfoQOC',
        channel: 12530,
        // store: store.ResourceInfo
    },
    //资源详细信息
    ResourceInfoOld: {
        url: 'ResourceInfoQOC',
        store: store.ResourceInfo
    },
    BoxAddInfo: {
        url: 'boxAddInfo',
        channel: 12530,
    },
    //订单详情
    OrderDetail: {
        url: 'orderDetailSearch',
        param: {
            "oid": 0,
        },
        channel: 12530,
    },
    // OrderCancel: {
    //     url: 'OrderManagementQOC',
    //     param: {
    //         'oid': 0,
    //         'reason': '行程不确定'
    //     }
    // },
    // ContinuePay: {
    //     url: 'ContinueToPayQOC',
    //     channel: 12530
    // },
    //重发短信
    // SendMsg: {
    //     url: 'SendMessageQOC'
    // },
    //  催单
    // reminderConfirm: {
    //     url: 'reminderConfirm',
    //     channel: 12530
    // },
    //出行人模板
    // CustomerInfoTemplate: {
    //     url: 'CustomerInfoTemplateV1QOC',
    //     store: store.CustomerInfo
    // },
    //价格
    // PriceListSearch: {
    //     url: 'TicketPriceListV1QOC',
    //     store: store.PriceList,
    //     param: {
    //         type: 0,
    //         skid: 0,
    //         rids: []
    //     }
    // },
    // CouponSearch: {
    //     url: 'CouponSearchQOC',
    //     channel: 12530
    // },
    // CouponValidationModel: {
    //     url: 'CouponValidationQOC',
    //     channel: 12530
    // },

    //订单取消
    // VacationOrderCancelModel: {
    //     url: "OrderManagementQOC",
    //     param: {
    //         "oid": 0,
    //         "reason": "行程不确定"
    //     },
    //     isUserData: true
    // },
    //搜索
    // TicketSearch: {
    //     url: 'AutoCompleteSearchV1QOC'
    // },
    //java搜索
    autoCompleteSearch: {
        url: 'autoCompleteSearchQOC',
        channel:12530
    },
    //下单
    // CreateTicketOrderModel: {
    //     url: 'CreateTicketOrderV1QOC'
    // },
    //获取团购活动列表 按钮是否显示 以及拼团详情资源推荐列表
    PurchaseActivityListModel: {
        url: 'groupPurchaseActivityList',
        channel: 12530
    },
    //拼团资源详情信息
    PurchaseResourceModel: {
        url: 'groupPurchaseResourceInfo',
        channel: 12530
    },
    // 获取拼团详情信息
    GroupPurchaseInfoModel: {
        url: 'groupPurchaseInfo',
        channel: 12530
    },
    ViewSpotImagesModel: {
        url: 'viewSpotImages',
        channel: 12530
    },
    // 创建拼团
    JoinGroupPurchaseModel: {
        url: 'joinGroupPurchase',
        channel: 12530
    },
    // 获取正在拼团的信息
    GroupPurchaseIngModel: {
        url: 'groupPurchaseIng',
        channel: 12530
    },
    // 获取拼团分享图片信息
    GroupPurchaseImageModel: {
        url: 'groupPurchaseImage',
        channel: 12530
    },
    // 二维码
    WxqrCodeModel: {
        url: 'getWxqrCode',
        channel: 13242
    },
    // 说明
    GroupAddInfo: {
        url: 'resourceAddInfoQOC',
        channel: 12530
    },
    // 获取省份id
    GetCityInfoModel: {
        url: 'ttdCityInfo',
        channel: 12530
    },
    CustomerFlowInfoModel: {
        url: 'viewCustomerFlowInfo',
        channel: 12530
    },
    SpotTrafficModel: {
        url: 'scenicSpotTraffic',
        channel: 12530
    },
    NoticeInfoModel: {
        url: 'scenicSpotDescription',
        channel: 12530
    },
    // ---- 砍价业务 ----
    CheckCutOrderInfo: {
        url: 'checkCutOrderInfo',
        channel: 12530
    },
    GetCutOrderInfo: {
        url: 'cutOrderInfo',
        channel: 12530
    },
    GetCutPublicInfo: {
        url: 'getCutPublicInfo',
        channel: 12530
    },
    BargainForCashBack: {
        url: 'bargainForCashBack',
        channel: 12530
    },
    GetPromotionByScene: {
        url: 'getPromotionByScene',
        channel: 12530
    },
    ReceiveCoupons: {
        url: 'receiveCoupons',
        channel: 12530
    },
    GetSceneProduct: {
        url: 'getSceneProduct',
        channel: 12530
    },
    O2oBookingCreateOrder: {
        url: 'o2ocreateorder',
        channel: 12530
    }
}

Object.keys(model).map(function (key) {
    var item = model[key];
    item.key = item.url;
    if (item.store) {
        item.key = item.store.key || item.key;
        item.expire = item.store.expire || item.expire;
    }
});

var config = {
    Base: base,
    Model: model,
    Page: page,
    Store: store
}

var TPage = function (options) {
    var index = 'default';
    var pagename = options.name || index;
    var pageconfig = config.Page[pagename] || config.Page[index];
    options.pageId = pageconfig.pageid;
    var title = pageconfig.title;
    var thatload = options.onLoad;
    options.onLoad = function () {
        title && cwx.setNavigationBarTitle({
            title: title
        })
        var args = Array.prototype.slice.call(arguments, 0);
        thatload.apply(this, args);
    }
    CPage(options);
}

/**
 * @param content {string}
 */
TPage.showToast = function (content, time) {
    wx.showToast({
        title: content || '加载中...',
        icon: 'loading',
        mask: true,
        duration: time || 3000
    });
};

TPage.hideToast = wx.hideToast;

const _isFunction = function (func) {
    return typeof func === 'function' && Object.prototype.toString.call(func) === '[object Function]';
};

/**
 * @desc wx支持showLoading, 保证和支付一样, 目前支付和继续支付在用
 * @param content
 */
TPage.showLoading = function (content) {
    _isFunction(wx.canIUse) && wx.canIUse('showLoading') && _isFunction(wx.showLoading) ?
        wx.showLoading({
            title: content || '加载中...',
            mask: true
        }) :
        TPage.showToast(content, 100000);
};

TPage.hideLoading = function () {
    _isFunction(wx.canIUse) && wx.canIUse('hideLoading') && _isFunction(wx.hideLoading) ?
        wx.hideLoading() : TPage.hideToast();
};

var payment = {
    dopay: function (param) {
        var token = param.ptokenjson;
        var extend = param.pextendjson;
        var args;
        var url = '../order/detail?orderid=' + param.oid;
        // 如果是拼团订单就跳转到拼团详情页
        if (param.groupid) {
            url = '../groupdetail/index?oid=' + param.oid + '&groupid=' + param.groupid;
        }
        // 如果是票机
        if (param.salecode == 'dingyou'){
            url = '../o2obooking/status?orderid=' + param.oid;
        }
        //服务端改造的参数
        if (param.payVersion == '2.0') {
            args = {
                'requestId': param.requestPayId,
                'orderId': param.oid,
                'payToken': param.payToken,
                'busType': param.bustype || config.Base.bustype,
            }
            cwx.payment.callPay2({
                "serverData": args,
                "sbackCallback": function () {
                    cwx.redirectTo({url: url});
                },
                "fromCallback": function () {
                    cwx.navigateBack();
                },
                "ebackCallback": function () {
                    cwx.redirectTo({url: url});
                }
            });
            return;
        }
        //老的参数
        args = {
            bustype: param.bustype || config.Base.bustype,
            oid: param.oid,
            token: encodeURIComponent(cwx.util.base64Encode(token)),
            extend: encodeURIComponent(cwx.util.base64Encode(extend))
        };
        if (param.psign) {
            args.sign = param.psign;
        }
        cwx.payment.callPay({
            "data": args,
            "sbackCallback": function () {
                cwx.redirectTo({url: url});
            },
            "fromCallback": function () {
                cwx.navigateBack();
            },
            "ebackCallback": function () {
                cwx.redirectTo({url: url});
            }
        });
    }
};

// 折扣 比如deduamout为0.22，那返回就是7.8折
var computDiscount = function (deduamout) {
    return hackMulti(hackAdd(1, -deduamout), 10);
};

// 折扣 比如deduamout为0.22，返2.2折
var rebateDiscount = function (deduamout) {
    return hackMulti(deduamout, 10);
};
/**
 * 券角/优惠金额/券描述组装/'起'('折')是否需要
 * @param item
 */
// var descAdd = function (item) {
//     var subtitle = "", imgtext = "";
//     var dedus_temp = item.dedus || [];
//
//     //  我的优惠券页或者填写页不能使用的优惠券，沿用老逻辑
//     var getAmount1 = function () {
//         item.immediate = false; // 折，起都要
//         switch (item.protype) {
//             case 1:
//                 imgtext = dedus_temp[0].deduamout;
//                 break;
//             case 2:
//                 imgtext = computDiscount(dedus_temp[0].deduamout);
//                 break;
//             case 3:
//                 //dedus_temp = dedus_temp.length > 0 && _.sortBy(dedus_temp, 'samout'); // 按 满金额排序
//                 dedus_temp = dedus_temp.length > 0 && _.sortBy(dedus_temp, 'deduamout'); // 按减金额或比例排序
//                 subtitle = "满" + dedus_temp[0].samout + "元可" + (item.prometh === 1 ? '减' : '返');
//                 imgtext = dedus_temp[0].deduamout;
//                 if (dedus_temp[0].dedutype === 1) {  // 0 金额 ；1 百分比； 默认金额
//                     imgtext = computDiscount(dedus_temp[0].deduamout);
//                 }
//                 break;
//             case 4:
//                 imgtext = "全" + (item.prometh === 1 ? '免' : '返');
//                 break;
//         }
//     };
//
//     // 选择优惠券页 可用优惠券按订单价格联动显示 金额，阶梯
//     var getAmount2 = function () {
//         item.immediate = true; // 起， 折，统统都不要 ,前端会根据这个字段来, ￥统统要
//         imgtext = item.prometh === 1 ? item.redamt : item.retamt;
//         if (item.protype === 3) { // 阶梯券描述 按命中阶梯展示
//             var choosedDedu = _.find(item.dedus, function (dedu) {
//                 return dedu.deduid === item.deduid;
//             });
//             if (choosedDedu) {
//                 subtitle = "满" + choosedDedu.samout + (item.prometh === 1 ? '元可减' : '元可返');
//             }
//         }
//     };
//
//     var isDisplayOld = !item.canuse;     //  !item.frombooking || (item.frombooking && !item.canuse);
//     isDisplayOld ? getAmount1() : getAmount2(); // 1：显示按老逻辑展示 2：显示按实际优惠额度展示
//
//     item.imgtext = imgtext;
//     item.subtitle = subtitle;
//     var protypes;
//     if (item.prometh === 1) {
//         protypes = ["立减", "立减", "满减", "全免"];
//         item.protypename = protypes[item.protype - 1];
//     } else {
//         protypes = ["返现", "返现", "满返", "全返"];
//         item.protypename = protypes[item.protype - 1];
//     }
// };


/**
 * 阶梯条拼装(只有阶梯需要)
 */
//
// var dedusAdd = function (item) {
//     if (item.protype === 3) { //阶梯
//         var temp = [];
//         _.each(item.dedus, function (dedu, index) {
//             if (dedu.dedutype === 0) {
//                 dedu.desc = (index + 1) + "、满" + dedu.samout + "元" + (item.prometh === 1 ? '减' : '返') +  dedu.deduamout + '元';
//             } else if (dedu.dedutype === 1) {
//                 dedu.desc = (index + 1) + "、满" + dedu.samout + "元" + (item.prometh === 1 ? '减' : '返') + rebateDiscount(dedu.deduamout) + "折";
//             } else {
//                 dedu.desc = "";
//             }
//             temp.push(dedu);
//         });
//         item.dedusDesc = temp;
//     }
// };


/**
 * 优惠券format
 * @param res  数据部分传过来
 * @returns {Function} 真正的format
 */
// var couponListDataFormat = function (res) {
//     var mycoupondatas = res && res.rslts || [];
//     //var mycoupondatas = mockdata.data.rslts;
//     var _coupons1    = [], // 暂存可用券
//         _coupons2    = [], // 暂存不可用券
//         canusecount  = 0,
//         hascodecount = 0,
//         nocodecount  = 0,
//         ret          = {msg: res.msg, errmsg: res.errmsg};
//     for (var i = 0; i < mycoupondatas.length; i++) {
//         var item = mycoupondatas[i];
//         // item.frombooking = frombooking;
//         item.canuse = item.pstatus === 0 ? true : false;
//         item.hascode = item.isdisplay;
//         item.isdtop = item.istop; //兼容 老的接口返回属性名
//         descAdd(item);
//         dedusAdd(item);
//         item.canuse ? _coupons1.push(item) : _coupons2.push(item);  // 推入可用券和不可用券
//         if (item.isdisplay) {
//             hascodecount++;
//             if (item.pstatus === 0) {
//                 canusecount++;
//             }
//         } else {
//             nocodecount++;
//         }
//     }
//     ret.coupons = _coupons1.concat(_coupons2);
//     // restful有返回可用优惠券数量（后来新加）则用result返回的值，否则自己算可用数量
//     if (ret.canusecount === undefined) {
//         ret.canusecount = canusecount;
//     }
//     //ret.canusecount = ret.canusecount || canusecount;
//     ret.hascodecount = hascodecount;//有码数量（展示)
//     ret.nocodecount = nocodecount;//无码数量(不展示）
//     ret.hasdefault = res && res.hasdefault;//是否有默认券 7.3 ++
//     ret.abtests = res && res.abtests || []; // 首页 跳转CRN的AB
//     return ret;
// };


var getFractionLength = function (n) {
    var fraction = n.toString().split('.')[1];
    return fraction ? fraction.length : 0;
};

var hackAdd = function (n1, n2) {
    var l1 = getFractionLength(n1);
    var l2 = getFractionLength(n2);
    var l = Math.max(l1, l2);
    var p = Math.pow(10, l);
    return (n1 * p + n2 * p ) / p;getResultWithFractionLength
};

var hackMulti = function (n1, n2) {
    var l = 0;
    l += getFractionLength(n1);
    l += getFractionLength(n2);
    return Number(n1.toString().replace('.', ''))
        * Number(n2.toString().replace('.', ''))
        / Math.pow(10, l);
};

var search = function (options, that) {

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
    let scene = query && query.type; //场景类型 16门票 57门票通用关键字
    let activityflag = query && query.activity_flag; //营销标志
    let searchid = getWidgetParam('searchId', options) || ''; //搜索id，用来统计分析用户单次搜索场景
    let result = getWidgetParam('widgetData', options); //携程回给微信的数据，也是widget中拿到的数据
    let list = result && result.data_list ||[];
    let origin = getWidgetParam('query', options) || ''; //用户原始搜索值，微信说有，实际上埋点发现没有

    //市场所需要的埋点
    let openid = cwx.cwx_mkt.openid || '';

    that.ubtTrace(101183, {
        pageId: that.pageId,
        eventname: 'wxsearch',
        openid: openid,
        searchid: searchid,
        origin: origin,
        param: query,
        result: result
    });

    return {
        //origin: origin,
        query : query, //拆分
        param : param,
        scene : scene,
        activityflag : activityflag,
        result: result,
        list: list
    }
}

var getHost = function() {
    let host = '';
    if (__global.env.toLowerCase() === 'uat') {
        host = 'm.uat.qa.nt.ctripcorp.com'
    } else if (__global.env.toLowerCase() === 'fat') {
        host = 'm.ctrip.fat334.qa.nt.ctripcorp.com';
    }else{
        host = 'm.ctrip.com'; //生产
    }
    return host;
}
var getResultWithFractionLength = function (res, n = 0) {
    const count = getFractionLength(res);
    if (count === 0 || count <= n) {
        return res;
    }
    return +Number(res).toFixed(n);
};

const locateSource = "ticket-lbs";

export default cwx;
export {cwx};
export {_};
export {__global};
export {TPage};
export {payment};
export {config};
// export {couponListDataFormat};
export {hackAdd};
export {hackMulti};
export {search};
export {getHost};
export {getResultWithFractionLength};
export {locateSource};

