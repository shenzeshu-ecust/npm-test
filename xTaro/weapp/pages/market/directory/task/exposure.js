
import {
  cwx
} from "../../../../cwx/cwx.js";
class Exposure {
  constructor(ins, ubtfn) {
    this.IntersectionObserver = ins.createIntersectionObserver({ observeAll: true }) 
    // this.pageId = undefined
    // this.__getPageArgs()
    this.ubtfn = ubtfn
  }
  __getPageArgs() {
    // try {
    //   let mPage = cwx.getCurrentPage()
    //   this.pageId = mPage ? (mPage.pageid || mPage.pageId || '') : ''
    // } catch (error) {
      
    // }
  }
  // 如果有性能够问题 需要在这里优化
  observe = (targetSelector) => {
    if (targetSelector) {
      setTimeout(() => {
        this.IntersectionObserver.observe(targetSelector, (res) => {
          if (res.intersectionRatio <= 0) {
            return
          }
          // if (typeof this.pageId == 'undefined') {
          //   this.__getPageArgs()
          // }
          const dataset = res.dataset
          this.ubtfn && this.ubtfn({
            ...dataset
          })
        })
      }, 0)
    }
  }
  relativeTo(...args) {
    this.IntersectionObserver.relativeTo(...args)
    return this
  }
  relativeToViewport(...args) {
    this.IntersectionObserver.relativeToViewport(...args)
    return this
  }
  disconnect() {
    // this.IntersectionObserver.disconnect()
    return this
  }
}

export default Exposure