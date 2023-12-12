import {
    cwx,
} from '../../../../../cwx/cwx.js';

Component({
    properties: {
        itemData: {
            type: Object,
            value: null
        }
    },
    data: {
        marginLeft:24,
        marginRight:24
    },
    methods: {
        share() {
        },

        onSettingDate (e) {
            let card = e.currentTarget.dataset.cardmodel;
            let currentPage = cwx.getCurrentPage();
            let localThis = this;
            currentPage.navigateTo({
                url: '../../pages/calendar/calendar',
                data: {
                    isSingleSelect: true,
                    title: "选择日期",
                    inDayToast: '请选择出发日期',
                },
                callback: function (e) {
                    let date = e.inDay;
                    localThis.triggerEvent('CardSetDate', {
                        event: e,
                        card: card,
                        date: date
                    }, { bubbles: true, composed: true });
                }
            });
        },
        deleteCard:function (e) {
            let card = e.currentTarget.dataset.cardmodel;
            this.triggerEvent('CardDelete', {
                event: e,
                card: card
            }, { bubbles: true, composed: true });
        },
        goToDetails: function (e) {
            cwx.navigateTo({
                url: '/pages/schedule/pages/cardShare/travelplanShare/travelplanShare?travelStatus=1&travelPlanId=' + e.currentTarget.dataset.cardmodel.travelPlanId + '&source=WxXcx',
            })
        },
    }
});
