/**
 * author: qiuyuzhang
 * description: 从 cemojiConverter 中提取出来的 jssdk
 * 包含 2 个功能函数: 
 * 1. getCEmojiMapData: 获取 cemoji mapping 数据
 * 2. convertCEmojiInput: 将输入的文本转换成可展示的文本
 */
import {cwx} from "../cwx.js";
const STORAGE_KEY_GIF = 'cemojiMappingGif'; // 新的缓存key名
const STORAGE_KEY = 'cemojiMapping'; // 老的缓存key名
let cemojiMapData = null; // 内存变量
let callbackQueue = []; // 请求接口回调队列
const QUERY_MAPPING_URL = '/restapi/soa2/19530/getEmojiImageMap';
let isFetching = false;

/**
 * 返回 cemoji mapping 数据
 * 取值先后顺序： 内存 -> 缓存 -> 请求接口
 * 初次获取时，请求接口获取最新的数据，异步更新内存变量及本地缓存
 * @param { Function } updateCB, 在请求接口获取到最新数据后，会调用 updateCB, 并入参最新数据
 * @returns 
 */
function getCEmojiMapData (updateCB) {
  if (isFetching && typeof updateCB === "function") {
    callbackQueue.push(updateCB);
  }
  // 首次使用时，内存变量为空
  if (cemojiMapData) {
    return cemojiMapData;
  }
  // 获取本地缓存，不管是否有值，都返回，并请求接口获取新的数据
  cemojiMapData = cwx.getStorageSync(STORAGE_KEY_GIF);

  // 请求接口，获取新的数据
  fetchCEmojiMap()
  return cemojiMapData;
}

function fetchCEmojiMap () {
  if (isFetching) {
    return;
  }

  isFetching = true;
  cwx.request({
    url: QUERY_MAPPING_URL,
    data: {
      type: "gif" // 表示获取全量
    },
    method: 'POST',
    success: function (res) {
      if (res && res.statusCode === 200 && res.data && res.data.data && res.data.data.gifMap) {

        let data = res.data.data.gifMap;
        // 修改内存变量
        cemojiMapData = data;
        // 修改本地缓存
        cwx.setStorageSync(STORAGE_KEY_GIF, data);
        cwx.removeStorage({ // 清理之前的老缓存，过段时间可以删掉这块逻辑
          key: STORAGE_KEY,
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })

        isFetching = false;
        if (callbackQueue && callbackQueue.length) {
          let item = null;
          while (item = callbackQueue.shift()) {
            if (item && typeof item === 'function') {
              try {
                item(data)
              } catch (e) {
                console.error('fetchCEmojiMap catch error:', e)
              }
            }
          }
        }

      }
    },
    fail: function (err) {
      console.error('fetchCEmojiMap fail:', err)
    }
  })
}

// 测试样例：[[[[[[[[[[][Love]]]][]p][][][][]][][]][[[[[[[[ []][2:00]][OK][[[[[[[OK]]]]]]]]]]
/**
 * 将输入的文本转换成可展示的文本
 * @param { Object } inputObj 
 * @returns { String } showContent
 */
function convertCEmojiInput (inputObj) {
  if (!inputObj || typeof inputObj.text !== "string") {
    return;
  }

  let {
    text = "", wrapperStyle = "", type = "image", cemojiStyle = ""
  } = inputObj;
  let _matchWordArr = text.match(/\[[^(\[|\])]+\]/g);
  // console.log('匹配结果，被[ ]包裹的单词列表：', _matchWordArr);

  let showContent = `<div style="${wrapperStyle}">${text}</div>`;
  let _wordImgMapping = getCEmojiMapData();
  // console.log('=== _wordImgMapping', _wordImgMapping)

  // todo??? item 如果是重复的，replaceAll 性能会不会好一些
  _matchWordArr && _matchWordArr.map(item => {
    // 正常情况下，这时 item 是被 [] 包围的，掐头去尾
    let itemContent = item;
    if (itemContent[0] === '[') {
      itemContent = itemContent.substring(1)
    }
    if (itemContent[itemContent.length - 1] === ']') {
      itemContent = itemContent.substring(0, itemContent.length - 1)
    }

    if (itemContent && _wordImgMapping[itemContent]) {
      // console.log(`=== map中有key ${itemContent}，找到对应的图片了`)
      let src = _wordImgMapping[itemContent];
      if (typeof src === "object") {
        src = type && src[type] || src.image || '';
      }
      showContent = showContent.replace(item, `<img style="${cemojiStyle}" src="${src}"></img>`)
    }
  })
  return showContent;
}
export {
  getCEmojiMapData,
  convertCEmojiInput
}