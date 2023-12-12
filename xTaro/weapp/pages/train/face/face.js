import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
import { ImageCheck } from '../common/model'
import { getConfigByKeysPromise } from '../common/common'
import util from '../common/util'
import { shared } from '../common/trainConfig'
const DEFAULT_SUBMIT_LOADING_STATUS = [
    {name: '检测图片质量', status: 0}, // 0 default 1 loading 2 done
    {name: '人证安全一致性', status: 0},
]

let page = {
    checkPerformance: true,
    pageId: '10650049942',
    data: {
        // 相机宽高默认值
        cameraWidth: 460,
        cameraHeight: 640,
        fromType:-1,//fromType: 1 人证核验，2，会员激活，3，注销，4、94扫脸 5.找回密码
        photos:[],
        rejectAuth:false,
        countdown:3,
        submitLoadingStatus: DEFAULT_SUBMIT_LOADING_STATUS,
        submitLoadingVisible:false,
        isAndroid:util.isAndroid(),
        configLoading: true,
        wechatCheckFlag: false,
    },
    onLoad(options = {}) {
        const {fromType = 0, userName = '', displayName = '', certificationInfo = {}, h5Url = '', loginPW = '', autoBack = '', autoBackNoSearch } = options
        this.setData({
            fromType: +fromType,
            userName: decodeURIComponent(userName),
            displayName: decodeURIComponent(displayName),
            loginPW: decodeURIComponent(loginPW),
            h5Url: decodeURIComponent(h5Url),
            autoBack,
            autoBackNoSearch
        })
        try {
            this.setData({
                certificationInfo: JSON.parse(certificationInfo),
            })
        } catch (error) {

        }

        this.getCheckConfig()

        wx.getSystemInfo({
            success: (result) => {
                this.setData({
                    cameraWidth: result.windowWidth,
                    cameraHeight: result.windowHeight,
                })
            },
            fail: () => {},
        })

        util.devTrace('', {desc: '扫脸页参数', date: options })
    },
    onShow() {
        this.setData({photos:[]})
        if (cwx.user.isLogin()) {
            cwx.user.checkLoginStatusFromServer(data => {
                if (!data) {
                    this.ctripLogin()
                }
            })
        } else {
            this.ctripLogin()
        }
        wx.getSetting({
            success:(res)=>{
                if (res && res.authSetting && res.authSetting.hasOwnProperty("scope.camera") && !res.authSetting["scope.camera"]){
                    util.devTrace('', {desc: '扫脸页授权', rejectAuth: true })
                    this.setData({
                        rejectAuth:true,
                    })
                } else {
                    util.devTrace('', {desc: '扫脸页授权', rejectAuth: false })
                    this.setData({
                        rejectAuth:false,
                    })
                }
            },
        })
    },
    async getCheckConfig() {
        try {
            util.showLoading()
            const res = await getConfigByKeysPromise({
                keys: ["wechat_mini_check"]
            })
            if (res.resultCode != 1) {
                throw '配置获取失败'
            }
            this.setData({
                configLoading: false,
                wechatCheckFlag: res.configs[0].data.checkFlag
            })
        } catch (error) {
            this.setData({
                configLoading: false
            })
        } finally {
            util.hideLoading()
        }
    },
    onClickKefu() {
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent('https://m.ctrip.com/webapp/servicechatv2/?bizType=1302&pageCode=10320640941&channel=TRN&aiParam=&isPreSale=0&thirdPartytoken=&platform=wechat'),
            },
        })
    },
    showSecurityTip() {
        this.setData({
            securityTipVisible: true,
        })

        this.doCountDown()
    },
    doCountDown() {
        const { countdown } = this.data

        if (countdown > 0) {
            this._timer = setTimeout(() => {
                this.setData({
                    countdown: countdown - 1,
                }, () => {
                    this.doCountDown()
                })
            }, 1000)
        } else {
            if (this._timer) {
                clearTimeout(this._timer)
            }

            this.setData({
                securityTipVisible: false,
            })
        }
    },
    showSubmitLoading() {
        this.setData({
            popMask: true,
            submitLoadingVisible: true,
        })
        setTimeout(() => {
            this.setData({
                popMaskTransition: true,
            })
        }, 10)
    },
    hideSubmitLoading() {
        this.setData({
            popMask: false,
            popMaskTransition: false,
            submitLoadingVisible: false,
            submitLoadingStatus: DEFAULT_SUBMIT_LOADING_STATUS,
        })
    },
    setLoadingStatus(statusArray) {
        const { submitLoadingStatus } = this.data

        this.setData({
            submitLoadingStatus: submitLoadingStatus.map((item, index) => ({...item, status: statusArray[index]})),
        })
    },
    onCameraInit(e){
        console.log('camera init ok', e)
        this.showSecurityTip()
    },
    error(e){
        console.error("=============")
        console.error(e)
        util.devTrace('', {desc: '扫脸页授权', rejectAuth: true })
        if (e && e.detail && e.detail.errMsg && e.detail.errMsg.indexOf('auth') > -1){
            util.showToast('请允许使用摄像头权限，否则该功能无法正常使用，敬请谅解。', 'none',3000)
        }
        this.setData({
            rejectAuth:true,
        })
    },
    ctripLogin() {
        cwx.user.login({
            callback(res) {
                if (res.ReturnCode !== "0") {
                    util.showToast('请重新登录', 'none')
                    setTimeout(this.navigateBack, 1500)
                }
            },
        })
    },
    checkPhotos(PollingKey){
        const gap = new Date().getTime() - (this._takeTime || 0)
        // 保证loading一圈
        if (gap < 1500) {
            setTimeout(() => {
                this.setLoadingStatus([2, 1])
            }, 1500 - gap)
        } else {
            this.setLoadingStatus([2, 1])
        }
        let params = {}
        params.Channel = 'WX'
        params.Password = this.data.loginPW
        params.UserName = this.data.userName//需要外围传入
        // ImageDataList数据太大 轮询的时候就不需要再传了
        params.ImageDataList = PollingKey ? [] : this.data.photos.map(item => {
            return {
                Image:item.imageData,
                Quality:item.quality,
                Width:item.width,
                Height:item.height,
                RECT:item.rect,
            }
        })
        let timeStamp = (new Date().getTime() / 1000).toFixed()
        params.SignInfo = {
            SignSource:'GetTrainImageAuthenticationResult.ctripwx',
            SignTimeStamp:timeStamp + '',
            Sign:cwx.md5 && cwx.md5(`${timeStamp}${'07daaf60ac9182ecc4ef1e06c62587d8'}`).toLowerCase(),
        }
        params.FromType = this.data.fromType, // FromType:1 人证核验，2，会员激活，3，注销，4、94扫脸 5.找回密码
        params.PollingKey = PollingKey ?? ''
        params.CertificationInfo = this.data.certificationInfo ? {
            AccountPassportName: decodeURIComponent(this.data.certificationInfo.name),
            AccountPassportType: +this.data.certificationInfo.passportType,
            AccountPassportNumber: this.data.certificationInfo.passportNumber,
            MobileNo: this.data.certificationInfo.mobile,
        } : {}

        const completeCb = (res) => {
            // CertificationResult:认证结果 1=成功，2=失败，3=等待
            // FailCode:具体失败编码 1=需重新登录12306账号 2=找回密码时不存在该账号
            util.devTrace('', {desc: '扫脸解果', date: res })
            this.hideSubmitLoading()
            const { CertificationResult: certificationResultCode, RetMessage: retMessage, FailCode: failCode , CallbackData} = res
            let { fromType,
                h5Url,
                certificationInfo = {},
                autoBack,
                autoBackNoSearch
            } = this.data
            const cheackFacePollingKey = params.PollingKey
            // 如果是h5跳进来的 根据autoBack参数选择扫脸结束是否直接返回
            // 如果是小程序跳进来的 成功或者失败都会回跳 并且回抛参数
            if (h5Url) {
                let joiner = (h5Url.indexOf('?') > -1 || h5Url.indexOf('%3F') > -1 ) ? '&' : '?'
                const {name = '', passportNumber = '', mobile = '', passportType = 1 } = certificationInfo

                if (autoBack == 1) {
                    shared.webviewData = {
                        needReload: true,
                        reloadUrl: h5Url + `${joiner}userName=${encodeURIComponent(name)}&displayName=${mobile}&idNumber=${passportNumber}&mobile=${mobile}&passportType=${+passportType}&certificationResultCode=${certificationResultCode}&failCode=${failCode}&callbackData=${encodeURIComponent(CallbackData)}&cheackFacePollingKey=${cheackFacePollingKey}`,
                    }
                    this.navigateBack()

                    return
                }
                if (autoBackNoSearch == 1) {
                  shared.webviewData = {
                      needReload: true,
                      reloadUrl: h5Url + `${joiner}certificationResultCode=${certificationResultCode}`,
                  }
                  this.navigateBack()

                  return
                }
                if (certificationResultCode == 1) {
                    if (fromType == 3) {
                        // 注销扫脸
                        shared.webviewData = {
                            needReload: true,
                            reloadUrl: h5Url + `${joiner}userName=${encodeURIComponent(name)}&displayName=${mobile}&idNumber=${passportNumber}&mobile=${mobile}&passportType=${+passportType}&logout=1`,
                        }
                    } else if (fromType == 5) {
                        // 找回密码
                        shared.webviewData = {
                            needReload: true,
                            reloadUrl: h5Url + `${joiner}userName=${encodeURIComponent(name)}&displayName=${mobile}&idNumber=${passportNumber}&mobile=${mobile}&passportType=${+passportType}&callbackData=${encodeURIComponent(CallbackData)}&cheackFacePollingKey=${cheackFacePollingKey}&canRetrieve=1`,
                        }
                    } else if (fromType == 4) {
                        // h5进来的94扫脸目前只有扫脸解除登录风控
                        shared.webviewData = {
                            needReload: true,
                            reloadUrl: h5Url + `${joiner}autoLogin=1`,
                        }
                    } else {
                        shared.webviewData = {
                            needReload: true,
                            reloadUrl: h5Url,
                        }
                    }
                    this.navigateBack()
                } else {
                    util.showToast('核验失败，请稍后重试', 'none')
                    this.setData({ photos:  []})
                }
            } else {
                this.navigateBack({
                    certificationResultCode,
                    retMessage,
                    failCode,
                    fromType: this.data.fromType,
                })
            }

            this.ubtTrace('c_train_loginout_scansuccess', certificationResultCode == 1 && fromType == 3)
            this.ubtTrace('findpassword_scan_success', certificationResultCode == 1 && fromType == 5)
            this.ubtTrace('findpassword_scan_fail', certificationResultCode == 2 && fromType == 5)
        }
        ImageCheck(params,(res) =>{
            if (res && res.RetCode == 1){
                if (res?.CertificationResult == 3){
                    //轮询
                    console.log('===========')
                    console.log(res.PollingKey)
                    setTimeout(()=>{
                        this.checkPhotos(res.PollingKey)
                    },res.Rate * 1000)
                } else if (res?.CertificationResult == 1){
                    util.hideLoading()
                    this.setLoadingStatus([2, 2])
                    completeCb(res)
                } else {
                    util.hideLoading()
                    completeCb(res)
                }
            } else {
                util.hideLoading()
                completeCb(res)
            }
        },(err)=>{
            console.log(err)
            util.hideLoading()
            completeCb({})
        })
    },
    handlePhoto(imageInfo){
        wx.compressImage({
            src:imageInfo.tempImagePath,
            quality:40,
            success:(compressInfo)=>{
                wx.getFileSystemManager().readFile({
                    filePath:compressInfo.tempFilePath,
                    encoding:'base64',
                    success:(res)=>{
                        let photos = this.data.photos
                        photos.push({
                            imageData:res.data,
                            height:imageInfo.height + '',
                            width:imageInfo.width + '',
                            quality:'40',
                            rect:`${(0.237 * imageInfo.width).toFixed()},${(0.278 * imageInfo.height).toFixed()},${(0.729 * imageInfo.width).toFixed()},${(0.579 * imageInfo.height).toFixed()}`, //这个系数需要看出来的UI稿 头像的标注位置
                        })
                        this.setData({
                            photos,
                        })
                        if (photos.length < 2){
                            setTimeout(()=>{
                                this.takePhoto(photos.length)
                            },500)
                        } else {
                        //成功
                            this.checkPhotos()
                        }
                    },
                    fail:()=>{
                        util.hideLoading()
                    },
                })
            },
            fail:()=>{
            },
        })

    },
    takePhoto(times = 0){
        const { securityTipVisible } = this.data
        if (securityTipVisible) return
        const context = wx.createCameraContext()
        context.takePhoto({
            quality:"high",
            success:(res)=>{
                if (res.tempImagePath && res.tempImagePath.length > 0) {

                    this.showSubmitLoading()
                    this.setLoadingStatus([1])
                    if (times === 0) {
                        this._takeTime = new Date().getTime()
                    }
                    this.handlePhoto(res)
                } else {
                    util.hideLoading()
                }
            },
            fail:()=>{
                util.hideLoading()
            },
            complete:()=>{

            },
        })
    },
}
TPage(page)
