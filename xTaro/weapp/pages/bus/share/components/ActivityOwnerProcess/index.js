import { countDown, preFixInterge } from '../../shareUtils';
Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        activity: {
            type: Object,
            value: {},
        },
        avatarArray: {
            type: Array,
            value: [],
        },
        endDateTime: {
            type: String,
            value: '',
            observer: function (newVal, oldValue, changePath) {
                this.setData(
                    {
                        endDateTime: newVal,
                    },
                    () => {
                        this.startCountDown();
                    }
                );
            },
        },
    },
    data: {
        hours: 0,
        minutes: 0,
        seconds: 0,
        validActivity: false,
    },

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            console.log('attached');
        },
        detached: function () {
            console.log('detached');
            this.endCountDown();
        },
    },
    methods: {
        goOrder: function (e) {
            this.triggerEvent('order')
        },
        beforeSubscribe: function (e) {
            this.triggerEvent('subscribe');
        },
        cashAction: function () {
            this.triggerEvent('cash');
        },
        goAction: function () {
            this.triggerEvent('go');
        },
        activityAction: function () {
            this.triggerEvent('action');
        },
        endCountDown: function () {
            if (this.countDownTimer) {
                clearInterval(this.countDownTimer);
                this.countDownTimer = null;
            }
        },
        startCountDown: function () {
            this.endCountDown();
            if (this.properties.activity.status !== 1) return;

            let countBlock = () => {
                let date = this.properties.endDateTime;
                let { hours, minutes, seconds } = countDown(date);

                if (hours >= 0 && minutes >= 0 && seconds >= 0) {
                    this.setData({
                        validActivity: true,
                        hours: preFixInterge(hours, 2),
                        minutes: preFixInterge(minutes, 2),
                        seconds: preFixInterge(seconds, 2),
                    });
                } else {
                    this.setData({
                        validActivity: false,
                    });
                    this.endCountDown();
                }
                return countBlock;
            };

            this.countDownTimer = setInterval(countBlock(), 1000);
        },
    },
});
