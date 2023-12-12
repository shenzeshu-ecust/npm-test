import {CPage, cwx} from "../../../../cwx/cwx";
import {
    CTS_DATE_FORMATE, ctsFormate01DateWithString,
    ctsFormatFromStringDate, ctsFormatStringForDate
} from "../ctsDateUtil";
import {
    deleteTravelPlan,
    updateTravelPlanDate,
} from '../sendService.js'
import { getTimelineService } from "../../utils/util"


const showDeleteBtnDistance = 56;

CPage({
  checkPerformance: true,
    data: {
        travelPlanList: [],
        isLoading: true,
    },
    lastScrollIndex: -1,

    onLoad: function (options) {
        cwx.startPullDownRefresh();
    },

    onPullDownRefresh: function () {
        this.setData({
            isLoading: true,
        });
        this.getTravelPlanInfo()
    },

    handleStatusDesc(travelStatus) {
        let remindText = '';
        if (travelStatus === 1) {
            remindText = '出行中';
        } else if (travelStatus === 2) {
            remindText = '待出行';
        } else if (travelStatus === 3) {
            remindText = '无日期';
        } else {
            remindText = '已完成';
        }
        return remindText;
    },

    getContentDesc(timeStr, dayCount, poiCount) {
        if (timeStr) {
            return poiCount ? `${timeStr} · 共${dayCount}天 · ${poiCount}个游玩点` : `${timeStr} · 暂无游玩点`;
        }
        return poiCount ? `共${dayCount}天 · ${poiCount}个游玩点` : '暂无游玩点';
    },

    generateTimeStr(startDateStr, dayCount) {
        if (!startDateStr) return "";
        if (dayCount < 2) {
            const dateFormatStr = str => `${str.slice(0, 4)}年${str.slice(4, 6)}月${str.slice(6, 8)}日`;
            const startStr = dateFormatStr(startDateStr);
            return startStr;
        }

        const startTimeStr = ctsFormatFromStringDate(startDateStr, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_04);
        const startDate = ctsFormate01DateWithString(startDateStr);
        const endDate = new Date(startDate.setDate(startDate.getDate() + dayCount - 1));
        const endTimeStr = ctsFormatStringForDate(endDate, CTS_DATE_FORMATE.FORMATE_04);
        return `${startTimeStr}-${endTimeStr}`;
    },

    onShareAppMessage: function (res) {
      const data = res.target.dataset.model;
      return {
          title: data.title,
          imageUrl: data.image,
          path: '/pages/schedule/pages/cardShare/travelplanShare/travelplanShare?travelPlanId=' + data.travelPlanId
      }
    },

    getTravelPlanInfo: function () {
      getTimelineService().then( send => {
            let getTravelPlanInfo = send.getTravelPlanInfo;
            getTravelPlanInfo({
                callback: (result, data) => {
                    if (result) {
                        if (data.travelPlanList && data.travelPlanList.length > 0) {
                            data.travelPlanList.forEach((item) =>{
                                item.statusDesc = this.handleStatusDesc(item.travelStatus)
                                const timeStr = this.generateTimeStr(item.startDate, item.dayCount);
                                item.travelDesc = this.getContentDesc(timeStr, item.dayCount, item.poiCount);
                            })
                            let finishedItem = data.travelPlanList.find(item => item.travelStatus === 4);
                            if (finishedItem) {
                                finishedItem.showTitle = 1;
                            }
                        }
                        this.setData({
                            travelPlanList: data.travelPlanList ?? [],
                            isLoading: false
                        });
                    }
                    cwx.stopPullDownRefresh();
                }
            })
        });
    },

    deleteTravelCard: function (card) {
        let that = this
        cwx.showModal({
            title: '',
            content: '确认要删除整条路线',
            confirmText: '删除',
            confirmColor: "#1980FE",
            cancelColor: "#1980FE",
            success(res) {
                if (res.confirm) {
                    that._deleteCard(card);
                }
            }
        })
    },

    _deleteCard: function (card) {
        cwx.showLoading({
            title: '提交中',
            mask: true
        });
        deleteTravelPlan({
            travelPlanId: card.travelPlanId,
            callback: (result, data) => {
                cwx.hideLoading();
                if (result) {
                    cwx.startPullDownRefresh({});
                } else {
                    wx.showToast({
                        icon: "none",
                        title: '删除未成功，请稍后再试',
                    });
                }
            }
        });
    },

    setDate: function (e) {
        cwx.showLoading({
            title: '提交中',
            mask: true
        })
        let card = e.detail.card;
        let startDate = e.detail.date;
        updateTravelPlanDate({
            travelPlanId: card.travelPlanId,
            title: card.title,
            startDate: startDate,
            callback: (result, data) => {
                cwx.hideLoading();
                if (result) {
                    cwx.startPullDownRefresh({});
                } else {
                    wx.showToast({
                        icon: "none",
                        title: '设置日期未成功，请稍后再试',
                    });
                }
            }
        });
    },

    /**
     * 显示删除按钮
     */
    showDeleteButton: function (e) {
        let productIndex = e.currentTarget.dataset.productindex
        this.setXmove(productIndex, -(showDeleteBtnDistance + 10))
    },

    /**
     * 隐藏删除按钮
     */
    hideDeleteButton: function (e) {
        let productIndex = e.currentTarget.dataset.productindex

        this.setXmove(productIndex, 0)
    },

    /**
     * 设置movable-view位移
     */
    setXmove: function (productIndex, xmove) {
        let travelPlanList = this.data.travelPlanList
        travelPlanList[productIndex].xmove = xmove

        this.setData({
            travelPlanList: travelPlanList
        })
    },

    setMostHidden: function (currentIndex) {
        for(let i = 0; i < this.data.travelPlanList.length; i++) {
            if (i !== currentIndex) {
                this.data.travelPlanList[i].xmove = 0
            }
        }
        this.setData({
            travelPlanList: this.data.travelPlanList
        })
    },

    /**
     * 处理movable-view移动事件
     */
    handleMovableChange: function (e) {

    },

    /**
     * 处理touchstart事件
     */
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX
        this.startY = e.touches[0].clientY
        let currentIndex = e.currentTarget.dataset.productindex
        if (this.lastScrollIndex !== currentIndex) {
            this.setMostHidden(currentIndex)
            this.lastScrollIndex = currentIndex
        }
    },

    /**
     * 处理touchend事件
     */
    handleTouchEnd(e) {
        let scrollXValue = Math.abs(e.changedTouches[0].clientX - this.startX)
        let scrollYValue = Math.abs(e.changedTouches[0].clientY - this.startY)
        if (scrollXValue > scrollYValue && scrollYValue < 300) {
            // x方向距离>y方向距离
            if (e.changedTouches[0].clientX < this.startX && e.changedTouches[0].clientX - this.startX <= -showDeleteBtnDistance / 2) {
                //左滑
                this.showDeleteButton(e)
            } else {
                this.hideDeleteButton(e)
            }
        } else {
            this.hideDeleteButton(e)
        }
    },

    /**
     * 删除产品
     */
    handleDeleteProduct: function (e) {
        let currentIndex = e.currentTarget.dataset.productindex
        this.deleteTravelCard(this.data.travelPlanList[currentIndex])
    },
});