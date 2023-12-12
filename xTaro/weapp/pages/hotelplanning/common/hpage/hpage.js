import { cwx, CPage, _ } from "../../../../cwx/cwx";

function calcComputedAttrs() {
	const computed = this.computed;
	const computedAttrs = {};

	if (computed) {
		for (const c in computed) {
			computedAttrs[c] = computed[c].call(this);
		}
	}

	return computedAttrs;
}

module.exports = function (options) {
	if (options.data) {
		Object.assign(options.data, calcComputedAttrs.call(options));
	}

	Object.assign(options, {
		_calcComputedAttrs() {
			return calcComputedAttrs.call(this);
		},

		update(data) {
			const self = this;
			if (!this.__delayData) {
				this.__dataTimer = 1;
			}

			_.assignIn(this.data, data);
			_.assignIn(this.data, this._calcComputedAttrs());

			clearTimeout(this.__dataTimer);
			this.__dataTimer = setTimeout(() => {
				// this.data = _.assignIn.apply(_, self.__delayData);
				// _.assignIn(this.data, this._calcComputedAttrs());

				this.setData(this.data);

				self.__delayData = null;
			}, 30);
		},

		immediateUpdate(data) {
			_.assignIn(this.data, data);
			_.assignIn(this.data, this._calcComputedAttrs());
			this.setData(this.data);
		},
	});

	CPage(options);
};
