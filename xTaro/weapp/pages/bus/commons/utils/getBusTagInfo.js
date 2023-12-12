/**
 * @Author: jhyi jhyi@trip.com
 * @Date: 2022-12-12 18:31:31
 * @LastEditTime: 2023-01-16 16:05:24
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /taro-bus/src/pages/bus/common/models/utils/getBusTagInfo.js
 * @
 */

// 流水班
export function isFlowType(shiftType) {
    return shiftType === 1;
}
// 加班车
export function isOvertimeType(shiftType) {
    return shiftType === 2;
}
// 过路车
export function isPassType(line, busLineTypeInfo) {
    return (
        (busLineTypeInfo && busLineTypeInfo.busType === "1") ||
        line.isWayStation
    );
}
// 中转车
export function isTransitType(busLineTypeInfo) {
    return busLineTypeInfo && busLineTypeInfo.busType === "2";
}

export function isOverNight(item) {
    return !!item.overNight;
}
// 机场专线
export function isAirportType(item) {
    let { extraData } = item;
    if (extraData) {
        const { businessType } = extraData;
        return businessType === 4;
    }
    return false;
}
// 旅游专线
export function isTripType(item) {
    let { extraData } = item;
    if (extraData) {
        const { businessType } = extraData;
        return businessType === 0 || businessType === 1 || businessType === 4;
    }

    return false;
}
// 城际快车
export function isCityType(item) {
    let { extraData } = item;
    if (extraData) {
        const { businessType } = extraData;
        return businessType === 1;
    }

    return false;
}

export function isShowPointBusTypeDialog(tempFields) {
    if (tempFields) {
        let { extraJsonData } = tempFields || {};
        if (extraJsonData) {
            extraJsonData = JSON.parse(extraJsonData);
            const { businessType } = extraJsonData;
            return (
                businessType === 1 || businessType === 0 || businessType === 4
            );
        }
    }
    return false;
}

export function formatPassStation(passStationList) {
    let length = passStationList.length;
    return passStationList.map((item, index) => {
        let stationTip = "";
        if (item.stationType === 1) {
            stationTip = "上车点";
        }
        if (item.stationType === 2) {
            stationTip = "下车点";
        }
        if (index === length - 1) {
            stationTip = "终点站";
        }
        if (index === 0) {
            stationTip = "始发站";
        }

        const isSpaceItem = index === 0 || index === length - 1;
        const isActivity = !!(
            item.flag ||
            (item.stationType && isSpaceItem) ||
            !!item.stationType
        );
        let station = { ...item };
        station.stationTip = stationTip;
        station.isActivity = isActivity;
        return station;
    });
}

export default function getBusTagInfo(line) {
    const {
        shiftType,
        shiftTypeDesc,
        passStationList,
        busLineTypeInfo,
        overNightDesc,
    } = line;
    const data = [];
    // let title = '班次信息';

    if (isAirportType(line) || isCityType(line) || isTripType(line)) {
        let extraData = line.extraData;

        let { businessTypeName, fromTimeType, isMergePackage } = extraData;

        data.push({
            title: businessTypeName,
            desc: "专线特色：提供直达机场或景区线路，其他跨城线路可含免费上门接送、多上下车点、升级豪华车型等服务。",
        });
    } else if (isFlowType(shiftType)) {
        // title = '流水班';
        data.push({
            title: "流水班",
            desc:
                shiftTypeDesc ||
                "多班次滚动发车，每班间隔一段时间发车/坐满发车",
        });
    } else if (isOvertimeType(shiftType)) {
        // title = '加班车';
        data.push({
            title: "加班车",
            desc: "该班次为节假日客流较大时，车站临时加开的班次。加班车退改签规则请以车站实际公示为准",
        });
    }

    if (isPassType(line, busLineTypeInfo)) {
        data.push({
            title: "过路车",
            desc: "以下信息仅供参考，以实际行车路线为准。途径上下车点可能不在车站内，部分班次在服务区下车",
            passStationList: formatPassStation(passStationList),
        });
    } else if (isTransitType(busLineTypeInfo)) {
        // title = '中转车';
        data.push({
            name: "中转车",
            desc: `${busLineTypeInfo.typeDesc}`,
        });
    }
    if (isOverNight(line)) {
        data.push({
            name: "过夜车",
            desc: overNightDesc,
        });
    }
    return data;
}
