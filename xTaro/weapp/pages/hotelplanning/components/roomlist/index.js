import { cwx, CPage, _, } from '../../../../cwx/cwx.js';
import reqUtil from './requtil.js';
import util from '../../common/utils/util.js';
import urlUtil from '../../common/utils/url.js';
import dateUtil from '../../common/utils/date.js';
import storageUtil from '../../common/utils/storage.js';
import commonfunc from '../../common/commonfunc';
import components from '../components';
import commonrest from '../../common/commonrest';
import C from '../../common/Const.js'

const huser = require('../../common/hpage/huser')

const HIDDEN_TITLE_LIMIT_SCROLL_TOP = 80;
const MAX_TILING_ROOMS_LIMIT = 10;
const HOTEL_DETAIL_SHARE_ROOM_LIST = 'P_HOTEL_DETAIL_SHARE_ROOM_LIST'; //好友推荐标签
const MAX_SHARE_ROOM_VAILD_DAYS = 7; // 分享房型id最大缓存时间
const KEY_REJECT_QUICKCHECKIN = 'P_HOTEL_USER_REJECT_QUICKCHECKIN';
const TO_BOOKING_FUNC = 'toBooking'; // 价格明细浮层中确定按钮触发事件，去预定
const CLOSE_PRICE_DETAIL = 'closePriceDetail';// 价格明细浮层中确定按钮触发事件，关闭浮层

const calendarPlugin = "calendar";

Component({
    properties: {
        inday: String,
        outday: String,
        source: String,
        hotelId: String,
        showFilter: Boolean,
        showCalender: Boolean,
        sid: String,
        allianceid: String,
        pageId: String,
        eid: String,
        fromLS: Boolean,    // fromLS 低星wifi落地页和wifi连接页 续住场景
        mpNavHeight: Number,
        enableFullRoomApply: Boolean,
        unionVipType: String,
        noBenefit: Boolean,
        appscan: Number,
        scanPriceTag: String,
        isWifi: Boolean,
        matchedRoomParam: Object, // 去呼呼传入房型信息
        showPmsLayer: Boolean, // 首次领卡订阅消息后出去呼呼浮层
        disablePlatformDiscount: Boolean, // 屏蔽随机立减 false 不屏蔽，true 屏蔽
        calendarLimitChooseDay: Number
    },
    data: {
        dateInfo:{
            inDay: dateUtil.today(), // YYYY-MM-dd
            inDayText: '', // x月x日
            inDayDesc: '', // eg.今天
            outDay: dateUtil.tomorrow(),
            outDayText: '',
            outDayDesc: '',
            days: 1,
            selectMorning: false,
            isMorning: false,
            wifiDays: 0,
            isLongRent: false,
        },
        isIphoneX: util.isIPhoneX(),
        quickFilterIds: [],
        filterSelectedMap: {}, // key: filterId; value: 是否选中
        priceFilter: {}, // 价格筛选
        isRoomLoading: true,
        noRoomRes: false,
        friendShareRoom: {},
        guessLikeRoom: {},
        baseRoomList: [], // 展示用结构索引，筛选后改变
        tilingRoomList: [],
        moreTilingRoomBtn: false,
        hourRoomList: [],
        baseRoomMap: {}, // 服务返回房型信息
        subRoomMap: {},
        roomLayer: {
            isShown: false,
            key: '', // baseRoom索引
            skey: '', // subRoom索引
        },
        showPriceDetail: false,
        isOrderShown: false, // 是否展示去呼呼匹配房型浮层
        matchedRoomInfo: {}, // 去呼呼匹配房型信息
        hasClosedPmsLayer: false, // 关闭过去呼呼弹窗
    },
    pageLifetimes: {
        show: function() {
            const ps = this.pageStatus || {};
            ps.calendarJumping = false;
            this.getLoginStatus()
        },
    },
    lifetimes: {
        ready: function() {
            this.pageStatus = {
                timeZoneDate: null, // 此处初始化拿不到prototype
                calendarJumping: false, // 阻止日历点击多次跳转
                isHourroomDate: false,
                payType: 0, // 0=ALL 1=现付 2=预付 3=闪住
                minpPriceInfo: '',
                veilDifPriceInfo: '',
                lastCouponId: null, // 最低价房型未领优惠券（券后价相关）
                cityId: 0,
                cityName: '',
                allSubRoomMap: {}, // 服务返回全量房型，房型过多分页情况存在
                originRoomList: [], // 服务返回全量房型
                originHourRoomList: [], // 服务返回全量钟点房
                hasSetFilterInfo: false, // 更新room保持筛选信息不变
                subRoomSwiperTimeOut: null,
                imgSwitching: false, // 房型浮层切换图片
                channelList: '', // 渠道号：预售爆款需更改渠道号
                preLoadDetailInterval: null,
                firstReqRoomList: true,
                preTime: Date.now()
            }

            this.initDate()
            this.reqRoomList()
            this.initTrace()
            this.getLoginStatus()
        },
    },
    methods: {
        initTrace() {
            const { hotelId, allianceid, sid } = this.data
            this.logWithUbtTrace('212024', {
                masterhotelid: hotelId,
                aid: allianceid,
                sid
            })
        },
        initDate() {
            const dateInfo = {
                inDay: this.data.inday,
                inDayText: '',
                inDayDesc: '',
                outDay: this.data.outday,
                outDayText: '',
                outDayDesc: '',
                days: 1,
                selectMorning: false,
                isMorning: false,
                wifiDays: 0
            };
            this.setData({
                dateInfo
            })
        },
        reqRoomList() {
            const ps = this.pageStatus;
            if (!ps) return;
            const {
                payType,
                minpPriceInfo = '',
                veilDifPriceInfo,
                planetBatchCode,
                fromPlanetFlagShip,
                starPlanetId,
                channelList,
            } = this.pageStatus;

            this.setData({
                isRoomLoading: true
            })
            
            ps.calendarJumping = false;
            const { inDay: checkinDate, outDay: checkoutDate, isLongRent } = this.data.dateInfo;
            const isHourRoomSearch = () => {
                const isHourroomFilted = () => {
                    return (this.data.filterSelectedMap || {})['1|99999999'];
                };
                return this.data.isHourroomModule || this.pageStatus.isHourroomDate || isHourroomFilted();
            }
    
            const params = {
                hotelId: +this.data.hotelId,
                checkinDate,
                checkoutDate,
                payType,
                isHourRoomSearch: isHourRoomSearch(),
                minpPriceInfo,
                filterItemList: [], // todo
                veilDifPriceInfo,
                planetBatchCode,
                fromPlanetFlagShip,
                starPlanetId,
                enableFullRoomApply: !!this.data.enableFullRoomApply && !isLongRent,
                disablePlatformDiscount: this.data.disablePlatformDiscount
            };
            params.head = { extension: [{ name: 'sourceFrom', value: 'fromscan' }] }
            
            channelList && (params.head.extension.push({ name: 'channelList', value: channelList }));

            reqUtil.getRoomList(params, this.roomListSuccess.bind(this), this.roomListErr.bind(this));
        },
        roomListSuccess(res = {}) {
            // 保存服务返回原始数据
            const pageS = this.pageStatus || {};
            pageS.originRoomList = res.roomList;
            pageS.originHourRoomList = RoomListSort(res.hourSaleRoomList);
            pageS.guessLikeRoom = res.favoriteRoom || {};
    
            if (!pageS.hasSetFilterInfo) { // 未初始化筛选项
                pageS.hasSetFilterInfo = true;
    
                this.setData({
                    quickFilterIds: this.data.isHourroomModule ? [] : res.quickFilterIds,
                    filterSummary: this.getFilterSummary(res),
                    filterInfo: this.getFilterInfo(res),
                }, () => {
                    // 后续选中筛选id判断依赖this.data.filterInfo等
                    this.afterRoomSuccess(res);
                });
            } else {
                this.afterRoomSuccess(res);
            }
    
            function RoomListSort(roomList) {
                if (!roomList || !roomList.length) return [];
    
                const subRoomMap = res.subRoomMap || {};
                roomList.sort((a, b) => {
                    if (!subRoomMap[a.skey] || !subRoomMap[b.skey]) return 0;
                    return subRoomMap[a.skey].price - subRoomMap[b.skey].price;
                });
                return [...roomList.filter(r => subRoomMap[r.skey]?.status === 1),
                    ...roomList.filter(r => subRoomMap[r.skey]?.status !== 1)];
            }

            this.triggerEvent('roomlistLoadSuccess')
        },
        afterRoomSuccess(res) {
            // 前端筛选
            const { roomList, hourRoomList } = this.filterRooms(res.subRoomMap);
            const pageS = this.pageStatus || {};
            pageS.filteredRoomList = roomList;
            pageS.trackId = res.trackId;
            pageS.requestId = commonfunc.getResponseLogId(res, 'request-id');
    
            // 整理roomData
            const dataToSet = this.getRoomData({
                baseRoomMap: res.baseRoomMap || {},
                subRoomMap: res.subRoomMap || {},
                guessLikeRoom: res.favoriteRoom || {},
                roomList,
                hourRoomList,
                fromRoomReq: true,
            });
    
            const {checkinDate, checkoutDate, timeZoneInfo = {}} = res.modifyInfo || {};
            if (checkinDate || checkoutDate || timeZoneInfo) {
                const timeZone = timeZoneInfo?.timeZone || 0;
                dataToSet.dateInfo = this.getDateInfo(checkinDate, checkoutDate, res.serverTime, timeZone);
            }
    
            const self = this;
            this.setData(dataToSet, () => {
                const { unionVipType = "", hasLogin = false, source = false, matchedRoomParam = {}, fromBooking, hasClosedPmsLayer } = this.data;
                
                // 订房码 && 已登录 && 已领卡 && 去呼呼渠道 && 非填写页返回 && 未关闭过去呼呼弹窗
                if ((source === "front-desk" || source === "employee") && hasLogin && unionVipType === 'unionvip' && matchedRoomParam.saleRoomId && !fromBooking && !hasClosedPmsLayer) {
                    self.matchPmsRoom();
                }
            });
            const loadTime = Date.now() - pageS.preTime;
            this.setLimitedTime(res.subRoomMap);
    
            // roomlist显示完成埋点
            if (pageS.needTimeConsumeTrace) {
                pageS.needTimeConsumeTrace = false;
            }
        },
        roomListErr(err) {
            console.error(err)
        },
        /**
         * subRoomMap加上倒计时显示用字段countdown; 格式hh:mm:ss
         * 每秒setData更新
         * @param {*} subRoomMap
         */
        setLimitedTime(subRoomMap = {}) {
            let hasEventRunning = false;
            // clear倒计时
            clearInterval(this.pageStatus.promotionTimeInterval);

            this.pageStatus.promotionTimeInterval = setInterval(() => {
                Object.keys(subRoomMap).forEach(k => {
                    const limitedTimePromotionTip = subRoomMap[k].roomInspireInfo?.limitedTimePromotionTip || {};
                    const { endTime = 0 } = limitedTimePromotionTip; // 倒计时毫秒数
                    if (endTime > 0) {
                        let totalEndSec = Math.floor(endTime / 1000);
                        let countdown = '';
                        if (totalEndSec > 0) {
                            hasEventRunning = true;
                            totalEndSec--;
                            const hh = formartZero(Math.floor(totalEndSec / 3600));
                            const mm = formartZero(Math.floor((totalEndSec / 60 % 60)));
                            const ss = formartZero(Math.floor((totalEndSec % 60)));
                            countdown = [hh, mm, ss].join(':');
                        } else {
                            countdown = '';
                        }

                        limitedTimePromotionTip.countdown = countdown;
                        limitedTimePromotionTip.endTime = endTime - 1000;

                        function formartZero(num) {
                            return (num < 10 ? '0' : '') + num;
                        }
                    }
                });

                this.setData({ subRoomMap });
                if (!hasEventRunning) {
                    clearInterval(this.pageStatus.promotionTimeInterval);
                }
                hasEventRunning = false;
            }, 1000);
        },
        handleFilterReset () {
            this.setData({
                filterSelectedMap: {},
                hasSelectedItem: false,
            }, this.updateRoomsByFilter);
        },
        cancelPriceFilter(e) {
            this.setData({
                priceFilter: {},
            }, this.updateRoomsByFilter);
        },
        getFilterInfo(res) {
            return JSON.parse(res.filterInfo || '[]');
        },
        /**
         * subRooms整理，eg.按钮文案
         * @param {*} subRooms
         * @returns 整理后的subRooms
        */
        buildSubroomExtraInfo (subRooms = {}) {
            const sharedIds = [];
            const packageIdMap = {
                1: '住',
                2: '食',
                3: '享',
            }
            const { isLongRent } = this.data.dateInfo;

            Object.values(subRooms).forEach(room => {
                //低星WiFi落地页强化续住（非钟点房订改为续住）
                const showContinueLive = this.data.fromLS && !room.isHourRoom
                let saleBtnText = '订'
                let customSaleTextCls = ''

                const { status, receivableCouponInfo, roomPackageInfo, isLongRentAutoCoverd, incentiveText, isFullRoomCanApply } = room;
                const { strategyIds, strategyId } = receivableCouponInfo || {};
                
                if (showContinueLive) {
                    // 低星落地页 日历房全部展示为续住
                    saleBtnText = '续住'
                    customSaleTextCls = 'r-cl-btn-txt'
                } else if (isFullRoomCanApply) {
                    saleBtnText = '申请';
                    customSaleTextCls = 'fs28';
                } else if (status === 1 && (strategyIds?.length || strategyId)) {
                    saleBtnText = '领券订';
                    customSaleTextCls = 'fs22';
                } else if (isLongRentAutoCoverd) {
                    saleBtnText = '申请';
                } else if (incentiveText){
                    saleBtnText = '抢';
                    customSaleTextCls = '';
                }
                
                room.saleBtnText = saleBtnText;
                room.showContinueLive = showContinueLive;
                room.customSaleTextCls = customSaleTextCls;
                room.incentiveText = isFullRoomCanApply ? '询问前台是否有房' : incentiveText;
                sharedIds.length && (room.isFriendRecommendRoom = sharedIds.includes(room.id));
    
                // 套餐
                if (roomPackageInfo?.pkId && roomPackageInfo?.packageInfoList?.length) {
                    room.isCalendarSuite = true;
                    roomPackageInfo.packageInfoList.forEach(item => {
                        item.icon = packageIdMap[item.type];
                        if (item?.xItems && item?.xItems.length) {
                            item.xItems.map(xItem => {
                                if (xItem?.imgs && xItem?.imgs.length) {
                                    xItem.imgs = xItem.imgs.map(img => util.convertCrop(img, 'C', 750, 340, 0, 50))
                                }
                                return xItem;
                            })
                        }
                    })
                }

                // 长租房
                if (isLongRent) {
                    const { price, originPrice, priceStr } = room.totalPriceInfo || {};
                    const showPrice = room.showFuzzyPrice ? priceStr : price;
                    if (showPrice) {
                        room.priceAvg = room.price;
                        room.price = price;
                        room.priceStr = priceStr;
                        room.originPrice = originPrice;
                    }
                }
            })
            return subRooms;
        },
        isInRoomList(roomList, skey) {
            if (!skey) return false;
    
            return roomList.some(broom => {
                return (broom.subRoomList || []).some(sroom => sroom.skey === skey);
            });
        },
        getTilingRooms(res) {
            const result = {
                moreTilingRoomBtn: false,
                rooms: [],
            };
            const {
                roomList = [],
                subRoomMap = {},
            } = res;
    
            const bookRooms = [];
            const fullRooms = [];
            let onlyOneSubRoom = true; // 每个物理房型下都不多于一个可订房
            let showTilingRoom = true;
            roomList.some(broom => {
                let canBookCount = 0;
                (broom.subRoomList || []).some(sroom => {
                    const { skey } = sroom;
                    const { status, flatRank } = (subRoomMap[skey] || {});
                    const hidden =
                        status ? fullRooms.length > 0 : bookRooms.length >= MAX_TILING_ROOMS_LIMIT;
                    const roomItem = {
                        ...sroom,
                        hidden,
                        flatRank,
                    }
                    if (status) {
                        canBookCount++;
                        bookRooms.push(roomItem)
                    } else {
                        fullRooms.push(roomItem);
                    }
    
                    if (canBookCount > 1) {
                        onlyOneSubRoom = false;
                    }
                    if (bookRooms.length > MAX_TILING_ROOMS_LIMIT && !onlyOneSubRoom) {
                        showTilingRoom = false;
                        return true;
                    }
                });
                if (!showTilingRoom) return true;
            });
            if (!showTilingRoom) return result;
    
            bookRooms.sort((a, b) => b.flatRank - a.flatRank);
            fullRooms.sort((a, b) => b.flatRank - a.flatRank);
            result.rooms = bookRooms.concat(fullRooms);
            if (result.rooms.length > MAX_TILING_ROOMS_LIMIT || fullRooms.length > 1) {
                result.moreTilingRoomBtn = true;
            }
    
            return result;
        },
        toggleSubRoom(e) {
            const { key } = e.currentTarget.dataset;
            const hiddenSub = !this.data.baseRoomMap[key].hiddenSub;
            const id = `b${key}`; // 用于滚动
            this.setData({
                [`baseRoomMap.${key}.hiddenSub`]: hiddenSub,
                toView: id,
                needScrollTop: true,
            });
            
            const d = wx.createSelectorQuery().in(this)
                .select(`#${id}`)
                .boundingClientRect()
                .exec(res => {
                    this.triggerEvent('onToggleSubRoom', { rect: res[0] || {} })
                })
        },
        moreBaseRoomShow(e) {
            const { moreBaseRooms = [] } = this.pageStatus || {};
            if (!moreBaseRooms.length) return;
    
            this.setData({
                baseRoomList: [
                    ...this.data.baseRoomList,
                    ...moreBaseRooms
                ],
                moreBaseRoomTxt: '',
            });
            
            this.roomsClickTrace(0, 3, -1, false);
        },
        /**
         * 展开更多子房型
         * this.pageStatus存放剩余房型递减; 展示房型subRoomList递增
         */
        moreSubRoomShow(e) {
            const { baseKey, baseIndex } = e.currentTarget.dataset;
            const { moreSubRooms = {} } = this.pageStatus || {};
            const moreSubs = moreSubRooms[baseKey] || [];
            const moreSubLen = moreSubs.length;
            if (!moreSubLen) return;

            const subRoomListNow = this.data.baseRoomList[baseIndex].subRoomList;
            if (moreSubLen <= 10) {
                this.setData({
                    [`baseRoomList[${baseIndex}].subRoomList`]: subRoomListNow.concat(moreSubs),
                    [`baseRoomMap.${baseKey}.moreSubRoomTxt`]: '',
                });
                this.pageStatus.moreSubRooms[baseKey] = [];
            } else {
                const leftMoreSubs = moreSubs.slice(10);
                this.getMoreSubRoomTxt(leftMoreSubs.length);
                this.setData({
                    [`baseRoomList[${baseIndex}].subRoomList`]: subRoomListNow.concat(moreSubs.slice(0, 10)),
                    [`baseRoomMap.${baseKey}.moreSubRoomTxt`]: this.getMoreSubRoomTxt(leftMoreSubs.length),
                });
                this.pageStatus.moreSubRooms[baseKey] = leftMoreSubs;
            }

            this.roomsClickTrace(baseKey, 3, -1, false);
        },
        getMoreSubRoomTxt(leftSubRoomsLen) {
            return leftSubRoomsLen > 10 ? '查看更多10个房型' : `查看剩余${leftSubRoomsLen}个房型`;
        },
        showRoomImgLayer(e) {
            const { key } = e.currentTarget.dataset;
            let { pictureList = [], newPictureList = [], previewPictureList = [] } = this.data.baseRoomMap[key] || {};
            if (!previewPictureList?.length && newPictureList.length) {
                previewPictureList = newPictureList.map(picture => {
                    const { urlBody, urlExtend } = picture;
                    const [pictureType, width, height, quality, waterMarkName, waterMarkPosition] = ['C', 1280, 853, 90, 'ht8', 3];
                    return commonfunc.getDynamicImageUrl({
                        urlBody,
                        urlExtend,
                        type: pictureType, // 切图类型
                        width, // 图片宽度
                        height, // 图片宽度
                        quality, // 图片质量
                        waterMarkName, // 水印名
                        waterMarkPosition // 水印位置
                    });
                });
                this.setData({
                    [`baseRoomMap.${key}.previewPictureList`]: previewPictureList
                });
            }
            pictureList = previewPictureList;
    
            wx.previewImage({
                current: pictureList[0],
                urls: pictureList,
            });
        },
        showRoomLayer(e) {
            const { key, skey, type, index } = e.currentTarget.dataset;
            const { baseRoomMap, subRoomMap } = this.data;
            if (!baseRoomMap[key] || !subRoomMap[skey]) return;
    
            this.setData({
                roomLayer: {
                    isShown: true,
                    key,
                    skey,
                }
            });

            if (type) {
                this.roomsClickTrace(key, 1, this.calcRoomIdx(type, index), subRoomMap[skey].isHourRoom);
            }
        },
        hiddenRoomLayer: function(e) {
            this.setData({'roomLayer.isShown': false});
        },
        starPriceDetailInfo(e) {
            const { subRoomMap, dateInfo, nearbyHotels } = this.data;
            const { hid: hotelId, type, key } = e.currentTarget.dataset;
            const { isLongRent = false } = dateInfo;
            if (key) {
                this.roomsClickTrace(key, 4, -1, false);
            }
            // 房型
            if (type === 'hotelRoom') {
                const { skey } = e.currentTarget.dataset;
                if (!skey) return;
                this.setData({
                    showPriceDetail: true,
                    priceDetail: getPriceDetail(subRoomMap[skey]),
                    priceDetailSkey: skey,
                    confirmBtnText: '去预订',
                    priceDetailConfirmFuc: TO_BOOKING_FUNC
                });
                return;
            }
    
            // 附近酒店列表
            dateInfo.shortInDay = dateInfo.inDay;
            dateInfo.shortOutDay = dateInfo.outDay;
            let hotelInfo = nearbyHotels.filter(item => item.hotelId === hotelId)?.[0];
            if (hotelInfo) {
                const priceDetail = commonfunc.priceDetailNew(hotelInfo, isLongRent);
                this.setData({
                    showPriceDetail: true,
                    priceDetail: priceDetail,
                    confirmBtnText: '关闭',
                    priceDetailConfirmFuc: CLOSE_PRICE_DETAIL
                });
            }

            function getPriceDetail(roomInfo = {}) {
                const totalPriceInfo = isLongRent && roomInfo.totalPriceInfo; // 长租房场景
                const { price = 0, priceFloatInfo = {}, priceCalcItems } = totalPriceInfo || roomInfo;
    
                return {
                    name: roomInfo.name,
                    roomNo: roomInfo.roomNo,
                    isHourRoom: roomInfo.isHourRoom,
                    price,
                    priceFloatInfo,
                    priceCalcItems,
                };
            }
        },
    
        scrollPriceDetail () {
            this.setData({
                priceId: 'price-detail'
            })
        },
        closePriceDetail(e) {
            this.setData({ showPriceDetail: false });
        },
        toBooking: util.throttle(async function(e) {
            // type-房型类型 1-好友分享房型 2-猜你喜欢房型 3-平铺/基础房型 4-钟点房 5-去呼呼匹配房型
            const { skey, key, type, index } = e?.currentTarget?.dataset || {};
            if (!skey) return;
            const self = this;

            // 验凌晨单
            const { selectMorning } = this.data.dateInfo;
            if (selectMorning) {
                const { timeZoneDate } = this.pageStatus || {};
                const isMorning = dateUtil.checkIsMorning(timeZoneDate);
                if (!isMorning) {
                    this.showCalenderTips();
                    return;
                }
            }
    
            if (!this.data.skipForceLogin) {
                // 验登录态有效
                const hasLogin = await huser.checkLoginStatus(true);
                if (!hasLogin) {
                     cwx.user.login({
                        callback: function(data = {}) {
                            if (data.ReturnCode === '0') {
                                self.jumpBooking(skey);
                            }
                        }
                    });
                    return;
                }
            }

            // 验是否领卡
            if (this.data.unionVipType !== 'unionvip') {
                this.triggerEvent('showVipLayer')
                return;
            }
    
            // 验领券订
            await this.receiveCouponsBeforeBooking(skey);
    
            this.jumpBooking(skey);
                
            if (type) {
                const bookingRoom = this.data.subRoomMap[skey];
                if (!bookingRoom) return;
                this.roomsClickTrace(key, 2, this.calcRoomIdx(type, index), bookingRoom.isHourRoom, bookingRoom.saleBtnText);
            }
        }, 400),
        async receiveCouponsBeforeBooking(skey) {
            const subRoom = this.data.subRoomMap[skey] || {};
            // todo 领券订全量后，strategyId可删除
            const { strategyIds = [], strategyId } = subRoom.receivableCouponInfo || {};
            if (!strategyId && !strategyIds.length) return;
    
            const params = {
                coupons: strategyIds.length ? strategyIds.map(it => ({
                    promotionId: +it,
                })) : [{
                    promotionId: strategyId
                }],
                hotelId: this.data.hotelId
            };
            const pageS = this.pageStatus || {};
            
            // 领券订回退刷券刷房型
            this.triggerEvent("receiveCouponBooking")
            
            await this.handelReceiveMutilCoupon(params,pageS,skey)
        },

        async handelReceiveMutilCoupon(params, pageS = {}, skey) {
            return new Promise((resolve, reject) => {
                commonrest.receiveMutilCoupon(params, res => {
                    if (res.success === 1) {
                        pageS.receiveCouponFailed = '0';
                        resolve();
                    } else {
                        pageS.receiveCouponFailed = '1';
                        if (res.resultCode === 53 && res.macaoNeedAuthMsg) {
                            // 实名认证失败，出实名认证弹窗
                            this.onShowRealNamePop({ msg: res.macaoNeedAuthMsg, skey });
                        }else{
                            resolve();
                        }
                    }
                },() => {
                    pageS.receiveCouponFailed = '1';
                    resolve();
                });
            })
        },

        /* 打开实名认证弹窗 */
        onShowRealNamePop(e) {
            const { msg, skey } = e;
            this.setData({
                realNamePop: {
                    enable: true,
                    message: msg || '',
                    skey   
                }
            });
        },

        /* 关闭实名认证弹窗 */
        onCloseRealName(e) {
            this.setData({
                'realNamePop.enable': false
            });
        },

        onAuthRealNameCallback(e) {
            const { skey, cancelAuthRealName = false} = e.detail;
            if (skey) {
                if(cancelAuthRealName){
                    //不领券直接订
                    this.jumpBooking(skey);
                }else{
                    this.triggerEvent("reloadCouponList")
                    this.jumpBooking(skey, { cancelReceiveCoupons: true })
                }
            }
        },

        async jumpBooking(skey, extraVal = {}) {
            const bookingRoom = this.data.subRoomMap[skey];
            if (!bookingRoom) return;
            
            const { cancelReceiveCoupons = false} = extraVal;

            // 预加载可订
            this.preLoadReservation(bookingRoom);

            if (cancelReceiveCoupons) {
                await this.receiveCouponsBeforeBooking(skey);
            }

            const {
                id: roomId,
                shadowId,
                paymentInfo,
                rateId,
                rateAdult,
                checkAVId = 0,
                ratePlanId = '',
                passToOrderInput,
                isPriceWithDecimal,
            } = bookingRoom;
    
            let url = '/pages/hotel/booking/thirdbook?';
            const { dateInfo, hotelId, source} = this.data;
            const { receiveCouponFailed } = this.pageStatus || {};
            const urlParams = {
                hotelid: hotelId,
                roomid: roomId,
                shadowid: shadowId,
                indate: dateInfo.inDay,
                outdate: dateInfo.outDay,
                paytype: paymentInfo.type,
                subpaytype: paymentInfo.subType,
                rateid: rateId,
                rateadult: rateAdult,
                checkavid: checkAVId,
                rateplanid: ratePlanId,
                passfromdetail: passToOrderInput,
                disableplatformdiscount: this.data.disablePlatformDiscount ? 1 : 0//disableplatformdiscount=1：需要禁用，disableplatformdiscount=0不需要禁用
            };
            receiveCouponFailed !== undefined && (urlParams.receiveCouponFailed = receiveCouponFailed);
            /**联合会员拼接参数 fromscan: 延住不换房；eid：员工码 */
            if (source === "wifi-landing" || source === 'wifi-connect' || source === 'high-star-aggregate') {
                // wifi落地页和wifi连接页 续住场景 需要携带fromscan参数
                urlParams.fromscan = 1;
            }
            if (this.data.eid) {
                urlParams.eid = this.data.eid;
            }
            if (this.data.appscan) {
                urlParams.appscan = 1
            }
            urlParams.detailtraceprice = this.getPriceTraceInfo(bookingRoom);
            url += urlUtil.paramString(urlParams);
            isPriceWithDecimal !== undefined && (url += `&price_decimal=${isPriceWithDecimal ? '1' : '0'}`);

            let self = this;
            cwx.navigateTo({
                url: url,
                events: {
                },
                success: () => {
                    const { pageId } = self.data;
                    self.logWithUbtTrace('219300', { 
                        page: pageId,
                        dimension: '预订跳转'
                    })

                    // 填写页返回关闭去呼呼浮层
                    self.setData({
                      fromBooking: true,
                      isOrderShown: false
                    })
                }
            });
        },
        getPriceTraceInfo(room) {
            const { dateInfo, hotelId, hotelBaseInfo, biz } = this.data;
            const { inDay, outDay } = dateInfo;
            const { trackId } = this.pageStatus || {};
            const traceInfo = room.traceInfo || {};
            return JSON.stringify({
                status: room.status,
                id: room.id,
                originPrice: room.originPrice,
                shadowId: room.shadowId,
                taxAmount: room.priceFloatInfo?.taxFee?.priceSum?.price || 0,
                quickCheckin: room.quickCheckInDesc ? 1 : 0, // 是否存在闪住标签
                ismemberlogin: true, // 是否登录
                trackId: trackId,
                ticketTotal: traceInfo.cashbackAmount || 0,
                isCouponTicket: 0, // 优惠券返，无法判别，先给定默认值
                isOversea: biz !== 1,
                totalPriceAfterDiscountIncludeTax: traceInfo.totalPriceAfterDiscountIncludeTax,
                exchange: room.exchange || 1, // 汇率， todo: 未下发，先给定默认值1
                baseInfo: {
                    id: hotelId,
                    groupId: hotelBaseInfo?.groupId
                },
                inDay,
                outDay,
            });
        },
        /**
         * @param {*} res 服务返回结果（无筛选项时）；或者前端筛选后的房型信息
         * @returns 待set房型数据
         */
        getRoomData(res) {
            let {
                baseRoomMap,
                subRoomMap,
                guessLikeRoom,
                roomList = [], // key索引
                hourRoomList = [],
                fromRoomReq,
            } = res;

            const { hasLogin } = this.data

            subRoomMap = this.buildSubroomExtraInfo(subRoomMap);

            const { moreTilingRoomBtn, rooms: tilingRoomList } = this.getTilingRooms(res);
            const dataToSet = {
                friendShareRoom: {},
                tilingRoomList,
                moreTilingRoomBtn,
                hourRoomList,
                subRoomMap,
            };
            dataToSet.noRoomRes = !roomList.length && !hourRoomList.length;
            dataToSet.isRoomLoading = false;

            // 猜你喜欢
            const hasGuessLikeRoom = this.isInRoomList(roomList, guessLikeRoom.skey);
            dataToSet.guessLikeRoom = hasGuessLikeRoom ? guessLikeRoom : {}; // 筛选后的房型中不含猜你喜欢，猜你喜欢房型赋值为{}

            // 折叠房型
            const bookingList = [];
            const fullBookList = [];
            if (!tilingRoomList.length) {
                // 起价子房型存minPriceSkey
                roomList.every(bRoom => {
                    if (!bRoom.subRoomList || !bRoom.subRoomList.length) return true;

                    // minBookingPrice: 可定房型起价，minBookingSkey：可定起价房型skey
                    // minFullPrice: 订完房型起价，minFullSkey：订完起价房型skey
                    let [minBookingPrice, minFullPrice, minBookingSkey, minFullSkey] = [0, 0, '', ''];
                    bRoom.subRoomList.forEach(subRoom => {
                        const { price, status } = subRoomMap[subRoom.skey] || {};
                        if (status === 1 && (!minBookingPrice|| price < minBookingPrice)) {
                            minBookingPrice = price;
                            minBookingSkey = subRoom.skey;
                        }
                        if (status !== 1 && (!minFullPrice || price < minFullPrice)) {
                            minFullPrice = price;
                            minFullSkey = subRoom.skey;
                        }
                    });
                    // 联合会员特殊判断 兼容未登录情况
                    if (!hasLogin || minBookingPrice) {
                        baseRoomMap[bRoom.key].minPriceSkey = minBookingSkey;
                        bRoom.minPrice = minBookingPrice;
                        bookingList.push(bRoom);
                    } else {
                        baseRoomMap[bRoom.key].minPriceSkey = minFullSkey;
                        bRoom.minPrice = minFullPrice;
                        fullBookList.push(bRoom);
                    }
                    return true;
                });

                bookingList.sort((a, b) => a.minPrice - b.minPrice);
                fullBookList.sort((a, b) => a.minPrice - b.minPrice);
                // 分页
                const { roomListShow, moreBaseRoomTxt } = this.doRoomPage(bookingList.concat(fullBookList), baseRoomMap)
                dataToSet.baseRoomList = roomListShow;
                dataToSet.moreBaseRoomTxt = moreBaseRoomTxt;
            };

            if (fromRoomReq) {
                Object.keys(baseRoomMap).forEach(k => {
                    baseRoomMap[k].hiddenSub = true;
                });
                dataToSet.subRoomMap = subRoomMap;
            }

            // 图片兜底切图处理
            Object.keys(baseRoomMap).forEach(k => {
                if (baseRoomMap[k]?.logo) {
                    baseRoomMap[k].logo = util.convertCrop(baseRoomMap[k].logo, 'C', 200, 200, 0, 70);
                }

                if (baseRoomMap[k]?.pictureList && baseRoomMap[k]?.pictureList?.length) {
                    baseRoomMap[k].pictureList = baseRoomMap[k].pictureList.map(pic => util.convertCrop(pic, 'C', 750, 340, 0, 50))
                }
            });

            dataToSet.baseRoomMap = baseRoomMap;

            return dataToSet;
        },
        /**
         * 入离日期
         */
        getDateInfo(inDay, outDay, serverTime, timeZone = 0) {
            if (serverTime) {
                this.pageStatus.timeZoneDate = new dateUtil.TimeZoneDate(new Date(serverTime), new Date(), timeZone);
            }
            const dateInfo = this.data.dateInfo;
            !inDay && (inDay = dateInfo.inDay);
            !outDay && (outDay = dateInfo.outDay);
            !this.pageStatus.timeZoneDate && (this.pageStatus.timeZoneDate = new dateUtil.TimeZoneDate());
            const { timeZoneDate, isHourroomDate } = this.pageStatus || {};
            const isMorning = dateUtil.checkIsMorning(timeZoneDate);
            const selectMorning = isMorning && (inDay === timeZoneDate.yesterday());
            const inDayArr = commonfunc.getDateDisp(inDay, timeZoneDate, selectMorning) || [];
            const outDayArr = commonfunc.getDateDisp(isHourroomDate ? inDay : outDay, timeZoneDate, selectMorning) || [];
            const days = isHourroomDate ? 0 : dateUtil.calDays(inDay, outDay);

            this.checkMorningExpired(isMorning);
            return {
                inDay,
                inDayText: !isHourroomDate && selectMorning ? inDayArr[2] : inDayArr[0], // x月x日
                inDayDesc: inDayArr[1], // 今天
                outDay,
                outDayText: outDayArr[0],
                outDayDesc: outDayArr[1],
                days,
                wifiDays: days,
                selectMorning: false,
                isMorning,
                showMorningOutTips: isMorning && outDay === timeZoneDate.today(),
                showMorningTips: isMorning && outDay === timeZoneDate.tomorrow(),
                isLongRent: days > C.LONE_RENT_LIMIT_DAY,
            };
        },
        checkMorningExpired(isMorning) {
            const ps = this.pageStatus || {};
            if (ps.fromMorning && !isMorning) {
                ps.fromMorning = false;
                this.showCalenderTips();
            }
        },
        preLoadReservation(bookingRoom) {
            const { dateInfo, hotelId } = this.data;
            const {
                id: roomId,
                shadowId,
                paymentInfo,
                rateId,
                rateAdult,
                checkAVId = 0,
                ratePlanId = '',
                isPriceWithDecimal,
            } = bookingRoom;
    
            const params = {
                disableQuickCheckin: !!storageUtil.getStorage(KEY_REJECT_QUICKCHECKIN),
                userSelectQuickCheckin: false,
                userArrivalTime: '',
                lastPage: 1,
                sessionData: '',
                checkIn: dateInfo.inDay,
                checkOut: dateInfo.outDay,
                hotelId: +hotelId,
                roomId: roomId,
                shadowId: shadowId,
                roomQuantity: 1,
                adult: 1,
                children: 0,
                ages: 0,
                payType: paymentInfo.type,
                subPayType: paymentInfo.subType,
                disableCoupon: false,
                userSelectPromotionId: '',
                userSelectCouponCode: '',
                rateId,
                rateAdult,
                checkAVId,
                ratePlanId,
                rmsToken: cwx.clientID,
                passFromDetail: '',
            };

            // 币种精度
            isPriceWithDecimal !== undefined && (params.isPriceWithDecimal = isPriceWithDecimal);
        },
        /**
         * 凌晨时间过期提示
         */
        showCalenderTips() {
            cwx.showModal({
                title: '日期已过期,请重新选择入离日期',
                confirmText: '知道了',
                showCancel: false,
                success: res => {
                    if (res.confirm) {
                        this.showCalender();
                    }
                }
            });
        },
        showCalender(e) {
            const { calendarJumping, timeZoneDate } = this.pageStatus || {};
            if (e && calendarJumping) return;
            this.pageStatus.calendarJumping = true;
    
            if (!timeZoneDate) return;
    
            const dateInfo = this.data.dateInfo;
            const params = {
                inDay: dateUtil.formatTime('yyyy-M-d', dateUtil.parse(dateInfo.inDay)),
                outDay: dateUtil.formatTime('yyyy-M-d', dateUtil.parse(dateInfo.outDay)),
                endDate: dateUtil.addDay(dateUtil.today(), 365),
                timeZoneDate,
                title: '选择日期',
                isMorning: dateInfo.isMorning,
                maxStayDays: this.data.calendarLimitChooseDay
            };
            if (this.calendarPlugin === 'calendar') {
                params.allowHourroomDate = this.data.biz === 1;
                this.pageStatus.isHourroomDate && (params.outDay = params.inDay);
            }
    
            components[calendarPlugin](params, this.calendarChoseBack.bind(this));
        },
        calendarChoseBack({inDay, outDay, isHourroomDate}) {
            this.pageStatus.isHourroomDate = isHourroomDate;
    
            this.setData({
                isRoomLoading: true,
                noRoomRes: false,
                dateInfo: this.getDateInfo(inDay, outDay)
            });
            this.resetInAndOutDay();
            this.reqRoomList();
        },
        /**
         * 房型分页处理
         * @return
         * roomListShow 页面展示用roomList
         * moreBaseRoomTxt 更多物理房型按钮文案
         */
        doRoomPage(roomList, baseRoomMap) {
            // 子房型分页规则: 5-10-10...
            let roomListShow = util.clone(roomList);
            const moreSubRooms = {}; // 存放隐藏子房型
            roomListShow.forEach(bRoom => {
                const { subRoomList } = bRoom;
                if (subRoomList.length > 5) {
                    bRoom.subRoomList = subRoomList.slice(0, 5);
                    const leftSubRooms = subRoomList.slice(5);
                    const bKey = bRoom.key;
                    moreSubRooms[bKey] = leftSubRooms;
                    baseRoomMap[bKey].moreSubRoomTxt = this.getMoreSubRoomTxt(leftSubRooms.length);
                } else {
                    const bKey = bRoom.key;
                    baseRoomMap[bKey].moreSubRoomTxt = ''; // 防止筛选后出 展开更多 按钮
                }
            });
            this.pageStatus.moreSubRooms = moreSubRooms;

            // baseRoom分页: 10-更多
            let moreBaseRoomTxt = '';
            if (roomListShow.length > 10) {
                const moreBaseRooms = roomListShow.slice(10);
                this.pageStatus.moreBaseRooms = moreBaseRooms;
                const { key } = roomList[10];
                moreBaseRoomTxt = `查看"${baseRoomMap[key].name}"等剩余${moreBaseRooms.length}个房型`
            }

            return {
                roomListShow: roomListShow.slice(0, 10),
                moreBaseRoomTxt,
            };
        },
        /**
         * return 筛选后的roomList 和 hourRoomList
         */
        filterRooms(subRoomMap = this.data.subRoomMap) {
            let { originRoomList = [], originHourRoomList = [], isHourroomDate } = this.pageStatus || {};
            isHourroomDate && (originRoomList = []);
            const noFilterRes = { roomList: originRoomList, hourRoomList: originHourRoomList };
            if (this.data.dateInfo.isLongRent) return noFilterRes;

            const selectedIds = this.getSelectedFilters(); // 选中筛选项
            const { priceFilter = {} } = this.data;
            if (!selectedIds.length && !priceFilter.isShown) return noFilterRes;

            // 普通房型
            const roomList = [];
            originRoomList.forEach(bRoom => {
                const bResult = {
                    id: bRoom.id,
                    key: bRoom.key,
                    subRoomList: [],
                };

                bRoom.subRoomList?.forEach(sRoom => {
                    isFit(subRoomMap[sRoom.skey]) && bResult.subRoomList.push(sRoom);
                });
                bResult.subRoomList.length && roomList.push(bResult);
            });

            // 钟点房
            const hourRoomList = [];
            originHourRoomList.forEach(hRoom => {
                isFit(subRoomMap[hRoom.skey]) && hourRoomList.push(hRoom);
            });

            return { roomList, hourRoomList };

            function isFit(checkRoom) {
                const { filterIds = [], price } = checkRoom || {};
                const { isShown, low, high } = priceFilter;
                if (isShown) { // 价格过滤
                    if (!high) { // xx价格以上
                        if (price < low) return false;
                    } else if (price < low || price > high) {
                        return false;
                    }
                }

                return !selectedIds.some(id => !filterIds.includes(id));
            }
        },
        getFilterSummary(res) {
            const filterSummary = JSON.parse(res.filterSummary || '{}');
            const result = {};
            Object.keys(filterSummary).forEach(fKey => {
                const { title, key: oldKey, nodeType, paths, data = {} } = filterSummary[fKey];
                const { filterId } = data;
                result[fKey] = {
                    title,
                    filterId,
                    oldKey,
                    excludeBrothers: nodeType === 2, // 需排除其他兄弟选项，eg.全部优惠
                    path: paths[0] || [], // filterInfo中的索引
                };
            });
    
            return result;
        },
        showFilterLayer(e) {
            this.setData({ showFilterLayer: true });
        },
        closeFilterLayer(e) {
            this.setData({ showFilterLayer: false });
        },
        /**
         * 选中/反选某个筛选项
         */
        filterSelect(e) {
            const { key } = e.currentTarget.dataset;
            const { filterSelectedMap } = this.data;
            const toSelect = !filterSelectedMap[key];
            const curSelectedIds = this.getSelectedFilters();

            this.pageStatus.filtered = true;

            if (toSelect) { // 正选
                const brotherMutexIds = this.getBrotherMutexIds(key);
                const otherMutexIds = this.getOtherMutexIds(key);
                const mutexIds = [...brotherMutexIds, ...otherMutexIds];

                const selectedIds = [...curSelectedIds, key].filter(id => !mutexIds.includes(id));
                const selectedMapNew = {};
                selectedIds.forEach(item => {
                    selectedMapNew[item] = true;
                });

                this.setData({
                    filterSelectedMap: selectedMapNew,
                    hasSelectedItem: true,
                }, this.updateRoomsByFilter);
            } else {
                this.setData({
                    [`filterSelectedMap.${key}`]: false,
                    hasSelectedItem: curSelectedIds?.length !== 1,
                }, this.updateRoomsByFilter);
            }
        },
        updateRoomsByFilter() {
            this.setData({
                isRoomLoading: true,
                noRoomRes: false,
            });

            const { roomList, hourRoomList } = this.filterRooms();

            const tData = this.data;
            const pageS = this.pageStatus || {};
            const dataToSet = this.getRoomData({
                baseRoomMap: tData.baseRoomMap,
                subRoomMap: tData.subRoomMap,
                guessLikeRoom: pageS.guessLikeRoom,
                roomList,
                hourRoomList,
                fromRoomReq: false,
            });
            this.setData(dataToSet);
        },
        /**
         * @returns Array 选中filterIds
         */
        getSelectedFilters() {
            const { filterSelectedMap, filterSummary = {} } = this.data;

            return Object.keys(filterSelectedMap).filter(key => {
                return filterSelectedMap[key] && isRoomFilter(key);
            });

            // 从列表带过来的筛选项包含酒店和房型维度
            function isRoomFilter(id) {
                return Object.keys(filterSummary).includes(id);
            }
        },
        getBrotherMutexIds(filterId) {
            const result = [];
            const { filterSummary, filterInfo } = this.data;
            const { path = [], excludeBrothers } = filterSummary[filterId] || {};
            const idx = path[0];
            if (!idx) return result;

            const filter = filterInfo[idx] || {};
            const { isMultiSelect } = filter.operation || {};
            if (!excludeBrothers && isMultiSelect) return result;

            const { subItems = [] } = filter;
            subItems.forEach(item => {
                const id = item.data?.filterId;
                if (id && id !== filterId) result.push(id);
            });

            return result;
        },
        getOtherMutexIds(filterId) {
            const otherMutexTypes = this.getMutexType(filterId, 'otherMutexIds');
            if (!otherMutexTypes) return [];

            const curSelectedIds = this.getSelectedFilters();
            return curSelectedIds.filter(sID => {
                const slefMutexTypes = this.getMutexType(sID, 'selfMutexIds');
                let hasSameId = false;
                for (let i = 0, n = slefMutexTypes.length; i < n; i++) {
                    if (otherMutexTypes.includes(slefMutexTypes[i])) {
                        hasSameId = true;
                        break;
                    }
                }

                return hasSameId;
            });
        },
        getMutexType(filterId, type) {
            const { filterInfo, filterSummary } = this.data;
            const { path = [] } = filterSummary[filterId] || {};

            let curNode = {};
            const resType = new Set();
            path.forEach((pItem, idx) => {
                curNode = idx === 0 ? filterInfo[pItem] : curNode.subItems[pItem];
                const typeItems = curNode?.operation?.[type] || [];
                typeItems.forEach(type => resType.add(type))
            });
            return [...resType];
        },            
        
        roomsClickTrace(roomid, clicktype, roomIdx, isHourRoom, buttonname) {
            const { hotelId, source, pageId, dateInfo, allianceid, sid } = this.data;
            const { inDay, outDay } = dateInfo;
            this.logWithUbtTrace('189251', {
                masterhotelid: hotelId,
                source,
                roomid,
                clicktype,
                roomrank: roomIdx,
                checkindate: inDay,
                checkoutdate: outDay,
                roomtype: isHourRoom ? 'HourRoom' : 'FullDayRoom',
                pageId,
                buttonname,
                aid: allianceid,
                sid
            })
        },

        logWithUbtTrace: function (ubtKey, data) {
            if (!ubtKey) return;
            let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
            log(ubtKey, data);
        },

        calcRoomIdx: function (type, index) {
            const { friendShareRoom = {}, guessLikeRoom = {}, tilingRoomList = [], baseRoomList = [] } = this.data;
            let result = 0;
            const friendShareRoomIndex = Object.keys(friendShareRoom).length === 0 ? 0 : 1;
            const guessLikeRoomIndex = Object.keys(guessLikeRoom).length === 0 ? 0 : 1;

            // type-房型类型 1-好友分享 2-猜你喜欢 3-平铺/基础 4-钟点房
            switch (type) {
                case 1:
                    result += friendShareRoomIndex;
                    break;
                case 2:
                    result += friendShareRoomIndex + guessLikeRoomIndex;
                    break;
                case 3:
                    result += friendShareRoomIndex + guessLikeRoomIndex + index + 1;
                    break;
                case 4:
                    result += friendShareRoomIndex + guessLikeRoomIndex + (tilingRoomList.length ? tilingRoomList.length : baseRoomList.length) + index + 1;
                    break;
                default:
                    break;
            }

            return result;
        },
		resetInAndOutDay: function () {
			const { inDay, outDay } = this.data.dateInfo;
			this.triggerEvent("resetInAndOutDay", { inDay, outDay });
		},
        getLoginStatus: function() {
            huser.checkLoginStatus(true).then(isLogin => {
                this.setData({
                    hasLogin: isLogin
                })
            })
        },
        noImageTrace(e) {
            let errMsg = e?.detail?.errMsg || '';
            this.triggerEvent('noImageTrace', { errMsg, type: '房型列表' });
        },
        // 关闭去呼呼浮层
        closeOrderLayer() {
            this.setData({
                isOrderShown: !this.data.isOrderShown,
                hasClosedPmsLayer: true
            })
        },
        // 匹配去呼呼房型
        matchPmsRoom() {
            const { subRoomMap = {}, matchedRoomParam = {} } = this.data;
            const { saleRoomId, guestName, guestPhone } = matchedRoomParam || {};

            for (let [key, value] of Object.entries(subRoomMap)) {
                // 匹配去呼呼房型
                if (value && (value.id === saleRoomId)) {
                    // 已订完、满房申请
                    if (value.status !== 1 || value.isFullRoomCanApply) {
                        return;
                    }

                    const { dateInfo = {} } = this.data;
                    const { inDayText = "", inDayDesc = "", outDayText = "", outDayDesc = "", days = "" } = dateInfo;

                    this.setData({
                        matchedRoomInfo: {
                            skey: key,
                            inDayText,
                            inDayDesc,
                            outDayText,
                            outDayDesc,
                            days,
                            guestName,
                            guestPhone,
                            ...value
                        },
                        isOrderShown: true
                    })
                    return;
                }
            }
        },
        // 去呼呼渠道跳转填写页
        goBooking() {
            const { matchedRoomInfo = {} } = this.data;
            const { skey, key } = matchedRoomInfo || {};
            
            this.toBooking({
                currentTarget: {
                    dataset: {
                        skey,
                        key,
                        type: 5, // 去呼呼匹配房型
                        index: 0
                    }
                }
            });
        },
    }
})