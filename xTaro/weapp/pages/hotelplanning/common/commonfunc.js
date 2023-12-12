import { cwx } from '../../../cwx/cwx.js';
import DateUtil from '../common/utils/date.js';
import components from '../components/components'
import hrequest from "../common/hpage/request"
const huser = require('../common/hpage/huser');
const util = require('../common/utils/util.js');
const storage = require('./utils/storage.js');
import model from '../common/utils/model';
import C from '../common/Const';

const SEARCH_KEYWORD = 'P_HOTEL_KEYWORD_SEARCH_HISTORY';

export default {
    getDateDisp: function(date, timeZoneDate, selectMorning) {
        date = DateUtil.formatTime("yyyy-MM-dd", DateUtil.parse(date));
        const arr = date.split("-");
        const ret = ['', ''];
        const allArr = [arr[1], "月", arr[2], "日"];
        const weekArr = ["日", "一", "二", "三", "四", "五", "六", "日"];
        const sdate = DateUtil.parse(date);

		if (timeZoneDate.today() === date) {
			ret[1] = "今天 ";
		} else if (timeZoneDate.tomorrow() === date) {
			ret[1] = "明天 ";
		} else if (timeZoneDate.aftertomorrow() === date) {
			ret[1] = "后天 ";
		} else {
			ret[1] = "周" + weekArr[sdate.getDay()] + " ";
		}

        // 凌晨时间状态
        if (selectMorning && timeZoneDate.yesterday() === date) {
            ret[1] = '凌晨 ';
            const todayArr = timeZoneDate.today().split('-');
            ret[2] = `${todayArr[1]}月${todayArr[2]}日`;
        }
        if (selectMorning && timeZoneDate.today() === date) {
            ret[1] = '中午 ';
        }

        ret[0] = allArr.join('');
        return ret;
    },
    getInDayText: function(inDay) {
        const date = DateUtil.formatTime("yyyy-MM-dd", DateUtil.parse(inDay));
        const arr = date.split("-");
        const allArr = [arr[1], "月", arr[2], "日"];
        return allArr.join('');
    },
    showCustomNav() {
        let version = '';
        try {
            version = wx.getSystemInfoSync().version;
        } catch (err) {
            return true;
        }
        return util.compareVersion(version, '7.0.0') >= 0;
    },
    /**
     * 整理价格明细浮层数据
     */
    priceDetailNew(hotelInfo, isLongRent) {
        if (!hotelInfo) return {};

        const totalPriceInfo = isLongRent && hotelInfo.totalPriceInfo; // 长租房场景
        const { price = 0, priceFloatInfo = {}, priceCalcItems } = totalPriceInfo || hotelInfo;
        const { roomName = '', encryptedRoomId = '' } = hotelInfo.minRoomInfo || {};
        return {
            name: roomName,
            roomNo: encryptedRoomId,
            isHourRoom: (hotelInfo.duringTime || 0) > 0,
            price: price,
            priceFloatInfo: priceFloatInfo,
            priceCalcItems: priceCalcItems
        };
    },
    /**
     * 从response中取LogId
     * @param {Object} rsp
     * @param {String} key: LogId对应的Id名，例如，'request-id'
     * @returns {String}
     */
    getResponseLogId: function(rsp, key) {
        const traceLogIdObj = rsp?.ResponseStatus?.Extension?.find(item => item?.Id === key) || {};
        return traceLogIdObj.Value || '';
    },
    
    /**
     * 动态切图-https://docs.fx.ctripcorp.com/docs/nephele/how-to/image/process/
     * 图片水印: 由于channel控制(需配置)，切图默认带水印，-_M<watermarkName>_<watermarkPosition>_R<dissolve>
     * @param urlBody {String} - 图片链接body部分
     * @param urlExtend {String} - 默认图片后缀,默认为: .jpg
     * @param type {String} - 切图类型, 包括R-固定宽高; C-固定宽高; W-高固定，宽（原图比例计算），宽固定，高（原图比例计算） （压缩）;Z-高固定，宽（原图比例计算），宽固定，高（原图比例计算）;X-居中抠图;Y-压缩或拉升至指定宽高
     * @param width {Number} - 图片宽度
     * @param height {Number} - 图片高度
     * @param quality {Number} - 图片质量,默认70.值越大，图片越清晰,相应的文件size也越大。有效值：100, 90, 80, 70, 60, 50, 40, 30, 20, 10
     * @param waterMarkName {string} - 水印名，已注册水印：https://docs.fx.ctripcorp.com/docs/nephele/how-to/image/process/registered_watermark
     * @param waterMarkPosition {Number} - 水印位置，https://docs.fx.ctripcorp.com/docs/nephele/how-to/image/process/watermark/image_watermark
     */
    getDynamicImageUrl: function ({ urlBody, urlExtend = '.jpg', type, width, height, quality = 70, waterMarkName, waterMarkPosition }){
        // 动态切图域名
        const pictureDomain = 'https://dimg04.c-ctrip.com/images';
        // webp文件后缀名
        const webpPostfix = '.webp';
        // 是否支持webp缓存的值,由于其他端也在使用该缓存key,暂不更改缓存值类型
        const webpSupportStorage = 'true';
        const postfix = cwx.getStorageSync(C.STORAGE_WEBP)?.val === webpSupportStorage ? webpPostfix : urlExtend;
        const pictureDynamicParam = `_${C.PICTURE_CUT_TYPE[type]}_${width}_${height}_Q${quality}`;
        const waterMark = waterMarkName ? (waterMarkPosition ? `_M${waterMarkName}_${waterMarkPosition}` : `_M${waterMarkName}`) : '';
        return `${pictureDomain}${urlBody}${pictureDynamicParam}${waterMark}${postfix}`;
    }
}
