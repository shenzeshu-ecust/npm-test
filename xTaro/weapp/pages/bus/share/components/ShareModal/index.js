import { countDown, preFixInterge } from '../../shareUtils';

Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        data: {
            type: Object,
            value: {},
            observer: function (newVal, oldVal) {
                let backgroundStyleText = 'background-color:#ffffff;';
                if (newVal.backgroundImage) {
                    backgroundStyleText = `background-image:url("${
                        newVal.backgroundImage
                    }");width:${newVal.width};height:${
                        newVal.height
                    };border-radius:${0};padding-top:${newVal.paddingTop || '70rpx'};`;
                }
                this.setData({
                    backgroundStyleText,
                });
            },
        },
    },
    data: {
        backgroundStyleText: 'background-color:#ffffff;',
    },

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            console.log('attached');
        },
        detached: function () {
            console.log('detached');
        },
    },
    methods: {
        closeModal: function () {
            this.triggerEvent('close');
        },
        onShareModalButton: function () {
            this.triggerEvent('modalbutton');
        },
    },
});
