import {
    cwx
} from "../../../../cwx/cwx.js";
const UTILS = require('../../common/utils')
import model from './model';

// goldIcon: componentData.goldIcon, // 金币图
//         giftImage: componentData.giftImage, // 连签礼物图
//         wraperBgColor: componentData.wraperBgColor, // 背景色
//         wraperBgImage: componentData.wraperBgImage, // 背景图
        
//         signInBtnBgColor: componentData.signInBtnBgColor, // 按钮背景色
//         signInBtnBgImage: componentData.signInBtnBgImage, // 按钮背景图
//         signInBtnColor: componentData.signInBtnColor, // 按钮文案颜色
//         signInDoneBtnBgColor: componentData.signInDoneBtnBgColor, // 签到按钮已完成背景色
//         signInDoneBtnBgImage: componentData.signInDoneBtnBgImage, // 按钮已完成背景图
//         signInDoneBtnColor: componentData.signInDoneBtnColor, // 按钮已完成文案颜色
        
//         dotColor: componentData.dotColor, // 提示圆点颜色
//         signTypeColor: componentData.signTypeColor, // 签到类型文案颜色
        
//         itemColor: componentData.itemColor, // 单天文案颜色
//         itemBgColor: componentData.itemBgColor, // 单天背景颜色
//         itemBgImage: componentData.itemBgImage, // 单天背景图
        
//         processDoneColor: componentData.processDoneColor, // 进度条已完成颜色
//         processTodoColor: componentData.processTodoColor, // 进度条未完成颜色

Component({
    options: {
        addGlobalClass: true,
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        tempid: {
            type: String,
            value: ''
        },
        compid: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        legaoInfo: null,
        signDetail: null,
        signList: [],
        signRule: [],
        showRule: false
    },
    attached: function () {
        this.mPage = cwx.getCurrentPage()
        this.pageId = this.mPage ? (this.mPage.pageId || '') : ''
        this.initPage()
    },

    pageLifetimes: {
        show: function () {
          this.initPage()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        initPage: async function() {
            const { tempid, compid } = this.data
            if (!tempid){
                return
            }
            await this.fetchLegao()
            await this.getSignInDetail()
            await this.getSignRule()
        },
        fetchLegao: async function() {
            const { tempid, compid } = this.data

            const data = await model.loadTemplate(tempid, compid)
            this.setData({
                legaoInfo: data
            })
        },
        getSignInDetail: async function () {
            if (!this.data.legaoInfo) {
              this.logTrace('legaoInfo', null)
              return
            }
            const { channelCode } = this.data.legaoInfo
            const res = await model.getSignDetail({
                channelCode
            })
            if (res.code === 0) {
                const signDetail = {
                    signDay: res.signDay,
                    isSign: res.isSign,
                    totalDay: res.totalDay,
                    isShowTask: res.isShowTask,
                    signType: res.signType
                }
                const signList = this.buildSignInList(res)
                this.setData({
                    signDetail,
                    signList
                })
                this._triggerEvent('signinDetail', { detail: signDetail, list: signList })
                this.logTrace('签到列表', signList)
                this.logTrace('签到详情', signDetail)
            }
        },
        buildSignInList: function(res) {
          if (!this.data.legaoInfo) {
            this.logTrace('legaoInfo', null)
            return
          }
            const { styleType } = this.data.legaoInfo
            let signList = [...res.signList]
            signList.forEach((item, index) => {
                if (index < res.signDay) {
                    item.done = true
                } else {
                    item.done = false
                }
            })
            const selectEles = signList.filter(item => item.done == true)
            if (selectEles.length > 0) {
                selectEles[selectEles.length -1].select = 1
            }
            let displayCount = 7
            if (styleType == 1) {
                displayCount = 7
            } else if (styleType == 2) {
                displayCount = 3
            }
            const [start, end] = calcAmbit(res.totalDay, res.signDay, displayCount)
            signList = signList.slice(start, end)
            return signList
        },
        // 签到规则
        getSignRule: async function() {
          if (!this.data.legaoInfo) {
            this.logTrace('legaoInfo', null)
            return
          }
            const { channelCode } = this.data.legaoInfo
            const res = await model.getSignRule({
                channelCode
            })
            if (res.code === 0) {
                const signRule = resolveSignRule(res.signRule)
                this.setData({
                    signRule
                })
            }
        },
        // 签到
        signToday: async function() {
            const { channelCode } = this.data.legaoInfo
            const res = await model.signToday({
                channelCode
            })
            if (res.code === 0) {
                await this.getSignInDetail()
                cwx.Observer.noti("mkt_taskevent_acceptprize", {})
                this._triggerEvent('signinChange', { detail: this.data.signDetail, list: this.data.signList })
                this.logTrace('签到成功', res)
            } else if (res.code === -1) {
                cwx.user.login({
                  param: {
                    sourceId: "market"
                  },
                });
                console.log('未登录')
                return
            } else {
                UTILS.showToast(res.message)
            }
        },
        showRuleModal: function() {
            this.setData({
                showRule: true
            })
        },
        closeRuleModal: function() {
            this.setData({
                showRule: false
            })
        },
        _triggerEvent(type, data) {
            console.log('【taskSignIn组件 triggerEvent】', type, data)
            switch (type) {
                case 'signinDetail':
                    this.triggerEvent('signinDetail', data)
                    break;
                case 'signinChange':
                    this.triggerEvent('signinChange', data)
                    break;
            }
        },
        logTrace: function (action, params) {
            try {
                const _params = {
                    action,
                    "openid": cwx.cwx_mkt.openid || '',
                    "pageid": this.pageId,
                    data: params
                }
                console.log('[devTrace]o_mkt_miniapp_taskSignIn->', _params)
                this.mPage && this.mPage.ubtDevTrace && this.mPage.ubtDevTrace('o_mkt_miniapp_taskSignIn', _params);
            } catch (error) {}
        }
    },
})

function resolveSignRule(rule) {
  return rule
    // let arr = rule.split('\n');
    // return arr
}

// 计算展示的数组范围
function calcAmbit(total, cur, showCount) {
    let start,end;
    if (cur === 0) {
        return [0, showCount]
    }
    if (cur === total) {
        return [total - showCount, total]
    }
    
    let yu = cur % showCount
    let circle = Math.floor(cur / showCount)
    circle = yu === 0 ? circle - 1 : circle

    start = circle * showCount
    let endTemp = (circle + 1) * showCount
    end = endTemp > total ? total : endTemp
    return [start, end]
}
