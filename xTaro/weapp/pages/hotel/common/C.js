const C = {};

/**
 * ==================== 筛选类型 ====================
 */
C.FILTER_CATEGORY_FILTER = '2';
C.FILTER_CATEGORY_AREA_FILTER = '3';
C.FILTER_CATEGORY_PRICE_STAR = '4';
C.FILTER_CATEGORY_SORT = '5';
C.FILTER_CATEGORY_HOT_KEYWORD = '7';
C.FILTER_CATEGORY_QUICK_FILTER = '16';
/**
 * ==================== Storage ====================
 */
// 堡垒请求标识
C.STORAGE_HOTEL_BASTION_TEST = 'P_HOTEL_BASTION_TEST';

// 请求加密/解密标识
C.STORAGE_HOTEL_ENCODE_REQ = 'P_HOTEL_ENCODE_REQ';

// mars mock开启/关闭标识
C.STORAGE_HOTEL_MARS_CLOSE = 'P_HOTEL_MARS_CLOSE';

// 详情页记录最新浏览酒店城市id
C.STORAGE_BROWED_HOTEL_CITYID_HISTORY = 'P_HOTEL_USER_BROWED_HOTEL_CITYID';
// 填写页用户操作闪住开关（现付）
C.STORAGE_QUICKCHECKIN_YF_BEHAVIOR = 'P_HOTEL_USER_CHOOSE_QUICKCHECKIN_XF';
// 填写页用户操作闪住开关（预付）
C.STORAGE_QUICKCHECKIN_XF_BEHAVIOR = 'P_HOTEL_USER_CHOOSE_QUICKCHECKIN_YF';
// 会员等级弹窗
C.STORAGE_MEMBER_RIGHTS_DIALOG = 'P_HOTEL_RIGHTS_POP';
// 新客弹窗
C.STORAGE_NEWER_RIGHTS_DIALOG = 'P_HOTEL_NEWER_RIGHTS_POP';
// 澳门券发券弹窗
C.STORAGE_MACAO_COUPON_DIALOG = 'P_HOTEL_MACAO_COUPON_POP';
// 倒计时挂件
C.STORAGE_COUNT_DOWN_PENDANT = 'P_HOTEL_COUNT_DOWN';
C.STORAG_COUNT_DOWN_FINISH = 'P_HOTEL_COUNT_DOWN_FINISH';
// 砍价浮层
C.STORAGE_BARGAIN_LAYER_POPED = 'P_HOTEL_BARGAIN_LAYER_POPED'; // 砍价浮层，8小时出一次
C.STORAGE_BARGAIN_LAYER_EXPIRED_TIME = 8; // 砍价浮层弹窗出现时间
// 用户名字信息，若是马来西亚的酒店还需缓存用户选择的国籍信息，还记录是否授权GDPR
C.KEY_DEFAULT_NAME = 'P_HOTEL_BOOKING_DEFAULT_NAME';
// 查询页用户选择的入离日期
C.STORAGE_USER_SELECT_DATE = 'P_HOTEL_USER_SELECT_DATE';
/**
 * ==================== AB实验 ====================
 * @see pages/_quicklogin/index.js
 */
// AB实验MOCK开关
C.HOTEL_AB_MOCK_SWITCH = 'HOTEL_AB_TESTING_MOCK_SWITCH';
// AB实验MOCK数据缓存key
C.ABTESTING_MANAGER_MOCK = 'HOTEL_ABTESTING_MANAGER_MOCK';
// 新客弹窗 -> 一键领券
C.ABTESTING_NEWER_DIALOG = '230224_HTL_xcxxr';
// 房型激励标签AB实验
C.ABTESTING_HTL_XCXJL = '231016_HTL_xcxjl';
// 填写页挽留弹窗激励AB实验
C.ABTESTING_HTL_WLTC = '231027_HTL_wltc';
// 超值旅行家
C.ABTESTING_TRAVEL_COUPON = '230922_HTL_xcxcl';
/**
 * 此处做登记使用，方便索引
 * 详情页预订至填写页缓存信息: P_HOTEL_BOOKROOMDATA
 */

/**
 * 消息模板id
 */
C.SUBSCRIBMSG_TMPID_ORDERCOMFIRM = {
    templateName: '酒店预订成功通知', // 不含金额
    id: 'VwSORaF8orydvGdxB0Pn7o8q1ILVIHt18B-enavysMo'
};

// 优惠信息
C.promotionName = {
    cutprice: '砍价',
    pointsExchange: '积分兑换',
    member: '会员折扣'
};
C.pointsExchangeAll = '全部权益';

C.longRentLimitDay = 29; // 大于29天为长租房

C.STORAGE_WEBP = 'P_HOTEL_S_WBEP';

// 图片切图类型
C.PICTURE_CUT_TYPE = {
    R: 'R', // 固定宽高（压缩）
    C: 'C', // 固定宽高（压缩或者放大）
    W: 'W', // 高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩）
    Z: 'Z', // 高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩或者放大）
    X: 'X', // 居中抠图
    Y: 'Y' // 压缩或拉升至指定宽高
};

/**
 * ==================== result code ====================
 */
// 需登录
C.NEED_LOGIN = 201;

/**
 * ==================== 各小程序appID ====================
 */
C.APPID_WEAPP = 'wx0e6ed4f51db9d078'; // 微信
C.APPID_ALIPAY = '2017081708237081'; // 支付宝
C.APPID_BAIDU = '11048657'; // 百度
C.APPID_TT = 'ttaf70d9cd305a16cb'; // 头条
C.APPID_QUICK = '100252857'; // 快应用

C.BRAND_FILTER_PREFIX = '2|2|'; // 品牌筛选前缀（拼接filterid用）

export default C;
