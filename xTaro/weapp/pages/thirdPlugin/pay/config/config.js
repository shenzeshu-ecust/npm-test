/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2022-04-13 14:29:03
 * @LastEditors: lh_sun
 * @LastEditTime: 2022-04-13 14:39:05
 */
import { cwx } from '../../../../cwx/cwx.js';
var config = {
    APP_VER: 846004,
    ENV: function() {
        return cwx.payment.getData().env;
    }
};

module.exports = config;