Component({
    properties: {
        passengerList: {
            type: Array,
            value: [],
            observer: function (newVal, oldVal) {
                this.setData({
                    passList: newVal,
                });
            },
        },
        showOcr: {
            type: Boolean,
            value: false,
        },
        maxSelect: {
            type: Number,
            value: 5,
        },
        showType: {
            type: String,
            value: false,
            observer: function (newVal, oldVal) {
                // this.setData({
                //     passList: newVal,
                // });
                console.log('showType--', newVal);
                this.setData({
                    active: newVal ? true : false,
                });
            },
        },
        isIphoneX: Boolean,
        classConfig: Object,
        colorConfig: Object,
    },
    data: {
        active: false,
        passList: [],
        navbarData: {
            showBack: true,
            showCapsule: false,
            customBack: true,
            title: '选择乘客',
        },
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {},
        moved: function () {},
        detached: function () {},
    },
    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {},
        hide: function () {},
        resize: function () {},
    },
    methods: {
        onBack(e) {
            this.setData({
                active: false,
            });
            this.triggerEvent('cancel');
        },
        cancelPasChoose() {
            this.setData({
                active: false,
            });
            this.triggerEvent('cancel');
        },
        confirmPasChoose() {
            this.setData({
                active: false,
            });
            this.triggerEvent('confirm');
        },
        onOcr(e) {
            this.triggerEvent('add', {
                showOcr: true
            });
        },
        addNewPas(showOcr) {
            this.triggerEvent('add', { showOcr: false});
        },
        editPas(e) {
            let idx = e.currentTarget.dataset.index;
            let pas = this.data.passList[idx];
            this.triggerEvent('edit', { pas });
        },
        choosePas(e) {
            let idx = e.currentTarget.dataset.index;
            let pas = this.data.passList[idx];
            this.triggerEvent('choose', { pas });
        },
    },
});
