/* global wx, getCurrentPages */
import { _, cwx, CPage } from "../../../cwx/cwx";
import aggregateloginCommon from "../common/loginCommon";

cwx.onAppHide(() => {
	// 监听onapphide事件，埋点
	const cPage = cwx.getCurrentPage();
	if (cPage && cPage.pageId === "10650047003") {
		cPage.ubtTrace("189996", {
			click_type: "2",
			source: "login-landing",
		});
	}
});

CPage(
	Object.assign(
		{
			pageId: "10650047003",
			checkPerformance: true,// 白屏标志位
		},
		{ ...aggregateloginCommon }
	)
);
