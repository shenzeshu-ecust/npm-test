import { cwx } from "../../../../cwx/cwx.js";
import Api from "../../common/apis/restapi";
import { logWithUbtTrace } from '../../common/utils/util';
const urlUtils = require('../../common/utils/url');

const TRACE_TYPE = {1:'附近景点门票-单个景点', 2:'附近景点门票-查看全部'};
//Component Object
Component({
    properties: {
        hotelId:{
            type: String,
            value: '',
            observer: function(){}
        },
        pageId:{
            type: String,
            value: '',
            observer: function(){}
        }
    },
    data: {
        isNearbyScenic: false,
        scenicList: {},
        moreUrl:''
    },
    methods: {
        jumpToMarket: function(e) {
           this.trace(1);
           
           const {url} = e.currentTarget.dataset;
           if (url?.length > 0) {
               cwx.navigateTo({url: urlUtils.setParams(url, {'allianceid' : 3297573, "sid" : 12923153})});
           }
        },
        trace: function(type){
            let options = {
                type: TRACE_TYPE[type],
                page: this.data.pageId,
            };
            
            if (type == 1) {
                options.typeValue = {masterhotelid: this.data.hotelId};
            }
            
            logWithUbtTrace('209423', options);
        },
        findMore: function(e) {
            this.trace(2);

            if (this.data.moreUrl && this.data.moreUrl.length > 0) {
                cwx.navigateTo({url: `/pages/market/web/index?allianceid=3297573&sid=12923153&from=${encodeURIComponent(this.data.moreUrl)}`});
            }
        }
    },
    ready: function(){
        const self = this;
        Api.getNearbySightTest(self.data.hotelId)
            .then((rep) => {
                if (rep?.nearbySights?.length > 0) {
                    self.setData({ scenicList: rep.nearbySights, moreUrl: rep.moreUrl, isNearbyScenic: true});
                } else {
                    self.setData({ isNearbyScenic: false});
                }
            });
    },
});