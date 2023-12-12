import {
	cwx,
	_
} from '../../../../cwx/cwx'
let util = {
	compareVersion(v1, v2) {
		v1 = v1.split('.')
		v2 = v2.split('.')
		let len = Math.max(v1.length, v2.length)
		while (v1.length < len) {
			v1.push('0')
		}
		while (v2.length < len) {
			v2.push('0')
		}
		for (let i = 0; i < len; i++) {
			let num1 = parseInt(v1[i])
			let num2 = parseInt(v2[i])
			if (num1 > num2) {
				return 1
			} else if (num1 < num2) {
				return -1
			}
		}
		return 0
	},
	showLoading(msg) {
		wx.showToast({
			title: msg || '加载中',
			icon: 'loading',
			duration: 10000
		})
	},
	hideLoading() {
		wx.hideToast();
	},
	showToast(t) {
		wx.showToast({
			title: t,
			icon: 'success',
			duration: 3000
		})
	},
	showModal(t, c) {
		wx.showModal({
			title: t ? t : '',
			content: c ? c : '',
			showCancel: false,
			success: function(res) {
				if (res.confirm) {
					console.log('用户点击确定')
				}
			}
		})
	},
	indexPageId() {
		if (this.isWechat()) {
			return '10320655631';
		} else if (this.isBaidu()) {
			return '10650052893';
		} else if (this.isAlipay()) {
			return '10650052885';
		} else if (this.isByteDance()) {
			return '10650052889';
		} else {
			return '';
		}
	},
	collectPageId() {
		if (this.isWechat()) {
			return '10320655632';
		} else if (this.isBaidu()) {
			return '10650052895';
		} else if (this.isAlipay()) {
			return '10650052887';
		} else if (this.isByteDance()) {
			return '10650052891';
		} else {
			return '';
		}
	},
	isWechat() {
		return cwx.appId != 'wx0e6ed4f51db9d078' ? false : true;
	},
	isBaidu() {
		return cwx.appId != '11048657' ? false : true;
	},
	isAlipay() {
		return cwx.appId != '2017081708237081' ? false : true;
	},
	isByteDance() {
		return cwx.appId != 'ttaf70d9cd305a16cb' ? false : true;
	},
	/*
	获取某个字符在整个字符串中出现的次数
	*/
	patch(s, re) {
		try {
			re = eval("/" + re + "/ig")
		} catch (e) {
			console.log(e)
		}
		return s.match(re) ? s.match(re).length : 0;
	},
	getRemarkTmpl(remark) {
		//remark : 测试\\你好\\hello
		let remarkTpl = "";
		let remarkList = remark.split(/\\\\/);
		if (remarkList) {
			for (let i = 0; i < remarkList.length; i++) {
				remarkTpl += '<li class="item_remark_li">' + remarkList[i] + '</li>';
			}
		}
		return remarkTpl;
	},
	formatRemarkHtml: function(Remark, RemarkTmpl) {
		let remarkHtml = "",
			formatRemarkTmpl = this.getRemarkTmpl(RemarkTmpl);
		if (RemarkTmpl) {
			//如果只有一条li 使用单条p标签
			if (this.patch(formatRemarkTmpl, "<li>") == 1) {
				remarkHtml = '<p class="item_remark">' + RemarkTmpl + '</p>';
			} else {
				remarkHtml = '<ul class="item_remark_tmpl">' + formatRemarkTmpl + '</ul>';
			}
		} else {
			remarkHtml = '<p class="item_remark">' + Remark + '</p>';
		}
		return remarkHtml;
	},
	parse(str) {
		if (typeof str === 'undefined') {
			return new Date();
		}
		if (typeof str === 'string') {
			str = str || '';
			var regtime = /^(\d{4})\-?(\d{1,2})\-?(\d{1,2})/i;
			if (str.match(regtime)) {
				str = str.replace(regtime, "$2/$3/$1");
			}
			var st = Date.parse(str);
			var t = new Date(st || new Date());
			return t;
		} else if (typeof str === 'number') {
			return new Date(str);
		} else {
			return new Date();
		}
	},
	_getDate: function(ds) {
		var _that = this;
		var t = _that.parse(ds);
		var d = new Date();
		d.setTime(t);
		return d;
	},
	/**
	 * 返回两个日期相差的天数
	 * @static
	 * @memberof Util.cUtilDate
	 * @param {String} ds1  日期1
	 * @param {Stirng} ds2  日期2
	 * @returns {Number} num 相差天数
	 */
	getIntervalDay(ds1, ds2) {
		var d1 = this._getDate(ds1);
		var d2 = this._getDate(ds2);
		d1.setHours(0, 0, 0, 0);
		d2.setHours(0, 0, 0, 0);
		return parseInt((d2 - d1) / 86400000);
	},
	formatDateString(date) {
		var time = new Date(),
			Y, M, D;
		if (typeof date === 'undefined') {
			time = new Date();
		}
		if (typeof date === 'string') {
			var st = Date.parse(date);
			time = new Date(st);
		} else if (typeof date === 'number') {
			time = new Date(date);
		} else {
			time = new Date();
		}
		Y = time.getFullYear() + '-';
		M = (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + '-';
		D = (time.getDate() < 10 ? '0' + (time.getDate()) : time.getDate());
		return Y + M + D;
	},
	isExpiring(date) {
		let _that = this;
		let day = _that.getIntervalDay(_that.formatDateString(new Date()), _that.formatDateString(date));
		if (day <= 3) {
			return true;
		}
		return false;
	},
	isPositiveInteger(s) {
		var re = /(^[1-9]\d*$)/;
		return re.test(s);
	},
	getCouponStatusClass(item) {
		let couponStatusClass = 'noEffect';
		let now = new Date();
		if (now >= new Date(item.startDate) && now <= new Date(item.disableDate)) {
			couponStatusClass = "effect";
		}
		return couponStatusClass;
	},
	getStatusClass(listitem, couponStatusClass) {
		var statusClass = "";
		var now = new Date();
		if (now >= new Date(listitem.startDate) && now.getTime() <= new Date(listitem.startDate).getTime() + 1 *
			3600 * 1000) {
			statusClass = "item_new_receive";
		}
		if (listitem.isExpiring) {
			statusClass = "item_is_expire";
		}
		if (couponStatusClass == "noEffect") {
			statusClass = "item_no_effect";
		}
		if (listitem.appLimit == 1 || listitem.appLimit == 2) {
			statusClass = "item_first_pay";
		}
		return statusClass;
	},
	getEm(discountRule, deductionAmountLimit) {
		let em = "";
		if (discountRule.subTag != "" && !discountRule.showPricetext) {
			em = discountRule.subTag;
		} else if (deductionAmountLimit && !discountRule.showPricetext) {
			em = "限额";
		}
		return em;
	},
	getFontClass(discountRule) {
		let fontClass = "";
		let priceDigit = discountRule.price + "";
		if (priceDigit.length <= 2) {
			fontClass = "fsLarge";
		} else if (priceDigit.length >= 4) {
			fontClass = "fsSmall";
		} else {
			fontClass = "";
		}
		return fontClass;
	},
	formatDiscountRule(item) {
		var discountRule = {};
		if (item.promotionMethodID === 1) {
			discountRule = this.formatDeductionRule(item);
		} else if (item.promotionMethodID === 2) {
			discountRule = this.formatAfterBackRule(item);
		} else if (item.promotionMethodID === 3) {
			discountRule = this.formatDeductionWithAfterRule(item);
		}
		return discountRule;
	},
	formatDeduction(item) {
		var _that = this,
			resultPrice, decimalPosition, decimalNum, rule = {};
		rule.tag = "";
		rule.subTag = "";
		rule.price = -1;
		rule.pricetext = "超值优惠";
		//控制百分比时 10折也显示超值优惠
		rule.showPricetext = false;
		rule.unit = "";
		rule.available = -1;
		rule.deductionAmountLimit = '';
		if (!item.deductionStrategy || item.deductionStrategy.length == 0) return rule;
		var type = item.deductionStrategyTypeID,
			promotionMethod = item.promotionMethodID,
			firstAmount = item.deductionStrategy[0].deductionAmount;
		switch (parseInt(type)) {
			case 1:
				rule.price = firstAmount;
				rule.unit = "元";
				break;
			case 2:
				if (parseInt(promotionMethod) == 2) {
					//后返模式的直接显示2位小数的百分比格式（2.2%） 不显示 xx折
					resultPrice = parseFloat(firstAmount);
					decimalPosition = String(resultPrice).indexOf('.') + 1;
					decimalNum = decimalPosition > 0 ? String(resultPrice).length - decimalPosition : 0;
					//小数点有几位保留几位 最高保留2位
					decimalNum = decimalNum >= 2 ? 2 : decimalNum;
					rule.price = resultPrice.toFixed(decimalNum);
					rule.unit = "%";
					if (rule.price >= 100) {
						rule.showPricetext = true;
					}
					rule.deductionAmountLimit = item.deductionStrategy[0].deductionAmountLimit ? item
						.deductionStrategy[0].deductionAmountLimit : '';
					//折扣设置优惠100%且没有设置上限 显示超值优惠
					if (rule.price == 100 && !rule.deductionAmountLimit) {
						rule.showPricetext = true;
						rule.pricetext = "超值优惠";
					} else if (rule.price < 0) {
						rule.showPricetext = true;
					}
				} else {
					//百分比 2位及以上小数 显示超值优惠
					resultPrice = parseFloat(((100 - firstAmount) / 10));
					decimalPosition = String(resultPrice).indexOf('.') + 1;
					decimalNum = decimalPosition > 0 ? String(resultPrice).length - decimalPosition : 0;
					if (decimalNum >= 2) {
						rule.showPricetext = true;
					}
					rule.price = resultPrice.toFixed(1);
					if (rule.price >= 10) {
						rule.showPricetext = true;
					}
					rule.unit = "折";
					rule.deductionAmountLimit = item.deductionStrategy[0].deductionAmountLimit ? item
						.deductionStrategy[0].deductionAmountLimit : '';
					//折扣设置优惠100%且没有设置上限 显示超值优惠
					if (rule.price == 0 && !rule.deductionAmountLimit) {
						rule.showPricetext = true;
						rule.pricetext = "超值优惠";
					} else if (rule.price < 0) {
						rule.showPricetext = true;
					}
				}
				break;
			case 3:
				//获取最大优惠扣减规则
				var maxItem = _that.getMaxDeductionStrategy(item.deductionStrategy);
				if (maxItem != null && maxItem.deductionAmount > 0) {
					if (maxItem.deductionType == 0) {
						rule.price = maxItem.deductionAmount;
						rule.unit = "元";
						if (item.deductionStrategy.length > 1) {
							switch (parseInt(promotionMethod)) {
								case 1:
									rule.subTag = "最高减";
									break;
								case 2:
									rule.subTag = "最高返";
									break;
								case 3:
									rule.subTag = "最高";
									break;
								default:
									break;
							}
						} else if (item.deductionStrategy.length == 1) {
							var tagText = maxItem.startAmount ? "满" + maxItem.startAmount + '元可用' : '';
							switch (parseInt(promotionMethod)) {
								case 1:
									rule.subTag = tagText;
									break;
								case 2:
									rule.subTag = tagText;
									break;
								case 3:
									rule.subTag = "最高";
									break;
								default:
									break;
							}
						}
					} else if (maxItem.deductionType == 1) {
						if (item.deductionStrategy.length > 1) {
							//后返百分比的显示最高
							if (parseInt(promotionMethod) == 2) {
								rule.subTag = "最高返";
							} else {
								rule.subTag = "最低";
							}
						} else if (item.deductionStrategy.length == 1) {
							rule.subTag = maxItem.startAmount ? "满" + maxItem.startAmount + '元可用' : '';
						}

						if (parseInt(promotionMethod) == 2) {
							//后返模式的直接显示2位小数的百分比格式（2.2%） 不显示 xx折
							resultPrice = parseFloat(maxItem.deductionAmount);
							decimalPosition = String(resultPrice).indexOf('.') + 1;
							decimalNum = decimalPosition > 0 ? String(resultPrice).length - decimalPosition : 0;
							//小数点有几位保留几位 最高保留2位
							decimalNum = decimalNum >= 2 ? 2 : decimalNum;
							rule.price = resultPrice.toFixed(decimalNum);
							rule.unit = "%";
						} else {
							resultPrice = parseFloat(((100 - maxItem.deductionAmount) / 10));
							decimalPosition = String(resultPrice).indexOf('.') + 1;
							//百分比 2位及以上小数 显示超值优惠
							decimalNum = decimalPosition > 0 ? String(resultPrice).length - decimalPosition : 0;
							if (decimalNum >= 2) {
								rule.showPricetext = true;
							}
							rule.price = parseFloat((100 - maxItem.deductionAmount) / 10).toFixed(1);
							rule.unit = "折";
						}
					} else {
						rule.showPricetext = true;
					}
				}
				break;
			case 4:
				rule.price = firstAmount;
				rule.unit = "元";
				break;
			case 5:
				if (item.deductionStrategy.length > 1) {
					rule.subTag = "最低";
				}
				/*获取最小优惠扣减规则*/
				var minItem = _that.getMinDeductionStrategy(item.deductionStrategy);
				if (minItem != null && minItem.deductionAmount > 0) {
					if (minItem.deductionType == 0) {
						rule.price = minItem.deductionAmount;
						rule.unit = "元";
					}
				}
				break;
			case 6:
				var floatDeductionAmount = item.floatDeductionAmount;
				rule.price = floatDeductionAmount;
				rule.unit = "元";
				break;
			default:
				break;
		}
		if (rule.price == 0) {
			rule.showPricetext = true;
		}
		return rule;
	},
	getAvailable(item) {
		var available = -1;
		if (item.amountPoolState && item.amountPoolState == 1) {
			if (item.couponAvailableAmount && item.couponAvailableAmount > 0) {
				available = item.couponAvailableAmount;
			}
		}
		return available;
	},
	formatDeductionRule(item) {
		var rule = this.formatDeduction(item);
		var type = item.deductionStrategyTypeID;
		if (type == 1) {
			rule.tag = "立减券";
		} else if (type == 2) {
			rule.tag = "立减券";
		} else if (type == 3) {
			rule.tag = "满减券";
		} else if (type == 4) {
			rule.tag = "一口价";
		} else if (type == 5) {
			rule.tag = "一口价";
		} else if (type == 6) {
			rule.tag = "立减券";
		}
		rule.available = this.getAvailable(item);
		return rule;
	},
	formatAfterBackRule(item) {
		var rule = this.formatDeduction(item);
		var backtype = item.couponBackMethodType;
		if (backtype == 1) {
			rule.tag = "返现券";
		} else if (backtype == 2) {
			rule.tag = "返礼品卡券";
		} else {
			rule.tag = "后返券";
		}
		rule.available = this.getAvailable(item);
		return rule;
	},
	formatDeductionWithAfterRule(item) {
		var rule = this.formatDeduction(item);
		rule.tag = "立减/后返券";
		rule.available = this.getAvailable(item);
		return rule;
	},
	getMaxDeductionStrategy(list) {
		var maxItem = null;
		_.each(list, function(deductionStrategyItem, index) {
			if (deductionStrategyItem.deductionType == 0 || deductionStrategyItem.deductionType == 1) {
				if (maxItem == null) {
					maxItem = deductionStrategyItem;
				} else if (maxItem.deductionAmount < deductionStrategyItem.deductionAmount) {
					maxItem = deductionStrategyItem;
				}
			}
		});
		return maxItem;
	},
	getMinDeductionStrategy(list) {
		var minItem = null;
		_.each(list, function(deductionStrategyItem, index) {
			if (deductionStrategyItem.deductionType == 0 || deductionStrategyItem.deductionType == 1) {
				if (minItem == null) {
					minItem = deductionStrategyItem;
				} else if (minItem.deductionAmount > deductionStrategyItem.deductionAmount) {
					minItem = deductionStrategyItem;
				}
			}
		});
		return minItem;
	}
}
export default util
