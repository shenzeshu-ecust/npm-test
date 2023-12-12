/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2021-11-16 16:14:41
 * @LastEditors: lh_sun
 * @LastEditTime: 2021-11-16 22:09:28
 */
function BaseStore( settings ){
    var randNum = Math.floor(Math.random() * 1000);
    this.settings = settings || {key : 'PAYMENT_DEFAULT_STORE_' + randNum};
}

BaseStore.prototype = {
    get : function(){
        var value = null,
            that = this;
        try {
            value = wx.getStorageSync(that.settings.key)
        } catch (e) {

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
            wx.setStorageSync(that.settings.key, object);
        } catch (e) { 

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
            wx.removeStorageSync(that.settings.key)
        } catch (e) {

        }
    }
};


module.exports = {
    BaseStore : BaseStore
};