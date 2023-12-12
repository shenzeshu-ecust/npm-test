Component({
	properties:{
		expireCouponDate: {
			type: Object,
			observer: function(expireCouponDate) {
				console.log('expireCouponDate.deductionAmount', expireCouponDate.deductionAmount)
				this.setData({
					price: expireCouponDate.deductionAmount,
				})
				this.renderInterval(true)
			}
		}
	},
	data:{
		expireCouponDate: {},
		interval: {},
		price: ''
	},
	methods:{
		calculateTime(date) {
			const seconds = date; // 计算时间差,并把毫秒转换成秒
			const h = Math.floor(seconds / 3600) < 10 ? `0${Math.floor(seconds / 3600)}` : Math.floor(seconds / 3600);
			const m = Math.floor((seconds / 60 % 60)) < 10 ? `0${Math.floor((seconds / 60 % 60))}` : Math.floor((seconds / 60 % 60));
			const s = Math.floor((seconds % 60)) < 10 ? `0${Math.floor((seconds % 60))}` : Math.floor((seconds % 60));
			return { interval:{ h, m, s }, seconds };
		},
		renderInterval(start) {
			let { expireTime: endDateTime = 86400} = this.data.expireCouponDate;
			this.interval && clearInterval(this.interval);
			this.interval = null;
			// 解决卡顿问题，页面appear时先执行一次
			if (start) {
				const initTimeObj = this.calculateTime(endDateTime);
				if(initTimeObj.seconds < 1) {
					this.setData({
						expireCouponDate: {}
					})
				} else {
					this.setData({ interval:initTimeObj.interval, seconds:initTimeObj.seconds });
				}
			}
			if (endDateTime && start) {
				this.interval = setInterval(() => {
					endDateTime -= 1;
					const timeObj = this.calculateTime(endDateTime);
					// console.log('timeObj', timeObj)
					if (timeObj.seconds < 1) {
						this.setData({
							interval: {}
						});
						this.interval = null;
					}
					this.setData({ interval:timeObj.interval, seconds:timeObj.seconds });
				}, 1000);
			}
		},
	}
});
