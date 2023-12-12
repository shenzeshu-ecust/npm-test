const tripTypeState = [
    {
        key: 10,
        text: '商务出差'
    },
    {
        key: 40,
        text: '朋友出游'
    },
    {
        key: 70,
        text: '情侣出游'
    },
    {
        key: 30, // 20
        text: '家庭亲子'
    },
    {
        key: 50,
        text: '独自旅行'
    },
    {
        key: 60,
        text: '代人预订'
    },
    {
        key: 0,
        text: '其他'
    }
];
Component({
    properties: {},
    data: {
        tripTypeState
    },
    methods: {
        tapToggleType: function (e) {
            const idx = e.target.dataset.idx;
            const { tripTypeState } = this.data;
            const item = tripTypeState[idx];
            if (!item) return;
            this.triggerEvent('acceptTraceType', { actionType: 3 });
            tripTypeState.forEach(function (v, k) {
                v.current = false;
            });
            item.current = true;
            tripTypeState[idx] = item;
            this.setData({ tripTypeState });
            this.triggerEvent('handleTravelType', { travelInfo: item });
        }
    }
});
