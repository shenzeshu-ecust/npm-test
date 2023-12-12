/**
 * @description 老虎机游戏逻辑部分
 * @author pfan
 * 
 * * 调用方式：
 * 
 * 例如：import Machine from "./utils/machine.js"
 *
 *  wxss 文件需要引入 machine.wxss
 * `@import './utils/machine.wxss'`
 * 
 * wxml 文件需要引入 machine.wxml
 * 例如：<import src="utils/machine.wxml" />
 *      <template is = "machine" data="{{...machine}}"></template> 
 * 
 * js 中调用
 * 
 *   this.machine = new Machine(this, {
 *     height: 40,  //单个数字高度
 *     len: 10,     //单个项目数字个数
 *     transY1: 0,
 *     num1: 3,    //结束数字
 *     transY2: 0,
 *     num2: 0,    //结束数字
 *     transY3: 0,
 *     num3: 0,  //结束数字
 *     transY4: 0,
 *     num4: 1,  //结束数字
 *     speed: 24,  //速度
 *     callback: () => {
 *         //停止时回调        
 *     }      
 *   })
 */



export default class Machine {
  constructor(pageContext, opts) {
    this.page = pageContext
    this.height = opts.height
    this.len = opts.len

    this.isStart = false
    this.endCallBack = opts.callback
    this.page.start = this.start.bind(this)
  }

  start() {
    let {
      isStart,
      len,
      height,
      endCallBack
    } = this
    let num1 = this.page.data.num1
    let num2 = this.page.data.num2
    let num3 = this.page.data.num3

    if (isStart) return
    this.isStart = true
    let beishu = 3
    // 总高度
    let totalHeight = height * len * beishu
    // 计算最后停留的位置
    let endDis1 = totalHeight - height * (len - num1)
    let endDis2 = totalHeight - height * (len - num2)
    let endDis3 = totalHeight - height * (len - num3)
    console.log('totalHeight', totalHeight)
    console.log('停留的序号', num1, num2, num3)
    console.log('要停留的位置', endDis1, endDis2, endDis3)
      this.page.animate('.machine_item_slide0', [
        {
          translateY: 0,
        },
        {
          translateY: endDis1 * -1,
          ease: 'easeOutQuint'
        },
      ], 4000)

      setTimeout(() => {
        this.page.animate('.machine_item_slide1', [
          {
            translateY: 0,
          },
          {
            translateY: endDis2 * -1,
            ease: 'easeOutQuint'
          },
        ], 4000)
      }, 300)

      setTimeout(() => {
        this.page.animate('.machine_item_slide2', [
          {
            translateY: 0,
          },
          {
            translateY: endDis3 * -1,
            ease: 'easeOutQuint'
          },
        ], 4000, () => {
          this.isStart = false
          setTimeout(() =>{
            endCallBack && endCallBack()
          }, 80)
        })
      }, 600)
  }

  reset() {
    this.page.clearAnimation('.machine_item_slide0', { translateY: true }, function () {
      console.log("清除了#container上的opacity和rotate属性")
    })
    this.page.clearAnimation('.machine_item_slide1', { translateY: true }, function () {
      console.log("清除了#container上的opacity和rotate属性")
    })
    this.page.clearAnimation('.machine_item_slide2', { translateY: true }, function () {
      console.log("清除了#container上的opacity和rotate属性")
    })
  }

}