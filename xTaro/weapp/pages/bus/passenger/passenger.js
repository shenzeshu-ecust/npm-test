import { _, cwx, CPage, cDate, BusShared, Pservice } from '../index.js';

import Passenger from '../common/template/passengerModel.js';
let util = Passenger.PassengerUtil;

const cardTypes = {
    身份证: 1,
    护照: 2,
    回乡证: 7,
    台胞证: 8,
    军官证: 4,
};

const errorCodes = {
    1: '姓名不能为空',
    2: '请填写正确的中文姓名',
    3: '证件号码不能为空',
    4: '请输入正确的证件号码',
    5: '出生满30天且小于16周岁才可以购买儿童票。请填写正确的身份证号',
    6: '小于6周岁才可以购买携童票。请填写正确的身份证号',
    7: '请输入正确的FIRST NAME',
    8: '请输入正确的LAST NAME',
    9: 'FIRST NAME不能为空',
    10: 'LAST NAME不能为空',
};
const childTicketTips = [
    '1. 身高1.2米-1.5米的儿童，可购买儿童票',
    '2. 身高1.5米以上的儿童，需购买全价票',
    '3. 儿童不能独自乘车，须成人陪同',
    '4. 请根据儿童实际身高购票，检票乘车时会测量身高，若因身身高不符无法进站，我司不承担责任',
];

const takeChildTicketTips = [
    '1. 根据规定，1.2米以下儿童乘车可购买携同票 (不提供座位)，身高1.2米至1.5米的儿童可购买半价儿童票，身高超过1.5米的儿童必须购买全票。',
    '2. 请根据儿童实际身高购票，检票时会有相应的检查限制，不符合规定条件的，车站有权要求用户补购差价，我司不承担因儿童身高与所购车票不符而无法进展的责任。',
    '3.一张全票限购一张儿童票，每位成人旅客携带免费儿童超过一人或要求提供座位的，请按规定购买儿童半价票或者全票。',
    '4.实行携童票主要是控制超载的儿童人数，以免发生意外；如您有携带免票儿童出行计划时，请在网上购票过程中申报，我司不承担您不事前申报所造成的的所携带儿童不能同行的责任。',
    '5.如所购班次免票儿童计划（班车核定载客人数的10%）已用完，请改乘其他班次或购买儿童票。',
];

function type(obj) {
    var ret = '';
    if (obj === null) {
        ret = 'null';
    } else if (obj === undefined) {
        ret = 'undefined';
    } else {
        var t = Object.prototype.toString.call(obj);
        var arr = t.match(/^\[object (\w+?)\]$/);
        if (arr) {
            ret = arr[1].toLowerCase();
        } else {
            ret = t;
        }
    }
    return ret;
}

function deepCopy(obj) {
    var ret;
    switch (type(obj)) {
        case 'array':
            ret = obj.map(deepCopy);
            break;
        case 'object':
            ret = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = deepCopy(obj[key]);
                }
            }
            break;
        case 'date':
            ret = new Date(+obj);
            break;
        default:
            ret = obj;
            break;
    }
    return ret;
}
const pasTemplate = {
    takeChild: 0,
    isChild: 0,
    PassengerID: 0,
    cname: '',
    idcard: {
        type: 1,
        text: '身份证',
        CardNo: '',
        no: '',
    },
    idcards: [],
    birth: '1990-10-10',
};

const page = {
    customStyle: 'custom',
    data: {
        childTicketTips: childTicketTips,
        takeChildTicketTips: takeChildTicketTips,
        pas: {},
        showType: '',
        selectedIndex: 0,
        ticketTypeList: [
            {
                display: true,
                title: '成人票',
                ticketPrice: 0,
                desc: '有座，成人或身高1.5米以上儿童应购买',
            },
            {
                display: false,
                title: '儿童票',
                ticketPrice: 0,
                desc: '有座，限身高1.5米以下儿童购买',
            },
            {
                display: false,
                title: '携童票',
                ticketPrice: 0,
                desc: '与成人同座，限身高1米2以下儿童购买',
            },
        ],
    },
    inLoading: false,
    onLoad(options) {
        let pas = BusShared.pas;
        this.isNew = typeof pas == 'undefined';
        pas = pas || deepCopy(pasTemplate);

        var {
            ticketChild,
            ticketTakeChild,
            childTicketUnitSalePrice,
            ticketUnitSalePrice,
            showOcr,
        } = options;

        if (pas.isChild && ticketChild != 1) {
            this.showMsg('不支持儿童票的车次，编辑后乘客类型会自动变为成人票');
        } else if (pas.isTakeChild && ticketTakeChild != 1) {
            this.showMsg('不支持携童票的车次，编辑后乘客类型会自动变为成人票');
        }
        pas.isChild = pas.isChild && ticketChild == 1 ? 1 : 0;
        pas.isTakeChild = pas.isTakeChild && ticketTakeChild == 1 ? 1 : 0;
        if (options.ischild) {
            pas.isChild = 1;
        }

        var supportPassengerTypes = JSON.parse(
            decodeURIComponent(options.supportPassengerTypes)
        ) || ['身份证'];
        var subpportCards = supportPassengerTypes.map((item) => {
            return cardTypes[item];
        });
        var cards = pas.idcards.filter((item) => {
            if (subpportCards.indexOf(parseInt(item.CardType)) >= 0) {
                return true;
            }
        });
        if (subpportCards.indexOf(parseInt(pas.idcard.type)) < 0) {
            if (cards.length > 0) {
                pas.idcard = cards[0];
            } else {
                pas.idcard = {
                    type: 1,
                    text: '身份证',
                    CardNo: '',
                    no: '',
                };
            }
        }
        let ticketTypeList = this.data.ticketTypeList;
        ticketTypeList[0].ticketPrice = ticketUnitSalePrice;
        if (ticketChild == 1) {
            ticketTypeList[1].display = true;
            ticketTypeList[1].ticketPrice = childTicketUnitSalePrice;
        }
        if (ticketTakeChild == 1) {
            ticketTypeList[2].display = true;
            ticketTypeList[2].ticketPrice = 0;
        }
        let selectedIndex = 0;
        if (pas.isChild && ticketChild == 1) {
            selectedIndex = 1;
        }
        if (pas.isTakeChild && ticketTakeChild == 1) {
            selectedIndex = 2;
        }
        this.setData({
            pas,
            ticketChild: ticketChild == 1,
            ticketTakeChild: ticketTakeChild == 1,
            supportPassengerTypes,
            childTicketUnitSalePrice,
            ticketUnitSalePrice,
            ticketTypeList,
            selectedIndex,
            isNew: this.isNew,
        });

        if (showOcr == 1) {
            this.scanCard();
        }
    },
    scanCard() {
        cwx.component.ocr(
            {
                bizType: 'BUS',
                title: '证件识别',
            },
            (result) => {
                console.log('ocr result', result);

                if (result && result.idCardNo) {
                    this.data.pas.idcard.no = result.idCardNo.toUpperCase();
                    this.data.pas.idcard.CardNo = result.idCardNo.toUpperCase();
                    this.data.pas.cname = result.name;
                    this.data.pas.fromScan = true;
                    this.setData({
                        pas: this.data.pas,
                    });
                    this.showToast({
                        icon: 'none',
                        message: '识别成功, 请确认信息后保存',
                    });
                }
            }
        );
    },

    showNameTips() {
        this.setData({
            showType: 'name',
        });
    },
    hideNameTips() {
        this.setData({
            showType: '',
        });
    },
    showChildTips() {
        if (this.data.childTips) {
            this.setData({
                showType: 'child',
            });
        } else {
            this.showLoading();
            Pservice.getChildTicketDescription()
                .then((res) => {
                    console.log(res);
                    this.hideLoading();
                    var data = res.return;
                    this.setData({
                        childTips: data,
                        showType: 'child',
                    });
                })
                .catch((e) => {
                    this.hideLoading();
                    //  没有说明文案
                    console.log(e);
                });
        }
    },
    selectPassengerType(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            selectedIndex: index,
            'pas.isChild': index >= 1 ? 1 : 0,
            'pas.isTakeChild': index >= 2 ? 1 : 0,
        });
    },
    showCardType() {
        let self = this;
        let idcards = this.data.pas.idcards;
        if (this.data.supportPassengerTypes.length == 1) {
            return;
        }
        wx.showActionSheet({
            itemList: this.data.supportPassengerTypes,
            success: function (res) {
                if (res.cancel == true) {
                    return;
                }
                if (!res.tapIndex) res.tapIndex == 0;
                let txt = Object.keys(cardTypes)[res.tapIndex];
                let type = cardTypes[txt];
                let no = '';
                if (!self.isNew) {
                    let r = _.find(idcards, (c) => {
                        return c.CardType == type;
                    });

                    if (!!r) {
                        self.setData({
                            'pas.idcard': r,
                        });
                        return;
                    } else {
                    }
                }

                var idcard = {
                    CardType: type,
                    type: type,
                    text: txt,
                    no: no,
                    CardNo: no,
                };
                self.setData({
                    'pas.idcard': idcard,
                });
            },
        });
    },

    blurName(e) {
        this.data.pas.cname = e.detail.value;
        this.setData({
            pas: this.data.pas,
        });
    },

    inputFirstName(e) {
        this.data.pas.ENFirstName = e.detail.value;
        this.setData({ pas: this.data.pas });
    },
    inputNextFirst(e) {
        this.data.pas.ENFirstName = e.detail.value;
        this.setData({
            pas: this.data.pas,
        });
    },
    inputLastName(e) {
        this.data.pas.ENLastName = e.detail.value;
        this.setData({ pas: this.data.pas });
    },
    inputNextLast(e) {
        this.data.pas.ENLastName = e.detail.value;
        this.setData({
            pas: this.data.pas,
        });
    },
    inputName(e) {
        this.data.pas.cname = e.detail.value;
        this.setData({ pas: this.data.pas });
    },

    inputNext(e) {
        this.data.pas.cname = e.detail.value;
        this.setData({
            pas: this.data.pas,
        });
    },

    blurCardNum(e) {
        console.log(e.detail.value);
        this.data.pas.idcard.no = e.detail.value.toUpperCase();
        this.data.pas.idcard.CardNo = e.detail.value.toUpperCase();
        // 收起键盘
        if (e.detail.value.length == 18) {
            wx.hideKeyboard();
        }
        this.setData({
            pas: this.data.pas,
        });
    },

    inputCardNum(e) {
        console.log(e.detail.value);
        if (e.detail.value.indexOf('*') > 0 && !this.data.didEditPas) {
            this.data.pas.idcard.no = '';
            this.data.pas.idcard.CardNo = '';
        } else {
            this.data.pas.idcard.no = e.detail.value.toUpperCase();
            this.data.pas.idcard.CardNo = e.detail.value.toUpperCase();
        }

        // 收起键盘
        if (e.detail.value.length == 18) {
            wx.hideKeyboard();
        }

        this.setData({ pas: this.data.pas, didEditPas: true });
    },

    onTouchButton(e) {
        this.setData({
            focusCardNum: false,
        });
    },

    birthChange(e) {
        let date = e.detail.value;
        this.setData({
            'pas.birth': date,
        });
    },
    submit() {
        try {
            var code = this.validateInput();
            if (code != 0) {
                this.showMsg(errorCodes[code] || '乘客信息未保存');
                this.ubtTrace(100983, { errorCode: code });
                return;
            }
            this.submitPasInfo();
        } catch (err) {
            this.ubtTrace(100984, { errorMsg: '提交乘客 js报错' });
        }
    },
    validateInput() {
        let pas = this.data.pas;
        var code = 0;
        code = this.isOnlyCName() && this.checkCName();
        if (code != 0) return code;

        code = pas.idcard.type == 2 && this.checkEName();
        if (code != 0) return code;
        code = this.checkIdCard();
        if (code != 0) return code;

        if (pas.idcard.type == 1) {
            let str = (pas.idcard.CardNo || '').replace(
                /^\d{6}(\d{4})(\d{2})(\d{2}).+$/,
                '$1-$2-$3'
            );
            this.setData({
                'pas.birth': str,
            });
        }
        code = this.checkBirth();
        if (code != 0) return code;
        return 0;
    },
    checkCName() {
        let cname = this.data.pas.cname;
        const trimC = /[a-zA-Z0-9^.$()¦*+?]/;

        if (trimC.test(cname)) {
            return 2;
        }
        cname = cname.replace(/[^\u4e00-\u9fa5]/gi, '');
        const cNameReg = /^[\u4e00-\u9fa5]+[\u4e00-\u9fa5]{1,14}$/;
        if (!cname) {
            return 1;
        }
        if (!cNameReg.test(cname)) {
            return 2;
        }
        return 0;
    },
    checkEName() {
        const eNameReg = /^[a-zA-Z]+$/i;
        if (this.data.pas.ENFirstName) {
            if (!eNameReg.test(this.data.pas.ENFirstName)) {
                return 7;
            }
        } else {
            return 9;
        }
        if (this.data.pas.ENLastName) {
            if (!eNameReg.test(this.data.pas.ENLastName)) {
                return 8;
            }
        } else {
            return 10;
        }
        return 0;
    },

    isOnlyCName() {
        return parseInt(this.data.pas.idcard.type) == 1;
    },
    checkIdCard() {
        let pas = this.data.pas;
        let cardType = pas.idcard.CardType || pas.idcard.type;
        let no = pas.idcard.CardNo;
        const trReg = /^[a-z0-9]{6,20}$/i;
        if (!no) {
            return 3;
        }
        // 身份证
        if (cardType == 1) {
            if (!(no.length == 18 && util.isIdCard(no))) {
                return 4;
            }
        } else if (cardType == 2) {
            if (!trReg.test(no)) {
                return 4;
            }
        }
        return 0;
    },
    checkBirth() {
        var oneDay = 24 * 3600 * 1000;
        var pas = this.data.pas;
        var birth = pas.birth;
        var cardType = pas.idcard.CardType || pas.idcard.type;
        if (cardType != 1) return 0;
        if (cDate.parse(birth).getTime() > new Date().getTime()) {
            return 4;
        }

        if (this.data.pas.isTakeChild) {
            var now = new Date().getTime();
            var birthTime = cDate.parse(birth).getTime();
            var birthDays = (now - birthTime) / oneDay;
            if (birthDays > 6 * 365 || birthDays < 30) {
                return 6;
            }
        }
        if (this.data.pas.isChild) {
            var now = new Date().getTime();
            var birthTime = cDate.parse(birth).getTime();
            var birthDays = (now - birthTime) / oneDay;
            if (birthDays > 16 * 365 || birthDays < 30) {
                return 5;
            }
        }
        return 0;
    },

    showChildDialog(message) {
        this.hideLoading();
        let cancalSubmit = () => {
            this.inLoading = false;
        };
        let reSubmit = () => {
            cancalSubmit();
            this.submitPasInfo(true);
        };
        cwx.showModal({
            title: '儿童监护人确认',
            content: message,
            confirmText: '继续保存',
            cancelText: '暂缓',
            success: function (res) {
                if (res.confirm) {
                    console.log('继续保存');
                    reSubmit();
                } else if (res.cancel) {
                    console.log('暂缓');
                    cancalSubmit();
                }
            },
        });
    },

    submitPasInfo(confirmedChild) {
        if (this.inLoading) {
            return;
        }

        this.inLoading = true; //加锁
        let pas = this.data.pas;

        pas.ptypeText = pas.isTakeChild
            ? ' 携童票 '
            : pas.isChild
            ? ' 儿童票 '
            : ' 成人票 ';
        pas.PassengerType = pas.isTakeChild ? 'X' : pas.isChild ? 'C' : 'A';
        pas.cname = pas.cname.replace(/[^\u4e00-\u9fa5]/gi, '');
        pas.EName = pas.ENFirstName + ' ' + pas.ENLastName;
        pas.firstname = pas.ENFirstName;
        pas.lastname = pas.ENLastName;
        pas.name =
            pas.idcard.type == 2
                ? pas.EName || pas.cname
                : pas.cname || pas.EName;

        var index = pas.idcards.findIndex((item) => {
            return item.CardType == pas.idcard.CardType;
        });
        if (index < 0) {
            pas.idcards.push(pas.idcard);
        }
        BusShared.newBusPassenger = pas;

        var self = this;
        let cb = (data) => {
            var tips;
            var icons;
            if (data && data.code === 1) {
                tips = '保存乘客信息成功！';
                icons = 'success';
            } else {
                tips = '保存乘客信息失败！';
                icons = 'error';
            }
            self.hideLoading();
            this.inLoading = false; //解锁

            this.showToast(
                {
                    message: tips,
                    icon: icons,
                },
                () => {
                    cwx.navigateBack();
                    Passenger.PassengerData.setNeedUpdate();
                }
            );
        };
        self.showLoading('正在保存乘客信息...');
        Passenger.UpdatePassenger(
            { passenger: pas, isNew: this.isNew, confirmedChild },
            function (data) {
                if (data && data.code === 1) {
                    console.log(data);
                    cb.call(self, data);
                } else {
                    cb.call(self);
                    self.ubtTrace(
                        100871,
                        {
                            postData: { passenger: pas, isNew: this.isNew },
                            returnData: data,
                        } || {
                            msg: '数据错误',
                        }
                    );
                }
            },
            function (err) {
                if (err.code === 0) {
                    if (err.confirmedChild) {
                        self.showChildDialog(err.message);
                    }
                } else {
                    cb.call(self);
                    self.ubtTrace(100871, err);
                }
            }
        );
    },
    onReady() {
        let title = this.data.pas.PassengerID ? '编辑乘客' : '新增乘客';
        cwx.setNavigationBarTitle({
            title: title,
        });
    },
};

CPage(page);
