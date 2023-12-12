const formators = {
  y: function(date, length) {
    date = date.getFullYear()

    return date < 0 ? 'BC' + (-date) : length < 3 && date < 2000 ? date % 100 : date
  },
  M: function(date) {
    return date.getMonth() + 1
  },
  d: function(date) {
    return date.getDate()
  },
  H: function(date) {
    return date.getHours()
  },
  m: function(date) {
    return date.getMinutes()
  },
  s: function(date) {
    return date.getSeconds()
  },
  e: function(date, length) {
    return (length === 1 ? '' : length === 2 ? '周' : '星期') + [length === 2 ? '日' : '天', '一', '二', '三', '四', '五', '六'][date.getDay()]
  }
}
export function getCurrentPageUrl() {
  var pages = getCurrentPages(), // 获取加载的页面
    currentPage = pages[pages.length - 1], // 获取当前页面的对象
    url = currentPage.route // 当前页面url

  return url
}
export const Utils = {
  parseDate(value, format) {
    if (value && !(value instanceof Date)) {
      if (format) {
        if (typeof value === 'number') {
          value = new Date(value)
        } else {
          var groups = [0],
            obj = {},
            /* eslint no-useless-escape: 0 */
            match = new RegExp(format.replace(/([-.*+?^${}()|[\]/\\])/g, '\\$1').replace(/([yMdHms])\1*/g, function(all, w) {
              groups.push(w)

              return '\\s*(\\d+)?\\s*'
            })).exec(value)
          if (match) {
            for (var i = 1; i < match.length; i++) {
              obj[groups[i]] = +match[i]
            }
          }
          value = new Date(
            obj.y || new Date().getFullYear(),
            obj.M ? obj.M - 1 : new Date().getMonth(),
            obj.d || 1,
            obj.H || 0,
            obj.m || 0,
            obj.s || 0
          )
        }
      } else {
        if ((typeof value === 'string') && /^(\d{4})[-/]?(\d{1,2})[-/]?(\d{1,2})( +(\d+):(\d+)(?::(\d+))?)?$/.test(value)) {
          value = new Date(
            RegExp.$1 >> 0,
            (RegExp.$2 >> 0) - 1,
            RegExp.$3 >> 0,
            (RegExp.$5 || 0) >> 0,
            (RegExp.$6 || 0) >> 0,
            (RegExp.$7 || 0) >> 0
          )
        } else { // 其他的, 则直接 传递给 Date 让 Date 去处理
          value = new Date(value)
        }
      }
    } else {
      value = value || new Date()
    }

    return value
  },
  formatDate(date, format) {
    if (!(date instanceof Date)) {
      date = this.parseDate(date)
    }

    return (format || 'yyyy/MM/dd HH:mm:ss').replace(/(\w)\1*/g, function(all, key) {
      if (key in formators) {
        key = '' + formators[key](date, all.length)
        while (key.length < all.length) {
          key = '0' + key
        }
        all = key
      }

      return all
    })
  },
  getValue(obj, keyChain, defaultValue) {
    if (!(obj instanceof Object) || typeof keyChain !== 'string') {
      return defaultValue
    } else {
      let tmpVal = obj
      const keys = keyChain.split('.')
      for (let i = 0; i < keys.length; i++) {
        if (tmpVal[keys[i]] === undefined) {
          return defaultValue
        } else {
          tmpVal = tmpVal[keys[i]]
        }
      }

      return tmpVal
    }
  },
  transformKeys(obj, keyPairs) {
    if (!(obj instanceof Object)) {
      return obj
    } else {
      const newObj = Object.create(null)
      Object.keys(obj).forEach(k => (newObj[keyPairs[k] || k] = obj[k]))

      return newObj
    }
  },
  obj2params(obj) {
    return Object.keys(obj).map(k => {
      const isObj = obj instanceof Object

      return `${k}=${isObj ? encodeURIComponent(JSON.stringify(obj[k])) : obj[k]}`
    }).join('&')
  },
  waitFor(millseconds) {
    return new Promise(resolve => setTimeout(resolve, millseconds))
  }
}
