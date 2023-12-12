Component({
	properties: {
		swiperCurrent: {
			type: Number,
			value: 0,
		},
		checkpointList: {
			type: Array,
			value: "",
		},
		assistStatus: {
			type: Number,
			value: 0,
		},
	},
	data: {},
	lifetimes: {},
	methods: {
		handleSwiper: function (e) {
			this.triggerEvent("handleswiper", e.detail);
		},
		onInvite: function (e) {
			this.triggerEvent("oninvite", e);
		},
	},
});
