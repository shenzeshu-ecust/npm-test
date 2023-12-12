/***************
 * 下面的服务列表请保持对齐
 * 左边的服务名一律全小写
 ************/

import { _ } from '../../../../cwx/cwx.js';
import C from '../C';

const netServiceList = ['10398', '11126', '11754'];

// 测试子环境设置
let isTest = false;
let fatEnv = 'fat369';
try {
    const configSubEnv = wx.getStorageSync('P_HOTEL_TEST_SUB_ENV');
    if (configSubEnv && configSubEnv !== 'default') {
        if (configSubEnv === 'fws') {
            isTest = false;
        } else {
            isTest = true;
            fatEnv = configSubEnv;
        }
    }
} catch (e) {
    // ignore
}

// 堡垒测试参数
let isBastion = false;
try {
    const renderStorage = wx.getStorageSync(C.STORAGE_HOTEL_BASTION_TEST);
    isBastion = renderStorage === '1' || renderStorage === '2';
} catch (e) {
    // ignore
}

const baseurl = {
    /* 22370: {AppID: 100032236, Description: CtripWeb前端Node中转服务} */
    gethotellist: '/restapi/soa2/22370/gethotellist',
    getnearbyhotellist: '/restapi/soa2/22370/getnearbyhotellist',
    getcompensatehotellist: '/restapi/soa2/22370/getcompensatehotellist',
    getuserhotellist: '/restapi/soa2/22370/getuserhotellist',
    gethotelfilter: '/restapi/soa2/22370/gethotelfilter',
    getHourRoomList: '/restapi/soa2/22370/getroomlist',
    getroomlistnew: '/restapi/soa2/22370/getroomlist',
    reservation: '/restapi/soa2/22370/reservation',
    createorder: '/restapi/soa2/22370/createorder',
    getPlanetBanner: '/restapi/soa2/22370/getPlanetBanner',
    graphql: '/restapi/soa2/22370/graphql',
    checkOrderPassenger: '/restapi/soa2/22370/checkOrderPassenger',
    track: '/restapi/soa2/22370/track', // 一致率到ES
    commentInit: '/restapi/soa2/22370/commentInit',
    commentClientSubmit: '/restapi/soa2/22370/commentClientSubmit',
    commentClientUpload: '/restapi/soa2/22370/commentClientUpload',
    getcityinfo: '/restapi/soa2/22370/getcityinfo',
    getorderdetailnew: '/restapi/soa2/22370/getorderdetail',
    waitcommentlist: '/restapi/soa2/22370/waitcommentlist',
    getThirteenBanner: '/restapi/soa2/22370/getThirteenBanner',
    getHotelListBanner: '/restapi/soa2/22370/gethotellistbanner',
    getphonenumber: '/restapi/soa2/22370/getphonenumber',
    gethotelproduct: '/restapi/soa2/22370/gethotelproduct',
    createTravelCouponOrder: '/restapi/soa2/22370/createstorder',

    keywordAssociation: '/restapi/soa2/22370/keywordassociation',
    getrankurlinfo: '/restapi/soa2/22370/getrankurlinfo', // 口碑榜

    /* 26187: {AppID: 100041244, Description: 酒店前端中文站点附加信息} */
    graphqldata: '/restapi/soa2/26187/graphql',
    getWeComBanner: '/restapi/soa2/26187/getWeComBanner',
    getswitchlist: '/restapi/soa2/26187/getswitch',
    getFlowActivities: '/restapi/soa2/26187/getFlowActivities',
    notifyTaskCompleted: '/restapi/soa2/26187/notifyTaskCompleted',
    reqGroupArticle: '/restapi/soa2/26187/getHotelGroupArticle',
    newnearbyfacilities: '/restapi/soa2/26187/getNearbyFacilities',

    /* 11754: {AppID: 100003680, Description: 众包Service} */
    caswechat: '/restapi/soa2/11754/caswechat.json',

    /* 20215: {AppID: 100022811, Description: 众包Service} */
    gethotelorderdetail: '/restapi/soa2/20215/gethotelorderdetail',

    /* 13447: {AppID: 100009049, Description: 获取openid --- 公共服务 } */
    getMKTOpenID: '/restapi/soa2/13447/getMKTOpenID.json',

    /* 14160: {AppID: 100012416, Description: 小程序SOA接口} */
    wechatsms: '/restapi/soa2/14160/weChatSms',
    wechatsmsv2: '/restapi/soa2/14160/wechatSmsV2',
    postMsgFormIds: '/restapi/soa2/14160/postMsgFormIds',
    wechatRedEnvelope: '/restapi/soa2/14160/getWechatRedEnvelope',
    getwechaturlNew: '/restapi/soa2/24812/getWechatUrl',
    getfaceexplain: '/restapi/soa2/14160/getFaceExplain',
    postfaceformid: '/restapi/soa2/14160/postFaceFormID',
    getqmjcoupon: '/restapi/soa2/14160/getQMJCoupon',
    getbeijingtime: '/restapi/soa2/14160/getBeijingTime',
    getscreen: '/restapi/soa2/14160/getScreen',
    postchongformid: '/restapi/soa2/14160/postChongFormID',
    postcupformid: '/restapi/soa2/14160/postCupFormId',
    getchongscenes: '/restapi/soa2/14160/getChongScenes',
    postuserinfo: '/restapi/soa2/14160/postUserInfo',
    getrank: '/restapi/soa2/14160/getRank',
    postmapping: '/restapi/soa2/14160/postMapping',
    postscore: '/restapi/soa2/14160/postScore',
    orderquestion: '/restapi/soa2/14160/orderquestion',
    dragonboatamount: '/restapi/soa2/14160/dragonBoatAmount',
    circleoffriendsad: '/restapi/soa2/14160/getCircleOfFriendsAd',
    h5switchresult: '/restapi/soa2/14160/getH5SwitchResult',
    swiperbanner: '/restapi/soa2/14160/swiperBannerForDetail',
    swiperBannerForOrder: '/restapi/soa2/14160/swiperBannerForOrder',
    postEncourage: '/restapi/soa2/14160/postEncourage',
    uploadUserInfo: '/restapi/soa2/14160/uploadUserInfo',
    couponHelpInfo: '/restapi/soa2/14160/encourageRank',
    postMidAutumnBarrage: '/restapi/soa2/14160/postMidAutumnBarrage',
    getMidAutumnBarrage: '/restapi/soa2/14160/getMidAutumnBarrage',
    uploadMidAutumnBarrageUserInfo: '/restapi/soa2/14160/uploadMidAutumnBarrageUserInfo',
    postUniversityUser: '/restapi/soa2/14160/postUniversityUser',
    getUniversityTermDetail: '/restapi/soa2/14160/getUniversityTermDetail',
    getUniversityLastInfo: '/restapi/soa2/14160/getUniversityLastInfo',
    postUniversityAnswer: '/restapi/soa2/14160/postUniversityAnswer',
    getactivitydetaildata: '/restapi/soa2/14160/getActivityDetailData',
    postactivitydata: '/restapi/soa2/14160/postActivityData',
    eventsForIndex: '/restapi/soa2/14160/hongbaoBannerForIndex',
    getDescription: '/restapi/soa2/14160/getdescriptions',
    postcutpriceformid: '/restapi/soa2/14160/postCutPriceFormId',
    getUserPointInfo: '/restapi/soa2/14160/getUserPointInfo',
    getUserPointList: '/restapi/soa2/14160/getUserPointList',
    getDailyTaskList: '/restapi/soa2/14160/getDailyTaskList',
    getMemberPointRewards: '/restapi/soa2/14160/getMemberPointRewards',
    recieveTask: '/restapi/soa2/14160/recieveTask',
    getUserTaskList: '/restapi/soa2/14160/getUserTaskList',
    updateBrowseHotelUserTask: '/restapi/soa2/14160/updateBrowseHotelUserTask',
    recievePoint: '/restapi/soa2/14160/recievePoint',
    answerQuestion: '/restapi/soa2/14160/answerQuestion',
    clickSharedHotel: '/restapi/soa2/14160/clickSharedHotel',
    getHomeInfo: '/restapi/soa2/14160/cuthomeinfo',
    getCutList: '/restapi/soa2/14160/querycutlist',
    cutPrice: '/restapi/soa2/14160/cutprice',
    createCut: '/restapi/soa2/14160/createcutpriceaction',
    queryTop10: '/restapi/soa2/14160/avatarimages',
    createclientid: '/restapi/soa2/10290/createclientid',
    getSwitch: '/restapi/soa2/14160/getH5SwitchResult',
    cutFakePrice: '/restapi/soa2/14160/cutfakeprice',
    commonTypes: '/restapi/soa2/14160/commonTypes',
    wifiCoupon: '/restapi/soa2/14160/wificoupon',
    getUserSignInInfo: '/restapi/soa2/14160/getUserSignInInfo',
    signInWechatPoint: '/restapi/soa2/14160/signInWechatPoint',
    getUserLotteryInfo: '/restapi/soa2/14160/getUserLotteryInfo',
    playLottery: '/restapi/soa2/14160/playLottery',
    shareLottery: '/restapi/soa2/14160/shareLottery',
    zlGetEvent: '/restapi/soa2/14160/zlGetEvent',
    zlRaiseEvent: '/restapi/soa2/14160/zlRaiseEvent',
    zlGetReward: '/restapi/soa2/14160/zlGetReward',
    zlSaveFormID: '/restapi/soa2/14160/zlSaveFormID',
    zlGetSlideUsers: '/restapi/soa2/14160/zlGetSlideUsers',
    zlSaveUserInfo: '/restapi/soa2/14160/zlSaveUserInfo',
    zlHelpEvent: '/restapi/soa2/14160/zlHelpEvent',
    zlSaveRezen: '/restapi/soa2/14160/zlSaveRezen',
    SmzGetModuleListV3: '/restapi/soa2/14160/SmzGetModuleListV3',
    wechatsearchreward: '/restapi/soa2/14160/wechatSearchReward',
    putinvoiceinfo: '/restapi/soa2/14160/PutInvoiceInfo',
    invoicecoupon: '/restapi/soa2/14160/invoiceCoupon',
    invoiceFakeCoupon: '/restapi/soa2/14160/invoiceFakeCoupon',
    receiveRights: '/restapi/soa2/14160/receiveRights',
    getMacaoPopUpInfo: '/restapi/soa2/14160/getMacaoPopUpInfo',
    smzGetUnionVipEntity: '/restapi/soa2/14160/smzGetUnionVipEntity',

    /* 12860: {AppID: 100007068, Description: 酒店H5api服务} */
    hourRoomHotelDetailInf: '/restapi/soa2/12860/gethoteldetail',
    hourRoomSalesRoomList: '/restapi/soa2/12860/getSalesRoomList',
    hourRoomHotelList: '/restapi/soa2/12860/getHourRoomHotelList',

    /* 14605: {AppID: 100014036, Description: H5 Java API接口} */
    timezone: '/restapi/soa2/14605/timezone',
    newhotellist: '/restapi/soa2/14605/getHotelList',
    gethoteldetaillite: '/restapi/soa2/14605/gethoteldetaillite',
    gethotelcompensate: '/restapi/soa2/14605/getHotelCompensate',
    nearbyhotellist: '/restapi/soa2/14605/getNearByHotelList',
    hotelswitch: '/restapi/soa2/14605/getswitch',
    hotelhotevent: '/restapi/soa2/14605/getHotelHotEvent',
    newhotlandmark: '/restapi/soa2/14605/getHotelHotLandmark',
    newbookcheckpost: '/restapi/soa2/14605/bookcheck',
    neworderpost: '/restapi/soa2/14605/ordercreate',
    newordersubmit: '/restapi/soa2/14605/ordersubmit',
    wechatScoreOpened: '/restapi/soa2/14605/wechatScoreOpened',
    getmemberinfo: '/restapi/soa2/14605/getmemberinfo',
    gethotelpics: '/restapi/soa2/14605/getHotelPictures',
    gethoteldetail: '/restapi/soa2/14605/gethoteldetail',
    gethoteladditioninfo: '/restapi/soa2/14605/gethoteladditioninfo',
    getroomlist: '/restapi/soa2/14605/getroomlist',
    getSessionKey: '/restapi/soa2/14605/getSessionKey',
    gethotelstore: '/restapi/soa2/14605/getHotelStore',
    getorderdetail: '/restapi/soa2/14605/getorderdetail',
    npssubmit: '/restapi/soa2/14605/npssubmit',
    newordercancel: '/restapi/soa2/14605/ordercancel',
    newpayget: '/restapi/soa2/14605/payget',
    uploadimage: '/restapi/soa2/14605/uploadimage?format=file',
    uploadbase64image: '/restapi/soa2/14605/uploadimage',
    submitcomment: '/restapi/soa2/14605/submitcomment',
    gethotelcomment: '/restapi/soa2/14605/gethotelcomment',
    getdestination: '/restapi/soa2/14605/getdestination',

    nearbyfacilityinfo: '/restapi/soa2/14605/nearbyfacilityinfo',
    pyramidclickevent: '/restapi/soa2/14605/pyramidclickevent',
    cutpricehotel: '/restapi/soa2/14605/cutpricehotel',
    cityPriceRange: '/restapi/soa2/14605/getCityPriceRange',
    cityPriceRangeV2: '/restapi/soa2/14605/getCityPriceRangeV2',
    homestayinfo: '/restapi/soa2/14605/gethotelinfo',
    operatorfavHotel: '/restapi/soa2/14605/operatefavHotel',
    hotelfavlist: '/restapi/soa2/14605/myHotelFavList',
    hotelbrowselist: '/restapi/soa2/14605/myHotelHistoryList',
    modifyordercontactinfo: '/restapi/soa2/14605/modifyordercontactinfo',
    orderaddinvoice: '/restapi/soa2/14605/orderaddinvoice',
    cityList: '/restapi/soa2/14605/cityList',
    hourRoomCommonFilters: '/restapi/soa2/14605/getHotelCommonFilters',
    getHolidays: '/restapi/soa2/14605/getHolidays',
    mgmordercreate: '/restapi/soa2/14605/mgmordercreate',
    receivecoupon: '/restapi/soa2/14605/receivecoupon',
    receivemutilcoupon: '/restapi/soa2/14605/batchreceivecoupon',
    getorderstatus: '/restapi/soa2/14605/getorderstatus',
    getEmergencyInfo: '/restapi/soa2/14605/getEmergencyInfo',
    newguestgift: '/restapi/soa2/14605/newguestgift',
    casverify: '/restapi/soa2/14605/casverify',
    couponlist: '/restapi/soa2/14605/couponListV2',

    /* other services */
    lbslocatecity: '/restapi/soa2/10398/json/LBSLocateCity',
    wechatbargaindetail: '/restapi/soa2/18119/weChatBargainDetail',
    addtoken: '/restapi/soa2/13500/addtoken',
    // 市场助力活动领券
    assistactivity: '/restapi/soa2/18083/getAssistActivityList',

    /* 22820: {AppID: 100033687, Description: 一起选酒店(活动相关服务)} */
    updateSharingList: '/restapi/soa2/22820/updateSharingList',
    updateUser: '/restapi/soa2/22820/updateUser',

    /* 23150 企微福利官活动接口 领取任务、上报酒店信息 */
    registerActivity: '/restapi/soa2/23150/registerActivity',
    recordUserAction: '/restapi/soa2/23150/recordUserAction',

    /* 14606 常旅相关 */
    savepassengernames: '/restapi/soa2/14606/batchSave'
};

export default {
    serveUrl: function (urlName) {
        const urlPath = baseurl[urlName];
        if (!urlName || !urlPath) {
            return null;
        }

        if (!isTest && !isBastion) {
            return urlPath;
        }

        const isNet = _.find(netServiceList, s => urlPath.indexOf(s) > -1);
        const subEnv = isTest ? '?subEnv=' + fatEnv : (isNet ? '?isBastionRequest=true' : '?isCtripCanaryReq=1');
        // 反爬服务没有测试环境，直接返回生产环境绝对地址
        if (urlPath.indexOf('11754') > -1) {
            return 'https://m.ctrip.com' + urlPath;
        } else {
            return baseurl[urlName] + subEnv;
        }
    }
};
