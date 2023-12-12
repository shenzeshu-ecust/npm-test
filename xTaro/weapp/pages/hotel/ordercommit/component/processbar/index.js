import { cwx } from '../../../../../cwx/cwx';
import util from '../../../common/utils/util';
const progressBarStepType = {
    RATING: 'rating', // 评分
    CONTENT: 'content', // 输入评论文字
    RESEARCH: 'research', // 钻级，不再使用，后续集成不会下发该类型
    TRAVEL: 'userIdentity', // 出行目的
    GOODINPUT: 'goodContent', // 评论文字内容>=50
    IVUPLOAD: 'ivUpload' // 上传图片张数>=3 || 视频时长>=15s
};
const barIconType = {
    DEFAULT_1: 'https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-flag-default.png',
    LIGHT_1: 'https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-flag-light.png',
    DEFAULT_2: 'https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-gift-default.png',
    LIGHT_2: 'https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-gift-light.png',
    DEFAULT_3: 'https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-great-default.png',
    LIGHT_3: 'https://pages.c-ctrip.com/hotels/wechat/img/ordercomment-great-light.png'
};
// commentPoints中的输入type
const INPUT_TYPE = 1;
// commentPoints中的图片type
const IMAGE_TYPE = 2;
// commentPoints中的视频type
const VIDEO_TYPE = 3;
// 进度条积分规则processBarIcon中有效的arrowType,
// 箭头类型 0-无 1-必填项完成(前端展示小旗子icon) 2-活动(前端展示小礼物icon) 3-所有项全部完成(前端展示大拇指icon)
const validIconTypes = [1, 2, 3];
// 进度条所有项都完成时的arrowType
const TOTALSTEPTYPE = 3;

Component({
    properties: {
        pointStep: {
            type: Object
        },
        commentPoints: {
            type: Object
        },
        rated: { // 已选评分
            type: Boolean,
            observer: function (newVal, oldVal) {
                newVal && this.updateStepInfo();
            }
        },
        tripPurposeSelected: { // 已选出行目的
            type: Boolean,
            observer: function (newVal, oldVal) {
                newVal && this.updateStepInfo();
            }
        },
        inputCommentLength: { // 点评文字长度
            type: Number,
            observer: 'updateStepInfo'
        },
        uploadImageLength: { // 图片张数
            type: Number,
            observer: 'updateStepInfo'
        },
        uploadVideoTime: { // 视频长度
            type: Number,
            observer: 'updateStepInfo'
        },
        wellThreshold: { // 优质评价阈值
            type: Object
        }

    },
    /**
     * 变量命名规则：
     * 用户实际可获得积分-score
     * 用于匹配step的虚拟积分（点值）-point
     */
    data: {
        maxTotalPoints: 0, // 可获得的最大积分
        currentStepWidth: 0, // 进度条高亮
        totalStepCount: 4, // 评分总步数，默认使用prd上提供的值
        stepCount: 3, // 评分必填步数，默认使用prd上提供的值
        processBarIcon: [], // icon
        tipRules: [],
        barRules: [],
        pointRule: [], // 真实评分数组
        fixRules: [], // 固定规则，比如：评分 ｜ 出行目的
        flexRules: [], // 根据用户的输入长度/上传图片张数等变化的规则，比如：点评文字｜上传图片｜上传视频
        stepRules: [], // 进度条规则，包括 激励文案 & 进度
        extraPointTips: [], // 额外积分
        leftTipList: [], // 左边激励话术
        rightTip: '', // 右边激励话术
        defaultText: '' // 初始激励话术
    },
    attached () {
        this.initPointRuleInfo();
    },
    methods: {
        /**
         * 处理积分&激励信息，获取积分规则
         * commentPoints中type：0:非输入状态提示（上传3张图/15秒视频）  1:文字得分规则  2:图片提示规则 3: 视频提示规则 （图片和视频的取或）
         * steps中name：
         *      rating- 评分
         *      userIdentity- 出行目的
         *      content- 文字输入，文字长度[5,50)，其中5和50是根据start和end取的
         *      goodContent- 文字长度[50,+∞)
         *      ivUpload- 上传图片张数>=3 || 视频时长>=15s
         */
        initPointRuleInfo () {
            const { pointStep, commentPoints } = this.properties;
            if (!(pointStep && commentPoints)) return;
            const { stepCount = 3, steps = [], guideRuleInfo, maxTotalPoints, extraPointTips = [] } = pointStep;
            const tipRules = guideRuleInfo?.encourageTipRules || [];
            const defaultTipRule = tipRules.find(rule => rule.start === 0);
            const fixRules = this.buildFixedRule(steps);
            const { processBarIcon, totalStepCount } = this.initBarIcon(guideRuleInfo?.progressBarRules);

            this.setData({
                maxTotalPoints,
                processStep: Array(totalStepCount).fill(0),
                processBarIcon,
                totalStepCount,
                stepCount,
                tipRules,
                extraPointTips,
                leftTipList: this.getHighLightText(defaultTipRule?.content) || [],
                rightTip: `最高${maxTotalPoints}积分`,
                barRules: guideRuleInfo?.progressBarRules || [],
                fixRules: fixRules.filter(item => !!item)
            });
        },

        /**
         * 必选项积分规则
         * @param steps
         * fixRules 虚拟积分（点值），用于匹配激励文案/进度条进度
         * @returns {{score, tipPoint, barPoint, name: *}[]}
         */
        buildFixedRule (steps = []) {
            let fixRules = [];
            if (!steps.length) return fixRules;
            fixRules = steps.map(step => {
                return ({
                    score: step.point || 0,
                    name: step.name,
                    barPoint: step.guideItem?.progressBarScore || 0, // 进度条虚拟积分
                    tipPoint: step.guideItem?.encourageTipScore || 0 // 激励话术虚拟积分
                });
            });
            return fixRules;
        },
        // 积分以及激励
        updateStepInfo () {
            const {
                totalStepCount,
                fixRules,
                extraPointTips
            } = this.data;
            if (!totalStepCount) return;

            const extraScore = extraPointTips?.reduce((a, b) => (a + b.extraPoint), 0) || 0;
            const { currentSteps, flexRules, requiredValid } = this.getCurrentStep();
            let totalScore = 0;
            let verticalTipPoint = 0; // 虚拟激励积分
            let verticalBarPoint = 0; // 虚拟进度条积分
            const totalRule = [...fixRules, ...flexRules];

            totalRule.forEach(rule => {
                const { name, barPoint, tipPoint, score } = rule;
                if (currentSteps.get(name)) {
                    verticalTipPoint += tipPoint;
                    verticalBarPoint += barPoint;
                    totalScore += score;
                }
            });
            // 必填项完成后，加上额外积分
            totalScore += (requiredValid ? extraScore : 0);
            this.updateTipInfo(verticalTipPoint, totalScore);
            this.updateBarInfo(verticalBarPoint);
        },
        // 进度条左边的激励文案
        updateTipInfo (point, totalScore) {
            const { tipRules, leftTipList: oldLeftTipArr } = this.data;
            if (!tipRules.length) return;
            const currentTipRule = tipRules.find(item => {
                const { start, end } = item;
                return point >= start && (end === -1 || point <= end);
            });
            const leftTip = currentTipRule?.content?.replace(/\$n/g, totalScore);
            const leftTipList = this.getHighLightText(leftTip, '$');
            this.setData({
                leftTipList: leftTipList.length ? leftTipList : oldLeftTipArr
            });
        },
        getHighLightText (content = '', separator = '$') {
            return content.split(separator).map((text, index) => {
                return text && ({
                    content: text,
                    highLight: !!(index % 2)
                });
            }).filter(item => !!item);
        },
        /**
         * icon样式
         * arrowType： 0-无 1-必填项完成(前端展示小旗子icon) 2-活动(前端展示小礼物icon) 3-所有项全部完成(前端展示大拇指icon)
         * @param rules
         * @returns {{}|{totalStepCount: (number), processBarIcon: Array []}}
         */
        initBarIcon (rules = []) {
            if (!rules.length) return {};
            const totalStepCount = rules.length - 1;
            const processBarIcon = rules.map(rule => {
                const { arrowType, rate } = rule;
                if (validIconTypes.includes(arrowType)) {
                    return ({
                        arrowType,
                        url: barIconType[`DEFAULT_${arrowType}`],
                        left: (rate / totalStepCount) * 100 + '%'
                    });
                }
                return null;
            }).filter(item => !!item);
            return {
                totalStepCount,
                processBarIcon
            };
        },
        /**
         * 进度条状态: 右边激励+进度条
         * arrowType: 0-无 1-必填项完成(前端展示小旗子icon) 2-活动(前端展示小礼物icon) 3-所有项全部完成(前端展示大拇指icon)
         * @param point
         */
        updateBarInfo (point) {
            const { barRules = [], stepCount, totalStepCount, processBarIcon, maxTotalPoints } = this.data;
            const currentBarRule = barRules.find(item => {
                const { start, end } = item;
                return point >= start && (end === -1 || point <= end);
            }) || {};
            const { rate, arrowDesc } = currentBarRule;

            const currentIcon = processBarIcon.map(icon => {
                // icon是否高亮的参照步数：全部选项全部完成-> totalStepCount, 其他->stepCount
                const referenceStepCount = icon.arrowType === TOTALSTEPTYPE ? totalStepCount : stepCount;
                const pref = rate >= referenceStepCount ? 'LIGHT' : 'DEFAULT';
                return ({
                    ...icon,
                    url: barIconType[`${pref}_${icon.arrowType}`]
                });
            });
            this.setData({
                currentStepWidth: (rate / (totalStepCount)) * 100 + '%',
                rightTipHighLight: rate === totalStepCount,
                rightTip: rate === totalStepCount ? `已获${arrowDesc}` : `最高${maxTotalPoints}积分`,
                processBarIcon: currentIcon
            });
        },
        // 已完成步骤
        getCurrentStep () {
            const {
                rated,
                tripPurposeSelected,
                inputCommentLength,
                uploadImageLength,
                uploadVideoTime,
                wellThreshold
            } = this.properties;
            const currentSteps = new Map();
            const { imageLength: wellImageLen, textLength: wellInputLen, videoLength: wellVideoTime } = wellThreshold;
            const flexRules = this.buildFitInputRule(inputCommentLength, uploadImageLength, uploadVideoTime);

            // 由于无法通过commentinit下发字段确定有效的评价长度，先使用prd提供的长度兜底
            const isValidContent = inputCommentLength >= 5;
            const isGoodContent = inputCommentLength >= wellInputLen;
            const isGoodUpload = (uploadImageLength >= wellImageLen) || (uploadVideoTime >= wellVideoTime);
            currentSteps.set(progressBarStepType.RATING, rated);
            currentSteps.set(progressBarStepType.TRAVEL, tripPurposeSelected);
            currentSteps.set(progressBarStepType.CONTENT, isValidContent);
            currentSteps.set(progressBarStepType.GOODINPUT, isGoodContent);
            currentSteps.set(progressBarStepType.IVUPLOAD, isGoodUpload);
            return {
                flexRules,
                requiredValid: isValidContent && rated && tripPurposeSelected,
                currentSteps
            };
        },
        /**
         * 获取当前输入/上传信息对应的进度区间信息，优质评价：输入评论｜上传图片
         * commentPoints：
         *      type：0:非输入状态提示（上传3张图/15秒视频）  1:文字得分规则  2:图片提示规则 3: 视频提示规则；其中图片和视频取其一
         *      guideItem：可标识优质评论
         * @returns {Array[]}
         */
        buildFitInputRule (inputLen, imgLen, videoTime) {
            const commentPoints = this.properties.commentPoints || [];
            const flexRules = [];
            // 是否在区间内
            const fitRange = (start, end, currentLen) => {
                return currentLen >= start && (end === -1 || currentLen <= end);
            };
            const inputType = {
                [INPUT_TYPE]: inputLen,
                [IMAGE_TYPE]: imgLen,
                [VIDEO_TYPE]: videoTime
            };
            for (const rule of commentPoints) {
                const { type, start, end, guideItem, point } = rule;

                const flexRule = {
                    score: point || 0,
                    barPoint: guideItem?.progressBarScore || 0, // 进度条虚拟积分
                    tipPoint: guideItem?.encourageTipScore || 0 // 激励话术虚拟积分
                };
                const isFit = fitRange(start, end, inputType[type]);
                switch (type) {
                case INPUT_TYPE:
                    flexRule.name = (guideItem ? progressBarStepType.GOODINPUT : progressBarStepType.CONTENT);
                    isFit && flexRules.push(flexRule);
                    break;
                case IMAGE_TYPE:
                    flexRule.name = (guideItem ? progressBarStepType.IVUPLOAD : '');
                    isFit && flexRules.push(flexRule);
                    break;
                case VIDEO_TYPE:
                    flexRule.name = (guideItem ? progressBarStepType.IVUPLOAD : '');
                    isFit && flexRules.push(flexRule);
                    break;
                default:
                    break;
                }
            }
            return util.uniqueArr(flexRules);
        },

        toCommentRule () {
            cwx.component.cwebview({
                data: {
                    url: 'https://pages.c-ctrip.com/hotels/IBU/pages/reviewrule.html'
                }
            });
        }

    }
});
