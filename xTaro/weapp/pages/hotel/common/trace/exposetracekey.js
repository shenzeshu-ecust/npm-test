/**
 * 曝光埋点的key
 * @type {{}}
 */
const exposeTraceKey = {};
/**
 * 详情页曝光埋点
 */
// 达人晒图模块曝光
exposeTraceKey.BLOG_ARTICLE_SHOW_KEY = '234684';
// 附近同类型酒店曝光(国内)
exposeTraceKey.IN_NEARBY_HOTEL_SHOW_KEY = 'htl_c_applet_inldtl_nearhtl_card_exposure';
// 附近同类型酒店曝光(海外)
exposeTraceKey.OS_NEARBY_HOTEL_SHOW_KEY = 'htl_c_applet_osdtl_nearhtl_card_exposure';
// 酒店头部信息曝光(DevTrace)
exposeTraceKey.HOTEL_DETAIL_HEAD_INFO_KEY = 'htl_c_applet_detailpage_hoteldetail_exposure';
// 酒店政策模块曝光
exposeTraceKey.HOTEL_DETAIL_POLICY_KEY = 'htl_c_applet_dtl_policy_exposure';
// 订房必读模块曝光
exposeTraceKey.HOTEL_DETAIL_NOTICE_KEY = 'htl_c_applet_dtl_read_exposure';
// 住客评价模块曝光
exposeTraceKey.HOTEL_DETAIL_LIVE_COMMENT_KEY = 'htl_c_applet_dtl_livecomment_exposure';
// 筛选浮层模块曝光
exposeTraceKey.HOTEL_DETAIL_FILTER_LAYER_KEY = 'htl_c_applet_detailpage_filterlayer_exposure';
// 房型浮层模块曝光
exposeTraceKey.HOTEL_DETAIL_ROOM_LAYER_KEY = 'htl_c_applet_detailpage_roomlayer_exposure';
// 地图模块曝光
exposeTraceKey.HOTEL_DETAIL_MAP_KEY = 'htl_c_applet_detailpage_map_exposure';
// 售卖房型卡片曝光
exposeTraceKey.HOTEL_DETAIL_ROOM_CARD_KEY = '227524';
// 特色房banner曝光
exposeTraceKey.HOTEL_DETAIL_ROOM_MARKET_BANNER_KEY = 'htl_c_applet_inldtl_roomlist_market_exposure';
// 二屏待点评模块曝光
exposeTraceKey.HOTEL_DETAIL_WAIT_COMMENT_KEY = 'htl_c_applet_inldtl_cmt_await_exposure';
// 优惠券banenr-超旅标签曝光
exposeTraceKey.HOTEL_DETAIL_TRAVEL_COUPON_TAG = 'htl_c_applet_dtl_promotion_coupon_exposure';
// 优惠券浮层-超旅模块曝光
exposeTraceKey.HOTEL_DETAIL_TRAVEL_COUPON_MODULE = 'htl_c_applet_dtl_coupon_tripbutler_exposure';
// 超旅浮层曝光
exposeTraceKey.HOTEL_DETAIL_TRAVEL_COUPON_LAYER = 'htl_c_applet_dtl_coupon_tripbutlerlayer_exposure';
/**
 * 列表页曝光埋点
 */
// 酒店列表模块曝光
exposeTraceKey.HOTEL_LIST_HAS_HOTEL_KEY = 'htl_c_applet_list_hotellist_exposure';
// 搜索补偿酒店模块曝光
exposeTraceKey.HOTEL_LIST_RECOMMEND_HOTEL_KEY = 'htl_c_applet_list_recomhotellist_exposure';
// 搜索模块曝光
exposeTraceKey.HOTEL_LIST_SEARCH_KEY = 'htl_c_applet_list_search_exposure';
// 筛选模块曝光
exposeTraceKey.HOTEL_LIST_FILTER_KEY = 'htl_c_applet_list_filter_exposure';
// 酒店卡片曝光埋点
exposeTraceKey.HOTEL_LIST_HOTEL_KEY = 'htl_c_applet_list_tag_show';
/**
 * 填写页曝光埋点
 */
// 酒店头部信息模块曝光
exposeTraceKey.HOTEL_BOOKING_ROOM_INFO_KEY = 'htl_c_applet_book_roominfo_exposure';
// 费用明细模块曝光
exposeTraceKey.HOTEL_BOOKING_PRICE_DETAIL_KEY = 'htl_c_applet_book_priceinfo_exposure';
// 订房信息模块曝光
exposeTraceKey.HOTEL_BOOKING_RESERVATION_INFO_KEY = 'htl_c_applet_book_guestinfo_exposure';
// 订房必读模块曝光
exposeTraceKey.HOTEL_BOOKING_POLICY_KEY = 'htl_c_applet_book_policy_exposure';
// 优惠券模块曝光
exposeTraceKey.HOTEL_BOOKING_COUPON_KEY = 'htl_c_applet_book_coupon_exposure';
// 支付模块曝光
exposeTraceKey.HOTEL_BOOKING_PRICE_BAR_KEY = 'htl_c_applet_book_pay_exposure';
// 详情页和列表页优惠券banner模块曝光
exposeTraceKey.HOTEL_PROMOTION_BANNER_KEY = 'htl_wechat_benefitsbar_show';
// 超旅卡片曝光
exposeTraceKey.HOTEL_BOOKING_TRAVEL_COUPON_CARD = 'htl_c_applet_ord_promotion_tripbutler_exposure';
// 超旅浮层曝光
exposeTraceKey.HOTEL_BOOKING_TRAVEL_COUPON_LAYER = 'htl_c_applet_ord_promotion_tblayer_exposure';
// 挽留弹窗曝光埋点
exposeTraceKey.HOTEL_BOOKING_RETAINPOP_KEY = 'htl_c_applet_fillorder_DetainmentWindow_exposure';
export default exposeTraceKey;
