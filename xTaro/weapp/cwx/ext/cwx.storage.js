import cwx from '../cwx.js';

/**
 * 新版设计保留了对于wx.storage的无缝侵入，只是做了createTime的附加，方便回收数据，走cwx.storage可以方案读写，内部持久化由框架同学维护
 * 基于cwx.storage.set/get/remove的数据，换成wx.storage依然可以执行，无损
 * @module cwx/storage
 */
let __global = require('./global.js').default;
const removeStorageCountMax = __global.removeStorageCountMax;

let storage = __global.__mirrorStorage = {}; // 数据结构： { key : value }

/**
 * 数据结构：
 * { 
 * 		key: {
 * 			timestamp,
 * 			pagePathStack
 * 		}
 * }
 */
let record = {};
let syncJob = []; // 数据结构： [ 已经存到内存，待更新（存/删）缓存的key名 ]
let badJob = [];
let timeout, badTimeout;
let notInit = true; // 尚未初始化

const whiteList = __global.storageKeyWhiteList;
const recordStoreKey = 'cwx_storage_record';

let busWhiteList = [
	'BUS_UTMSOURCE', //地推参数
	'BUS_MASK_TIP_DESK', //蒙层提示次数，清除会导致多弹蒙层
	'BUS_MASK_TIP_CODE',
	'BUS_STATIONS_SAVETIME', //清除会导致出发城市缓存不能更新
	'BUS_HISTORY_FROM',
	'BUS_HISTORY_TO',
	'BUS_HISTORY_LIST',
];

let manageStorage = {
	init : function() {
		try {
			record = JSON.parse(wx.getStorageSync(recordStoreKey) || '{}') || record;
		} catch (error) {
			
		}
		notInit = false;
	},
	_getPagePathStack: function() {
		// eslint-disable-next-line no-undef
		const pageStack = getCurrentPages() || [];
		let pagePathStack = [];
		if(pageStack && pageStack.length > 0) {
			for(let i = 0; i < pageStack.length; i++) {
				pagePathStack.push(pageStack[i] && pageStack[i].route || '');
			}
		}
		return pagePathStack;
	},
	/**
	 * @function
	 * @name set
	 * @param {*} key 
	 * @param {*} data 
	 */
	set : function(key, data) {
		// let storageInfo = wx.getStorageInfoSync();// 用于排查
		// console.log('执行set，当前本地缓存的size: ', storageInfo.currentSize);
		const timestamp = (+(new Date()) + '');
		let pagePathStack = this._getPagePathStack();
		// console.log('======= key: ', key, 'pagePathStack: ', pagePathStack, 'timestamp: ', timestamp); // 用于排查
		record[key] = {
			timestamp,
			pagePathStack
		};

		storage[key] = data;
		syncJob.push(key);
		this._updateRecord();
	},
	_sendStorageInfo: function(value, ubtKeyId) {
		const currentPage = this._getCurrentPage();
		if (currentPage && typeof currentPage.ubtMetric === 'function') {
			// 只有在 CPage 初始化完毕，page实例上挂载了 ubtMetric 函数时，才发送埋点
			// 由于 record 包含所有已经存到本地缓存中的key的信息，所以刚开始初始化的时候【漏发】埋点也没关系
			currentPage.ubtMetric({
				name: ubtKeyId, //申请生成的Metric KEY
				tag: value, //自定义Tag
				value: 1 //number 值只能是数字
			});
		}

	},
	/**
	 * @function
	 * @name remove
	 * @param {*} key 
	 */
	remove : function(key) {
		this._removeKey(key);
		this._updateRecord();
	},
	/**
	 * @function
	 * @name get
	 * @param {*} key 
	 */
	get : function(key) {
		if (key in storage) {
			return storage[key]
		} else {
			let value = wx.getStorageSync(key);
			if (value) {
				storage[key] = value;
			}
			return value;
		}
	},
	_getCurrentPage: function() {
		let pages, page;
    try {
      // eslint-disable-next-line no-undef
      pages = getCurrentPages();
      page = pages && pages.length ? pages[pages.length - 1] : null;
    } catch (e) {
      page = getApp().getCurrentPage();
    }
    return page;
	},
	/**
	 * 删除缓存有3个操作，统一收口
	 * @param {string} key 
	 */
	_removeKey: function(key) {
		delete record[key];
		delete storage[key];
		try {
			wx.removeStorageSync(key);
		} catch (error) {
			console.error(error);
		}
	},
	/**
	 * 同步storage
	 * @function
	 * @name _updateRecord
	 */
	_updateRecord : function() {
		const self = this;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			let key, lastKey;
			// 先做syncJob
			while (key = syncJob.pop()) {
				if (key !== lastKey) {
					if (key in storage) {
						try {
							wx.setStorageSync(key, storage[key]);
							wx.setStorageSync(recordStoreKey, JSON.stringify(record)); // 每次更新，存一下key、存这个key的操作发生的时间、当时的页面栈
						} catch (e) {
							console.log('syncJob, 设置缓存失败，key为: ', key);
							// 挂的丢badJob
							badJob.push(key);
						}
					} else {
						// wx.removeStorageSync(key);
					}
				}
				lastKey = key;
			}
			// badJob延后，因为可能syncJob会有remove，这时候说不定就可以set了
			// console.log('_updateRecord, 当前有哪些badJob: ', badJob) // 用于排查
			if (badJob && badJob.length) {
				clearTimeout(badTimeout);
				badTimeout = setTimeout(function() {
					while (key = badJob.pop()) {
						try {
							wx.setStorageSync(key, storage[key]);
						} catch (e) {
							// 看来之前没有remove，还是满的
							// 1. 先根据 record 中记录的key 的时间戳来清除
							self._cleanStore();
							try {
								wx.setStorageSync(key, storage[key]);
							} catch (e1) {
								console.log('badJob, 设置缓存失败，key为: ', key);
								// 2.1 走到这一步，说明之前按照时间戳来清除缓存，并没有留出足够的空间来set当前的key值
								// 2.2 可能占空间大的key，没有被记录到record中（大概率是因为它不是调用 cwx.setStorage 来）
								// 2.3 进一步，根据长度来清除缓存
								self.forceCleanStore();
								// 因为forceClean是异步操作，要先把这次取出来
								// 但是没有持久化的key丢回去badJob
								badJob.push(key);
								break;
							}
						}
					}
				}, 200)
			}
		}, 200);
	},
	/**
	 * 按照记录时间
	 * @function
	 * @name _cleanStore
	 */
	_cleanStore : function() {
		const self = this;
		let keyTimestampArr = []; // 数据结构： { key : key, timestamp : timestamp }
		for (let key in record) {
			keyTimestampArr.push({
				key, 
				timestamp: parseFloat(record[key].timestamp)
			});
		}
		keyTimestampArr = keyTimestampArr.sort(function(val1, val2) {
			// 根据 更新key操作的执行时间 排序，早的排前面
			return val1.timestamp - val2.timestamp;
		});

		this._removeFromFront(keyTimestampArr, removeStorageCountMax);
		// for (let i = 0, removedCount = 0; i < keyTimestampArr.length; i++) {
		// 	let key = keyTimestampArr[i] ? keyTimestampArr[i].key : '';
		// 	if(whiteList.indexOf(key) === -1) {
		// 		self._removeKey(key);
		// 		removedCount++;
		// 	}
		// 	if(removedCount > removeStorageCountMax) {
		// 		break;
		// 	}
		// }
	},
	/**
	 * 根据入参数组的排序，从前往后依次移除缓存
	 * @param {array} sortedArray 已经排好序的数组
	 * @param {number} needRemoveCountMax 最多移除几个缓存
	 */
	_removeFromFront: function(sortedArray, canRemoveCountMax) {
		const self = this;
		for (let i = 0, removedCount = 0; i < sortedArray.length; i++) {
			let key = sortedArray[i] ? sortedArray[i].key : '';
			// 统一使用 cwx.storage.js 中的白名单就可以了，app.js不需要引入白名单了
			if(whiteList.indexOf(key) === -1) {
				console.log('移除缓存，key: ', key, 'removedCount: ', removedCount);
				self._removeKey(key);
				removedCount++;
			}
			if(removedCount > canRemoveCountMax) {
				break;
			}
		}
	},
	/**
	 * 在没有记录createtime时候按照value length大小从大到小删除 removeStorageCountMax 个
	 * @function
	 * 之前命名为_forceCleanStore，现在去掉下划线，提供给 app.js 强制删除缓存时调用
	 */
	forceCleanStore : function() {
		const self = this;
		try {
			const storageInfo = wx.getStorageInfoSync()
			const keys = storageInfo.keys;

			let keyValLengthArr = []; // 数据结构： { key : key, length: length of key's value}
			let totalLength = 0;
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				let valueLength = 0;
				let value = wx.getStorageSync(key);
				valueLength = typeof (value) == 'string' ? value.length : JSON.stringify(value).length;
				totalLength += valueLength;

				keyValLengthArr.push({
					key,
					valueLength : valueLength
				})
			}

    	// 根据length，从大到小排列，先删除长度较大的
			keyValLengthArr = keyValLengthArr.sort((item1, item2) => {
				return item2.valueLength - item1.valueLength;
			})
			console.log('根据length，从大到小排列的 keyValLengthArr: ', keyValLengthArr)

			let pagePathStack = this._getPagePathStack();

			this._sendStorageInfo({ 
				totalLength: totalLength,
				maxLengthItem: keyValLengthArr.length > 0 ? JSON.stringify(keyValLengthArr[0]) : '',
				pagePathStack: JSON.stringify(pagePathStack) 
			}, 186454) // 【记录】缓存size超了时，已经存到本地的缓存有哪些key、他们的value length 是什么

			this._removeFromFront(keyValLengthArr, removeStorageCountMax);
			// 在forceJob异步的最后异步里面，从新持久化
			self._updateRecord();
		} catch (e) {
			// Do something when catch error
		}
	},
	getStorageInfoSync: function() {
	  if(syncJob.length) {
		let key, lastKey;
		// 还没存到 本地缓存的 key 先存起来，然后再取 当前缓存的相关信息
		while (key = syncJob.pop()) {
		  if (key !== lastKey) {
			if (key in storage) {
			  try {
				wx.setStorageSync(key, storage[key]);
				setStorageRecord(); // 每次更新，存一下key、存这个key的操作发生的时间
			  } catch (e) {
				// console.log('syncJob, 设置缓存失败，key为: ', key);
				// 挂的丢badJob
				badJob.push(key);
			  }
			} else {
			}
		  }
		  lastKey = key;
		}
	  }
	  return wx.getStorageInfoSync();
	}
};

if (notInit) {
	manageStorage.init();
}


export default manageStorage;
