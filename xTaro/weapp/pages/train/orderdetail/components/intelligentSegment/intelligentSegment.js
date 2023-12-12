// 智能中转、分段
import { cwx } from "../../../../../cwx/cwx";
import cDate from "../../../common/cDate";
import { OrderDetailModel } from "../../../common/model";
import util from "../../../common/util";

const weekDay = {
    1: "周一",
    2: "周二",
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六",
    7: "周日",
    0: "周日",
};
const SECOND = 1 * 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export default {
    data: {
        orderInfo: null,
    },
    methods: {
        // 判断是否是合并支付 走哪个逻辑
        async checkMergePay(orderInfo) {
            const intelligentKey = [
                "IntelligenceRecommendV3",
                "GrabTicketSegmentation",
            ];

            if (!orderInfo?.ExtendList?.length) return;

            const isIntelli = orderInfo.ExtendList.some(
                (v) => intelligentKey.includes(v.Key) && v.Value
            );
            const isMergePay = orderInfo.ExtendList.find(
                (v) => v.Key === "MergePayFlag"
            )?.Value;

            // 暂不开放
            // // 是否跳转智能方案
            // if (this.goIntelliH5(orderInfo.ExtendList) === 2) {
            //     const url = `https://m.ctrip.com/webapp/train/intelligentSegmentation?oid=${orderInfo.OrderId}&needLogin=true`;
            //     cwx.redirectTo({
            //         url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
            //             url
            //         )}`,
            //     });
            //     return;
            // }
            // // 跳转智能推荐h5
            // const _url = await this.goSecondTripH5(orderInfo);
            // if (_url) {
            //     cwx.redirectTo({
            //         url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
            //             _url
            //         )}`,
            //     });
            //     return;
            // }

            console.log("是否是智能分段", orderInfo, isIntelli, isMergePay);
            if (isMergePay == 1 && isIntelli) {
                // 新智能分段
                this.setData({ intelligentDisplay: true, isMergePay: true });
                this.initIntelligentSegment(orderInfo);
            } if (isIntelli) {
                // 老智能分段
                this.intelligenceRecommendEntranceHandler(orderInfo);
            } else {
                // 页面刷新处理
                this.setData({ intelligentDisplay: false, isMergePay: false });
            }
        },
        initIntelligentSegment(orderInfo) {
            const originInfo = this.formatOriginInfo(orderInfo); // 票面信息
            this.formatTripAxis(originInfo, orderInfo); // 行程轴
            this.formatTopMessage(orderInfo);

            this.setData({ intelligentInfo: originInfo });
        },
        // 推荐的智能场景需要跳转
        goIntelliH5(extendList) {
            const value =
                extendList.find((v) => v.Key === "GrabTicketSegmentation")
                    ?.Value || null;
            const status = value ? JSON.parse(value).groupOrderStatus : null;

            return status;
        },
        // 智能第二程的h5跳转
        async goSecondTripH5(orderInfo) {
            const value =
                orderInfo.ExtendsList?.find(
                    (v) => v.Key === "IntelligenceRecommendV3"
                )?.Value || null;
            const recommdValue = value ? JSON.parse(value) : null;
            const { RecommendOrderTicketType, JLDetailInfo, OrderId } =
                orderInfo;

            if (
                RecommendOrderTicketType === 2 &&
                JLDetailInfo?.JLOrderStatus === "C"
            ) {
                const url = `https://m.ctrip.com/webapp/train/activity/ctrip-intelligent-recommend/?oid=${OrderId}&isSecondTripDisplay=YES&needLogin=true`;
                return url;
            }

            if (!recommdValue) return null;

            const { relationOrderNumber } = recommdValue;

            if (!relationOrderNumber) {
                const url = `https://m.ctrip.com/webapp/train/activity/ctrip-intelligent-recommend/?oid=${orderInfo.OrderId}&needLogin=true`;
                return url;
            }

            // 请求接口
            const { OrderInfo, RetCode } = await this.getOrderInfo(
                relationOrderNumber
            );
            if (
                RetCode == 1 &&
                OrderInfo?.JLDetailInfo?.JLOrderStatus === "C" &&
                OrderInfo.RecommendOrderTicketType === 2
            ) {
                const url = `https://m.ctrip.com/webapp/train/activity/ctrip-intelligent-recommend/?oid=${relationOrderNumber}&isSecondTripDisplay=YES&needLogin=true`;
                return url;
            }

            return null;
        },
        getOrderInfo(oid) {
            const params = {
                OrderId: oid,
                ver: 1,
                Channel: "WX",
            };

            util.showLoading();

            return new Promise((resolve, reject) => {
                OrderDetailModel(
                    params,
                    (data) => {
                        util.hideLoading();
                        if (Object.keys(data).length === 0) {
                            util.showModal({
                                m: "系统异常，请稍后重试",
                            });
                            reject();
                        } else {
                            resolve(data);
                        }
                    },
                    (err) => {
                        util.hideLoading();
                        reject(err);
                        util.showToast(err);
                    }
                );
            });
        },
        // 处理原票信息
        formatOriginInfo(orderInfo) {
            return orderInfo.TicketInfos.map((t, i) => {
                /**
                 * RouteSequence 第几程
                 * ElectronicNumber 取票号
                 * TicketEntrance 检票口
                 * TrainNumber 车次
                 */
                const TicketEntrance =
                    !t.TicketEntrance || t.TicketEntrance === "--"
                        ? ""
                        : t.TicketEntrance.replace(
                              /^(检票口|候车地点)[:|：]?/,
                              "检票口："
                          );
                const ArriveDate = new cDate(t.ArriveDate).format("m月d日");
                const ArriveWeek = weekDay[new Date(t.ArriveDate).getDay()];
                const ArriveTime = new cDate(
                    `${t.ArriveDate.replace(/-/g, "/")} ${t.ArriveTime}:00`
                ).format("H:i");
                const DepartDate = new cDate(t.DepartDate).format("m月d日");
                const DepartWeek = weekDay[new Date(t.DepartDate).getDay()];
                const DepartTime = new cDate(
                    `${t.DepartDate.replace(/-/g, "/")} ${t.DepartTime}:00`
                ).format("H:i");
                const PassengerInfos = this.formatPassengerInfo(
                    t.PassengerInfos
                );
                const isTicketFail = this.formatMergePayFail(t.PassengerInfos);
                const issueFailDesc = isTicketFail
                    ? this.data.extendValues?.GrabTicketSegmentation
                          ?.issueFailDesc // ym 的获取 GrabTicketSegmentation 方法
                    : "";

                return {
                    ...t,
                    TicketEntrance,
                    _ArriveDate: ArriveDate,
                    _ArriveWeek: ArriveWeek,
                    _ArriveTime: ArriveTime,
                    _DepartDate: DepartDate,
                    _DepartWeek: DepartWeek,
                    _DepartTime: DepartTime,
                    _PassengerInfos: PassengerInfos,
                    isTicketFail, // 行程是否全部失败
                    issueFailDesc, // 票面副标题失败文案
                    _idx: i, // 兼容老方法用的
                };
            }).sort((a, b) => a.RouteSequence - b.RouteSequence);
        },
        formatPassengerInfo(passengers) {
            /**
             * 把 realticketinfo 里需要的字段拿出来
             *
             * TicketStatusCode 0未退、1退票处理中、2退票成功、3退票失败
             * ReturnButtonDisplay 退票按钮显示
             * ChangeButtonDisplay 改签按钮显示
             * DealTicketPrice 实际出票票价
             * DealSeatNo 出票座位号
             * SeatName 坐席类型
             */

            return passengers.map((p) => {
                const {
                    SeatName,
                    DealSeatNo,
                    DealTicketPrice,
                    TicketStatus,
                    TicketStatusCode,
                    ChangeButtonDisplay,
                    ReturnButtonDisplay,
                } = p.RealTicketInfo || {};

                return {
                    ...p,
                    SeatName: SeatName || "",
                    DealSeatNo: DealSeatNo || "",
                    DealTicketPrice: DealTicketPrice || "",
                    TicketStatus: TicketStatus || "",
                    TicketStatusCode,
                    ChangeButtonDisplay,
                    ReturnButtonDisplay,
                };
            });
        },
        // 合并支付 某程出票失败
        formatMergePayFail(passengers) {
            if (!this.data.isMergePay) return false;

            // 预订暂时没下发行程状态，等预订下发后，此逻辑可以调整下
            const isFail = passengers.every(
                (p) => p?.RealTicketInfo?.TicketStatus === "购票失败"
            );
            return isFail;
        },
        /**
         * 行程轴
         */
        formatTripAxis(ticketInfo, orderInfo) {
            // 是否是跨站
            const isCross = orderInfo.ExtendList.find(
                (v) => v.Key === "SegmentationCross"
            )?.Value;
            // 两程全部有购票成功才出现
            const isShow = ticketInfo.every((t) =>
                t._PassengerInfos.some((p) =>
                    ["抢票成功", "购票成功"].includes(p.TicketStatus)
                )
            );

            // 非合并支付不显示
            if (!isShow || !this.data.isMergePay) return;

            // first second
            const fDepart = ticketInfo[0].DepartStation;
            const fArrive = ticketInfo[0].ArriveStation;
            const sDepart = ticketInfo[1].DepartStation;
            const sArrive = ticketInfo[1].ArriveStation;
            const isSameStation = fArrive === sDepart;
            const isSameTrain =
                isSameStation &&
                ticketInfo[0].TrainNumber === ticketInfo[1].TrainNumber;

            if (!isCross) {
                const stations = isSameStation
                    ? [fDepart, fArrive, sArrive]
                    : [fDepart, fArrive, sDepart, sArrive];
                const _start = new Date(
                    `${ticketInfo[0].ArriveDate.replace(/-/g, "/")} ${
                        ticketInfo[0].ArriveTime
                    }`
                ).getTime();
                const _end = new Date(
                    `${ticketInfo[1].DepartDate.replace(/-/g, "/")} ${
                        ticketInfo[1].DepartTime
                    }`
                ).getTime();
                const diff = _end - _start;
                const d = Math.floor(diff / DAY);
                const h = Math.floor((diff - d * DAY) / HOUR);
                const m = Math.floor((diff - h * HOUR - d * DAY) / MINUTE);
                const costTime =
                    d > 0 ? `${d}天${h}时` : h > 0 ? `${h}时${m}分` : `${m}分`;
                console.log("行程轴换乘", _start, _end, ticketInfo);
                this.setData({
                    tripAxis: {
                        isCross,
                        stations,
                        isSameTrain,
                        isSameStation,
                        fSeat: ticketInfo[0]._PassengerInfos[0].SeatName,
                        sSeat: ticketInfo[1]._PassengerInfos[0].SeatName,
                        fNumber: ticketInfo[0].TrainNumber,
                        sNumber: ticketInfo[1].TrainNumber,
                        tit: isSameTrain
                            ? `请在<span style="color: #0086f6;">${stations[1]}站</span>换座位，无需下车`
                            : isSameStation
                            ? `到达${stations[1]}站，请在<span style="color: #0086f6;">${costTime}</span>内换乘`
                            : `需从<span style="color: #0086f6;">${stations[1]}站</span>到<span style="color: #0086f6;">${stations[2]}站</span>中转，换乘时间${costTime}`,
                    },
                });
                return;
            }

            // 跨站使用 SegmentationCross 字段
            const {
                originalDepartStation,
                originalDepartTime, // 原站出发时间(yyyyMMddHHmmss)（前跨才会有值）
                originalArriveStation,
                originalArriveTime,
                crossType, // 1=前跨，2=后跨
                crossOffset, // 跨站偏移量（正数多跨）
            } = JSON.parse(isCross);

            let timeInfo = null;
            let diff = null;

            if (crossType === 1) {
                timeInfo = this.formatLongDate(originalDepartTime);
                diff = Math.abs(
                    new Date(
                        timeInfo.date.split(" ")[0].replace(/-/g, "/")
                    ).getTime() -
                        new Date(
                            ticketInfo[0].ArriveDate.replace(/-/g, "/")
                        ).getTime()
                );
            } else {
                timeInfo = this.formatLongDate(originalArriveTime);
                diff = Math.abs(
                    new Date(
                        timeInfo.date.split(" ")[0].replace(/-/g, "/")
                    ).getTime() -
                        new Date(
                            ticketInfo[0].DepartDate.replace(/-/g, "/")
                        ).getTime()
                );
            }
            const timeText =
                diff >= DAY
                    ? `${timeInfo.dateStr}${timeInfo.timeStr}`
                    : timeInfo.timeStr;
            const tit = `请于<span>${timeText}</span>，在<span style="color: #0086f6;">${
                crossType === 1 ? originalDepartStation : originalArriveStation
            }</span>${crossType === 1 ? "上车" : "下车"}`;
            const stations =
                crossType === 1
                    ? [fDepart, originalDepartStation, fArrive, sArrive]
                    : [fDepart, fArrive, originalArriveStation, sArrive];

            this.setData({
                tripAxis: {
                    tit,
                    isCross,
                    stations,
                    crossType,
                    isSameTrain,
                    isSameStation,
                    crossOffset,
                },
            });
        },
        formatLongDate(date = "") {
            // 转化 yyyyMMddHHmmss
            const _date = date.replace(
                /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g,
                "$1-$2-$3 $4:$5:$6"
            );

            return {
                date: _date,
                dateStr: new cDate(_date).format("m月d日"),
                timeStr: new cDate(_date).format("H:i"),
            };
        },
        // 顶部通知信息 - 关怀金
        formatTopMessage(orderInfo) {
            const cardType = orderInfo.ShowCardList.find(
                (c) => c.CardType === 17
            );
            const orderMessageInfo =
                this.data.extendValues?.GrabTicketSegmentation
                    ?.orderMessageInfo;

            // 关怀金
            if (cardType && orderMessageInfo) {
                this.setData({ orderMessageInfo });
            }
        },
        // 经停信息
        goTicketTT(e) {
            const type = e.currentTarget.dataset.type;
            const info = this.data.intelligentInfo?.[type];

            !!info && util.goTimeTable(info, this);
        },
        // 出票失败 去抢票
        onClickGoGrabPage(e) {
            const type = e.currentTarget.dataset.type;
            const info = this.data.intelligentInfo?.[type];
            const outParams = {
                dStation: info.DepartStation,
                aStation: info.ArriveStation,
                dDate: cDate.parse(info.DepartDate).format("Y-m-d"),
                trainName: info.TrainNumber,
                seat: info.SeatName,
                isgd: "",
                stu: "",
            };
            const url = `/pages/trainBooking/booking/grab/index?${util.outparamsToString(
                outParams
            )}`;

            cwx.navigateTo({ url });
        },
        // 车次号变更提示
        onClickCheciTip() {
            const m =
                this.data.extendValues?.GrabTicketSegmentation.alertInfo
                    ?.content;

            util.showModal({
                m,
                title: "车次号变更",
                confirmText: "知道了",
            });
        },
    },
};
