// 个性化推荐 设置页面
import { CPage, cwx, __global } from '../../cwx.js';
import { agreementConfig, getAgreementPath } from '../../../agreementConfig.js'; // 项目配置文件

CPage({
    pageId: "10650069326",
    data: {
        personalRecommendSwitch: true, // 个性推荐，默认为 true, 对应 personalRecommendSwitch
        localRecommendSwitch: true, // 附近推荐，默认为 true, 对应 localRecommendSwitch
        marketSwitch: true, // 消息通知，默认为 true, 对应 marketSwitch
        switchColor: '#0086F6',
        showMask: true,
        agreementText: agreementConfig.msgPrivacyPolicy.text,
    },
    gotoAgreement() {
      cwx.navigateTo({
        url: getAgreementPath('msgPrivacyPolicy')
      })
    },
    switchChange(e) {
        let self = this;
        // console.log('点击 switch 类型：', e.target.dataset.type);
        let type = e.target.dataset.type; // 此次设置的开关类型
        let mirrorStatusObj = {...this.data}; // 副本
        let currentSettingObj = {};
        currentSettingObj[type] = !mirrorStatusObj[type];
        cwx.showLoading({
            title: '提交设置中...',
            mask: true
        })
        this.setData({
            showMask: true
        })
        cwx.setPRSetting(currentSettingObj, function(requestSuccess) {
            if(requestSuccess) { // 调服务端接口 reportSwitchs 成功，才修页面展示的开关配置；失败则提示设置失败
                self.setData({
                    ...currentSettingObj, 
                    showMask: false
                }, () => {
                    cwx.hideLoading({});
                })
            } else {
                cwx.showModal({
                    title: '设置失败',
                    content: '网络不佳，请稍后重试~' // 余洋确认话术
                })
                currentSettingObj[type] = mirrorStatusObj[type];
                self.setData({
                    ...currentSettingObj, 
                    showMask: false
                }, () => {
                    cwx.hideLoading({});
                })
            }
        })
    },
    onLoad(options) {
        cwx.showLoading({
            title: '页面加载中...',
            mask: true
        })
    },
    onShow() {

    },
    onReady() {
        // this.getSwitchs()
        let self = this;
        cwx.getPRSetting().then(res => {
            // console.log('cwx.getPRSetting then, res:', res)
            self.setData({
                ...res,
                showMask: false
            }, () => {
                cwx.hideLoading({})
            })
        }).catch(err => {
            console.log('cwx.getPRSetting catch, err:', err)
        })
    },
    onHide() {

    },
    onUnload() {

    }
})