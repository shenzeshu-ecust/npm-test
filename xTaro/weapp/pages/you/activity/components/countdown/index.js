Component({
	properties: {
		countdowns: {
			type: Number,
			observer:function(newVal,oldVal,changedPath){
				if(newVal !=oldVal){
					this.setData({
						countdown: newVal
					})
				}	
			}
		},
	},
	data: {
		countdown:'',
		hour:'',
		min:'',
		second:'',
	},
	// 监听properties中的arrayIndex属性
	observers: {
		'countdowns': function (val) {
			console.log('countdowns------------------',val);
			if(val==null) return;
			this.setData({
				countdown:val
			},()=>{
				const self = this;
				self.stopCountDown();
				const {countdown } = self.data;
				// 在组件实例进入页面节点树时执行
				const countingDown = () => {
					self.countingDown();
					if (self.data.countdown === 0) {
						self.triggerEvent('myevent')
						self.stopCountDown();
					}
				};
				if (countdown > 0) {
					self.timer = setInterval(countingDown, 1000);
				}
			})
		},
	  },
	ready() {
		this.stopCountDown();
		const {countdown } = this.data;
		// 在组件实例进入页面节点树时执行
		const countingDown = () => {
			this.countingDown();
			if (this.data.countdown === 0) {
				this.triggerEvent('myevent')
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
			const countdown = this.data.countdown - 1000;
			this.setData({
				countdown: countdown,
				hour:countdown > 0 ? this.date_format_hour(countdown):"00",
				min:countdown > 0 ? this.date_format_min(countdown):"00",
				second:countdown > 0 ? this.date_format_second(countdown):"00",
			});
			if (countdown === 0) {
				this.triggerEvent("initpage");
				this.stopCountDown();
			}
		},

		date_format_hour(clock) {
			const hour = this.simpleFormat(parseInt((clock % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
			return hour;
		},

		date_format_min(clock) {
			const min = this.simpleFormat(parseInt((clock % (1000 * 60 * 60)) / (1000 * 60)));
			return min;
		},

		date_format_second(clock) {
			const second = this.simpleFormat(parseInt(clock % (1000 * 60) / 1000));
			return second;
		},

		simpleFormat(val) {
			return val >= 10 ? val : "0" + val;
		},
		stopCountDown() {
			clearInterval(this.timer);
		},
	},
});
