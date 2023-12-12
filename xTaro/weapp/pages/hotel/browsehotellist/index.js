import { cwx, CPage } from '../../../cwx/cwx.js';
import util from '../common/utils/util.js';
import commonfunc from '../common/commonfunc';
import commonrest from '../common/commonrest.js';
import components from '../components/components.js';
import date from '../common/utils/date.js';

import listdata from './listdata.js';

const CLOSE_PRICE_DETAIL = 'closePriceDetail';// 价格明细浮层中确定按钮触发事件，关闭浮层

CPage({
    pageId: '10650014808',
    checkPerformance: true, // 白屏检测标志位
    /**
     * 页面的初始数据
     */
    data: {
        dateInfo: { // 入离日期信息
            inDay: date.today(),
            outDay: date.tomorrow(),
            days: 1,
            inDayText: '', // x月x日,
            inDayDesc: '', // eg.今天
            outDayText: '',
            outDayDesc: '',
            isMorning: false,
            selectMorning: false
        },
        collection: {
            cityId: 0,
            citySpread: false,
            touchLeft: 0,
            scrollLeft: 0,
            subLeft: 0,
            moreIcon: false,
            end: false
        },
        favCities: [],
        hotels: [], // 收藏酒店列表
        listLoading: false,
        isIPhoneX: util.isIPhoneX(),
        hasNextPage: true, // 是否有下一页
        noHotels: false, // 搜索酒店无结果
        showPriceDetail: false
    },
    pageStatus: {
        hotelListLoadProcessing: false, // 是否正在加载酒店列表
        hotelListLoadTaskQueue: [], // 酒店列表加载任务队列
        listReqParams: { // 主列表请求参数（与页面渲染无关部分）
            pageIndex: 1,
            sessionId: ''
        },
        timeZoneDate: null, // 时间工具类
        isHourroomDate: false
    },
    model: {
        hotelInfoMap: {} // 服务下发的酒店信息放这里
    },

    onLoad (options) {
        const inDay = options.inday || date.today();
        const outDay = options.outday || date.tomorrow();
        const dateInfo = this.getDateInfo(inDay, outDay);
        const cityId = options.cityid || 0;

        this._setData({
            dateInfo,
            'collection.cityId': cityId
        }, true);

        this.reqCollectionCityList();
    },
    /**
     * 收藏酒店所在城市列表
     */
    reqCollectionCityList () {
        const collectionQuery = `
            {
                me {
                    getFavoriteStat {
                        id
                        name
                        count
                    }
                }
            }
        `;
        commonrest.graphQLExecute(collectionQuery, 'collectionCity', (data) => {
            const statList = data?.me?.getFavoriteStat || [];
            if (statList.length) {
                const collection = this.data.collection;
                collection.moreIcon = statList.length >= 5;
                this.setData({
                    favCities: [{ id: 0, name: '全部收藏' }, ...statList],
                    collection
                });
            }
        }, () => {
            // error
            // console.log(error);
        });
    },
    constructFavHotelListRequest () {
        const d = this.data;
        const pageS = this.pageStatus;
        const dateInfo = d.dateInfo;
        return {
            cityId: d.collection.cityId,
            checkinDate: dateInfo.inDay,
            checkoutDate: dateInfo.outDay,
            pageIndex: pageS.listReqParams.pageIndex,
            pageSize: 10,
            userHotelType: 'Favorite',
            sessionId: pageS.listReqParams.sessionId,
            pageCode: this.pageId
        };
    },
    /**
     * 加载酒店列表
     */
    loadHotels (request) {
        this.pageStatus.hotelListLoadTaskQueue.push({
            method: 'doHotelListLoad',
            request
        });

        if (!this.pageStatus.hotelListLoadProcessing) {
            this.doHotelListLoad(request);
        }
    },
    doHotelListLoad (request) {
        const pageS = this.pageStatus;
        pageS.hotelListLoadProcessing = true;
        const req = request || this.constructFavHotelListRequest();
        const pageIndex = req.pageIndex;
        this.showLoading(pageIndex);
        listdata.getFavoriteHotelList(req, (data) => {
            this.processHotelData(data, pageIndex);
            // 单次酒店load完毕
            this.hotelListLoadFinished();
        }, () => {
            this.hideLoading();
            this.hotelListLoadFinished();
        });
    },
    hotelListLoadFinished () {
        const tasks = this.pageStatus.hotelListLoadTaskQueue || [];
        tasks.shift(); // remove finished task
        this.pageStatus.hotelListLoadProcessing = false;
        if (tasks.length) {
            const task = tasks[0];
            this[task.method](task.request);
        }
    },
    processHotelData (data, pageIndex) {
        const d = this.data;
        const hotels = d.hotels;
        let dateInfo = d.dateInfo;
        if (pageIndex === 1) {
            // 时区
            const tZone = data.timeZoneInfo?.timeZone;
            const serverTime = data.serverTime;
            if (typeof tZone === 'number' && serverTime) {
                this.pageStatus.timeZoneDate = date.TimeZoneDate.create(new Date(serverTime), new Date(), tZone);
            }
            const uiModifyInfo = data.uiModifyInfo || {};
            // 日期信息（如果前端传入的时间过期了服务会校正）
            if (uiModifyInfo.checkinDate && uiModifyInfo.checkoutDate) {
                dateInfo = this.getDateInfo(uiModifyInfo.checkinDate, uiModifyInfo.checkoutDate);
            }
            // 第一页时返回sessionId，翻页时会通过request里的sessionId字段带给服务
            this.pageStatus.listReqParams.sessionId = data.seqId;
        }
        const hotelInfoList = data.hotelInfoList || [];
        let loededHotelLen = hotels.length;
        hotelInfoList.forEach(hotelInfo => {
            const idx = ++loededHotelLen;
            this.model.hotelInfoMap[hotelInfo.hotelId] = {
                index: idx,
                data: hotelInfo
            };
            hotels.push(this.constructHotelCardInfo(hotelInfo, idx));
        });
        const noHotels = !loededHotelLen;
        // 是否有下一页
        const hasNextPage = (loededHotelLen < data.hotelCount);

        this._setData({
            hotels,
            noHotels,
            dateInfo,
            hasNextPage,
            listLoading: false
        });
    },
    constructHotelCardInfo (hotelInfo) {
        let result = null;

        if (hotelInfo) {
            let positionDesc = hotelInfo.positionDesc;
            positionDesc = positionDesc?.indexOf('{0}') === -1 ? positionDesc : ''; // 兼容参数中传入经纬度的场景
            result = {
                hotelId: hotelInfo.hotelId,
                hotelName: hotelInfo.hotelName,
                isFullBooking: hotelInfo.isFullBooking,
                logoPic: hotelInfo.logoPic,
                needShowPrimeIcon: hotelInfo.isNewPrimeHotel,
                topRecommend: hotelInfo.topRecommend,
                topRecommendReason: hotelInfo.topRecommendReason,
                starLevel: hotelInfo.starLevel,
                isStarLicence: hotelInfo.isStarLicence,
                dStar: hotelInfo.dStar,
                starIcon: hotelInfo.starIcon,
                medalIconSrc: commonfunc.getMedalIcon(hotelInfo.medal),
                wowHotel: hotelInfo.wowHotel,
                featureHotelType: hotelInfo.featureHotelType,
                isAdSlot: hotelInfo.isAdSlot,
                commentScore: hotelInfo.commentScore ? hotelInfo.commentScore.toFixed(1) : '',
                commentNumberText: hotelInfo.commenterNumber > 0 ? `${hotelInfo.commenterNumber}点评` : '',
                commentDescription: hotelInfo.commentDescription,
                collectedText: this.getCollectedText(hotelInfo.collectedNumber),
                positionDesc,
                // 灰色蒙层
                showGrayFilter: (hotelInfo.canNotBeOrderedInfo?.messageBold && (hotelInfo.isClose || hotelInfo.isHotelNoPrice)) || hotelInfo.isFullBooking,

                incentiveText: hotelInfo.lastBookingTimeRemark, // 最新预定
                hotelCardTags: hotelInfo.hotelCardTags || [], // 卡片左下标签
                inspireTag: hotelInfo.inspireTag || {}, // 卡片激励文案
                pictureTags: hotelInfo.pictureTags, // 卡片图片上方标签
                pictureBottomTags: hotelInfo.pictureBottomTags, // 卡片下方标签
                featureHotelTag: hotelInfo.featureHotelTag, // 卡片标题后标签
                shaTag: hotelInfo.shaTag, // SHA-PLUS

                duringTime: hotelInfo.duringTime,
                price: hotelInfo.price, // 展示价格
                originPrice: hotelInfo.originPrice, // 原价（划线价)
                priceLabelDesc: hotelInfo.priceLabelDesc, // 价格左侧desc
                priceLabelExtraDesc: hotelInfo.priceLabelExtraDesc, // 价格下方描述 eg. 含税总价
                taxAmount: hotelInfo.taxAmount,
                browseClass: '', // 已浏览样式
                priceTags: hotelInfo.priceTags, // 标签（价格类）
                priceCalcItems: this.getPriceCalcItems2(hotelInfo.priceCalcItems),
                promotionTags: hotelInfo.promotionTags // 标签（非价格类）
            };
        }

        return result;
    },
    getCollectedText (collectedNumber) {
        let collectedDesc = '';
        if (collectedNumber > 0) {
            if (collectedNumber < 10000) {
                collectedDesc = `${collectedNumber}收藏`;
            } else {
                const thousands = Math.floor(collectedNumber / 1000);
                collectedDesc = `${thousands / 10}万收藏`;
            }
        }

        return collectedDesc;
    },
    getPriceCalcItems2 (arrPriceCalcItems) {
        let result = [];
        let count = 0;

        if (arrPriceCalcItems && arrPriceCalcItems.length) {
            arrPriceCalcItems.forEach((v, i) => {
                count = count + Math.abs(v.amount);
            });

            if (count > 0) {
                result = arrPriceCalcItems.slice(0);

                result.push({
                    title: '优惠' + count
                });
            }
        }

        return result && result.length > 0 ? result : arrPriceCalcItems;
    },
    getDateInfo (inDay, outDay, serverTime, timeZone = 0) {
        const pageS = this.pageStatus;
        if (serverTime) {
            pageS.timeZoneDate = new date.TimeZoneDate(new Date(serverTime), new Date(), timeZone);
        }
        !pageS.timeZoneDate && (pageS.timeZoneDate = new date.TimeZoneDate());
        const timeZoneDate = pageS.timeZoneDate;
        const isMorning = date.checkIsMorning(timeZoneDate);
        const selectMorning = isMorning && (inDay === timeZoneDate.yesterday());
        const isHourroomDate = pageS.isHourroomDate;
        // 显示的入住日期（如果是凌晨需要显示为今天）
        const shortInDay = this.inDayForShown(selectMorning, inDay);
        const inDayArr = commonfunc.getDateDisp(inDay, timeZoneDate, selectMorning) || [];
        const outDayArr = commonfunc.getDateDisp(isHourroomDate ? inDay : outDay, timeZoneDate, selectMorning) || [];

        return {
            shortInDay,
            shortOutDay: date.formatTime('MM-dd', date.parse(outDay)),
            inDayText: !isHourroomDate && selectMorning ? inDayArr[2] : inDayArr[0], // x月x日
            inDayDesc: inDayArr[1], // 今天
            outDayText: outDayArr[0],
            outDayDesc: outDayArr[1],
            inDay,
            outDay,
            days: isHourroomDate ? 0 : date.calDays(inDay, outDay),
            isMorning: date.checkIsMorning(timeZoneDate),
            selectMorning
        };
    },

    inDayForShown (selectMorning, inDay) {
        // 凌晨单显示入住日为今天
        const inDayForShown = selectMorning ? this.pageStatus.timeZoneDate.today() : inDay;
        return date.formatTime('MM-dd', date.parse(inDayForShown));
    },

    getRect (ele) {
        const self = this;
        wx.createSelectorQuery().select(ele).boundingClientRect(function (rect) {
            if (!rect) return;
            const subLeft = rect.left;
            const subHalfWidth = rect.width / 2;
            self.moveTo(subLeft, subHalfWidth);
        }).exec();
    },

    moveTo (subLeft, subHalfWidth) {
        const screenWidth = wx.getSystemInfoSync().windowWidth;
        const touchLeft = this.data.collection.touchLeft;
        const distance = subLeft - screenWidth / 2 + subHalfWidth;

        this.setData({
            'collection.scrollLeft': touchLeft + distance
        });
    },

    loadMore (e) {
        if (this.data.hasNextPage && !this.data.listLoading) {
            this.pageStatus.listReqParams.pageIndex++;

            this.loadHotels();
        }
    },

    showCalender (e) {
        const self = this;
        const pageS = self.pageStatus;
        const dateInfo = self.data.dateInfo;

        components.calendar({
            inDay: dateInfo.inDay,
            outDay: dateInfo.outDay,
            endDate: date.addDay(date.today(0), 365),
            title: '选择日期',
            timeZoneDate: pageS.timeZoneDate,
            isMorning: false,
            maxStayDays: 28
        }, (d) => {
            const { inDay, outDay } = d;
            self._setData({
                dateInfo: self.getDateInfo(inDay, outDay)
            }, true);
        });
    },

    changeCity (e) {
        const { id, current } = e.currentTarget.dataset;
        if (current) return;

        this._setData({
            'collection.cityId': +id,
            'collection.citySpread': false
        }, true);

        this.getRect(`#scroll-item-${id}`);
    },

    cityToggle (e) {
        this.setData({
            'collection.citySpread': !this.data.collection.citySpread
        });
    },

    hoteltap (e) {
        const { inDay, outDay } = this.data.dateInfo;
        const dataset = e.currentTarget.dataset;
        const hotel = this.model.hotelInfoMap[dataset.id]?.data || {};
        const cityid = hotel.cityId;

        let url = '../detail/index?' +
                `id=${dataset.id}` +
                `&inday=${inDay}` +
                `&outday=${outDay}` +
                `&cityid=${cityid}`;
        hotel.passToDetail && (url += `&passfromlist=${hotel.passToDetail}`);
        hotel.isPriceWithDecimal !== undefined && (url += `&price_decimal=${hotel.isPriceWithDecimal ? '1' : '0'}`);
        cwx.navigateTo({
            url
        });
    },

    starPriceDetailInfo (e) {
        const hid = e.currentTarget.dataset.hid;
        const hotelInfo = this.model.hotelInfoMap[hid];

        if (hotelInfo && hotelInfo.data) {
            const priceDetail = commonfunc.priceDetailNew(hotelInfo.data);
            this.setData({
                showPriceDetail: true,
                priceDetail,
                confirmBtnText: '关闭',
                priceDetailConfirmFuc: CLOSE_PRICE_DETAIL
            });
        }
    },

    closePriceDetail (e) {
        this.setData({ showPriceDetail: false });
    },

    showLoading: function (pageIndex) {
        const needClear = pageIndex === 1;
        let hotels = this.data.hotels;
        if (needClear) {
            hotels = [];
        }
        this.setData({
            hotels,
            hasNextPage: true,
            listLoading: true
        });
    },
    hideLoading: function () {
        this.setData({
            listLoading: false
        });
    },

    /**
     * 页面更新
     * @param {Object} renderData - 更新到页面的数据
     * @param {boolean} needLoadHotels - 是否需要重新加载酒店列表
     *
     */
    _setData (renderData, needLoadHotels) {
        if (renderData) {
            this.setData(renderData);
        }
        if (needLoadHotels) {
            const pageS = this.pageStatus;
            pageS.listReqParams.pageIndex = 1;
            pageS.listReqParams.sessionId = '';
            this.loadHotels();
        }
    }

});
