import util from '../../common/util'
import { createModel } from '../../common/model'
const getWxqrCode = createModel({
    channel: '17076',
    path: 'getWxqrCode',
})

const getScreenWidth = () => wx.getSystemInfoSync().screenWidth

Component({
    properties: {
        backgroundWidth: {
            type: [Number, String],
            value: 0,
        },

        backgroundHeight: {
            type: [Number, String],
            value: 0,
        },

        qrcodeWidth: {
            type: [Number, String],
            value: 0,
        },

        qrcodeHeight: {
            type: [Number, String],
            value: 0,
        },

        qrcodeX: {
            type: [Number, String],
            value: 0,
        },

        qrcodeY: {
            type: [Number, String],
            value: 0,
        },

        backgroundUrl: {
            type: [String],
            value: '',
        },

        btnUrl: {
            type: [String],
            value: "https://images3.c-ctrip.com/train/app/824/butie/fenxiang_BT.png",
        },

        pagePath: {
            type: [String],
            value: '',
        },

        btnStyle: {
            type: [String],
            value: '',
        },

        btnText: {
            type: [String],
            value: '',
        },

        title: {
            type: [String],
            value: '',
        },

        subTitle: {
            type: [String],
            value: '',
        },

        subTitle2: {
            type: [String],
            value: '',
        },

        yaoTitle: {
            type: [String],
            value: '',
        },

        donationTellTitle: {
            type: [String],
            value: '',
        },

        donationShareTitle: {
            type: [String],
            value: '',
        },

        donationShareSubTitle: {
            type: [String],
            value: '',
        },
    },

    data: {
        showBtn: false,
    },

    attached() {
        console.log(getScreenWidth())
        const {
            backgroundWidth,
            backgroundHeight,
            qrcodeWidth,
            qrcodeHeight,
            qrcodeX,
            qrcodeY,
        } = this.data
        const width = backgroundWidth
            ? parseInt(backgroundWidth)
            : getScreenWidth() * 0.85
        const height = backgroundHeight ? parseInt(backgroundHeight) : width * 1.28
        const qWidth = qrcodeWidth ? parseInt(qrcodeWidth) : width * 0.3
        const qHeight = qrcodeHeight ? parseInt(qrcodeHeight) : qWidth
        const qX = qrcodeX ? parseInt(qrcodeX) : (width - qWidth) / 2
        const qY = qrcodeY ? parseInt(qrcodeY) : width * 0.765

        console.log(width, height, qWidth, qHeight, qX, qY)

        this.setData({
            backgroundWidth: width,
            backgroundHeight: height,
            qrcodeWidth: qWidth,
            qrcodeHeight: qHeight,
            qrcodeX: qX,
            qrcodeY: qY,
        })
    },

    ready: function () {
        setTimeout(() => {
            this.getQRCodeImageUrl()
                .then(url => this.drawCanvas(url))
                .catch(() => {
                    this.triggerEvent('fail', { msg: '生成图片失败，请稍候再试' })
                },
                )
        }, 2000)
    },
    methods: {
        getQRCodeImageUrl() {
            // const params = {
            //     appId: 'wx0e6ed4f51db9d078',
            //     needData: false,
            //     buType: 'TRN',
            //     page: 'pages/market/unlimitQRCode/index',
            //     pathName: 'H5_robaccelerate',
            //     path: this.data.pagePath,
            //     fromId: '201105',
            //     autoColor: true,
            //     width: 274,
            //     isHyaline: true,
            // }

            const params = {
                ActivityCode:"CtripWXActivateCashBack0001",
                Page: 'pages/market/unlimitQRCode/index',
                path: this.data.pagePath,
                PathName: 'H5_robaccelerate',
            }

            return new Promise((resolve, reject) => {
                getWxqrCode(params,res => {
                    if (res.RetCode === 1) {
                        resolve(res.QrUrl)
                    } else {
                        reject(res)
                    }
                })
            })
        },

        loadBackgroundImage() {
            const { backgroundUrl } = this.data

            return new Promise((resolve, reject) => {
                wx.getImageInfo({
                    src: backgroundUrl,
                    success: res => {
                        resolve(res)
                    },
                    fail: () => {
                        reject()
                    },
                })
            })
        },

        loadQRCodeImage(url) {
            return new Promise((resolve, reject) => {
                wx.getImageInfo({
                    src: url,
                    success: res => {
                        resolve(res)
                    },
                    fail: () => {
                        reject()
                    },
                })
            })
        },

        drawCanvas(url) {
            const {
                backgroundWidth,
                backgroundHeight,
                qrcodeWidth,
                qrcodeHeight,
                qrcodeX,
                qrcodeY,
                title,
                subTitle,
                subTitle2,
                yaoTitle,
                donationTellTitle,
                donationShareTitle,
                donationShareSubTitle,
            } = this.properties
            Promise.all([this.loadBackgroundImage(), this.loadQRCodeImage(url)])
                .then(res => {
                    const ctx = wx.createCanvasContext('myImage', this)
                    ctx.drawImage(res[0].path, 0, 0, backgroundWidth, backgroundHeight)
                    ctx.drawImage(
                        res[1].path,
                        qrcodeX,
                        qrcodeY,
                        qrcodeWidth,
                        qrcodeHeight,
                    )
                    ctx.fillStyle = '#FFFFFF'
                    ctx.setFontSize(20)
                    ctx.setTextAlign('center')
                    ctx.fillText(title, 160, 52)
                    ctx.setFontSize(16)
                    ctx.fillText(subTitle, 160, 80)
                    ctx.fillText(subTitle2, 160, 100)
                    ctx.fillText(donationTellTitle, 130, 100)
                    ctx.fillText(donationShareTitle, 140, 100)
                    ctx.fillText(donationShareSubTitle, 140, 120)
                    ctx.font = 'bold 20px sans-serif'
                    ctx.fillStyle = '#F7D1A3'
                    ctx.fillText(yaoTitle, 136, 80)
                    ctx.draw()
                    this.setData({
                        showBtn: true,
                    })
                    this.triggerEvent('success', { msg: '生成图片成功' })
                })
                .catch(e => console.log(e))
        },

        checkAuthority() {
            return new Promise((resolve, reject) => {
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.writePhotosAlbum']) {
                            wx.authorize({
                                scope: 'scope.writePhotosAlbum',
                                success: () => {
                                    resolve()
                                },
                                fail: () => {
                                    reject()
                                },
                            })
                        } else {
                            resolve()
                        }
                    },
                })
            })
        },

        generateImageFilePath() {
            const { backgroundWidth, backgroundHeight } = this.data

            return new Promise((resolve, reject) => {
                wx.canvasToTempFilePath(
                    {
                        x: 0,
                        y: 0,
                        width: backgroundWidth,
                        height: backgroundHeight,
                        destWidth: backgroundWidth * 2,
                        destHeight: backgroundHeight * 2,
                        canvasId: 'myImage',
                        success: res => resolve(res),
                        fail: () => reject(),
                    },
                    this,
                )
            })
        },

        saveImageToPhotosAlbum(url) {
            return new Promise((resolve, reject) => {
                wx.saveImageToPhotosAlbum({
                    filePath: url,
                    success: res => resolve(res),
                    fail: () => reject(),
                })
            })
        },

        handleSave() {
            this.checkAuthority().then(
                () => {
                    util.showLoading('保存中...')

                    this.generateImageFilePath().then(res => {
                        this.saveImageToPhotosAlbum(res.tempFilePath).then(
                            () => {
                                util.hideLoading()
                                this.triggerEvent('savesuccess', {})
                            },
                            () => util.hideLoading(),
                        )
                    })
                },
                () => {
                    return wx.showModal({
                        title: '授权失败',
                        content:
              '请在小程序设置界面（「右上角」-「关于」-「右上角」-「设置」）中打开「保存到相册」',
                        confirmText: '去设置',
                        cancelText: '取消',
                        success: res => {
                            if (res.confirm) {
                                wx.openSetting({
                                    success: res => {
                                        if (res.authSetting['scope.writePhotosAlbum']) {
                                            this.handleSave()
                                        }
                                    },
                                })
                            }
                        },
                    })
                },
            )
        },

        noop() { },
    },
})
