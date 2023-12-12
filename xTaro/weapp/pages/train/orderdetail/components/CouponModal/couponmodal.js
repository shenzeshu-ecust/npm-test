import util from '../../../common/util'

export default {
    data:{

    },
    methods:{
        toDetailPage(e) {
            const { url, name } = e.currentTarget.dataset
            util.ubtTrace('c_trn_c_10320640941', {bizKey: "couponClick", value:'touse', couponname:name});
            util.jumpToUrl(url)
        },
        hideBackHotel(e) {
            const { closetype } = e.currentTarget.dataset
            util.ubtTrace('c_trn_c_10320640941', {bizKey: "couponClick", value:closetype, couponname:this.data.couponList.map(item =>item.Tittle)});
            this.setData({
                popType: '',
            })
        }
    }
}