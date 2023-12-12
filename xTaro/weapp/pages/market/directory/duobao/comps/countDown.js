Component({
    /**
     * 组件的属性列表
     */
    properties: {
        endTime: {
            type: Number,
            value: 0,
        }
    },

    observers:{
        
    },

    /**
     * 组件的初始数据
     */
    data: {
        t:0,
        h:0,
        m:0,
        s:0,
        remainingLocal: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        setLocal(remaining) {
            let remainingArr = countTime(remaining)
            this.setData({
                t:remainingArr[0],
                h:remainingArr[1],
                m:remainingArr[2],
                s:remainingArr[3],
                remainingLocal: remaining
            })
        }
    },
    lifetimes: {
        attached: function () {
            const now = Date.now()
            const remaining = this.data.endTime - now
            this.setLocal(remaining)
            if (remaining > 0) {
                this.timer = setInterval(() => {
                    this.setLocal(this.data.remainingLocal - 1000)
                    if (this.data.remainingLocal <= 0) {
                        clearInterval(this.timer)
                        this.triggerEvent('end', null, {})
                        return
                    }
                }, 1000)
            }
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
            clearInterval(this.timer)
        },
    },
})

function countTime(end) {
    let endTimestamp
    if (typeof end === 'object') {
        endTimestamp = end.getTime();
    } else if (typeof end === 'string') {
        endTimestamp = (new Date(str)).getTime()
    } else {
        endTimestamp = end
    }
    //时间差  
    let leftTime = end;
    //定义变量 d,h,m,s保存倒计时的时间  
    if (leftTime < 0) return [0, 0, 0, 0]

    let d, h, m, s;
    d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
    h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
    m = Math.floor(leftTime / 1000 / 60 % 60);
    s = Math.floor(leftTime / 1000 % 60);
    //将0-9的数字前面加上0，例1变为01
    d = checkTime(d);
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);

    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i.toString();
    }
    return [d, h, m, s]
}
