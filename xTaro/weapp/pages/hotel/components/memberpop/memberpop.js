import C from '../../common/C.js';
import storage from '../../common/utils/storage';

Component({
    properties: {
        enable: {
            type: Boolean,
            value: false,
            observer: 'show'
        },
        imgSrc: {
            type: String,
            value: ''
        }
    },
    data: {
        display: false,
        rightsPop: C.STORAGE_MEMBER_RIGHTS_DIALOG
    },
    methods: {
        show () {
            const rightsPop = this.data.rightsPop;
            const hasPopAlready = storage.getStorage(rightsPop);
            if (hasPopAlready) return;
            const { enable, imgSrc } = this.data;
            if (enable && imgSrc) {
                this.setData({ display: true });
            }
            storage.setStorage(rightsPop, true, 24 * 183);
        },
        close (e) {
            this.setData({ display: false });
        },
        /* Empty method, do nothing */
        noop: function () { }
    }
});
