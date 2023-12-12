import { _ } from '../../../../../cwx/cwx'
import util from '../../util'
import {
    isValidCardNum,
    isValidPassport,
    isValidHKMacao,
    isValidTaiwan,
    isValidFPCResidencePermit,
    isValidGATResidencePermit,
    isValidCardEmail,
} from '../../util'

import cDate from '../../cDate'

const cardTypesByName = util.cardTypesByName

/**
 * todo: 抽取一个 setData/getData 方法，避免每次冗长的 passengerInfoBoxData 打头
 */
export default {
    data: {
        passengerInfoBoxData: {
            showPsgType: '', // 证件类型展示方式 line 代表平铺，其余值表示 actionSheet
            cardTypeText: '二代身份证',
            nationalityName: '中国',
            showEditPop: false, // 是否正在popup中编辑乘客
            addPassenger: {
                PassengerType: 1, // 1：成人 2：儿童 3：学生
                IdentityType: 1, // 即一种 cardTypes
                IdentityNo: '',
                CNName: '',
                ENFirstName: '',
                ENLastName: '',
                PassengerID: 0,
                isChild: 0,
                IsENName: false,
                Birthday: '',
                IdentityLimitDate: '',
                CheckStatus: '',
                CheckStatusName: '',
                Nationality: 'CN',
            },
            passengerEditStatus: {
                isNeedNameWarn: false,
                isNeedIdWarn: false,
                isNeedBirthWarn: false,
                isShowBirthWarn: false,
                isNeedLastNameWarn: false,
                isNeedFirstNameWarn: false,
                isNeedLimitDateWarn: false,
                isNeedNationalityWarn: false,
                nameWarn: '',
                idWarn: '',
                enNameWarn: '',
                birthWarn: '请选择出生日期',
                limitDateWarn: '',
                nationalityWarn: '请选择国籍',
            },
            // 证件类型对应的验证规则 map
            // firstName, lastName 添加注释，代表是否校验过
            statuesMap: {
                1: {
                    validate: {
                        name: false,
                        idcard: false,
                    },
                },
                2: {
                    validate: {
                        name: false,
                        idcard: false,
                        birthday: false,
                        limitDate: false,
                        nationality: false,
                    },
                    firstName: false,
                    lastName: false,
                },
                7: {
                    validate: {
                        name: false,
                        idcard: false,
                        birthday: false,
                        limitDate: false,
                    },
                    firstName: false,
                    lastName: false,
                },
                8: {
                    validate: {
                        name: false,
                        idcard: false,
                        birthday: false,
                        limitDate: false,
                    },
                    firstName: false,
                    lastName: false,
                },
                // 10: {
                //     validate: {
                //         name: false,
                //         birthday: false,
                //         idcard: false
                //     },
                //     firstName: false,
                //     lastName: false,
                // },
                28: {
                    validate: {
                        name: false,
                        idcard: false,
                        limitDate: false,
                        birthday: false,
                    },
                    firstName: false,
                    lastName: false,
                },
                32: {
                    validate: {
                        name: false,
                        idcard: false,
                    },
                    firstName: false,
                    lastName: false,
                },
            },
            todayString: "",
            curPasgIndex: 0,
            pasgTypes: [{name: "成人票", type: 1}, {name: "学生票", type: 3}, {name: "儿童票", type: 2}],
        },
        isIOS: util.isIOS() < 0,
        isClickedNum: false,
    },
    methods: {
        toPassportInfo () {
            this.navigateTo({
                url: `../webview/webview`,
                data: {
                    url: 'https://pages.ctrip.com/ztrip/document/passport-info.html?__ares_maxage=3m',
                },
            })
        },
        getTodayString () {
            let today = new Date().toISOString().slice(0, 10)
            this.setData({
                ['passengerInfoBoxData.todayString']: today,
            })
        },
        // 更新验证规则状态
        updateStatue (idcardType, key, status) {
            this.data.passengerInfoBoxData.statuesMap[idcardType].validate[key] = status
        },
        setStatusFalse(){
            // todo: enhancement 这些变量不需要绑定到 data 上，所以直接进行了赋值
            util.setObjAttrFalse(this.data.passengerInfoBoxData.statuesMap)
            // let data = Object.assign({}, this.data.passengerInfoBoxData.statuesMap);
            // this.setData({
            //     'passengerInfoBoxData.statuesMap': util.setObjAttrFalse(data)
            // });
        },
        inputPsgName(e) {
            this.setData({
                'passengerInfoBoxData.addPassenger.CNName': e.detail.value,
            })
            if (this.checkPsgName(e)) {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                let status = this.checkValidate(this.data.passengerInfoBoxData.statuesMap[idcardType].validate)
                typeof this.checkBlurStatus === 'function' && !this.data.passengerInfoBoxData.showEditPop ? this.checkBlurStatus(status) : null
            }
        },
        checkPsgName(e) {
            const cName = e ? e.detail.value : this.data.passengerInfoBoxData.addPassenger.CNName
            if (!this.checkCName()) {
                console.log("姓名验证失败")
                let nameWarn
                if (!cName) {
                    nameWarn = '请填写姓名'
                } else {
                    nameWarn = '姓名首字必须用汉字，第二字起可用拼音，且一旦用拼音则后续都须使用拼音'
                }
                setTimeout(()=>{
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.nameWarn': nameWarn,
                        'passengerInfoBoxData.passengerEditStatus.isNeedNameWarn': true,
                    })
                },this.data.isIOS ? 500 : 100)

                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                this.updateStatue(idcardType, 'name', false)

            } else {
                console.log("姓名验证成功")
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedNameWarn': false,
                })
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                this.updateStatue(idcardType, 'name', true)

                return true
            }
        },

        /**
         * 检查当前输入的乘客信息是否完整
         */
        checkInputStatus () {
            const { passengerInfoBoxData = {} } = this.data;
            let { IdentityType: idcardType, MobilePhone:mobile, Email: email, Nationality: nationality} = passengerInfoBoxData.addPassenger;

            // 不展示邮箱栏的情况下，清空邮箱号，防止漏填信息 只校验手机
            if( passengerInfoBoxData.cardTypeText === '二代身份证' || passengerInfoBoxData.cardTypeText === '外国人永久居留身份证' || passengerInfoBoxData.cardTypeText === '港澳台居民居住证'
                || passengerInfoBoxData.cardTypeText === '护照' && nationality === 'CN'){
                this.setData({
                    'passengerInfoBoxData.addPassenger.Email': ''
                })
                if(!util.isMobile(mobile)) return util.showToast('请输入乘客本人11位手机号', 'none')
            // 展示邮箱栏的时候 手机和邮箱可以二选一
            }else if(!mobile && !email){
                return util.showToast('请输入11位手机号码或电子邮箱', 'none')
            }else if(mobile && !util.isMobile(mobile)) {
                return util.showToast('请输入乘客本人11位手机号', 'none')
            }else if (email && !isValidCardEmail(email)) {
                return util.showToast('请输入正确的邮箱', 'none')
            }

            return this.checkValidate(this.data.passengerInfoBoxData.statuesMap[idcardType].validate)
        },

        /**
         * 设置乘客之后更新状态
         */
        updateInputStatus() {
            let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
            if (idcardType == 0) {
                idcardType = 1
                this.setData({
                    'passengerInfoBoxData.addPassenger.IdentityType': idcardType,
                })
            }
            let validate = this.data.passengerInfoBoxData.statuesMap[idcardType].validate
            const {
                passengerInfoBoxData: {
                    addPassenger,
                },
            } = this.data
            if (validate.hasOwnProperty('name')) {
                // 这种情况不校验 因为从填写页点击添加本人信息跳过来的时候是没有带姓名的 如果校验的话就会有红色的提示 其实是不需要提示的
                if (this.data.passengerInfoBoxData.addPassenger.fromWechatInfo) {
                    let idcardType = cardTypesByName[this.data.passengerInfoBoxData.cardTypeText]
                    this.updateStatue(idcardType, 'name', true)
                } else {
                    if (addPassenger.IsENName) {
                        this.checkPsgFirstName()
                        this.checkPsgLastName()
                    } else {
                        this.checkPsgName()
                    }
                }
            }
            // 微信实名获取的身份证获取的是掩码不符合校验规则 但是不用校验
            if (validate.hasOwnProperty('idcard')) {
                if (this.data.passengerInfoBoxData.addPassenger.fromWechatInfo) {
                    let idcardType = cardTypesByName[this.data.passengerInfoBoxData.cardTypeText]
                    this.updateStatue(idcardType, 'idcard', true)
                } else {
                    this.checkPsgCardNum()
                }
            }
            if (validate.hasOwnProperty('birthday')) {
                this.checkBirthChange()
            }
            if (validate.hasOwnProperty('nationality')) {
                this.checkNationality()
            }
            if (validate.hasOwnProperty('limitDate')) {
                this.checkIdentityLimitDate()
            }
        },
        inputPsgCardNumHandler(e) {
            this.setData({
                'passengerInfoBoxData.addPassenger.IdentityNo': !!e && e.detail && e.detail.value || '',
            })
        },
        /**
         * 输入并检查证件号码
         */
        inputPsgCardNum(e) {
            // todo: 注释 为什么这里需要设置 IdentityType
            this.setData({
                // 'passengerInfoBoxData.addPassenger.IdentityNo': e.detail.value,
                'passengerInfoBoxData.addPassenger.IdentityType': cardTypesByName[this.data.passengerInfoBoxData.cardTypeText],
            })
            if (this.checkPsgCardNum(e)) {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                let status = this.checkValidate(this.data.passengerInfoBoxData.statuesMap[idcardType].validate)
                typeof this.checkBlurStatus === 'function' && !this.data.passengerInfoBoxData.showEditPop ? this.checkBlurStatus(status) : null
            }
        },
        inputMobileHandler(e) {
            this.setData({
                'passengerInfoBoxData.addPassenger.MobilePhone': !!e && e.detail && e.detail.value || '',
            })
        },
        inputEmailHandler(e) {
            this.setData({
                'passengerInfoBoxData.addPassenger.Email': !!e && e.detail && e.detail.value || '',
            })
        },
        checkPsgCardNum() {
            if (this.checkIdCard()) {
                console.log("证件信息验证成功")
                let idcardType = cardTypesByName[this.data.passengerInfoBoxData.cardTypeText]
                this.updateStatue(idcardType, 'idcard', true)

                return true
            } else {
                console.log("证件信息验证失败")
                let idcardType = cardTypesByName[this.data.passengerInfoBoxData.cardTypeText]
                this.updateStatue(idcardType, 'idcard', false)
            }
        },

        inputPsgFirstName(e) {
            this.setData({
                'passengerInfoBoxData.addPassenger.ENFirstName': e.detail.value,
            })

            if (this.checkPsgFirstName(e)) {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                let status = this.checkValidate(this.data.passengerInfoBoxData.statuesMap[idcardType].validate)
                typeof this.checkBlurStatus === 'function' && !this.data.passengerInfoBoxData.showEditPop ? this.checkBlurStatus(status) : null
            }
        },
        checkPsgFirstName() {
            let ENReg = /^[A-Za-z .·]+$/
            let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
            if (!ENReg.test(this.data.passengerInfoBoxData.addPassenger.ENFirstName)) {
                console.log("FirstName验证失败")
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedFirstNameWarn': true,
                    'passengerInfoBoxData.passengerEditStatus.enNameWarn': '请填写正确的姓名',
                })
                this.data.passengerInfoBoxData.statuesMap[idcardType].firstName = false

                return
            }
            console.log("FirstName验证成功")
            this.setData({
                'passengerInfoBoxData.passengerEditStatus.isNeedFirstNameWarn': false,
            })
            this.data.passengerInfoBoxData.statuesMap[idcardType].firstName = true

            this.updateStatue(idcardType, 'name', !!this.data.passengerInfoBoxData.statuesMap[idcardType].lastName)

            return true
        },
        inputPsgLastName(e) {
            this.setData({
                'passengerInfoBoxData.addPassenger.ENLastName': e.detail.value,
            })
            if (this.checkPsgLastName()) {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                let status = this.checkValidate(this.data.passengerInfoBoxData.statuesMap[idcardType].validate)
                typeof this.checkBlurStatus === 'function' && !this.data.passengerInfoBoxData.showEditPop ? this.checkBlurStatus(status) : null
            }
        },
        checkPsgLastName() {
            let ENReg = /^[A-Za-z .·]+$/
            let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
            if (!ENReg.test(this.data.passengerInfoBoxData.addPassenger.ENLastName)) {
                console.log("LastName验证失败")
                setTimeout(() => {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedLastNameWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.enNameWarn': '请填写正确的姓名',
                    })
                }, this.data.isIOS ? 500 : 100)
                this.data.passengerInfoBoxData.statuesMap[idcardType].lastName = false

                return false
            }

            console.log("LastName验证成功")
            this.setData({
                'passengerInfoBoxData.passengerEditStatus.isNeedLastNameWarn': false,
            })
            this.data.passengerInfoBoxData.statuesMap[idcardType].lastName = true
            this.updateStatue(idcardType, 'name', !!this.data.passengerInfoBoxData.statuesMap[idcardType].firstName )

            return true
        },
        birthChange(e) {
            let date = e.detail.value
            this.setData({
                'passengerInfoBoxData.addPassenger.Birthday': date,
            })
            if (this.checkBirthChange(e)) {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                let status = this.checkValidate(this.data.passengerInfoBoxData.statuesMap[idcardType].validate)
                typeof this.checkBlurStatus === 'function' && !this.data.passengerInfoBoxData.showEditPop ? this.checkBlurStatus(status) : null

                return status
            }
        },
        limitDateChange (e) {
            let date = e.detail.value
            this.setData({
                'passengerInfoBoxData.addPassenger.IdentityLimitDate': date,
            })
            this.checkIdentityLimitDate()
        },
        checkBirthChange() {
            this.checkBirth()
            if (this.checkBirth()) {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                this.updateStatue(idcardType, 'birthday', true)

                return true
            } else {
                let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
                this.updateStatue(idcardType, 'birthday', false)

                return false
            }
        },

        // todo: enhancement 将弹窗编辑逻辑抽取之后，可以把这个函数从 this 上剥离
        checkCName() {
            let CNName = this.data.passengerInfoBoxData.addPassenger.CNName
            if (!CNName) {
                return false
            }
            if (!util.isValidChineseName(CNName)) {
                return false
            }

            return true
        },

        /**
         * 检查 obj 中每一项是否都通过验证
         * @param {*} obj statuesMap 中的 validate 对象
         */
        checkValidate(obj) {
            const keys = Object.keys(obj)
            let res = keys.every((key) => {
                console.log(key + ": ", obj[key])

                return obj[key]
            })
            if (!res) {
                // status1 表示生日是否通过校验 true 表示未通过校验
                // status2 表示除了生日之外的值是否通过校验， true 表示通过校验
                //在仅剩日期为false的情况下，设置提示
                let status1 = false
                let status2 = true
                keys.forEach(key => {
                    if (key === 'birthday') {
                        !obj[key] ? status1 = true : null
                    } else {
                        status2 = status2 && obj[key]
                    }
                })
                if (status1 && status2) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.birthWarn': '请确认您的出生日期',
                    })
                }
            }
            console.log("当前乘客输入是否全部通过验证: " + res)

            return res
        },

        checkNumberNeedRest() {
            let {passengerInfoBoxData} = this.data
            let {addPassenger} = passengerInfoBoxData
            let {showNo} = addPassenger
            let needRest = showNo ? showNo.indexOf('*') > -1 : false
            if (needRest) {
                this.setData({
                    'passengerInfoBoxData.addPassenger.showNo': '',
                    'passengerInfoBoxData.addPassenger.IdentityNo': '',
                    'passengerInfoBoxData.addPassenger.fromWechatInfo': false, // 一但重新输入就重置一键导入信息的标识
                    isClickedNum: true,
                })
            }
        },
        checkMobileNumberNeedRest() {
            let { passengerInfoBoxData} = this.data
            let {addPassenger: {showMobile}} = passengerInfoBoxData

            let needRest = showMobile ? showMobile.indexOf('*') > -1 : false
            if (needRest) {
                this.setData({
                    'passengerInfoBoxData.addPassenger.showMobile': '',
                    'passengerInfoBoxData.addPassenger.MobilePhone': '',
                })
            }
        },
        checkEmailNeedRest() {
            this.setData({
                'passengerInfoBoxData.addPassenger.Email': '',
            })
        },
        checkIdCard() {
            let pas = this.data.passengerInfoBoxData.addPassenger
            let cardType = pas.IdentityType
            let noDataType = pas.noDataType
            let no = pas.IdentityNo
            if (!no) {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                    'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写证件号码',
                })

                return false
            }

            // 身份证
            if (noDataType == 1 && !this.data.isClickedNum) {
                // 不校验身份证号码
            } else if (cardType == 1) {
                if (!isValidCardNum(no)) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写正确的身份证号码',
                    })

                    return false
                } else {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                    })
                }
            } else if (cardType == 2) {
                if (!isValidPassport(no)) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写正确的护照',
                    })

                    return false
                } else {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                    })
                }
            } else if (cardType == 7) {
                if (!isValidHKMacao(no)) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写正确的回乡证号码',
                    })

                    return false
                } else {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                    })
                }
            } else if (cardType == 8) {
                if (!isValidTaiwan(no)) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写正确的台胞证号码',
                    })

                    return false
                } else {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                    })
                }
            } else if (cardType == 28) {
                if (!isValidFPCResidencePermit(no)) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写正确的外国人永久居留身份证号码',
                    })

                    return false
                } else {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                    })
                }
            } else if (cardType == 32) {
                if (!isValidGATResidencePermit(no)) {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': true,
                        'passengerInfoBoxData.passengerEditStatus.idWarn': '请填写正确港澳台居民居住证',
                    })

                    return false
                } else {
                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                    })
                }
            }

            return true
        },
        checkNationality() {
            let nationality = this.data.passengerInfoBoxData.addPassenger.Nationality;
            let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
            if (!nationality) {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedNationalityWarn': true,
                });
                return;
            }

            this.setData({
                'passengerInfoBoxData.passengerEditStatus.isNeedNationalityWarn': false
            });

            this.updateStatue(idcardType, 'nationality', true)
        },
        checkIdentityLimitDate () {
            let limitDate = this.data.passengerInfoBoxData.addPassenger.IdentityLimitDate
            let idcardType = this.data.passengerInfoBoxData.addPassenger.IdentityType
            if (!limitDate) {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedLimitDateWarn': true,
                    'passengerInfoBoxData.passengerEditStatus.limitDateWarn': '请填写有效期限',
                })

                return
            }

            // 回乡证不校验有效期
            if (idcardType !== 7 && cDate.parse(limitDate).getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedLimitDateWarn': true,
                    'passengerInfoBoxData.passengerEditStatus.limitDateWarn': '证件已过有效期',
                })

                return
            }

            this.setData({
                'passengerInfoBoxData.passengerEditStatus.isNeedLimitDateWarn': false,
            })
            this.updateStatue(idcardType, 'limitDate', true)
        },
        checkBirth() {
            let Birthday = this.data.passengerInfoBoxData.addPassenger.Birthday
            if (!Birthday) {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': true,
                    'passengerInfoBoxData.passengerEditStatus.birthWarn': '请选择出生日期',
                })

                return false
            } else {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': false,
                })
            }

            if (cDate.parse(Birthday).getTime() > new cDate().getTime()) {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': true,
                    'passengerInfoBoxData.passengerEditStatus.birthWarn': '请选择正确的出生日期',
                })

                return false
            } else {
                this.setData({
                    'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': false,
                })
            }

            // if (this.data.passengerInfoBoxData.addPassenger.isChild) {
            //     let now = new cDate().getTime()
            //     let birthTime = cDate.parse(Birthday).getTime()
            //     let birthDays = (now - birthTime) / oneDay
            //     if (birthDays > 16 * 365 || birthDays < 30) {
            //         this.setData({
            //             'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': true,
            //             'passengerInfoBoxData.passengerEditStatus.birthWarn': '出生满30天且小于于16周岁才可以购买儿童票。请填写正确的出生日期。'
            //         })
            //         return false
            //     } else {
            //         this.setData({
            //             'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': false,
            //         })
            //     }
            // }

            return true
        },

        showCardType() {
            let itemList = _.values(util.cardTypes)
            wx.showActionSheet({
                itemList,
                success: (res) => {
                    let txt = itemList[res.tapIndex]
                    let typeId = cardTypesByName[txt]
                    if (!txt || !typeId) {
                        return
                    }
                    let IsENName = false
                    if (txt === '护照' && this.data.passengerInfoBoxData.addPassenger.CNName === '') {
                        // 切换为护照时，不需要默认输入英文名
                    } else if (['回乡证', '台胞证'].indexOf(txt) > -1 && !this.hasENName()) {

                    } else if (txt === '外国人永久居留身份证') {
                        IsENName = true
                    }
                    // 有限期限picker获取设置起始日期
                    if (['外国人永久居留身份证', '台胞证'].includes(txt)) {
                        this.getTodayString()
                        // this.setData({
                        //     ['passengerInfoBoxData.addPassenger.IdentityLimitDate']: this.data.passengerInfoBoxData.todayString
                        // })
                    }

                    if (txt === '回乡证') {
                        this.setData({
                            ['passengerInfoBoxData.todayString']: '',
                        })
                    }

                    //切换证件类型，所有类型都默认为false
                    this.setStatusFalse()
                    // util.setObjAttrFalse(statuesMap);
                    console.log("切换证件类型后statuesMap: " )
                    console.log(this.data.passengerInfoBoxData.statuesMap)

                    this.setData({
                        'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                        'passengerInfoBoxData.passengerEditStatus.isNeedNameWarn': false,
                        'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': false,
                        'passengerInfoBoxData.passengerEditStatus.isShowBirthWarn': false,
                        'passengerInfoBoxData.passengerEditStatus.isNeedFirstNameWarn': false,
                        'passengerInfoBoxData.passengerEditStatus.isNeedLastNameWarn': false,
                        'passengerInfoBoxData.passengerEditStatus.isNeedLimitDateWarn': false,
                        'passengerInfoBoxData.cardTypeText': txt,
                        'passengerInfoBoxData.addPassenger.CNName': '',
                        'passengerInfoBoxData.addPassenger.ENFirstName': '',
                        'passengerInfoBoxData.addPassenger.ENLastName': '',
                        // 'addPassenger.PassengerID': 0,
                        'passengerInfoBoxData.addPassenger.IdentityNo': '',
                        'passengerInfoBoxData.addPassenger.showNo': '',
                        'passengerInfoBoxData.addPassenger.IsENName': IsENName,
                        'passengerInfoBoxData.addPassenger.IsSelf': false,
                        'passengerInfoBoxData.addPassenger.CheckStatus': '',
                        'passengerInfoBoxData.addPassenger.CheckStatusName': '',
                        'passengerInfoBoxData.addPassenger.IdentityType': typeId,
                        'passengerInfoBoxData.addPassenger.IdentityLimitDate': '',
                    })

                    if (!this.data.passengerInfoBoxData.addPassenger.PassengerID) {
                        this.setData({
                            'passengerInfoBoxData.addPassenger.PassengerID': 0,
                        })
                    }

                },
            })
        },
        tapToSelectNation() {
            util.openNationality({}, obj => {
                this.setData({
                    'passengerInfoBoxData.nationalityName': obj.cityName,
                    'passengerInfoBoxData.addPassenger.Nationality': obj.code,
                    'passengerInfoBoxData.passengerEditStatus.isNeedNationalityWarn': false
                })
                if(obj.code === 'CN') {
                    this.setData({
                        'passengerInfoBoxData.addPassenger.IsENName': false
                    })
                }
            })

        },
        selectPasType(e) {
            const { index } = e.currentTarget.dataset
            this.setData({
                ['passengerInfoBoxData.curPasgIndex']: index,
            })
            this.resetPsgType(this.data.passengerInfoBoxData.pasgTypes[index].type)
        },

        selectPasTypeForInvite () {
            wx.showActionSheet({
                itemList: ['成人票', '学生票', '儿童票'],
                success: (res) => {
                    console.log(res.tapIndex)
                    this.setData({
                        ['passengerInfoBoxData.curPasgIndex']: res.tapIndex,
                    })
                    this.resetPsgType(this.data.passengerInfoBoxData.pasgTypes[res.tapIndex].type)
                },
            })
        },
        resetPsgType (type) {
            let identityType1 = cardTypesByName[this.data.passengerInfoBoxData.cardTypeText]
            let identityType2 = this.data.passengerInfoBoxData.addPassenger.IdentityType

            if (type == 2) {
                // identityType1 = 10;
                // util.showModal({
                //     title: '儿童票购票说明',
                //     m: '1、 身高在1.2米~1.5米的儿童可购买儿童票。使用同行成人证件购票，取票时请用成人证件在自助取票机或取票窗口取票。2、 身高超过1.5米的儿童，需购买成人票。需使用乘车人本人身份证证件购票。'+
                //        '3、 身高1.2米以下的儿童无需购票' + '每位成年旅客可以免费携带一名身高1.2米以下的儿童；携带多名1.2米以下儿童时，其他儿童需购买儿童票。',
                //     confirmText: '我知道了',
                // })
            }

            if (identityType1 !== identityType2) {
                let curStatus = this.data.passengerInfoBoxData.statuesMap[identityType1]
                let beforeStatus = this.data.passengerInfoBoxData.statuesMap[identityType2];
                (curStatus.firstName !== undefined && beforeStatus.firstName !== undefined) ? curStatus.firstName = beforeStatus.firstName : null;
                (curStatus.lastName !== undefined && beforeStatus.lastName !== undefined) ? curStatus.lastName = beforeStatus.lastName : null


                if (beforeStatus.firstName && beforeStatus.lastName && curStatus.firstName === undefined) {
                    curStatus.validate.name = false
                } else {
                    curStatus.validate.name = beforeStatus.validate.name
                }

                (curStatus.validate.birthday !== undefined && beforeStatus.validate.birthday !== undefined) ? curStatus.validate.birthday = beforeStatus.validate.birthday : null
            }

            this.setData({
                // 'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': false,
                // 'passengerInfoBoxData.passengerEditStatus.isShowBirthWarn': false,
                // 'passengerInfoBoxData.addPassenger.PassengerID': 0,
                'passengerInfoBoxData.addPassenger.IdentityType': identityType1,
                'passengerInfoBoxData.addPassenger.IsSelf': false,
                'passengerInfoBoxData.addPassenger.CheckStatus': '',
                'passengerInfoBoxData.addPassenger.CheckStatusName': '',
                'passengerInfoBoxData.addPassenger.isChild': type == 2 ? true : false,
                'passengerInfoBoxData.addPassenger.PassengerType': type,
            })
            if (this.data.passengerInfoBoxData.statuesMap[identityType1].validate.birthday !== undefined) {
                this.checkValidate(this.data.passengerInfoBoxData.statuesMap[identityType1].validate)
            }
        },

        hasENName() {
            return this.data.passengerInfoBoxData.addPassenger.ENLastName || this.data.passengerInfoBoxData.addPassenger.ENFirstName
        },

        switchLanguage() {
            this.changeNameFlag()
            this.setData({
                'passengerInfoBoxData.passengerEditStatus.isNeedIdWarn': false,
                'passengerInfoBoxData.passengerEditStatus.isNeedNameWarn': false,
                'passengerInfoBoxData.passengerEditStatus.isNeedBirthWarn': false,
                'passengerInfoBoxData.passengerEditStatus.isShowBirthWarn': false,
                'passengerInfoBoxData.passengerEditStatus.isNeedFirstNameWarn': false,
                'passengerInfoBoxData.passengerEditStatus.isNeedLastNameWarn': false,
                'passengerInfoBoxData.passengerEditStatus.isNeedLimitDateWarn': false,
                // 'passengerInfoBoxData.addPassenger.ENFirstName': '',
                // 'passengerInfoBoxData.addPassenger.ENLastName': '',
                // 'passengerInfoBoxData.addPassenger.CNName': '',
                'passengerInfoBoxData.addPassenger.IsENName': !this.data.passengerInfoBoxData.addPassenger.IsENName,
            })

        },

        changeNameFlag() {
            let identityType = this.data.passengerInfoBoxData.addPassenger.IdentityType
            this.updateStatue(identityType, 'name', false)
            this.data.passengerInfoBoxData.statuesMap[identityType].lastName = false
            this.data.passengerInfoBoxData.statuesMap[identityType].firstName = false
        },
    },
}
