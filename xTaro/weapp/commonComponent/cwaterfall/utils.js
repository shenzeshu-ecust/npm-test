import { cwx } from '../../cwx/cwx';
/**
    * 将切图的size拼接到img的url中
    * @param url
    * @param size 如'_R_68_68_Q80'
    * @return {string}
    */
   function concatImgSize (url = "", size = "") {
    let urlArr = url.split("?");
    let imgUrl = urlArr[0];
    urlArr[0] = imgUrl.replace(/\.(jpg|png|jpeg)/i, ($0) => {
      return size + $0;
    });
    return urlArr.join("?");
  }
  /**
     *
     * 切图命令：宽 >= 高 时 切 1:1的图，宽 < 高 时 切 3:4的图
     *
     * W>=H: _D_500_500_R5_Q80，W<H: _D_450_600_R5_Q80
     */
	  function concatImgSuffix(url = "", isHorizontalImage){
      const imgSize = isHorizontalImage ? '_D_500_500_R5_Q80' : '_D_450_600_R5_Q80';
      return concatImgSize(url, imgSize);
    }

    const windowWidth = cwx.getSystemInfoSync().windowWidth;
    const ratio = 750 / windowWidth;
    /**
     * 判断标题文案展示为几行，用于计算卡片高度
     * @param {string} content 标题文案
     * @param {number} cardMargin  需要减去的卡片的间距
     */
    function getLineNumOfText(content, cardMargin) {
      if(!content) return 0;
      cardMargin = cardMargin ? cardMargin : 32; // 单位rpx，默认按pictxt类型计算
      const cardWidth = 343; // 单位rpx
      const fontSize = 28; // rpx
      const contentWidth = cardWidth - cardMargin;
      const realWidth = contentWidth / ratio;
      // 单行能展示的字数
      const wordCount = Math.ceil(realWidth / (fontSize / ratio));
      // console.log('-wordCount:', wordCount)

      const chineseWords = content.match(/[^\x00-\xff]/g);
      const chineseCount = chineseWords && chineseWords.length || 0;
      // 非中文字符的宽度只有中文字符的一半
      const length = (content.length - chineseCount) / 2 + chineseCount;
      return length > wordCount ? 2 : 1;
    }

    /**
     * 计算卡片title的高度，title可能单行也可能2行展示
     * @param {string} content
     * @param {number} cardMargin
     */
    function caclTitleHeight(content, cardMargin) {
      const line = getLineNumOfText(content, cardMargin);
      // console.log('---line: ', line);
      if(line == 0) return 0;
      if(line == 2) {
        // lineHeight * 2 + paddingTop
        const height = 36 * 2 + 20;
        return height;
      }
      return 56;
    }

/**
 * 是否中文字符
 * @param word
 * @return {boolean}
 */
function isChinese(word) {
    const reg = /[^\x00-\xff]/g;
    return reg.test(word);
}
/**
 * 计算一段文案的宽度
 * @param {string} str
 * @param {number} fontSize
 */
function calcTextWidth(str, fontSize) {
    if(!str) {
        return 0;
    }
    let totalWidth = 0;
    for(let i = 0; i < str.length; i++) {
        totalWidth += isChinese(str[i]) ? fontSize : (fontSize/2);
    }
    return totalWidth;
}
/**
 * itag是否应该放在titile后面
 * @param {string} title
 * @param {string} itagText
 * @param {boolean} hasIcon itag是否有icon
 */
function addItagToTitle(title, itagText, hasIcon) {
    if(!title || !itagText) {
        return false;
    }
    const cardMargin = 32; // 单位rpx
    const cardWidth = 343; // 单位rpx
    const fontSize = 28; // rpx
    const contentWidth = cardWidth - cardMargin;
    // const realWidth = contentWidth / ratio;
    // const realFontSize = fontSize / ratio;
    const iTagWidth = 6 * 2 + (hasIcon ? 24 : 0) + calcTextWidth(itagText, 20);
    let firstLineLength = 0;
    let leftStr = '';
    for(let i = 0; i < title.length; i++) {
        firstLineLength += isChinese(title[i]) ? fontSize : (fontSize / 2);
        if(firstLineLength > contentWidth) {
            leftStr = title.substring(i);
            break;
        }
    }
    if(!leftStr) {
        return iTagWidth + firstLineLength > contentWidth ? false : true;
    }
    return iTagWidth + calcTextWidth(leftStr, fontSize) > contentWidth ? false : true;
}

/**
 * 处理图片信息及切图
 * @param img
 * @return {{}}
 */
function handleImageInfo(img) {
      if(!img) {
        return {};
      }
      let image = {};
      image.url = img.url || '';
      image.width = img.width || '';
      image.height = img.height || '';
      const isHorizontalImage = Number(image.width) >= Number(image.height);
      image.url = concatImgSuffix(image.url, isHorizontalImage);
      return image;
    }

module.exports = {
    concatImgSuffix,
    concatImgSize,
    caclTitleHeight,
    handleImageInfo,
    addItagToTitle
};
