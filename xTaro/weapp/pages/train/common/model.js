import { cwx, __global } from "../../../cwx/cwx"
import ubt_wx from "../../../cwx/cpage/ubt_wx"
import util from "./util"
import { WXVersion } from "./WXVersion"
import { shared } from "./trainConfig"
const baseUrl = "/restapi/soa2/"

console.log(__global.env)
const ctripServiceCodes = {
    //200503 http://gov.soa.fx.ctripcorp.com/doc/schema/10064?version=1#tab-CheckHealth
    _10064: "10064",
    //200402
    _10103: "10103",
    //100009363
    _13534: "13534",
    //100011239
    _17076: "17076",
    // 100002504
    _11373: "11373",
    // 100014097
    _14666: "14666",
    // 100014292
    _14674: "14674",
    _13242: "13242",
    _14681: "14681"
}

export const modelList = {
    GetUserTag: {
        channel: "14703",
        path: "GetUserTag"
    },
    orderPointPayNotify: {
        channel: "14681",
        path:"OrderPointPayNotify"
    },
    trainnotice: {
        channel: "14666",
        path: "GetNoticeInfo",
    },
    trainstation: {
        channel: "18213",
        path: "GetTrainStationV3",
    },
    traininfo: {
        channel: "14666",
        path: "GetBookingByTrainNameV3",
    },
    trainlist: {
        channel: "14666",
        path: "GetBookingByStationV3",
    },
    transfertrainlist: {
        channel: "14666",
        path: "TrainTransferListSearch",
    },
    trainInsertTransferRouteRecommend: {
        channel: "17076",
        path: "trainInsertTransferRouteRecommend"
    },
    trainticketdetail: {
        channel: "14666",
        path: "TrainTicketDetailSearchV4",
    },
    couponlist: {
        channel: "17076",
        path: "GetCouponListByOut",
    },
    trainstop: {
        channel: "14666",
        path: "GetTrainStopListV3",
    },
    configinfo: {
        channel: "19436",
        path: "GetConfigInfo",
    },
    xproduct: {
        channel: "14666",
        path: "GetTrainXProductDesc",
    },
    preholdseat: {
        channel: "14681",
        path: "GetPreHoldSeatResult",
    },
    orderdetail: {
        channel: "18212",
        path: "TrainOrderDetailSearchV3Out",
    },
    ordercancel: {
        channel: "14681",
        path: "OrderCancel",
    },
    refundticket: {
        channel: "14681",
        path: "RefundTicket",
    },
    location: {
        channel: "10398",
        path: "LBSLocateCity",
    },
    check12306: {
        channel: "13534",
        path: "CheckUserAccountStatusResultV2",
    },
    login12306: {
        channel: "13534",
        path: "CheckUserAccountV2",
    },
    sharegrab: {
        channel: "13534",
        path: "GrabTicketSharedLoad",
    },
    robTicketShareInfo: {
        // pro_grabTicketFlowShared
        channel: "13534",
        path: "GrabTicketFlowShared",
    },
    grabTicketSharedAcce: {
        channel: "13534",
        path: "GrabTicketSharedAcce",
    },
    addRescheduleOrderOut: {
        channel: "14681",
        path: "AddReScheduleOrderOut",
    },
    TrainPreEleCounterTicketArtificialReturn:{
        channel: "14681",
        path: "TrainPreEleCounterTicketArtificialReturn",
    },
    TrainPreEleCounterTicketArtificialReschedule:{
        channel: "14681",
        path: "TrainPreEleCounterTicketArtificialReschedule",
    },
    GetAcceleratePackageListInfo: {
        channel: ctripServiceCodes._13534,
        path: "GetAcceleratePackageListInfo",
    },
    CalculateAcceleratePackage: {
        channel: "13534",
        // pro_calculateAcceleratePackage
        path: "CalculateAcceleratePackage",
    },
    TrainGetPassengerList: {
        channel: "13534",
        path: "TrainGetPassengerList",
    },
    TrainModifyPassenger: {
        channel: "13534",
        path: "TrainModifyPassenger",
    },
    GetShareImg: {
        channel: "17076",
        path: "GetShareImg",
    },
    getJLSuccessRate: {
        channel: "14666",
        path: "grabSuccessRate",
    },
    grabTicketRecommendTrainList: {
        channel: "14674",
        path: "GrabTicketRecommendTrainList",
    },
    acquireActivityCoupon: {
        channel: "17076",
        path: "acquireActivityCoupon",
    },
    TrainChangeGrabTicketDetailOuter: {
        // channel: '10103',
        channel: "14666",
        path: "TrainChangeGrabTicketDetailOuter",
    },
    TrainGrabTicketChangeAcceptInfoV2Outer: {
        // channel: '10064',
        channel: "14681",
        path: "TrainGrabTicketChangeAcceptInfoV2Outer",
    },
    GetGrabTicketSucRateInfo: {
        channel: "14666",
        path: "GetGrabTicketSucRateInfo",
    },
    CrossStationGrabTicket: {
        channel: "14674",
        // channel: '14666',
        path: "CrossStationGrabTicket",
    },
    GetPaySign: {
        channel: "14666",
        path: "GetPaySign",
    },
    // action=GetCancelOrderRecommendInfo
    GetCancelOrderRecommendInfo: {
        channel: ctripServiceCodes._10064,
        path: "GetCancelOrderRecommendInfo",
    },
    // action=getOnTrainThenByTicketSolu
    getOnTrainThenByTicketSolu: {
        channel: ctripServiceCodes._17076,
        path: "getOnTrainThenByTicketSolu",
    },
    trainGrabForecastInfo: {
        channel: ctripServiceCodes._14674,
        path: "trainGrabForecastInfo",
    },
    ctripNewGuestStep: {
        channel: ctripServiceCodes._14666,
        path: "ctripNewGuestStep",
    },
    GrabTicketApproachRecommend: {
        // action=grabTicketApproachRecommend
        // userid =
        channel: ctripServiceCodes._14666,
        path: "GrabTicketApproachRecommend",
    },
    GetFriendsHelpTaskList: {
        channel: ctripServiceCodes._14666,
        path: 'GetFriendsHelpTaskList',
    },
    CheckIsOpenSuperMember: {
        channel: "19436",
        path: "checkIsOpenSuperMember",
    },
    getOrderHBInfo: {
        channel: "14681",
        path: "getOrderHBInfo",
    },
    getHBPeakPeriodStrategy: {
        channel: "14674",
        path: "HBPeakPeriodStrategy",
    },
    TrainCheckCouponStatus: {
        channel: "17076",
        path: "TrainCheckCouponStatus",
    },
    getPrePayInfoForH5: {
        channel: "14681",
        path: "GetPrePayInfoV2",
    },
    PrePayActionOut: {
        channel: "14681",
        path: "PrePayActionOut",
    },
    checkPrePayOut: {
        channel: "14681",
        path: "checkPrePayOut",
    },
    GetActivityCouponInfo: {
        channel: "17076",
        path: "GetActivityCouponInfo",
    },
    ActivitySendCoupon: {
        channel: "17076",
        path: "ActivitySendCoupon",
    },
    CheckIsCanGiftPackageForWx: {
        channel: "17076",
        path: "CheckIsCanGiftPackageForWx",
    },
    TrainGiftPackageForWx: {
        channel:  '17076',
        path: 'TrainGiftPackageForWx',
    },
    TrainOrderProductDetail: {
        channel: "14666",
        path: "TrainOrderProductDetail",
    },
    TrainChangeOrderOuter: {
        channel: "14681",
        path: "TrainChangeOrderOuter",
    },
    GetGrabOrderAcceleratedTaskList: {
        channel: "14666",
        path: "GetGrabOrderAcceleratedTaskList",
    },
    GrabAccelerateTask: {
        channel: "14681",
        path: "GrabAccelerateTask",
    },
    GrabTicketFlowShared: {
        channel: "13534",
        path: "GrabTicketFlowShared",
    },
    InsertActionLog: {
        channel: "14156",
        path: "insertActionLogV1",
    },
    GetRealNamePacket: {
        channel: "14523",
        path: "sendPacket",
    },
    GetBindAccountInfo: {
        channel: "14666",
        path: "GetBindAccountInfo",
    },
    TrainGetGrabNewAccelerateFriendList: {
        channel: "17703",
        path: "TrainGetGrabNewAccelerateFriendListForWx",
    },
    TrainGetGrabNewAccelerateInfo: {
        channel: "17703",
        path: "TrainGetGrabNewAccelerateInfoForWx",
    },
    GetOrderHBInfoV2: {
        channel: "14681",
        path: "GetOrderHBInfoV2",
    },
    ChatScence: {
        channel: "14681",
        path: "ChatScence",
    },
    GetTicketEntrance: {
        channel: "14666",
        path: "GetTicketEntrance",
    },
    GrabReservedTicketNextStep: {
        channel: "14674",
        // channel: '14666',
        path: "GrabReservedTicketNextStep",
    },
    GrabHBDetail: {
        channel: "14666",
        path: "GrabHBDetail",
    },
    GetRegister12306UserInfo: {
        channel: "13534",
        path: "GetRegister12306UserInfo",
    },
    CheckAccountCanLogOutV2: {
        channel: "14674",
        path: "CheckAccountCanLogOutV2",
    },
    RegisterUserAccountInfoV2: {
        channel: "17703",
        path: "RegisterUserAccountInfoV2",
    },
    GetQConfigContent: {
        channel: "19436",
        path: "GetQConfigContent",
    },
    GetQConfigSwitch: {
        channel: "19436",
        path: "GetQConfigSwitch",
    },
    GetVerifyOrderPayTypeInfo: {
        channel: "14681",
        path: "GetVerifyOrderPayTypeInfo",
    },
    TrainGetStationTipInfo: {
        channel: "14674",
        path: "TrainGetStationTipInfo",
    },
    InnovationWorkCreateOrder: {
        channel: "14703",
        path: "InnovationWorkCreateOrder",
    },
    InnovationWorkCreateOrderV2: {
        channel: "14681",
        path: "InnovationWorkCreateOrder",
    },
    TrainTicketReturnRuleAsyncs: {
        channel: "14681",
        path: "TrainTicketReturnRuleAsyncs",
    },
    GetUserInfoForIndex: {
        channel: "17076",
        path: "GetUserInfoForIndex",
    },
    // GetOrderVerifyInfoAuth: {
    //     channel: "14681",
    //     path: "GetOrderVerifyInfoAuth",
    // },
    TrainGetPaymentRequestIdAuth: {
        channel: "18212",
        path: "TrainGetPaymentRequestIdAuth",
    },
    GetDefaultCouponInfo: {
        channel: "14666",
        path: "GetDefaultCouponInfo",
    },
    PushUserSharePassengerInfo: {
        channel: "13534",
        path: "PushUserSharePassengerInfo",
    },
    GetOrderAllowanceEntranceInfo: {
        channel: "14703",
        path: "GetOrderAllowanceEntranceInfo",
    },
    GrabTicketBookingDetailV2: {
        channel: "18213",
        path: "GrabTicketBookingDetailV2",
    },
    GrabTicketBookingDetailV3: {
        channel: "18213",
        path: "GrabTicketBookingDetailV3",
    },
    SubscribeMessageTemplate: {
        channel: "17076",
        path: "SubscribeMessageTemplate",
    },
    GetChatScenceQuestionList: {
        channel: "14681",
        path: "GetChatScenceQuestionList",
    },
    GetChatScenceAnswer: {
        channel: "14681",
        path: "GetChatScenceAnswer",
    },
    GrabTicketInfoDetail: {
        channel: "18213",
        path: "GrabTicketInfoDetail",
    },
    FreeReceiveVipGrabRightsLandingPageInfo: {
        channel: "13534",
        path: "FreeReceiveVipGrabRightsLandingPageInfo",
    },
    GetActivateAssistedFriendsInfo: {
        channel: "13534",
        path: "GetActivateAssistedFriendsInfo",
    },
    IsCanReceiveNewCustomerRights: {
        channel: "13534",
        path: "IsCanReceiveNewCustomerRights",
    },
    FreeReceiveVipGrabRightsHelp: {
        channel: "13534",
        path: "FreeReceiveVipGrabRightsHelp",
    },
    ReceiveNewCustomerRights: {
        channel: "13534",
        path: "ReceiveNewCustomerRights",
    },
    NewCustomersRightsDetail: {
        channel: "14674",
        path: "NewCustomersRightsDetail",
    },
    UserNewCustomersRightsInfo: {
        channel: "13534",
        path: "UserNewCustomersRightsInfo",
    },
    HomePageReceiveStudentCardProcess: {
        channel: "13534",
        path: "HomePageReceiveStudentCardProcess",
    },
    GetStudentCardDetailInfo: {
        channel: "13534",
        path: "GetUserStudentCardInfo",
    },
    GetFastPayOrderPayTypeInfo: {
        channel: "14703",
        path: "GetFastPayOrderPayTypeInfo",
    },
    StudentCardDetail: {
        channel: "14666",
        path: "StudentCardDetail",
    },
    GetOrderCashBackCouponInfo: {
        channel: "14703",
        path: "GetOrderCashBackCouponInfo",
    },
    ImageCheck: {
        channel: "14674",
        path: "GetTrainImageAuthenticationResult",
    },
    TrainSingleChannelToDoubleChannel: {
        channel: "14681",
        path: "TrainSingleChannelToDoubleChannel",
    },
    TrainFaceAuthenticationRisk: {
        channel: "14666",
        path: "TrainFaceAuthenticationRisk",
    },
    AddOrderAccountInfo: {
        channel: "14703",
        path: "AddOrderAccountInfo",
    },
    CheckFaceSuccessNotify: {
        channel: "14681",
        path: "CheckFaceSuccessNotify",
    },
    TrainExternalRecommendCards: {
        channel: "17076",
        path: "TrainExternalRecommendCards",
    },
    GetLuckyStarListInfo: {
        channel: "14666",
        path: "GetLuckyStarListInfo",
    },
    QuerySubscribeMessageStatus: {
        channel: "17076",
        path: "QuerySubscribeMessageStatus",
    },
    TrainAlternateOrderPreCancel: {
        channel: "14681",
        path: "TrainAlternateOrderPreCancel",
    },
    GetTrainHBInfoDetail: {
        channel: "14681",
        path: "GetTrainHBInfoDetail",
    },
    bindUidAndUnionid: {
        channel: "17076",
        path: "BindUidAndUnionid",
    },
    getUserIdByUnionid: {
        channel: "17076",
        path: "getUserIdByUnionid",
    },
    GetAppXPageTopCardInfo: {
        channel: "14666",
        path: "GetAppXPageTopCardInfo",
    },
    TrainOrderRecommendUseCar: {
        channel: "17076",
        path: "TrainOrderRecommendUseCar",
    },
    GetIntelligentAuthorizeAlertInfo: {
        channel: "14681",
        path: "GetIntelligentAuthorizeAlertInfo",
    },
    IntelligentAuthorizeOperate: {
        channel: "14681",
        path: "intelligentAuthorizeOperate",
    },
    trainGetWXUserStateByUID: {
        channel: '14674',
        // path: 'isFollowPublicAccount'
        path: 'trainGetWXUserStateByUID',

    },
    GetUserRealAuthenticationInfo: {
        channel: '13534',
        path: 'GetUserRealAuthenticationInfo',
    },
    getFollowPublicAccountInfo:{
        channel: '14674',
        path: 'getFollowPublicAccountInfo',
    },
    TrainGrabFastBuyTicketDetail:{
        channel: '14666',
        path: 'TrainGrabFastBuyTicketDetail'
    },
    TrainGrabFastCreateOrder:{
        channel: '14681',
        path: 'TrainGrabFastCreateOrder'
    },
    ReceiveXgwhPackage: {
        channel: "13534",
        path: 'ReceiveXgwhPackage'
    },
    GetXgwhPackageInfo: {
        channel: "13534",
        path: "GetXgwhPackageInfo"
    },
    // 效果外化对接权益平台
    SendUserScenesMarketingInfo: {
        channel: '17076',
        path: 'SendUserScenesMarketingInfo'
    },
    GetUserScenesMarketingInfo: {
        channel: '17076',
        path: 'GetUserScenesMarketingInfo'
    },
    RecallPackageDetail: {
        channel: "13534",
        path: "RecallPackageDetail"
    },
    GetUserAccountInfo: {
        channel: "13534",
        path: "GetUserAccountInfo",
    },
    GetEncodeTicketSharingParamModel:{
        channel: "17679",
        path: "GetEncodeTicketSharingParam"
    },
    GetRightsPerceiveInfo: {
        channel: "14681",
        path: "GetRightsPerceiveInfo"
    },
    ApplyProductClaim: {
        channel: "14681",
        path: "ApplyProductClaim"
    },
    GetClaimPriceList: {
        channel: "14703",
        path: "GetClaimPriceList"
    },
    GetAccountMobilePhone: {
        channel: "17703",
        path: "GetAccountMobilePhone"
    },
    JoinGroupEntrance: {
        channel: "14703",
        path: "JoinGroupEntrance"
    },
    TrainGetNewGuestInfo: {
        channel: "17076",
        path: "TrainGetNewGuestInfo"
    },
    recordErrorLog: {
        channel: "23619",
        path: "recordErrorLog"
    },
    HomePageSecondScreenRecommend: {
        channel: "17076",
        path: "HomePageSecondScreenRecommend"
    },
    trainOrderRecommendHotelV2: {
        channel: "17076",
        path: "trainOrderRecommendHotelV2"
    },
    ChangeTicketOrderDetail: {
        channel: "14681",
        path: "ChangeTicketOrderDetail"
    },
    GetDedicatedGrabAisleInfo: {
        channel: '14681',
        path: 'GetDedicatedGrabAisleInfo'
    },
    getConfigByKeys: {
        channel: '23841',
        path: 'getConfigByKeys',
    },
    GetGrabDiagnosisInfo: {
        channel: '14666',
        path: 'GetGrabDiagnosisInfo'
    },
    ProductSaleRecommend: {
        channel: "17076",
        path: 'ProductSaleRecommend'
    },
    GetExternalTaskInfo: {
        channel: '21699',
        path: 'GetExternalTaskInfo'
    },
    ReceiveExternalTaskReward: {
        channel: '21699',
        path: 'ReceiveExternalTaskReward'
    },
    ReceiveExternalTask: {
        channel: '21699',
        path: 'ReceiveExternalTask'
    },
    FriendHelp: {
        channel: '13534',
        path: 'FriendHelp'
    },
    FriendHelpEntrance: {
        channel: '13534',
        path: 'FriendHelpEntrance'
    },
    getStatusOn2021TrainTravelTask: {
        channel: '17679',
        path: 'getStatusOn2021TrainTravelTask'
    },
    launchActivityOn2021TrainTravelTask: {
      channel: '17679',
      path: 'launchActivityOn2021TrainTravelTask'
    },
    GetUserReceiveDetailOfNewUserCoupon: {
      channel: '23619',
      path: 'GetUserReceiveDetailOfNewUserCoupon'
    },
    TrainBookingByTrainNameV7: {
        channel: '14666',
        path: 'TrainBookingByTrainNameV7'
    },
    combineServiceProductDetail: {
        channel: "14681",
        path: 'combineServiceProductDetail'
    },
    GetVendorListInfoV5: {
        channel: '14666',
        path: 'GetVendorListInfoV5'
    },
    Sync12306OrderInfo: {
      channel: '14703',
      path: 'Sync12306OrderInfo'
    },
    RecommendRescheduleGrabTicket:{
        channel:'17076',
        path: 'RecommendRescheduleGrabTicket'
    },
    ReceiveRedBookActivityReward: {
      channel: '13534',
      path: 'ReceiveRedBookActivityReward'
    },
    GetRedBookActivityInfo: {
      channel: '13534',
      path: 'GetRedBookActivityInfo'
    },
    getUserStatusOnTrainWechatEnterprise: {
      channel: '23619',
      path: 'getUserStatusOnTrainWechatEnterprise'
    },
    qyGetGroupEntryQrCodeWithUid: {
      channel: '13218',
      path: 'qyGetGroupEntryQrCodeWithUid'
    },
    bindUserCommonPageTask: {
      channel: '17679',
      path: 'bindUserCommonPageTask'
    },
    notifyStartUp: {
        channel: '13534',
        path: 'NotifyStartUp'
    },
    getHtmlConfigByKeys: {
      channel: '23841',
      path: 'getHtmlConfigByKeys'
    },
    GetWeChatGroupInfo: {
        channel: '17076',
        path: 'GetWeChatGroupInfo'
    },
    GetStationInfoV2: {
        channel: '19436',
        path: 'GetStationInfoV2'
    },
    GetTrainCrossTaskDetailFront: {
        channel: '21699',
        path: 'GetTrainCrossTaskDetailFront'
    },
    handleChildTicket: {
        channel: '14681',
        path: 'handleChildTicket'
    },
    getTrainSuperPowerUnlockInfoByOrderId: {
        channel: '23619',
        path: 'getTrainSuperPowerUnlockInfoByOrderId'
    },
    ReceiveHotelTask: {
        channel: '14681',
        path: 'ReceiveHotelTask'
    },
    SharedCallBack: {
        channel: '14674',
        path: 'SharedCallBack'
    },
    GetDirectListTopQuick: {
        channel: '14674',
        path: 'GetDirectListTopQuickSieve'
    },
    TrainGetSearchCondition: {
        channel: '14666',
        path:'TrainGetSearchConditionForApp'
    },
    GetLossGiftDetail: {
        channel: '13534',
        path:'GetLossGiftDetail'
    },
    ReceiveLossGift: {
        channel: '13534',
        path:'ReceiveLossGift'
    },
    promotionSendCouponInfo: {
        channel: '14674',
        path: 'PromotionSendCouponInfo'
    },
    GetActivityStautsInfo: {
        channel: '17703',
        path: 'GetActivityStautsInfo',
    },
    GetActivityStautsInfoV2: {
        channel: '17703',
        path: 'GetActivityStautsInfoV2',
    },
    GetHotLocation: {
        channel: '19799',
        path: 'getHotLocation'
    },
    getUserCouponByProductType: {
        channel: '17132',
        path: 'getUserCouponByProductType'
    },
    getBlindBoxCity: {
        channel: '14703',
        path: 'getBlindBoxCity',
    },
    GetGrabTicketAlertInfo: {
        channel: '13534',
        path: 'GetGrabTicketAlertInfo'
    },
    CitySearchInner: {
        channel: '19799',
        path: 'citySearchInner'
    },
    GetPTPPassengerAgeRangeInfo: {
        channel: '19799',
        path: 'getPTPPassengerAgeRangeInfo'
    },
    getAbordTrainOrderList: {
        channel: '17417',
        path: 'orderList'
    },
    
    OnlineChangeSeatPromotionInfo: {
        channel: '14703',
        path: 'OnlineChangeSeatPromotionInfo'
    }
}


function request(url, data, method, suc, err, done) {
    // head中添加extension中添加 platform 系统类型
    const systemInfo = cwx.util.systemInfo || {}
    const platform = systemInfo.platform || ""
    const deviceName = systemInfo.model
    const cityName = util.getCurrentCity() || ''
    const requestChannel = shared && shared.requestChannel || ""
    const clientInfo = `${platform} | ${deviceName} | ${cityName}`
    const isCanary = wx.getStorageSync("_globalEnvSetting") == "canary"
    const enableProxyMock = wx.getStorageSync("_enableProxyMock") === "1"
    let c_point = cwx.locate.getCachedGeoPoint()

    let extensions = { head: {
        extension: [
            {"name": "xtrainwxplatform", "value": platform},
            {"name": "xtrainwxversion", "value": WXVersion},
            {"name": "xtrainminiappchannel", "value": requestChannel},
            {"name": "xtrainclientInfo", "value": clientInfo},
            {"name": "xtrainwxcityname", "value": cityName},
            {"name": "xtrainwxlatitude", "value": c_point && String(c_point.latitude) || "0"},
            {"name": "xtrainwxlongitude", "value":  c_point && String(c_point.longitude) || "0"},
            {"name": "clientInfo", "value": clientInfo},
        ],
    } }
    Object.assign(data, extensions)

    const requestId = +new Date()
    const header = isCanary ? { "x-ctrip-canary-req": "1" } : {}

    if (enableProxyMock) {
        const ubtState = ubt_wx.getState()
        header.sessionid = `${ubtState?.vid}-${ubtState?.sid}`
        cwx.request({
            url: url.replace('/restapi', '/ztmockprod/restapi'),
            data,
            method,
            header,
            success(res) {
                if (res.statusCode >= 400){
                    return err && err(res)
                }
                suc(res.data)
            },
            fail(res) {
                err && err(res)
            },
            complete() {
                done && done()
            },
        })
        return
    }

    cwx.request({
        url,
        data,
        method,
        header,
        success(res) {
            if (res.statusCode >= 400){
                return err && err(res)
            }
            suc(res.data)
        },
        fail(res) {
            err && err(res)
        },
        complete() {
            done && done()
        },
    })
}

export function createModel({ channel, path }, flag) {

    let url = baseUrl + channel + (flag ? '/' : '/json/') + path
    let cb = () => { }


    return function (data, suc, err, done = cb) {
        request(url, data, undefined, suc, err, done)
    }
}

// 列车详情
export let TrainInfoModel = function(params, _suc, _err, _done = ()=>{}) {
    const url = baseUrl + modelList.traininfo.channel + '/' + modelList.traininfo.path
    const suc = (res) => {
        let tInfo = res.ResponseBody

        if (!tInfo) {
            return _err(res)
        }
        tInfo.SeatList = tInfo.SeatItemInfoList
        tInfo.RunTime = tInfo.UseTime
        tInfo.DepartStation = tInfo.DepartureStationName
        tInfo.ArriveStation = tInfo.ArrivalStationName
        tInfo.DepartTime = tInfo.DepartureTime
        tInfo.ArriveTime = tInfo.ArrivalTime
        for (let i = 0, len = tInfo.SeatList.length; i < len; i++) {
            let val = tInfo.SeatList[i]
            val.SeatInventory = val.Inventory
            val.SeatBookable = val.Bookable
            val.SeatName = val.SeatTypeName
            val.SeatPrice = val.Price
        }
        let hResult = util.handleTrains([tInfo], params.DepartDate)
        _suc(hResult[0])
    }
    request(url, params, undefined, suc, _err, _done)
}

// 推荐车次接口
export let GrabTicketRecommendTrainListModel = function(params, _suc, _err, _done = ()=>{}) {
    const {channel, path} = modelList.grabTicketRecommendTrainList
    const url = baseUrl + channel + '/' + path
    const suc = (data) => {
        function parsetDate(str) {
            let regtime = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/i
            if (str.match(regtime)) {
                str = str.replace(regtime, "$2/$3/$1 $4:$5:$6")
            }

            return new Date(str)
        }
        function getRunTimeAndTimesCost(startTime, endTime) {
            const startDate = parsetDate(startTime)
            const endDate = parsetDate(endTime)
            const costTime = (endDate.getTime() - startDate.getTime()) / 1000
            const hour = parseInt(costTime / 3600)
            const minute = parseInt((costTime - hour * 3600) / 60)

            return {
                TimesCost: hour ? `${hour}时${minute}分` : `${minute}分`,
                RunTime: hour * 60 + minute,
            }
        }
        const { RecommendListBySuccessRate, RecommendTrainList } = data
        let recommendListBySuccessRateAfterConvert,RecommendTrainListAfterConvert
        if (RecommendListBySuccessRate) {
            recommendListBySuccessRateAfterConvert = RecommendListBySuccessRate.map(train => ({
                ...train,
                DepartStation: train.DepStation,
                ArriveStation: train.ArrStation,
                DepartTimeStamp: +parsetDate(train.DepTime),
                DepartTime: `${train.DepTime[8]}${train.DepTime[9]}:${train.DepTime[10]}${train.DepTime[11]}`,
                ArriveTime: `${train.ArrTime[8]}${train.ArrTime[9]}:${train.ArrTime[10]}${train.ArrTime[11]}`,
                Tag:train.Tag,
                // TrainType: getTrainType(train.TrainNumber),
                // TimePeriod: getPeriod(train.DepTime),
                // TimesCost: costTimes(train.DepTime, train.ArrTime),
                ...getRunTimeAndTimesCost(train.DepTime, train.ArrTime),
            }))
        }

        if (RecommendTrainList) {
            RecommendTrainListAfterConvert = RecommendTrainList.map(train => ({
                ...train,
                DepartStation: train.DepStation,
                ArriveStation: train.ArrStation,
                DepartTimeStamp: +parsetDate(train.DepTime),
                DepartTime: `${train.DepTime[8]}${train.DepTime[9]}:${train.DepTime[10]}${train.DepTime[11]}`,
                ArriveTime: `${train.ArrTime[8]}${train.ArrTime[9]}:${train.ArrTime[10]}${train.ArrTime[11]}`,
                // TrainType: getTrainType(train.TrainNumber),
                // TimePeriod: getPeriod(train.DepTime),
                // TimesCost: costTimes(train.DepTime, train.ArrTime),
                ...getRunTimeAndTimesCost(train.DepTime, train.ArrTime),
            }))
        }

        const _res = {
            ...data,
            RecommendListBySuccessRate: recommendListBySuccessRateAfterConvert,
            RecommendTrainList: RecommendTrainListAfterConvert,
        }
        _suc(_res)
    }
    request(url, params, undefined, suc, _err, _done)
}

// 火车票公告
export let TrainNoticeModel = createModel(modelList.trainnotice)

// 车站列表
export let TrainStationModel = createModel(modelList.trainstation)

// 车次列表
export let TrainListModel = createModel(modelList.trainlist)

// 套餐、抢票时效
export let TrainTicketDetailModel = createModel(modelList.trainticketdetail)

// 优惠券列表
export let CouponListModel = createModel(modelList.couponlist)

// 经停车站信息
export let TrainStopModel = createModel(modelList.trainstop)

// 后台配置信息
export let ConfigInfoModel = createModel(modelList.configinfo)

// 前置扣位结果
export let PreHoldSeatResultModel = createModel(modelList.preholdseat)

// 订单详情
export let OrderDetailModel = createModel(modelList.orderdetail)

// 取消订单
export let OrderCancelModel = createModel(modelList.ordercancel)

// 退票
export let RefundTicketModel = createModel(modelList.refundticket)

// LBS 服务
export let LBSModel = createModel(modelList.location)

// 12306登录
export let Login12306Model = createModel(modelList.login12306)

// 检测12306登录情况
export let Check12306Model = createModel(modelList.check12306)

// 改签车票
export let AddReScheduleOrderOutModel = createModel(modelList.addRescheduleOrderOut)

// refund前置提示
export let TrainPreEleCounterTicketArtificialReturnModel = createModel(modelList.TrainPreEleCounterTicketArtificialReturn)

// 改签前置接口
export let TrainPreEleCounterTicketArtificialReschedule  = createModel(modelList.TrainPreEleCounterTicketArtificialReschedule)

// 加密分享行程信息
export let GetEncodeTicketSharingParamModel = createModel(modelList.GetEncodeTicketSharingParamModel)

// 常旅列表
export let TrainGetPassengerListModel = createModel(modelList.TrainGetPassengerList, true)

// 保存常旅
export let TrainModifyPassengerModel = createModel(modelList.TrainModifyPassenger, true)


// 获取助力包列表
export let GetAcceleratePackageListInfoModel = createModel(modelList.GetAcceleratePackageListInfo)

// 分享抢票订单
export let ShareGrabModel = createModel(modelList.sharegrab)

//获取分享信息
export let RobTicketShareInfoModel = createModel(modelList.robTicketShareInfo)

// 帮好友助力
export let AccelerateGrabTicketRateModel = createModel(modelList.grabTicketSharedAcce)

// 计算助力包 http://conf.ctripcorp.com/pages/viewpage.action?pageId=149350332
export let CalculateAcceleratePackageModel = createModel(modelList.CalculateAcceleratePackage)

// 生成分享海报
export let GetShareImgModel = createModel(modelList.GetShareImg)

// 获取捡漏成功率
export let GetJLSuccessRateModel = createModel(modelList.getJLSuccessRate)

// 领取优惠券接口 http://conf.ctripcorp.com/pages/viewpage.action?pageId=148244767
export let AcquireActivityCouponModel = createModel(modelList.acquireActivityCoupon)

// 改单服务包下发
export let TrainChangeGrabTicketDetailOuterModel = createModel(modelList.TrainChangeGrabTicketDetailOuter)

// 改单服务包下发
export let TrainGrabTicketChangeAcceptInfoV2OuterModel = createModel(modelList.TrainGrabTicketChangeAcceptInfoV2Outer)

// 获取车次列表成功率
export let GetGrabTicketSucRateInfoModel = createModel(modelList.GetGrabTicketSucRateInfo)

// 获取支付 token
export let GetPaySignModel = createModel(modelList.GetPaySign)

// 获取取消抢票推荐信息
export let GetCancelOrderRecommendInfoModel = createModel(modelList.GetCancelOrderRecommendInfo)

// 获取上车补票列表
export let GetOnTrainThenByTicketSoluModel = createModel(modelList.getOnTrainThenByTicketSolu)

// 中转车次列表
export let TransferListModel = createModel(modelList.transfertrainlist)

// 车次列表推荐方案信息接口
export let TrainInsertTransferRouteRecommendModel = createModel(modelList.trainInsertTransferRouteRecommend)

// 前置支付操作接口
export let PrePayActionOutModel = createModel(modelList.PrePayActionOut)

// 前置支付结果检查接口
export let checkPrePayOutModel = createModel(modelList.checkPrePayOut)

// 获取前置支付表单
export let getPrePayInfoForH5Model = createModel(modelList.getPrePayInfoForH5)

// 是否是携程新客
export let ctripNewGuestStepModel = createModel(modelList.ctripNewGuestStep)
// 抢票预测
export let trainGrabForecastInfoModel = createModel(modelList.trainGrabForecastInfo)
// 检查当前用户是否开通超级会员
export let CheckIsOpenSuperMemberModel = createModel(modelList.CheckIsOpenSuperMember)

// 抢票候补信息服务包接口
export let getOrderHBInfoModel = createModel(modelList.getOrderHBInfo)

// 获取候补登录弹窗信息
export let getHBPeakPeriodStrategyModel = createModel(modelList.getHBPeakPeriodStrategy)



// 校验用户是否领取过对应优惠券
export let TrainCheckCouponStatusModel = createModel(modelList.TrainCheckCouponStatus)

// 查询优惠券接口
export let GetActivityCouponInfoModel = createModel(modelList.GetActivityCouponInfo)

// 领取优惠券接口
export let ActivitySendCouponModel = createModel(modelList.ActivitySendCoupon)

// 订单详情页校验是否可以发放助力包
export let CheckIsCanGiftPackageForWxModel = createModel(modelList.CheckIsCanGiftPackageForWx)

// 订单详情页完成分享获取助力包
export let TrainGiftPackageForWxModel = createModel(modelList.TrainGiftPackageForWx)

// 待支付
export let TrainOrderProductDetail = createModel(modelList.TrainOrderProductDetail)

// 待支付订单新增X产品接口（外网）
export let TrainChangeOrderOuter = createModel(modelList.TrainChangeOrderOuter)

// 获取任务列表
export let GetGrabOrderAcceleratedTaskList = createModel(modelList.GetGrabOrderAcceleratedTaskList)

// 完成任务领取助力包接口
export let GrabAccelerateTask = createModel(modelList.GrabAccelerateTask)

// 获取分享信息
export let GrabTicketFlowShared = createModel(modelList.GrabTicketFlowShared)

// 下单日志打点
export let InsertActionLog = createModel(modelList.InsertActionLog)

// 获取用户绑定的12306状态
export let GetBindAccountInfoModel = createModel(modelList.GetBindAccountInfo)

export let TrainGetGrabNewAccelerateFriendListModel = createModel(modelList.TrainGetGrabNewAccelerateFriendList)

export let TrainGetGrabNewAccelerateInfoModel = createModel(modelList.TrainGetGrabNewAccelerateInfo)

// 候补状态信息下发接口
export const GetOrderHBInfoV2Model = createModel(modelList.GetOrderHBInfoV2)

// 新版AI客服
export const ChatScence = createModel(modelList.ChatScence)

// 24小时内获取检票口
export const GetTicketEntranceModel = createModel(modelList.GetTicketEntrance)

// 获取注册12306账号信息接口
export const GetRegister12306UserInfoModel = createModel(modelList.GetRegister12306UserInfo)

// 判断12306账号是否可注销接口
export const CheckAccountCanLogOutV2Model = createModel(modelList.CheckAccountCanLogOutV2)

// 检查用户信息是否可以注册
export const RegisterUserAccountInfoV2Model = createModel(modelList.RegisterUserAccountInfoV2)

// 获取开关
export const GetQConfigContentModel = createModel(modelList.GetQConfigContent)


// 获取开关
export const GetQConfigSwitchModel = createModel(modelList.GetQConfigSwitch)

// 手机未核验转线下购票信息接口
export const GetVerifyOrderPayTypeInfoModel = createModel(modelList.GetVerifyOrderPayTypeInfo)

// 获取列表页公告
export const TrainGetStationTipInfoModel = createModel(modelList.TrainGetStationTipInfo)

export const GetStationInfoV2Model = createModel(modelList.GetStationInfoV2)



// 打赏
export const InnovationWorkCreateOrderModel = createModel(modelList.InnovationWorkCreateOrder)

// 退票金额 规则
export const TrainTicketReturnRuleAsyncsModel = createModel(modelList.TrainTicketReturnRuleAsyncs)

// 首页优惠券信息
export const GetUserInfoForIndexModel = createModel(modelList.GetUserInfoForIndex)

// 获取乘客核验状态
// export const GetOrderVerifyInfoAuthModel = createModel(modelList.GetOrderVerifyInfoAuth)

// 支付新流程获取paytoken
export const TrainGetPaymentRequestIdAuthModel = createModel(modelList.TrainGetPaymentRequestIdAuth)

// 获取默认优惠券
export const GetDefaultCouponInfoModel = createModel(modelList.GetDefaultCouponInfo)

// 代购新增乘客邀请分享获取本人sharekey
export const PushUserSharePassengerInfoModel = createModel(modelList.PushUserSharePassengerInfo)

// 订单详情页获取购票成功返现banner信息
export const GetOrderAllowanceEntranceInfoModel = createModel(modelList.GetOrderAllowanceEntranceInfo)

// 抢票服务包下发v3
export const GrabTicketBookingDetailV3Model = createModel(modelList.GrabTicketBookingDetailV3)

// 订阅消息信息确认接口
export const SubscribeMessageTemplateModel = createModel(modelList.SubscribeMessageTemplate)

// 在线咨询问题列表
export const GetChatScenceQuestionListModel = createModel(modelList.GetChatScenceQuestionList)

// 在线咨询答案
export const GetChatScenceAnswerModel = createModel(modelList.GetChatScenceAnswer)

// 激活vip权益落地信息
export const ActivationLandingPageInfoModel = createModel(modelList.FreeReceiveVipGrabRightsLandingPageInfo)

// 激活vip落地页助力列表
export const GetActivateAssistedFriendsInfoModel = createModel(modelList.GetActivateAssistedFriendsInfo)

// 是否可以领取新客权益
export const IsCanReceiveNewCustomerRightsModel = createModel(modelList.IsCanReceiveNewCustomerRights)

// 学生权益相关信息
export const StudentCardInfoModel = createModel(modelList.HomePageReceiveStudentCardProcess)

// 激活vip助力
export const FreeReceiveVipGrabRightsHelpModel = createModel(modelList.FreeReceiveVipGrabRightsHelp)

// 领取新客权益
export const ReceiveNewCustomerRightsModel = createModel(modelList.ReceiveNewCustomerRights)

// 新客权益服务包
export const NewCustomersRightsDetailModel = createModel(modelList.NewCustomersRightsDetail)

// 新客权益信息
export const UserNewCustomersRightsInfoModel = createModel(modelList.UserNewCustomersRightsInfo)

// 用户学生卡领取信息
export const GetStudentCardDetailInfoModel = createModel(modelList.GetStudentCardDetailInfo)

// 学生卡权益服务包
export const StudentCardDetailModel = createModel(modelList.StudentCardDetail)

// 返现券权益信息
export const GetOrderCashBackCouponInfoModel = createModel(modelList.GetOrderCashBackCouponInfo)

export const InnovationWorkCreateOrderV2Model = createModel(modelList.InnovationWorkCreateOrderV2)

export const GetFastPayOrderPayTypeInfoModel = createModel(modelList.GetFastPayOrderPayTypeInfo)

// 获取刷脸信息
export let ImageCheck = createModel(modelList.ImageCheck)

// 单通道改双通道
export let TrainSingleChannelToDoubleChannelModel = createModel(modelList.TrainSingleChannelToDoubleChannel)

// 扫脸风控
export let TrainFaceAuthenticationRiskModel = createModel(modelList.TrainFaceAuthenticationRisk)

// 向订单添加账号
export let AddOrderAccountInfoModel = createModel(modelList.AddOrderAccountInfo)

// 扫脸回推结果
export let CheckFaceSuccessNotifyModel = createModel(modelList.CheckFaceSuccessNotify)

// 小程序首页交叉宫格
export let TrainExternalRecommendCardsModel = createModel(modelList.TrainExternalRecommendCards)

// 获取福星列表信息
export let GetLuckyStarListInfoModel = createModel(modelList.GetLuckyStarListInfo)

// 查询订阅状态
export let QuerySubscribeMessageStatusModel = createModel(modelList.QuerySubscribeMessageStatus)

// 候补订单前置取消
export let TrainAlternateOrderPreCancelModel = createModel(modelList.TrainAlternateOrderPreCancel)

// 查询候补信息
export let GetTrainHBInfoDetailModel = createModel(modelList.GetTrainHBInfoDetail)

// 绑定uid和unionid
export let bindUidAndUnionidModel = createModel(modelList.bindUidAndUnionid)

export let getUserIdByUnionidModel = createModel(modelList.getUserIdByUnionid)

// 获取订单填写页紧急购票tips
export let GetAppXPageTopCardInfoModel = createModel(modelList.GetAppXPageTopCardInfo)

// 接送站信息
export let TrainOrderRecommendUseCarModel = createModel(modelList.TrainOrderRecommendUseCar)

// 获取是否关注公众号(需要绑定过携程)
export let trainGetWXUserStateByUIDModal = createModel(modelList.trainGetWXUserStateByUID)

// 获取是否关注公众号
export let getFollowPublicAccountInfoModel = createModel(modelList.getFollowPublicAccountInfo)

// 一键获取身份信息
// export let GetRealNamePacketModel = function (data, success, fail) {
//     cwx.request({
//         url: __global.env == 'prd' ?
//             'https://gateway.secure.ctrip.com/restful/soa2/14523/sendPacket' :
//             'https://gateway.secure.fws.qa.nt.ctripcorp.com/restful/soa2/14523/sendPacket',
//         // url: 'https://gateway.secure.fws.qa.nt.ctripcorp.com/restful/soa2/14523/sendPacket',
//         data,
//         success(res) {
//             success(res)
//         },
//         fail(res) {
//             fail(res)
//         },
//     })
// }

// 获取携程实名认证信息
export let GetUserRealAuthenticationInfoModel = createModel(modelList.GetUserRealAuthenticationInfo)
// 获取任意行活动信息
export const GetFriendsHelpTaskListModel = createModel(modelList.GetFriendsHelpTaskList)

// export let  ImageCheckModel = function (data, success, fail) {
//     cwx.request({
//         url: 'https://m.ctrip.com/restapi/soa2/14674/json/GetTrainImageAuthenticationResult',
//         data,
//         success(res) {
//             success(res)
//         },
//         fail(res) {
//             fail(res)
//         }
//     })
// }

export let GetIntelligentAuthorizeAlertInfo = createModel(
    modelList.GetIntelligentAuthorizeAlertInfo,
)

// 操作智能权益状态
export let IntelligentAuthorizeOperate = createModel(
    modelList.IntelligentAuthorizeOperate,
)

// 一键转抢功能前置信息获取
export const TrainGrabFastBuyTicketDetailModel = createModel(
    modelList.TrainGrabFastBuyTicketDetail,
)

// 一键转抢下单接口
export const TrainGrabFastCreateOrderModel = createModel(
    modelList.TrainGrabFastCreateOrder,
)
// 效果外化-领取礼包 (什么鬼名...
export const ReceiveXgwhPackageModel = createModel(modelList.ReceiveXgwhPackage)
// 效果外化-礼包信息
export const GetXgwhPackageInfoModel = createModel(modelList.GetXgwhPackageInfo)
// 效果外化对接权益平台
export const SendUserScenesMarketingInfoModel = createModel(modelList.SendUserScenesMarketingInfo)
export const GetUserScenesMarketingInfoModel = createModel(modelList.GetUserScenesMarketingInfo)
// 召回礼包
export const RecallPackageDetailModel = createModel(modelList.RecallPackageDetail)
// 首页权益感知
export const GetRightsPerceiveInfoModel = createModel(modelList.GetRightsPerceiveInfo)
// 获取关怀金理赔列表
export const ApplyProductClaimModel = createModel(modelList.ApplyProductClaim)
// 申请理赔
export const GetClaimPriceListModel = createModel(modelList.GetClaimPriceList)
// 根据uid获取绑定手机号
export const GetAccountMobilePhoneModel = createModel(modelList.GetAccountMobilePhone)
// 拼团活动入口
export const JoinGroupEntranceModel = createModel(modelList.JoinGroupEntrance)
// 判断用户是否是新客
export const TrainGetNewGuestInfoModel = createModel(modelList.TrainGetNewGuestInfo)
// 上报错误
export const recordErrorLogModel = createModel(modelList.recordErrorLog)
// 订后酒店榜单
export const trainOrderRecommendHotelV2Model = createModel(modelList.trainOrderRecommendHotelV2)
// 首页接送站酒店推荐列表
export const HomePageSecondScreenRecommendModel = createModel(modelList.HomePageSecondScreenRecommend)
// 改签抢详情
export const ChangeTicketOrderDetailModel = createModel(modelList.ChangeTicketOrderDetail)
// 专人抢票产品
export const GetDedicatedGrabAisleInfoModal = createModel(modelList.GetDedicatedGrabAisleInfo)
// 获取前段配置服务
export const getConfigByKeysModel = createModel(modelList.getConfigByKeys)
// 抢票诊断信息
export const getGrabDiagnosisInfoModel = createModel(modelList.GetGrabDiagnosisInfo)
// 立减券产品
export const ProductSaleRecommendModal = createModel(modelList.ProductSaleRecommend)
//  抢票助力浏览任务信息
export const GetExternalTaskInfo = createModel(modelList.GetExternalTaskInfo)
//  抢票助力浏览任务完成
export const ReceiveExternalTaskReward = createModel(modelList.ReceiveExternalTaskReward)
//  抢票助力浏览任务领取
export const ReceiveExternalTask = createModel(modelList.ReceiveExternalTask)
//  抢票助力活动助力接口
export const FriendHelp = createModel(modelList.FriendHelp)
//  抢票助力活动信息
export const FriendHelpEntrance = createModel(modelList.FriendHelpEntrance)
//  获取出行任务状态
export const getStatusOn2021TrainTravelTask = createModel(modelList.getStatusOn2021TrainTravelTask)
//  出行任务发起任务
export const launchActivityOn2021TrainTravelTask = createModel(modelList.launchActivityOn2021TrainTravelTask)
//  新客礼包任务查询
export const GetUserReceiveDetailOfNewUserCoupon = createModel(modelList.GetUserReceiveDetailOfNewUserCoupon)
// x页坐席服务包信息
export const trainBookingByTrainNameV7Model = createModel(modelList.TrainBookingByTrainNameV7)
// x页供应商列表文案信息
export const getVendorListInfoV5Model = createModel(modelList.GetVendorListInfoV5)
// 全能抢票浮层信息
export const combineServiceProductDetailModel = createModel(modelList.combineServiceProductDetail)

export const Sync12306OrderInfoModel = createModel(modelList.Sync12306OrderInfo)
// 改签抢入口
export const RecommendRescheduleGrabTicketModel = createModel(modelList.RecommendRescheduleGrabTicket)
// 小红书领奖助力
export const ReceiveRedBookActivityReward = createModel(modelList.ReceiveRedBookActivityReward)
// 小红书助力获取装填
export const GetRedBookActivityInfo = createModel(modelList.GetRedBookActivityInfo)
// 是否添加企微
export const getUserStatusOnTrainWechatEnterpriseModel = createModel(modelList.getUserStatusOnTrainWechatEnterprise)
// 企微关注生成二维码
export const qyGetGroupEntryQrCodeWithUidModel = createModel(modelList.qyGetGroupEntryQrCodeWithUid)
// 通用页关注绑定
export const bindUserCommonPageTaskModel = createModel(modelList.bindUserCommonPageTask)
// 12306预热
export const notifyStartUpModel = createModel(modelList.notifyStartUp)
// 获取html页配置
export const getHtmlConfigByKeysModel = createModel(modelList.getHtmlConfigByKeys)
// 获取微信群入口信息
export const GetWeChatGroupInfo = createModel(modelList.GetWeChatGroupInfo)
// 订单详细查询任务是否可领
export const GetTrainCrossTaskDetailFront = createModel(modelList.GetTrainCrossTaskDetailFront)
// 儿童申报处理
export const handleChildTicketModel = createModel(modelList.handleChildTicket)
// 获取超能力解锁订单
export const GetTrainSuperPowerUnlockInfo = createModel(modelList.getTrainSuperPowerUnlockInfoByOrderId)
// 订详页任务列表领取任务
export const ReceiveHotelTask = createModel(modelList.ReceiveHotelTask)
// 抢票助力页完成任务
export const SharedCallBack = createModel(modelList.SharedCallBack)
// 高频火车站点
export const getDirectListTopQuickModel =  createModel(modelList.GetDirectListTopQuick)
// 根据aredid找到对应站点
export const getTrainSearchConditionModel = createModel(modelList.TrainGetSearchCondition)
// 流失用户权益查询
export const getLossGiftDetailModel =  createModel(modelList.GetLossGiftDetail)
// 流失用户权益领取
export const receiveLossGiftModel = createModel(modelList.ReceiveLossGift)
//积分兑换订单用户信息
export const GetUserAccountInfo = createModel(modelList.GetUserAccountInfo)
//积分兑换订单密码信息
export const GetOrderPointPayNotify = createModel(modelList.orderPointPayNotify)
// 列表页根据到达站发券
export const promotionSendCouponInfoModel = createModel(modelList.promotionSendCouponInfo)
// 列表页新客信息固定入口
export const getActivityStautsInfo = createModel(modelList.GetActivityStautsInfo)
// 列表页新客信息固定入口V2
export const getActivityStautsInfoV2 = createModel(modelList.GetActivityStautsInfoV2)
// 获取热门站点信息
export const getHotLocation = createModel(modelList.GetHotLocation)
// 国际火车优惠券
export const getUserCouponByProductType = createModel(modelList.getUserCouponByProductType)
// 旅行盲盒城市
export const getBlindBoxCity = createModel(modelList.getBlindBoxCity)
// 抢票助力成功弹窗类型
export const GetGrabTicketAlertInfo = createModel(modelList.GetGrabTicketAlertInfo)
// 境外城市查询
export const citySearchInner = createModel(modelList.CitySearchInner)
// 境外火车订单列表
export const getAbordTrainOrderList = createModel(modelList.getAbordTrainOrderList)
// 获取所选国家乘客年龄范围
export const getPTPPassengerAgeRangeInfo = createModel(modelList.GetPTPPassengerAgeRangeInfo)
// 首页在线换座弹窗
export const OnlineChangeSeatPromotionInfo = createModel(modelList.OnlineChangeSeatPromotionInfo)
// 获取用时是否有同步订单，待兑现候补订单标记
export const GetUserTag = createModel(modelList.GetUserTag)
