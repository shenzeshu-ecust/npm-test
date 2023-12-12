Component({
	externalClasses: ['title-class', 'confirm-btn-class', 'cancel-btn-class'],
	properties: {
		isShow: {
			type: Boolean,
			value: false,
		},
		bodyTitle: {
			type: String,
			value: '',
		},
		bodyContent: {
			type: String,
			value: '',
		},
		content: {
			type: String,
			value: '',
		},
		confirmText: {
			type: String,
			value: '确定',
		},
		//控制蒙层动画
		duration: {
			type: Number,
			value: 150,
		},
		//控制弹窗动画
		isModalAnimate: {
			type: Boolean,
			value: true,
		},
		//控制弹窗动画
		animateObj: {
			type: Object,
			value: {
				name: 'modalExpand',
				duration: 200,
				timingFunction: 'ease',
			}
		},
		cancelText: {
			type: String,
			value: '取消',
		},
		cancelBtnHide: {
			type: Boolean,
			value: false,
		},
		confirmBtnHide: {
			type: Boolean,
			value: false,
		},
		confirmCloseBtn: {
			type: Boolean,
			value: false,
		},
		cancelCloseBtn: {
			type: Boolean,
			value: false,
		},
		width: {
			type: String,
			value: '562rpx',
		},
		//点击蒙层是否关闭
		closeOnClickMask: {
			type: Boolean,
			value: true,
		},
		//按钮上下或左右
		btnCol: {
			type: Boolean,
			value: false,
		},
		closeIconType: {
			type: String,
			value: '',  //wechat-font-close3 or wechat-font-close2 wechat-font-close 
		},
		confirmBtnOpenType: String,
	},
	data: {
		animateStyle: '',
	},
	lifetimes: {
		attached() {
			const { animateObj } = this.data;
			this.setData({
				animateStyle: this.data.isModalAnimate ? `animation: ${animateObj?.name} ${animateObj?.duration}ms ${animateObj?.timingFunction} both;` : '',
			})
		}
	},
	methods: {
		closeModal() {
			this.setData({
				isShow: false,
			})
			this.triggerEvent('close');
		},
		onClickMask: function () {
            this.triggerEvent('click-mask');
            if (this.data.closeOnClickMask) {
                this.closeModal();
            }
        },
		onConfirm() {
			if (this.data.confirmCloseBtn) {
				this.closeModal();
			}
			this.triggerEvent('confirm');
		},
		onCancel() {
			if (this.data.cancelCloseBtn) {
				this.closeModal();
			}
			this.triggerEvent('cancel');
		},
	},
});
