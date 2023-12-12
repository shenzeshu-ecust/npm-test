import { cwx } from '../../../../cwx/cwx';
const P = {}
const baseUrl = '/restapi/soa2/'
const modelList = {
	selectusercoupon: {
        channel: '11868',
        path: 'selectUserCouponWithPageForH5'		
	},
	getproductline: {
        channel: '11868',
        path: 'getProductLine'
	},
	firstpayordercheck: {
        channel: '10813',
        path: 'FirstPayOrderCheck'
	},
    getcaptchainfo: {
        channel: '11868',
        path: 'GetCaptchaInfo'
    },
    validationcaptcha: {
        channel: '11868',
        path: 'ValidationCaptcha'
    },
    collectcouponforreceivecenter: {
        channel: '11868',
        path: 'collectCouponForReceiveCenter'
    }
}
function fetch({channel, path}, flag) {
    let url = baseUrl + channel + '/' + path + '?_fxpcqlniredt=' + (cwx && cwx.clientID || '')
    let cb = () => {}
    return function(data, suc, err, done=cb) {
        cwx.request({
            url,
            data,
            success(res) {
				if(res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
					suc(res.data)	
				} else {
					err(res.data.ResponseStatus.Errors[0].Message)
				}
            },
            fail(res) {
				if(res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Failure") {
					err(res.data.ResponseStatus.Errors[0].Message)
				} else {
					err(res.data)
				}
            },
            complete() {
                done()
            }
        })
    }
}
P.SelectUserCouponModel = fetch(modelList.selectusercoupon,true)
P.GetProductLineModel = fetch(modelList.getproductline,true)
P.FirstPayOrderCheckModel = fetch(modelList.firstpayordercheck,true)
P.GetCaptchaInfoModel = fetch(modelList.getcaptchainfo,true)
P.ValidationCaptchaModel = fetch(modelList.validationcaptcha,true)
P.CollectCouponForReceiveCenterModel = fetch(modelList.collectcouponforreceivecenter,true)
module.exports = P;