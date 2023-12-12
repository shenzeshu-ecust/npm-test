import { cwx, CPage, _ } from "../../../../cwx/cwx.js";
import commonrest from '../../common/commonrest'

Component({
	properties: {
		/**
         * 数据结构如下：
         mediaList: {
            pictureType: 1  // 1: 视频 2: 图片
            pictureUrl: https://pages.c-ctrip.com/hotels/wechat/img/activity-bg-guest.png
            jumpUrl: "",
            videoText: "",
            width: "",
            height: ""
         }
         */
		mediaList: {
			type: Array,
			value: [],
		},
		title: {
			type: String,
			value: "",
		},
		content: {
			type: String,
			value: "",
		},
		authorInfo: {
			type: Object,
			value: {},
		},
		show: {
			type: Boolean,
			value: false,
		},
	},
	data: {
		currentPage: 1,
	},
	lifetimes: {},
	methods: {
		handleSwipe: function (e) {
			this.setData({
				currentPage: e.detail.current + 1,
			});
		},
		handleCloseSwiper: function () {
			this.setData({
				currentPage: 1,
			});
			this.triggerEvent("onCloseMediaPreviewer");
		},
	},
});
