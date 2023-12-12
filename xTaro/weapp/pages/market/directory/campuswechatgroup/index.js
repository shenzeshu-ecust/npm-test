import { cwx, CPage, __global } from "../../../../cwx/cwx.js";
const UTILS = require("../../common/utils.js");

const wxTitleList = [
  '携程校园权益大派送，优惠券礼包',
  '抢票VIP、酒店优惠券速来',
  '瞅瞅携程校园福利包有啥',
  '来薅张携程校园福利卡吧',
  '点一下，携程校园福利免费领',
  '携程校园青春无限专享权益',
  '携程校园福利卡带你全宇宙浪一浪',
  '盘他！康康这个携程校园福利包',
  '支棱起来了！手下这个携程校园福利包',
  '在？免费领个携程校园福利卡？',
  '小朋友，你是否有很多问号',
  '感受一下这深藏blue的福利',
  '我从未见过如此“豪横”的大礼包',
  '“老师好，我们的福利齁甜~”',
  '同学，送你一张抢票VIP',
  '同学，买门票订酒店用红包了么？',
  'TA对红包出手了',
  '谁领不到？侮辱性极强',
  '纯享版福利来了',
  '点  大礼包  懂？',
  '这大礼包，开始我以为是青铜，没想到是王者',
  '小编，这么大的礼包，你要是被绑架了你就眨眨眼',
  '学生权益和礼包，盘他！',
  '看到这学生大礼包，我支棱起来了',
  '羊毛！来不及解释，坐稳上车',
  '免费，羊毛，直接领',
  '说三遍！发宿舍礼包！上车',
  '大礼包免费领，我先冲了！',
  '在吗同学？搞钱吗？领礼包吗？',
  '臭弟弟，礼包我准备好了，有时间吗？',
  '小手一戳千元福利到手，好家伙！',
  '这个福利可盐可甜',
  '点我，领福利，去浪',
  '我只是一个平平无奇的千元礼包罢了',
  '叮叮叮小闹钟，起来领点福利778',
  '第一份校园福利，这里领',
  '叮咚！请查收你的超值福利',
  '见男/女朋友小Tip，你需要这个！',
  '珍惜每段旅行，更珍惜旅行的你',
  '无畏远方，携程学生锦鲤卡助力非凡的你！',
  '哪有天上掉的大礼包？欸，这就有！',
  '假期出门有携程锦鲤卡真的可以为所欲为吗？是的！'
]

CPage({
  pageId: '10650087444',
  data: {
    chatGroupUrl1:'',
    chatGroupUrl2:''
  },
  onReady() {
    UTILS.getOpenid(() => {
      this.getEntryGroupConf('4cd51a1dea87479e9b566ba01c1f0677','chatGroupUrl1')
      this.getEntryGroupConf('01a7ce6aa10e422fb396ba5ca249e94a','chatGroupUrl2')
    })
  },
  getEntryGroupConf(entryId,urlName){
    const params = {
      entryId,
      unionId: cwx.cwx_mkt.unionid || '',
    }
    UTILS.fetch("13218", "getRegionEntryGroupConf", params).then((res) => {
      if (res && !res.errcode) {
          this.setData({
            [urlName]: res.miniQrCode
          })
      }
    })
  },
  startmessage(){
    console.log('startmessage')
  },
  completemessage(){
    console.log('completemessage')
  },
  onShareAppMessage() {
    let title = wxTitleList[Math.floor(Math.random() * 42)]
    return {
      title,
      path: `/cwx/component/cwebview/cwebview?data={"url":"https%3A%2F%2Fm.ctrip.com%2Fwebapp%2Fmarket-app%2Fwechat%2Fcampus%3Factivityid%3DMKT_GROUPBUY_1618885265595%26pushcode%3Dcampus"}`,
      imageUrl: 'https://images3.c-ctrip.com/marketing/2021/03/campus_h5/wx-share.png'
    }
  }
})