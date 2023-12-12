import { cwx } from '../../../../cwx/cwx.js';
import barginRest from './barginbannerrest';
import util from '../../common/utils/util';
import components from '../components';
import config from '../../market/cutprice/cutpriceconfig';
import wechatMarket from '../../common/market/wechatMarket.js';

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        orderId: {
            type: String,
            value: '',
            observer: 'onPropsChanged'
        },
        masterHotelId: {
            type: String,
            value: '',
            observer: 'onPropsChanged'
        },
        orderStatus: {
            type: String,
            value: '',
            observer: 'onPropsChanged'
        },
        updateNum: {
            type: Number,
            value: 0,
            observer: 'onPropsChanged'
        },
        miniCut: {
            type: String,
            value: '',
            observer: 'onPropsChanged'
        },
        cutpricePage: {
            type: String,
            value: '',
            observer: 'onPropsChanged'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        bargain: {},
        showBlock: false
    },

    attached () {},

    detached () {
        this.stopCountDown();
    },

    /**
     * 组件的方法列表
     */
    methods: {
        getBargainInfo () {
            barginRest.doRequest({
                orderId: this.data.orderId,
                masterHotelId: this.data.masterHotelId,
                orderStatus: this.data.orderStatus
            }, (res) => {
                this.setData(res);

                if (res.status === 2) {
                    this.stopCountDown();
                    this.startCountDown();
                }
            });
        },

        onPropsChanged (newVal, oldVal) {
            const { orderId, masterHotelId, orderStatus, miniCut } = this.data;

            if (!util.isEmpty(orderId) && !util.isEmpty(masterHotelId) && !util.isEmpty(orderStatus) && !util.isEmpty(miniCut)) {
                clearTimeout(this.modelTimer);
                this.modelTimer = setTimeout(this.getBargainInfo.bind(this), 0);
            }
        },

        startCountDown () {
            let remainSeconds = this.data.bargain.remainSeconds;
            const secondsCountDown = () => {
                remainSeconds--;
                const h = Math.floor(remainSeconds / 3600) < 10 ? '0' + Math.floor(remainSeconds / 3600) : Math.floor(remainSeconds / 3600);
                const m = Math.floor((remainSeconds / 60 % 60)) < 10 ? '0' + Math.floor((remainSeconds / 60 % 60)) : Math.floor((remainSeconds / 60 % 60));
                const s = Math.floor((remainSeconds % 60)) < 10 ? '0' + Math.floor((remainSeconds % 60)) : Math.floor((remainSeconds % 60));
                this.setData({
                    countdown: {
                        hh: h,
                        mm: m,
                        ss: s
                    }
                });
            };

            this.timer = setInterval(secondsCountDown, 1000);
            secondsCountDown();
        },

        stopCountDown () {
            clearInterval(this.timer);
        },

        submitFromId (e) {
            // 保存formid
            const { orderId } = this.data;
            const formid = e.detail.formId;
            wechatMarket.wechatSendSmsAfterSixDays({
                formid,
                oid: orderId
            });
        },

        goToJoin (e) {
            const { orderId, cutpricePage } = this.data;
            const { nickName, avatarUrl } = JSON.parse(e.detail.rawData);
            if (this.data.miniCut !== 'true') {
                components.webview({
                    url: `https://${config.host}/webapp/hotel/wechatlab/cutprice/?orderId=${orderId}&nickName=${encodeURIComponent(nickName)}&avatar=${encodeURIComponent(encodeURIComponent(encodeURIComponent(avatarUrl)))}`,
                    needLogin: true
                });
            } else {
                cwx.navigateTo({
                    url: `/pages/hotelplanning/market/${cutpricePage}/index?orderId=${orderId}&nickName=${encodeURIComponent(nickName)}&avatar=${encodeURIComponent(avatarUrl)}`
                });
            }
        }
    }
});
