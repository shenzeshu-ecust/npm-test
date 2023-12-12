import { wxSubscribeMsg } from '../../business/subscribeMsg';

Component({
    properties: {
        templates: {
            type: Array,
            value: []
        },
        state: {
            type: Number, // -1 不展示，0 未订阅，1 已订阅
            value: 0,
            observer: function (newVal, oldVal, changedPath) {
                this.getState(newVal);
            }
        }
    },

    data: {
        disable: false,
        tmpIds: [],
        subscribedList: [],
        notSubscribedList: []
    },

    ready: function () {
        const { templates, state } = this.data;
        if (templates.length <= 0) {
            return;
        }
        this.setData({ disable: true });
        this.data.tmpIds = [templates[0].id];
        this.getState(state);
    },
    methods: {
        getState (state) {
            const { templates } = this.data;
            let subscribedList = [];
            let notSubscribedList = [];

            if (state === 1) {
                subscribedList = templates;
            } else if (state === 0) {
                notSubscribedList = templates;
            }
            this.setData({
                subscribedList,
                notSubscribedList
            });
        },
        async subscribe () {
            const { tmpIds } = this.data;
            let result = null;
            let success = false;
            let accept = false;
            let ban = false;
            const errMsg = '订阅失败';
            try {
                result = await wxSubscribeMsg(tmpIds) || {};
                success = result.success;
                accept = success && result[tmpIds[0]] === result.ACCEPT;
                ban = success && result[tmpIds[0]] === result.BAN;
                if (accept) {
                    this.triggerEvent('subscribeMsg', result);
                }
                if (ban) {
                    success = false;
                }
            } catch (e) {
                // console.log('subscribe-catch', e);
            }
            if (!success) {
                wx.showToast({ title: errMsg, icon: 'none' });
            }
        }
    }
});
