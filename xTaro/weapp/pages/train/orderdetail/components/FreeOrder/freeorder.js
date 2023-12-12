import cwx from '../../../../../cwx/cwx'


export default {
    data: {
    },
    methods: {
      onTextClickToFree() {
        this.ubtTrace('196277',{data:'点击弹窗关注公众号按钮'});
        const enURL = encodeURIComponent(`${this.data.freeOrderModalConfig.url}`)
        const url = `/pages/train/authorise/web/web?data={"url":"${enURL}"}`
        cwx.navigateTo({
          url
        })
      },
      onIconClickToFree() {
        this.ubtTrace('196280',{data:'点击关注公众号固定浮窗'});
        const enURL = encodeURIComponent(`${this.data.freeOrderIconConfig.url}`)
        const url = `/pages/train/authorise/web/web?data={"url":"${enURL}"}`
        cwx.navigateTo({
          url
        })
      },
      onBannerClickToFree() {
        const enURL = encodeURIComponent(`https://m.ctrip.com/webapp/train/activity/20200518-ctrip-official-accounts-guide?allianceid=30613&sid=2981008`)
        const url = `/pages/train/authorise/web/web?data={"url":"${enURL}"}`
      //   this.ubtTrace('c_trn_c_10320640941', {
      //     bizKey: 'accountFreeTicketClick',
      //     userid: cwx.user.duid 
      // })
        cwx.navigateTo({
          url
        })
       
      },
      closePop() {
        if (this.data.popType == 'FREEORDERMODAL') {
          this.ubtTrace('196278',{data:'点击关注公众号弹窗立即关注按钮'});
          this.setData({
            popType: '',
          })
        }
      }
    },
}
