import { cwx } from '../../../cwx/cwx'

class Store {
    constructor(key) {
        this.key = key
    }

    set(val) {
        if (val == undefined) {
            return cwx.setStorageSync(this.key, '')
        }

        cwx.setStorageSync(this.key, val)
    }

    get() {
        return cwx.getStorageSync(this.key) || {}
    }

    // 这里的timeout单位是分钟!
    setAttr(key, val) {
        let obj = this.get() || {}
        if (val && val.timeout) {
            val.expiredTime = Date.now() + val.timeout * 60 * 1000
        } else if (Array.isArray(val)) {
            val.forEach((item, index) => {
                if (Object.prototype.toString.call(val[index]) === "[object Object]") {
                    val[index].expiredTime = Date.now() + item.timeout * 60 * 1000
                }
            })
        }
        obj[key] = val
        this.set(obj)
    }

    getAttr(key) {
        let obj = this.get()
        if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
            if (Date.now() > parseInt(obj[key].expiredTime)) {
                delete obj[key]
            }
        } else if (Object.prototype.toString.call(obj[key]) === "[object Array]") {
            obj[key].map((item, index) => {
                if (Date.now() > parseInt(item.expiredTime)) {
                    obj[key].splice(index, 1)
                }
            })
        }

        return obj[key]
    }

    removeAttr(key) {
        let obj = this.get()
        delete obj[key]
        this.set(obj)
    }

    static getInstance(key) {
        return new Store(key)
    }
}

export let TrainStationStore = Store.getInstance('TRAIN_STATION_STORE')
export let TrainQueryStore = Store.getInstance('TRAIN_QUERY_STORE')
export let TrainBookStore = Store.getInstance('TRAIN_BOOK_STORE')
export let TrainActStore = Store.getInstance('TRAIN_ACTIVITY_STORE')
export let TrainToolStroe = Store.getInstance('TRAIN_TOOL_STORE')
export let OverseaTrainQueryStore = Store.getInstance("OVERSEA_TRAIN_QUERY_STORE")
export let OverseaStationStore = Store.getInstance("OVERSEA_STATION_STORE")
