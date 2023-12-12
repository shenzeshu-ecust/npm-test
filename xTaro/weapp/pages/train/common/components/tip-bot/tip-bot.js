import util from '../../util'
import { cwx } from '../../../../../cwx/cwx'
import common from '../../common'
import {
    login12306Action,
} from '../../common'
import { TrainBookStore } from '../../store'

export const login12306 = {
    inputName(e) {
        this.setData({
            login12306Name: e.detail.value,
        })
    },
    inputPas(e) {
        this.setData({
            login12306Pas: e.detail.value,
        })
    },
    goLogin() {
        if (!this.data.login12306Name || !this.data.login12306Pas) {
            return util.showModal({
                m: '请输入正确的帐号密码',
            })
        }

        util.showLoading('正在登录')

        return login12306Action({
            UserName: this.data.login12306Name,
            Password: this.data.login12306Pas,
            IsCheckExist: 0,
        }).then(() => {
            util.hideLoading()
            this.hideBackDrop()
            this.setData({
                logedin: 1,
            })
        }).catch(err => {
            console.error(err)
            util.hideLoading()
            util.showModal({
                m: err && err.errmsg || '12306故障，请稍候重试',
            })
        })
    },
    cancel12306() {
        this.hideBackDrop()
    },
    load12306FromStore() {
        let bookInfo = TrainBookStore.get()
        if (bookInfo && cwx.user.isLogin() && (cwx.user.auth === bookInfo.auth)) {
            let bind12306 = bookInfo.bind12306
            let logedin = 0
            let login12306Name = ''
            let displayName = ''
            let login12306Pas = ''
            let passengerList12306
            if (bind12306) {
                logedin = 1
                login12306Name = bind12306.name
                displayName = bind12306.displayName
                passengerList12306 = bind12306.passengerList12306
            }
            this.setData({
                login12306Name,
                displayName,
                logedin,
                login12306Pas,
                passengerList12306,
            })
        }
    },
    // goToRegister12306() {
    //     //隐藏12306弹窗之后再跳转
    //     this.hideBackDrop()
    //     let routeObj = {
    //         url: '../register12306/register12306'
    //     }
    //     if (this.getPageLevel() >= 5) {
    //         cwx.redirectTo(routeObj)
    //     } else {
    //         this.navigateTo(routeObj)
    //     }
    // },
    /**
     * 目前只在乘客列表页会被调用
     */
    refresh12306pas() {
        let self = this
        if (!self.data.login12306Name || !self.data.login12306Pas) {
            self.hideBackDrop()
            setTimeout(function () {
                // 目前只有乘客列表有该方法
                self.goLoginPage()
            }, 500)

            return
        }

        let uploadedPasCnt = 0
        let uploadCb = () => {
            util.hideLoading()
            // 微信 6.5.18 版本toast会被hideLoading关闭
            setTimeout(function() {
                util.showToast(`已导入${uploadedPasCnt}位`)
            }, 300)
            self.getPassInfo()
        }
        let progressCb = (data = {}) => {
            if (data.pas) {
                uploadedPasCnt++
            }
        }
        util.showModal({
            title: '',
            m: '是否导入您12306账户里的所有联系人？',
            confirmText: '确定导入',
            showCancel: true,
            cancelText: '返回',
            done(res) {
                if (res.confirm) {
                    if (self.data.passengerList12306 && self.data.passengerList12306.length) {
                        util.showLoading()
                        common.upload12306pas(self.data.passengerList12306, uploadCb, progressCb)
                    } else {
                        util.showLoading()
                        login12306Action({
                            UserName: self.data.login12306Name,
                            Password: self.data.login12306Pas,
                            IsCheckExist: 0,
                        }).then(data => {
                            common.upload12306pas(data.PassengerList, uploadCb, progressCb)
                        }).catch(err => {
                            console.error(err)
                            util.showModal({
                                m: err && err.errmsg || '12306故障，请稍候重试',
                            })
                        })

                        return
                    }
                }
            },
        })
    },
}
