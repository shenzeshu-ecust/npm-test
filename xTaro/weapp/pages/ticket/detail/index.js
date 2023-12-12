import {cwx, CPage} from "../../../cwx/cwx";
CPage({
    name: 'detail',
    data: {},
    onLoad:function(options){
        let url = '/pages/gs/sight/newDetail?sightId=' + options.id || config.Base.spotid;
        if(options.allianceid) {
            url += '&allianceid=' + options.allianceid;
        }
        if(options.sid) {
            url += '&sid=' + options.sid;
        }
        if(options.isscan) {
            url += '&isscan=' + options.isscan;
        }
        if(options.href) {
            url += '&href=' + options.href;
        }
        return cwx.redirectTo({ url: url })
    },
    onshow: function() {},
    onHide: function() {},
    onUnload: function() {},
    bindKeyInput: function(e) {},
    goToLink: function() {},
})
