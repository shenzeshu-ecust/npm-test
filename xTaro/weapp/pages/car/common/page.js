import { cwx, _, __global } from "../../../cwx/cwx.js";

const getRedirectH5Url = (tab, channelid) => {
  const defaultChannelid = 7273;

  let url = "https://m.ctrip.com/webapp/zhuanche/airport-transfers/index";
  switch (tab) {
    case "iday":
      url = `https://m.ctrip.com/webapp/zhuanche/day/index?s=car_back&channelid=${
        channelid || "235276"
      }&tabid=0`;
      break;
    case "chf":
    case "jnt":
      url = `https://m.ctrip.com/webapp/zhuanche/airport-transfers/index?s=car_back&channelid=${
        channelid || defaultChannelid
      }&ptgroup=17`;
      break;
    case "chf_s":
    case "jnt_train":
      url = `https://m.ctrip.com/webapp/zhuanche/airport-transfers/index?s=car_back&channelid=${
        channelid || defaultChannelid
      }&ptgroup=16&biztype=32`;
      break;
    default:
      url = `https://m.ctrip.com/webapp/zhuanche/airport-transfers/index?s=car_back&channelid=${
        channelid || defaultChannelid
      }&ptgroup=55`;
  }
  return url;
};

const redirectH5Index = (url) => {
  cwx.component.cwebview({
    data: {
      url: encodeURIComponent(url),
      needLogin: false,
      isNavigate: false,
    },
  });
};

const page = (pageId = "dcs_miniapp_page", tab) => ({
  pageId: pageId,
  onLoad: function (options) {
    const { channelid } = options;
    wx.showLoading({
      title: "加载中...",
    });
    const curTab = tab || options.tab;
    const url = getRedirectH5Url(curTab, channelid);
    const { allianceid, sid } = cwx.mkt.getUnion() || {};
    cwx.sendUbtByPage.ubtDevTrace("dcs_ediath_dev_log", {
      title: "miniprogram_middle_page_redirect",
      pageId: pageId,
      allianceId: allianceid,
      allianceSid: sid,
    });
    redirectH5Index(url);
  },
});

export default page;
