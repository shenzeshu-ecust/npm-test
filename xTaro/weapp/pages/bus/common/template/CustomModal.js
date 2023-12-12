// pages/bus/share/template/share.js

const isFunction = (t) => typeof t === 'function';

export default class CustomModal {
    constructor(page) {
        this.page = page;
        this.page.hiddenCustomModal = page.UBT_eventWrapper(this.hiddenCustomModal);
        this.page.showCustomModal = page.UBT_eventWrapper(this.showCustomModal);
        this.page.onCustomModalButton = page.UBT_eventWrapper(this.onCustomModalButton);
        this.page.onCustomModalInput = page.UBT_eventWrapper(this.onCustomModalInput);
        this.page.onCustomModalOther = page.UBT_eventWrapper(this.onCustomModalOther);
    }
    get data() {
        return this.page && this.page.data;
    }
    setData() {
        return this.page && this.page.setData.apply(this.page, arguments);
    }

    showCustomModal(data) {
        var buttons = data.buttons || [];
        if (buttons.length == 0) {
            buttons.push({
                buttonTitle: '确定',
                buttonColor: '#0086F6',
                buttonTextColor: '#ffffff',
            });
        }
        var customModalData = {
            ...data,
            buttons,
            visible: true,
            inHidden: false,
        };
        setTimeout(() => {
            this.setData({
                customModalData,
            });
        }, 100);
    }

    hiddenCustomModal(callBack) {
        this.setData({
            inHidden: true,
        });
        this.setData({
            'customModalData.inHidden': true,
        });
        if (callBack && isFunction(callBack)) {
            callBack();
        }
        setTimeout(() => {
            this.setData({
                visible: false,
            });
            this.setData({
                'customModalData.visible': false,
            });
        }, 10);
    }
    onCustomModalEmpty(e) {
        //用于事件统计
    }

    onCustomModalInput(e) {
        var index = e.currentTarget.dataset.index;
        var inputData = this.data.customModalData.inputs[index] || {};
        if (inputData.action) {
            if (isFunction(inputData.action)) {
                inputData.action.apply(this, arguments);
            } else {
                this[inputData.action].apply(this, arguments);
            }
        }
        var path = `customModalData.inputs[${index}].value`;
        var data = {};
        data[path] = e.detail.value;
        this.setData(data);
    }
    onCustomModalOther(e) {
        var index = e.currentTarget.dataset.index;
        var buttonData = this.data.customModalData.others[index] || {};
        //这种情况去要手动调用hidden
        if (buttonData.action) {
            var needHidden = false;
            if (isFunction(buttonData.action)) {
                needHidden = buttonData.action.apply(this, arguments);
            } else {
                needHidden = this[buttonData.action].apply(this, arguments);
            }
            if (needHidden) {
                this.hiddenCustomModal();
            }
        } else {
            if (buttonData.needHidden) {
                this.hiddenCustomModal();
            }
        }
    }
    onCustomModalButton(e) {
        var index = e.currentTarget.dataset.index;
        var buttonData = this.data.customModalData.buttons[index] || {};
        if (buttonData.actionBeforeHidden) {
            //这种情况去要手动调用hidden
            if (buttonData.action) {
                var needHidden = false;
                if (isFunction(buttonData.action)) {
                    needHidden = buttonData.action.apply(this, arguments);
                } else {
                    needHidden = this[buttonData.action].apply(this, arguments);
                }
                if (needHidden) {
                    this.hiddenCustomModal();
                }
            } else {
                this.hiddenCustomModal();
            }
        } else {
            this.hiddenCustomModal(() => {
                if (buttonData.action) {
                    if (isFunction(buttonData.action)) {
                        buttonData.action.apply(this, arguments);
                    } else {
                        this[buttonData.action].apply(this, arguments);
                    }
                }
            });
        }
    }
}
