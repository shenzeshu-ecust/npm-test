const noop = () => {}

const extend = Object.assign

const isType = (val, type) => {
    return Object.prototype.toString.call(val) === '[object ' + type + ']'
}
const isUndefined = (val) => isType(val, 'Undefined')
const isNull = (val) => isType(val, 'Null')
const isNumber = (val) => isType(val, 'Number') && !isNaN(val)
const isString = (val) => isType(val, 'String')
const isArray = (val) => isType(val, 'Array')
const isFunction = (val) => isType(val, 'Function')
const isPlainObject = (val) => isType(val, 'Object')

const throttle = function(fn, delay, immediate, context) {
    let throttleTimer = null
    let throttleStart

    return function() {
        var ctx = context || this,
            args = arguments,
            now = Date.now()

        if (immediate && !throttleStart && delay !== 0) {
            fn.apply(ctx, args)
        }

        if (!throttleStart) {
            throttleStart = now
        }

        if (now - throttleStart >= delay) {
            throttleStart = now
            clearTimeout(throttleTimer)
            fn.apply(ctx, args)
        } else {
            clearTimeout(throttleTimer)
            throttleTimer = setTimeout(() => {
                throttleStart = Date.now()
                fn.apply(ctx, args)
            }, delay)
        }
    }
}


/**
 * 小程序接口封装
 */
const navTo = (url, params) => {
    if (isPlainObject(params)) {
        url += '?' + param(params)
    }
    wx.navigateTo({
        url: url
    })
}

const showToast = (options, duration, cb) => {
    var defaultOptions = {
        title: '',
        icon: 'none', // 有效值 "success", "loading", "none"
        duration: 3000,
        mask: true,
        success: noop,
        fail: noop,
        complete: noop
    }

    if (isString(options)) {
        options = extend(defaultOptions, {
            title: options,
            duration: duration || 2000,
            success: cb || noop
        })
    } else if (isPlainObject(options)) {
        options = extend(defaultOptions, options)
    } else {
        options = defaultOptions
    }

    wx.showToast(options)
}

const showLoading = (title, needMask = true) => {
    wx.showLoading({
        title: title || '加载中',
        mask: needMask,
        success: noop,
        fail: noop
    })
}

const hideLoading = () => wx.hideLoading()

const showModal = wx.showModal

const showActionSheet = wx.showActionSheet

/**
 * 图片url转化为裁剪后的url
 * http://conf.ctripcorp.com/pages/viewpage.action?pageId=106239834
 * @param options.type
 *    R：固定宽高（压缩）    R_120_120
 *    C：固定宽高（压缩或者放大）    C_600_400
 *    W：高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩）   W_640_0, W_0_600
 *    Z：高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩或者放大）    Z_750_0, Z_0_640
 * @param options.width，options.height
 *    支持的数值详见下面链接
 *    http://conf.ctripcorp.com/pages/viewpage.action?pageId=103820573
 * @param options.quality
 *    10, 20, ....,90, 100
 */
const cutImg = (url, options) => {
    options = _.extend(
        {
            type: 'W',
            width: 600,
            height: 0,
            quality: 90
        },
        options || {}
    )

    if (typeof url !== 'string') return url

    // http://dimg04.c-ctrip.com/images/700w0k000000bjmnsD51B.jpg
    // http://images4.c-ctrip.com/target/Z9040j000000a9im1F66C.jpg
    if (!/(ctripcorp|(dimg04|images4)\.c-ctrip)\.com\/(images|target)/i.test(url)) return url // 非ctrip cdn图片
    if (/(_\w+)+/i.test(url)) return url // 不是原图

    let matches = url.match(/(\S+?)\.(jpg|jpeg|png)/i)
    if (!matches) return url
    let [, urlBase, format] = matches
    // https://images4.c-ctrip.com/target/Z90e0j000000ahffx0444.png
    if (format === 'png') format = 'jpg' // png转为jpg

    let { type, width, height, quality } = options
    url = `${urlBase}_${type}_${width}_${height}_Q${quality}.${format}`
    return url
}

/**
 * 给后端的统一的用户信息对象
 * @param Object userInfo   -- 用户点击button组件时授权获取
 */
const getWxUserInfo = (userInfo = {}) => {
    return {
        // openid: '',
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl, // 最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像）
        gender: userInfo.gender, // 值为1时是男性，值为2时是女性，值为0时是未知
        city: userInfo.city,
        country: userInfo.country,
        province: userInfo.province,
        language: userInfo.language
    }
}


/**
 * 用于返回页 onShow 时是否要 reload 数据
 * @param String  page    下面map中的key
 */
const RELOAD_PAGE_MAP = {
    orderlist: 'pages/dingzhi/order/orderlist/orderlist',
    team: 'pages/dingzhi/checkin/team/team'
}
const setPageReloadOnShow = (page = '') => {
    const pages = getCurrentPages() || []
    page = RELOAD_PAGE_MAP[page]

    pages.some((pageObj) => {
        if (pageObj.route === page) {
            pageObj.__reloadOnShow__ = true
            return true
        }
    })
}
const hasPageLoaded = (page = '') => {
    const pages = getCurrentPages() || []
    page = RELOAD_PAGE_MAP[page]

    return pages.some((pageObj) => {
        if (pageObj.route === page) {
            return true
        }
    })
}

const getParamFromUrl = (name, url) => {
    name = name.replace(/[\[\]]/g, '\\$&')
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}


//处理tags标签列表的高度问题（swiper必须给一个高度）
const swiperHeigth = function (porlist) {
    let heights = []
    porlist.map( item => {
        var inner = item
        //处理基础高度
        var height = 0
        inner.map( item => {
          if(item.style){
            if(item.style =="big"){
              height = height + 450
            }else{
              height = height + 242
            }
          }else{
            height = height + 0
          }
        })
        //处理desc的高度
        inner.map( item => {
          if(item.desc){
            height = item.desc.length>27 ?  height+88: height+55
          }
        })
       heights.push(height)
      })
      return heights

};

export default {
    noop,
    extend,
    isType,
    isUndefined,
    isNull,
    isNumber,
    isString,
    isArray,
    isFunction,
    isPlainObject,
    throttle,

    cutImg,
    getWxUserInfo,
    setPageReloadOnShow,
    hasPageLoaded,


    navTo,
    showToast,
    showLoading,
    hideLoading,
    showModal,
    showActionSheet,
    getParamFromUrl,
    swiperHeigth

}
