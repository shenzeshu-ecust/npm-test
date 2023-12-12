import HPromise from '../../common/hpage/hpromise';
export default {
    create: function () {
        let resolve, reject;
        const promise = new HPromise((t, c) => {
            resolve = t;
            reject = c;
        });

        return {
            promise,
            resolve,
            reject
        };
    }
};
