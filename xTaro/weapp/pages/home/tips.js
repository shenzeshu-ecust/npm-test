import { cwx } from '../../cwx/cwx.js';

class Tips{
	constructor(){
		this.dataFromUrl = '';
	}
	init(follow){
		cwx.configService.watch('tips', function(label){
		  follow && follow(label);
		})
	}
	arrange(tips){
		var re = {};
		tips && tips.length && tips.forEach(function(item){
			//var type = item.type.trim();
			//re[type] = re[type] || {};
			re[item.bu] = item.text;
		})
		return re;
	}
}
function trim(str){
	return str.replace(/^\s+/g,'').replace(/\s+$/g,'')
}
module.exports = new Tips();