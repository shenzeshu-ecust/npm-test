/**
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 *
 * github地址: https://github.com/icindy/wxParse
 *
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

/**
 * utils函数引入
 **/
import HtmlToJson from 'html2json.js';
/**
 * 配置及公有属性
 **/
/**
 * 主函数入口区
 **/
function wxParse(bindName = 'wxParseData', data='<div class="color:red;">数据不能为空</div>', target, container, withoutLinkInspect, firstRenderCount) {
  var that = target;
  var transData = {};//存放转化后的数据
  try{
    transData = HtmlToJson.html2json(data, bindName, withoutLinkInspect, firstRenderCount);
  } catch(e){console.log(e)}
   

  var bindData = container || {};
  bindData[bindName] = transData;
  if(!container) {
    that.setData(bindData);
  }
  //console.log('bindData:'+ JSON.stringify(bindData));

  if(!firstRenderCount) { // 首屏渲染图片不加入图片列表, 以免和后续重复
    that.__wxParseImages = that.__wxParseImages || [];
    that.__wxParseImages = that.__wxParseImages.concat(transData.imageUrls || []);
  }

  that.wxParseImgTap = wxParseImgTap;
}
// 图片点击事件
function wxParseImgTap(e) {
  // 富文本暂时取消大图预览功能
  /*var that = this;
  var nowImgUrl = e.target.dataset.src;
  var tagFrom = e.target.dataset.from;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: that.__wxParseImages // 需要预览的图片http链接列表
    })
  }*/

  var nowImgUrl = e.target.dataset.src;
  var tagFrom = e.target.dataset.from;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0 && this.__wxParseImages) {
    var index = this.__wxParseImages.indexOf(nowImgUrl), length = 50,
        startPos = 0, endPos = length;
    if(index >= 0) {
      if(index >= length / 2) {
        startPos = index - length / 2;
        endPos = index + length / 2;
      }
      this.setData({
        slideImages: {
          current: index - startPos,
          images: this.__wxParseImages.slice(startPos, endPos),
        },
      });
    }
  }
}

function wxParseTemArray(temArrayName, bindNameReg, total, that) {
  var array = [];
  var temData = that.data;
  var obj = null;
  for (var i = 0; i < total; i++) {
    var simArr = temData[bindNameReg + i].nodes;
    array.push(simArr);
  }

  temArrayName = temArrayName || 'wxParseTemArray';
  obj = JSON.parse('{"' + temArrayName + '":""}');
  obj[temArrayName] = array;
  that.setData(obj);
}

module.exports = {
  wxParse: wxParse,
  wxParseTemArray: wxParseTemArray
}


