export function processCheckpointData(checkpointData, homeInfo, isShowMaxReward) {
	if (!checkpointData.checkpointList?.length) {
		return {};
	}
	const res = checkpointData;
    let hasAssistUser = false;//是否有人助力

	res.checkpointList = checkpointData.checkpointList.map((cp, index) => {
		// 补全邀请用户列表
		const assistingUserNum = cp.assistingUserList.length || 0;

        if (!hasAssistUser && assistingUserNum > 0) {
            hasAssistUser = true;
        }
        
		// 兜底默认头像
		cp.assistingUserList = cp.assistingUserList.map((item) => {
			item.user = {
				avatar:
					item.user?.avatar ||
					"https://pages.c-ctrip.com/hotels/wechat/market/assistcutprice/default-avatar.png",
				nick: item.user?.nick || "携程用户",
			};
			return item;
		});
		// 用待邀请类型填充用户列表
		let toBeInvitedNum = cp.canInvite - assistingUserNum;
		while (toBeInvitedNum > 0) {
			cp.assistingUserList.push({ toBeInvited: true });
			toBeInvitedNum--;
		}
		// 处理当前关卡文案逻辑
		if (cp.status === 0) {
			if (cp.current === 1 && assistingUserNum === 0) {
				// 无好友助力
				cp.checkpointTitle = `邀请${cp.canInvite}人可返`;
			} else if (cp.current === 1 && assistingUserNum > 0) {
				// 有好友助力未达到第一个返现点
				cp.checkpointTitle = `再邀请${
					cp.canInvite - assistingUserNum
				}人可返`;
			} else if (
				!checkpointData.currentIsLast ||
				cp.canInvite < assistingUserNum
			) {
				// 已达到返现点未达到顶额
				cp.checkpointTitle = `当前可返${
					cp.totalCashBackAmount - cp.cashBackAmount
				}元，再邀${cp.canInvite - assistingUserNum}人累计可返`;
			}
		}

		if (
			cp.status === 1 &&
			cp.current === checkpointData.current &&
			[3, 4, 5].includes(homeInfo.assistStatus)
		) {
			// 活动结束，当前关闯关成功
			cp.checkpointTitle = "累计可返";
		}

		if (
			index === checkpointData.checkpointList.length - 1 &&
			cp.status === 1 &&
			homeInfo.assistCashbackAmount === homeInfo.totalAmount
		) {
			// 已达到顶额
			cp.checkpointTitle = "恭喜通关，累计可返";
		}

		if (cp.status === 2) {
			// 非当前关的未完成关卡
			cp.checkpointTitle = "闯关成功后累计可返";
		}

		if (cp.status === 4) {
			// 订单取消，返现失效
			cp.cancelTitle = "您的订单已取消，累计的返现已失效";
			cp.totalCashBackAmount = "";
		}

		// 补充逻辑：当前关卡是否闯关完成
		if (cp.current === checkpointData.current) {
			res.currentStatus = cp.status;
		}

		return cp;
	});

	// 获取当前关索引
	res.swiperCurrent = checkpointData.checkpointList.findIndex(
		(c) => c.current === checkpointData.current
	);

	if (checkpointData.moreCheckpoint && homeInfo.assistStatus === 1) {
		// 是否还有更多关卡 该字段用于展示问号关卡
		// status === 9 表示问号关卡，前端自定义
		const lockedCheckpoint =
			checkpointData.checkpointList[
				checkpointData.checkpointList?.length - 1
			]?.current + 1;
		if (lockedCheckpoint) {
			res.checkpointList.push({
				lockedCheckpoint: true,
				checkpointTitle: `第${lockedCheckpoint - 1}关后解锁`,
				current: lockedCheckpoint,
				totalCashBackAmount: "?",
				status: 9,
			});
		}
	}

    //如果是b版，>3关，添加关卡，没人助力显示该关卡 status === 10 推荐关卡
    if (res.checkpointList.length > 3 && isShowMaxReward) {
        let maxAwardList = []
        if (!hasAssistUser) {
            //如果没人助力，展示邀请模块
            maxAwardList.push({
                toBeInvited: true,
            })
        }
        res.checkpointList.push({
            checkpointTitle: `邀请好友最高可领`,
            current: res.checkpointList.length + 1,
            totalCashBackAmount: homeInfo.totalAmount,
            status: 10,
            assistingUserList: maxAwardList
        });

        if (!hasAssistUser) {
            //如果没人助力，显示推荐关卡
            res.swiperCurrent = res.checkpointList.length - 1;
        }
    }

	return res;
}

export function processAssistPopup(checkpointData, homeInfo) {
	const { current, checkpointList, currentStatus } = checkpointData;
	const { assistStatus, assistCashbackAmount, totalAmount } = homeInfo;
	if (assistStatus === 1) {
		// 已经砍到顶额
		if (assistCashbackAmount === totalAmount) {
			return {
				isAssistPopupShow: true,
				title: "闯关成功",
				desc: "恭喜通关，累计可返",
				btnTxt: "知道了",
				status: 1,
				assistCashbackAmount,
			};
		}
	}
	if (assistStatus === 2) {
		// 订单取消
		return {
			isAssistPopupShow: true,
			title: "很抱歉，您不符合本次活动条件",
			desc: "",
			btnTxt: "知道了",
			status: 2,
		};
	}
	if (assistStatus === 3) {
		// 助力结束，未达到返现点
		return {
			isAssistPopupShow: true,
			title: "闯关失败",
			desc: "很遗憾，您未在24小时内邀请足够好友助力",
			btnTxt: "知道了",
			status: 3,
			assistingUserList:
				checkpointData.checkpointList[0]?.assistingUserList,
		};
	}
	if (assistStatus === 4 || assistStatus === 5) {
		const checkpoints = checkpointList.filter((i) => i.status === 1).length;
		// 助力结束，可返现
		return {
			isAssistPopupShow: assistCashbackAmount > 0,
			title: "闯关结束",
			desc: `太棒了，您在24小时内连闯了${checkpoints}关，累计可返`,
			btnTxt: "知道了",
			status: assistStatus,
			assistCashbackAmount,
		};
	}
	return { isAssistPopupShow: false };
}

export function processJumpLink(assistIcons, homeInfo) {
	const sponsorJumpLink = assistIcons
		.filter((j) => j.type === "1" && j.sponsorType === "0")
		.map((j) => ({
			image: j.img,
			text: j.text,
			wxJumpUrl: j.wxJumpUrl,
			h5JumpUrl: j.h5JumpUrl,
			bannerUrl: j.bannerUrl,
		}));

	return { sponsorJumpLink, guestJumpLink: sponsorJumpLink };
}

export function isResSuccess(res) {
	return res?.ResponseStatus?.Ack && res.ResponseStatus.Ack !== "Failure";
}
