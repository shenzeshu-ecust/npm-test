import huser from '../../../common/hpage/huser';

Component({
    properties: {
        hidden: {
            type: Boolean,
            value: true
        }
    },
    data: {},
    methods: {
        toLogin () {
            huser.login({
                callback: (res) => {
                    if (res && res.ReturnCode === '0') {
                        this.triggerEvent('initComment');
                        this.setData({
                            hidden: true
                        });
                    } else {
                        // 出登录弹窗
                        this.setData({
                            hidden: false
                        });
                    }
                }
            });
        }
    }
});
