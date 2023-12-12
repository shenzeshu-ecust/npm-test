import { cwx, CPage } from '../../../../cwx/cwx.js';
var passengerUtils = require('../../passengerUtils.js');

var cardsData = [{ "cardTypeCode": 1, "cNName": "身份证", "eNName": "ID", "cardNo": "", "cardTimelimit": "", "sort": "1", "isselected": 1, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "idcard",isCardTimelimitSelected:1},
  { "cardTypeCode": 2, "cNName": "护照", "eNName": "PASSPORT", "cardNo": "", "cardTimelimit": "", "sort": "2", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 1},
  { "cardTypeCode": 8, "cNName": "台胞证", "eNName": "MTP", "cardNo": "", "cardTimelimit": "", "sort": "3", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 7, "cNName": "回乡证", "eNName": "RP", "cardNo": "", "cardTimelimit": "", "sort": "4", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 4, "cNName": "军人证", "eNName": "MTC", "cardNo": "", "cardTimelimit": "", "sort": "5", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 10, "cNName": "港澳通行证", "eNName": "HMP", "cardNo": "", "cardTimelimit": "", "sort": "6", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 25, "cNName": "户口簿", "eNName": "RBT", "cardNo": "", "cardTimelimit": "", "sort": "7", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "idcard", isCardTimelimitSelected: 0},
  { "cardTypeCode": 27, "cNName": "出生证明", "eNName": "BRC", "cardNo": "", "cardTimelimit": "", "sort": "8", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 28, "cNName": "外国人永久居留身份证", "eNName": "FPC", "cardNo": "", "cardTimelimit": "", "sort": "9", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 22, "cNName": "台湾通行证", "eNName": "TP", "cardNo": "", "cardTimelimit": "", "sort": "10", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 23, "cNName": "士兵证", "eNName": "SOC", "cardNo": "", "cardTimelimit": "", "sort": "11", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 24, "cNName": "临时身份证", "eNName": "TID", "cardNo": "", "cardTimelimit": "", "sort": "12", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 26, "cNName": "警官证", "eNName": "PLC", "cardNo": "", "cardTimelimit": "", "sort": "13", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 20, "cNName": "外国人永久居留证", "eNName": "PRC", "cardNo": "", "cardTimelimit": "", "sort": "14", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0 },
  { "cardTypeCode": 11, "cNName": "国际海员证", "eNName": "ISC", "cardNo": "", "cardTimelimit": "", "sort": "15", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0 },
  { "cardTypeCode": 21, "cNName": "旅行证件", "eNName": "TC", "cardNo": "", "cardTimelimit": "", "sort": "16", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0 },
  { "cardTypeCode": 3, "cNName": "学生证", "eNName": "STC", "cardNo": "", "cardTimelimit": "", "sort": "17", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0 },
  { "cardTypeCode": 6, "cNName": "驾驶证", "eNName": "DRLC", "cardNo": "", "cardTimelimit": "", "sort": "18", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 29, "cNName": "美国驾照", "eNName": "ADLC", "cardNo": "", "cardTimelimit": "", "sort": "19", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 30, "cNName": "俄籍国内护照", "eNName": "RPASSPORT", "cardNo": "", "cardTimelimit": "", "sort": "20", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 31, "cNName": "海外当地旅行证件", "eNName": "IBUC", "cardNo": "", "cardTimelimit": "", "sort": "21", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 32, "cNName": "港澳台居民居住证", "eNName": "HKMOTWRP", "cardNo": "", "cardTimelimit": "", "sort": "22", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0},
  { "cardTypeCode": 99, "cNName": "其它", "eNName": "OTHER", "cardNo": "", "cardTimelimit": "", "sort": "98", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "number", isCardTimelimitSelected: 0},
  { "cardTypeCode": 0, "cNName": "未知", "eNName": "NA", "cardNo": "", "cardTimelimit": "", "sort": "99", "isselected": 0, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "text", isCardTimelimitSelected: 0}];

CPage({
  pageId: '10650016066',
  checkPerformance:true, // 白屏检测标志位
  data: {
    soaSaveUrl: '/restapi/soa2/16088/savePassenger.json',
    allCards: [],
    allCardCode: [],
    allCardName: [],
    passengerCards: [{ "cardTypeCode": 1, "cNName": "身份证", "eNName": "ID", "cardNo": "", "cardTimelimit": "", "sort": "1", "isselected": 1, isShowCardNo: 0, isShowCardTimelimit: 0, cardNoKeyBoard: "idcard",isCardTimelimitSelected: 1 }],
    oPassenger: { cnName: "", enFirstName: "", enLastName: "", birthday: "", gender: "M", nationality: "CN", viewNationality: "中国大陆", viewCountry:"", countryCode:"86",mobilePhone: ""},
    isShowError: { isShowCNName: 0, cnNameMsg: "", isShowSurname: 0, enLastNameMsg: "", isShowGivenname: 0, enFirstNameMsg: "", isShowBirthday: 0, birthdayMsg: "", isShowMobile: 0, mobilePhoneMsg: "", isShowCard: 0, cardMsg: "", isShowNationality: 0, nationalityMsg:""},
    isClearTap: { isCnNameClearTap: 0, isEnLastNameClearTap: 0, isEnFirstNameClearTap: 0},
    c1:"",
    addPassengers:[],
    toView: ["passengertip"]
  },
  onLoad: function (options){
    var reqc1="";
    var param = options.data || options;
    if (param!=null){
      reqc1=param.c1||"";
    }
    this.setData({ c1: reqc1});
    console.log("c1:", reqc1);
  },
  // 页面渲染完成
  onReady: function () {
    //重置项目红色状态
    this.resetItemStat();
    this.initCards();
  },
  onShow: function () { },
  onHide: function () { },
  onUnload: function () { },
  //中文名改变
  cnnameChange: function (e) {
    this.data.oPassenger.cnName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger });
    this.data.isClearTap.isCnNameClearTap = 1;
    this.setData({ isClearTap: this.data.isClearTap });
  },
  //英文last改变
  enlastnameChange: function (e) {
    this.data.oPassenger.enLastName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger });
    this.data.isClearTap.isEnLastNameClearTap = 1;
    this.setData({ isClearTap: this.data.isClearTap });
  },
  //英文first/middle改变
  enfirstnameChange: function (e) {
    this.data.oPassenger.enFirstName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger });
    this.data.isClearTap.isEnFirstNameClearTap = 1;
    this.setData({ isClearTap: this.data.isClearTap });
  },
  //添加证件类型(显示浮层)
  selectedCard: function (e) {
    var self = this;
    if (e.detail.value > -1) {
      var tcardType = this.data.allCardCode[e.detail.value];
      var allCardCode =[];
      var allCardName =[];
      for (var i = 0; i < this.data.allCards.length; i++) {
        if (this.data.allCards[i].cardTypeCode == "1" || this.data.allCards[i].cardTypeCode == "25"){
          this.data.allCards[i].cardNoKeyBoard = "idcard";
        } else if (this.data.allCards[i].cardTypeCode == "99"){
          this.data.allCards[i].cardNoKeyBoard ="number";
        }else{
          this.data.allCards[i].cardNoKeyBoard = "text";
        }
        if (this.data.allCards[i].cardTypeCode == tcardType) {
          this.data.allCards[i].isselected = 1;
          this.data.passengerCards.push(this.data.allCards[i]);
        } else if (this.data.allCards[i].isselected == 0) {
          allCardCode.push(this.data.allCards[i].cardTypeCode);
          allCardName.push(this.data.allCards[i].cNName);
        }
      }
      this.setData({ allCards: this.data.allCards, allCardCode: allCardCode, allCardName: allCardName });
      this.setData({ passengerCards: this.data.passengerCards });
      //设置国籍
      this.setPassengerNationality();
    }
  },
  //移除当前证件
  removeCard:function(e){
    var self=this;
    var tcardType = e.currentTarget.dataset.cardtypeid;
    var checkcardno=true;
    var cardCName="";
    for (var t = 0; t < self.data.passengerCards.length; t++) {
      if (self.data.passengerCards[t].cardNo != null && this.data.passengerCards[t].cardNo.length > 0 && self.data.passengerCards[t].cardTypeCode == tcardType){
        if (self.data.passengerCards[t].cardTypeCode == "1" || this.data.passengerCards[t].cardTypeCode == "25") {
          if (passengerUtils.identityCodeValid(this.data.passengerCards[t].cardNo)) {
            cardCName = self.data.passengerCards[t].cNName;
            checkcardno=false;
            break;
          }
        } else if (self.data.passengerCards[t].cardTypeCode == "2" || self.data.passengerCards[t].cardTypeCode == "8" || self.data.passengerCards[t].cardTypeCode == "7" || self.data.passengerCards[t].cardTypeCode == "4" || self.data.passengerCards[t].cardTypeCode == "10" || self.data.passengerCards[t].cardTypeCode == "22" || this.data.passengerCards[t].cardTypeCode == "27") {
          if (self.checkPassengerCard(self.data.passengerCards[t].cardNo)) {
            cardCName = self.data.passengerCards[t].cNName;
            checkcardno = false;
            break;
          }
        }else{
          cardCName = self.data.passengerCards[t].cNName;
          checkcardno = false;
          break;
        }
      }
    }
    if (checkcardno){
      this.removePassengerCards(tcardType);
    }else{
      cwx.showModal({
        title: '提示',
        content: "确定删除" + cardCName,
        confirmText: "确定",
        showCancel: true,
        success: function (res) {
          if (res.confirm) {
            self.removePassengerCards(tcardType);
          }
          if (res.cancel) {}
        }
     })
    }
  },
  removePassengerCards: function (tcardType){
    var allCardCode = [];
    var allCardName = [];
    for (var i = 0; i < this.data.allCards.length; i++) {
      if (this.data.allCards[i].cardTypeCode == tcardType) {
        this.data.allCards[i].isselected = 0;
      }
      if (this.data.allCards[i].isselected == 0) {
        allCardCode.push(this.data.allCards[i].cardTypeCode);
        allCardName.push(this.data.allCards[i].cNName);
      }
    }
    var tmpcard = [];
    for (var j = 0; j < this.data.passengerCards.length; j++) {
      if (this.data.passengerCards[j].cardTypeCode != tcardType) {
        tmpcard.push(this.data.passengerCards[j]);
      }
    }
    this.setData({ allCards: this.data.allCards, allCardCode: allCardCode, allCardName: allCardName });
    this.setData({ passengerCards: tmpcard });
    //设置国籍
    this.setPassengerNationality();
  },
  setPassengerNationality: function () {
    var self=this;
    var tNationality = this.getPassengerNationality();
    if (tNationality == "CN") {
      self.data.oPassenger.nationality = "CN";
      self.data.oPassenger.viewNationality = "中国大陆";
      this.setData({ oPassenger: self.data.oPassenger });
    } else if (tNationality == "TW") {
      self.data.oPassenger.nationality = "TW";
      self.data.oPassenger.viewNationality = "中国台湾";
      this.setData({ oPassenger: self.data.oPassenger });
    } else if (tNationality == "HK") {
      self.data.oPassenger.nationality = "HK";
      self.data.oPassenger.viewNationality = "中国香港";
      this.setData({ oPassenger: self.data.oPassenger });
    } else {
      self.data.oPassenger.nationality = "";
      self.data.oPassenger.viewNationality = "";
      this.setData({ oPassenger: self.data.oPassenger });
    }
  },
  getPassengerNationality: function () {
    var self = this;
    var tNationality = "";
    var isdefault = false;
    if (this.data.passengerCards != null && this.data.passengerCards.length > 0) {
      var temp1 = this.data.passengerCards.filter(o => o.cardTypeCode == "1");
      var temp2 = this.data.passengerCards.filter(o => o.cardTypeCode == "25");
      var temp3 = this.data.passengerCards.filter(o => o.cardTypeCode == "10");
      var temp4 = this.data.passengerCards.filter(o => o.cardTypeCode == "25");
      var temp5 = this.data.passengerCards.filter(o => o.cardTypeCode == "27");
      if ((temp1 != null && temp1.length > 0) || (temp2 != null && temp2.length > 0) || (temp3 != null && temp3.length > 0) || (temp4 != null && temp4.length > 0) || (temp5 != null && temp5.length > 0)) {
        tNationality = "CN";
        isdefault = true;
      }
      if (!isdefault) {
        var temp = this.data.passengerCards.filter(o => o.cardTypeCode == "8");
        if (temp != null && temp.length > 0) {
          tNationality = "TW";
          isdefault = true;
        }
      }
      if (!isdefault) {
        temp = this.data.passengerCards.filter(o => o.cardTypeCode == "7");
        if (temp != null && temp.length > 0) {
          tNationality = "HK";
          isdefault = true;
        }
      }
      if (!isdefault) {
        tNationality="";
      }
    }
    return tNationality;
  },
  //证件号改变
  changeCardNo: function (e) {
    var tcardType = e.currentTarget.dataset.cardid;
    var no = e.detail.value;
    for (var i = 0; i < this.data.passengerCards.length; i++) {
      if (this.data.passengerCards[i].cardTypeCode == tcardType) {
        this.data.passengerCards[i].cardNo = no;
        break;
      }
    }
    this.setData({ passengerCards: this.data.passengerCards });

    if ((tcardType == '1' || tcardType == '25') && passengerUtils.identityCodeValid(no)) {
      var b = passengerUtils.getBirthday(no);
      var sex = passengerUtils.getGender(no);
      this.data.oPassenger.birthday = passengerUtils.formatDate(b);
      this.data.oPassenger.gender = sex;
      this.setData({ oPassenger: this.data.oPassenger });
    }
  },
  //证件有效期改变
  cardTimelimitChange: function (e) {
    var tcardType = e.currentTarget.dataset.cardid;
    var cardTimelimit = passengerUtils.formatDate(e.detail.value);
    for (var i = 0; i < this.data.passengerCards.length; i++) {
      if (this.data.passengerCards[i].cardTypeCode == tcardType) {
        this.data.passengerCards[i].cardTimelimit = cardTimelimit;
        this.data.passengerCards[i].viewCardTimelimit=cardTimelimit;

        break;
      }
    }
    this.setData({ passengerCards: this.data.passengerCards });
  },
  //设定性别男
  genderMale: function (e) {
    this.data.oPassenger.gender = 'M';
    this.setData({ oPassenger: this.data.oPassenger });
  },
  //设定性别女
  genderFemale: function (e) {
    this.data.oPassenger.gender = 'F';
    this.setData({ oPassenger: this.data.oPassenger });
  },
  //生日改变
  birthdayChange: function (e) {
    this.data.oPassenger.birthday = passengerUtils.formatDate(e.detail.value);
    this.setData({ oPassenger: this.data.oPassenger });
  },
  //国藉改变
  nationChange: function (e) {
    var self=this;
    var data = {selectedCountryCode: self.data.oPassenger.nationality, selectedCountryName: self.data.oPassenger.viewNationality};
   this.navigateTo({
     url: "../countrylist/countrylist",
     data: data,
     callback: function (redata) {
       //console.log("回调调用 ：",data, " this = ",this);
       if (redata){
         self.data.oPassenger.nationality = redata.countrycode;
         self.data.oPassenger.viewNationality = redata.countryname;
         this.setData({ oPassenger: self.data.oPassenger });
        }
      }
   })
  },
  //国家码改变
  counrtyCodeChange: function (e) {
    var self=this;
    var data = { selectedCode: self.data.oPassenger.countryCode, selectedCountryName: self.data.oPassenger.viewCountry };
    this.navigateTo({
      url: "../countrylist/countrycodes",
      data: data,
      callback: function (redata) {
        console.log("回调调用 ：", redata, " this = ", this);
        if (redata) {
          self.data.oPassenger.countryCode = redata.code.toString();
          self.data.oPassenger.viewCountry = redata.country;
          this.setData({ oPassenger: self.data.oPassenger });
        }
      }
    })
  },
  //联系电话改变
  mobliePhoneChange: function (e) {
    this.data.oPassenger.mobilePhone = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger });
  },
  passengerHandlerScrollLower:function(e){
  var aa="sdf";
    wx.hideToast();
  },
  passengernameinfotap:function(e){
    var h5url ="https://m.ctrip.com/webapp/cpage/passengerdetailinfo";
    this.itemH5UrlHandle(h5url);
  },
  cnNameClearTap:function(e){
    this.data.oPassenger.cnName = "";
    this.setData({ oPassenger: this.data.oPassenger });
  },
  enLastNameClearTap:function(e){
    this.data.oPassenger.enLastName ="";
    this.setData({ oPassenger: this.data.oPassenger });
  },
  enFirstNameClearTap:function(e){
    this.data.oPassenger.enFirstName = "";
    this.setData({ oPassenger: this.data.oPassenger });
  },
  cnnameBindBlur:function(e){
    this.data.isClearTap.isCnNameClearTap = 0;
    this.setData({ isClearTap: this.data.isClearTap });
  },
  enlastnameBindBlur:function(e){
    this.data.isClearTap.isEnLastNameClearTap = 0;
    this.setData({ isClearTap: this.data.isClearTap });
  },
  enfirstnameBindBlur:function(e){
    this.data.isClearTap.isEnFirstNameClearTap = 0;
    this.setData({ isClearTap: this.data.isClearTap });
  },
  //重置出错项目样式
  resetItemStat: function () {
    this.data.isShowError = { isShowCNName: 0, cnNameMsg: "", isShowSurname: 0, enLastNameMsg: "", isShowGivenname: 0, enFirstNameMsg: "", isShowBirthday: 0, birthdayMsg: "", isShowMobile: 0, mobilePhoneMsg: "", isShowCard: 0, cardMsg: "" ,isShowNationality: 0, nationalityMsg: ""};
      this.setData({ isShowError: this.data.isShowError });
    if (this.data.passengerCards || this.data.passengerCards.length > 0) {
      for (var i = 0; i < this.data.passengerCards.length; i++) {
        this.data.passengerCards[i].isShowCardNo = 0;
        this.data.passengerCards[i].showCardNoMessage = "";
        this.data.passengerCards[i].isShowCardTimelimit=0;
      }
      this.setData({ passengerCards: this.data.passengerCards });
    }
  },
  savepassengertap: function (e) {
    var that=this;
    if (passengerUtils.getPassengerStorage(cwx, that.data.c1)){
      passengerUtils.modalWarnShow(cwx,"最多添加10位旅客信息");
     return;
   }
   //校验逻辑
   if (!this.checkInputData(false)) {
      return;
    }
    var cno = "";
    if (that.data.passengerCards || that.data.passengerCards.length > 0) {
      for (var i = 0; i < that.data.passengerCards.length; i++) {
        if (that.data.passengerCards[i].cardTypeCode == "1" || this.data.passengerCards[i].cardTypeCode == "25") {
          cno = that.data.passengerCards[i].cardNo;
          break;
        }
      }
    }
    if ((cno != "") && (this.data.oPassenger.birthday != null) && (this.data.oPassenger.birthday.length == 10)) {
      var b = passengerUtils.getBirthday(cno);
      var bb = passengerUtils.formatDate(b);
      if (bb != this.data.oPassenger.birthday) {
        this.data.oPassenger.birthday = bb;
        var sex = passengerUtils.getGender(cno);
        if (sex != this.data.oPassenger.gender) {
          this.data.oPassenger.gender = sex;
        }
        this.setData({ oPassenger: this.data.oPassenger });
        passengerUtils.modalWarnShow(cwx,"您的出生日期/性别与身份证不符，已为您自动更正", "知道了");
        return;
      }
    }
    if ((cno != "") && this.data.oPassenger.gender != null && this.data.oPassenger.gender != "") {
      var sex = passengerUtils.getGender(cno);
      if (sex != this.data.oPassenger.gender) {
        this.data.oPassenger.gender = sex;
        this.setData({ oPassenger: this.data.oPassenger });
        passengerUtils.modalWarnShow(cwx,"您的出生日期/性别与身份证不符，已为您自动更正", "知道了");
        return;
      }
    }
    //保存SOA
    that.saveAction();
  },
  //校验输入
  checkInputData: function (e) {
    var that = this;
    var ret = true;

    that.resetItemStat();

    var rez = /^[\u4e00-\u9fa5]+$/; //纯中文
    var rey = /^[a-zA-Z]+$/;  //纯英文
    var re = /^[\u4e00-\u9fa5a-zA-Z]+$/;  //中英文
    //中文名
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.cnName = this.data.oPassenger.cnName.replace(new RegExp(unescape('%u2006'), 'gm'), '');
    this.data.oPassenger.enFirstName = this.data.oPassenger.enFirstName.replace(new RegExp(unescape('%u2006'), 'gm'), '');
    this.data.oPassenger.enLastName = this.data.oPassenger.enLastName.replace(new RegExp(unescape('%u2006'), 'gm'), '');
    //替换所有空格
    this.data.oPassenger.enLastName = this.data.oPassenger.enLastName.replace(/\s/g, '');
    //连续的空格仅仅保留一个
    this.data.oPassenger.enFirstName = this.data.oPassenger.enFirstName.replace(/\s+/g, ' ');

    while (true) {
      if (this.data.oPassenger.cnName=="" && this.data.oPassenger.enLastName == "" && this.data.oPassenger.enFirstName == ""){
        that.data.isShowError.isShowCNName = 1;
        that.data.isShowError.cnNameMsg = "请填写中文或英文姓名";
        that.data.isShowError.isShowSurname = 1;
        that.data.isShowError.enLastNameMsg = "请填写中文或英文姓名";
        that.data.isShowError.isShowGivenname = 1;
        that.data.isShowError.enFirstNameMsg = "请填写中文或英文姓名";
        ret = false;
        break;
      }
      if (this.data.oPassenger.cnName.length > 0) {
        if (this.data.oPassenger.cnName.length>50) {
          that.data.isShowError.isShowCNName = 1;
          that.data.isShowError.cnNameMsg = "姓名不可超过50字";
          ret = false;
          break;
        }
        //第一个字必为中文
        if (!rez.test(this.data.oPassenger.cnName[0])) {
          that.data.isShowError.isShowCNName = 1;
          that.data.isShowError.cnNameMsg= "请填写正确的中文姓名，第一个汉字不可用拼音代替。";
          ret = false;
          break;
        }

        //不能含有特殊字符 姓名中仅可填写1个“. ·”,
        var letter = -1;
        for (var i = 0; i < this.data.oPassenger.cnName.length; i++) {
          if ("·" == (this.data.oPassenger.cnName[i])) {
            letter++;
          } else if (!re.test(this.data.oPassenger.cnName[i])){
            ret=false;
            break;
          }
        }
        //不能含有特殊字符
        if (ret==false) {
          that.data.isShowError.isShowCNName = 1;
          that.data.isShowError.cnNameMsg = "姓名中不支持特殊符号,姓名中仅可填写1个“·”,如生僻字用拼音代替";
          ret = false;
          break;
        }
        if (letter>0){
          that.data.isShowError.isShowCNName = 1;
          that.data.isShowError.cnNameMsg = "姓名中不支持特殊符号,姓名中仅可填写1个“·”,如生僻字用拼音代替";
          ret = false;
          break;
        }
        //拼音后不可继续输入汉字
        var firstLetter = -1;
        var iscname=false;
        var isenname=false;
        for (var i = 0; i < this.data.oPassenger.cnName.length; i++) {
          if (rez.test(this.data.oPassenger.cnName[i])&& "·" != (this.data.oPassenger.cnName[i])){
            if (iscname && isenname){
              firstLetter=1;
              break;
            }
            iscname=true;
          }
          if (!rez.test(this.data.oPassenger.cnName[i]) && "·" != (this.data.oPassenger.cnName[i])){
            isenname=true;
          }
        }
        var tempcnName = this.data.oPassenger.cnName.substr(firstLetter);
        if (firstLetter >= 0 && /[^\u4e00-\u9fa5]/.test(tempcnName)) {
          that.data.isShowError.isShowCNName = 1;
          that.data.isShowError.cnNameMsg = "拼音后不可继续输入汉字，汉字请用拼音代替。";
          ret = false;
          break;
        }
      }
      if (that.data.passengerCards || that.data.passengerCards.length > 0) {
          for (var i = 0; i < that.data.passengerCards.length; i++) {
            if ((that.data.passengerCards[i].cardTypeCode == "1" || that.data.passengerCards[i].cardTypeCode == "25" || that.data.passengerCards[i].cardTypeCode == "27" || that.data.passengerCards[i].cardTypeCode == "4")
             && this.data.oPassenger.cnName == "") {
              that.data.isShowError.isShowCNName = 1;
              that.data.isShowError.cnNameMsg = "请填写中文姓名。";
              ret = false;
              break;
            }
            if ((that.data.passengerCards[i].cardTypeCode == "2" || that.data.passengerCards[i].cardTypeCode == "8" || that.data.passengerCards[i].cardTypeCode == "7" || that.data.passengerCards[i].cardTypeCode == "7" || that.data.passengerCards[i].cardTypeCode == "10" || that.data.passengerCards[i].cardTypeCode == "22")
             && this.data.oPassenger.enLastName == "" && this.data.oPassenger.enFirstName == "") {
              that.data.isShowError.isShowSurname = 1;
              that.data.isShowError.enLastNameMsg = "请填写英文姓";
              that.data.isShowError.isShowGivenname = 1;
              that.data.isShowError.enFirstNameMsg = "请填写英文名";
              ret = false;
              break;
            }
          }
        }
      break;
    }

    while (true) {
      if ((this.data.oPassenger.enLastName == "" && this.data.oPassenger.enFirstName != "")){
        that.data.isShowError.isShowSurname = 1;
        that.data.isShowError.enLastNameMsg = "请输入英文名。";
        ret = false;
        break;
      } else if(this.data.oPassenger.enLastName != "" && this.data.oPassenger.enFirstName == "") {
        that.data.isShowError.isShowGivenname = 1;
        that.data.isShowError.enFirstNameMsg = "请输入英文名。";
        ret = false;
        break;
      }

      //英文姓名中无特殊符号
      if (this.data.oPassenger.enLastName != "" && !rey.test(this.data.oPassenger.enLastName)) {
        that.data.isShowError.isShowSurname = 1;
        that.data.isShowError.enLastNameMsg = "英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替";
        ret = false;
        break;
      }
      if (this.data.oPassenger.enFirstName != "") {
        //英文姓名中无特殊符号
        var testFirstName = this.data.oPassenger.enFirstName;
        testFirstName = testFirstName.replace(/\s+/g, '');
        if (!rey.test(testFirstName)) {
          that.data.isShowError.isShowGivenname = 1;
          that.data.isShowError.enFirstNameMsg = "英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。";
          ret = false;
          break;
        }
        //姓和名相加的字符长度不能大于200
        if ((this.data.oPassenger.enLastName.length + testFirstName.length) > 200) {
          that.data.isShowError.isShowGivenname = 1;
          that.data.isShowError.enFirstNameMsg = "英文姓和名总长度不能超过200个字符，若过长请使用缩写。姓中特殊符号不输入，名中用空格代替。如 Alejandro Gomez Monteverde缩写为：英文姓: MONTEVERDE 英文名: A G";
          ret = false;
          break;
        }
      }
      break;
    }

    //出生日期
    while (true) {
      if (this.data.oPassenger.birthday.length <= 0) {
        that.data.isShowError.isShowBirthday = 1;
        that.data.isShowError.birthdayMsg = "请选择生日";
        ret = false;
        break;
      }
      if (this.data.oPassenger.birthday.length != 10) {
        that.data.isShowError.isShowBirthday = 1;
        that.data.isShowError.birthdayMsg = "请选择生日";
        ret = false;
        break;
        }
      break;
    }

    //国籍
    while(true){
      var pNationality = this.data.oPassenger.nationality;
      var tNationality = this.getPassengerNationality();
      if (tNationality == "TW" && pNationality!="TW") {
        this.data.isShowError.isShowNationality = 1;
        this.data.isShowError.nationalityMsg = "台胞证国籍只能是”中国台湾“";
        ret = false;
        break;
      } else if (tNationality == "HK" && pNationality != "HK" && pNationality !="MO") {
        this.data.isShowError.isShowNationality = 1;
        this.data.isShowError.nationalityMsg = "回乡证国籍只能是”中国香港“或”中国澳门“";
        ret = false;
        break;
      }
      break;
    }

    //手机号码
    while (true) {
      if (this.data.oPassenger.countryCode=="86"){
        if ((this.data.oPassenger.mobilePhone != "") && (!/^(1)\d{10}$/.test(this.data.oPassenger.mobilePhone))) {
          that.data.isShowError.isShowMobile = 1;
          that.data.isShowError.mobilePhoneMsg = "请输入正确的手机号码";
          ret = false;
          break;
        }
      }else{
        if ((this.data.oPassenger.mobilePhone != "") && (!/^\d{6,15}$/.test(this.data.oPassenger.mobilePhone))) {
          that.data.isShowError.isShowMobile = 1;
          that.data.isShowError.mobilePhoneMsg = "请输入正确的手机号码";
          ret = false;
          break;
        }
      }
      break;
    }
    //证件号
    while (true) {
      if (!this.data.passengerCards || this.data.passengerCards.length <= 0) {
        that.data.isShowError.isShowCard = 1;
        that.data.isShowError.cardMsg = "请至少添加1个证件";
        ret = false;
        break;
      }
      if (that.data.passengerCards || that.data.passengerCards.length > 0) {
        for (var i = 0; i < that.data.passengerCards.length; i++) {
          if (that.data.passengerCards[i].cardTypeCode == "1" || this.data.passengerCards[i].cardTypeCode == "25") {
            if (!passengerUtils.identityCodeValid(this.data.passengerCards[i].cardNo)) {
              this.data.passengerCards[i].isShowCardNo = 1;
              if (that.data.passengerCards[i].cardTypeCode == '1') {
                that.data.passengerCards[i].showCardNoMessage = "请输入正确的身份证号";
              } else {
                that.data.passengerCards[i].showCardNoMessage = "请输入正确的户口薄号";
              }
              ret = false;
            }
          } else if (that.data.passengerCards[i].cardTypeCode == "2" || this.data.passengerCards[i].cardTypeCode == "8" || this.data.passengerCards[i].cardTypeCode == "7" || this.data.passengerCards[i].cardTypeCode == "4" || this.data.passengerCards[i].cardTypeCode == "10" || this.data.passengerCards[i].cardTypeCode == "22" || this.data.passengerCards[i].cardTypeCode == "27"){
            if (!that.checkPassengerCard(that.data.passengerCards[i].cardNo)){
              that.data.passengerCards[i].isShowCardNo = 1;
              that.data.passengerCards[i].showCardNoMessage = "请输入正确的" + that.data.passengerCards[i].cNName+"号";
              ret = false;
            }
          }else if (that.data.passengerCards[i].cardNo == "") {
            that.data.passengerCards[i].isShowCardNo = 1;
            that.data.passengerCards[i].showCardNoMessage = "请输入正确的证件号";
            ret = false;
          }
        }
        that.setData({ passengerCards: that.data.passengerCards });
      }
      break;
    }

    that.setData({ isShowError: that.data.isShowError });

    if (that.data.isShowError.isShowCNName == 1 || that.data.isShowError.isShowSurname == 1 || that.data.isShowError.isShowGivenname == 1) {
      that.setData({ toView: "passengercnnameblock" });
      wx.pageScrollTo({scrollTop: 0})
    }
    return ret;
  },
  checkPassengerCard: function (cardno) {
    var ret=true;
    if (cardno==""){
      ret=false;
    }else if (!/^[A-Za-z0-9]+$/.test(cardno)){
      ret=false;
    }else{
      ret=true;
    }
    return ret;
  },
  //保存
  saveAction: function () {
    var that = this;
    var parameters = [];
    var parameterItem;
    parameterItem = { "Key": "BizType", "Value": "BASECWX" };
    parameters.push(parameterItem);
    parameterItem = { "Key": "BookingType", "Value": "N" };
    parameters.push(parameterItem);
    parameterItem = { "Key": "InputType", "Value": "U" };
    parameters.push(parameterItem);
    parameterItem = { "Key": "EditType", "Value": "0" };
    parameters.push(parameterItem);
    var cardObjs = [];
    var cardObj={};
    var card={};
    for (var i = 0; i < this.data.passengerCards.length; i++) {
      card = this.data.passengerCards[i];
      if (card.isselected == 1) {
        var cardtype = card.cardTypeCode.toString();
        cardObj = { "cardNo": card.cardNo, "cardTimelimit": card.cardTimelimit, "cardType": cardtype};
        cardObjs.push(cardObj);
      }
    }
    var countryCode="";
    var mobilePhone="";
    var countryCodeForeign="";
    var mobilePhoneForeign="";
    if (this.data.oPassenger.countryCode != null && this.data.oPassenger.countryCode != "" && this.data.oPassenger.countryCode!="86"){
      countryCodeForeign = this.data.oPassenger.countryCode;
      mobilePhoneForeign = this.data.oPassenger.mobilePhone;
    }else{
      countryCode = "86";
      mobilePhone = this.data.oPassenger.mobilePhone;
    }
    var tmpParam = this.data.c1;
    if (typeof tmpParam =="string"){
      tmpParam = this.data.c1;
    }else{
      tmpParam=this.data.c1.c1;
    }
    var commonPassenger = {
      "cnName": this.data.oPassenger.cnName, "enFirstName": this.data.oPassenger.enFirstName,
      "enLastName": this.data.oPassenger.enLastName, "commonPassengerCard": cardObjs, "birthday": this.data.oPassenger.birthday, "gender": this.data.oPassenger.gender, "nationality": this.data.oPassenger.nationality,"passengerType": "A","passengerID": 0,"countryCode": countryCode, "mobilePhone": mobilePhone,"countryCodeForeign": countryCodeForeign,"mobilePhoneForeign":mobilePhoneForeign};
    var wItem = {"cnName": this.data.oPassenger.cnName, "enFirstName": this.data.oPassenger.enFirstName,"enLastName": this.data.oPassenger.enLastName};
    var paramsoa = { "parameterList": parameters, "commonPassenger": commonPassenger, "cipherUid": tmpParam};
    //LOADING ON
    cwx.request({url: that.data.soaSaveUrl,data: paramsoa,success: function (res) {
        //LOADING OFF
        var data = res.data;
        if (data.ResponseStatus.Ack == "Success" && data.result.resultCode == 0) {
          that.gotosuccess(wItem);
        } else {
          if (data.ResponseStatus.Ack == "Failure") {
            passengerUtils.modalWarnShow(cwx,"保存失败，请重试");
          }else{
            passengerUtils.modalWarnShow(cwx, "保存失败，请重试，错误" + data.result.errMessage);
          }
        }
      },
      fail: function (data) {
        //LOADING OFF
        passengerUtils.modalWarnShow(cwx,"fail保存失败，请重试。");
      }
    });
  },
  gotosuccess:function(obj){
    var self=this;
    self.data.addPassengers.push(obj);
    var datas = { items: self.data.addPassengers};
    passengerUtils.setPassengerStorage(cwx, self.data.c1,datas);
    this.navigateTo({
      url: "../success/index",
      data: datas,
      callback: function (redata) {
        //console.log("回调调用 ：",data, " this = ",this);
       if (redata) {
         self.setData({ addPassengers: self.data.addPassengers });
         var cards = [{ "cardTypeCode": 1, "cNName": "身份证", "eNName": "ID", "cardNo": "", "cardTimelimit": "", "sort": "1", "isselected": 1, isShowCardNo: 0, showCardNoMessage: "", isShowCardTimelimit: 0, showCardTimelimitMessage: "", cardNoKeyBoard: "idcard", isCardTimelimitSelected: 1}];
         var passenger= { cnName: "", enFirstName: "", enLastName: "", birthday: "", gender: "M", nationality: "CN", viewNationality: "中国大陆", viewCountry: "", countryCode: "86", mobilePhone: "" };
         self.setData({ oPassenger: passenger });
         self.setData({passengerCards:cards});
         self.initCards();
        }
      }
    })
  },
  initCards:function(){
    var allCardsData = cardsData;
    var allCardCode = [];
    var allCardName = [];
    for (var i = 0; i < allCardsData.length; i++) {
      if (allCardsData[i].isselected == 0) {
        allCardCode.push(allCardsData[i].cardTypeCode);
        allCardName.push(allCardsData[i].cNName);
      }
    }
    this.setData({ allCards: allCardsData, allCardCode: allCardCode, allCardName: allCardName });
  },
  itemH5UrlHandle: function (h5url) {
    cwx.component.cwebview({
      data: {
        url: encodeURIComponent(h5url),
        needLogin: false
      }
    })
  },
})