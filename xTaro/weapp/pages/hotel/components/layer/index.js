import { cwx } from '../../../../cwx/cwx';
Component({
    externalClasses: ['book-notice-icon', 'content-pt0'],
    options: {
        multipleSlots: true
    },
    properties: {
        // 是否展示关闭按钮，默认为true
        showClose: {
            type: Boolean,
            value: true
        },
        // 是否需要高斯模糊mask浮层
        needBlurredMask: {
            type: Boolean
        },
        // 头部是否需要阴影
        needHeadShadow: {
            type: Boolean
        },
        // 主标题
        title: {
            type: String,
            value: ''
        },
        // 主标题前的icon
        titleIconClass: {
            type: String
        },
        // 标题是否使用slot
        useTitleSlot: {
            type: Boolean
        },
        // 副标题
        subTitle: {
            type: String,
            value: ''
        },
        // 主按钮名称
        confirmButtonText: {
            type: String,
            value: ''
        },
        // 主按钮是否禁用
        confirmDisabled: {
            type: Boolean,
            observer: 'onConfirmChange'
        },
        // 次要按钮名称
        cancelButtonText: {
            type: String,
            value: ''
        },
        // 右上角按钮名称
        topButtonText: {
            type: String
        },
        // 浮层样式
        layerStyle: {
            type: String
        },
        // 头部样式
        headStyle: {
            type: String
        },
        // 内容样式
        contentStyle: {
            type: String
        },
        // 蒙层的z-index，部分浮层需要
        maskZIndex: {
            type: Number
        },
        // 是否限制浮层的最小高度
        limitMinHeight: {
            type: Boolean,
            value: true
        },
        exposeData: {
            type: Object
        }
    },
    attached: function () {
        cwx.sendUbtExpose.observe(this); // 在 attached 中绑定监听器
    },
    data: {
    },
    methods: {
        closeLayer () {
            this.triggerEvent('closeLayer');
        },
        handleCancel () {
            this.triggerEvent('cancel');
        },
        handleConfirm () {
            const confirmDisabled = this.data.confirmDisabled;
            if (confirmDisabled) return;
            this.triggerEvent('confirm');
        }
    }
});
