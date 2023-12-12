import { cwx, _ } from '../../../../cwx/cwx.js';

function BaseStore( settings ){
    var randNum = Math.floor(Math.random() * 1000);
    this.settings = settings || {key : 'PAYMENT_DEFAULT_STORE_' + randNum};
}

BaseStore.prototype = {
    get : function(){
        var value = null,
            that = this;
        try {
            value = cwx.getStorageSync(that.settings.key)
        } catch (e) {
			try{
				cwx.payment.sendUbtTrace({a:'cwx.getstoragesyncErr', c:7001, d:e});
			} catch(e){};
        }
        return value;
    },
    getAttr : function( key ){
        var result = this.get();
        return result && result[key] || '';
    },
    set : function( object ){
        var that = this;
        object = object || {};
        try {
            cwx.setStorageSync(that.settings.key, object);
        } catch (e) { 
			try{
				cwx.payment.sendUbtTrace({a:'cwx.setStorageSyncErr', c:7002, d:e});
			} catch(e){};
        }
    },
    setAttr : function(key, value){
        var that = this;
        var obj = that.get() || {};
        obj[key] = value;
        that.set(obj);
    },
    remove : function(){
        var that = this;
        try {
            cwx.removeStorageSync(that.settings.key)
        } catch (e) {
			try{
				cwx.payment.sendUbtTrace({a:'cwx.removeStorageSyncErr', c:7003, d:e});
			} catch(e){};
        }
    }
};


module.exports = {
    BaseStore : BaseStore
};