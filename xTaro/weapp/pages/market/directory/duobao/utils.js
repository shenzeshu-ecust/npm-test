const resolveProcessWidth = (process, target) => {
    let ret = process / target
    if (ret > 1) ret = 1
    return `${ret * 100}%`
}
function parseJson(str, defVal = {}) {
    let ret = defVal
    try {
      ret = JSON.parse(str)
    } catch (error) {
    }
    return ret
  }

  function imageLoad(src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: src,
        success (res) {
          console.log(res, '--------')
          resolve(res)
        }
      })
    })
  }

  async function loadAssist(list){
    let _list = []
    let keys = []
    for(let key in list) {
      keys.push(key)
      _list.push(imageLoad(list[key]))
    }
    let ret = {}
    const retAll = await Promise.all(_list) 
    retAll.forEach((item, index) => {
      ret[keys[index]] = item.path
    })
    return ret
  }

export {
    resolveProcessWidth,
    parseJson,
    imageLoad,
    loadAssist,
}