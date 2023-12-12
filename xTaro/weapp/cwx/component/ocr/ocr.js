/**
 * ocr组件
 * @module component/ocr
 */
import {cwx, CPage} from '../../cwx.js'

CPage({
    pageId: '10650048578',
    data: {
        ocrSuccessTraceKey: '159334',
        ocrFailedTraceKey: '159335',
        ocrDevTraceKey: '159066',
        // 页面标题
        title: '证件识别',
        // 调用方
        bizType: 'BBZ',
        // 相机宽高默认值
        cameraWidth: 300,
        cameraHeight: 180,
        // 是否展示浮层
        showMask: false,
        // 识别结果
        ocrResult: {},
        // 闪光灯状态
        flashStatus: false,
        // 是否回显照片
        showPhoto: false,
        // 是否显示loading
        showLoading: false,
        // 是否显示失败弹窗
        showFailModel: false,
        // 弹窗按钮样式: true为拍照失败弹窗，false为相册失败弹窗
        modelButtonStatus: true,
        // 拍照后的图片临时路径
        photoPath: ''
    },
    onLoad: function (options) {
        console.log('ocr onLoad ++++++')
        console.log(options)
        console.log(typeof options.data)
        try {
            if (typeof options.data === 'string') {
                options.data = JSON.parse(options.data)
            }
        } catch (e) {
        }
        // 设置调用方
        this.setData({
            bizType: (options.data && options.data.bizType) || this.data.bizType
        });
        this.privateKey = options.privateKey || options.data.privateKey;
        // 设置头部标题
        cwx.setNavigationBarTitle({
            title: options.data.title || this.data.title
        });
        // 设置头部样式
        cwx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#FFFFFF'
        });
        // 自适应设置相机的宽高，宽高比1.59
        cwx.getSystemInfo({
            success: (result) => {
                this.setData({
                    cameraWidth: result.windowWidth - 50,
                    cameraHeight: result.windowWidth / 1.59
                });
            },
            fail: (res) => {
            }
        });
    },

    /**
     * 展示说明浮层
     */
    showMaskLayerTap: function () {
        this.setData({
            showMask: true
        });
    },

    /**
     * 隐藏说明浮层
     */
    hideMaskLayerTap: function () {
        this.setData({
            showMask: false
        });
    },

    /**
     * 闪光灯状态改变
     * 默认关闭闪光灯
     * 包括关闭闪光灯和开启闪光灯两种状态
     */
    changeFlashStatusTap: function () {
        if (!this.data.flashStatus) {
            this.setData({
                flashStatus: true
            });
        } else {
            this.setData({
                flashStatus: false
            });
        }
    },

    /**
     * 微信临时图片路径转base64
     */
    tmpFilePathToBase64: function (tempFilePath) {
        cwx.getFileSystemManager().readFile({
            filePath: tempFilePath,
            encoding: 'base64',
            success: (res) => {
                var imageBase64 = 'data:image/png;base64,' + res.data;
                this.getOCRResult(imageBase64);
            },
            fail: (err) => {
                this.sendDevTraceLog(this.data.ocrFailedTraceKey, {
                    info: 'tempFilePathToBase64 failed',
                    result: JSON.stringify(err)
                });
            }
        });
    },

    /**
     * 选取本地相册图片识别
     * 限制大小为1
     */
    chooseImageTap: function () {
        // 如果弹窗为显示状态，隐藏失败弹窗
        if (this.data.showFailModel === true) {
            this.hideFailModelTap();
        }
        cwx.chooseImage({
            count: 1,
            sourceType: ['album'],
            success: (res) => {
                // tempFilePath可以作为img标签的src属性显示图片
                const tempFilePaths = res.tempFilePaths;
                if (tempFilePaths && tempFilePaths.length > 0) {
                    this.setData({
                        photoPath: res.tempFilePaths[0],
                        modelButtonStatus: false
                    });
                    this.beginOCRTap();
                } else {
                    this.sendDevTraceLog(this.data.ocrDevTraceKey, {
                        info: 'chooseImageTap failed',
                        bizType: this.data.bizType,
                        result: JSON.stringify(res)
                    });
                }
            },
            fail: (err) => {
                this.sendDevTraceLog(this.data.ocrDevTraceKey, {
                    info: 'chooseImageTap failed',
                    bizType: this.data.bizType,
                    result: JSON.stringify(err)
                });
            }
        })
    },

    /**
     * 拍照识别
     */
    takePhotoTap: function () {
        // 拍照页面下才能拍照，展示照片状态点击按钮不触发拍照
        if (!this.data.showPhoto) {
            const ctx = cwx.createCameraContext();
            ctx.takePhoto({
                quality: 'high',
                success: (res) => {
                    if (res.tempImagePath && res.tempImagePath.length > 0) {
                        this.setData({
                            photoPath: res.tempImagePath,
                            showPhoto: true,
                            modelButtonStatus: true
                        });
                    } else {
                        this.sendDevTraceLog(this.data.ocrDevTraceKey, {
                            info: 'takePhotoTap failed',
                            bizType: this.data.bizType,
                            result: JSON.stringify(res)
                        });
                    }
                },
                fail: (err) => {
                    this.sendDevTraceLog(this.data.ocrDevTraceKey, {
                        info: 'takePhotoTap failed',
                        bizType: this.data.bizType,
                        result: JSON.stringify(err)
                    });
                }
            })
        }
    },

    /**
     * 重新拍摄
     */
    reshootTap: function () {
        this.setData({
            photoPath: '',
            showPhoto: false
        });
    },

    /**
     * 开始识别-拍照得到的图片
     */
    beginOCRTap: function () {
        if (this.data.photoPath && this.data.photoPath.length > 0) {
            // 转base64并识别
            this.tmpFilePathToBase64(this.data.photoPath);
        }
    },

    /**
     * 显示loading
     */
    showLoading: function () {
        this.setData({
            showLoading: true
        });
    },

    /**
     * 隐藏loading
     */
    hideLoading: function () {
        this.setData({
            showLoading: false
        });
    },

    /**
     * OCR识别接口
     * @param {string} imageBase64
     * 契约见：http://conf.ctripcorp.com/pages/viewpage.action?pageId=148261651
     */
    getOCRResult: function (imageBase64) {
        this.showLoading();
        cwx.request({
            url: '/restapi/soa2/16169/doOCRFromImg',
            data: {
                image: imageBase64
            },
            // 超时时间
            timeout: 30000,
            success: (res) => {
                this.hideLoading();
                var data = res.data;
                if (data && data.ResponseStatus.Ack === 'Success' && data.result.resultCode === 0) {
                    this.setData({
                        ocrResult: data
                    });
                    this.invokeCallback(this.data.ocrResult);
                    if (this.privateKey) {
                        try {
                            const pages = getCurrentPages();
                            const prePage = pages[pages.length - 2]
                            if (prePage && prePage.prePageCallback) {
                                // 埋点记录，OCR 到底返回了什么数据
                                let restoCweb = {
                                    privateKey: this.privateKey,
                                    options: {
                                        idCardNo: this.data.ocrResult && this.data.ocrResult.idCardNo || '',
                                        name: this.data.ocrResult && this.data.ocrResult.name || ''
                                    }
                                }
                                cwx.sendUbtByPage.ubtMetric({
                                    name: 190663, //申请生成的Metric KEY
                                    tag: {"restoCweb": JSON.stringify(restoCweb)}, //自定义Tag
                                    value: 1 //number 值只能是数字
                                });
                                let srcs = cwx.aes.enc.Utf8.parse(JSON.stringify(restoCweb.options));
                                let encrypted = cwx.aes.AES.encrypt(srcs, cwx.aes.enc.Utf8.parse(restoCweb.privateKey), {
                                    mode: cwx.aes.mode.ECB,
                                    padding: cwx.aes.pad.Pkcs7
                                });
                                let resMsg = encodeURIComponent(restoCweb.privateKey.slice(0, 8) + cwx.aes.enc.Base64.stringify(encrypted.ciphertext) + restoCweb.privateKey.slice(8))

                                prePage.prePageCallback.call(prePage, resMsg);
                            }
                        } catch (e) {
                            console.log(`Noti Ocr ${this.privateKey} Error : `, e);
                        }
                    }
                    this.navigateBack();
                    this.sendTraceLog(this.data.ocrSuccessTraceKey, {
                        info: 'post /soa2/16169/doOCRFromImg success',
                        bizType: this.data.bizType,
                        result: JSON.stringify(data)
                    });
                } else {
                    this.hideLoading();
                    this.showFailModelTap();
                    // 识别失败
                    this.sendTraceLog(this.data.ocrFailedTraceKey, {
                        info: 'post /soa2/16169/doOCRFromImg failed',
                        bizType: this.data.bizType,
                        result: JSON.stringify(res)
                    });
                }
            },
            fail: (err) => {
                this.hideLoading();
                this.showFailModelTap();
                // 识别失败
                this.sendTraceLog(this.data.ocrFailedTraceKey, {
                    info: 'post /soa2/16169/doOCRFromImg failed',
                    bizType: this.data.bizType,
                    result: JSON.stringify(err)
                });
            }
        });
    },

    /**
     * 展示失败弹窗
     */
    showFailModelTap: function () {
        this.setData({
            showFailModel: true
        });
    },

    /**
     * 隐藏失败弹窗
     */
    hideFailModelTap: function () {
        this.setData({
            showFailModel: false
        });
    },

    /**
     * 发送UBT业务埋点
     * @param {Object} info
     */
    sendTraceLog: function (key, info) {
        cwx.sendUbtByPage.ubtTrace(key, info);
    },

    /**
     * 发送UBT开发埋点
     * @param {Object} info
     */
    sendDevTraceLog: function (key, info) {
        cwx.sendUbtByPage.ubtDevTrace(key, info);
    }


})
