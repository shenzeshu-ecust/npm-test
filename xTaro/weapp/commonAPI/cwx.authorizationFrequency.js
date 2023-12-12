import {cwx} from "../cwx/cwx.js";

/**
 * 开始某个key的 弹窗开始
 * @param key
 */
function startAuthorizationLimit(key) {
    cwx.setStorageSync(key, new Date().getTime());
}

/**
 * 检查某个api的弹窗是否在允许范围内
 * @param key
 * @param time 毫秒
 */
export function checkAuthorizationLimit(key, time) {
    // 存在 localStorage 中没有这个 key 的情况，此时 limitBegin 为 空字符串 ""。为了增强代码的可读性，此时明确赋值为 0
    const limitBegin = cwx.getStorageSync(key) || 0;
    const diffTime = new Date().getTime() - limitBegin;
    if (!limitBegin || diffTime >= time) { // localStorage无此key 或 超过限制时长
        console.log('>>>>>> 用户首次进入本小程序 或 已超过弹窗的限制时长，不受限制，可以弹窗', time);
        startAuthorizationLimit(key); // 重新计算并存储该key的时间戳
        return true; // 已超过限制时长，不受限制
    }
    console.log('>>>>>> 未超过限制时长，不允许弹出授权弹框，diffTime:', diffTime);
    return false
}