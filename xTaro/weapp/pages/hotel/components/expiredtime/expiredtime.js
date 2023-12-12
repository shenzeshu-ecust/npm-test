Component({
    properties: {
        expiredTime: {
            type: String,
            value: ''
        }
    },
    data: {
        expiredHours: '',
        expiredMinutes: '',
        expiredSeconds: ''
    },
    attached () {
        this.time = this.data.expiredTime;
        const { hours, minutes, seconds } = this.getFormatTime();
        this.updateData(hours, minutes, seconds);
        this.interval = setInterval(() => this.countDown(), 1000);
    },
    detached () {
        clearInterval(this.interval);
    },
    methods: {
        countDown () {
            const newTime = this.time - 1000;
            if (newTime >= 0) {
                this.time = newTime;
                const { hours, minutes, seconds } = this.getFormatTime();
                this.updateData(hours, minutes, seconds);
            } else {
                clearInterval(this.interval);
                this.triggerEvent('closeNewerCouponShow');
            }
        },
        getFormatTime () {
            const hours = Math.floor(this.time / 3600000);
            const minutes = Math.floor((this.time % 3600000) / 60000);
            const seconds = Math.floor((this.time % 60000) / 1000);
            return { hours, minutes, seconds };
        },
        updateData (hours, minutes, seconds) {
            this.setData({
                expiredHours: hours < 10 ? '0' + hours.toString() : hours.toString(),
                expiredMinutes: minutes < 10 ? '0' + minutes.toString() : minutes.toString(),
                expiredSeconds: seconds < 10 ? '0' + seconds.toString() : seconds.toString()
            });
        }
    }
});
