import { cwx, CPage, _ } from "../../../cwx/cwx.js";
import restApi from "../common/apis/restapi";
import commonfunc from '../common/commonfunc';
import commonrest from "../common/commonrest";
import trace from "../common/trace/smztrace";
import C from '../common/Const.js';
import storageUtil from "../common/utils/storage";
const urlUtil = require("../common/utils/url");

const ACTIVE_SQUARE_BUBBULE_SHOW = 'ACTIVE_SQUARE_BUBBULE_SHOW';

CPage({
	pageId: "10650108050",
	data: {
		showCustomNav: commonfunc.showCustomNav(),
        isShowBubble: true,
        gameList:[],
        rightsList: [],
        wifiPageUrl: '',
        hotelId: ''
	},
	onLoad(options) {
        this.getJumpUrlConfig();
        this.getShowBubbleHistory();
        const {wifiPageUrl = "", hotelId = ""} = this.options
        this.setData({
            wifiPageUrl,
            hotelId,
        })
        trace.activitySquarePageShow(this, {
            page: "10650108050",
            masterhotelid: hotelId,
            scenevalue: cwx.scene
        })
	},
    getJumpUrlConfig() {
        const { 
            LANDLORDS_JUMP_URL, 
            JJMAJIANG_JUMP_URL, 
            SIGNIN_JUMP_URL, 
            RED_ENVELOP_JUMP_URL, 
            DISCOUNT_GOODS_JUMP_URL,
            LANDLORDS_BG_IMAGE,
            JJMAJIANG_BG_IMAGE,
            SIGNIN_ICON_IMAGE,
            RED_ENVELOP_ICON_IMAGE,
            DISCOUNT_GOODS_ICON_IMAGE,
            CONTINUE_LIVE_ICON_IAMGE,
        } = C
		const key = [
			LANDLORDS_JUMP_URL,
			JJMAJIANG_JUMP_URL,
			SIGNIN_JUMP_URL,
            RED_ENVELOP_JUMP_URL, 
            DISCOUNT_GOODS_JUMP_URL,
            LANDLORDS_BG_IMAGE,
            JJMAJIANG_BG_IMAGE,
            SIGNIN_ICON_IMAGE,
            RED_ENVELOP_ICON_IMAGE,
            DISCOUNT_GOODS_ICON_IMAGE,
            CONTINUE_LIVE_ICON_IAMGE,
		];
		commonrest.getWechatSoaSwitch(
			key,
			(data) => {
				if (data) {
					const configs = data.result;
                    const gameList =[
                        {
                            type: "landlords",
                            image: configs[LANDLORDS_BG_IMAGE] || "",
                            jumpUrl: configs[LANDLORDS_JUMP_URL] || ""
                        },
                        {
                            type: "majiang",
                            image: configs[JJMAJIANG_BG_IMAGE] || "",
                            jumpUrl: configs[JJMAJIANG_JUMP_URL] || ""
                        }
                    ]
                    const rightsList = [
                        {
                            type: "signIn",
                            icon: configs[SIGNIN_ICON_IMAGE] || "",
                            title: "签到赢好礼",
                            btnText: "立即参与",
                            jumpUrl: configs[SIGNIN_JUMP_URL] || ""
                        },
                        {
                            type: "continueLive",
                            icon: configs[CONTINUE_LIVE_ICON_IAMGE] || "",
                            title: "续住专享礼包",
                            btnText: "立即参与",
                            jumpUrl: ""
                        },
                        {
                            type: "discount",
                            icon: configs[DISCOUNT_GOODS_ICON_IMAGE] || "",
                            title: "特价好物",
                            btnText: "立即参与",
                            jumpUrl: configs[DISCOUNT_GOODS_JUMP_URL] || ""
                        },
                        {
                            type: "redEnvelope",
                            icon: configs[RED_ENVELOP_ICON_IMAGE] || "",
                            title: "现金红包免费领",
                            btnText: "立即参与",
                            jumpUrl: configs[RED_ENVELOP_JUMP_URL] || ""
                        }
                    ]
                    this.setData({
                        gameList,
                        rightsList
                    })
					
				}
			},
			"json"
		);
	},
    jump(e){
        const {jumpurl = "",type = ""} = e?.currentTarget?.dataset || {};
        const { wifiPageUrl = "", hotelId = "" } = this.data
        trace.activitySquareModuleClick(this, {
            page: "10650108050",
            masterhotelid: hotelId,
            type
        })
        if(type === "continueLive"){
            let landingPageUrl = wifiPageUrl ? decodeURIComponent(wifiPageUrl) : `/pages/hotelplanning/aggregate/main?a=${hotelId}&channel=wifi-landing`
            landingPageUrl = urlUtil.setParams(landingPageUrl,{isOpenCouponModal: 1})
            cwx.navigateTo({
                url: landingPageUrl
            })
        }else if(jumpurl){
            cwx.navigateTo({
                url:
                    "/pages/hotel/components/webview/webview?data=" +
                    JSON.stringify({
                        url: encodeURIComponent(jumpurl),
                    }),
            });
        }
    },
    closeBubble() {
        this.setData({
            isShowBubble: false
        })
    },
    getShowBubbleHistory() {
        const hasShowBubbleHistory = storageUtil.getStorage(ACTIVE_SQUARE_BUBBULE_SHOW)
        if(!hasShowBubbleHistory){
            storageUtil.setStorage(ACTIVE_SQUARE_BUBBULE_SHOW, true)
        }else {
            this.setData({
                isShowBubble: false
            })
        }
    }
});
