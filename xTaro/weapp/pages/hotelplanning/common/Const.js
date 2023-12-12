const C = {
    // 落地页 pageId
    AGGREGATE_PAGEID: "10650027781", // 前台码
    WIFI_AGGREGATE_PAGEID: "10650054742", // 低星wifi码
    HIGH_WIFI_AGGREGATE_PAGEID: "10650061828", // 高星wifi码
    EMPLOYEE_PAGEID: "10650067037", // 员工码
    
    // 落地页 source
    AGGREGATE_SOURCE: "front-desk", // 前台码
    WIFI_AGGREGATE_SOURCE: "wifi-landing", // 低星wifi码
    HIGH_WIFI_AGGREGATE_SOURCE: "high-star-aggregate", // 高星wifi码
    EMPLOYEE_SOURCE: "employee", // 员工码
    
    // 领卡 status
    UNIONVIP_PENDING: "pendingVip",
    UNIONVIP_FETCHED: "unionvip",

    // 落地页 — 开关 && 配置
    AUTO_GET_VIP_CARD_SWITCH: "auto_get_vip_card_switch", // 自动领卡开关
    WATERFALL_SWITCH: "waterFllowSwitch", // 信息流（高星达人探店）总开关
    SWITCH_SUBSCRIPT: "switch_subscript", // 订阅消息总开关
    SUBSCRIPT_TEMPLATEIDS_ROOM: "subscript_templateIds_room", // 订阅消息模板
    EMPLOYEE_APP_SCAN: "employee_app_scan", // 员工码扫码一口价开关
    SCAN_IN_PRICE_TAG: "scan_in_price_tag", // 扫码一口价标签名称
    ORDER_ROOM_CIKA_SWITCH: "order_room_cika_switch", // 订房码次卡开关
    LIVE_IN_CIKA_SWITCH: "live_in_cika_switch", // 住中码次卡开关
    QUESTIONNAIRE_TITLE: "questionnaire_title", // 问卷调查标题
    QUESTIONNAIRE_URL_WEBVIEW: "questionnaire_url_webview", // 问卷调查h5链接
    WECHAT_CARD_BOUND_COUPON: "wechat_card_bound_coupon", // 券包策略
    LIMIT_CHOOSE_DAY: "calendar_limit_choose_day", // 日历最大可选时间

    // 售货机 — 开关 && 配置
    NEW_WIFIAGGREGATE_WIFI_SWITCH: "new_wifiaggregate_wifi_switch", // WIFI功能开关
    NEW_WIFIAGGREGATE_CONTACT_SWITCH: "new_wifiaggregate_contact_switch", // 联系前台功能开关
    AUTOSALL_SERVICE_PHONE_NUMBER: "autosall_service_phone_number", // 客服号码

    // 发票 — 开关 && 配置
    SMZ_FAKE_HOTEL_PROMTIONID: "smz_fake_hotel_promtionid",
    SMZ_CINVOICE_HIDE_PROMOTION: "smz_cinvoice_hide_promotion",
    CINVOICE_ROOM_NO: "cinvoice_room_no",

    // wifi页 — 开关 && 配置
    SMZ_WIFI_CHECK_STAY: "smz_wifi_check_stay",
    SMZ_WIFI_STAY_TIME: "smz_wifi_stay_time",
    WIFI_HOTEL_IDS: "wifi_hotel_ids",
    WIFI_HOTEL_ENABLE_WHITELIST: "wifi_hotel_enable_whitelist",
    WIFI_PAGE_ADD_COMPONENT: "wifi_page_add_component",
    SWITCH_IOS_WHITE_LIST: "switch_ios_white_list",
    SWITCH_SEARCHWIFI: "switch_searchWifi",
    IGNORE_HOTEL_NEW_USER: "ignore_hotel_new_user",
    YOYOCARD_INSTRUCTION: "yoyocard_instruction",
    NUCLEIC_ACID_IMAGE_URL: "nucleic_acid_image_url",
    WIFI_CONNECT_NEW_CUSTOMER_DISCOUNT: "wifi_connect_new_customer_discount",
    WIFI_CONNECT_CONTINUE_LIVE_PROFIT: "wifi_connect_continue_live_profit",
    WIFI_CONNECT_TIP_TEXT: "wifi_connect_tip_text",
    SHOW_NEARBYWIFI_SWITCH: "show_nearbyWifi_switch",
    COPY_PASSWORD_WIFI_SIGNAL: "copy_password_wifi_signal",
    CONNECT_FRONTDESKK_SWITCH: 'connect_frontdesk_switch',

    // 活动广场页 - 开关 && 配置
    LANDLORDS_JUMP_URL: 'landlords_jump_url',
    LANDLORDS_BG_IMAGE: 'landlords_bg_image',
    JJMAJIANG_JUMP_URL: 'JJmajiang_jump_url',
    JJMAJIANG_BG_IMAGE: 'JJmajiang_bg_image',
    SIGNIN_JUMP_URL: 'sigin_jump_url',
    SIGNIN_ICON_IMAGE: 'sigin_icon_image',
    RED_ENVELOP_JUMP_URL: 'red_envelop_jump_url',
    RED_ENVELOP_ICON_IMAGE: 'red_envelop_icon_image',
    DISCOUNT_GOODS_JUMP_URL: 'discount_goods_jump_url',
    DISCOUNT_GOODS_ICON_IMAGE: 'discount_goods_icon_image',
    CONTINUE_LIVE_ICON_IAMGE: 'continue_live_icon_image',

    // 房型
    LONE_RENT_LIMIT_DAY: 29, // 大于29天为长租房
    CALENDAR_LIMIT_CHOOSE_DAY: 180, // 日历设置的最大可选时间

    // 对话框名
    ZERO_WIFI: "zeroWifiModal",
    FRONT_DESK: "frontDeskModal",
    HIGHSTAR_QR: "highStarQrModal",
    GROUP_QR: "groupQrModal",

    // 实验号
    SEND_MESSAGE_DOWNLOAD_TEST: "230914_HTL_fdxyd",

    // 实验类型
    UID_AB_TEST: "userId",
    CID_AB_TEST: "clientId",

    STORAGE_WEBP: 'P_HOTEL_S_WBEP',

    // 图片切图类型
    PICTURE_CUT_TYPE: {
        R: 'R', // 固定宽高（压缩）
        C: 'C', // 固定宽高（压缩或者放大）
        W: 'W', // 高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩）
        Z: 'Z', // 高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩或者放大）
        X: 'X', // 居中抠图
        Y: 'Y' // 压缩或拉升至指定宽高
    }
};

export default C;