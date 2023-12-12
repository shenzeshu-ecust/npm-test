import { cwx } from '../../../../cwx/cwx';
import C from '../../common/C.js';
import storage from '../../common/utils/storage';
import commonfunc from '../../common/commonfunc';
import ModelUtil from '../../common/utils/model.js';

const TOTAL_TIME = 15; // 单位：秒
const TIME_STEP = 0.1; // 单位： s
const PROCESS_LENGTH = 104; // 设置的进度条长度，与css一致
const START_ING = 1;
const PAUSE_ING = 2;
const END = 3;
const HOTEL_LANDING_PAGE_ROUTE = 'hotel/list/index'; // 活动页跳入的第一个酒店页面
let time = 0;
let countInterval = null;

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        taskid: {
            type: String
        },
        actionid: {
            type: String
        },
        usenew: {
            type: Number
        },
        usertaskactionid: {
            type: Number
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        START_ING,
        PAUSE_ING,
        END,
        width: 0,
        message: '浏览页面获取奖励',
        processImgSrc: 'https://pages.c-ctrip.com/hotels/wechat/img/countdown-ing.png',
        endImgSrc: 'https://pages.c-ctrip.com/hotels/wechat/img/countdown-end.png',
        status: START_ING,
        leftTime: TOTAL_TIME
    },

    attached: function () {
        // 若在页面onShow后设置组件是否显示，不会触发组件中pagelifetims的show生命周期，只会触发attached
        this.triggerEvent('ready', this);
        this.startAnimation();
    },
    detached () {
        this.pauseAnimation();
    },
    pageLifetimes: {
        // 页面展示时，动画继续
        show: function () {
            this.startAnimation();
        },
        // 页面隐藏，暂停动画
        hide: function () {
            this.pauseAnimation();
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        // 动画暂停，时间计入缓存，先判断动画是否已经完成，已完成则不计入缓存
        pauseAnimation () {
            const taskFinished = storage.getStorage(C.STORAG_COUNT_DOWN_FINISH);
            if (taskFinished) return;
            const status = this.data.status;
            if (status === START_ING) {
                this.setData({
                    status: PAUSE_ING,
                    width: time / TOTAL_TIME * PROCESS_LENGTH
                });
            }
            storage.setStorage(C.STORAGE_COUNT_DOWN_PENDANT, time);
            this.destoryInterval();
        },
        handleTaskCompleted () {
            this.destoryInterval(countInterval);
            storage.setStorage(C.STORAG_COUNT_DOWN_FINISH, 1); // 动画完成设置缓存
            const url = ModelUtil.serveUrl('notifyTaskCompleted');
            const { taskid, actionid, usenew, usertaskactionid } = this.properties;
            const reqData = {
                task: {
                    actionId: +actionid
                }
            };
            if (usenew) {
                reqData.flowActivity = 1;
                reqData.task.userTaskActionId = +usertaskactionid;
            } else {
                reqData.task.taskId = +taskid;
            }
            commonfunc.postRequest(url, reqData, (res) => {
                if (+res.code === 200) {
                    this.setData({
                        width: PROCESS_LENGTH,
                        message: '浏览完成',
                        status: END
                    });
                    time = TOTAL_TIME;
                    cwx.showToast({ title: res.message, icon: 'none', duration: 2000 });
                } else {
                    this.handleTaskFail();
                }
            }, (error) => {
                this.handleTaskFail();
            });
        },
        handleTaskFail () {
            this.setData({
                taskFinished: true
            });
            cwx.showToast({ title: '系统繁忙，请稍后再试', icon: 'none', duration: 2000 });
        },
        // 组件展示，动画继续
        startAnimation () {
            // 先确定动画是否已经完成，已完成则不展示
            const taskFinished = storage.getStorage(C.STORAG_COUNT_DOWN_FINISH) || 0;
            time = storage.getStorage(C.STORAGE_COUNT_DOWN_PENDANT) || 0;
            if (taskFinished) {
                this.setData({
                    taskFinished: true
                });
                return;
            }
            if (time < TOTAL_TIME) {
                this.destoryInterval();
                countInterval = setInterval(() => {
                    time += TIME_STEP;
                    if (time >= TOTAL_TIME) {
                        this.destoryInterval();
                    }
                }, TIME_STEP * 1000);
            }
            time = Math.min(time, TOTAL_TIME); // 浮点数
            this.setData({
                width: time / TOTAL_TIME * PROCESS_LENGTH,
                status: time === TOTAL_TIME ? END : START_ING,
                taskFinished: !!taskFinished,
                leftTime: TOTAL_TIME - time
            });
        },

        destoryInterval () {
            countInterval && clearInterval(countInterval);
            countInterval = null;
        },
        // 删除缓存，回退到非酒店页面时清除缓存
        removeStorage () {
            storage.removeStorageSync(C.STORAG_COUNT_DOWN_FINISH);
            storage.removeStorageSync(C.STORAGE_COUNT_DOWN_PENDANT);
        },

        back: function () {
            // 页面栈从后往前数，第一个不为hotellist的酒店
            const pagesRouteList = getCurrentPages().map(item => item.route)?.reverse() || [];
            const beforeHotelIndex = pagesRouteList.findIndex(item => item.indexOf(HOTEL_LANDING_PAGE_ROUTE) > -1) + 1;
            cwx.navigateBack({
                delta: beforeHotelIndex || 1
            });
        }
    }
});
