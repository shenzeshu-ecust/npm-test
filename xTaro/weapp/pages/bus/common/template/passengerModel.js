import { _, cwx, CPage, Pservice, EventManager } from '../../index.js';

const cardTypes = {
    1: '身份证',
    2: '护照',
    7: '回乡证',
    8: '台胞证',
    4: '军官证',
};

const cardTypesName = {
    身份证: 1,
    护照: 2,
    回乡证: 7,
    台胞证: 8,
    军官证: 4,
};

//生成调接口参数
var MakeSoaParam = function (pid, index, scope) {
    var ParameterList = [];
    var ParameterItem;
    ParameterItem = { Key: 'BizType', Value: 'BUS' };
    ParameterList.push(ParameterItem);
    ParameterItem = { Key: 'BookingType', Value: 'B' };
    ParameterList.push(ParameterItem);
    ParameterList.push({
        Key: 'CipherDataType',
        Value: '1',
    });
    ParameterList.push({
        Key: 'ResultDataType',
        Value: '1',
    });
    var paramsoa = { ParameterList: ParameterList };
    return paramsoa;
};

function createRequest(url, Adata) {
    return function (data, successCallback, failCallback, scope) {
        Pservice.soaFetch(
            url,
            data || Adata,
            successCallback,
            failCallback,
            scope
        );
    };
}

function savePassengersToStore(passengerList, callback) {
    cwx.setStorage({
        key: 'BUS_SELECT_PASSENGETS',
        data: passengerList,
    });
    callback && callback();
}

function getPassengersFromStore() {
    return cwx.getStorageSync('BUS_SELECT_PASSENGETS') || [];
}

let PassengerUtil = {
    checkDeletable(pas, all) {
        let hasChild = false,
            hasAdult = false;
        let allPas = all;

        if (pas.isChild == 1 || pas.isTakeChild == 1) {
            return true;
        }

        var takeChilds = [];
        var aldults = [];
        var childs = [];
        _.each(allPas, (p) => {
            if (p.passengerType == 'A' || p.PassengerType == 'A') {
                aldults.push(p);
            }
            if (p.passengerType == 'X' || p.PassengerType == 'X') {
                takeChilds.push(p);
            }
            if (p.passengerType == 'C' || p.PassengerType == 'C') {
                childs.push(p);
            }
        });
        hasChild = childs.length > 0 || takeChilds.length > 0;

        aldults = aldults.filter((p) => {
            var passID = pas.PassengerID || pas.id;
            if (passID) {
                var pssengerid = p.PassengerID || p.id;
                return passID != pssengerid;
            } else {
                return (
                    p.cname &&
                    p.cname != pas.cname &&
                    p.idcard.CardNo != pas.idcard.CardNo
                );
            }
        });
        hasAdult = aldults.length > 0;

        return hasChild ? hasAdult : true;
    },
    isIdCard(idCard) {
        var num = idCard.toLowerCase().match(/\w/g);
        if (idCard.match(/^\d{17}[\dx]$/i)) {
            var sum = 0,
                times = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            for (var i = 0; i < 17; i++) {
                sum += parseInt(num[i], 10) * times[i];
            }
            if ('10x98765432'.charAt(sum % 11) != num[17]) {
                return false;
            }
            return !!idCard.replace(
                /^\d{6}(\d{4})(\d{2})(\d{2}).+$/,
                '$1-$2-$3'
            );
        }
        if (idCard.match(/^\d{15}$/)) {
            return !!idCard.replace(
                /^\d{6}(\d{2})(\d{2})(\d{2}).+$/,
                '19$1-$2-$3'
            );
        }
        return false;
    },
    isChildPas: function (birth) {
        let isChild = false;
        try {
            let now = +new Date();
            let birthTime = +new Date(birth);
            let span = (now - birthTime) / (24 * 60 * 60 * 1000);

            if (span < 16 * 365) {
                isChild = true;
            }
        } catch (e) {}

        return isChild;
    },
    handleMemPas: function (data, filterParam) {
        let members = [];
        _.each(data, (p) => {
            var psg = p;
            let pasIds = p.CommonPassengerCard;
            // 过滤不支持的证件类型
            var supportPassengerTypes = filterParam.supportPassengerTypes;
            let cardIds = [];
            _.each(pasIds, (c) => {
                if (c.CardType === '1') {
                    c.no = (c.CardNo || '').replace(
                        /^(\d{4})(.{11})(\w{3})/g,
                        function () {
                            let args = arguments;
                            return `${args[1]}${args[2].replace(/./g, '*')}${
                                args[3]
                            }`;
                        }
                    );
                } else if (c.CardType === '2') {
                    c.no = (c.CardNo || '').replace(
                        /^(\w{1})(.*)/g,
                        function () {
                            let args = arguments;
                            return `${args[1]}${args[2].replace(/./g, '*')}`;
                        }
                    );
                } else {
                    c.no = c.CardNo || '';
                }
                c.text = cardTypes[c.CardType];
                c.type = c.CardType;
                supportPassengerTypes.indexOf(c.text) >= 0 &&
                    c.CardNo &&
                    cardTypes[c.CardType] &&
                    cardIds.push(c);
            });
            pasIds = cardIds;
            // 证件类型排序
            pasIds = _.sortBy(pasIds, 'CardType');
            psg.CommonPassengerCard = pasIds;
            psg.idcards = pasIds;
            let defaultCard = pasIds[0] || {};
            psg.idcard = defaultCard;
            if (
                !psg.PassengerType ||
                (psg.PassengerType != 'A' &&
                    psg.PassengerType != 'C' &&
                    psg.PassengerType != 'X')
            ) {
                psg.PassengerType = 'A';
            }
            psg.isChild = psg.PassengerType == 'C' ? 1 : 0;
            psg.isTakeChild = psg.PassengerType == 'X' ? 1 : 0;
            psg.birth = psg.Birthday;
            psg.id = psg.PassengerID;
            psg.ptypeText = psg.isTakeChild
                ? ' 携童票 '
                : psg.isChild
                ? ' 儿童票 '
                : ' 成人票 ';
            psg.cname = psg.CNName;
            psg.EName = psg.ENFirstName + ' ' + psg.ENLastName;
            psg.name =
                psg.idcard.type == 2
                    ? psg.EName || psg.cname
                    : psg.cname || psg.EName;
            if (p.EXT) {
                var ext = JSON.parse(p.EXT);
                psg.isSelf = ext.IsSelf == 1 ? true : false;
            }
            members.push(psg);
        });
        return members;
    },
    sortMemPas: function (data) {
        let all = [];

        let validPas = data.filter((p) => {
            return p.idcard.text && p.idcard.CardNo;
        });
        let isSelf = validPas.filter((p) => {
            return p.isSelf;
        });
        let notSelf = validPas.filter((p) => {
            return !p.isSelf;
        });
        let invalidPas = data.filter((p) => {
            return !(p.idcard.text || p.idcard.CardNo);
        });
        all = [].concat(isSelf).concat(notSelf).concat(invalidPas);
        return { passengerList: all, hasSelf: isSelf.length > 0 };
    },
    checkAddable(all) {
        return _.find(all, (p) => !p.isChild);
    },
};

/**
 * 保存常用旅客信息
 * @param mParams
 * @param opts
 */
let UpdatePassenger = function (data, success, fail, scope) {
    let pas = data.passenger;
    let cipherData = pas.cipherData ? '1' : '0';
    let isNew = data.isNew;
    let type = 0;
    let id = '';
    if (pas.pasID || pas.PassengerID) {
        id += pas.pasID || pas.PassengerID;
    }

    let rData = {
        birthday: pas.birth,
        cnName: pas.cname,
        enFirstName: pas.firstname || '',
        enLastName: pas.lastname || '',
        id,
        passengerType: pas.isTakeChild ? 'X' : pas.isChild ? 'C' : 'A',
    };

    let cardNum = pas.idcard.CardNo;
    rData.cards = [];
    let rModel = {
        cardType: `${pas.idcard.type}`,
        cardNo: cardNum || '',
        cardTimeLimit: '',
    };

    rData.cards.push(rModel);

    const params = {
        data: rData,
        type,
        confirmedChild: data.confirmedChild,
        version: 0,
    };
    var updPassengers = createRequest('/restapi/soa2/14338/savePassenger.json');
    updPassengers(
        params,
        function (data) {
            data = data || {};

            if (data.code !== 1) {
                fail && fail.call(scope || self, data || '更新乘客信息失败');
                return;
            }
            success && success.call(scope || self, data);
        },
        function (error) {
            fail && fail.call(scope || self, error || '更新乘客信息失败');
        }
    );
};

function addUserSelf({ name, cardType = '身份证', idnocipher }) {
    var pas = {
        takeChild: 0,
        isChild: 0,
        PassengerID: 0,
        cipherData: '1',
        isSelf: true,
        cname: name,
        idcard: {
            type: 1,
            text: '身份证',
            no: idnocipher,
        },
        idcards: [],
    };

    return new Promise(function (resolve, reject) {
        var data = { passenger: pas, isNew: true };
        UpdatePassenger(
            data,
            (res) => {
                resolve(res);
            },
            (err) => {
                reject(err);
            }
        );
    });
}

// 常旅列表
let CommonPassengerList = function (success, fail, scope, param) {
    var request = createRequest(
        '/restapi/soa2/14606/GetCommonPassenger.json',
        MakeSoaParam()
    );

    request(
        undefined,
        function (data) {
            if (data.commonPassengers) {
                const formatPassengersList = data.commonPassengers.map(
                    (item) => {
                        const psg = {};
                        for (const [key, value] of Object.entries(item)) {
                            const k = key[0].toUpperCase() + key.substr(1);
                            psg[k] = value;
                            const CommonPassengerCard = [];
                            const { commonPassengerCardList } = item;
                            if (
                                commonPassengerCardList &&
                                commonPassengerCardList.length
                            ) {
                                commonPassengerCardList.forEach((cpl) => {
                                    let cplItem = {};
                                    for (const [key1, value1] of Object.entries(
                                        cpl
                                    )) {
                                        const k1 =
                                            key1[0].toUpperCase() +
                                            key1.substr(1);
                                        cplItem[k1] = value1;
                                    }
                                    CommonPassengerCard.push(cplItem);
                                });
                            }
                            psg['CommonPassengerCard'] = CommonPassengerCard;
                        }
                        return psg;
                    }
                );

                let memberPas = PassengerUtil.handleMemPas(
                    formatPassengersList,
                    param
                );
                var { passengerList, hasSelf } =
                    PassengerUtil.sortMemPas(memberPas);
                success.call(scope || this, {
                    passengerList,
                    hasSelf,
                });
            } else {
                fail.call(scope || this, { code: -1, message: 'no data' });
            }
        },
        function (error) {
            fail.call(scope || this, error);
        },
        this
    );
};

let SubmitUpdatePassenger = function (data, success, fail, scope) {
    var request = createRequest(
        '/restapi/soa2/10820/GetCommonPassenger.json',
        MakeSoaParam()
    );
    request();
};

function inCommonPassengers(passId, commonPassengerIdList) {
    return (
        commonPassengerIdList['' + passId] &&
        commonPassengerIdList['' + passId].idcard &&
        commonPassengerIdList['' + passId].idcard.text &&
        commonPassengerIdList['' + passId].idcard.CardNo
    );
}

function commonPassengerIdList(commonPassengerList) {
    var passengersById = {};
    commonPassengerList.forEach((item) => {
        passengersById['' + item.PassengerID] = item;
    });
    return passengersById;
}

var splitArray = (arr, len) => {
    var a_len = arr.length;
    var result = [];
    for (var i = 0; i < a_len; i += len) {
        result.push(arr.slice(i, i + len));
    }
    return result;
};

function resetChoosen(
    passList = [],
    passengerList = [],
    sliceLength = 4,
    sliceLine = 1
) {
    let allPassList = passList.map((p) => '' + p.id);
    passengerList.forEach((p) => {
        if (allPassList.indexOf(p.id + '') > -1) {
            var card = p.idcards.find((item) => {
                return (
                    item.CardNo ==
                    passList[allPassList.indexOf(p.id + '')].cardNum
                );
            });
            if (card) {
                p.idcard = card;
            }
            p.name =
                p.idcard && p.idcard.type == 2
                    ? p.EName || p.cname
                    : p.cname || p.EName;
            if (card) {
                p.chosen = true;
            } else {
                p.chosen = false;
            }
        } else {
            p.chosen = false;
        }
    });

    var passengerListSlice = splitArray(passengerList, sliceLength);

    if (passengerListSlice.length > 0) {
        var lastSlice = passengerListSlice[passengerListSlice.length - 1];
        if (lastSlice.length < sliceLength) {
            lastSlice.splice(lastSlice.length, 0, { name: 'mock' });
        } else {
            passengerListSlice.push([
                {
                    name: 'mock',
                },
            ]);
        }
    } else {
        passengerListSlice.push([
            {
                name: 'mock',
            },
        ]);
    }

    var passengerMinSlice = [];
    if (passengerListSlice.length <= sliceLine) {
        passengerMinSlice = passengerListSlice.slice();
    } else {
        passengerMinSlice = cwx.util.copy(
            passengerListSlice.slice(0, sliceLine)
        );
        passengerMinSlice[sliceLine - 1].splice(sliceLength - 1, 1, {
            name: 'mock',
        });
    }

    var ticketPicker = null;
    passList.forEach((item) => {
        if (!ticketPicker && item.passengerType == 'A') {
            ticketPicker = item;
        }
    });
    let isSelectChild = false;
    passList.forEach((item) => {
        if (item.child) {
            isSelectChild = true;
        }
    });

    return {
        passengerMinSlice,
        passengerListSlice,
        passengerList,
        ticketPicker,
        isSelectChild,
    };
}

function GetPassengerList(rule, sliceLine = 1) {
    return new Promise(function (resolve, reject) {
        CommonPassengerList(
            function (data) {
                if (data) {
                    resolve(data);
                }
            },
            function (error) {
                resolve({
                    passengerList: [],
                    passengerMinSlice: [],
                    passengerListSlice: [],
                    ticketPicker: null,
                    isSelectChild: false,
                });
            },
            this,
            {
                supportPassengerTypes: rule?.supportPassengerIdentityTypes || [
                    '身份证',
                ],
            }
        );
    }).then(({ passengerList, hasSelf }) => {
        var passList = getPassengersFromStore();
        var commonIdList = commonPassengerIdList(passengerList);

        passList = passList.filter((item) => {
            return inCommonPassengers(item.id, commonIdList);
        });

        passList.forEach((item, index) => {
            let commonPassenger = commonIdList['' + item.id];
            passList[index] = getPassengerInfo(commonPassenger);
        });

        var passenger = resetChoosen(passList, passengerList, 4, sliceLine);
        return {
            passList,
            hasSelf,
            ...passenger,
        };
    });
}

function getPassengerInfo(item) {
    // 身份证
    var cardInfo = item.idcard;
    return {
        birthDay: item.Birthday,
        type: item.ptypeText,
        passengerType: item.PassengerType,
        name: cardInfo.CardType == 2 ? item.name : item.cname || item.name,
        id: item.PassengerID,
        cardName: cardInfo.text || '身份证',
        cardNum: cardInfo.CardNo || '',
        no: cardInfo.no || '',
        child: item.Child,
        eNLastName: item.ENLastName || '',
        eNFirstName: item.ENFirstName || '',
        cardType: cardInfo.CardType || '',
        countryCode: item.CountryCode || '',
        contactEmail: item.contactEmail || '',
        nationality: item.Nationality || '',
        cardTimelimit: cardInfo.CardTimelimit || '',
        idType: cardInfo.type || '',
        mobile: item.MobilePhone || '',
    };
}

const PassengerData = Object.create(
    {
        setOptions({ rule, sliceLine }) {
            this.rule = rule;
            this.sliceLine = sliceLine;
        },

        data: {},

        update(data = {}) {
            this.data = { ...data };
        },
        setNeedUpdate() {
            GetPassengerList(this.rule, this.sliceLine).then((data) => {
                this.update(data);
                EventManager.emit('passengerDataChange', this);
            });
        },
        ObserverPassengerDataChange: function (callback) {
            return ObserverPassengerDataChange(
                { rule: this.rule, sliceLine: this.sliceLine },
                callback
            );
        },
        choosePassenger(pas, callback) {
            if (typeof pas !== 'object') {
                for (let i = 0; i < this.data.passengerList.length; i++) {
                    if (this.data.passengerList[i].id == pas) {
                        pas = this.data.passengerList[i];
                        break;
                    }
                }
            } else {
                for (let i = 0; i < this.data.passengerList.length; i++) {
                    if (this.data.passengerList[i].id == pas.id) {
                        pas = this.data.passengerList[i];
                        break;
                    }
                }
            }

            var tempList = [];
            var takeChilds = [];
            var aldults = [];
            var childs = [];
            _.each(this.data.passengerList, (p) => {
                if (p.chosen) {
                    tempList.push(p);
                    if (p.PassengerType == 'A') {
                        aldults.push(p);
                    }
                    if (p.PassengerType == 'X') {
                        takeChilds.push(p);
                    }
                    if (p.PassengerType == 'C') {
                        childs.push(p);
                    }
                }
            });
            var errMessage = '';
            if (!(pas.idcard && pas.idcard.text && pas.idcard.CardNo)) {
                callback &&
                    callback({
                        errMessage: errMessage,
                        toEdit: true,
                    });
                return;
            }
            let rule = this.rule;

            if (pas.chosen) {
                if (!PassengerUtil.checkDeletable(pas, tempList)) {
                    errMessage = '儿童不能单独出行，请先删除儿童。';
                } else {
                    if (pas.PassengerType == 'A') {
                        if (!(aldults.length > takeChilds.length)) {
                            errMessage = '成人不能比携童数量少';
                        } else {
                            pas.chosen = false;
                        }
                    } else {
                        pas.chosen = false;
                    }
                }
            } else {
                if (pas.isTakeChild) {
                    if (!rule.isSaleTakeChildTicket) {
                        errMessage = '该车次不支持免票携童';
                    } else if (
                        !(takeChilds.length < rule.supportTakeChildNumber)
                    ) {
                        errMessage = '携童超过限定数量';
                    } else if (!(takeChilds.length < aldults.length)) {
                        errMessage = '携童数量不能超过成人';
                    } else {
                        pas.chosen = true;
                    }
                } else {
                    if (pas.isChild && !rule.isSaleChildTicket) {
                        errMessage = '该车次不支持儿童票';
                    } else if (
                        pas.isChild &&
                        !PassengerUtil.checkAddable(tempList)
                    ) {
                        errMessage = '儿童不能单独出行，请先添加成人';
                    } else if (!(tempList.length < rule.maxSaleTicketNumber)) {
                        errMessage = `一个订单最多只能添加${rule.maxSaleTicketNumber}名乘客，超过请分批购买`;
                    } else {
                        pas.chosen = true;
                    }
                }
            }
            EventManager.emit('passengerDataChange', this);
            if (errMessage) {
                callback &&
                    callback({
                        errMessage,
                        toEdit: false,
                    });
            }
        },
        resetChoosen(passList) {
            var passengers = resetChoosen(
                passList,
                (this.data && this.data.passengerList) || [],
                4,
                this.sliceLine
            );
            this.update({
                passList,
                hasSelf: this.data.hasSelf,
                ...passengers,
            });
            savePassengersToStore(passList);
            EventManager.emit('passengerDataChange', this);
        },
    },
    {}
);

function ObserverPassengerDataChange({ rule, sliceLine }, callback) {
    let callbackFunc = (data) => {
        callback && callback(data);
    };
    EventManager.on('passengerDataChange', callbackFunc);
    return () => {
        EventManager.off('passengerDataChange', callbackFunc);
    };
}

export default {
    CommonPassengerList,
    GetPassengerList,
    PassengerData,
    ObserverPassengerDataChange,
    PassengerUtil,
    UpdatePassenger,
    addUserSelf,
    savePassengersToStore,
    getPassengersFromStore,
    resetChoosen,
    getPassengerInfo,
    cardTypes,
    cardTypesName,
};

export {
    CommonPassengerList,
    GetPassengerList,
    PassengerData,
    ObserverPassengerDataChange,
    PassengerUtil,
    UpdatePassenger,
    addUserSelf,
    savePassengersToStore,
    getPassengersFromStore,
    resetChoosen,
    getPassengerInfo,
    cardTypes,
    cardTypesName,
};
