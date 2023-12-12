const assists = {
    indexHeadSvga: 'https://pages.c-ctrip.com/market/components/static/duobao/index_head.svga',
    indexHeadSvga2:"https://images3.c-ctrip.com/marketing/2022/10/egine/index_head.svga",
    firstSendCoupon1: "https://images3.c-ctrip.com/marketing/2022/10/egine/firstSendCoupon1.svga",
    firstSendCoupon2: "https://images3.c-ctrip.com/marketing/2022/10/egine/firstSendCoupon2.svga",
    yoTrans:"https://images3.c-ctrip.com/marketing/2022/10/egine/yo-trans.svga",
    indexHead: "https://images3.c-ctrip.com/marketing/2022/10/egine/indexHead.gif",
}

const guideAssist = {
  step1: 'https://pages.c-ctrip.com/market/components/static/duobao/firstSendCouponMin1.gif',
  step2: 'https://pages.c-ctrip.com/market/components/static/duobao/img_carddialog_card.png',
  step3: 'https://pages.c-ctrip.com/market/components/static/duobao/firstSendCouponMin2.gif',
  step4: 'https://pages.c-ctrip.com/market/components/static/duobao/yo-trans.gif',
}

// 活动状态： 0=未开奖，1=待开奖，2=开奖成功，3=无中奖数字，4=开奖失败
// 1 立即加投 2继续加投 3中奖 4夺宝号已满 待开奖 5未中奖 6开奖失败-总数不足 7开奖失败-无人
const resolveStatus = (val) => {
    const { activityStatus, winNumber, reached, numberFull, join } = val
    if (activityStatus == 0 || activityStatus == 1) {
        if (!join) {
            // 活动进行中 未参与过
            return '1'
        } else if (numberFull) {
            // 我的夺宝号已满
            return '4'
        } else {
            // 继续加投
            return '2'
        }
    } else if (activityStatus == 2) {
        if (winNumber > 0) {
            return '3' // 中奖
        } else {
            return '5'
        }
    } else if (activityStatus == 3) {
        return '7'
    } else if (activityStatus == 4) {
        return '6'
    }
}

const cmsActFat = 'MKT_7777_1667898630396'
const cmsActProd = 'MKT_GROUPBUY_1667901172608'

const legaoPrizeUrlFat = 'https://contents.ctrip.fat411.qa.nt.ctripcorp.com/huodong/myprize/index'
const legaoPrizeUrlProd = 'https://contents.ctrip.com/huodong/myprize/index?popup=close'



export {
    assists,
    resolveStatus,
    cmsActFat,
    cmsActProd,
    legaoPrizeUrlFat,
    legaoPrizeUrlProd,
    guideAssist
}