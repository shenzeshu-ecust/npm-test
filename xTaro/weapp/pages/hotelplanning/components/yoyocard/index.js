import { cwx } from "../../../../cwx/cwx";
import Api from "../../common/apis/restapi";
import DateUtil from '../../common/utils/date.js';

const util = require("../../common/utils/util");
const huser = require("../../common/hpage/huser");

const UNIONVIP_PENDING = 'pendingVip'
const UNIONVIP_FETCHED = 'unionVip'

Component({
    properties: {
        allianceid: String,
        sid: String,
        hotelId: String,
        unionVipType: String,
        unionVipFunc: Object,
        source: String,
        autoGetVipCard: Boolean,
        isShowVipCardToast: { // 是否展示领卡弹窗
            type: Boolean,
            value: true
        }, 
    },
    data: {
        showGetVipCardModal: false, // 领卡成功后弹出的提示框
        vipcardToastMsg: "", // 领卡成功提示
        couponsReceivedAfterGetCard: {
            couponInfoList: [],
            popupDesc: '扫码专属福利'
        }, // 领卡成功后 展示权益券列表
        showVipLayer: false,
        isOrderCode: false, //是否是新版前台码或者员工码
    },
    ready: function(){
        this.pageStatus = {}

        const { unionVipType, autoGetVipCard } = this.data
        
        if (unionVipType === UNIONVIP_PENDING && autoGetVipCard) {
            this.handleGetVip(true, true, false);
        }
        // 判断新版前台码和员工码
        const {source = ""} = this.data
        if(source === "front-desk" || source === "employee") {
            this.setData({
                isOrderCode: true
            })
        }
    },
    pageLifetimes: {
        show: function() {
            if (this.data.unionVipType === UNIONVIP_PENDING && this.data.autoGetVipCard) {
                this.handleGetVip(true, true, false);
            }
        },
    },
    methods: {
        handleGetVip: function (
            traceExposeFlag = false,
            traceAuthFlag = false,
            isManualLocation = false
        ) {
              huser
                .checkLoginStatus(true)
                .then(isLogin => {
                    if (isLogin) {
                        this.fetchVipCard()
                    }
                })

              return
        },
        fetchVipCard: function (location) {
            Api.getVipCard({
                hotelid: this.data.hotelId,
                lat: location?.lat || 0,
                lng: location?.lng || 0,
                sid: this.data.sid ? this.data.sid.toString() : "",
                aid: this.data.allianceid ? this.data.allianceid.toString() : "",
                newCoupon: true,
                sceneId: cwx?.scene || 0
            }).then((res) => {
                const { message, retCode, coupons } = res || {}
                if (retCode === 0 || retCode === 2) {
                    this.triggerEvent('onGetVipCardSuccess')
                    this.closeVipLayer()
                    if (retCode === 2) {
                        cwx.showToast({ title: message, icon: "none" });
                    } else {
                        let couponsReceivedAfterGetCard = coupons || {};
                        let is_85discount_show = 0,
                            is_coupon_card_show = 0;

                        if (couponsReceivedAfterGetCard.couponInfoList) {
                            // 85折+优惠券最多展示两个
                            const couponInfoList = couponsReceivedAfterGetCard.couponInfoList;
                            const discountItem = couponInfoList.filter(item => item.isDiscount);
                            const couponItem = couponInfoList.filter(item => !item.isDiscount);
                            is_85discount_show = discountItem.length === 0 ? 0 : 1;
                            is_coupon_card_show = couponItem.length === 0 ? 0 : 1;
                        }

                        this.logWithUbtTrace("184587", {
                            is_85discount_show,
                            is_coupon_card_show,
                            is_hotel_interest_card_show: 1
                        });
                        this.setData({
                            vipcardToastMsg: res.message,
                            couponsReceivedAfterGetCard:
                                couponsReceivedAfterGetCard || {},
                            unionVipType: UNIONVIP_FETCHED
                        });
                        this.showGetVipCardSuccess();
                    }

                    this.triggerEvent('onGetVipCardFinish')
    
                } else if (res.message) {
                    cwx.showToast({ title: res.message, icon: "none" });
                    this.triggerEvent('onGetVipCardFinish')
                } else {
                    util.logException(this, 1, "smzReceiveUnionVip", this.pageId);
                }
            });
        },
    
        showGetVipCardSuccess() {
            // 展示领卡弹窗
            this.setData({
                showGetVipCardModal: this.data.isShowVipCardToast,
            });
        },
    
        closeVipCardModal(e) {
            const dataset = e.currentTarget.dataset;
            this.setData({
                showGetVipCardModal: false,
            });
            this.logWithUbtTrace("184588", {
				clickname: dataset.id,
                sourceFrom: this.data.source,
			});
            this.triggerEvent('onVipCardModalClose')
        },
        noop() {},
        logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},
        setVipLayerShow: function() {
            this.setData({
                showVipLayer: true
            })
        },
        closeVipLayer: function() {
            this.setData({
                showVipLayer: false
            })
        }
    }
});