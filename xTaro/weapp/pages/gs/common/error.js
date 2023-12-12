/**
 * Created by xusc on 2016/12/30
 */
import { cwx, CPage } from '../../../cwx/cwx.js';
import { replaceFromUrl } from '../common/base.js';



CPage({
  pageId: '',
  url: null,
  params: null,
  data: {
    canRetry: false,
  },

  /** 生命周期函数 **/
  onLoad(options) {
    options.data = options.data || options;
    this.fromUrl = options.data.fromUrl;

    wx.setNavigationBarTitle({title: options.data.title || '携程攻略-网络异常'});
    this.setData({
      canRetry: !!this.fromUrl
    });
  },

  /** 事件处理函数 **/
  retryBtnTaped() {

    let reloadUrl = replaceFromUrl(this.fromUrl);
    cwx.redirectTo({url: reloadUrl})
  },

});
