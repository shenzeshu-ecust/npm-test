import { cwx, CPage, _ } from "../../../cwx/cwx.js";
import restApi from "../common/apis/restapi";
import commonfunc from '../common/commonfunc';
import trace from "../common/trace/smztrace";

CPage({
	pageId: "10650106078",
	data: {
		showCustomNav: commonfunc.showCustomNav(),
        hotelId: "",
        feedBackValue: "",
        roomId: "",
        lockSubmitBtn: false
	},
	onLoad(options) {
        this.setData({
            hotelId: ~~options.hotelId
        })
	},
    handleFeedbackInput(e){
        let value = e?.detail?.value || ""
        value = value.trim()
        const { feedBackValue, hotelId } = this.data
        if(!feedBackValue && value){
            trace.feedbackSubmitShow(this,{
                page: "10650106078",
                masterhotelid: hotelId
            })
        }
        this.setData({
            feedBackValue: value,
        })
    },
    handleRoomIdInput(e){
        this.setData({
            roomId: e?.detail?.value || "",
        })
    },
    async handleSubmit(){
        const self = this
        const { feedBackValue, roomId, hotelId } = self.data
        if(!feedBackValue){
            cwx.showToast({
                title: "请输入吐槽和建议",
                icon: "none",
                duration: 2000,
            });
            return
        }
        trace.feedbackSubmitClick(this, {
            page: "10650106078",
            masterhotelid: hotelId,
            context: feedBackValue
        })
        self.lockSubmit(true)
        const res = await restApi.createHotelSuggestion({
            masterHotelId: hotelId, 
            roomId,
            remark: feedBackValue
        })
        const isSubmitSuccess = res && res.retCode === 0
        const tipMessage = (res && res.hitValue) || (isSubmitSuccess ? "提交成功" : "提交失败")
        cwx.showToast({
            title: tipMessage,
            icon: "none",
            duration: 2000,
        });
        if(isSubmitSuccess){
            setTimeout(() => {
                self.lockSubmit(false)
                self.backTo()
            }, 2000);
        }else {
            self.lockSubmit(false)
        }
    },
    backTo() {
		cwx.navigateBack();
	},
    lockSubmit(isLock) {
        this.setData({
            lockSubmitBtn: isLock
        })
    }
});
