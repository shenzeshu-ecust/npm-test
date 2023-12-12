import { cwx, CPage } from '../../cwx/cwx.js';

CPage({
  pageId: '10320613378',
  checkPerformance:true, // 白屏检测标志位
  data:{
    //公用

    //列表页
    soaurl: "/restapi/soa2/10820/GetCommonPassenger.json",
    totalPages: 0,  //总页数
    totalCount: 0,  //总记录数
    nowPage: 0,     //当前页号
    pageSize: 25,   //分页查询接口时每页数量
    checkfunc: null,  //勾选时校验回调方法
    needselectcnt : 0,  //需要选回去的常旅个数(0时随意)
    selectCntNow :0,     //当前页面选中的常旅个数
    selectedPassengerIds :[],    //前页面传入需选中的常旅passengerid
    selectedOkPassengerIds :[],    //实际自动选中的常旅passengerid
    autoSelectOver:false,           //自动选中完毕
    passengers:[],     //常旅对象列表
    okButtonStatus:0,  //完成按钮状态0:暗，1:亮
    //编辑页
    isShowEditPage: 'F',//编辑层显示
    editPageTitle :"",  //编辑层标题
    topWarnTipHidden:true,  //顶部多错误提示条
    soaSaveUrl : '/restapi/soa2/10820/SaveCommonPassenger.json',
    oPassenger : {PassengerID : 0},  //当前页面常旅对象
    cardTypeListOld: [{ 'id': 1, 'name': '身份证' }, { 'id': 2, 'name': '护照' }, { 'id': 8, 'name': '台胞证' }, { 'id': 7, 'name': '回乡证' }, { 'id': 4, 'name': '军人证' }, { 'id': 10, 'name': '港澳通行证' }, { 'id': 22, 'name': '台湾通行证' }],
    cardTypeList :[],
    cardTypeSelectorHidden : true,  //证件选择列表显示,
    cardTypeHidden:false,
    cardNoHidden:false,
    cardLimitHidden:false,
    allCountry :[],
    allCountryCode :[],
    allCountryName :[],
    allCountryIndex : 0,
    allCountrySoaUrl : '/restapi/soa2/10846/GetCountryForH5.json',
    guideHidden : true,  //证件选择列表显示
    isEdit : '0',
    //0:中文，1：last，2：first middle，3：证件类型，4：证件号，5：证件有效期，6：国籍，7：性别，8：出生日期，9:成人/儿童
    isWrongList : [],
    wrongMsgList : [],
    displayitemCodes:[], //显示的字段
    isHiddenPassengerType:true,
    isHiddenAllCardType:true,
    isHiddenCountryName:true,
    isHiddenGender:true,
    isHiddenBirthday:true,
    isHiddenMobilePhone:true,
    notNullPassengerType:false,
    notNullCountryName:false,
    notNullGender:false,
    notNullBirthday:true,
    notNullMobilePhone:false,
    isHidenCardLimit:true,
    notNullCardLimit:false,
    isHiddenCNName:false,
    isHiddenEName:false,
    notNullCNName:false,
    notNullEName:false,
    isHiddenLanguageAction:true,
    allCardTypeIndex: 0,
    cardTypeCodeList: [],
    cardTypeNameList: [],
    cardTypeDefault:null,
    cardTypelistByUserSetting: []
  },
  onLoad:function(options){
    this.data.checkfunc = options.data.filterFunc;
    this.data.needselectcnt = options.data.maxCount || 0;
    this.data.selectedPassengerIds = options.data.choosedPassengers || [];
    this.data.selectedOkPassengerIds=[];
    this.data.displayitemCodes=options.data.displayitems||[];
    this.data.totalPages=0;
    this.data.totalCount= 0;
    this.data.nowPage= 0;
    this.data.selectCntNow =0;
    this.data.selectedOkPassengerIds =[];
    this.data.autoSelectOver=false;
    this.data.passengers=[];
    this.data.okButtonStatus=0;
    this.data.allCardTypeIndex=0;
    this.data.cardTypeCodeList = [];
    this.data.cardTypeNameList = [];
    this.data.cardTypeDefault=null;
    this.data.cardTypelistByUserSetting=[];
  },
  // 页面渲染完成
  onReady:function(){
    var islogin = cwx.user.isLogin();
    if (islogin) {
      this.setData({ nowPage: (this.data.nowPage + 1)});
      this.getCardTypeData();
      this.setEditDisplayitem();
      }else{
      this.showModalLoginPage();
    }
  },
  onShow:function(){},
  // 页面隐藏
  onHide:function(){},
  // 页面关闭
  onUnload:function(){},
  //向下滚动加载
  moreDetail:function(){
    if (this.data.nowPage - this.data.totalPages < 0 && this.data.totalPages - 1 > 0) {
      this.setData({ nowPage: (this.data.nowPage + 1)});
      this.getDataFromSoa();
    }else{
      this.showToast("已显示全部。");
    }
  },
  //生成调接口参数
  MakeSoaParam:function(pid,index){
    var Parameters = [];
    var ParameterItem;
    ParameterItem = { "Key": "BizType", "Value": "BASE" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "BookingType", "Value": "N" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "InputType", "Value": "U" };
    Parameters.push(ParameterItem);
    var QueryConditions = [];
    var QueryCondition;
    var pindex = index || this.data.nowPage
    QueryCondition = { "Key": "PageIndex", "Value": pindex };
    QueryConditions.push(QueryCondition)
    QueryCondition = { "Key": "PageSize", "Value": this.data.pageSize };
    QueryConditions.push(QueryCondition)
    QueryCondition = { "Key": "OrderType", "Value": "D" };
    QueryConditions.push(QueryCondition)
    if (!!pid){
      QueryCondition = { "Key": "CommonPassengerID", "Value": pid };
      QueryConditions.push(QueryCondition)
    }
    var paramsoa = {"Parameters" : Parameters, "QueryConditions":QueryConditions};
    return paramsoa;
  },
  //调接口取数
  getDataFromSoa: function(){
    var that = this;
    var param = this.MakeSoaParam();
    //LOADING ON
    that.showLoading();
    cwx.request({
      url: that.data.soaurl,
      data: param,
      success: function(res) {
        var data = res.data;
        if (data.ResponseStatus.Ack == "Success" && data.Result.Result == "0"){
          that.formatViewData(data.CommonPassengers);
          //设定页号
          that.setData({ totalPages: Math.ceil(data.PassengerCount / that.data.pageSize)});
          that.setData({ totalCount: data.PassengerCount});
          //自动找到该记录并打勾
          if (that.data.selectedPassengerIds.length > 0){
            that.data.selectedPassengerIds.forEach(function(item){
              if (that.data.selectedOkPassengerIds.filter(s => s == item).length == 0){
                //不在实际已选中的ID内
                var p = that.data.passengers.filter(o => o.PassengerID == item);
                if (p.length > 0){
                  var oP = p[0];
                  //选中校验逻辑（针对用户如果修改已选中的常旅，把该常旅改得不符合选中条件的场景)
                  var ret = that.data.checkfunc(oP);
                  if ((typeof ret == "boolean" && ret == true) || (typeof ret == "object" && ret.length == 2 && ret[0] == true)|| (typeof ret == "object" && ret.length == 3 && ret[0] == true)){
                    oP.view.isselected = 1;   //打勾
                    that.setData({ passengers: that.data.passengers});
                    that.data.selectCntNow = that.data.selectCntNow +1;   //打勾总数+1（用于完成按钮显示）
                    that.setData({ selectCntNow: that.data.selectCntNow });
                    that.data.selectedOkPassengerIds.push(item);    //放到已标数组
                    that.setData({ selectedOkPassengerIds: that.data.selectedOkPassengerIds});
                  }else{
                    //重新校验后原本勾上的现在不能勾的
                    that.data.selectedOkPassengerIds.push(item);    //放到已标数组
                    that.setData({ selectedOkPassengerIds: that.data.selectedOkPassengerIds});
                  }
                }
              }
            });
          }
          if(!that.data.autoSelectOver && that.data.selectedPassengerIds.length > that.data.selectedOkPassengerIds.length && that.data.totalPages - that.data.nowPage > 0 ){
            that.setData({ nowPage: (that.data.nowPage + 1)});
            that.getDataFromSoa();
          }else{
            that.setData({ autoSelectOver: true});  //查询并自动勾选完成
            that.setFinishButton(); //完成按钮状态
            //LOADING OFF
            that.hideLoading();
          }
        }else{
          that.hideLoading();
          if (data.ResponseStatus.Ack == "Failure"){
            if (data.Result!=null){
              that.modalRetryShow("查询失败。错误码" + data.Result.Result);
            }else{
              that.showModalLoginPage();
            }
          }
        }
      },
      fail:function(data){
        //LOADING OFF
        that.hideLoading();
        that.modalRetryShow("查询失败。");
      }
    })
  },
  //格式化
  formatViewData: function(passengerlist){
    var that = this;
    var passengerstemp = this.data.passengers;
    if(!!passengerlist){
      passengerlist.forEach(function(item){
        item.UID=null;
        //初始化页面查看用属性(两行证件)
        //isselected：是否选中;cardshow：显示证件;warnmsg: 信息不全提醒;
        var view = { isselected : 0, cardshow:[], mobilephone:"", cantselect:0 };
        var card1 = "";  //身份证
        var card2 = "";  //护照
        var cardOther = [];
        var cardAll = [];
        var cardText = "";
        var cardDefault ="";
        if (!!item.CommonPassengerCard && item.CommonPassengerCard.length > 0){
          for(var j=0;j<item.CommonPassengerCard.length;j++){
            var tcName = that.GetCardTypeName(item.CommonPassengerCard[j].CardType);
            if (tcName!=""){
              var tcCode = MaskIDNumber(item.CommonPassengerCard[j].CardNo);
              if (cardDefault == "" && that.data.cardTypeDefault != null && Number(that.data.cardTypeDefault) != 1 && Number(that.data.cardTypeDefault) != 2 && Number(that.data.cardTypeDefault) == Number(item.CommonPassengerCard[j].CardType)) {
                cardDefault = tcName + " " + tcCode;
              } else if (item.CommonPassengerCard[j] && item.CommonPassengerCard[j].CardType == "1") {
                card1 = tcName + " " + tcCode;
              } else if (item.CommonPassengerCard[j] && item.CommonPassengerCard[j].CardType == "2") {
                card2 = tcName + " " + tcCode;
              } else {
                cardText = tcName + " " + tcCode;
                cardOther.push(cardText);
              }
            }
          }
          if (cardDefault != "") {
            cardAll.push(cardDefault);
          }
          if (card1 != ""){
            cardAll.push(card1);
          }
          if (card2 != "" && cardAll.length < 2){
            cardAll.push(card2);
          }
          for(var k=0;k<cardOther.length;k++){
            if (cardAll.length >=2){
              break;
            }
            cardAll.push(cardOther[k]);
          }
        }
        view.cardshow = cardAll;
        //手机号码
        if (item.MobilePhone != ""){
          view.mobilephone = MaskMobile(item.MobilePhone);
        }
        item.view = view;

        passengerstemp.push(item);
        that.setData({ passengers: passengerstemp});
      })
    }
  },
  //选择明细
  selectDetail: function(e){
    var index = e.currentTarget.dataset.idx;
    var oPassenger = this.data.passengers[index];
    //是否已经回归验证过不能选
    if (oPassenger.view.isselected == 1){
      //取消选择
      oPassenger.view.isselected = 0;
      this.setData({ passengers: this.data.passengers});
      this.data.selectCntNow = this.data.selectCntNow -1;
      this.setData({ selectCntNow: this.data.selectCntNow });
    }else{
      //判断是否可以再选
      if ((this.data.needselectcnt > 0) && (this.data.selectCntNow >= this.data.needselectcnt)){
        this.modalWarnShow("已达到需要选择的旅客数量，不可再选。");
        return;
      }
      //回调校验明细
      if (this.data.checkfunc){
        var ret = this.data.checkfunc(oPassenger)
        if (typeof ret == "boolean" && ret != true){
          this.modalWarnShow("此旅客信息不符合订单要求！");
          oPassenger.view.cantselect = 1;
          this.setData({ passengers: this.data.passengers});
          return;
        }else if(typeof ret == "object" && ret.length == 2 && ret[0] != true){
          //双参数返回，自定义报错
          if(typeof ret[1]=="string"){
            this.modalWarnShow(ret[1]);
          }else{
            this.modalWarnShow(this.GetWrongMsg(ret[1]));
          }
          oPassenger.view.cantselect = 1;
          this.setData({ passengers: this.data.passengers});
          return;
        }else if(typeof ret == "object" && ret.length == 3 && ret[0] != true){
          if(ret[2]=="1"){
           if(typeof ret[1]=="string"){
             this.modalCantSelectToEdit(ret[1],oPassenger);
           }else{
            this.modalCantSelectToEdit(this.GetWrongMsg(ret[1]),oPassenger);
           }
          }else{
            if(typeof ret[1]=="string"){
             this.modalWarnShow(ret[1]);
           }else{
             this.modalWarnShow(this.GetWrongMsg(ret[1]));
           }
          }
          oPassenger.view.cantselect = 1;
          this.setData({ passengers: this.data.passengers});
          return;
        }
      }
      oPassenger.view.isselected = 1;
      this.setData({ passengers: this.data.passengers});
      this.data.selectCntNow = this.data.selectCntNow +1;
      this.setData({ selectCntNow: this.data.selectCntNow });
    }
    this.setFinishButton(); //完成按钮状态
  },
  //完成按钮状态
  setFinishButton:function(){
    if ( (this.data.needselectcnt > 0 && this.data.needselectcnt >= this.data.selectCntNow && this.data.selectCntNow > 0)
      || (this.data.needselectcnt == 0 && this.data.selectCntNow > 0)){
      this.setData({okButtonStatus: 1});
    }else{
      this.setData({okButtonStatus: 0});
    }
  },
  //完成按钮
  finishClick:function(){
    var that = this;
    var retPassengers = this.data.passengers.filter(o => o.view.isselected == 1);
    this.invokeCallback(retPassengers);
    setTimeout(function(){
      that.navigateBack();
    },100)
  },
  //新建常旅
  addPassenger:function(){
      this.showEditPage();
  },
  //从编辑页完成时回调
  backFromEdit:function(){
    //重置分页参数
    var selPassengers = this.data.passengers.filter(o => o.view.isselected == 1);
    var selPids;
    if (!!selPassengers && selPassengers.length > 0){
      this.setData({selectCntNow :0});
      selPids = selPassengers.map(o=>o.PassengerID);
      this.setData({selectedPassengerIds:selPids});
      this.setData({selectedOkPassengerIds:[]});
      this.setData({autoSelectOver:false});
    }
    //重新刷新列表并保持选中
    this.setData({passengers:[]});
    this.setData({nowPage:1});
    this.getDataFromSoa();
  },
  //修改常旅
  editPassegner:function(e){
    var that = this;
    var param = this.MakeSoaParam(e.currentTarget.dataset.pid,1);
    cwx.request({
      url: that.data.soaurl,
      data: param,
      success: function(res) {
        var datasoa = res.data;
        if (datasoa.Result.Result == "0" && datasoa.ResponseStatus.Ack == "Success" && !!datasoa.CommonPassengers && datasoa.CommonPassengers.length == 1){
          that.setData({ oPassenger: datasoa.CommonPassengers[0] });
          that.showEditPage();
        }else{
          if (data.ResponseStatus.Ack == "Failure") {
            if (data.Result != null) {
              that.modalWarnShow("数据加载失败，请重试，错误码" + datasoa.Result.Result);
            } else {
              that.showModalLoginPage();
            }
          }
        }
      },
      fail:function(res){
        that.modalWarnShow("数据加载失败，请重试!");
      },
    });
  },
  //************************************************************
  //*************************编辑页*****************************
  //************************************************************
  showEditPage: function (e) {
    this.resetItemStat(); //重置项目红色状态
    if (!!this.data.oPassenger && !!this.data.oPassenger.PassengerID && this.data.oPassenger.PassengerID != 0) {
      //编辑
      //设定证件
      var c;
      if (this.data.cardTypeDefault != null) {
        if (!!this.data.oPassenger.CommonPassengerCard && this.data.oPassenger.CommonPassengerCard.length > 0) {
          c = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == this.data.cardTypeDefault.toString())[0];
          if (!!c) {
          } else {
            if (this.data.cardTypelistByUserSetting!=null){
              for (var k = 0; k < this.data.oPassenger.CommonPassengerCard.length; k++) {
                for (var q = 0; q < this.data.cardTypelistByUserSetting.length; q++) {
                  if (Number(this.data.oPassenger.CommonPassengerCard[k].CardType) == Number(this.data.cardTypelistByUserSetting[q].id)){
                    c = this.data.oPassenger.CommonPassengerCard[k];
                    break;
                  }
                }
                if(!!c){
                  break;
                }
              }
              if (!!c) {
              }else{
                c = { CardNo: "", CardTimelimit: "", CardType: this.data.cardTypeDefault };
              }
            }else{
              c = { CardNo: "", CardTimelimit: "", CardType: this.data.cardTypeDefault };
            }
          }
        }else{
          c = { CardNo: "", CardTimelimit: "", CardType: this.data.cardTypeDefault };
        }
       }else{
        if (!!this.data.oPassenger.CommonPassengerCard && this.data.oPassenger.CommonPassengerCard.length > 0) {
          if (this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '1').length > 0) {
            //有身份证
            c = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '1')[0];
          } else if (this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '2').length > 0) {
            //有护照
            c = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '2')[0];
          } else {
            c = this.data.oPassenger.CommonPassengerCard[0];
          }
        } else {
          c = { CardNo: "", CardTimelimit: "", CardType: "1" };
          this.data.oPassenger.CommonPassengerCard = [c];
        }
      }
      this.data.oPassenger.viewCardType = c.CardType;
      this.data.oPassenger.viewCardTypeCN = this.GetCardTypeName(c.CardType);
      this.data.oPassenger.viewCardNo = c.CardNo;
      this.data.oPassenger.viewCardTimelimit = this.FormatDate(c.CardTimelimit);
      this.data.oPassenger.Birthday = this.FormatDate(this.data.oPassenger.Birthday);
      this.data.oPassenger.viewNationality = "";
      if (this.data.oPassenger.ENMiddleName != null && this.data.oPassenger.ENMiddleName != "") {
        this.data.oPassenger.ENFirstName = this.data.oPassenger.ENFirstName + " " + this.data.oPassenger.ENMiddleName;
      } else {
        this.data.oPassenger.ENFirstName = this.data.oPassenger.ENFirstName;
      }
      this.data.oPassenger.ENMiddleName = "";
      this.setData({ oPassenger: this.data.oPassenger });
      this.setData({ editPageTitle: '编辑旅客' });
      this.setData({ isEdit: '1' });
    } else {
      //新增
      var viewCardType = "";
      var viewCardTypeName = "";
      if (this.data.cardTypeDefault != null) {
        viewCardType = this.data.cardTypeDefault;
      } else {
        viewCardType = "1";
      }
      viewCardTypeName = this.GetCardTypeName(viewCardType);
      var op = {CNName: "", ENFirstName: "", ENLastName: "", ENMiddleName: "",CommonPassengerCard: [{ CardNo: "", CardTimelimit: "", CardType: viewCardType }],CommonPassengerFFP: [],Gender: "", Nationality: "CN", Birthday: "", PassengerType: "A",PassengerID: 0, viewCardType: viewCardType, viewCardTypeCN: viewCardTypeName, viewCardNo: "", viewCardTimelimit: "", viewNationality: "", MobilePhone: ""};
      this.setData({ oPassenger: op });
      this.setData({ editPageTitle: '新增旅客' });
      this.setData({ isEdit: '0' });
    }
    //为证件类型滚筒设定初选项
    this.data.allCardTypeIndex = this.data.cardTypeNameList.indexOf(this.data.oPassenger.viewCardTypeCN);
    if (this.data.allCardTypeIndex < 0) { this.data.allCardTypeIndex = 0 };
    this.setData({ allCardTypeIndex: this.data.allCardTypeIndex });

    //显示编辑层
    this.setData({ isShowEditPage: 'T' });

    //取国籍信息
    this.getCountryData();
  },
  setEditDisplayitem:function(e){
    if(this.data.displayitemCodes.length>0){
      var that=this;
      var isHidenCHName=true;
      var isHidenEName=true;
      var isHidenCard=true;
      this.data.displayitemCodes.forEach(function(item){
        if(item.length && item.length>=2){
          if(item[0]==1){
            if(item[1]==1){
              that.setData({notNullPassengerType:true});
            }else{
              that.setData({notNullPassengerType:false});
            }
            that.setData({isHiddenPassengerType:false});
          }else if(item[0]==2){
            //是否显示证件
            that.setData({ isHiddenAllCardType:false});
            if (that.data.oPassenger.PassengerType == "C"){
              that.isHideCard(true);
            }else{
              that.isHideCard(false);
            }
          }else if(item[0]==3){
            that.setData({isHiddenCountryName:false});
            if(item[1]==1){
              that.setData({notNullCountryName:true});
            }else{
              that.setData({notNullCountryName:false});
            }
          }else if(item[0]==4){
            that.setData({isHiddenGender:false});
            if(item[1]==1){
              that.setData({notNullGender:true});
            }else{
              that.setData({notNullGender:false});
            }
          }else if(item[0]==5){
            that.setData({isHiddenBirthday:false});
            if(item[1]==1){
              that.setData({notNullBirthday:true});
            }else{
              that.setData({notNullBirthday:false});
            }
          }else if(item[0]==6){
            that.setData({isHiddenMobilePhone:false});
            if(item[1]==1){
              that.setData({notNullMobilePhone:true});
            }else{
              that.setData({notNullMobilePhone:false});
            }
          }else if(item[0]==7){
            that.setData({ isHiddenAllCardType:false});
            if(item[1]==1){
              that.setData({notNullCardLimit:true});
            }else{
              that.setData({notNullCardLimit:false});
            }
          }else if(item[0]==8){
            isHidenCHName=false;
           if(item[1]==1){
              that.setData({notNullCNName:true});
            }else{
              that.setData({notNullCNName:false});
            }
          }else if(item[0]==9){
            isHidenEName=false;
            if(item[1]==1){
              that.setData({notNullEName:true});
            }else{
              that.setData({notNullEName:false});
            }
          }else if(item[0]==10){
            isHidenCard=false;
          }
        }
     });
     if(that.data.isHiddenAllCardType==true){
       if(isHidenCard==false){
        that.setData({ isHiddenAllCardType: false});
        if (that.data.oPassenger.PassengerType == "C"){
           that.isHideCard(true);
        }else{
          that.setData({ cardTypeHidden: false});
          that.setData({ cardNoHidden: false});
          that.setData({ cardLimitHidden: true});
        }
       }else{
          that.isHideCard(true);
       }
      }
      if((isHidenCHName==true)&&(isHidenEName==false)){
        that.setData({isHiddenEName:false});
        that.setData({isHiddenCNName:true});
        if(that.data.isEdit=="0"){
          that.data.oPassenger.viewCardType ="2";
          that.data.oPassenger.viewCardTypeCN = this.GetCardTypeName("2");
        }
      }else if((isHidenCHName==false)&&(isHidenEName==true)){
         that.setData({isHiddenCNName:false});
         that.setData({isHiddenEName:true});
      }else{
        that.setData({isHiddenLanguageAction:false});
        that.setData({isHiddenCNName:false});
        that.setData({isHiddenEName:true});
      }
    }else{
      this.setData({isHiddenPassengerType:false});
      this.setData({isHiddenAllCardType:false});
      this.setData({isHiddenCountryName:false});
      this.setData({isHiddenGender:false});
      this.setData({isHiddenBirthday:false});
      this.setData({isHiddenMobilePhone:false});
      this.setData({notNullPassengerType:false});
      this.setData({notNullCountryName:false});
      this.setData({notNullGender:false});
      this.setData({notNullBirthday:true});
      this.setData({notNullMobilePhone:false});
      this.setData({ isHidenCardLimit: false});
      this.setData({ cardLimitHidden: false});
      this.setData({notNullCardLimit:false});
      this.setData({isHiddenCNName:false});
      this.setData({isHiddenEName:false});
      //是否显示证件
      if (this.data.oPassenger.PassengerType == "C"){
       this.isHideCard(true);
      }else{
       this.isHideCard(false);
      }
    }
  },
  closeEditPage:function(e){
    this.setData({ oPassenger: {PassengerID : 0} });
    this.setData({ isShowEditPage: 'F'});
  },
  //中文名改变
  cnnameChange:function(e){
    this.data.oPassenger.CNName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //英文last改变
  enlastnameChange:function(e){
    this.data.oPassenger.ENLastName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //英文first/middle改变
  enfirstnameChange:function(e){
    var name = e.detail.value;
    this.data.oPassenger.ENFirstName = name;
    this.data.oPassenger.ENMiddleName = "";
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //切换证件类型(显示浮层)
  selectedCard:function(e){
    if (e.detail.value > -1) {
    var tcardType = this.data.cardTypeCodeList[e.detail.value];
    var selected = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == tcardType);
    var selcard;
    if (!!selected && selected.length > 0){
      selcard = selected[0];
    }else{
      selcard = { CardNo: "", CardTimelimit: "", CardType: tcardType};
      this.data.oPassenger.CommonPassengerCard.push(selcard);
    }
    this.data.oPassenger.viewCardType = selcard.CardType;
    this.data.oPassenger.viewCardTypeCN = this.GetCardTypeName(selcard.CardType);
    this.data.oPassenger.viewCardNo = selcard.CardNo;
    this.data.oPassenger.viewCardTimelimit = this.FormatDate(selcard.CardTimelimit);
    this.setData({ oPassenger: this.data.oPassenger});
      this.setData({allCardTypeIndex:e.detail.value});
    this.setData({ cardTypeSelectorHidden: true});  //隐藏选择列表
    }
  },
  //证件号改变
  changeCardNo:function(e){
    var selected = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == e.currentTarget.dataset.cardid);
    var no = e.detail.value;
    if (e.currentTarget.dataset.cardid == 1){
      no = no.toUpperCase();
    }
    selected.CardNo = no;
    this.data.oPassenger.viewCardNo = selected.CardNo;
    this.setData({ oPassenger: this.data.oPassenger});
    if ((this.data.isHiddenBirthday == false || this.data.isHiddenGender == false) && (this.data.oPassenger.viewCardType == '1' || this.data.oPassenger.viewCardType == '25')&& IdentityCodeValid(this.data.oPassenger.viewCardNo)) {
      if (this.data.isHiddenBirthday == false){
          var b = getBirthday(this.data.oPassenger.viewCardNo);
          this.data.oPassenger.Birthday = this.FormatDate(b);
          this.setData({ oPassenger: this.data.oPassenger });
      }
      if (this.data.isHiddenGender == false) {
        var sex = getGender(this.data.oPassenger.viewCardNo);
        this.data.oPassenger.Gender = sex;
        this.setData({ oPassenger: this.data.oPassenger });
      }
    }
  },
  //证件有效期改变
  cardTimelimitChange:function(e){
    var selected = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == this.data.oPassenger.viewCardType);
    selected.CardTimelimit = this.FormatDate(e.detail.value);
    this.data.oPassenger.viewCardTimelimit = selected.CardTimelimit;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //国藉改变
  nationChange:function(e){
    if (e.detail.value > -1){
      this.data.oPassenger.Nationality = this.data.allCountryCode[e.detail.value];
      this.data.oPassenger.viewNationality = this.data.allCountryName[e.detail.value];
      this.setData({ oPassenger: this.data.oPassenger});
      this.setData({ allCountryIndex: e.detail.value});
    }
  },
  //设定性别男
  genderMale:function(e){
    this.data.oPassenger.Gender = 'M';
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //设定性别女
  genderFemale:function(e){
    this.data.oPassenger.Gender = 'F';
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //设定成人
  typeAdult:function(e){
    this.data.oPassenger.PassengerType = 'A';
    this.setData({ oPassenger: this.data.oPassenger});
    //显示证件
    this.isHideCard(false);
    if(this.data.isHidenCardLimit==true){
      this.setData({ cardLimitHidden: true});
    }
  },
  //设定儿童
  typeChild:function(e){
    this.data.oPassenger.PassengerType = 'C';
    this.setData({ oPassenger: this.data.oPassenger});
    //隐藏证件
    this.isHideCard(true);
  },
  //隐藏证件
  isHideCard:function(ishide){
    this.setData({ cardTypeHidden: ishide});
    this.setData({ cardNoHidden: ishide});
    this.setData({ cardLimitHidden: ishide});
  },
  //生日改变
  birthdayChange:function(e){
    this.data.oPassenger.Birthday = this.FormatDate(e.detail.value);
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //联系电话改变
  mobliePhoneChange:function(e){
    this.data.oPassenger.MobilePhone = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //完成按钮
  finishEdit:function(e){
    var normal = function(){
      //校验逻辑
      if (!this.checkInputData(false)){
         return;
      }
      var cno="";
      if((this.data.oPassenger.PassengerType != 'C') && (this.data.oPassenger.viewCardType == '1' || this.data.oPassenger.viewCardType == '25')){
        cno = this.data.oPassenger.viewCardNo;
      }else{
        var c;
        if (!!this.data.oPassenger.CommonPassengerCard && this.data.oPassenger.CommonPassengerCard.length > 0) {
          c=this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '1');
          if (!!c&&c.length > 0) {
            //有身份证
            cno = c[0].CardNo;
          }else{
            c = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '25');
            if (!!c && c.length > 0) {
              //有身份证
              cno = c[0].CardNo;
            }
          }
        }
      }
      if ((cno!="")&&(this.data.isHiddenBirthday == false) && (this.data.oPassenger.Birthday != null) && (this.data.oPassenger.Birthday.length == 10)) {
        var b = getBirthday(cno);
        var bb = this.FormatDate(b);
        if (bb != this.data.oPassenger.Birthday) {
          this.data.oPassenger.Birthday = bb;
          var sex = getGender(cno);
          if (sex != this.data.oPassenger.Gender) {
            this.data.oPassenger.Gender = sex;
          }
          this.setData({ oPassenger: this.data.oPassenger });
          this.modalWarnShow("您的出生日期/性别与身份证不符，已为您自动更正", "知道了");
          return;
        }
      }
      if ((cno != "") && this.data.isHiddenGender == false && this.data.oPassenger.Gender != null && this.data.oPassenger.Gender != "") {
        var sex = getGender(cno);
        if (sex != this.data.oPassenger.Gender) {
          this.data.oPassenger.Gender = sex;
          this.setData({ oPassenger: this.data.oPassenger });
          this.modalWarnShow("您的出生日期/性别与身份证不符，已为您自动更正", "知道了");
          return;
        }
      }
      //保存SOA
      this.saveAction();
    }
    setTimeout(normal.bind(this),300);
  },
  //校验输入
  checkInputData:function(e){
    var that = this;
    var ret = true;
    //重置所有出错
    for(var i = 0;i < this.data.isWrongList.length;i++){
      this.data.isWrongList[i].iswrong = 0;
      this.data.wrongMsgList[i].msg = '';
    }
    this.setData({ isWrongList: this.data.isWrongList});
    this.setData({ wrongMsgList: this.data.wrongMsgList});

    var rez = /^[\u4e00-\u9fa5]+$/; //纯中文
    var rey = /^[a-zA-Z]+$/;  //纯英文
    var re = /^[\u4e00-\u9fa5a-zA-Z]+$/;  //中英文
    //中文名
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.CNName = this.data.oPassenger.CNName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    while(true){
      //至少2个字符
      if(this.data.oPassenger.CNName != ""){
        if(this.data.oPassenger.CNName.length <= 1){
          this.data.isWrongList[0].iswrong = 1;
          this.data.wrongMsgList[0].msg = '中文名请与证件姓名一致。';
          break;
        }
        if(this.data.oPassenger.CNName.length > 0){
          //第一个字必为中文
          if(!rez.test(this.data.oPassenger.CNName[0])){
            this.data.isWrongList[0].iswrong = 1;
            this.data.wrongMsgList[0].msg = '请填写正确的中文姓名，第一个汉字不可用拼音代替。';
            break;
          }
          //不能含有特殊字符
          if(!re.test(this.data.oPassenger.CNName)){
            this.data.isWrongList[0].iswrong = 1;
            this.data.wrongMsgList[0].msg = '姓名中的特殊符号无需输入。如：“汉祖然•买买提”填写为：汉祖然买买提';
            break;
          }
          //拼音后不可继续输入汉字
          var firstLetter = -1;
          for(var i = 0; i < this.data.oPassenger.CNName.length; i++){
            if(!rez.test(this.data.oPassenger.CNName[i])){
              firstLetter = i;
              break;
            }
          }
          if(firstLetter >= 0 && rez.test(this.data.oPassenger.CNName.substr(firstLetter))){
            this.data.isWrongList[0].iswrong = 1;
            this.data.wrongMsgList[0].msg = '拼音后不可继续输入汉字，汉字请用拼音代替。';
            break;
          }
        }
      }else if((e!=true)&&((this.data.notNullCNName==true)||((this.data.oPassenger.ENLastName == "") && (this.data.oPassenger.ENFirstName == "")))){
        this.data.isWrongList[0].iswrong = 1;
        this.data.isWrongList[1].iswrong = 1;
        this.data.isWrongList[2].iswrong = 1;
        this.data.wrongMsgList[0].msg = '请输入旅客姓名。';
        break;
      }else if((e!=true)&&(this.data.isHiddenCNName==false)&&(this.data.isHiddenAllCardType==false)&&(this.data.oPassenger.viewCardType == "1")){
        this.data.isWrongList[0].iswrong = 1;
        this.data.wrongMsgList[0].msg = '请输入旅客姓名。';
        break;
      }
      break;
    }
    //英文last
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.ENLastName = this.data.oPassenger.ENLastName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    //替换所有空格
    this.data.oPassenger.ENLastName = this.data.oPassenger.ENLastName.replace(/\s/g, '');    // 替换所有空格
    while(true){
      //英文姓名中无特殊符号
      if((e != true) &&(this.data.notNullEName==true)&&(this.data.oPassenger.ENLastName == "")){
         this.data.isWrongList[1].iswrong = 1;
        this.data.wrongMsgList[1].msg = '请输入旅客英文名称。';
        break;
      }
      if((this.data.oPassenger.ENLastName != "" && !rey.test(this.data.oPassenger.ENLastName))
        || (this.data.oPassenger.ENLastName == "" && this.data.oPassenger.ENFirstName != "")){
        this.data.isWrongList[1].iswrong = 1;
        this.data.wrongMsgList[1].msg = '英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。';
        break;
      }
      break;
    }

    //英文first/middle
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.ENFirstName = this.data.oPassenger.ENFirstName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.ENMiddleName = this.data.oPassenger.ENMiddleName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    //连续的空格仅仅保留一个
    this.data.oPassenger.ENFirstName = this.data.oPassenger.ENFirstName.replace(/\s+/g, ' ');
    this.data.oPassenger.ENMiddleName = this.data.oPassenger.ENMiddleName.replace(/\s+/g, ' ');
    while(true){
      if(this.data.oPassenger.ENFirstName != ""){
        //英文姓名中无特殊符号
        var testFirstName = this.data.oPassenger.ENFirstName ;
        testFirstName = testFirstName.replace(/\s+/g, '');
        if(!rey.test(testFirstName+ this.data.oPassenger.ENMiddleName)){
          this.data.isWrongList[2].iswrong = 1;
          this.data.wrongMsgList[2].msg = '英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。';
          break;
        }
        //姓和名相加的字符长度不能大于26
        if((this.data.oPassenger.ENLastName.length + testFirstName.length + this.data.oPassenger.ENMiddleName.length) > 26){
          this.data.isWrongList[2].iswrong = 1;
          this.data.wrongMsgList[2].msg = '英文姓和名总长度不能超过26个字符，若过长请使用缩写。姓中特殊符号不输入，名中用空格代替。如 Alejandro Gomez Monteverde缩写为：英文姓: MONTEVERDE 英文名: A G';
          break;
        }
      } else if(this.data.oPassenger.ENLastName != ""){
        this.data.isWrongList[2].iswrong = 1;
        this.data.wrongMsgList[2].msg = '英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。';
        break;
      }
      break;
    }
    if(e!=true){
      //旅客类型
      while(true){
        if(this.data.isHiddenPassengerType==false){
          if(this.data.oPassenger.PassengerType != 'A' && this.data.oPassenger.PassengerType != 'C'){
            this.data.isWrongList[9].iswrong = 1;
            this.data.wrongMsgList[9].msg = '请选择旅客类型';
            break;
          }
          break;
        }
        break;
      }
      //证件号
      while(true){
        if(this.data.isHiddenAllCardType==false){
          if(this.data.oPassenger.PassengerType == 'C'){
          break;
        }
        if(this.data.oPassenger.viewCardType == '1' || this.data.oPassenger.viewCardType == '25'){
          if(!IdentityCodeValid(this.data.oPassenger.viewCardNo)){
            this.data.isWrongList[4].iswrong = 1;
            if(this.data.oPassenger.viewCardType == '1'){
              this.data.wrongMsgList[4].msg = '请输入正确的身份证号';
            }else{
              this.data.wrongMsgList[4].msg = '请输入正确的户口薄号';
            }
            break;
          }
        }else{
          if(this.data.oPassenger.viewCardNo == '' || !/^[ a-zA-Z0-9]+$/.test(this.data.oPassenger.viewCardNo)){
          this.data.isWrongList[4].iswrong = 1;
          this.data.wrongMsgList[4].msg = '请输入正确的证件号';
          break;
        }
      }
      break;
      }
      break;
    }
    //证件有效期
    while(true){
       if((this.data.cardLimitHidden==false)&&(this.data.oPassenger.viewCardTimelimit == '')&&(this.data.notNullCardLimit==true)){
        this.data.isWrongList[5].iswrong = 1;
        this.data.wrongMsgList[5].msg = '请输入正确的证件有效期';
        break;
      }
      break;
    }
    //国籍
    while(true){
      if((this.data.isHiddenCountryName==false)&&(this.data.oPassenger.Nationality == '')&&(this.data.notNullCountryName==true)){
        this.data.isWrongList[6].iswrong = 1;
        this.data.wrongMsgList[6].msg = '请选择国籍';
        break;
      }
      break;
    }
    //性别
    while(true){
      if((this.data.notNullGender==true)&&(this.data.isHiddenGender==false)){
      if ((this.data.oPassenger.Gender != 'M') && (this.data.oPassenger.Gender != 'F')){
        this.data.isWrongList[7].iswrong = 1;
        this.data.wrongMsgList[7].msg = '请选择性别';
        break;
      }
      }
      break;
    }
    //出生日期
    while(true){
      if((this.data.isHiddenBirthday==false)&&(this.data.notNullBirthday==true)){
      if (this.data.oPassenger.Birthday.length != 10){
        this.data.isWrongList[8].iswrong = 1;
        this.data.wrongMsgList[8].msg = '请输入正确的出生日期';
        break;
      }
      break;
      }
      break;
    }
 //手机号码
    while(true){
      if((this.data.isHiddenMobilePhone==false)&&(this.data.notNullMobilePhone==true)){
      if (this.data.oPassenger.MobilePhone.length<=0){
        this.data.isWrongList[10].iswrong = 1;
        this.data.wrongMsgList[10].msg = '请输入正确的手机号码';
        break;
      }
      }
      if((this.data.oPassenger.MobilePhone!="")&&(!/^(1)\d{10}$/.test(this.data.oPassenger.MobilePhone))){
          this.data.isWrongList[10].iswrong = 1;
          this.data.wrongMsgList[10].msg = '请输入正确的手机号码';
          break;
        }
      break;
    }
  }
    //显示出错样式
    var wrongCnt = this.data.wrongMsgList.filter(o=>o.msg != '');
    if (wrongCnt.length > 0){
      ret = false;
      if (wrongCnt.length == 1){
        //只有一种错时弹出确认框
        this.modalWarnShow(wrongCnt[0].msg);
      }else{
        //多于一个错显示上方提示条
        this.setData({ topWarnTipHidden: false});
        setTimeout(function(){
          that.setData({ topWarnTipHidden: true});
        },3000);
      }
    }
    this.setData({ isWrongList: this.data.isWrongList});
    this.setData({ wrongMsgList: this.data.wrongMsgList});
    this.setData({ oPassenger: this.data.oPassenger});
    return ret;
  },
  //重置出错项目样式
  resetItemStat:function(){
    this.data.isWrongList = [{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0}],
    this.data.wrongMsgList = [{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''}],
    this.setData({ isWrongList: this.data.isWrongList });
    this.setData({ wrongMsgList: this.data.wrongMsgList });
  },
  //保存
  saveAction:function(){
    var that = this;
    var Parameters = [];
    var ParameterItem;
    ParameterItem = { "Key": "BizType", "Value": "BASECWX" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "BookingType", "Value": "N" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "InputType", "Value": "U" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "EditType", "Value": this.data.isEdit };
    Parameters.push(ParameterItem);
    var cardObj = [];
    if(this.data.isHiddenAllCardType==false){
    if (this.data.oPassenger.PassengerType != 'C'){
      cardObj = [{
        CardType: this.data.oPassenger.viewCardType ,CardNo: this.data.oPassenger.viewCardNo, CardTimelimit: this.data.oPassenger.viewCardTimelimit
      }]
    }
    }
    var CommonPassenger = {
      "PassengerID": this.data.oPassenger.PassengerID,
      "PassengerType": this.data.oPassenger.PassengerType,
      "CNName": ((this.data.oPassenger.CNName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.CNName),    // 6.11 修改
      "ENLastName": ((this.data.oPassenger.ENLastName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.ENLastName),
      "ENFirstName": ((this.data.oPassenger.ENFirstName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.ENFirstName),
      "ENMiddleName": ((this.data.oPassenger.ENMiddleName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.ENMiddleName),
      "CommonPassengerCard": cardObj,
      "Birthday": this.data.oPassenger.Birthday,
      "Gender": this.data.oPassenger.Gender,
      "Nationality": this.data.oPassenger.Nationality,
      "MobilePhone":((this.data.oPassenger.MobilePhone == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.MobilePhone)
    }
    var paramsoa = {"Parameters" : Parameters, "CommonPassenger":CommonPassenger};
    //LOADING ON
    that.showLoading();
    cwx.request({
      url: that.data.soaSaveUrl,
      data: paramsoa,
      success: function(res) {
        //LOADING OFF
        that.hideLoading();
        var data = res.data;
        if (data.ResponseStatus.Ack == "Success" && data.Result.Result == "0"){
          setTimeout(function(){
            that.showToast('保存成功');
            setTimeout(that.toastSuccessChange,1500);
          },500);
        }else{
          if (data.ResponseStatus.Ack == "Failure") {
            if (data.Result != null) {
              that.modalWarnShow("保存失败，请重试，错误码" + data.Result.Result);
            } else {
              that.showModalLoginPage();
            }
          }
        }
      },
      fail:function(data){
        //LOADING OFF
        that.hideLoading();
        that.modalWarnShow("保存失败，请重试。");
      }
    })
  },
  //返回列表
  toastSuccessChange:function(){
    var that = this;
    this.setData({ oPassenger: {PassengerID : 0} });
    this.setData({ isShowEditPage: 'F'});
    this.backFromEdit();
  },
  //从SOA获取国籍信息
  getCountryData:function(){
    var that = this;
    if (!!that.data.allCountry && that.data.allCountry.length > 0){
      //已有所有国籍数据
      //根据国籍代码取中文
      that.data.oPassenger.viewNationality = that.getCountryNm(that.data.oPassenger.Nationality);
      that.setData({ oPassenger: that.data.oPassenger});
      //为国籍滚筒设定初选项
      that.data.allCountryIndex = that.data.allCountryName.indexOf(that.data.oPassenger.viewNationality);
      if (that.data.allCountryIndex < 0) {that.data.allCountryIndex = 0};
      that.setData({ allCountryIndex: that.data.allCountryIndex});
    }else{
      //从服务调取所有国籍数据
      var soadata = {};
      cwx.request({
        url: that.data.allCountrySoaUrl,
        data: soadata,
        success: function(res) {
          var data = res.data;
          if (data.result.resultCode === 0 && data.ResponseStatus.Ack == "Success"){
            that.data.allCountry = data.countryInfoListHot;
            that.data.allCountry = that.data.allCountry.concat(data.countryInfoListByFirstLetter);
            that.setData({ allCountry: that.data.allCountry});
            that.data.allCountryCode = that.data.allCountry.map(o=>o.scode);
            that.setData({ allCountryCode: that.data.allCountryCode});
            that.data.allCountryName = that.data.allCountry.map(o=>o.name);
            that.setData({ allCountryName: that.data.allCountryName});
            //根据国籍代码取中文
            that.data.oPassenger.viewNationality = that.getCountryNm(that.data.oPassenger.Nationality);
            that.setData({ oPassenger: that.data.oPassenger});
            //为国籍滚筒设定初选项
            that.data.allCountryIndex = that.data.allCountryName.indexOf(that.data.oPassenger.viewNationality);
            if (that.data.allCountryIndex < 0) {that.data.allCountryIndex = 0};
            that.setData({ allCountryIndex: that.data.allCountryIndex});
          }
        },
        fail:function(data){
        },
      })
    }
  },
  getCardTypeData: function () {
    var self = this;
    var soadata = {};
    cwx.request({
      url: "/restapi/soa2/13867/getCardTypeList.json",
      data: soadata,
      success: function (res) {
        var data = res.data;
        var tmpcards = [];
        if (data.result != null && data.result.resultCode == 0 && data.ResponseStatus.Ack == "Success" && data.cardTypeList != null && data.cardTypeList.length > 0) {
          data.cardTypeList.forEach(function (item) {
            var card = { 'id': Number(item.cardTypeCode), 'name': item.cNName };
            tmpcards.push(card);
          });
          self.data.cardTypeList = tmpcards;
          self.setData({cardTypeList: self.data.cardTypeList});
        } else {
          self.data.cardTypeList = self.data.cardTypeListOld;
          self.setData({ cardTypeList: self.data.cardTypeList });
        }
        self.getCardTypeByUserSetting();
        self.getDataFromSoa();
      },
      fail: function () {
        self.data.cardTypeList = self.data.cardTypeListOld;
        self.setData({ cardTypeList: self.data.cardTypeList });
        self.getCardTypeByUserSetting();
        self.getDataFromSoa();
      }
    })
  },
  getCardTypeByUserSetting:function(){
    var that=this;
    this.data.displayitemCodes.forEach(function (item) {
      if (item.length && item.length >= 2) {
        if (item[0] == 2 && item.length > 2) {
          that.data.cardTypeDefault = Number(item[2]);
        } else if (item[0] == 7 && item.length > 2) {
          that.data.cardTypeDefault = Number(item[2]);
        } else if (item[0] == 10 && item.length > 2) {
            that.data.cardTypeDefault = Number(item[2]);
          }
        }
      if (!item.length && !!item.id && Number(item.id)) {
        var cardTypeID = Number(item.id);
        var cardTypes = that.data.cardTypeList.filter(o => o.id == cardTypeID);
        if (!!cardTypes && cardTypes.length > 0) {
          var cardTypeUser = {"id": cardTypeID, "name": cardTypes[0].name};
          that.data.cardTypelistByUserSetting.push(cardTypeUser);
        }
      }
    });
    var defaultCardType = that.data.cardTypeList.filter(o => o.id == that.data.cardTypeDefault);
    if (defaultCardType==null || defaultCardType.length<=0){
      that.data.cardTypeDefault = null;
    }
    if (!!that.data.cardTypelistByUserSetting && that.data.cardTypelistByUserSetting.length>0){
      if (that.data.cardTypeDefault != null){
        var defaultCard = that.data.cardTypelistByUserSetting.filter(o => o.id == that.data.cardTypeDefault);
        if ((defaultCard == null || defaultCard.length <= 0)) {
          var cardTypeUser = { "id": defaultCardType[0].id, "name": defaultCardType[0].name };
          that.data.cardTypelistByUserSetting.push(cardTypeUser);
        }
      }else{
        var defaultCard1 = this.data.cardTypelistByUserSetting.filter(o => o.id == 1);
        var defaultCard2 = this.data.cardTypelistByUserSetting.filter(o => o.id == 2);
        if (defaultCard1 == null || defaultCard2 == null || defaultCard1.length <= 0 || defaultCard2.length <= 0){
          that.data.cardTypeDefault = that.data.cardTypelistByUserSetting[0].id;
        }
      }
    }
    this.setCardList();
  },
  setCardList:function(){
    var self=this;
    var cardtmpid=[];
    var cardtmpnames=[];
    if (!!self.data.cardTypelistByUserSetting && self.data.cardTypelistByUserSetting.length > 0){
      cardtmpid = self.data.cardTypelistByUserSetting.map(o => o.id);
      cardtmpnames = self.data.cardTypelistByUserSetting.map(o => o.name);
    }else{
      cardtmpid= self.data.cardTypeList.map(o => o.id);
      cardtmpnames= self.data.cardTypeList.map(o => o.name);
    }
    self.data.cardTypeCodeList = cardtmpid;
    self.setData({ cardTypeCodeList: self.data.cardTypeCodeList });
    self.data.cardTypeNameList = cardtmpnames;
    self.setData({ cardTypeNameList: self.data.cardTypeNameList });
  },
  //国籍码转中文
  getCountryNm:function(countryCd){
    var country = this.data.allCountry.filter(o => o.scode == countryCd);
    if (country.length > 0){
      return country[0].name;
    }
    return "";
  },

  //根据证件类型获得证件号
  GetCardTypeName:function(cardtype){
    var cardText;
    if (!!this.data.cardTypelistByUserSetting && this.data.cardTypelistByUserSetting.length > 0) {
      var cardTypeID = Number(cardtype);
      var cardTypes = this.data.cardTypelistByUserSetting.filter(o => o.id == cardTypeID);
      if (!!cardTypes && cardTypes.length > 0) {
        return cardTypes[0].name;
      }
      return "";
    }
    if (!!this.data.cardTypeList && this.data.cardTypeList.length>0){
      var cardTypeID = Number(cardtype);
      var cardTypes = this.data.cardTypeList.filter(o => o.id == cardTypeID);
      if (!!cardTypes && cardTypes.length > 0) {
        return cardTypes[0].name;
      }
      return "未知证件";
    }
    switch (+cardtype) {
      case 0 : cardText = "未知证件";break;
      case 1 : cardText = "身份证";break;
      case 2 : cardText = "护照";break;
      case 3 : cardText = "学生证";break;
      case 4 : cardText = "军人证";break;
      case 6 : cardText = "驾驶证";break;
      case 7 : cardText = "回乡证";break;
      case 8 : cardText = "台胞证";break;
      case 10 : cardText = "港澳通行证";break;
      case 11 : cardText = "国际海员证";break;
      case 20 : cardText = "外国人永久居留证";break;
      case 21 : cardText = "旅行证";break;
      case 22 : cardText = "台湾通行证";break;
      case 23 : cardText = "士兵证";break;
      case 24 : cardText = "临时身份证";break;
      case 25 : cardText = "户口簿";break;
      case 26 : cardText = "警官证";break;
      case 27 : cardText = "出生证明";break;
      case 99 : cardText = "其他";break;
      default : cardText = "未知证件";break;

    }
    return cardText;
  },
  //时期转换
  FormatDate:function(date){
    var d = "";
    if (date != "") {
        var birthDay = new Date(date.replace(/-/g, "/"));
        var month = birthDay ? birthDay.getMonth() + 1 : undefined,date = birthDay ? birthDay.getDate() : undefined;
        month = month < 10 ? "0" + month : month;
        date = date < 10 ? "0" + date : date;
        d = birthDay.getFullYear() + "-" + month + "-" + date;
        if (birthDay == "1-01-01") {
          d = "";
        }
    }
    return d;
  },

  //************************************************************
  //***************************公用*****************************
  //************************************************************
  //显示TOAST
  showToast:function(msg){
    cwx.showToast({
      title: msg,
      icon: 'success'
    })
  },
  showLoading:function(){
    cwx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration : 10000
    })
  },
  hideLoading:function(){
    cwx.hideToast()
  },
  //查询接口失败后弹窗
  modalRetryShow: function(msg) {
    var that =this;
    cwx.showModal({
      title: '提示',
      content: msg,
      confirmText:'重试',
      success: function(res) {
        if (res.confirm == 1) {
          that.getDataFromSoa();
        }
      }
    })
  },
  //错误提示显示
  modalWarnShow:function(msg,btnText){
    var btext = btnText ?btnText:"确定";
    cwx.showModal({
      title: '提示',
      content: msg,
      confirmText: btext,
      showCancel : false,
      success: function(res) {
        if (res.confirm == 1) {}
      }
    })
  },
 GetWrongMsg:function(msgCd){
    var msg = "";
    switch(msgCd){
      case 1001:
        msg = "暂不支持儿童婴儿购票";
        break;
      case 1002:
        msg = "票量不足，请选择其他产品";
        break;
        case 1003:
        msg="出行人信息缺失，请补全后重新选择";
        break;
      default:
       msg = "此旅客信息不符合订单要求！";
        break;
    }
    return msg;
  },
  //无法选中时去修改
  modalCantSelectToEdit: function(msg,oP) {
    var that =this;
    cwx.showModal({
      title: '提示',
      content: msg,
      confirmText:'修改',
      success: function(res) {
        if (res.confirm == 1) {
          //去编辑页
          var param = that.MakeSoaParam(oP.PassengerID,1);
          cwx.request({
            url: that.data.soaurl,
            data: param,
            success: function(res) {
              var datasoa = res.data;
              if (datasoa.Result.Result == "0" && datasoa.ResponseStatus.Ack == "Success" && !!datasoa.CommonPassengers && datasoa.CommonPassengers.length == 1){
                that.setData({ oPassenger: datasoa.CommonPassengers[0] });
                that.showEditPage();
              }else{
                that.modalWarnShow('数据加载失败，请重试!');
              }
            },
            fail:function(res){
              that.modalWarnShow('数据加载失败，请重试!');
            },
          });
        }
      }
    })
  },
  //设定中文
  selectedCHLanguage:function(e){
     var normal = function(){
     //校验逻辑
    if (!this.checkInputData(true)){
      return;
    }
    this.data.isHiddenCNName = false;
    this.data.isHiddenEName = true;
    this.setData({isHiddenCNName:this.data.isHiddenCNName});
    this.setData({isHiddenEName:this.data.isHiddenEName});
    var vcardType="1";
    if (this.data.cardTypeDefault != null) {
      vcardType = this.data.cardTypeDefault;
    }
    if(this.data.isEdit=="0"){
      this.data.oPassenger.viewCardType = vcardType;
      this.data.oPassenger.viewCardTypeCN = this.GetCardTypeName(vcardType);
      this.data.oPassenger.viewCardNo ="";
      this.data.oPassenger.viewCardTimelimit ="";
      this.setData({ oPassenger: this.data.oPassenger});
    }else{
      if (!!this.data.oPassenger.CommonPassengerCard && this.data.oPassenger.CommonPassengerCard.length >= 2){
        var currCardType = this.data.oPassenger.CommonPassengerCard.filter(o=>o.CardType==vcardType);
        if (!!currCardType && currCardType.length > 0 && currCardType[0].CardType == vcardType){
          this.data.oPassenger.viewCardType = vcardType;
          this.data.oPassenger.viewCardTypeCN = this.GetCardTypeName(vcardType);
          this.data.oPassenger.viewCardNo = currCardType[0].CardNo;
          this.data.oPassenger.viewCardTimelimit = currCardType[0].CardTimelimit;
          this.setData({ oPassenger: this.data.oPassenger });
        }
      }
    }
  }
  setTimeout(normal.bind(this),300);
  },
  //设定英文
  selectedENLanguage:function(e){
     var normal = function(){
         //校验逻辑
    if (!this.checkInputData(true)){
      return;
    }
    var vcardType="2";
    if (this.data.cardTypeDefault != null) {
      vcardType = this.data.cardTypeDefault;
    }
    if(this.data.isEdit=="0"){
      this.data.oPassenger.viewCardType = vcardType;
      this.data.oPassenger.viewCardTypeCN = this.GetCardTypeName(vcardType);
      this.data.oPassenger.viewCardNo ="";
      this.data.oPassenger.viewCardTimelimit ="";
      this.setData({ oPassenger: this.data.oPassenger});
    }else{
      if (!!this.data.oPassenger.CommonPassengerCard && this.data.oPassenger.CommonPassengerCard.length >= 2){
        var currCardType = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == vcardType);
        if (!!currCardType && currCardType.length > 0 && currCardType[0].CardType == vcardType) {
          this.data.oPassenger.viewCardType = vcardType;
          this.data.oPassenger.viewCardTypeCN = this.GetCardTypeName(vcardType);
          this.data.oPassenger.viewCardNo = currCardType[0].CardNo;
          this.data.oPassenger.viewCardTimelimit = currCardType[0].CardTimelimit;
          this.setData({ oPassenger: this.data.oPassenger });
        }
      }
    }
    this.data.isHiddenCNName = true;
    this.data.isHiddenEName = false;
    this.setData({isHiddenCNName:this.data.isHiddenCNName});
    this.setData({isHiddenEName:this.data.isHiddenEName});
  }
  setTimeout(normal.bind(this),300);
  },
  //提示用户去登录
  showModalLoginPage:function(){
    wx.showModal({
      title: '提示',
      content: '您的登录态已过期，请重新登录',
      confirmText: '去登录',
      success: function (res) {
        res.confirm ? this.gotoLoginPage() : cwx.navigateBack();
      }.bind(this)
    });
  },
  gotoLoginPage:function(){
    var self = this;
    cwx.user.login({
      callback: function (res) {
        res.ReturnCode == 0 && wx.showToast({
          title: res.Message,
          icon: "success",
          duration: 1000,
          complete: function () {
            setTimeout(function () {
              wx.hideToast();
              cwx.navigateBack();
            }, 1000)
          }
        });
      }
    });
  },
})

//证件打码
function MaskIDNumber(value){
  if(!value){return ''}
  if (value.length > 3){
    return DoMask(value, parseInt(value.length / 3), value.length - parseInt(value.length / 3) - 2);
  }else{
    return MaskRange(value, 0, value.length);
  }
}

function MaskRange(value,rangeStart,rangeLength){
  if (value.length < 3 || rangeLength < 3){
    return value;
  }
  var maskStart = rangeStart + parseInt(rangeLength / 3);
  var maskLength = parseInt(rangeLength / 3) + 1;
  return DoMask(value, maskStart, maskLength);
}

function DoMask(value, maskStart, maskLength){
  var result = '';
  var maskEnd = maskStart + maskLength - 1;
  for (var i = 0;i< value.length;i++){
    if (i>=maskStart && i<=maskEnd){
      result += '*';
    }else{
      result += value[i];
    }
  }
  return result;
}
//手机打码
function MaskMobile(value){
  if (value.length > 11){
    return MaskRange(value, value.length - 11, 11);
  } else{
    return MaskRange(value, 0, value.length);
  }
}
//验证身份证
function IdentityCodeValid(code) {
  var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
  var pass= true;
  if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
      pass = false;
  }else if(!city[code.substr(0,2)]){
    pass = false;
  }else{
    //18位身份证需要验证最后一位校验位
    if(code.length == 18){
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
      //校验位
      var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++)
        {
          ai = code[i];
          wi = factor[i];
          sum += ai * wi;
        }
      var last = parity[sum % 11];
      if(parity[sum % 11] != code[17]){
       pass =false;
      }
    }
  }
  return pass;
}
//根据身份证获取出生日期
function getBirthday(idCard) {
  if (idCard.length == 18){
    var birth =  idCard.slice(6, 14);
    //18位：提取第17位数字；15位：提取最后一位数字
    var order =  idCard.slice(-2, -1) ;
    var b =  ([birth.slice(0, 4), birth.slice(4, 6), birth.slice(-2)]).join('-');
    return b;
  }else{
    var birth = idCard.slice(6, 12);
    //18位：提取第17位数字；15位：提取最后一位数字
    var order = idCard.slice(-1);
    var b = (['19' + birth.slice(0, 2), birth.slice(2, 4), birth.slice(-2)].join('-'));
    return b;
  }
}
//根据身份证获取性别
function getGender(idCard) {
  var birth = (idCard.length == 18) ? idCard.slice(6, 14) : idCard.slice(6, 12);
  //18位：提取第17位数字；15位：提取最后一位数字
  var order = (idCard.length == 18) ? idCard.slice(-2, -1) : idCard.slice(-1);
  //余数为0代表女性，不为0代表男性
  var sex = (order % 2 === 0 ? 'F' : 'M');
  return sex;
}