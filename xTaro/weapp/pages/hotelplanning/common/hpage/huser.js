import { cwx } from '../../../../cwx/cwx';
const util = require('../utils/util');
const deferred = require('../utils/deferred');
import hPromise from '../../common/hpage/hpromise';
const StorageUtil = require('../../common/utils/storage.js');
import commonrest from '../commonrest'

const CUT_PRICE_SAVE_USER_INFO = "CUT_PRICE_SAVE_USER_INFO";
// 是否显示微信登录, 单例
let showWechatLogin = null;
let canIUseProfile = wx.canIUse("getUserProfile");

const login = function (obj) {
	const { param, callback } = obj;

	const params = util.extend(
		{
			IsAuthentication: "T",
		},
		param || {},
		true
	);

	cwx.user.login({
		param: params,
		callback: callback,
	});
};

/**
 * 登陆, 已登陆直接回调/否则跳登陆后回调
 * @param {object} params cwx登陆参数
 * @param {function} callback 登陆成功回调, 返回true/false
 */
const smartLogin = function (obj) {
	const { params, callback } = obj;

	const _login = () => {
		login({
			param: params,
			callback: (res) => {
				if (res && res.ReturnCode == 0) {
					callback(true);
				} else {
					callback(false);
				}
			},
		});
	};

	checkLoginStatus(true).then((isLogin) => {
		if (isLogin) {
			callback(true);
		} else {
			_login();
		}
	});
};

const isLogin = function () {
	return cwx.user.isLogin();
};

const checkLoginStatus = function (checkFromServer) {
	return new hPromise((resolve, reject) => {
		if (checkFromServer) {
			cwx.user.checkLoginStatusFromServer((isLogin) => {
				resolve(isLogin);
			});
		} else {
			return resolve(cwx.user.isLogin());
		}
	});
};

/**
 * 微信当前用户信息
 * @param {boolean} isNoSense 用户无感获取 默认false
 * @returns Promise
 */
const getUesrInfo = (isNoSense = false) =>
	new Promise((resolve, reject) => {
		if (!canIUseProfile || isNoSense) {
			wx.getSetting({
				success(res) {
					if (res.authSetting["scope.userInfo"]) {
						// 已经授权，可以直接调用 getUserInfo 获取头像昵称
						wx.getUserInfo({
							success: function (result) {
								resolve(result.userInfo);
							},
						});
					}
				},
			});
		} else if (
			canIUseProfile &&
			!StorageUtil.getStorage(CUT_PRICE_SAVE_USER_INFO)
		) {
			wx.getUserProfile({
				desc: "获取您的头像昵称", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				success: (result) => {
					if (result.userInfo) {
						StorageUtil.setStorage(
							CUT_PRICE_SAVE_USER_INFO,
							result.userInfo
						); // 1天
						resolve(result.userInfo);
					} else {
						reject(result);
					}
				},
				fail: (err) => {
					reject(err);
				},
			});
		} else {
			let userInfo = StorageUtil.getStorage(CUT_PRICE_SAVE_USER_INFO);

			if (userInfo) {
				resolve(userInfo);
			} else {
				reject();
			}
		}
	});

module.exports = {
	login,
	smartLogin,
	isLogin,
	checkLoginStatus,
	getUesrInfo,
};
