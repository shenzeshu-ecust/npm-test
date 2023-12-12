import { cwx } from "../../../../cwx/cwx.js";

const baseIndex = {
    onLoad: function (options) {
        const {
            b = "",
            allianceid = "",
            sid = "",
            a = 0,
            eid = ""
        } = options;
        let transfer = this.source
        if(this.source === "high-star-aggregate" && eid){
            transfer = "employee"
        }
        cwx.redirectTo({
            url: `/pages/hotelplanning/aggregate/main?a=${a}&channel=${transfer}&allianceid=${allianceid}&sid=${sid}&b=${b}`,
        });
	},
}

export default baseIndex;