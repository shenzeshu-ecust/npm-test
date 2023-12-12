import C from '../../common/Const.js'

const pageStatus = {
    imgSwitching: false,
};
const defaultData = {
    currentImageIndex: 0,
    showGiftDesc: false,
    showMoreFacility: false,
    showHourDescInfo: false,
    suiteImgIndex: { // 套餐图片当前索引，2-食，3-享
        2: {},
        3: {}
    },
    hiddenMoreInfo: { // 套餐特别补充文案隐藏，2-食，3-享
        2: {},
        3: {}
    }
};

Component({
    properties: {
        isShown: {
            type: Boolean,
            value: false,
        },
        subRoom: {
            type: Object,
            value: {},
        },
        room: {
            type: Object,
            value: {},
        },
        isIphoneX: {
            type: Boolean,
            value: false,
        },
        totalDays: {
            type: Number,
            value: 1,
            observer: 'onChangeTotalDays'
        },
        priceId: {
            type: String,
            value: ''
        },
        isQuickApp: {
            type: Boolean,
            value: false
        },
        from: {
            type: String,
            value: ''
        }
    },
    data: {
        ...defaultData
    },
    attached () {
        // showPriceDetail初始化
        this.onChangeTotalDays();
    },
    methods: {
        closeRoomLayer(e) {
            this.setData({
                priceId: '',
                ...defaultData,
            });
            this.triggerEvent('hiddenLayer');
        },
        roomImgSwiperChange(e) {
            const current = e.detail.current;
            let { type = '', suitetype, index } = e.currentTarget?.dataset || {};

            // 滑块切换加延迟，避免滑动过快导致组件崩溃
            if (!pageStatus.imgSwitching) {
                pageStatus.imgSwitching = true;
                if (type === 'live') {
                    this.setData({
                        currentImageIndex: current
                    })
                } else {
                    this.setData({
                        [`suiteImgIndex.${suitetype}.${index}`]: current
                    });
                }
                pageStatus.subRoomSwiperTimeOut = setTimeout(() => {
                    pageStatus.imgSwitching = false;
                }, 100);
            }
        },
        toggleGiftDesc(e) {
            this.setData({
                showGiftDesc: !this.data.showGiftDesc
            });
        },
        toggleMoreFacility(e) {
            this.setData({
                showMoreFacility: !this.data.showMoreFacility
            });
        },
        toggleMoreSuite(e) {
            const { index, type } = e.currentTarget?.dataset || {};
            if (!type || index === undefined) return;
            const currentStatus = !!this.data.hiddenMoreInfo[type][index];
            this.setData({
                [`hiddenMoreInfo.${type}.${index}`]: !currentStatus
            });
        },
        toggleHourDescInfo() {
            this.setData({
                showHourDescInfo: !this.data.showHourDescInfo
            });
        },
        onChangeTotalDays() {
            const { subRoom, from, totalDays } = this.data;

            this.setData({
                showPriceDetail: totalDays > C.LONE_RENT_LIMIT_DAY
                    ? false
                    : subRoom?.priceCalcItems?.length || from === 'detail',
            });
        },
        noImageTrace(e) {
            let errMsg = e?.detail?.errMsg || '';
            this.triggerEvent('noImageTrace', { errMsg, type: '房型浮层' });
        },
    },
    detached: function() {
        pageStatus.subRoomSwiperTimeOut && clearTimeout(pageStatus.subRoomSwiperTimeOut);
    },
});