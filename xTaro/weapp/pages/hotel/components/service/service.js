const IMG_NAME = {
    domestic: 'service-domestic-v2.png',
    oversea: 'service-overseas-v2.png',
    detail: 'service-domestic-detail.png'
};

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isOversea: {
            type: Boolean,
            observer: 'typeChange'
        },
        pageName: String
    },
    externalClasses: ['warp-class'],
    /**
     * 组件的初始数据
     */
    data: {
        oversea: false,
        showLayer: false,
        name: IMG_NAME.domestic
    },
    attached () {
        this.typeChange();
    },
    /**
     * 组件的方法列表
     */
    methods: {
        typeChange (isOversea) {
            let type = 'domestic';
            const { pageName } = this.data;
            if (isOversea) {
                type = 'oversea';
            } else if (pageName === 'detail') {
                type = 'detail';
            } else {
                type = 'domestic';
            }
            this.setData({ name: IMG_NAME[type] });
        },
        showDetail () {
            this.setData({ showLayer: !this.data.showLayer });
        }
    }
});
