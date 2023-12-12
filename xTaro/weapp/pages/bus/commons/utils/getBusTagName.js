/**
 * @Author: jhyi jhyi@trip.com
 * @Date: 2022-09-23 21:55:24
 * @LastEditTime: 2023-01-11 17:04:20
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /taro-bus/src/pages/bus/common/models/utils/getBusTagName.js
 * @
 */
import {
    isFlowType,
    isOvertimeType,
    isPassType,
    isTransitType,
    isAirportType,
    isTripType,
    isCityType,
    isOverNight,
} from "./getBusTagInfo";
export function getBusTagName(item) {
    const { shiftType, busLineTypeInfo } = item;
    const typeNames = [];
    if (isTripType(item)) {
        typeNames.push("旅游专线");
    } else if (isAirportType(item)) {
        typeNames.push("机场巴士");
    } else if (isCityType(item)) {
        typeNames.push("城际专线");
    } else {
        if (isFlowType(shiftType)) {
            // title = '流水班';
            typeNames.push("流水班");
        } else if (isOvertimeType(shiftType)) {
            // title = '加班车';
            typeNames.push("加班车");
        }
    }
    if (isPassType(item, busLineTypeInfo)) {
        typeNames.push("过路车");
    } else if (isTransitType(busLineTypeInfo)) {
        // title = '中转车';
        typeNames.push("中转车");
    }
    if (isOverNight(item)) typeNames.push("过夜车");

    return typeNames.join(`·`);
}
