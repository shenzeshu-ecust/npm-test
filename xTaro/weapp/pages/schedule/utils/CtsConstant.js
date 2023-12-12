const CtsConstant = {
  SUBBIZTYPE: {
    /**
     * 国内机票
     * */
    CardSubBizType_FLIGHT_INLAND: 1,
    /**
     * 国际机票
     */
    CardSubBizType_FLIGHT_GLOBAL: 2,
    /**
     * 机酒套餐之国内机票
     */
    CardSubBizType_FLIGHT_HOTEL_INLAND_FIGHT: 101,

    /**
     * 机酒套餐之国际机票
     */
    CardSubBizType_FLIGHT_HOTEL_OVERSEA_FIGHT: 201,
    /**
     * 国内酒店
     */
    CardSubBizType_HOTEL_INLAND: 3,
    /**
     * 海外酒店
     **/
    CardSubBizType_HOTEL_OVERSEA: 4,

    /**
     * 景酒套餐的国内酒店
     */
    CardSubBizType_HOTEL_POI_INLAND: 301,
    /**
     * 景酒套餐的海外酒店
     */
    CardSubBizType_HOTEL_POI_OVERSEA: 401,
    /**
     * 机酒套餐之国内酒店
     */
    CardSubBizType_FLIGHT_HOTEL_INLAND_HOTEL: 302,
        /**
     * 新机酒套餐之国内酒店
     */
    CardSubBizType_FLIGHT_HOTEL_NEW_INLAND_HOTEL: 303,

    /**
     * 机酒套餐之海外酒店
     */
    CardSubBizType_HOTEL_FLIGHT_OVERSEA_HOTEL: 402,

    /**
     * 火车
     */
    CardSubBizType_TRAIN: 5,
    /**
     * 国内空铁
     */
    CardSubBizType_TRAIN_FLIGHT_INLAND: 501,
    /**
     * 国际空铁
     */
    CardSubBizType_TRAIN_FLIGHT_OVERSEA: 502,
    /**
     * 国际火车票
     */
    CardSubBizType_TRAIN_OVERSEA: 503,

    /**
     * 用车 接机
     */
    CardSubBizType_CAR_AIRPORT_PICKUP: 6,
    /**
     * 用车 送机
     */
    CardSubBizType_CAR_AIRPORT_DROPOFF: 7,
    /**
     * 海外用车 接机
     */
    CardSubBizType_CAR_AIRPORT_PICKUP_OVERSEA: 703,
    /**
     * 海外用车 送机
     */
    CardSubBizType_CAR_AIRPORT_DROPOFF_OVERSEA: 704,
    /**
     * 海外包车
     */
    CardSubBizType_CAR_AIRPORT_CHARTER_OVERSEA: 705,
    /*
     *706=马上叫车
     */
    CardSubBizType_CAR_Call_TAXI: 706,
    /**
     * 国内包车
     */
    CardSubBizType_CAR_RENTAL: 8,

    /**
     * 国内自驾
     */
    CardSubBizType_CAR_SELFDRIVE_INLAND: 701,
    /**
     * 海外自驾
     */
    CardSubBizType_CAR_SELFDRIVE_OVERSEA: 702,
    /**
     * POI 景点
     */
    CardSubBizType_POI_VIEWSPOT: 9,
    /**
     * POI 娱乐
     */
    CardSubBizType_POI_ENTERTAINMENT: 10,
    /**
     * POI 购物
     */
    CardSubBizType_POI_SHOPPING: 11,
    /**
     * POI 餐饮
     */
    CardSubBizType_POI_FOOD: 12,

    /**
     * POI一日游线路
     */
    CardSubBizType_POI_DAYTOUR_LINE: 901,
    /**
     * 景酒套餐 景点
     */
    CardSubBizType_POI_HOTEL_VIEWSPOT: 902,
    /**
     * 景酒套餐 娱乐
     */
    CardSubBizType_POI_HOTEL_ENTERTAINMENT: 903,
    /**
     * 景酒套餐 购物
     */
    CardSubBizType_POI_HOTEL_SHOPPING: 904,
    /**
     * 景酒套餐 餐饮
     */
    CardSubBizType_POI_HOTEL_FOOD: 905,
    /**
     * 一日游精选
     */
    CardSubBizType_DAYTOUR_SELECTTION: 906,
    /**
     * 旅行计划
     */
    CardSubBizType_TRAVEL_PLAN: 907,
    /**
     * 普通备忘录
     */
    CardSubBizType_MEMO_COMMOM: 15,
    /**
     * 日历备忘录
     */
    CardSubBizType_MEMO_CALENDAR: 1501,
    /**
     * 活动备忘录
     */
    CardSubBizType_MEMO_ACTIVITY: 1502,
    /**
     * 酒店备忘录
     */
    CardSubBizType_MEMO_HOTEL: 16,

    /**
     * 团队游
     */
    CardSubBizType_PACKAGE: 19,

    /**
     * TTD
     */
    CardSubBizType_TTD: 20,


    /**
     * TTD Wifi
     */
    CardSubBizType_TTD_WIFI: 2001,

    /**
     * TTD 其他
     */
    CardSubBizType_TTD_OTHER: 2002,
    /**
     * 自定义酒店卡片
     */
    CardSubBizType_CUSTOMER_HOTEL: 2101,

    /**
     * 汽车
     */
    CardSubBizType_BUS: 2201,
    /**
     * 旅游专线汽车
     */
    CardSubBizType_TRAVEL_BUS: 2202,
    /**
     * 机场休息室
     */
    CardSubBizType_Restroom: 2301,
    /**
     * 邮轮
     */
    CardSubBizType_Cruise: 2401,
    /**
     * 船票
     */
    CardSubBizType_Ship: 2501,
    /**
     * 安检通道
     */
    CardSubBizType_SecurityChanel: 2601,
    /**
     * 机票X WIFI
     */
    CardSubBizType_FlightX: 2602,
    /**
     * 停车场
     */
    CardSubBizType_ParkingArea: 2603,
    /**
     * 签证
     */
    CardSubBizType_Visa: 2701,
    /**
     * 度假 当地向导
     */
    CardSubBizType_Vacation: 2702,
    /**
     * 度假 -定制旅游
     */
    CardSubBizType_CustomTravel: 2703,
    /**
     * 行李寄送
     */
    CardSubBizType_Baggage: 2801,
    /**
     * 高端旅游
     */
    CardSubBizType_HighTravel: 2901,
    /**
     * 会场预订
     */
    CardSubBizType_VenueReserve: 3001,
    /**
     * 外币兑换
     */
    CardSubBizType_CurrencyExchange: 3101,
    /**
     * 国内民宿
     */
    CardSubBizType_BedAndBreakfast_INLAND: 3201,
    /**
     * 国外民宿
     */
    CardSubBizType_BedAndBreakfast_OVERSEA: 3202,
  },

  CARDSOURCE: {
    CARD_FROM_TRADE: "订单来自携程商旅",
    CARD_FROM_FLIGHT_NOTICE: "来自航班动态关注",
    CARD_FROM_FLIGHT_ONLINE_SELECTION: "来自在线选座导入",
    CARD_FROM_REAL_NAME: "来自实名认证同步",
    CARD_FROM_SHARED_ADD: '来自分享添加',
    CARD_FROM_MANUAL_ADD_FLIGHT: '来自航班关注',
    CARD_FROM_MANUAL_ADD_TRAIN: '来自火车关注'
  },
  CARD_SOURCE:{
    ORDER: 1 //订单
  },
  FROM_PAGE:{
    DETAIL:1,//详情页面
    SHARE:2,//分享页面
  },
  Flight_Layer: {
    CHECKIN_COUNTER: 0, //值机
    BOARDING_GATE: 1, //登机
    STOP_OVER_STATION: 2, //经停站点
    CROSS_DAY: 3, //跨天,
    TICKET_NO: 4 //票号
  },
  TEXT_CRUISE_TRAVEL_GUIDE: '出行指南',
  TEXT_CRUISE_BOARDING_INFO: '登船信息',
  TEXT_HOTEL_BOOKING: '预订',
  TEXT_HOTEL_CONTINUE_BOOKING: "继续预定",
  TEXT_HOTEL_ONLINE: "在线选房",
  TEXT_HOTEL_CONTACT: '联系酒店',
  TEXT_HOTEL_BUTLER: '服务管家',
  IS_CHARTERED_PICK_DROP: [6, 7, 8, 703, 704, 705, 710, 711, 712, 713, 706, 722, 723, 724, 725], // 包车&接送机&打车
  mainAppId: "wx0e6ed4f51db9d078"
}

export default CtsConstant;

/**机酒套餐之酒店*/
export const isFlightHotelCard = function(cardType) {
  return [CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_HOTEL_INLAND_HOTEL,
    CtsConstant.SUBBIZTYPE.CardSubBizType_FLIGHT_HOTEL_NEW_INLAND_HOTEL,
    CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_FLIGHT_OVERSEA_HOTEL].includes(cardType);
}

/**景酒套餐之酒店*/
export const isPoiHotelCard = function(cardType) {
  return cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_POI_INLAND || cardType == CtsConstant.SUBBIZTYPE.CardSubBizType_HOTEL_POI_OVERSEA;
}
