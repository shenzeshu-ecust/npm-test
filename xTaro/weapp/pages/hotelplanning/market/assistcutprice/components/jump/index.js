const { default: cwx } = require("../../../../../../cwx/cwx");

// pages/hotelplanning/market/assistcutprice/components/goto/index.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		jumpLink: {
			type: Array,
		},
		isSponsor: Boolean,
	},

	/**
	 * 组件的初始数据
	 */
	data: {},

	/**
	 * 组件的方法列表
	 */
	methods: {
		handleJump: function (e) {
			const { wxjumpurl, h5jumpurl, text } = e.currentTarget.dataset;

			this.logWithUbtTrace('212545',{
				page: '10650010043',
				content: '社群',
				host_guest: this.data.isSponsor ? "1" : "2",
			  })

			if (wxjumpurl) {
				cwx.navigateTo({
					url: wxjumpurl,
				});
				return;
			}
			if (h5jumpurl) {
				cwx.navigateTo({
					url:
						"/pages/hotel/components/webview/webview?data=" +
						JSON.stringify({
							url: encodeURIComponent(h5jumpurl),
						}),
				});
			}
		},
		logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},
	},
});
