import {
    cwx
} from '../../../../cwx/cwx.js';
import StorageUtil from '../utils/storage.js';
import geoservice from '../geo/geoservice.js';

export default {
    hotelclick: function (page, options) {
        page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_list_hotelclick', {
            hotelid: options.currentHotelInfo.hotelID,
            minprice: options.currentHotelInfo.price,
            dst: options.currentHotelInfo.distanceInfo,
            index: options.idx,
            checkin: page.data.dates.inDay,
            checkout: page.data.dates.outDay,
            couponprice: options.currentHotelInfo.originPrice - options.currentHotelInfo.price,
            bookable: options.currentHotelInfo.isFullBooking === 1 ? 'F' : 'T',
            isclickprice: (options.isclickprice && 'T') || 'F',
            sourceid: cwx.scene
        });
    },
    navBackClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(137327, {
                isoversea: options.isoversea,
                scene_value: cwx.scene
            });
        } catch (err) {
            // ignore
        }
    },
    timeConsuming (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(195660, {
                pageId: options.pageId,
                time: options.time,
                source: options.source || ''
            });
        } catch (e) {
            // ignore
        }
    },
    roomClick (page, options) {
        try {
            // clicktype 1:进详情页 2：浮层 3:预定
            const { hotel, room, clicktype, hotelRank } = options;
            const key = 131506;
            // HTL_c_h5_list_hour_room_click，keyid：131506

            if (!hotel) {
                return;
            }

            const traceObj = {
                cityid: hotel.cityId,
                htlrank: hotelRank || 0,
                masterhotelid: hotel.hotelID,
                roomnum: hotel.roomInfos ? hotel.roomInfos.length : 0,
                basicroomid: room ? room.roomID : 0,
                roomtype: (room ? room.bedType : '') || '',
                ispromotion: 0,
                sale: room ? room.price : 0,
                reduceprice: room ? (room.minusAmount + room.refundAmount) : 0,
                livetime1: room ? room.checkInInterval : '',
                livetime2: room ? room.checkInTime : '',
                payway: room ? (room.isGuarantee ? '担保' : room.payContent) : '',
                isoversea: 'inland',
                // eslint-disable-next-line
                clicktype: clicktype == 1 ? '酒店' : (clicktype == 2 ? '房型浮层' : '预定按钮')
            };

            traceObj.ispromotion = traceObj.reduceprice > 0 ? 1 : 0;
            if (hotel.ubt && hotel.ubt.autotest_item) {
                wx.createSelectorQuery().select(`#${hotel.ubt.autotest_item}`).boundingClientRect((res) => {
                    if (res && res.dataset) {
                        traceObj.htlrank = res.dataset.idx + 1;
                        page.ubtTrace && page.ubtTrace(key, traceObj);
                    }
                }).exec();
            } else {
                page.ubtTrace && page.ubtTrace(key, traceObj);
            }
        } catch (e) {
            // console.error(e);
        }
    },
    hourroomQuickFilterClick (page) {
        try {
            page.ubtTrace && page.ubtTrace(158517, {});
        } catch (err) {
            // ignore
        }
    },
    noHotelTrace (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(199197, {
                nohotel: true,
                requestid: options.requestId,
                source: 'wechat',
                spider: options.spider
            });
        } catch (e) {
            // ignore
        }
    },
    noImageTrace (page, id) {
        try {
            page.ubtTrace && page.ubtTrace('200724', {
                hotelid: id,
                source: 'wechat'
            });
        } catch (e) {
            // ignore
        }
    },
    fullBookingHotel (page, id) {
        try {
            page.ubtTrace && page.ubtTrace('200727', {
                hotelid: id,
                source: 'wechat'
            });
        } catch (e) {
            // ignore
        }
    },
    couponReceiveClick (page, couponInfo, isSuccess) {
        const traceObj = {
            page: page.pageId,
            platform: 'wechat',
            modulename: '2', // 1.领券中心、2.列表页领券banner、3.列表页节目弹窗、4.详情页领券banner、5.领券订
            city: page.data.city?.cityid || page.data.cityInfo?.cityId,
            hotelid: '',
            roomid: '',
            couponList: [{
                promotionid: couponInfo.promotionID,
                couponcode: isSuccess ? couponInfo.promotionID : 'fail'
            }],
            subtab: page.data.isOversea ? 'oversea' : 'inland'
        };
        try {
            page.ubtTrace && page.ubtTrace(193245, traceObj);
        } catch (err) {
            // ignore
        }
    },
    newTrace (page, options) {
        try {
            const { request = {}, result = {} } = options;

            // 从 Extension 里取出request-id
            let requestID = '';
            if (result.ResponseStatus?.Extension) {
                const eItem = result.ResponseStatus.Extension.find((item) => { return item.Id === 'request-id'; });
                eItem && (requestID = eItem.Value);
            }

            let { filterItemList = [], starItemList = [], lowestPrice, highestPrice, orderItem } = request.filterInfo;

            // sort： 排序的索引+1
            const orders = ['sort-45|1', 'sort-3|1', 'sort-1|2', 'sort-1|1', 'sort-4|2', 'sort-0|1'];
            let sort = -1;
            if (result.uiModifyInfo?.isShowIntelligentSortItem) {
                orderItem === 'sort-0|1' && (orderItem = 'sort-45|1');
            } else {
                orderItem === 'sort-45|1' && (orderItem = 'sort-0|1');
            }
            sort = orders.indexOf(orderItem);
            sort < 0 && (sort = 0);
            sort++;
            // 筛选项
            const filterlist = [...filterItemList, ...starItemList];
            if (lowestPrice > 0 || highestPrice > 0) {
                filterlist.push(`price-${lowestPrice}|${highestPrice}`);
            }

            cwx.mkt.getUnion((data) => {
                let aid = '';
                let sid = '';
                if (data) {
                    aid = data.allianceid || '';
                    sid = data.sid || '';
                }

                page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_list_trace', {
                    city: request.cityId,
                    checkin: request.checkinDate,
                    checkout: request.checkoutDate,
                    ispoi: request.nearbySearch ? 'T' : 'F',
                    keyword: request.filterInfo.keyword,
                    traceid: requestID,
                    filterlist,
                    sid: StorageUtil.getSessionStorage(),
                    address: geoservice.getCachedAddress(),
                    sort,
                    allianceid: aid,
                    alliancesid: sid,
                    sourceid: cwx.scene,
                    cid: cwx.clientID,
                    scene: cwx.scene
                });
            });
        } catch (e) {
        }
    },
    quickFilterClick (page, isOversea, options) {
        const traceKey = isOversea ? 216037 : 216033;
        try {
            page.ubtTrace && page.ubtTrace(traceKey, options);
        } catch (e) {
            // ignore
        }
    },
    quickFilterShow (page, isOversea, options) {
        const traceKey = isOversea ? 216039 : 216032;
        try {
            page.ubtTrace && page.ubtTrace(traceKey, options);
        } catch (e) {
            // ignore
        }
    },
    searchListShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(210428, options);
        } catch (e) {
            // ignore
        }
    },
    thirteenlistShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(229582, options);
        } catch (e) {
            // ignore
        }
    },
    thirteenlistClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(229581, options);
        } catch (e) {
            // ignore
        }
    },
    priceDetailClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_lst_price_detail_click', options);
        } catch (e) {
            // ignore
        }
    },
    hotelCardClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(options.traceKey, {
                page: options.page,
                hotelid: options.hotelId,
                price: options.price,
                rank: options.rank,
                bookable: options.bookable,
                aid: options.aid,
                htllist_query_id: options.sessionId,
                masterhotelid_tracelogid: options.requestId
            });
        } catch (e) {
            // ignore
        }
    },
    filterListClick (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_list_filter_click', options);
        } catch (e) {
            // ignore
        }
    }
};
