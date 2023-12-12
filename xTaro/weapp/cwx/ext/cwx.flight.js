/**
 * @module cwx/flight
 * @file 机票
 */
 let __global = require('./global.js').default;
 let cwx = __global.cwx;
 
 let processNotFound = function (path, query) {
   cwx.request({
     url: "/html5/flight/api/getWechatUrl",
     data: {
       path,
       query
     },
     success: function (res) {
       if(res && res.statusCode === 200 && res.data) {
         let resData = res.data;
         if(resData.code === 1000 && resData.data && resData.data.notFound) {
           cwx.redirectTo({
             doNotIntercept: true,
             url: resData.data.notFound
           })
         }
       }
     }
   })
 }
 
 export default {
   processNotFound
 };
 
 