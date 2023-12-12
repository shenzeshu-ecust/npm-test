import util from '../../util'
import cDate from '../../cDate'


export default {
    data: {
        GetOnTrainThenByTicketSoluList: [],
        getOnQueryDate: '',
    },
    methods: {
        clickGetOnItem(e) {
            const { mIdx, solIdx, date } = e.currentTarget.dataset
            const getOnTrain = this.data.GetOnTrainThenByTicketSoluList[mIdx]
            const solTrain = getOnTrain.SolutionInfoList[solIdx]
            if (
                !util.validateJiulong(
                    solTrain,
                    solTrain.RecommendDepartStation,
                    solTrain.RecommendArriveStation,
                )
            ) {
                return
            }
            const selectDate = date
            let seat
            for (let i = 0; i < solTrain.SeatInfoList.length; i++) {
                const element = solTrain.SeatInfoList[i]
                if (element.SeatCount > 0) {
                    seat = element.SeatType
                    break
                }
            }
            if (!seat) {
                seat = solTrain.SeatInfoList[0].SeatType
            }
            let query = util.outparamsToString(
                util.getOutParams({
                    dStation: solTrain.RecommendDepartStation,
                    aStation: solTrain.RecommendArriveStation,
                    dDate: cDate.parse(selectDate).format('Y-m-d'),
                    trainname: getOnTrain.TrainNum,
                    seat,
                }),
            )

            let zhongtuBookHint = ''
            // const { OriginArriveStation, OriginDepartStation } = getOnTrain
            // const {
            //     RecommendDepartType,
            //     RecommendArriveType,
            //     RecommendArriveStation,
            //     RecommendDepartStation,
            //     RecommendContent,
            // } = solTrain
            // let money = '0'

            // if (RecommendContent) {
            //     let temp = RecommendContent.match(/[0-9]+元/)
            //     if (!!temp && temp.length > 0) money = temp[0]
            // }

            // if (
            //     (RecommendDepartType < 0 && RecommendArriveType > 0) ||
            //     (RecommendDepartType > 0 && RecommendArriveType < 0)
            // ) {
            //     //  solutionName = '综合方案';
            //     zhongtuBookHint =
            //         '建议您购买' +
            //         RecommendDepartStation +
            //         '-' +
            //         RecommendArriveStation +
            //         '的车票，您可持该票在' +
            //         OriginDepartStation +
            //         '站上车，上车后联系乘务员补票至' +
            //         OriginArriveStation +
            //         '站'
            // } else if (RecommendDepartType < 0 && RecommendArriveType < 0) {
            //     //  solutionName = '少买'+ (Math.abs(RecommendDepartType)+Math.abs(RecommendArriveType)) + "站";
            //     zhongtuBookHint =
            //         '建议您购买' +
            //         RecommendDepartStation +
            //         '-' +
            //         RecommendArriveStation +
            //         '的车票，上车后联系乘务员补票至' +
            //         OriginArriveStation +
            //         '站，补票区间可能无座哦'
            // } else if (RecommendDepartType > 0 && RecommendArriveType > 0) {
            //     //  solutionName = '多买'+ (Math.abs(RecommendDepartType)+Math.abs(RecommendArriveType)) + "站";
            //     zhongtuBookHint =
            //         '建议您购买' +
            //         RecommendDepartStation +
            //         '-' +
            //         RecommendArriveStation +
            //         '的车票，您可持该票在' +
            //         OriginDepartStation +
            //         '站上车，在' +
            //         OriginArriveStation +
            //         '站提前下车，全程多花约' +
            //         money
            // } else if (RecommendDepartType == 0 && RecommendArriveType != 0) {
            //     if (RecommendArriveType > 0) {
            //         //    solutionName = '多买' + Math.abs(RecommendArriveType) + "站";
            //         zhongtuBookHint =
            //             '建议您购买' +
            //             RecommendDepartStation +
            //             '-' +
            //             RecommendArriveStation +
            //             '的车票，在' +
            //             OriginArriveStation +
            //             '站提前下车，全程多花约' +
            //             money
            //     }
            //     if (RecommendArriveType < 0) {
            //         //   solutionName = '少买' + Math.abs(RecommendArriveType) + "站";
            //         zhongtuBookHint =
            //             '建议您购买' +
            //             RecommendDepartStation +
            //             '-' +
            //             RecommendArriveStation +
            //             '的车票，上车后联系乘务员补票至' +
            //             OriginArriveStation +
            //             '站，补票区间可能无座哦'
            //     }
            // } else if (RecommendDepartType != 0 && RecommendArriveType == 0) {
            //     if (RecommendDepartType > 0) {
            //         //    solutionName = '多买' + Math.abs(RecommendDepartType) + "站";
            //         zhongtuBookHint =
            //             '建议您购买' +
            //             RecommendDepartStation +
            //             '-' +
            //             RecommendArriveStation +
            //             '的车票，您可持该票在' +
            //             OriginDepartStation +
            //             '站上车，全程多花约' +
            //             money
            //     }
            //     if (RecommendDepartType < 0) {
            //         //    solutionName = '少买' + Math.abs(RecommendDepartType) + "站";
            //         zhongtuBookHint =
            //             '建议您购买' +
            //             RecommendDepartStation +
            //             '-' +
            //             RecommendArriveStation +
            //             '的车票，上车后联系乘务员补票至' +
            //             OriginDepartStation +
            //             '站，补票区间可能无座哦'
            //     }
            // }
            let routeObj = {
                url: `/pages/trainBooking/booking/ordinary/index?${query}`,
                data: {
                    isBupiao: true,
                    zhongtuBookHint,
                },
            }

            this.navigateTo(routeObj)
        },
    },
}
