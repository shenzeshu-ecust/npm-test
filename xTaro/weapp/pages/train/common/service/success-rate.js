const MAX_PACKAGE_PRICE = 80 //最大套餐价格
let successRateParams = [
    [0.83, 0.3, 3.3, 2.19],
    [0.83, 0.3],
    [0.83, 0.3, 0.72],
    [0.83, 0.3, 0.2],
]
/**
 *
 * @returns number resultRate
 */
function _calculateSuccessRate({
    superMemberAlgorithm = false, // 这两个参数对小程序无用
    useSuperMemberRight = false,
    rootState,
}) {
    let resultRate = rootState.basicSuccessRate,
        defaultPackagePrice = rootState.packageInfo.defaultPackagePrice

    let currentPackagePrice = defaultPackagePrice
    let crossStationList = rootState.crossStationList

    if (!superMemberAlgorithm || useSuperMemberRight) {
        if (superMemberAlgorithm && useSuperMemberRight) {
            currentPackagePrice = MAX_PACKAGE_PRICE
        } else if (rootState.superMemberInfo.isShow && rootState.superMemberInfo.isOpen && rootState.superMemberInfo.useVipRight) {
            currentPackagePrice = MAX_PACKAGE_PRICE
        } else {
            currentPackagePrice = rootState.packageInfo.currentPackage.PackagePrice
        }
    } else {
        currentPackagePrice = rootState.packageInfo.currentPackage.PackagePrice
    }

    if (rootState.priorityTicketRightsPrice > 0) {
        currentPackagePrice += rootState.priorityTicketRightsPrice
    }

    // 如果免费使用助力包开关打开
    if (rootState.useFreePackage) {
        let freePackageCount = rootState.userPackageInfo.count
        let freePackagePrice = rootState.userPackageInfo.packageList[0].Price
        let passengerCount = rootState.allPas.length
        let maxCanUseFreePackage = 40
        if (freePackageCount > passengerCount * maxCanUseFreePackage) {
            currentPackagePrice += maxCanUseFreePackage * freePackagePrice
        } else {
            currentPackagePrice = currentPackagePrice + parseFloat(((freePackageCount * freePackagePrice) / passengerCount).toFixed(2))
        }
    }

    let y1, y2, y3, y4

    // 选中跨站抢列表时
    if (crossStationList.length > 0) {
        let params = successRateParams[2]
        let chosenStation = crossStationList.filter(cs => cs.isChosen)
        if (chosenStation.length > 0) {
            // P为所有成功率的集合
            let P = chosenStation.map(item => item.SuccessRate)
            P.push(resultRate)
            P = P.sort((a,b) => b - a)
            resultRate = P[0]
            let p = P.reduce((prev, next) => prev + next) - resultRate
            y3 = (Math.pow((1 - Math.pow(1 - resultRate, params[0])), params[1]) - resultRate) / ((1 / Math.pow(p, params[2]) + 1)) * 0.5
        }
    } else {
        y3 = 0
    }

    y1 = calculatePart1(currentPackagePrice, defaultPackagePrice, resultRate, successRateParams)

    // 小程序没有接受纸质票
    y2 = 0

    // 临近方案
    if (rootState.acceptNearTrainInfo.show && rootState.acceptNearTrainInfo.isOpen) {
        // t 为用户选择的小时段
        // α, β 为 0.83, 0.3 l为权重常数 为0.2
        let params = successRateParams[3]
        let {
            currentSelectTime,
            acceptNearTrainInfo,
        } = rootState
        let defaultTime = acceptNearTrainInfo.defaultTime
        let end = defaultTime.split('-')[1].split(':')[0]
        let start = defaultTime.split('-')[0].split(':')[0]
        let t = 0
        if (end < start) {
            t = 24 + (end - start)
        } else {
            t = end - start
        }
        if (currentSelectTime.selectedBegin) {
            let {
                selectedEnd,
                selectedBegin,
            } = currentSelectTime
            t = parseInt(selectedEnd.Name) - parseInt(selectedBegin.Name)
        }
        let x = 1 - (24 - t) / 24
        y4 = (Math.pow((1 - Math.pow(1 - resultRate, params[0])), params[1]) - resultRate) * Math.sqrt(2 * x - x * x) * params[2]
    } else {
        y4 = 0
    }

    resultRate = resultRate + y1 + y2 + y3 + y4
    if (resultRate >= 1) {
        resultRate = 0.99
    }

    return resultRate
}

export function calculateSuccessRate({
    basicSuccessRate = 0,
    defaultPackagePrice = 0,
    selectPackage = null,
    JLRecommodNearTrainInfo = null,
    robTimeLineBeginIndex = 0,
    robTimeLineEndIndex = 0,
    robTimeLine = '',
    isNearTrainSwitchSelected = false,
    CrossStationGrabTicketInfoList = [],
    showAcceptNoSeat = false,
    isAcceptNoSeat = false,
    priorityTicketRightsPrice = 0,
    superVipPrice = 0,
    useFreePackage = false,
    userPackageInfo = {},
    allPas = [],
}) {

    // 套餐
    let {
        PackagePrice = 0,
    } = selectPackage || {}

    let packageInfo = {
        defaultPackagePrice,
        currentPackage: {
            PackagePrice,
        },
    }

    // 超级会员权益
    if (superVipPrice) {
        packageInfo.currentPackage.PackagePrice = 80
    }

    // // 优先出票
    // if (priorityTicketRightsPrice) {
    //     packageInfo.currentPackage.PackagePrice += priorityTicketRightsPrice
    // }

    // 临近车次
    const acceptNearTrainInfo = {
        show: false,
        isOpen: false,
        defaultTime: '',
        rangeTime: '',
    }
    const currentSelectTime = {
        selectedBegin: {
            Name: 0,
        },
        selectedEnd: {
            Name: 0,
        },
    }
    if (JLRecommodNearTrainInfo) {
        Object.assign(acceptNearTrainInfo, {
            show: JLRecommodNearTrainInfo.IsShow,
            isOpen: isNearTrainSwitchSelected,
            defaultTime: JLRecommodNearTrainInfo.RecommendDefaultTimeLine,
            rangeTime: robTimeLine,
        })
        currentSelectTime.selectedBegin.Name = robTimeLineBeginIndex
        currentSelectTime.selectedEnd.Name = robTimeLineEndIndex
    }

    // 跨站抢
    let crossStationList = []
    if (CrossStationGrabTicketInfoList.length) {
        crossStationList = CrossStationGrabTicketInfoList
            .filter(item => item.isCrossStationGrabCheckoutSelected)
            .map(item => ({
                ...item,
                isChosen: true,
            }))
    }

    // 无座
    const noSeatInfo = {
        show: false,
        configSwitch: false,
        isOpen: false,
    }
    if (showAcceptNoSeat) {
        noSeatInfo.show = showAcceptNoSeat
        noSeatInfo.configSwitch = showAcceptNoSeat
        noSeatInfo.isOpen = isAcceptNoSeat
    }

    const rootState = {
        basicSuccessRate: parseFloat(basicSuccessRate),
        packageInfo,
        superMemberInfo: {
            isShow: false,
            isOpen: false,
            useVipRight: false,
        },
        acceptNearTrainInfo,
        currentSelectTime,
        allDayCounterInfo: {
            show: false,
            isOpen: false,
        },
        crossStationList,
        noSeatInfo,
        priorityTicketRightsPrice,
        useFreePackage,
        userPackageInfo,
        allPas,
    }

    return (_calculateSuccessRate({
        rootState,
    }) * 100).toFixed(1)
}

export function calculatePart1(currentPrice, defaultPrice, basicSuccessRate, successRateParams) {
    // 修改套餐对成功率的影响
    if (currentPrice > defaultPrice) {
        let params = successRateParams[0]
        let x = (currentPrice - defaultPrice) / 100
        let e = Math.E
        // 2019-03-12 免费助力包叠加对成功率影响
        let newValue = (1 / (Math.pow(params[2], params[3] * (-Math.pow(e, -e * x) + 1)) - 1)) + 1
        let result = (Math.pow((1 - Math.pow((1 - basicSuccessRate), params[0])), params[1]) - basicSuccessRate) / newValue

        return result
    } else if (currentPrice < defaultPrice){
        let params = successRateParams[0]
        let x = (defaultPrice - currentPrice) / 50

        return (Math.pow((1 - Math.pow(basicSuccessRate, params[0])), params[1]) - 1) / ((1 / (Math.pow(params[2], params[3] * x) - 1)) + 1)
    } else {
        return 0
    }
}
