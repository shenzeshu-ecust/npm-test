import util from '../../common/utils/util';
Component({
    properties: {
        pageFrom: {
            type: String,
            value: ''
        }
    },
    data: {
        isIphoneX: util.isIPhoneX()
    },
    methods: {
        toLoginTap: function (e) {
            this.triggerEvent('toLoginTap', '');
        }
    }
});
