const util = require("../../../../common/utils/util.js");

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 不显示SUCCESS，加载中LOADING，到底了END, 失败FAILURE
		type: String,
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		loadingState: "SUCCESS", // 不显示SUCCESS，加载中LOADING，到底了END, 失败FAILURE
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		handleRefreshList: function (e) {
			this.triggerEvent("refreshList", e);
		},
	},
	observers: {
		type: function (val) {
			if (!util.isEmpty(val)) {
				this.setData({ loadingState: val });
			} else {
				this.setData({ loadingState: "SUCCESS" });
			}
		},
	},
});
