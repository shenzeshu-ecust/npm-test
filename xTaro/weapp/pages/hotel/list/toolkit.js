
export default {
    // 将分钟转为时间
    // (510) => 8:30
    formatMinToHour: function (nMin) {
        let result = nMin;
        let hour = '0';
        let min = '00';

        if (typeof nMin === 'number') {
            hour = Math.floor(nMin / 60);
            min = nMin % 60;

            if (min < 10) {
                min = 0 + '' + min;
            }

            result = nMin > 1440 ? `次日${hour - 24}:${min}` : `${hour}:${min}`;
        }

        return result;
    },

    /**
     * @description 获得对象在某个路径上的值
     * @method getAttr
     * @param {object} obj
     * @param {string} path
     * @returns {object}
     */
    getAttr (obj, path) {
        if (!obj || !path) {
            return null;
        }

        const array = path.split('.');

        obj = obj || {};

        for (let i = 0, len = array.length, last = Math.max(len - 1, 0); i < len; i++) {
            obj = obj[array[i]];

            if (obj === null || typeof obj === 'undefined') {
                return null;
            }
        }

        return obj;
    }

};
