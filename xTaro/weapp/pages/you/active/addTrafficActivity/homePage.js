import {
	cwx,
	CPage,
	__global
} from '../../../../cwx/cwx';
cwx.config.init();

CPage({
    onReady: function() {
        cwx.redirectTo({
            url: '/pages/you/activity/addTrafficActivity/homePage?innersid=260',
        })
    }
})
