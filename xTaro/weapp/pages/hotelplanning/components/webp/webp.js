Component({
	/**
	 * 组件的初始数据
	 */
	data: {
		isSupportWebp: false,
	},

	ready: function () {},
	methods: {
		imageSuccess: function (e) {
			this.setData({
				isSupportWebp: true,
			});

			this.triggerEvent("pageImageSuccess", {
				isSupportWebp: true,
			});
		},
	},
});
