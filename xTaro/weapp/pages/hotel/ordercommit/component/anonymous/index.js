Component({
    properties: {

    },
    data: {
        isSelected: false
    },
    methods: {
        toggleSelect: function (e) {
            this.setData({
                isSelected: !this.data.isSelected
            }, () => {
                this.triggerEvent('selectAnonymous', { selected: this.data.isSelected });
            });
        }
    }
});
