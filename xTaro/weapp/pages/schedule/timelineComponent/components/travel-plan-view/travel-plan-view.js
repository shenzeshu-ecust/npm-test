import { cwx } from '../../../../../cwx/cwx.js';

Component({
    properties: {
        itemData: {
            type: Object,
            value: {}
        }
    },
    data: {},
    methods: {
        onGoToDetails(e) {
            cwx.navigateTo({
                url: '/pages/schedule/pages/cardShare/travelplanShare/travelplanShare?travelStatus=1&travelPlanId=' + e.currentTarget.dataset.cardmodel.travelPlanId,
            })
        },

        onGoToTravelList: function () {
            cwx.navigateTo({
                url: '/pages/schedule/pages/travelLineList/travelLineList',
            })
        }
    }
});
