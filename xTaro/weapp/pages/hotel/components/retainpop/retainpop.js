import { cwx } from './../../../../cwx/cwx.js';

// 挽留弹窗类型
const RETAIN_POP_MAP = {
    memberLevel: '11', // 会员权益
    freeCancel: '1', // 免费取消
    // multiPoint: '16', // 多倍积分
};

// 挽留弹窗点击类型
const RETAIN_POP_CLICK_MAP= {
    confirmAndLeave: 1, // 确定：放弃预订且离开填写页
    cancelAndStay: 2 // 取消：继续预订且留在填写页
};

Component({
    data: {
        type: '',
        isMemberLevel: false, // 弹窗类型是会员权益
        isFreeCancel: false, // 弹窗类型是免费取消
        isShowBkg: false // 是否显示背景图
    },
    properties: {
        // 是否需要高斯模糊mask浮层
        needBlurredMask: {
            type: Boolean
        },
        // 弹窗类型
        type: {
            type: String,
            value: ''
        },
        // 主标题
        title: {
            type: Array
        },
        // 副标题
        subDesc: {
            type: Object
        },
        // 挽留内容
        content: {
            type: Object,
            value: ''
        },
        // 气泡文案
        bubble: {
            type: String,
            value: ''
        },
        // 按钮样式
        leftBtnStyle: {
            type: Object,
            value: {
                color: '#0066F6',
                borderColor: '#257CF5'
            }
        },
        rightBtnStyle: {
            type: Object,
            value: {
                color: 'fff',
                bkgColor: '#0066F6',
                bkg: ''
            }
        },
        // 背景图片
        bkgUrl: {
            type: String,
            value: ''
        },
        // 挽留弹窗曝光埋点
        retainPopExposeObj: {
            type: Object,
            value: {}
        }
    },
    attached () {
        cwx.sendUbtExpose.observe(this);
    },
    ready () {
        /**
         * 目前,挽留弹窗类型可归结为三类:(1)type=11会员权益; (2)type=1免费取消; (3)其他类型
         * 需要注意的是: 会员权益和免费取消会下发背景图(会员权益是整张背景图,免费取消背景图只有头部),其他类型没有背景图
         * 所以在做样式处理的时候需要对这三种type分别制定相应的样式类型:会员权益isMemberLevel,免费取消isFreeCancel
         * 为了避免后续集成增加其他含背景图的弹窗类型影响整体style,增加isShowBkg标识只有会员权益和免费取消弹窗的时候才展示背景图
        */
        const { type } = this.properties;
        switch (type) {
            case RETAIN_POP_MAP.memberLevel: // 会员权益
                this.setData({ isMemberLevel: true, isShowBkg: true });
                break;
            case RETAIN_POP_MAP.freeCancel: // 免费取消
                this.setData({ isFreeCancel: true, isShowBkg: true });
                break;
            default:
                break;
        }
    },
    methods: {
        // 取消-继续预订-留下clickType 2
        handleCancel () {
            this.triggerEvent('cancel', { clickType: RETAIN_POP_CLICK_MAP.cancelAndStay });
        },
        // 确定-放弃预订-离开clickType 1
        handleConfirm () {
            this.triggerEvent('confirm', { clickType: RETAIN_POP_CLICK_MAP.confirmAndLeave });
        }
    }
});
