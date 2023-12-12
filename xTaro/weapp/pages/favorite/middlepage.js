import { CPage, cwx } from '../../cwx/cwx';

const jumpToMiniProgram = (route = {}) => {
    const { appId = '', appPath = '', complete = () => {} } = route;

    if (!appId) {
        console.warn('appId不能为空');
        return;
    }

    if (!appPath) {
        console.warn('缺少地址');
        return;
    }

    // 此方法会默认在path后边添加业绩参数
    cwx.cwx_navigateToMiniProgram({
        appId: appId,
        path: appPath,
        complete: complete
    });
};

CPage({
    onLoad: function (opts) {
        const {
            appPath = '',
            appId = ''
        } = opts;

        this.setData({
            appPath,
            appId
        });

        cwx.showModal({
            title: '提示',
            content: '是否要打开外部小程序',
            success: (res) => {
                if (res.confirm) {
                    jumpToMiniProgram({
                        appPath: `${decodeURIComponent(appPath)}`,
                        appId,
                        complete: () => {
                            this.backLastPage();
                        }
                    });
                } else if (res.cancel) {
                    this.backLastPage();
                }
            }
        })
    },
    onShow: function () {},
    // 关闭当前页
    backLastPage: function () {
        cwx.navigateBack({
            delta: 1
        });
    }
});
