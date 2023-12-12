import __global from '../ext/global.js'
let CPage = __global.CPage;

var config = {
    hasInit: false,
    init: function(){
        if(!this.hasInit){
            CPage.use('Navigator');
            CPage.use('UBT');
            this.hasInit = true;
        }
        
    },
	ubtDebug: false
};

export default config;
