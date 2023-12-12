/**
 * pwebview组件
 * privacy policy h5
 * 注意：禁止分享、无导航栏（防止点击头部跳转到首页）
 * @module cwx/CWebview
 */
import CWebviewBase from '../../component/cwebview/CWebviewBaseClass';

class CWebview extends CWebviewBase {
  onShareAppMessage = null;
  type = "pwebview";
  constructor(props) {
    super(props);
    this.data.pageId = "10650098858";
  }
}

new CWebview().register();