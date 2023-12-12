Component({
	properties: {
		countdown: {
			type: Number,
		},
		assistStatus: {
			type: Number,
		},
		color: {
			type: String,
			value: '#fff'
		}
	},
	data: {
		clock: "",
	},
	ready() {
		this.stopCountDown();
		const { assistStatus, countdown } = this.data;
		let clock = "";
		if (assistStatus === 1 && countdown > 0) {
			clock = this.date_format(countdown);
		} else if (assistStatus === 2) {
			this.setData({
				clock: "活动已终止",
			});
			return;
		} else if (
			countdown <= 0 ||
			assistStatus === 3 ||
			assistStatus === 4 ||
			assistStatus === 5
		) {
			this.setData({
				clock: "活动已结束",
			});
			return;
		}
		// 在组件实例进入页面节点树时执行
		const countingDown = () => {
			this.countingDown();
			if (this.data.countdown === 0) {
				this.triggerEvent("updateCountDown", this.data.countdown);
				this.stopCountDown();
			}
		};
		if (countdown > 0) {
			this.timer = setInterval(countingDown, 1000);
		}
	},
	detached() {
		// 在组件实例被从页面节点树移除时执行
		this.stopCountDown();
	},

	methods: {
		countingDown() {
			const countdown = this.data.countdown - 1;
			this.setData({
				countdown: countdown,
				clock:
					countdown > 0 ? this.date_format(countdown) : "活动已结束",
			});
			if (countdown === 0) {
				this.triggerEvent("initpage");
				this.stopCountDown();
			}
		},

		date_format(clock) {
			const hour = this.simpleFormat(Math.floor(clock / 3600));
			const min = this.simpleFormat(Math.floor((clock % 3600) / 60));
			const second = this.simpleFormat(Math.floor(clock % 60));
			return `${hour}:${min}:${second} 后结束`;
		},

		simpleFormat(val) {
			return val >= 10 ? val : "0" + val;
		},
		stopCountDown() {
			clearInterval(this.timer);
		},
	},
});
