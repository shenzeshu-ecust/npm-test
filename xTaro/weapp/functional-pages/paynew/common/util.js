/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2021-11-16 16:14:41
 * @LastEditors: wjp
 * @LastEditTime: 2022-07-06 09:50:56
 */
var ret = {};


ret.getParam = (param, url)=>{
  try {
    const paramStrArr = url.split('?');
    if(!paramStrArr.length){
        return null;
    }
    const paramStr = paramStrArr[1];
    const tempArray = paramStr.split('&');
    var tempObj = {};
    for (let i = 0; i < tempArray.length; i++) {
        let obj = tempArray[i];
        let innerTempArr = obj.split('=');
        tempObj[innerTempArr[0]] = innerTempArr[1];
    }
    if(tempObj[param]){
        return tempObj[param];
    }else{
        return null;
    }

  } catch (error) {
    return null
  }
};

ret.appendQuery = function (url, query) {
    var urlquery = (url + '&' + query) || '';
    return urlquery.replace(/[&?]{1,2}/, '?');
};

module.exports = ret;