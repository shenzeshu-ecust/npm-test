export default {
    citySelectClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227469, options);
        } catch (e) {
            // ignore
        }
    },
    curPositionClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227472, options);
        } catch (e) {
            // ignore
        }
    },
    dateSelectClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227473, options);
        } catch (e) {
            // ignore
        }
    },
    kewordInfoSearchClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227474, options);
        } catch (e) {
            // ignore
        }
    },
    priceStarClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227476, options);
        } catch (e) {
            // ignore
        }
    },
    searchClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227481, options);
        } catch (e) {
            // ignore
        }
    },
    hourRoomSearchClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227483, options);
        } catch (e) {
            // ignore
        }
    },
    nearbySearchClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace(227484, options);
        } catch (e) {
            // ignore
        }
    },
    posFailedClick (page, options) {
        try {
            page.ubtDevTrace && page.ubtDevTrace('htl_c_applet_inquire_position_failed_click', options);
        } catch (e) {
            // ignore
        }
    },
    specialHotelClick (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_applet_inqure_lowprice_click', options);
        } catch (e) {
            // ignore
        }
    }

};
