// {{page}}.js
import { cwx, CPage, __global } from '../../../../cwx/cwx.js';
import common from '../../common/common.js';
import { requestGetShareImage } from '../service/lvpaiRequest.js';
cwx.config.init();
let APP = getApp();
CPage({
  checkPerformance: true, // 添加标志位
  pageId: '10650066183',
  /**
   * 页面的初始数据
   */
  data: {
    shareImages: [],
    buttons: [
      {
        icon: 'https://pages.c-ctrip.com/livestream/userpage/weixin_icon.png',
        type: 'WeixinFriend',
        name: '微信好友',
      },
      // { icon: 'https://pages.c-ctrip.com/livestream/userpage/friend_circle.png', type: 'WeixinCircle', name: '微信朋友圈' },
      // { icon: 'https://pages.c-ctrip.com/livestream/userpage/weibo_icon.png', type: 'SinaWeibo', name: '微博' },
      {
        icon: 'https://pages.c-ctrip.com/livestream/userpage/download_icon.png',
        type: 'save',
        name: '保存到本地',
      },
    ],
    swiper_current: 0,
  },
  businessId: '',
  clientAuth: '',
  imageType: 'tripshoot_multi',
  sourceType: '',
  options: {},

  // 保存or分享
  doShare: function (e) {
    let type = e.currentTarget.dataset.type;
    if (type == 'save') {
      this.doTrack('c_gs_tripshoot_detail_poster_share_save');
      let shareItem = this.data.shareImages[this.data.swiper_current];
      if (!shareItem) {
        wx.showToast({
          title: '下载图片失败',
          icon: 'none',
          mask: true,
        });
        return;
      }
      wx.downloadFile({
        url: shareItem.imageUrl,
        success: (data) => {
          wx.saveImageToPhotosAlbum({
            filePath: data.tempFilePath,
            fail: (err) => {
              if (
                err.errMsg === 'saveImageToPhotosAlbum:fail auth deny' ||
                err.errMsg === 'saveImageToPhotosAlbum:fail:auth denied'
              ) {
                wx.showToast({
                  title: '需要授权后才可以保存到本地，请重试。',
                  icon: 'none',
                  mask: true,
                });
              } else {
                wx.showToast({
                  title: '保存失败，请重试',
                  icon: 'none',
                  mask: true,
                });
              }
            },
            success: () => {
              wx.showToast({
                title: '保存成功',
                icon: 'none',
                mask: true,
              });
            },
          });
        },
        fail: (err) => {
          wx.showToast({
            title: '下载图片失败',
            icon: 'none',
            mask: true,
          });
        },
      });
    }
  },
  doTrack(code) {
    this.ubtTrace(code, {
      articleId: this.businessId,
      shareType: this.imageType === 'talentShareImage' ? 2 : 1,
    });
    console.log(
      code,
      JSON.stringify({
        articleId: this.businessId,
        shareType: this.imageType === 'talentShareImage' ? 2 : 1,
      })
    );
  },
  // 切换按钮点击
  changeSwiper: function (e) {
    let val = e.currentTarget.dataset.val;
    if (val > 0) {
      this.doTrack('c_gs_tripshoot_detail_poster_rightswitch');
    } else {
      this.doTrack('c_gs_tripshoot_detail_poster_leftswitch');
    }
    this.setData({
      swiper_current: this.data.swiper_current + val,
    });
  },
  shareClick() {
    this.doTrack('c_gs_tripshoot_detail_poster_share_weixin');
  },
  // 轮播切换
  handleSwiperChange: function (e) {
    let self = this;
    let swiper_current = this.data.swiper_current;
    let current = e.detail.current;
    if (current - swiper_current > 0) {
      self.ubtTrace('c_gs_tripshoot_detail_poster_rightswitch');
    } else {
      self.ubtTrace('c_gs_tripshoot_detail_poster_leftswitch');
    }
    self.setData({
      swiper_current: current,
    });
  },

  // 获取分享图
  requestGetShareImage: function () {
    let self = this;
    let param = {
      businessId: this.businessId,
      imageType: this.imageType,
      sourceType: this.sourceType,
      clientAuth: this.clientAuth,
    };
    requestGetShareImage(param, function (res) {
      wx.hideLoading();
      if (common.checkResponseAck(res)) {
        let data = res.data;
        if (data.shareImages && data.shareImages.length > 0) {
          self.setData({
            shareImages: res.data.shareImages,
            pageType: 'normal',
          });
        } else {
          self.setData({
            shareImages: res.data.shareImages,
            pageType: 'empty',
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.options = options;
    this.businessId = options.businessId || '';
    this.sourceType = options.sourceType || '';
    this.clientAuth = options.clientAuth || '';
    this.imageType = options.imageType || '';
    wx.showLoading();
    this.requestGetShareImage();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    debugger;
    let shareItem = this.data.shareImages[this.data.swiper_current];
    let shareUrl =
      this.imageType === 'talentShareImage'
        ? '/cwx/component/cwebview/cwebview?data={"url":"https%3A%2F%2Fm.uat.qa.nt.ctripcorp.com%2Fwebapp%2Fyou%2Ftripshoot%2Fpaipai%2FredRankPage%2FredRankPage%3Fseo%3D0%26isHideHeader%3Dtrue%26isHideNavBar%3DYES%26navBarStyle%3Dwhite%26rankType%3D2%26isShare%3Dyes","needLogin":true}'
        : '/pages/you/lvpai/detail/detail?shareFlag=1&articleId=' +
          this.businessId;
    return {
      title:
        this.options.title && this.options.title !== 'undefined'
          ? decodeURIComponent(this.options.title)
          : '分享画报',
      path: shareUrl,
      imageUrl:
        this.options.shareImg && this.options.shareImg !== 'undefined'
          ? decodeURIComponent(this.options.shareImg)
          : shareItem.imageUrl,
    };
  },
});
