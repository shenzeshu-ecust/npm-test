import {
    cwx,
} from '../../../cwx/cwx'
import TPage from '../common/TPage'

import util from '../common/util'
import { shared } from '../common/trainConfig'


const defaultLeftBtnTxt = '分享好友'
const defaultLeftBtnColor = 'fff'
const defaultLeftBtnBgColor = 'cd3c44'
const defaultRightBtnTxt = '保存图片'
const defaultRightBtnColor = '1d2a43'
const defaultRightBtnBgColor = 'f5c750'

TPage({
    checkPerformance: true,
    pageId: shared.pageIds.share.pageId,
    data: {
        img: '',
        shareImg: '',
        bgColor: '',
        leftBtnTxt: defaultLeftBtnTxt,
        rightBtnTxt: defaultRightBtnTxt,
        showRightBtn: true,
        showLeftBtn: true,
        hasRejectAlbum: false,
        noQrcodeImg: '',
        btnImg:'',
    },

    /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
        console.log(options)
        let {
            img = '',
            shareImg = '',
            navTitle = '',
            navBgColor = '',
            bgColor = '',
            btnImg = '',
            leftBtnTxt = defaultLeftBtnTxt,
            leftBtnColor = defaultLeftBtnColor,
            leftBtnBgColor = defaultLeftBtnBgColor,
            rightBtnTxt = defaultRightBtnTxt,
            rightBtnColor = defaultRightBtnColor,
            rightBtnBgColor = defaultRightBtnBgColor,
            showRightBtn = true,
            showLeftBtn = true,
            sharePath = '',
            shareTitle = '',
            noQrcodeImg = '',
            ubtKey = '',
        } = options
        navTitle = decodeURIComponent(navTitle)
        leftBtnTxt = decodeURIComponent(leftBtnTxt)
        rightBtnTxt = decodeURIComponent(rightBtnTxt)
        img = decodeURIComponent(img)
        btnImg = decodeURIComponent(btnImg)
        noQrcodeImg = decodeURIComponent(noQrcodeImg)
        shareImg = decodeURIComponent(shareImg)
        sharePath = decodeURIComponent(sharePath)
        shareTitle = decodeURIComponent(shareTitle)
        showRightBtn = (showRightBtn === 'false' || showRightBtn === 0) ? false : showRightBtn
        showLeftBtn = (showLeftBtn === 'false' || showLeftBtn === 0) ? false : showLeftBtn


        this.setData({
            img,
            btnImg: btnImg || 'https://images3.c-ctrip.com/train/hd/20191108share/btn.png',
            bgColor,
            leftBtnTxt,
            leftBtnColor,
            leftBtnBgColor,
            rightBtnTxt,
            rightBtnColor,
            rightBtnBgColor,
            showRightBtn,
            showLeftBtn,
            noQrcodeImg,
            ubtKey:  ubtKey || '',
        })

        if (navTitle) {
            cwx.setNavigationBarTitle({
                title: navTitle,
            })
        }
        if (navBgColor) {
            cwx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: `#${navBgColor}`,
            })
        }

        Object.assign(this, {
            sharePath,
            shareImg,
            shareTitle,
        })
    },
    noop() {

    },
    /**
   * [reAuthorize 在打开授权设置页后回调]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
    reAuthorize (e) {
        if (e.detail.authSetting['scope.writePhotosAlbum']) {
            this.setData({
                hasRejectAlbum: false,
            })
        }
    },
    /**
   * 用户点击右上角分享
   */
    onShareAppMessage: function () {
        return {
            bu: 'train',
            path: this.sharePath,
            imageUrl: this.shareImg,
            title: this.shareTitle,
        }
    },
    saveFail() {
        util.showModal({
            m: "图片保存失败",
        })
    },
    saveImageToAlbumHandle () {
        // this.toPosterPage()
        let self = this
        // 通过 wx.getSetting 先查询一下用户是否授权了 "scope.writePhotosAlbum" 这个 scope
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            self.save()
                        },
                        fail() {
                            util.showModal({
                                m: '请先授权小程序访问您的相册',
                            })
                            self.setData({
                                hasRejectAlbum: true,
                            })
                            console.log('reject')
                        },
                    })
                } else {
                    self.save()
                }
            },
            fail() {
                self.saveFail()
            },
        })
    },
    save() {
        const url = this.data.img
        util.showLoading('正在保存图片')
        cwx.downloadFile({
            url,
            success: (res) => {
                util.hideLoading()
                this.downloadFilePath = res.tempFilePath
                this.saveSharePic()
            },
            fail: () => {
                util.hideLoading()
                this.saveFail()
            },
        })
    },
    saveSharePic() {
        cwx.saveImageToPhotosAlbum({
            filePath: this.downloadFilePath,
            success: () => {
                util.showModal({
                    m: '已保存到相册系统',
                })
            },
            fail: (e) => {
                console.log("*********** 保存海报图片 - 失败 ************")
                console.log(e)
                // this.reopenAuth()
                this.saveFail()
            },
        })
    },
})
