import { cwx } from '../../../../cwx/cwx.js';
import util from '../utils/util';
import storage from '../utils/storage';
import commonfunc from '../commonfunc';

export default {
    trace: function (page, options) {
        try {
            const traceid = commonfunc.getResponseLogId(options.res, 'request-id');
            storage.setStorage('HOTEL.ROOM.TRACEID', traceid, 0.5);
            cwx.mkt.getUnion((data) => {
                let aid = '';
                let sid = '';
                if (data) {
                    aid = data.allianceid || '';
                    sid = data.sid || '';
                }
                const { hotelId, cityId, checkin, checkout, sharefrom, isNewVersion, user } = options.info;

                const minprice = Object.values(options.res.subRoomMap || {})?.filter(r => !r.isHourRoom).sort((a, b) => a.price - b.price)[0]?.price || 0;
                page.ubtTrace && page.ubtTrace('htl_c_applet_detail_load', {
                    hotelid: hotelId,
                    city: cityId,
                    checkin,
                    checkout,
                    sharefrom,
                    isNewVersion,
                    user,
                    minpirce: minprice,
                    traceid,
                    allianceid: aid,
                    alliancesid: sid,
                    sourceid: cwx.scene,
                    cid: cwx.clientID,
                    productid: '',
                    scene: cwx.scene
                });
            });
        } catch (e) {
            // console.error('htl_c_applet_detail_load', e);
        }
    },
    stayTimeTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(137267, {
                prepageid: options.prepageid,
                masterhotelid: options.masterhotelid,
                cityid: options.cityid,
                scene_value: cwx.scene,
                time: options.stayTime
            });
        } catch (e) {
            // console.error(137267, e);
        }
    },
    bookBackToDetailTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_c_wechat_dtl_ord_exit', options);
        } catch (e) {
            // console.error('HTL_c_wechat_dtl_ord_exit', e);
        }
    },
    basicroomclick: function (page, options) {
        try {
            const subInfo = options.baseInfo.subRoomList[0];

            const freeCancel = subInfo.serviceTagList.find(s => s.id === 10402) != null;
            const limitCancel = subInfo.serviceTagList.find(s => s.id === 10502) != null;
            page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_detail_basicroom_click', {
                basicroom: options.baseInfo.id,
                basicroom_name: options.baseInfo.name,
                basicroom_price: subInfo.originPrice,
                basicroom_bedtype: options.baseInfo.bed,
                basicroom_acreage: options.baseInfo.area,
                basicroom_floor: options.baseInfo.floor,
                basicroom_pernum: subInfo.maxNum,
                roomid: subInfo.id,
                shadowid: subInfo.shadowId,
                roomrank: options.rank,
                roomshowprice: subInfo.price,
                roomrefund: subInfo.refundAmount,
                roombedtype: subInfo.bed,
                roombreakfirst: subInfo.breakfast,
                isconfirm: subInfo.serviceTagList.find(s => s.id === 10020) != null,
                cancell: freeCancel ? '免费取消' : limitCancel ? '限时取消' : '不可取消',
                guaranteetype: subInfo.isGuarantee ? '担保' : '',
                BalanceType: subInfo.payType === 1 ? '现付' : '预付',
                boardbrand: subInfo.broadBand,
                hotelid: options.pageData.hotelID,
                checkin: options.pageData.inDay,
                checkout: options.pageData.outDay,
                traceid: storage.getStorage('HOTEL.ROOM.TRACEID')
            });
        } catch (e) {
            // console.error('o_hotel_wechatapp_detail_basicroom_click', e);
        }
    },
    navBackClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(137328, {
                masterhotelid: options.hotelid,
                scene_value: cwx.scene,
                isoversea: options.isoversea,
                button_type: options.btnType
            });
        } catch (e) {
            // ignore
        }
    },
    rankRoomsShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(133352, {
                cnt: options.cnt,
                rank: +options.rank + 1,
                sourceid: cwx.scene
            });
        } catch (e) {
            // ignore
        }
    },
    rankModulesShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(133354, {
                modulename: options.modulename,
                sourceid: cwx.scene
            });
        } catch (e) {
            // ignore
        }
    },
    piclistclick: function (page, options) {
        page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_piclist_click', {
            hotelid: options.hotelid,
            picfrom: options.curCat === 'hotel' ? '官方图片' : '网友晒图',
            pictype: options.current.typeName,
            picindex: options.index,
            picurl: options.current.pictureUrl
        });
    },
    filteritem: function (page, options) {
        try {
            const subRoomList = options.roomsData.baseRoomList.map(c => c.subRoomList);
            page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_filteritem', {
                hotelid: options.pageData.hotelID,
                checkin: options.pageData.inDay,
                checkout: options.pageData.outDay,
                filterlist: options.roomsFilter.queryList.map(c => {
                    return {
                        filtertype: c.type,
                        filtersubtype: 2,
                        filtername: (options.roomsFilter.filters.find(f => f.type === c.type) || {}).name,
                        filterid: c.val
                    };
                }),
                roomlist: util.isEmpty(subRoomList) ? [] : subRoomList.reduce((a, b) => a.concat(b))
            });
        } catch (e) {
            // console.error(e);
        }
    },

    smztrace: function (page, options) {
        cwx.mkt.getUnion((data) => {
            if (data && data.allianceid === 927180) {
                try {
                    page.ubtTrace && page.ubtTrace('htlwechat_dtl_page_load', {
                        hotelid: options.hotelId,
                        aid: data.allianceid,
                        sid: data.sid,
                        cid: cwx.clientID
                    });
                } catch (e) {
                    // console.error(e);
                }
            }
        });
    },
    smzfootbartrace: function (page, options) {
        const { functionId, hotelId } = options;

        try {
            page.ubtTrace && page.ubtTrace('htlwechat_dtl_detail_bottombar_click', {
                functionId,
                hotelId
            });
        } catch (e) {
            // ignored
        }
    },
    smzfootExposure: function (page, options) {
        try {
            const { hotelId, functions, enableGoodProduct } = options;
            const buttonname = functions.map(f => f.name);

            if (enableGoodProduct) {
                buttonname.push('好物圈');
            }

            page.ubtTrace && page.ubtTrace('htlwechat_dtl_detail_bottombar_show', {
                buttonname: buttonname.join('|'),
                masterhotelid: hotelId
            });
        } catch (e) {
            // ignored
        }
    },
    shareFrom: function (page, options) {
        try {
            const { shareFrom } = options;
            page.ubtTrace && page.ubtTrace(104281, {
                shareFrom
            });
        } catch (e) {
            // console.error(e);
        }
    },
    bookingClick: function (page, options) {
        try {
            cwx.mkt.getUnion((data) => {
                let aid = '';
                let sid = '';
                if (data) {
                    aid = data.allianceid || '';
                    sid = data.sid || '';
                }
                const { basicroomrank, roomrank } = options;
                page.ubtTrace && page.ubtTrace('htl_c_wechat_dtl_booking_click', {
                    subtab: options.subtab, // #区分国内海外,inlandoroversea"
                    masterhotelid: options.masterhotelid, // #母酒店id
                    roomid: options.roomid, // #子房型ID
                    issproom: options.issproom,
                    roombedtype: options.roombedtype,
                    roommeals: options.roommeals,
                    allianceid: aid,
                    alliancesiteid: sid,
                    sourceid: cwx.scene,
                    cid: cwx.clientID,
                    ...(basicroomrank && roomrank ? { basicroomrank, roomrank } : {})
                });
            });
        } catch (e) {
        }
    },
    bookingTextClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('HTL_mini_dtl_boot_button_click', {
                buttontype: options.buttontype, // 预定按钮文案点击埋点
                isoversea: options.isoversea
            });
        } catch (e) {
            // console.error('HTL_mini_dtl_boot_button_click', e);
        }
    },
    roomReasonBookingText: function (page, options) {
        if (!options) return;
        try {
            page.ubtTrace && page.ubtTrace('HTL_mini_dtl_rob_reason_show', {
                list: options.list, // 抢的原因、预定按钮文案曝光埋点
                isoversea: options.isoversea
            });
        } catch (e) {
            // console.error('HTL_mini_dtl_rob_reason_show', e);
        }
    },
    JudgeMinpPriceRoom: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('145784', {
                subtab: options.subtab,
                issproom: options.issproom
            });
        } catch (e) {
            // console.error('htl_wechat_dtl_guessroom_load', e);
        }
    },
    roomListNull (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('d_HTL_WX_roomList_null', options);
        } catch (e) {
            // ignore
        }
    },
    hotelNameLongPress (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('d_HTL_WX_hotelName_longpress', options);
        } catch (e) {
            // ignore
        }
    },
    hotelAddrLongPress (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('d_HTL_WX_hotelAddr_longpress', options);
        } catch (e) {
            // ignore
        }
    },
    chooseHotelEntranceShow: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_detail_choosehotel_entrance_show', {
            hotelid: options.hotelid,
            gid: options.gid,
            count: options.count,
            status: '展开'
        });
    },
    chooseHotelEntranceClick: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_detail_choosehotel_entrance_click', {
            hotelid: options.hotelid,
            gid: options.gid,
            count: options.count
        });
    },
    timeConsuming (page, options = {}) {
        try {
            page.ubtTrace && page.ubtTrace(195660, options);
        } catch (e) {
            // ignore
        }
    },
    noRoomTrace (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(205420, {
                noroom: true,
                requestid: options.requestId,
                source: 'wechat',
                spider: options.spider
            });
        } catch (e) {
            // ignore
        }
    },
    noImageTrace (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(205422, {
                id: options.id,
                type: options.type,
                source: 'wechat'
            });
        } catch (e) {
            // ignore
        }
    },
    roomClickTrace (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(options.key, {
                page: options.pageId,
                masterhotelid: options.hotelId,
                roomid: options.roomId,
                cityid: options.cityId,
                star: options.starLevel,
                checkin: options.checkin,
                checkout: options.checkout
            });
        } catch (e) {
            // ignore
        }
    },
    // 行程分享跳转详情/app分享跳转详情的弹窗，曝光买的
    showCoupnDialog (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(214153, {
                page: options.pageId,
                user: options.user,
                ticket_content: options.content
            });
        } catch (e) {
            // ignore
        }
    },
    gotoWeworkClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224791, {
                page: options.pageId,
                masterhotelid: options.hotelId,
                activityContent: options.activityContent,
                activityState: options.activityState
            });
        } catch (e) {
            // ignore
        }
    },
    gotoWeworkShow (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224789, {
                page: options.pageId,
                masterhotelid: options.hotelId,
                activityContent: options.activityContent,
                activityState: options.activityState
            });
        } catch (e) {
            // ignore
        }
    },
    rankMedalClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224742, options);
        } catch (e) {
            // ignore
        }
    },
    rankLabelClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(224738, options);
        } catch (e) {
            // ignore
        }
    },
    priceInfoClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227525, options);
        } catch (e) {
            // ignore
        }
    },
    calenderClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227527, options);
        } catch (e) {
            // ignore
        }
    },
    filterLayerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227528, options);
        } catch (e) {
            // ignore
        }
    },
    commentClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227529, options);
        } catch (e) {
            // ignore
        }
    },
    mapClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227530, options);
        } catch (e) {
            // ignore
        }
    },
    sellingPointClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227532, options);
        } catch (e) {
            // ignore
        }
    },
    moreSubRoomClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227534, options);
        } catch (e) {
            // ignore
        }
    },
    collectClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227553, options);
        } catch (e) {
            // ignore
        }
    },
    nearbyFacilityClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227536, options);
        } catch (e) {
            // ignore
        }
    },
    storeListClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227538, options);
        } catch (e) {
            // ignore
        }
    },
    storeDetailClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227543, options);
        } catch (e) {
            // ignore
        }
    },
    planetBannerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227540, options);
        } catch (e) {
            // ignore
        }
    },
    customerCommentClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227546, options);
        } catch (e) {
            // ignore
        }
    },
    quesAnsInfoClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227548, options);
        } catch (e) {
            // ignore
        }
    },
    reservationNoticeClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227550, options);
        } catch (e) {
            // ignore
        }
    },
    policyInfoClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227552, options);
        } catch (e) {
            // ignore
        }
    },
    // 达人晒图
    blogArticleClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(234690, options);
        } catch (e) {
            // ignore
        }
    },
    // 附近同类型酒店
    nearbyHotelClick (page, options) {
        try {
            const key = options.isOverSea ? 'htl_c_applet_osdtl_nearhtl_card_click' : 'htl_c_applet_inldtl_nearhtl_card_click';
            delete options.isOverSea;
            page.ubtTrace && page.ubtTrace(key, options);
        } catch (e) {
            // ignore
        }
    },
    // 房型列表预订按钮点击
    bookingBtnClick (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_detailpage_roomlist_click', options);
        } catch (e) {
            // ignore
        }
    },
    roomListClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_detail_room_click', options);
        } catch (e) {
            // ignore
        }
    },
    /*
    * 特色房banner - 点击埋点
    */
    marketBannerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_inldtl_roomlist_market_click', options);
        } catch (e) {
            // ignore
        }
    },
    /*
    * 房型浮层 - 特色房点击埋点
    */
    roomSceneLayerClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_inldtl_roomlayer_room_scene_click', options);
        } catch (e) {
            // ignore
        }
    },
    /**
     * 待点评卡片点击埋点
     */
    waitCommentClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_inldtl_cmt_await_click', options);
        } catch (e) {
            // ignore
        }
    },
    // 购买超值旅行家券包
    bookTravelCoupon (options) {
        try {
            const tPage = cwx.getCurrentPage();
            tPage.ubtTrace && tPage.ubtTrace('htl_c_applet_dtl_coupon_tripbutler_click', options);
        } catch (e) {
            // ignore
        }
    }
};
