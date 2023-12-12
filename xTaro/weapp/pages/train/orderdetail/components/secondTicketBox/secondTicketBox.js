import { cwx } from "../../../../../cwx/cwx";
import util from '../../../common/util';
export default {
    data: {
    },
    methods: {
        gotoOrderDetail(e) {
            const { ordernumber, currentordernumber } = e.currentTarget.dataset
            util.ubtTrace('TCWDetail_MultiRoutes_click', { 
                PageId: "10650037941", 
                orderId: currentordernumber,
                channel: "wx"
            })
            cwx.redirectTo({
                url: `/pages/train/orderdetail/orderdetail?oid=${ordernumber}`,
            })
        }
    }
}