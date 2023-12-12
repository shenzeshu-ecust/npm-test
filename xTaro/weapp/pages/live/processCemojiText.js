
import { cwx, CPage, __global } from '../../cwx/cwx.js';
const QUERY_MAPPING_URL = 'https://m.ctrip.com/restapi/soa2/19530/getEmojiImageMap';
let isFetching = false;
let callbackQueue = [];
let wordImgMapping = {};
const _STORAGE_KEY = 'cemojiMapping'

const fetchCEmojiMap = (callback) => {
  callbackQueue.push(callback);
  if(isFetching) {
    return;
  }

  isFetching = true;
  console.log('request: ', callbackQueue)
  wx.request({
    url: QUERY_MAPPING_URL,
    data: {},
    method: 'GET',
    success: function(res) {
        if(res && res.statusCode === 200) {
          console.log('request success: ', res)
          let mapObj = {};
          if (res.data && res.data.data && res.data.data.map) {
            mapObj = res.data.data.map;
          }

          isFetching = false;
          if(callbackQueue && callbackQueue.length) {
            let item = null;
            while(item = callbackQueue.shift()) {
              if(item && typeof item === 'function') {
                try {
                  item(mapObj)
                } catch(e) {
                  console.log('fetchCEmojiMap === catch error ===', e)
                }
              }
            }
          }
        }
    },
    fail: function(err) {
      console.log('fetchCEmojiMap === fail ===', err)
    }
  })
}

function processCemojiText(text, cemojiStyle,  callback) {
    // 测试样例：[[[[[[[[[[][Love]]]][]p][][][][]][][]][[[[[[[[ []][2:00]][OK][[[[[[[OK]]]]]]]]]]
    if(!text) {
        return;
    }
    let res;

    // 0. 判断内存变量中有没有数据 => 判断 localStorage 中有没有数据 => 发请求
    if(wordImgMapping && JSON.stringify(wordImgMapping) !== '{}') {
        res = replaceEmojiText(text, cemojiStyle);
    } else {
        let _storageData = cwx.getStorageSync(_STORAGE_KEY);
        if(_storageData && JSON.stringify(_storageData) !== '{}') {
            wordImgMapping = _storageData;
            res = replaceEmojiText(text, cemojiStyle);
        } else {
            fetchCEmojiMap((data) => {
                if(JSON.stringify(data) !== '{}') {
                    wordImgMapping = data;
                    res = replaceEmojiText(text, cemojiStyle)
                    if(callback && typeof callback === 'function') {
                        callback(res);
                    }

                    cwx.setStorageSync(_STORAGE_KEY, data);
                }
            })
        }
    }

    if(callback && typeof callback === 'function') {
        callback(res);
    }
}

function replaceEmojiText(text, cemojiStyle) {
    let _matchWordArr = text.match(/\[[^(\[|\])]+\]/g);
    let showContent = `${text}`;

    _matchWordArr && _matchWordArr.map(item => {
    // 正常情况下，这时 item 是被 [] 包围的，掐头去尾
    let itemContent = item;
    if(itemContent[0] === '[') {
        itemContent = itemContent.substring(1)
    }
    if(itemContent[itemContent.length - 1] === ']') {
        itemContent = itemContent.substring(0, itemContent.length - 1)
    }

    if(itemContent && wordImgMapping[itemContent]) {
        // console.log(`=== map中有key ${itemContent}，找到对应的图片了`)
        let nodeContent = `<img style="${cemojiStyle}" width="19px" src=${wordImgMapping[itemContent]}></img>`;
        showContent = showContent.replace(item, nodeContent)
    }
    })

    return showContent;
}

export {
    processCemojiText
}