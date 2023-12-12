class Modal {
    constructor(page) {
        this.page = page;
        this.page.showModal = this.showModal.bind(this);
        this.page.hiddenModal = this.hiddenModal.bind(this);
    }
    get data() {
        return this.page && this.page.data;
    }
    showModal(data) {
        this.setData({
            didShowModal: true,
            modalData: data,
        });
    }
    hiddenModal() {
        this.setData({
            didShowModal: false,
        });
    }
}

Modal.prototype.setData = function (data) {
    this.page && this.page.setData.apply(this.page, arguments);
};

export default Modal;
