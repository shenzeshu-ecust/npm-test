import { cwx } from "../../../../cwx/cwx.js";
import Api from "../../common/apis/restapi";
import { logWithUbtTrace} from '../../common/utils/util';

//Component Object
Component({
    properties: {
        hotelId:{
            type: String,
            value: '',
            observer: function(){}
        },
        hotelName:{
            type: String,
            value: '',
            observer: function(){}
        },
        pageId:{
            type: String,
            value: '',
            observer: function(){}
        },
        coordinate:{
            type: Object,
			value: {},
        },
        isOversea:{
            type: Number,
			value: 0,
        }

    },
    data: {
        isShowShuttle: false,
        shuttleAccount: 0,
        url: '',
        isShowCar: false,
        hotelCityId: 0,
        cityIdList: [59,58],//国内城市筛选香港澳门
        isShowBycity: false
    },
    methods: {
        tabClick: function(e) {
            const {type, text} = e.currentTarget.dataset;
            
            logWithUbtTrace('209423', {
                type: text,
                page: this.data.pageId
            });

            if (type == 2) {
                let jumpToUrl = `/pages/market/web/index?allianceid=3297573&sid=12923153&from=${encodeURIComponent(this.data.url)}`;
                cwx.navigateTo({url: jumpToUrl});
            } else {
                cwx.cwx_navigateToMiniProgram({
                    appId: 'wxe4bc565cbbf5e289',
                    path: '/pages/isd/indexNew/index?allianceid=3297573&sid=12922721&channelid=235523'
                });
            }
        },
    },
    ready: function(){
        const self = this;
        const cityId = self?.data?.coordinate?.cityId || 0;
        const checkCity = !self.data.cityIdList.includes(cityId);
        const checkOversea = self?.data?.isOversea === 0;
        self.setData({isShowBycity: checkCity && checkOversea});
        Api.getShuttleCar(self.data.hotelId)
            .then((rep) => {
                if (rep && rep.minAmount) {
                    self.setData({ shuttleAccount: rep.minAmount, url: rep.url, isShowShuttle: true, isShowCar: true});
                } else {
                    self.setData({ isShowCar: true});
                }
            },(reject) =>{
                self.setData({ isShowCar: true});
            });
    }
});