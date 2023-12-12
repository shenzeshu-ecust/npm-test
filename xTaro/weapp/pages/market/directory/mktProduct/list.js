import { cwx, __global, _ } from "../../../../cwx/cwx.js";
import model from './../taskInvitePlus/model'
import { apiServer } from "./../videoTaskPage/api"
const UTILS = require('../../common/utils.js');

const tryJSONParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

const {
  shared,
  timing,
  decay,
  derived,
  runOnJS
} = wx.worklet

const categories = []
const products = []

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}

const InteractionState = {
  INITIAL: 0,
  ANIMATING: 1,
  UNFOLD: 2,
  SCROLL: 3,
  RESET: 4,
}

const clamp = (num, min, max) => {
  'worklet'
  return Math.min(Math.max(num, min), max)
}

Component({
  data: {
    statusBarHeight: 0,
    categories,
    selected: 0,
    list: categories.map(category => {
      return {
        header: category,
        data: products
      }
    }),
    expand: false,

    isForceShowAuthorization: true,
    updateType: "refresh",
    env: __global.env || "PROD",
    incrementalUpdateProduct: {},
    filteredGoodsList: [],
    activityId: "MKT_zeroConfig_1699496909970",
  },
  lifetimes: {
    created() {
      this._interactionState = shared(0)
      this._tabsTop = shared(0)
      this._mainHeight = shared(700)
      this._startY = shared(0)
      this._translY = shared(0)
      this._deltaY = shared(0)
      this._scrollTop = shared(0)
      this._canPan = shared(true)
    },
    attached() {
      const windowInfo = wx.getWindowInfo()
      this.setData({
        statusBarHeight: windowInfo.statusBarHeight
      })

      const updateNavBackColor = this.updateNavBackColor.bind(this)
      this._listenTranslY = derived(() => {
        'worklet'
        const expand = this._translY.value < -this._tabsTop.value / 2
        runOnJS(updateNavBackColor)(expand)
      })
      this.queryProductList()
    },
  },
  methods: {
    fillArray(arr, num = 900) {
      const targetLength = num;
      const originalLength = arr.length;
      if (originalLength < targetLength) {
        const loopCount = Math.ceil(targetLength / originalLength);
        const filledArray = [];

        for (let i = 0; i < loopCount; i++) {
          filledArray.push(...arr);
        }

        return filledArray.slice(0, targetLength);
      } else {
        return arr.slice(0, targetLength);
      }
    },
    /** 检测商卡高度 */
    checkProductHeight() {
      
    },
    /** 加载商品数据 */
    async queryProductList() {
      console.log('当前时间', UTILS.nowTimeStemp("str", 0))
      const res = await model.getActivityConfig({
        activityId: "MKT_zeroConfig_1699496909970",
      })
      console.log('cms返回值', res)
      if (res.errcode === 0) {
        if (res?.activityCustomfields?.customProductList) {
          let resList = []
          Object.keys(res?.activityCustomfields).forEach(item => {
            if (item && res?.activityCustomfields[item] && (typeof res?.activityCustomfields[item] === "string")) {
              resList = [...resList, ...JSON.parse(res?.activityCustomfields[item])]
            }
          })
          // console.log('cms商品列表', resList)
          if (resList.length < 700) {
            resList = this.fillArray(resList, res?.activitlyConfig?.activityRule * 1)
          }
          console.log('cms商品列表', resList)
          this.setData({
            filteredGoodsList: resList
          })
          this.checkProductHeight();
        }
      }
      this.queryLegaoProductSketch()
    },
    /** 加载乐高商卡结构 */
    async queryLegaoProductSketch() {
      console.log('加载乐高商卡结构')
    },
    /** 商品跳转得回调 */
    clickHandlersCallback(event) {
      const {
        url
      } = event?.detail?.product;
      if (url) {
        cwx.navigateTo({
          url: url,
        })
      }
    },
    updateNavBackColor(expand) {
      this.setData({
        expand
      })
    },
    handlePan(e) {
      'worklet'
      const _interactionState = this._interactionState
      if (this._interactionState.value === InteractionState.ANIMATING) {
        return
      }
      if (this._interactionState.value === InteractionState.RESET) {
        // 在 gesture active 期间触发的动画，在手指起来时才能重置回 INITIAL
        if (e.state === GestureState.END || e.state === GestureState.CANCELLED) {
          this._interactionState.value = InteractionState.INITIAL
        }
        return
      }

      if (e.state === GestureState.BEGIN) {
        const lastTranslY = clamp(this._translY.value, -this._tabsTop.value, 0)
        this._startY.value = e.absoluteY - lastTranslY
      }

      if (e.state === GestureState.ACTIVE) {
        if (this._interactionState.value === InteractionState.UNFOLD) {
          // 展开状态下，往上滑才折叠起来
          if (e.absoluteY - this._startY.value < 0) {
            this._interactionState.value = InteractionState.ANIMATING
            this._translY.value = timing(0.0, {
              duration: 250
            }, () => {
              'worklet'
              _interactionState.value = InteractionState.RESET
            })
          }
        } else {
          // 其它情况，跟随手指滑动
          this._translY.value = e.absoluteY - this._startY.value
        }
      }

      if (e.state === GestureState.END || e.state === GestureState.CANCELLED) {
        if (this._translY.value > 100) {
          // 超过 100 就展开
          this._interactionState.value = InteractionState.ANIMATING
          this._translY.value = timing(this._mainHeight.value, {
            duration: 250
          }, () => {
            'worklet'
            _interactionState.value = InteractionState.UNFOLD
          })
        } else if (this._translY.value > 0) {
          // 没超过 100 但还在下拉状态就回弹
          this._interactionState.value = InteractionState.ANIMATING
          this._translY.value = timing(0.0, {
            duration: 250
          }, () => {
            'worklet'
            _interactionState.value = InteractionState.INITIAL
          })
        } else if (this._translY.value > -this._tabsTop.value) {
          // 往上滑就做滚动动画
          this._interactionState.value = InteractionState.SCROLL
          this._translY.value = decay({
            velocity: e.velocityY,
            clamp: [-this._tabsTop.value, 0]
          })
        }
      }
      // console.log('@@@ pan', e.state, this._translY.value | 0, this._interactionState.value)
    },
    shouldPanResponse() {
      'worklet'
      return this._canPan.value
    },
    handleScroll(e) {
      'worklet'
      const _interactionState = this._interactionState
      this._scrollTop.value = e.detail.scrollTop
      if (this._scrollTop.value < 0 && !e.detail.isDrag && !this._canPan.value && this._interactionState.value !== InteractionState.ANIMATING) {
        this._interactionState.value = InteractionState.ANIMATING
        this._translY.value = timing(0.0, {
          duration: 250
        }, () => {
          'worklet'
          _interactionState.value = InteractionState.INITIAL
        })
      }
    },
    shouldScrollViewResponse(e) {
      'worklet'
      if (this._translY.value > -this._tabsTop.value) {
        this._canPan.value = true
      } else {
        // 触顶 && 往下拉时，pan 手势生效
        this._canPan.value = this._scrollTop.value <= 0 && e.deltaY > 0
      }
      return !this._canPan.value
    },
    /** 商品跳转得回调 */
    clickHandlersCallback(event) {
      const {
        url
      } = event?.detail?.product;
      if (url) {
        cwx.navigateTo({
          url: url,
        })
      }
    },
    exposureTrace() {

    }
  },
})