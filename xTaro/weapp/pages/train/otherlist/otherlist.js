import { cwx, _ } from '../../../cwx/cwx'
import TPage from '../common/TPage'
import { TrainListModel, GrabTicketRecommendTrainListModel, GetJLSuccessRateModel } from '../common/model'
import util from '../common/util'
import cDate from '../common/cDate'
import { shared } from '../common/trainConfig'


const page = {
    checkPerformance: true,
    pageId: shared.pageIds.otherlist.pageId,
    data: {
        primeRecommendTrainList: [],
        primeOtherTrainList: [],
        chooseTrainNumberList: [],
        filterTrainList: [],
        primeTrain: '', // 抢票主车次 列表页中选择的
        isFilterViewAnimation: '',
        filterTrainType: 1,
        filterTrainConditions: {
            Train_GC: false,
            Train_D: false,
            Train_ZTK: false,
            Train_YL: false,
        },
        filterTrainTime: 1,
        filterTimeConditions: {
            TIME_0_6: false,
            TIME_6_12: false,
            TIME_12_18: false,
            TIME_18_24: false,
        },
        stations: [], // 出发、到达车站
        hasFilter: false,
        isSortTimeAesc:true, // 出发时间是否升序
        isSortDiffAesc:false, // 耗时是否升序
        isSortTimeTxtBlue:true,
        isSortDiffTxtBlue:false,
        isShowRecomand:true,// 是否显示推荐模块
        fromTinyBook: false, // 是否从 taro 简版填写页来的
    },
    onLoad(options) {
        console.log('备选页面',options)

        this.TrainNumber = options.TrainNumber
        // this.isFromH5 = !!(options.fromh5)
        // this.h5Url = decodeURIComponent(options.h5Url)
        // console.log(this.isFromH5,'this.isFromH51');
        this.onConfirm = options.data && options.data.onConfirm
        const { train, JlAlternativeTripList = [], jLSuccessRate, SuccessRateParams} = options.data;
        // 不同入口，train包含字段名不一致
        train.DepartureDate = train.DepartureDate || train.DepartDate;
        this.setData({
            primeTrain: train,
            JlAlternativeTripList,
            jLSuccessRate,
            SuccessRateParams,
            fromTinyBook: options?.from == 'tinybook',
            chooseTrainNumberList: options?.from == 'tinybook' ? JSON.parse(options?.choesnList) : shared.chosenTrainList,
        })
        if(!jLSuccessRate) {
            this.getSuccessRate();
        }
        const promise = this.getGrabTicketRecommendTrainList(options)
        this.getGrabTicketTrainList(options, promise)
        this.initSeatsArr()
    },
    showFilter () {
        this.setData({
            isFilterViewAnimation: true,
        })
    },
    hideFilterView() {
        this.setData({
            isFilterViewAnimation: false,
        })
    },
    initSeatsArr(){
        let seatsChosen = new Set()
        for (let trainItem of this.data.chooseTrainNumberList){
            if (trainItem.SeatList) {
                trainItem.SeatList.forEach(item =>{
                    seatsChosen.add(item.SeatName)
                })
            }
        }
        if (this.data.primeTrain.SeatList){
            this.data.primeTrain.SeatList.forEach(item => {
                seatsChosen.add(item.SeatName)
            })
        } else {
            //from the edit order
            let seatsAccept = this.data.primeTrain.JLAlternativeSeat
            if (seatsAccept){
                seatsAccept.split(",").forEach(item =>{
                    seatsChosen.add(item.SeatName)
                })
            }
        }
        this.setData({
            seatsChosen,
        })
    },
    getGrabTicketTrainList({ DepartStation = '', ArriveStation = '', DepartureDate = ''}, promise) {
        util.showLoading()
        const params = {
            DepartStation,
            ArriveStation,
            DepartDate: DepartureDate,
        }

        TrainListModel(params, data => {
            let primeIndex;
            const dDate = this.data.primeTrain.DepartureDate;
            const now = new Date().getTime();
            let raw = data.ResponseBody.TrainInfoList
            raw = util.handleTrains(raw, params.DepartDate)
            const trainList = raw
            const JlAlternativeTripList = this.data.JlAlternativeTripList
            const getPrimeOtherTrainList = (primeRecommendTrainList = [], TrainNumber, trainList, JlAlternativeTripList) => {
                // 其他车次
                let primeOtherTrainList = trainList
                // 推荐车次添加标签
                trainList.map(
                    train => {
                        const rTrain = primeRecommendTrainList.find(item => item.TrainNumber == train.TrainNumber && item.DepartStation == train.DepartStation && item.ArriveStation == train.ArriveStation)
                        if(rTrain){
                            train.Tag = rTrain.Tag
                        }
                    },
                )
                // disable 已经选择并且发送到后端的车次
                if (JlAlternativeTripList && JlAlternativeTripList.length) {
                    primeOtherTrainList = primeOtherTrainList.map(
                        train => {
                            if(JlAlternativeTripList.some(item => item.TrainNumber == train.TrainNumber && item.DepartStation == train.DepartStation && item.ArriveStation == train.ArriveStation)){
                                train.disabled = true
                            }
                            return train
                        }
                    )
                }
                // 主车次不可点击处理
                primeOtherTrainList.forEach((item,index) => {
                    const {primeTrain = {}} = this.data;
                    if(item.TrainNumber == primeTrain.TrainNumber && item.DepartStation == primeTrain.DepartStation && item.ArriveStation == primeTrain.ArriveStation){
                        item.disabled = true;
                        primeIndex = index - 2 || 0
                    }
                })
                // disabled主车次
                primeOtherTrainList.forEach(item => {
                    item.current = item.disabled || this.hasTrain(this.data.chooseTrainNumberList, item)
                })
                let stations = this.getStations(trainList)

                // 将 primeRecommendTrainList 里的 SeatList 覆盖掉，以免座席类型出现问题
                // 将车次数组转换成对象，
                // const convertTrainSeatList = (trainList = []) => {
                //     const map = {}
                //     for (let {TrainNumber, SeatList} of trainList) {
                //         map[TrainNumber] = SeatList
                //     }

                //     return map
                // }
                // let trainSeatMap = convertTrainSeatList(trainList)
                // primeRecommendTrainList.forEach(recommendTrain => {
                //     if (trainSeatMap[recommendTrain.TrainNumber]) {
                //         recommendTrain.SeatList = trainSeatMap[recommendTrain.TrainNumber]
                //     }
                // })

                // 处理坐席信息
                primeOtherTrainList.forEach(val => {
                    if (val.SaleNote.indexOf('列车运行图调整') !== -1) {
                        val.isPreSale = true
                        val.preSaleTimeStr = '列车运行图调整，可预约抢票，开售自动抢'
                        return
                    }
                    let saleDay = cDate.parse(dDate).addDay(-val.PreSaleDay || 0)
                    let saleDateStr = saleDay.format('Y-m-d')
                    let saleDayStr = saleDateStr + ' ' + val.PreSaleTime || '00:00'
                    let saleDate = cDate.parse(saleDayStr).getTime()
                    if (saleDate - now > 0) {
                        val.isPreSale = true
                        val.preSaleTimeStr = saleDay.format('n月j日') + val.PreSaleTime + '开售,可预约抢票,开售自动抢'
                    }

                })

                this.setData({
                    primeOtherTrainList,
                    primeRecommendTrainList,
                    stations,
                    scrollToView:'train_item_'+primeIndex
                })
            }
            promise.then(()=>{
                getPrimeOtherTrainList(this.data.primeRecommendTrainList, this.TrainNumber, trainList, JlAlternativeTripList)
            }).catch(()=>{
                getPrimeOtherTrainList(this.data.primeRecommendTrainList, this.TrainNumber, trainList, JlAlternativeTripList)
            })
        }, () => {
            util.hideLoading()
        }, () => {
            util.hideLoading()
        })
    },
    confirm() {
        const trainList = this.data.chooseTrainNumberList.filter(item => !item.disabled )
        shared.chosenTrainList = trainList
        shared.newAddTrainList = trainList.filter(item => item.current)
        let needAutoShowSeat = false
        trainList.forEach(item =>{
            if (item.SeatList && item.SeatList.length) {
                item.SeatList.forEach(seatItem =>{
                    if (this.data.seatsChosen && !this.data.seatsChosen.has(seatItem.SeatName)){
                        needAutoShowSeat = true
                    }
                })
            }
        })
        const trainInfo = trainList.map(item => {
            return {
                tag:item.Tag,
                departdatetime:this.data.primeTrain.DepartureDate + ' ' + item.DepartTime + ":00"
            }
        })
        const mainDepartdatetime = this.data.primeTrain.DepartureDate + ' ' + this.data.primeTrain.DepartTime + ":00"
        util.ubtTrace('c_trn_c_10320672796', {bizKey:'multipleChoiceActionbarSuccessClick',trainInfo,mainDepartdatetime})
        // if(!this.isFromH5){
        //     this.onConfirm && this.onConfirm(needAutoShowSeat)
        // }else{
        //     // const url = `https://m.ctrip.com/webapp/train/modifyOrder?orderId=${this.store.data.orderInfo.OrderId}&fromminiapp=1`
        //     // cwx.navigateTo({
        //     //     url: `/pages/train/authorise/web/web?data={"url":"${encodeURIComponent(url)}","bgColor":"19A0F0"}`,
        //     // })
        //     let joiner = (this.h5Url.indexOf('?') > -1 || h5Url.indexOf('%3F') > -1 ) ? '&' : '?'
        //     const chooseTrainNumberArr= trainList.map(item=>item.TrainNumber).join(',')
        //     console.log(chooseTrainNumberArr,'this.isFromh5');
        //     shared.webviewData = {
        //         needReload: true,
        //         reloadUrl: h5Url + `${joiner}needAutoShowSeat=${needAutoShowSeat}&chooseTrainNumberArr=${chooseTrainNumberArr}`,
        //     }
        // }

        // 简版来的需要清除 shared
        if (this.data.fromTinyBook) {
            shared.chosenTrainList = []
            shared.newAddTrainList= []
        }
        this.onConfirm && this.onConfirm({needAutoShowSeat,trainList })
        this.navigateBack()
    },
    getGrabTicketRecommendTrainList({ DepartStation = '', ArriveStation = '', DepartureDates = '', TrainNumber = '', SeatName = '', DepartTimes = '' }) {
        const defer = util.getDeferred()
        const params = {
            DepartStation,
            ArriveStation,
            DepartTimes,
            DepartDates: DepartureDates,
            TrainNumbers: TrainNumber,
            SeatNames: SeatName,
            Channel: 'ctriph5',
            FromType: 0,
        }

        GrabTicketRecommendTrainListModel(params, data => {
            if (data.RetCode == 1 && _.isArray(data.RecommendTrainList)) {
                data.RecommendTrainList = data.RecommendTrainList.splice(0,5)
                data.RecommendTrainList.forEach(item => {
                    item.current = this.hasTrain(this.data.chooseTrainNumberList, item)
                })
                let raw = util.handleTrains(data.RecommendTrainList, params.DepartDates) || []

                this.setData({
                    primeRecommendTrainList: raw,
                })
                defer.resolve(data.RecommendTrainList)
            } else {
                defer.resolve([])
            }
        }, err => {
            console.log(err)
            defer.reject(err)
        }, ()=>{})

        return defer.promise
    },
    hasTrain(list = [], train) {
        return list.some(item => item.TrainNumber == train.TrainNumber && item.ArriveStation == train.ArriveStation && item.DepartStation == train.DepartStation)
    },
    toggleRecommendTrain(e) {
        let idx = e.currentTarget.dataset.rindex
        const primeRecommendTrainList = this.data.primeRecommendTrainList
        const primeOtherTrainList = this.data.primeOtherTrainList
        const train = primeRecommendTrainList[idx]
        if (train.disabled) return;
        if (!train.current && this.data.chooseTrainNumberList.length >= shared.maxOtherAmount) {
            return util.showToast(`最多选择${shared.maxOtherAmount}个`,'none')
        }
        //埋点
        if( train.Tag ){
            util.ubtTrace('c_trn_c_10320672796',{bizKey:'multipleChoiceActionbarClick',tag:train.Tag, location: 1})
        }
        train.current = !train.current
        const otherTrain = primeOtherTrainList.find( otrain => otrain.ArriveStation==  train.ArriveStation && otrain.TrainNumber == train.TrainNumber && otrain.DepartStation == train.DepartStation) || {}
        otherTrain.current = !otherTrain.current
        this.setData({
            chooseTrainNumberList: this.toggleList(this.data.chooseTrainNumberList, train),
            primeRecommendTrainList,
            primeOtherTrainList
        })
        this.getSuccessRate()
    },
    toggleOtherTrain(e) {
        let idx = e.currentTarget.dataset.index
        const primeRecommendTrainList = this.data.primeRecommendTrainList
        const primeOtherTrainList = this.data.primeOtherTrainList
        const train = primeOtherTrainList[idx]
        if (train.disabled) return; // 本来选中的主车次，不可以再选
        if (!train.current && this.data.chooseTrainNumberList.length >= shared.maxOtherAmount) {
            return util.showToast(`最多选择${shared.maxOtherAmount}个`,'none')
        }
        //埋点
        if( train.Tag ){
            util.ubtTrace('c_trn_c_10320672796',{bizKey:'multipleChoiceActionbarClick',tag:train.Tag, location: 0})
        }
        train.current = !train.current
        const rTrain = primeRecommendTrainList.find( rtrain => rtrain.ArriveStation==  train.ArriveStation && rtrain.TrainNumber == train.TrainNumber && rtrain.DepartStation == train.DepartStation) || {}
        rTrain.current = !rTrain.current
        this.setData({
            chooseTrainNumberList: this.toggleList(this.data.chooseTrainNumberList, train),
            primeOtherTrainList,
            primeRecommendTrainList
        })
        this.getSuccessRate()
    },
    toggleFilterTrain (e) {
        let idx = e.currentTarget.dataset.index
        const filterTrainList = this.data.filterTrainList
        const train = filterTrainList[idx]
        if (train.disabled) return
        if (!train.current && this.data.chooseTrainNumberList.length >= shared.maxOtherAmount) {
            return util.showToast(`最多选择${shared.maxOtherAmount}个`,'none')
        }
        //埋点
        if( train.Tag ){
            util.ubtTrace('c_trn_c_10320672796',{bizKey:'multipleChoiceActionbarClick',tag:train.Tag, location: 0})
        }
        train.current = !train.current
        this.setData({
            chooseTrainNumberList: this.toggleList(this.data.chooseTrainNumberList, train),
            filterTrainList,
        })
        this.getSuccessRate()
    },
    //
    toggleList(list = [], train) {
        const { TrainNumber,ArriveStation,DepartStation } = train
        const index = list.map(item => `${item.ArriveStation}-${item.TrainNumber}-${item.DepartStation}`).indexOf(`${ArriveStation}-${TrainNumber}-${DepartStation}`)
        if (index !== -1) {
            list.splice(index, 1)
        } else {
            list.push(train)
        }

        return list
    },
    selectTime(e) {
        let time = e.currentTarget.dataset.time
        let type = time ^ this.data.filterTrainTime
        this.setData({
            filterTrainTime: type,
            filterTimeConditions: {
                TIME_0_6: type & 2,
                TIME_6_12: type & 4,
                TIME_12_18: type & 8,
                TIME_18_24: type & 16,
            },
        })
    },
    selectType(e) {
        let type = e.currentTarget.dataset.type
        let filterType = type ^ this.data.filterTrainType
        this.setData({
            filterTrainType: filterType,
            filterTrainConditions: {
                Train_GC: filterType & 2,
                Train_D: filterType & 4,
                Train_ZTK: filterType & 8,
                Train_YL: filterType & 16,
            },
        })
    },
    filterByType(data) {
        if (!data) {
            return []
        }

        return data.filter(val => {
            return (this.data.filterTrainType == 1 || val.trainType & this.data.filterTrainType)
        })
    },
    filterByTime(data) {
        if (!data) {
            return []
        }

        return data.filter(val => {
            return (this.data.filterTrainTime == 1 || val.timePeriod & this.data.filterTrainTime)
        })
    },
    filterByStation (data, stations = []) {
        if (!data) {
            return []
        }
        const selectedStations = stations.filter(val => val.isSelected)
        if (!selectedStations.length) {
            return data
        }
        const selectedStationsDepart = selectedStations.filter(item => item.isDepart && item.isSelected)
        const selectedStationsArrive = selectedStations.filter(item => !item.isDepart && item.isSelected)

        if (selectedStationsDepart.length) {
            data = data.filter(val => selectedStationsDepart.find(s => s.name === val.DepartStation))
        }
        if (selectedStationsArrive.length) {
            data = data.filter(val => selectedStationsArrive.find(s => s.name === val.ArriveStation))
        }

        return data
    },
    selectStation (e) {
        const stations = this.data.stations
        const s = stations[e.currentTarget.dataset.index]
        s.isSelected = !s.isSelected
        this.setData({
            stations,
        })
    },
    resetFilter() {
        const stations = this.data.stations
        stations.forEach(s => s.isSelected = false)
        this.setData({
            filterTrainType: 1,
            filterTrainConditions: {
                Train_GC: false,
                Train_D: false,
                Train_ZTK: false,
                Train_YL: false,
            },
            filterTrainTime: 1,
            filterTimeConditions: {
                TIME_0_6: false,
                TIME_6_12: false,
                TIME_12_18: false,
                TIME_18_24: false,
            },
            stations,
            hasFilter: false,
        })
    },
    confirmFilter() {
        // 筛选车次
        this.renderFiltered()
        this.hideFilterView()
        let hasSelectedIndex = this.data.stations.findIndex(item => item.isSelected)
        if (this.data.filterTrainType == 1 && this.data.filterTrainTime == 1 && hasSelectedIndex == -1) {
            this.setData({hasFilter: false})
        } else {
            this.setData({hasFilter: true})
        }
    },
    renderFiltered() {
        let raw = [...this.data.primeOtherTrainList]
        if(!this.data.primeOtherTrainList) return;
        if (!raw) {
            return
        }
        let data = this.filterByType(raw)
        data = this.filterByTime(data)
        data = this.filterByStation(data, this.data.stations)

        let filterNoTrain = (raw.length !== 0 && data.length == 0)
        this.setData({
            filterNoTrain,
            filterTrainList: data,
        })
        // this.render(data)
    },
    // 只按耗时排序
    onTapSortByDiff() {
        if(!this.data.primeOtherTrainList) return;
        const isSortDiffAesc = !this.data.isSortDiffAesc;
        let primeRaw = [...this.data.primeOtherTrainList];
        let filterRaw = [...this.data.filterTrainList];
        const compare = (p,aesc) => { //这是比较函数
            return function(m,n){
                var a = m[p];
                var b = n[p];
                return aesc? (a-b) : (b-a); //降序
            }
        }
        primeRaw.sort(compare('RunTime',isSortDiffAesc));
        filterRaw.sort(compare('RunTime',isSortDiffAesc));
        // 按时间排序
        this.setData({
            primeOtherTrainList:primeRaw,
            filterTrainList:filterRaw,
            isSortTimeTxtBlue:false,
            isSortDiffTxtBlue:true,
            isSortDiffAesc,
            isShowRecomand:false
        })
    },
    // 只按时间排序
    onTapSortByTime() {
        if(!this.data.primeOtherTrainList) return;
        const isSortTimeAesc = !this.data.isSortTimeAesc;
        let primeRaw = [...this.data.primeOtherTrainList];
        let filterRaw = [...this.data.filterTrainList];
        const compare = (p,aesc) => { //这是比较函数
            return function(m,n){
                var a = m[p];
                var b = n[p];
                return aesc? (a-b) : (b-a); //b-a降序
            }
        }
        primeRaw.sort(compare('DepartTimeStamp',isSortTimeAesc));
        filterRaw.sort(compare('DepartTimeStamp',isSortTimeAesc));
        // 按时间排序
        this.setData({
            primeOtherTrainList:primeRaw,
            filterTrainList:filterRaw,
            isSortTimeTxtBlue:true,
            isSortDiffTxtBlue:false,
            isSortTimeAesc,
            isShowRecomand:false
        })
    },
    // 优化渲染性能
    render(data) {
        data = _.sortBy(data, this.data.sortType)
        if (!this.data.sortAscending) {
            data.reverse()
        }
        try {
            if (data.length > 20) {
                let part1 = data.slice(0, 20)
                this.setData({
                    trainList: part1,
                })

                setTimeout(() => {
                    this.setData({
                        trainList: data,
                    })
                }, 50)
            } else {
                this.setData({
                    trainList: data,
                })
            }
        } catch (e) {

        }
    },
    getStations(data) {
        const departStations = [],
            arriveStations = []
        data.forEach(item => {
            const {DepartStation, ArriveStation} = item
            if (departStations.findIndex(i => i.name === DepartStation) < 0) {
                departStations.push({
                    name: DepartStation,
                    isSelected: false,
                    isDepart: true,
                })
            }
            if (arriveStations.findIndex(i => i.name === ArriveStation) < 0) {
                arriveStations.push({
                    name: ArriveStation,
                    isSelected: false,
                    isDepart: false,
                })
            }
        })

        return departStations.concat(arriveStations)
    },
    /**
     * 获取抢票成功率基础值,并计算当前抢票成功率
     */
     getSuccessRate() {
        const { primeTrain } = this.data;
        const sucParam = {
            AllArriveStation: primeTrain.ArriveStation,
            AllDepartStation: primeTrain.DepartStation,
            ArriveStation: primeTrain.ArriveStation,
            Channel: "wx",
            DepartStation: primeTrain.DepartStation,
            GrabType: 0,
            JLAlternativeDate: primeTrain.DepartureDate,
            JLExpiredTimeOffset: 25,
            SeatNames: primeTrain.SeatName,
            StationsMap: [{
                ArriveStation: primeTrain.ArriveStation,
                DepartStation: primeTrain.DepartStation
            }],
            TrainNumbers: primeTrain.TrainNumber,
            TrainTypes: primeTrain.trainType || 0,
        }
        const deferred = util.getDeferred()
        const SuccessRateParams = this.data.SuccessRateParams || sucParam;
        const allTrains = [...this.data.chooseTrainNumberList,this.data.primeTrain]
        const trainNumbers = allTrains.map(train => train.TrainNumber)
        const allDepartStations = util.unique(allTrains.map(train => train.DepartStation))
        const allArriveStations = util.unique(allTrains.map(train => train.ArriveStation))
        const trainTypes = util.getTrainTypes(trainNumbers).join(',')
        const StationsMap = allTrains.map(item => _.pick(item, ['DepartStation', 'ArriveStation']))
        SuccessRateParams.TrainNumbers = trainNumbers.join(','),
        SuccessRateParams.AllDepartStation = allDepartStations.join(','),
        SuccessRateParams.AllArriveStation = allArriveStations.join(','),
        SuccessRateParams.TrainTypes = trainTypes,
        SuccessRateParams.StationsMap = StationsMap,
        GetJLSuccessRateModel(SuccessRateParams, data => {
            const {
                SuccessRate,
            } = data
            console.log('basicSuccessRate', SuccessRate)
            this.setData({
                jLSuccessRate: SuccessRate,
            })
            deferred.resolve(SuccessRate)
        }, () => {
            deferred.resolve()
        }, () => {
            deferred.resolve()
        })

        return deferred.promise
    },

}

TPage(page)
