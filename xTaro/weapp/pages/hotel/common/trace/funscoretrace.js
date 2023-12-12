export default {
    gonow: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_mypoints_gonow_click', {
                prepageid: options.prepageid
            });
        } catch (e) {
            // console.error(e);
        }
    },
    shareFriends: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htlwechat_mypoints_forwards_click',
                options
            );
        } catch (e) {
            // console.error(e);
        }
    }

};
