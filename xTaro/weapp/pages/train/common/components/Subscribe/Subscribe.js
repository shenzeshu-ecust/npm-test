/*
 * @Date: 2021-12-30 10:50:14
 * @LastEditors: huyu huyu@trip.com
 * @LastEditTime: 2023-07-12 15:37:56
 * @Description: 抽离订阅逻辑
 */
import {
    QuerySubscribeMessageStatusModel,
    SubscribeMessageTemplateModel,
} from "../../model";
import { cwx } from "../../../../../cwx/cwx";
import util from "../../util";

const requestQuery = (params) =>
    util.promisifyModel(QuerySubscribeMessageStatusModel)(params);
const requestSubscribe = (params) =>
    util.promisifyModel(SubscribeMessageTemplateModel)(params);

const querySubscribeStatus = (list) => {
    const reqs = list.map(({ ActivityCode, FromType }) =>
        requestQuery({
            ActivityCode,
            FromType,
        })
    );

    return Promise.all(reqs).then((data) =>
        data.map(({ Status }, i) => ({
            id: list[i].id,
            Status: Status === 1, //  1 已订阅
        }))
    );
};

const subscribeTemplate = (list, payload = {}) => {
    const reqs = list.map(({ id, ActivityCode, FromType }) =>
        requestSubscribe({
            TemplateIDList: [id],
            ActivityCode,
            FromType,
            ...payload,
        })
    );

    return Promise.all(reqs);
};

/**
 * 目前可以统一使用的订阅方法(希望没事
 * checkSubscribeStatus 检测订阅状态
 * requestSubscribe 订阅需要订阅的模板
 * 如何使用:
 * - 页面加载时(或者不与调用订阅方法在同一个事件中)调用状态检查方法，返回的模板对象会添加 status 字段表示是否已添加订阅
 * - 将状态检查返回的模板对象数组作为入参，调用订阅方法，会根据模板的 status 决定哪些模板是可以订阅的
 * - 订阅成功情况包含两个状态：用户确认订阅；用户取消订阅。根据返回对象是否含有 errMsg 判断是否订阅
 * - 订阅失败一般都是接口失败
 * 例子可以参考：效果外化 shareCoupon/shareCoupon
 */
export const subscribeMixin = {
    /**
     * 传入数据格式
     * @param {Object[]} list 模板数组
     * @param {String} list[].ActivityCode 火车票的订阅服务需要参数，一个 code 一个模板
     * @param {Number} list[].FromType  0=砍价订阅模板，1=红包节订阅模板，2=购票提醒(BI发送，ActivityCode=CtripBuyTicketForBISend) , 5=目的地盲盒，6=抢票助力裂变，7=效果外化，8=公众号渠道领取新客礼包，9=小程序助力领取新客礼包 10=获得奖励通知（抢票助力页面不能助力的用户2.17版本）
     * @param {String} list[].id 市场订阅模板 id
     */
    checkSubscribeStatus: (list) =>
        querySubscribeStatus(list)
            .then((states) => {
                // 只获取火车票服务订阅状态足矣，发起订阅时，市场会自己请求订阅状态
                const stateList = list.map((v) => {
                    const { id } = v;
                    const { Status } = states.find((val) => val.id === id);

                    return {
                        ...v,
                        status: Status,
                    };
                });

                return stateList;
            })
            .catch((e) => {
                util.showToast("订阅失败，请稍后再试", "none");
                console.log("火车票订阅状态接口失败", e);
                return null;
            }),
    /**
     * 发起订阅方法
     * @param {Object[]} list  模板数组
     * @param {String} list[].ActivityCode 火车票的订阅服务需要参数，一个 code 一个模板
     * @param {Number} list[].FromType  0=砍价订阅模板，1=红包节订阅模板，2=购票提醒(BI发送，ActivityCode=CtripBuyTicketForBISend) , 5=目的地盲盒，6=抢票助力裂变，7=效果外化，8=公众号渠道领取新客礼包，9=小程序助力领取新客礼包
     * @param {String} list[].id 市场订阅模板 id
     * @param {Boolean} list[].status 该模板的订阅状态  true 已订阅 false 未订阅
     * @param {Boolean} [list[].special=false] special字段说明这个模板特殊，需要单独加入 ActivityCode 进行订阅
     * @param {Object} [payload] 传入订阅所需参数 非必填
     * @param {String=} payload.OrderNumber
     * @param {String=} payload.OpenID
     * @param {String=} payload.ShareAuth
     * @param {String=} payload.NickName
     * @param {String=} payload.PhotoUrl
     * @return {Promise.resolve} 返回值 { errMsg, subIds, unSubIds }
     */
    requestSubscribe: (list, payload) => {
        const needSubList = list.filter((v) => !v.status);
        const tempIDs = needSubList.map((v) => v.id);

        console.log("传入模板", tempIDs, list);
        return new Promise((resolve, reject) => {
            if (!tempIDs.length) {
                return resolve({});
            }

            cwx.mkt.subscribeMsg(
                tempIDs,
                ({ errMsg, templateSubscribeStateInfos: tempInfos }) => {
                    if (errMsg) {
                        console.log("用户取消订阅");
                        return resolve({ errMsg });
                    }
                    let subStatusList = tempInfos
                        ?.filter((v) => v.subscribeState)
                        ?.map(({ templateId }) =>
                            list.find((v) => v.id === templateId)
                        );

                    subStatusList = subStatusList.length
                        ? subStatusList
                        : needSubList;

                    const subIds = subStatusList.map((v) => v.id);
                    const unSubIds = util.getArrDiff(tempIDs, subIds);

                    console.log("订阅与没订阅的模板id", subIds, unSubIds);
                    subscribeTemplate(subStatusList, payload)
                        .then(() => {
                            util.showToast("订阅成功", "none");
                            resolve({ subIds, unSubIds });
                        })
                        .catch((e) => {
                            console.log("火车票订阅失败", e);
                            util.showToast("订阅失败，请稍后重试", "none");
                            reject(e);
                        });
                },
                (err) => {
                    console.log("市场订阅失败", err);
                    // 组件内的点击订阅事件有毒 总报错非用户点击事件 sb
                    if (err?.errMsg?.includes('TAP gesture')) return reject(err)
                    util.showToast("订阅失败，请稍后重试", "none");
                    reject(err);
                }
            );
        });
    },

    // 传入的模板数组不是微信小程序长期订阅的信息的数组
    async getNotLongSubIds(templateArr=[]) {
        return new Promise((resolve, reject) => {
            wx.getSetting({
                withSubscriptions: true,
                success (res) {
                    console.log(res.subscriptionsSetting,'subscriptionsSetting')
                    const subscriptionsSetting = res.subscriptionsSetting
                    if(subscriptionsSetting?.mainSwitch) {
                        const longTemplateArr = Object.keys(subscriptionsSetting.itemSettings || {})
                        resolve(templateArr.filter(item => !longTemplateArr.includes(item)))
                    } else {
                        resolve([])
                    }
                },
                fail() {
                    resolve([])
                }
            })
        })
    }
};
