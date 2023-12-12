export default {
    tagclick: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('o_hotel_wechatapp_commlist_tagclick', {
                hotelid: options.id,
                tagtype: options.tags.find(c => c.key == options.tagid || c.id === options.tagid).name
            });
        } catch (e) {
            // console.error(e);
        }
    }
};
