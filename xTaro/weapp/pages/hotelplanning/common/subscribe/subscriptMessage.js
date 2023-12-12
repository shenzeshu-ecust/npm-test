import commonrest from "../commonrest";

/**
 * 打开用户订阅消息
 * @param {*} success  授权成功后回调
 * @param {*} fail  失败回调
 */
function openSubscribeMessage(success, fail, complete) {
	let {
		isSubsHotelWhiteList = false,
		hotelId,
		switchUserSubscript,
		subscriptTemplateIds = [],
	} = this.data;
	if (!isSubsHotelWhiteList && !switchUserSubscript) {
		// 开关未开启 || 不在白名单
		complete && typeof complete == "function" && complete();
		return;
	}
	let immediatelySendTemplateId = subscriptTemplateIds.length
		? subscriptTemplateIds[0]
		: ""; // 客房服务通成功 立刻发送消息
	let self = this;
	wx.requestSubscribeMessage &&
		wx.requestSubscribeMessage({
			tmplIds: subscriptTemplateIds,
			success: (res) => {
				showSubsLog(self);
				SubsStatusLog(self, subscriptTemplateIds, res);
				if (
					!immediatelySendTemplateId ||
					res[immediatelySendTemplateId] !== "accept" ||
					!hotelId
				) {
					return;
				}
				success && typeof success == "function" && success();
			},
			fail: (res) => {
				fail && typeof fail == "function" && fail(this, res);
			},
			complete: () => {
				complete && typeof complete == "function" && complete();
			},
		});
}

function getPageSource(ctx) {
	let source = "";
	switch (ctx.pageId) {
		case "10650027781":
			source = "dmhy-landing";
			break;
		case "10650054742":
			source = "wifi-landing";
			break;
		case "10650061828":
			source = "high-star-aggregate";
			break;
		case "10650067037":
			source = "employee";
			break;	
		default:
			break;
	}
	return source;
}

/**
 * 记录订阅消息曝光
 * @param {*} ctx
 */
function showSubsLog(ctx) {
	ctx.ubtTrace &&
		ctx.ubtTrace(189997, {
			IsSubscribeMessageShow: "T",
			source: getPageSource(ctx),
		});
}

/**
 * 记录用户选择模板的状态
 * @param {*} ctx
 * @param {*} tempIds 模板的id数组
 * @param {*} selectedTemps 已选择的模板
 */
function SubsStatusLog(ctx, tempIds, selectedTemps) {
	let IsCheckVipNotif = "F",
		IsCheckBenefitNotif = "F",
		IsCheckCampaignNotif = "F";
	let getTempSelectStatus = (temp) => {
		return selectedTemps[temp] === "accept" ? "T" : "F";
	};
	IsCheckVipNotif = getTempSelectStatus(tempIds[0]);
	IsCheckBenefitNotif = getTempSelectStatus(tempIds[1]);
	IsCheckCampaignNotif = getTempSelectStatus(tempIds[2]);
	ctx.ubtTrace &&
		ctx.ubtTrace(189998, {
			IsCheckVipNotif,
			IsCheckBenefitNotif,
			IsCheckCampaignNotif,
			source: getPageSource(ctx),
		});
}

/**
 * 发送用户订阅消息请求
 */
function postUserSubsInfo() {
	let { hotelId, allianceid, sid } = this.data;
	let params = {
		masterHotelId: +hotelId,
		aid: allianceid + "",
		sid: sid + "",
		messageCode: 131420
	};
	if (!hotelId) return;
	sendUnionVipPushReceivedMessage(params)
		.then((res) => {
			res.responseHead.code == 0 &&
				wx.showToast({
					title: "订阅成功",
					icon: "none",
					duration: 2000,
				});
		})
		.catch((err) => {
			console.error("push message err: ", err);
		});
}

function sendUnionVipPushReceivedMessage(param) {
	const params = {
		data: param,
		url: "unionVipPushReceivedMessage",
	};
	return commonrest.call(params).catch((err) => {
		console.error("unionVipPushReceivedMessage res err: ", err);
	});
}

module.exports = {
	openSubscribeMessage,
	postUserSubsInfo,
};
