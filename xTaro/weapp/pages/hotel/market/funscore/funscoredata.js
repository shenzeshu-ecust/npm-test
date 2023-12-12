import {
    cwx,
    _
} from '../../../../cwx/cwx.js';
import ModelUtil from '../../common/utils/model.js';
import util from '../../common/utils/util.js';

function _request (url, reqData, onSuccess, onError) {
    cwx.request({
        url,
        data: reqData,
        success: function (result) {
            if (util.successSoaResponse(result)) {
                onSuccess && onSuccess(result.data);
            } else {
                onError && onError();
            }
        },
        fail: function (error) {
            onError && onError(error);
        }
    });
}

export default {
    /**
     * 查询用户总积分 getUserPointInfo
     */
    getUserPointInfo: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getUserPointInfo');
        const reqData = params;

        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 查询用户积分明细 getUserPointList
     */
    getUserPointList: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getUserPointList');
        const reqData = {
            startTime: params.startTime,
            endTime: params.endTime,
            pageSize: params.pageSize,
            pagdeIndex: params.pagdeIndex
        };

        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 查询每日任务 getDailyTaskList
     */
    getDailyTaskList: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getDailyTaskList');
        const reqData = params;

        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 领取任务 recieveTask
     */
    recieveTask: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('recieveTask');
        const reqData = {
            taskId: params.taskId // 任务ID
        };

        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 领取积分 recievePoint
     */
    recievePoint: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('recievePoint');
        const reqData = {
            taskId: params.taskId // 任务ID
        };

        _request(url, reqData, onSuccess, onError);
    },

    /**
     * 用户答题 answerQuestion
     */
    answerQuestion: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('answerQuestion');
        const reqData = {
            taskId: params.taskId, // 任务ID
            questionId: params.questionId, // 问题ID
            optionId: params.optionId, // 选项ID
            shareId: params.shareId // 分享id
        };

        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 查询用户领取的任务 getUserTaskList
     */
    getUserTaskList: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getUserTaskList');
        const reqData = params;

        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 积分权益服务
     */
    getMemberPointRewards: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getMemberPointRewards');
        const reqData = params;
        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 点击分享酒店链接 clickSharedHotel
     */
    clickSharedHotel: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('clickSharedHotel');
        const reqData = {
            shareId: params.shareId,
            hotelId: params.hotelId
        };
        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 获得用户签到信息 getUserSignInInfo
     */
    getUserSignInInfo: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getUserSignInInfo');
        const reqData = params;
        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 签到服务
     */
    signInWechatPoint: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('signInWechatPoint');
        const reqData = params;
        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 抽奖服务
     */
    getUserLotteryInfo: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('getUserLotteryInfo');
        const reqData = params;
        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 抽奖
     */
    playLottery: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('playLottery');
        const reqData = params;
        _request(url, reqData, onSuccess, onError);
    },
    /**
     * 分享领抽奖次数
     */
    shareLottery: function (params, onSuccess, onError) {
        const url = ModelUtil.serveUrl('shareLottery');
        const reqData = params;
        _request(url, reqData, onSuccess, onError);
    }
};
