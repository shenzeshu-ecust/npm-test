import { cwx, _ } from '../../../../cwx/cwx.js';
import commonfunc from '../../common/commonfunc';

export default {

    listToDetail (page, options) {
        try {
            const { listPage, listInfo, room, biz, err, listRoomBookable, trackId, filterItemList, propertyIds } = options;
            const key = biz == 1 ? 'HTL_c_wechat_indtl_price_show' : 'HTL_c_wechat_osdtl_price_show';
            const traceObj = {
                checkin: options.checkin.replace(/-/g, ''),
                checkout: options.checkout.replace(/-/g, ''),
                masterhotelid: listInfo.masterhotelid,
                error: !!err,
                roomid: room.id,
                amount: room.originPrice,
                price: room.price,
                taxAmount: room.priceFloatInfo?.taxFee?.priceSum?.price || 0, // 税费
                isfromlist: 'true',
                shadowid: room.shadowId,
                listRoomBookable,
                ismemberlogin: options.isLoggedin,
                hasfilters: !!filterItemList.length,
                filters: filterItemList,
                trackId,
                listInfo: {
                    masterhotelid: listInfo.masterhotelid,
                    checkin: listPage.inday.replace(/-/g, ''),
                    checkout: listPage.outday.replace(/-/g, ''),
                    roomid: listInfo.roomid,
                    amount: listInfo.amount,
                    price: listInfo.price,
                    taxAmount: listInfo.taxAmount,
                    arrange: listInfo.arrange,
                    bookable: listInfo.bookable,
                    filter: listInfo.filter,
                    isshadow: listInfo.shadowid,
                    shadowid: listInfo.shadowid,
                    ismemberlogin: listInfo.ismemberlogin,
                    hasfilters: listInfo.hasfilters,
                    trackId: listInfo.trackId
                },
                propertyIds
            };
            page.ubtTrace && page.ubtTrace(key, traceObj);
            commonfunc.toCK(listInfo.trackInfo, room.trackInfo, traceObj);
        } catch (e) {
            // console.error(e);
        }
    },

    toBookingPage (page, options) {
        try {
            const pageData = page.data;
            const { error = {}, checkResult = {} } = options;
            const resultCode = checkResult.result;
            const { quickin, subPayType, dateInfo: date, roomQuantity, hasLogin } = pageData;
            const { detailTracePrice: roomData = {}, detailTrackInfo, bookTrackInfo } = page.pageStatus;
            const key = roomData.isOversea ? 'HTL_c_wechat_osorddtl_price_show' : 'HTL_c_wechat_inorddtl_price_show';
            const price = ~~checkResult.priceInfo?.amount; // 到店付+税费时与详情页totalPriceAfterDiscountIncludeTax不一致
            const priceBarAmount = ~~checkResult.uiInfo?.priceMainAmount; // 多晚只担保第一晚时有问题
            const detailPrice = (roomData.totalPriceAfterDiscountIncludeTax + roomData.ticketTotal + roomData.isCouponTicket * date.days) * roomQuantity;
            const bookPrice = detailPrice === priceBarAmount ? priceBarAmount : price;

            if (!hasLogin) {
                return;
            }
            if ([4, 5].indexOf(subPayType) > 0 && quickin && quickin.depositAmount > 0) {
                return;
            }
            const traceObj = {
                detailBookable: roomData.status === 1,
                detailInfo: {
                    roomid: roomData.id,
                    masterhotelid: roomData.baseInfo.id,
                    amount: roomData.originPrice,
                    totalPriceAfterDiscountIncludeTax: roomData.totalPriceAfterDiscountIncludeTax, // 服务下发总价
                    price: detailPrice, // 总价
                    coupon: roomData.coupon,
                    isCouponTicket: roomData.isCouponTicket,
                    ticket: roomData.ticket, // 返现
                    ticketTotal: roomData.ticketTotal,
                    exchange: roomData.exchange,
                    shadowid: roomData.shadowId,
                    checkin: roomData.inDay.replace(/-/g, ''),
                    checkout: roomData.outDay.replace(/-/g, ''),
                    quickpay: roomData.quickCheckin,
                    tax: roomData.taxAmount,
                    ismemberlogin: roomData.ismemberlogin,
                    trackId: roomData.trackId,
                    groupid: roomData.baseInfo.groupId
                },
                days: date.days,
                checkin: date.inDay.replace(/-/g, ''),
                checkout: date.outDay.replace(/-/g, ''),
                masterhotelid: roomData.baseInfo.id,
                roomid: roomData.id,
                shadowid: roomData.shadowId,
                quantity: roomQuantity,
                price: bookPrice,
                exchange: pageData.prices?.exg || 1, // 汇率
                amount: bookPrice, // 展示用本地币种金额
                bookable: (!_.isEmpty(checkResult) && resultCode === 0) || false,
                errorCode: error.resultCode || resultCode,
                errorinfo: error.message || checkResult.resultMessage,
                clientID: cwx.clientID
            };
            page.ubtTrace && page.ubtTrace(key, traceObj);
            commonfunc.toCK(detailTrackInfo, bookTrackInfo, traceObj);
        } catch (e) {
            // console.error(e);
        }
    },

    toPay (page, options) {
        try {
            const { request, response, bookable, price, oldResultCode, resultMessage, bookTrackInfo, orderCreateTraceInfo } = options;
            const pageData = page.pageStatus.orderTraceInfo;
            const key = page.data.isOutland ? 'HTL_c_wechat_osorddtl_price_submit' : 'HTL_c_wechat_inorddtl_price_submit';

            const traceObj = {
                orderid: response.orderId || '',
                clientId: cwx.clientID,
                price,
                responsePrice: response.price || '',
                tax: response.tax,
                returncode: oldResultCode || 0,
                resultMessage: resultMessage || '',
                hotelid: request.hotelId,
                roomid: request.roomInfo.roomID,
                checkin: request.roomInfo.checkInDate.replace(/-/g, ''),
                checkout: request.roomInfo.checkOutDate.replace(/-/g, ''),
                quantity: request.roomInfo.quantity,
                direct: pageData.cashReturn.amout,
                coupon: pageData.Coupon.couponReduce,
                exchange: pageData.prices.exg,
                balancetype: pageData.prices.useEType,
                bookable,
                shadowId: request.roomInfo.shadowID,
                quickpay: pageData.isUserSelectQuick
            };
            page.ubtTrace && page.ubtTrace(key, traceObj);
            commonfunc.toCK(bookTrackInfo, orderCreateTraceInfo, traceObj);
        } catch (e) {
            // console.error(e);
        }
    }
};
