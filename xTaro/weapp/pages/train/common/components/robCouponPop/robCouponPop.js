import { cwx } from '../../../../../cwx/cwx';

export default {
    data: {},
    methods: {
        onClickGoToTaskPage() {
            const jumpUrl = this.data.taskRwardInfo.JumpUrl;
            console.log('立即浏览')
            clearInterval(this.data.assistTaskInterval);
            cwx.navigateTo({
                url: jumpUrl[0] === "/" ? jumpUrl : "/" + jumpUrl,
            });
            this.setData({
                showMask: "",
            });
        },
        onClickHideTaskPop() {
          this.setData({
              showMask: ''
          })
        },
        setTaskNavigateCountDown(jumpUrl) {
            let countDown = 3;
            this.setData({
                taskCountDownText: `${countDown}秒后自动跳转`,
            });
            const assistTaskInterval = setInterval(() => {
                if (countDown === 0) {
                    clearInterval(this.data.assistTaskInterval);
                    this.setData({
                        assistTaskInterval: null,
                    });

                    cwx.navigateTo({
                        url: jumpUrl[0] === "/" ? jumpUrl : "/" + jumpUrl,
                    });

                    this.setData({
                        showMask: "",
                    });
                } else {
                    countDown--;
                    this.setData({
                        taskCountDownText: `${countDown}秒后自动跳转`,
                    });
                }
            }, 1000);

            this.setData({
                assistTaskInterval,
            });
        },
    },
};
