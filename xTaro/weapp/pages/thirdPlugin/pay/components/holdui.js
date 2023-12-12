import { cwx, _ } from '../../../../cwx/cwx.js';
let holdUi = {
	    //错误提示框，点击按钮事件处理
    modalConfirm: function(str, callback, showcancel=false, oktxt='确定'){
        var that = this;
		that.hideLoading();
        cwx.showModal({
            title: '提示',
            content: str || '',
			confirmText: oktxt,
			showCancel: showcancel,
            success: function(res) {
                if (res.confirm) {
                    if(callback){
                        return callback.call(that)
                    }
                }
            }
        })
    },
	hideLoading: function(){
		try{
			cwx.hideToast();
			cwx.hideLoading();
		}catch(err){}
		
		try{
			var res = cwx.getSystemInfoSync(),
				sys = res.system || '';
				sys = sys.toLowerCase();
			if(sys.indexOf('ios') > -1){
				cwx.hideToast();
				cwx.hideLoading();
				cwx.hideToast();
				cwx.hideLoading();
				cwx.hideToast();
				cwx.hideLoading();
				cwx.hideToast();
				cwx.hideLoading();
			}
		}catch(e){}
	},
	showLoading: function(title){
		title = title || '';
		try{
			cwx.showLoading({
				title: title,
				mask: true
			});
	    }catch(err){
			cwx.showToast({
				title: title,
				icon: 'loading',
				duration: 10000,
				mask: true
			});	
	    }

	},
	//Toast 错误提示
    showToast: function(str, icon, duration, callback){
        let that = this;
		str  = str || '网络不给力，请稍候重试';
        icon = icon || 'success';
		duration = duration || 2000;
		that.hideLoading();
        cwx.showToast({
            title: str,
            icon: icon,
            duration: duration,
			mask: true,
			complete: function(){
				if(callback){
					return callback()
				}
			}
        });
    }
}
    
module.exports = holdUi;