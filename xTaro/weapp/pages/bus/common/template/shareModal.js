// pages/bus/share/template/share.js
const isFunction = (t) => typeof t === 'function';
class shareModal {
    constructor(page) {
        this.page = page;
        this.page.hiddenShareModal = this.hiddenShareModal;
        this.page.showShareModal = this.showShareModal;
        this.page.onShareModalButton = this.onShareModalButton;
    }

    showShareModal(data) {
        this.setData({
            'modalData.canClose': true,
            modalData: {
                ...data,
            },
            'modalData.visible': true,
            'modalData.inHidden': false,
        });
    }
    hiddenShareModal(callBack) {
        this.setData({
            'modalData.inHidden': true,
        });
        if (callBack && isFunction(callBack)) {    
            callBack();
        }
        setTimeout(() => {
            this.setData({
                'modalData.visible': false,
            });
        }, 200);
    }
    hiddenShareModalMask(callBack) {
        if(this.data.modalData.canClose){
            this.setData({
                'modalData.inHidden': true,
            });
            if (callBack && isFunction(callBack)) {
                callBack();
            }
            setTimeout(() => {
                this.setData({
                    'modalData.visible': false,
                });
            }, 200);
        }
    }
    onShareModalButton(e) {
        this.hiddenShareModal(() => {
            if (this.data.modalData.action) {
                if (isFunction(this.data.modalData.action)) {
                    this.data.modalData.action.apply(this, arguments);
                } else {
                    this[this.data.modalData.action].apply(this, arguments);
                }
            }
        });
    }
}
shareModal.prototype.setData = function (data) {
    this.page && this.page.setData.apply(this.page, arguments);
};
export default shareModal;
