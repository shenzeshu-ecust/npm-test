// 自定义 webview 的模板文件
import CWebviewBase from '../cwebview/CWebviewBaseClass.js'; // 注意：修改此处的引用路径！

class CWebview extends CWebviewBase {
    onShareAppMessage = null;
    type = "scweb5"; // 注意：修改此处 type，填写 BU 或 bundle 
    constructor(props){
      super(props);
      this.data.pageId = "10650059679"
    }
}

new CWebview().register();