import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
import { TrainModifyPassengerModel, GetRealNamePacketModel, PushUserSharePassengerInfoModel } from '../common/model'
import util from '../common/util'
import passengerInfoBox from '../common/components/passengerInfoBox/passengerInfoBox'
import cDate from '../common/cDate'
import {setConfigSwitchAsyncPromise, trainGetPassengerListPromise, getConfigInfoJSON } from '../common/common'
import { shared } from '../common/trainConfig'


const cardTypesById = util.cardTypes

const page = {
    checkPerformance: true,
    pageId: shared.pageIds.passenger.pageId,
    data: {
        showType: '',
        allPas: [],
        adults: [],
        from: '',
        curAdultIndex: 0,
        importPasFlag: true,
        childAlertInfo: [],
        trainModifyPassenger: [],
        singleTrain: false, //区分单程，多程；埋点用
    },
    onLoad(options) {
        let pas = shared.pas && JSON.parse(JSON.stringify(shared.pas))
        // TODO:目前先根据跳转中转清空shared.train判断是否中转
        if(shared.train) {
            this.setData({singleTrain: true})
        }
        util.ubtTrace('TCWPassengerEdit_exposure', { 
            PageId: "10320672799", 
            ExpoType: this.data.singleTrain ? 1 : 2
        }) 
        try {
            // let { allPas, from, hasSelf, transitObj, frombooking, addPassengerFromBooking, addPassengerFromAddpasg } = options.data
            let { allPas, from, hasSelf, transitObj, frombooking } = options.data
            if (allPas) {
                let adults = allPas.filter(item => item.PassengerType == 1)
                adults.forEach(pas => pas.tailNumber = pas.idcard.no.slice(-4))
                this.setData({ adults })
            }

            this.setData({
                allPas,
                from,
                frombooking,
                'passengerInfoBoxData.from': from,
                // addPassengerFromBooking,
                // addPassengerFromAddpasg,
                hasSelf,
                transitObj,
            })
        } catch (e) {
            console.log(e)
        }

        this.loadConfig()

        // if (!!this.data.addPassengerFromBooking || !!this.data.addPassengerFromAddpasg) {
        //     this.setData({
        //         'passengerInfoBoxData.addPassenger': this.data.addPassengerFromBooking || this.data.addPassengerFromAddpasg,
        //     })
        //     this.updateInputStatus()
        // }

        if (pas) {
            let curPasgIndex = pas.PassengerType == 1 ? 0 : ( pas.PassengerType == 3 ? 1 : 2)
            if (pas.noDataType == 1) {
                pas.showNo = pas.noMaskData
            } else if (pas.IdentityType == 1 && pas.IdentityNo) {
                pas.showNo = util.formatIdcardSecret(pas.IdentityNo)
            } else if (pas.IdentityNo) {
                pas.showNo = util.formatOtherSecret(pas.IdentityNo)
            }

            if (pas.MobilePhone) {
                pas.showMobile = util.formatOtherSecret(pas.MobilePhone)
            }
            if( pas.IdentityType == 2){
                pas.Nationality = pas.Nationality || ''
                this.setData({
                    'passengerInfoBoxData.nationalityName': pas.NationalityName || '',
                })

                // 对于护照中英文的处理
                if( pas.Nationality !== 'CN'){
                    pas.IsENName = !!(pas.ENFirstName && pas.ENLastName)
                }
            }

            if ([7, 8, 28, 32].includes(pas.IdentityType)) {
                pas.IsENName = pas.IsENName || !!(!pas.CNName && pas.ENFirstName && pas.ENLastName)
            }

            this.setData({
                'passengerInfoBoxData.addPassenger': pas,
                'passengerInfoBoxData.cardTypeText': cardTypesById[pas.IdentityType] || '二代身份证',
                'passengerInfoBoxData.curPasgIndex': curPasgIndex,
            })
            this.updateInputStatus()
        }
        this.getShareInfoKey()
        this.checkChildRuleShow()

    },
    onShow() {
      if(shared.fromCheckStuQua){
        shared.checkPromiseResolve && shared.checkPromiseResolve();
        shared.fromCheckStuQua = null;
        shared.checkPromiseResolve = null;
      }
    },
    loadConfig(){
        // 一键导入乘车人开关
        setConfigSwitchAsyncPromise('train_wx_import_passengers_once')
            .then(([res]) => {
                this.setData({ importPasFlag: res })
            })
        getConfigInfoJSON('train_wx_passenger_stutips').then(data => {
            this.setData({ stuTips: data })
        })

        // 手机号黄条开关
        setConfigSwitchAsyncPromise('train_wx_passenger_mobiletips').then(([res]) => {
            this.setData({ mobileTipsShow: res })
        })

        // 扫描证件开关
        setConfigSwitchAsyncPromise('train_wx_passenger_ocr').then(([res]) => {
            this.setData({ocrFlag: res})
        })
    },
    //实名认证回调
    // realNameAuthInfo(e) {
    //     if (e.detail && !e.detail.auth_token) return util.showToast('获取实名信息失败', 'none')
    //     let params = {
    //         plat: 50, // 50：微信小程序
    //         serviceCode: '32007105',
    //         ver: '1.0',
    //         reqbody: JSON.stringify({
    //             ver: '8.0.0',
    //             plat: 50, // 50：微信小程序
    //             appsource: 31, // 2：汽车票微信小程序，获取微信用户信息 31: 火车票
    //             authtoken: e.detail.auth_token,
    //         }),
    //     }
    //     util.showLoading()
    //     GetRealNamePacketModel(params, res => {
    //         util.hideLoading()
    //         console.error(res.data)
    //         if (res.data && res.data.rc == 0) {
    //             let data = JSON.parse(res.data.resbody)
    //             if (data.rc == 0) {
    //                 this.setData({
    //                     'passengerInfoBoxData.addPassenger.CNName': data.username,
    //                     'passengerInfoBoxData.addPassenger.showNo': data.idnomask, // 掩码
    //                     'passengerInfoBoxData.addPassenger.IdentityNo': data.idnocipher, // 神盾加密
    //                     'passengerInfoBoxData.addPassenger.IdentityType': 1,
    //                     // 'passengerInfoBoxData.addPassenger.PassengerType': 1,
    //                     'passengerInfoBoxData.addPassenger.isChild': 0,
    //                     'passengerInfoBoxData.addPassenger.IsENName': false,
    //                     'passengerInfoBoxData.addPassenger.PassengerID': 0,
    //                     'passengerInfoBoxData.addPassenger.fromWechatInfo': true, // 微信获取的身份信息 可以不用校验
    //                 })
    //             } else {
    //                 util.showToast('获取实名信息失败', 'none')
    //             }
    //         } else {
    //             util.showToast('获取实名信息失败', 'none')
    //         }
    //     }, err => {
    //         util.hideLoading()
    //         this.ubtTrace('GetRealNamePacket err', err)
    //         util.showToast('网络错误', 'none')
    //     })
    // },
    async goCheck() {
      let checkPromise = {}
      checkPromise = new Promise((resolve, reject) => {
        util.showModal({
          title: '学生票须知',
          m: '购买学生优惠票时，需完成学生优惠资质核验，或持相关有效证件在车站窗口或自动售/取票机办理学生优惠资质核验。',
          showCancel: true,
          cancelText: '暂不核验',
          confirmText: '去核验',
          done: (res) => {
            if(res.confirm){
              const params = `https://m.ctrip.com/trnCustomerServiceWebapp/train/student/verification?partner=Ctrip&platform=weChat&hideNavBar=YES&checkStuQua=1&needLogin=1&title=学生资质核验&need12306Name=1&redirectSync=1`;
              this.navigateTo({
                url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(params)}`
                // url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent('check12306Login=1&checkStuQua=1&needLogin=1')}`
              })
              shared.checkPromiseResolve = resolve
              // resolve()
            }else{
              resolve()
            }
          },
        })
      })
      return checkPromise;
    },
    clickScan() {
        cwx.component.ocr({
            bizType: 'BBZ',
            title: '证件识别',
        },
        function(ocrResult) {
            // 回调，返回识别结果
            this.ubtDevTrace('c_train_ocrresult', ocrResult)
            if (ocrResult?.result?.resultCode == 0) {
                try {
                    let str = ocrResult.idCardNo.substring(6, 14)
                    this.setData({
                        'passengerInfoBoxData.addPassenger.Birthday': cDate.parse(str).format('Y-m-d'),
                    })
                } catch (error) {}

                this.setData({
                    'passengerInfoBoxData.addPassenger.CNName': ocrResult.name,
                    'passengerInfoBoxData.addPassenger.showNo': ocrResult.idCardNo,
                    'passengerInfoBoxData.addPassenger.IdentityNo': ocrResult.idCardNo,
                    'passengerInfoBoxData.addPassenger.IdentityType': 1,
                    'passengerInfoBoxData.addPassenger.IsENName': false,
                    'passengerInfoBoxData.addPassenger.PassengerID': 0,
                })
                this.ubtTrace('train_addbyocr_addsuccess', true)
            } else {
                util.showModal({
                    m: ocrResult?.result?.errMessage ?? '扫描失败，请稍后重试',
                })
                this.ubtTrace('train_addbyocr_addfailure', true)
            }
        },
        )
    },
    showNameTips() {
        this.setData({
            showType: 'name',
        })
    },
    hideNameTips() {
        if (this.data.showType === 'child') {
            this.resetTitle()
        }
        this.setData({
            showType: '',
        })
    },
    showChildTips() {
        util.setTitle('儿童购票说明')
        this.setData({
            showType: 'child',
        })
    },
    submit() {
        // 使用 bindchange 事件后，立即点击按钮，model的值尚未更新，所以需要延迟
        setTimeout(() => {
            util.ubtTrace('TCWPassengerEdit_Button_click', { 
                PageId: "10320672799", 
                ExpoType: this.data.singleTrain ? 1 : 2,
                clickType: shared.pas ? 2 : 1
            }) 
            this.updateInputStatus()
            if (!this['checkInputStatus']()) return
            this.submitPasInfo()
        }, 300)
    },
    
    async submitPasInfo() {
        const samePas = (pas, self12306Pas) => {
          if(!self12306Pas) return false;
          return self12306Pas.passengerName === pas.pasName || self12306Pas.passengerName === pas.CNName || self12306Pas.passengerName === pas.ename
        }
        let pas = this.data.passengerInfoBoxData.addPassenger
        const self12306Pas = shared.self12306Pas && JSON.parse(JSON.stringify(shared.self12306Pas));
        const params = {
            Channel: 'ctripwx',
            TrainModifyInfo: {},
        }
        const TrainModifyInfo = params.TrainModifyInfo
        // 儿童也是有证件号的 否则使用一键添加
        // 微信实名信息添加的用户不用传生日
        if (pas.IdentityType == 1 && pas.IdentityNo && !pas.fromWechatInfo) {
            try {
                let str = pas.IdentityNo.substring(6, 14)
                let Birthday = isNaN(str) ? pas.Birthday : cDate.parse(str).format('Y-m-d')
                this.setData({ 'passengerInfoBoxData.addPassenger.Birthday': Birthday })
            } catch (error) {
                this.setData({ 'passengerInfoBoxData.addPassenger.Birthday': pas.Birthday})
            }
        }
        if ( new Date(shared.selectDate) >= new Date(shared.childAgeLimit) && !shared.canShowChildren) { // 订票时间在配置之后，用新逻辑
            if (pas.isChild) {
                const pasAge = util.getAge(pas.Birthday, shared.selectDate)
                if (pasAge >= 14) {
                    this.setData({
                        showType:'childAgeAlert'
                    })
                    return
                }
            }
        }

        // 不是护照类型，不传国籍
        if(pas.IdentityType != 2) pas.Nationality = ''
        if(pas.Nationality == 'CN') pas.IsENName = false
        Object.assign(TrainModifyInfo, pas)
        // if (shared.pas) {
        //     // 添加乘客
        //     if (pas.IsENName) {
        //         TrainModifyInfo.CNName = shared.pas.CNName
        //     } else {
        //         TrainModifyInfo.ENFirstName = shared.pas.ENFirstName || ''
        //         TrainModifyInfo.ENLastName = shared.pas.ENLastName || ''
        //     }
        // } else {
        //     // 修改乘客
        //     if (pas.IsENName) {
        //         TrainModifyInfo.CNName = ''
        //     } else {
        //         TrainModifyInfo.ENFirstName = ''
        //         TrainModifyInfo.ENLastName = ''
        //     }
        // }
        if (pas.IsENName) {
            TrainModifyInfo.CNName = ''
        } else {
            TrainModifyInfo.ENFirstName = ''
            TrainModifyInfo.ENLastName = ''
        }
        // 证件号数据类型，0=默认，1=神盾
        TrainModifyInfo.IdentityNoDataType = pas.fromWechatInfo ? 1 : Number(pas.noDataType == 1 && !this.data.isClickedNum)
        console.log('TrainModifyInfo', TrainModifyInfo)
        util.showLoading()
        let cb = () => {
            if (params.TrainModifyInfo.IdentityType == 1){
                this.navigateBack({
                    pasgId: this.failHandler(params.TrainModifyInfo).PassengerID,
                })

                return
            }
            let tips = (pas.PassengerID ? '编辑' : '新增') + '乘客失败，请稍候再试'
            util.showToast(tips, 'none')
        }
        params.ActionType = 0
        // 学生资质核验, 出弹窗
        if(pas.PassengerType === 3 && samePas(pas, self12306Pas)){
          util.hideLoading()
          await this.goCheck()
          util.showLoading()
        }
        TrainModifyPassengerModel(params, data => {
            console.log('TrainModifyPassengerModel',data,params);
            // const data = {
            //     "ResponseStatus": {
            //       "Timestamp": "/Date(1639388235807+0800)/",
            //       "Ack": "Success",
            //       "Errors": [
            //       ],
            //       "Build": null,
            //       "Version": null,
            //       "Extension": [
            //         {
            //           "Id": "CLOGGING_TRACE_ID",
            //           "Version": null,
            //           "ContentType": null,
            //           "Value": "4221339232491468146"
            //         },
            //         {
            //           "Id": "RootMessageId",
            //           "Version": null,
            //           "ContentType": null,
            //           "Value": "100014629-0a3e81dc-455385-5949"
            //         }
            //       ]
            //     },
            //     "Message": null,
            //     "RetCode": 3,
            //     "PassengerID": 0,
            //     "NewPassengerID": null,
            //     "IdentityNoAegisData": null,
            //     "IdentityNoMaskData": null,
            //     "IdentityNoDataType": 0,
            //     "IdentityNoIsMatch": false,
            //     "AlertInfo": {
            //       "Title": "儿童监护人确认",
            //       "Content": "您正在录入未成年人信息，请确认您是该未成年人的监护人或已征得其监护人同意。",
            //       "ButtonList": [
            //         {
            //           "ButtonName": "暂缓",
            //           "ActionType": 2
            //         },
            //         {
            //           "ButtonName": "继续保存",
            //           "ActionType": 1
            //         }
            //       ]
            //     }
            //   }
            if (data && data.RetCode == 1) {
                shared.hasModifyPassenger = true
                util.showToast('保存成功！')
                if (this.data.frombooking) {
                    trainGetPassengerListPromise().then(({
                        memberPas,
                    } = {}) => {
                        let newPas = memberPas.find(item => item.PassengerID == data.PassengerID)
                        this.navigateBack({
                            pasgId: data.PassengerID,
                            newPas,
                        })
                    })
                } else {
                    this.navigateBack({
                        pasgId: data.PassengerID,
                    })
                }


            } else if (data && data.RetCode == 3) {
                if (TrainModifyInfo.PassengerType === 2 && data.AlertInfo ) {
                    this.setData({
                        showType: 'showChildDialog',
                        childAlertInfo: data.AlertInfo,
                        trainModifyPassenger: params
                    })
                }else {
                    util.showModal({
                    m: data.Message || '新增失败',
                })
                }

            } else {
                cb.call(null)
            }
        }, () => {
            cb.call(null)
        }, () => {
            util.hideLoading()
        })
    },
    onShareAppMessage() {
        // //分享成功
        setTimeout (() => {
            this.setData({
                showType: 'shareSuccess',
                // isFirstShowModal: false,
            })
        }, 2000)

        const params = JSON.stringify({url: encodeURIComponent(`https://m.ctrip.com/webapp/train/activity/20200304-ctrip-passenger-mobile-check?shareInfoKey=${this.shareInfoKey}&allianceid=10613&sid=2909730`)})

        return {
            bu: 'train',
            title: '快来加入行程，我来帮你买票',
            path: `/pages/train/shareWebView/shareWebView?data=${params}`,
            imageUrl: 'https://images3.c-ctrip.com/train/app/8.21/bqckxx.png',
        }

    },

    getShareInfoKey() {
        const params = {
            ShareType: 3, // 1=直连告知好友核验，2=直连新增乘客邀请，3=代购新增乘客邀请
            TicketInfo: {
                DepartStation: shared.train ? shared.train.DepartStation : '',
                ArriveStation: shared.train ? shared.train.ArriveStation : '',
                DepartDateTime:  shared.train ? cDate.createUTC8CDate(shared.selectDate + ' ' + shared.train.DepartTime).format('YmdHis') : '',
                ArriveDateTime:shared.train ? cDate.createUTC8CDate(shared.selectDate + ' ' + shared.train.ArriveTime).format('YmdHis') : '',
                TrainNumber:shared.train ? shared.train.TrainNumber : '',
                SeatName: shared.train ? shared.train.SeatName : '',
            },
        }
        PushUserSharePassengerInfoModel(params, res => {
            if (res.RetCode == 1 && res.ShareInfoKey) {
                this.shareInfoKey = res.ShareInfoKey
            }
        })
    },
    failHandler(psg){
        if (!shared.tmpFailPsg) {
            shared.tmpFailPsg = []
        }
        let _psg = {
            ...psg,
            isTemp:true,
            PassengerID:Date.now(),
        }
        shared.tmpFailPsg.push(_psg)

        return _psg
    },
    onReady() {
        this.resetTitle()
    },
    resetTitle() {
        let title = this.data.passengerInfoBoxData.addPassenger.PassengerID ? '编辑乘客' : '新增乘客'
        util.setTitle(title)
    },
    showStudentTips() {
        util.setTitle('学生购票说明')
        this.setData({
            showType: 'stu',
        })
    },
    showAddChildTips () {
        this.setData({
            showType: 'addChild',
        })
    },
    showAddChildMutip () {
        this.setData({
            showType: 'chooseAdultForChild',
        })
    },
    hidePop () {
        this.setData({
            showType: '',
        })
    },
    addChildPassenger (){
        util.showLoading()
        const params = this.data.trainModifyPassenger
        let cb = () => {
            if (params.TrainModifyInfo.IdentityType == 1){
                this.navigateBack({
                    pasgId: this.failHandler(params.TrainModifyInfo).PassengerID,
                })

                return
            }
            let tips = (pas.PassengerID ? '编辑' : '新增') + '乘客失败，请稍候再试'
            util.showToast(tips, 'none')
        }
        params.ActionType = 1
        TrainModifyPassengerModel(params, data => {
            console.log('TrainModifyPassengerModel',this.data.trainModifyPassenger,this.data.trainModifyPassenger.TrainModifyInfo.PassengerType);
            if (data && data.RetCode == 1) {
                shared.hasModifyPassenger = true
                util.showToast('保存成功！')
                if (this.data.frombooking) {
                    trainGetPassengerListPromise().then(({
                        memberPas,
                    } = {}) => {
                        let newPas = memberPas.find(item => item.PassengerID == data.PassengerID)
                        this.navigateBack({
                            pasgId: data.PassengerID,
                            newPas,
                            passengerType: this.data.trainModifyPassenger.TrainModifyInfo.PassengerType
                        })
                    })
                } else {
                    this.navigateBack({
                        pasgId: data.PassengerID,
                        passengerType: this.data.trainModifyPassenger.TrainModifyInfo.PassengerType
                    })
                }

            } else if (data && data.RetCode == 3) {
                util.showModal({
                    m: data.Message || '新增失败',
                })

            } else {
                cb.call(null)
            }
        }, () => {
            cb.call(null)
        }, () => {
            util.hideLoading()
        })
    },
    addChilHandle () {
        let adults = this.data.adults.length
        if (adults == 1) {
            let childPasg = {...this.data.adults[0]}
            childPasg.PassengerType = 2
            childPasg.Birthday = util.randomBirth(this.data.allPas.length)
            childPasg.IsBind = true
            this.goBooking(this.data.from, childPasg)
        } else if (adults > 1 && this.data.allPas.length < shared.pasCntLimit) {
            this.showAddChildMutip()
        } else if (this.data.allPas.length > shared.pasCntLimit - 1) {
            util.showModal({
                m: `一个订单最多只能添加${shared.pasCntLimit}名乘客，超过请分批购买`,
            })
        } else {
            util.showModal({
                m: '儿童不能单独出行，请先添加成人',
            })
        }
    },
    selectAdultForChild (e) {
        let { index } = e.currentTarget.dataset
        this.setData({
            curAdultIndex: index,
        })
        let childPasg = {...this.data.adults[this.data.curAdultIndex]}
        childPasg.PassengerType = 2
        childPasg.Birthday = util.randomBirth(this.data.allPas.length)
        childPasg.IsBind = true
        this.goBooking(this.data.from, childPasg)
    },
    goBooking (from, data) {
        if (from == 'ordinary') {
            this.navigateTo({
                url: `/pages/trainBooking/booking/ordinary/index`,
                data: {
                    childPasg: data,
                    transitObj: this.data.transitObj,
                },
            })
        } else {
            this.navigateTo({
                url: `/pages/trainBooking/booking/grab/index`,
                data: {
                    childPasg: data,
                },
            })
        }
    },
    // 判断显示哪些儿童票规则
    checkChildRuleShow() {
        this.setData({ isShowOldrule: shared.canShowChildren })
    }
}

util.useMixin(page, [passengerInfoBox])
TPage(page)
