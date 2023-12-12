import create from '../../utils/create'
import { cwx } from '../../../../../cwx/cwx'
import {
    GetChatScenceQuestionListModel,
} from '../../../common/model'

// 纯组件 与业务数据无直接耦合关系。 组件的显示状态由传入的 props 决定，与外界的通讯通过内部 triggerEvent 暴露的回调
// triggerEvent 的回调函数可以改变全局状态，实现单向数据流同步所有状态给其他兄弟、堂兄、姑姑等组件或者其他页面
// 需要注意的是，加上 pure : true 之后就是纯组件，组件的 data 不会被合并到全局的 store.data 上
// 纯组件与业务数据无关，可移植和复用
// 纯组件只能通过 props 获得所需参数，通过 triggerEvent 与外界通讯

create({
    properties: {
        questionList: {
            type: Array,
        },
        questionsUrl: {
            type: String,
        },
        pageId: {
            type: String,
        },
    },

    data: {},
    ready: function () {
        console.log(this.properties.questionList)
    },
    methods: {
        goToBuAnswer (e) {
            let item = e.currentTarget.dataset.item
            if (item.ScenceUrl){
                //IM+
                cwx.component.cwebview({
                    data: {
                        url: encodeURIComponent(item.ScenceUrl),
                    },
                })

                return
            }
            cwx.getCurrentPage().navigateTo({
                url: '/pages/train/service/service',
                data: {
                    item,
                    oid: this.store.data.oid,
                    isGetAnswer: true,
                },
            })
        },
        goQuestionList() {
            if (this.properties.questionsUrl){
                //IM+
                cwx.component.cwebview({
                    data: {
                        url: encodeURIComponent(this.properties.questionsUrl),
                    },
                })

                return
            }
            const promise = new Promise((resolve, reject) => {
                const params = {
                    Channel: 'ctripwx',
                    PageId: this.properties.pageId,
                    OrderInfo: {
                        OrderId: this.store.data.oid,
                        OrderStatus: this.store.data.orderInfo.OrderStatus.toString(),
                    },
                }
                GetChatScenceQuestionListModel(params, res => {
                    if (res.RetCode == 1 && res.QuestionInfoList) {
                        resolve(res.QuestionInfoList)
                    } else {
                        reject()
                    }
                })
            })
            cwx.getCurrentPage().navigateTo({
                url: '/pages/train/service/service',
                data: {
                    isGetAnswer: false,
                    promise,
                    oid: this.store.data.oid,
                },
            })
        },
    },
})
