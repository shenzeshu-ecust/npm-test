import {cwx} from "../../../../cwx/cwx";

export default {
    commentExposure: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('224769', {
                page: options.pageId,
                orderid: options.orderId,
                commentId: options.commentId
            });
        } catch (e) {
            // console.error(e);
        }
    },
    commentCardExposure: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('224770', {
                page: options.pageId,
                orderid: options.orderId
            });
        } catch (e) {
            // console.error(e);
        }
    },
    commentCardSubmit: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('224771', {
                page: options.pageId,
                orderid: options.orderId
            });
        } catch (e) {
            // console.error(e);
        }
    },
    commentFillingExposure: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('224772', {
                page: options.pageId,
                orderid: options.orderId,
                commentMaxPoint: options.maxScore
            });
        } catch (e) {
            // console.error(e);
        }
    },
    commentFillingClick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('224773', {
                page: options.pageId,
                orderid: options.orderId,
                actionType: options.actionType,
                commentChar: options.commentChar,
                isSubmit: options.isSubmit
            });
        } catch (e) {
            // console.error(e);
        }
    },
    chooseMediaSuccessTrace (options) {
        try {
            const tPage = cwx.getCurrentPage() || {};
            tPage.ubtTrace && tPage.ubtTrace('htl_c_applet_ordercommit_choose_media_success', {
                traceType: 'chooseMedia成功回调',
                ...options
            });
        } catch (e) {

        }
    },
    chooseMediaFailTrace (options) {
        try {
            const tPage = cwx.getCurrentPage() || {};
            tPage.ubtTrace && tPage.ubtTrace('htl_c_applet_ordercommit_choose_media_fail', {
                traceType: 'chooseMedia失败回调',
                ...options
            });
        } catch (e) {

        }
    },
    submitCommentFail (options) {
        try {
            const tPage = cwx.getCurrentPage() || {};
            tPage.ubtTrace && tPage.ubtTrace('htl_c_applet_ordercommit_submit_fail', options);
        } catch (e) {

        }
    }
};
