import { cwx, CPage } from '../../../cwx/cwx.js';
import huser from '../common/hpage/huser';
import trace from '../common/trace/ordercommittrace';
import requtil from './requtil';
import commonfunc from '../common/commonfunc';
import util from '../common/utils/util.js';

// 最少输入文字长度，由prd提供
const VALID_INPUT_LENGTH = 5;

CPage({
    pageId: 10650078883,
    checkPerformance: true, // 白屏检测添加标志位
    data: {
        showLoading: false,
        enableSubmit: false, // 必填项是否已完成
        token: '',
        isLogin: true,
        canComment: true,
        errorMessage: '',
        travelType: -1, // 出行目的
        anonymousFlag: false, // 是否匿名
        commentText: '', // 输入的点评
        inputCommentLength: 0, // 用户输入的点评长度
        uploadImageLength: 0, // 用户上传的图片张数
        uploadVideoTime: 0, // 用户上传的视频时长
        tripPurposeSelected: false, // 是否选择出行目的
        rated: false,
        pictures: [] // 用户上传的图片
    },
    pageStatus: {
        isSubmitComment: false // 是否提交点评
    },
    async onLoad (options) {
        this.options = options;
        const isLogin = await huser.checkLoginStatus(true);
        if (!isLogin) {
            this.setData({
                isLogin
            });
            return;
        }
        this.loadPage();
        commonfunc.monitorPrivacyAuthorize();
    },
    onUnload () {
        // 提交点评成功后，刷新待点评状态
        if (this.pageStatus.isSubmitComment && this.getOpenerEventChannel) {
            const ec = this.getOpenerEventChannel();
            if (ec && ec.emit) {
                ec.emit('refreshWaitCommentStatus', true);
            }
        }
    },
    loadPage () {
        const { hotelname: hotelName } = this.options;
        this.setData({
            orderId: this.options.oid,
            isLogin: true,
            hotelName
        });
        if (hotelName) {
            this.setNavTitle(hotelName);
        }
        this.initComment();
    },
    initComment () {
        const { hotelid, oid, sourcename = '' } = this.options;
        const reqData = {
            hotelId: hotelid,
            orderId: oid,
            sourceFrom: sourcename
        };
        requtil.commentInit(reqData, this.initCommentSuccess, this.handleInvalidComment);
    },
    initCommentSuccess (res) {
        const {
            result,
            resultMessage,
            hotelInfo = {},
            token,
            guideQuestion,
            pointStep = {},
            commentPoints = {}
        } = res;
        const { ratingItemEvaluationDescList: ratingDescList = [], ratingItems = [] } = res;
        // 无法点评
        if (result !== 0) {
            const errMsg = result === 2 ? resultMessage : '';
            this.handleInvalidComment(errMsg);
            return;
        }
        const { hotelName } = this.data;
        const dataToSet = {
            token,
            wellCommentThreshold: this.getWellCommentThreshold(commentPoints),
            placeholderText: guideQuestion?.defaultQuestion || '房间如何？服务是否满意？您的表扬和批评对我们都十分重要',
            pointStep,
            commentPoints,
            ratingDescList,
            ratingItems
        };

        this.setData(dataToSet);

        // 设定导航栏标题
        if (hotelInfo?.hotelName && (hotelName !== hotelInfo.hotelName)) {
            this.setNavTitle(hotelInfo.hotelName);
        }
        trace.commentFillingExposure(this, {
            pageId: this.pageId,
            orderId: this.options.oid
        });
    },
    /**
     * 获取符合优质点评的阈值。默认使用prd提供的阈值：评论文字长度>=50，图片长度>=3，视频长度>=15
     * commentPoints：
     *   type：0:非输入状态提示（上传3张图/15秒视频）  1:文字得分规则  2:图片提示规则 3: 视频提示规则；其中图片和视频取其一
     *   guideItem：可标识优质评论
     * @param commentPoints
     */
    getWellCommentThreshold (commentPoints = []) {
        const wellResult = {
            textLength: 50,
            imageLength: 3,
            videoLength: 15
        };
        if (!commentPoints.length) return wellResult;
        commentPoints.forEach(item => {
            const { guideItem, start, type } = item;
            if (guideItem) {
                type === 1 && (wellResult.textLength = start);
                type === 2 && (wellResult.imageLength = start);
                type === 3 && (wellResult.videoLength = start);
            }
        });
        return wellResult;
    },
    handleInvalidComment (errMsg) {
        this.setData({
            canComment: false,
            errorMessage: errMsg || '很抱歉，该订单暂时无法点评！'
        });
    },
    // 导航栏标题
    setNavTitle (title) {
        if (!title) return;
        cwx.setNavigationBarTitle({
            title
        });
    },
    // 返回前一页
    goBack () {
        const isLandingPage = commonfunc.isLandingPage();
        const url = '../inquire/index';
        if (isLandingPage) {
            cwx.reLaunch({ url });
        } else {
            cwx.navigateBack();
        }
    },
    /**
     * 接收组件的评分
     * @param e
     */
    handleRatingIcon: function (e) {
        const ratingNumberList = e.detail.ratingNumberList;
        const ratingType = ratingNumberList?.ratingType;
        const ratingNumber = ratingNumberList[ratingNumberList?.ratingType];
        let { ratPoint, raAtPoint, servPoint, faclPoint } = this.data;
        switch (ratingType) {
        case 'cleanliness': {
            ratPoint = ratingNumber; // 卫生评分
            break;
        }
        case 'location': {
            raAtPoint = ratingNumber; // 环境评分
            break;
        }
        case 'service': {
            servPoint = ratingNumber; // 服务评分
            break;
        }
        case 'facility': {
            faclPoint = ratingNumber; // 设施评分
            break;
        }
        default: break;
        }
        this.setData({
            ratPoint,
            raAtPoint,
            servPoint,
            faclPoint,
            rated: Boolean(ratPoint && raAtPoint && servPoint && faclPoint)
        }, this.checkRequiredValid);
    },
    /**
     * 点击埋点
     */
    commentFillingClickTrace: function (actionType, isSubmit = false) {
        const logData = {
            pageId: this.pageId,
            orderId: this.options.oid,
            actionType,
            commentChar: this.data.commentText,
            isSubmit
        };
        trace.commentFillingClick(this, logData);
    },
    acceptTraceType: function (e) {
        const actionType = e.detail.actionType;
        this.commentFillingClickTrace(actionType);
    },
    /**
     * 接收来着组件的出行目的
     * @param e
     */
    handleTravelType (e) {
        const travelInfo = e.detail.travelInfo;
        const travelType = travelInfo.key;
        this.setData({
            travelType,
            tripPurposeSelected: true
        }, this.checkRequiredValid);
    },
    /**
     * 接收来至组件的图片
     */
    acceptImages: function (e) {
        const pictures = e?.detail?.pictures || [];
        this.setData({
            pictures,
            uploadImageLength: pictures.length
        });
    },
    /**
     * 接收来自组件的点评文字
     * @param e
     */
    acceptInputComment: function (e) {
        const commentText = e?.detail?.comment || '';
        this.setData({
            commentText,
            inputCommentLength: commentText.length
        }, this.checkRequiredValid);
    },
    selectAnonymous: function (e) {
        const selected = e?.detail?.selected || false;
        this.setData({
            anonymousFlag: selected
        });
    },
    /**
     * 检测必填项是否已完成
     */
    checkRequiredValid () {
        const { inputCommentLength, tripPurposeSelected, rated } = this.data;
        const validInput = inputCommentLength >= VALID_INPUT_LENGTH;
        this.setData({
            enableSubmit: Boolean(validInput && tripPurposeSelected && rated)
        });
    },
    showInvalidToast () {
        const {
            inputCommentLength,
            tripPurposeSelected,
            rated
        } = this.data;
        const validInput = inputCommentLength >= VALID_INPUT_LENGTH;
        if (!rated) {
            cwx.showToast({ title: '还没有打分哦', icon: 'none', duration: 2000 });
            return;
        }
        if (!validInput) {
            cwx.showToast({ title: '至少写5个字才能发布哦', icon: 'none', duration: 2000 });
            return;
        }
        if (!tripPurposeSelected) {
            cwx.showToast({ title: '还没有填写出游类型哦', icon: 'none', duration: 2000 });
        }
    },
    /**
     * 提交点评
     */
    submitComment: util.throttle(function () {
        const {
            enableSubmit,
            token,
            ratPoint,
            raAtPoint,
            servPoint,
            faclPoint,
            travelType,
            commentText: content,
            anonymousFlag,
            pictures
        } = this.data;
        if (!enableSubmit) {
            this.commentFillingClickTrace(7, false);
            this.showInvalidToast();
            return;
        }
        this.commentFillingClickTrace(7, true);
        this.setData({
            showLoading: true
        });
        // 过滤出已经上传完成的图片
        const validPictures = pictures.filter(pic => pic.uploaded);
        const params = {
            token,
            ratPoint,
            raAtPoint,
            servPoint,
            faclPoint,
            travelType,
            content,
            uploadFiles: validPictures.map(it => it.file),
            anonymousFlag,
            rmsToken: cwx.clientID
        };
        const onFail = (res) => {
            trace.submitCommentFail(res);
            cwx.showToast({ title: '提交失败', icon: 'none', duration: 2000, mask: true });
        };
        requtil.submitComment(params, (res) => {
            // 关闭loading浮层
            this.setData({
                showLoading: false
            });
            if (!res) {
                onFail();
                return;
            }
            const { result, resultMessage, displayResultMessage, commentId } = res;
            if (result === 0) {
                cwx.showToast({ title: resultMessage || '点评提交成功', icon: 'none', duration: 2000, mask: true });
                this.pageStatus.isSubmitComment = true;
                this.goToOrderFinish(displayResultMessage, commentId);
                return;
            }
            onFail(res);
        }, (res) => {
            onFail(res);
        });
    }, 400),
    /**
     * 点评完成页
     * @param display：点评完成激励
     * @param id： 点评id
     */
    goToOrderFinish (display, id = 0) {
        const title = display?.title || '';
        const subTitle = display?.subTitle || '';

        cwx.redirectTo({
            url: `../orderfinish/index?oid=${this.options.oid}&commentid=${id}&title=${title}&subtit=${subTitle}`
        });
    }
});
