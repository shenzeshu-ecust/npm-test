import hPromise from "../../common/hpage/hpromise";
module.exports = {
	create: function () {
		let resolve, reject;
		const promise = new hPromise((t, c) => {
			resolve = t;
			reject = c;
		});

		return {
			promise: promise,
			resolve: resolve,
			reject: reject,
		};
	},
};
