export default {
    destinationTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(options.key, {
                page: options.pageId,
                keyword: options.keyword,
                locating_city: options.cityId,
                AB_version: '',
                associative_word_attribute: options.associateWordList,
                keywordTracelogid: options.keywordTracelogid
            });
        } catch (e) {
            // ignore
        }
    },
    keywordTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(options.key, {
                page: options.pageId,
                keyword: options.keyword,
                locating_city: options.cityId,
                AB_version: '',
                associative_word_attribute: options.associateWordList,
                choose_destination: options.destination,
                choose_destination_type: options.destinationType,
                keywordTracelogid: options.keywordTracelogid,
                is_compensation_recommendation: options.isCompensationRec
            });
        } catch (e) {
            // ignore
        }
    },
    searchListClick: function (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_list_search_click', options);
        } catch (e) {
            // ignore
        }
    }
};
