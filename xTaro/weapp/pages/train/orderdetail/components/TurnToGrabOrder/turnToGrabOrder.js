import cwx from '../../../../../cwx/cwx';
import { pay } from '../../../booking/util/booking.util';
import { shared } from '../../../common/trainConfig';
import {
  TrainGrabFastBuyTicketDetailModel,
  TrainGrabFastCreateOrderModel,
  GetJLSuccessRateModel
} from '../../../common/model';
import util from '../../../common/util';
import { calculateSuccessRate, handleGrabRate, getTrainSuccessRangeList} from '../../../common/common'

export default {
    data: {
      canCreditPay:false,
    },

    methods: {
      async getGrabInfo(orderInfo){

        // 访问页面时触发，代页面uv
        util.ubtTrace('s_trn_c_10320640941', {exposureType: 'pv', bizKey: 'pageviewExposure'});
        // 只有余票不足的订单才会去请求是否显示转抢这个接口，就是alertinfo.alertType === 11

        if( orderInfo.AlertInfo?.AlertType  !== 11 ){
          return
        }
        const defer = util.getDeferred();
        // 成功率转汉字
        await getTrainSuccessRangeList();
        // 处理车票信息
        this.dealTicketInfo(orderInfo);
        // 发车时间判断：是否小于两个小时
        if(!this.isTimeGapQualified()){
          return
        }


        const params = {
          Channel:'ctripwx',
          OrderNumber:orderInfo.OrderId,
          OrderType:orderInfo.OrderType ,
          FailReasonType: 2,
        };
        TrainGrabFastBuyTicketDetailModel(params,data=>{

          const { IsShow = false, TrainPackageProductList} = data;
          if (!TrainPackageProductList) return
          TrainPackageProductList.splice(2);
          if(IsShow){
            util.ubtTrace('s_trn_c_10320640941', {exposureType: 'normal', bizKey: 'transferGrab', orderId:''+orderInfo.OrderId});
          }
          this.setData({
            isShowTurnToGrab:IsShow,
            TrainPackageProductList,
            grabShowInfo:data,
          })
          defer.resolve()
          this.dealPackage();
          // 获取成功率
          this.getGrabSucRate();
        });


        // 只有主板支持信用付
        if(shared.isCtripApp) {
          // 信用付开关
          // this.getFastPayInfo();
          // 是否免密支付
          this.getPreHoldStatus();
        }
        return defer.promise;
      },
      // 处理加速包
      dealPackage() {
        const { TrainPackageProductList = [] } = this.data;
        const defaultPackage = TrainPackageProductList[0] ;
        const normalPackage = TrainPackageProductList[1] ;

        try {
          defaultPackage.fastAlertInfoList = defaultPackage.ExtendList.find(item => item.Key === 'guide_create_tips').Value.split('|');
          defaultPackage.normalAlertInfoList = defaultPackage.ExtendList.find(item => item.Key === 'guide_create_tips_prepay').Value.split('|');
          defaultPackage.desList = defaultPackage.ExtendList.find(item => item.Key === 'guide_create_tips_holdseatfail').Value.split('|');

        }catch(e) {
          defaultPackage.fastAlertInfoList = ['越早下单，出票越容易！','取消订单或抢票失败自动全额退款','您已开通信用付，抢到票后再付钱(抢至发车前两小时)'];
          defaultPackage.normalAlertInfoList = ['越早下单，出票越容易！','取消订单或抢票失败自动全额退款','需预付订单金额，抢至发车前两小时'];
          defaultPackage.desList = ['越早下单，成功率越高','购票失败全额退款']
        }

        this.setData({
          defaultPackage,
          normalPackage
        })
      },
      // 处理列车信息
      dealTicketInfo(orderInfo){
        const {
          TrainNumber,
          DepartStation,
          ArriveStation,
          DepartDate,
          DepartTime,
          SeatName,
          TicketPrice,
          PassengerInfos = []
        } = orderInfo.TicketInfos[0];
        PassengerInfos.map(pas => {
          if(pas.TicketType === 2){
            pas.PassengerName = pas.PassengerName +'(儿童)'
          }else if(pas.TicketType === 3){
            pas.PassengerName = pas.PassengerName +'(学生)'
          }
          return pas;
        } )
        // 获取乘客名字符串
        const showPasStr = PassengerInfos.reduce((pre,cur) => {
          return pre.length ? `${pre} 、${cur.PassengerName}`:`${cur.PassengerName}`;
        },'');
        const departTimeStr = DepartDate+' '+ DepartTime + ':00';
        const showDepartDate = new Date(DepartDate).getMonth() + 1 + '月' + new Date(DepartDate).getDate() + '日';
        const ticketInfo = {
          TrainNumber,
          DepartStation,
          ArriveStation,
          DepartDate,
          DepartTime,
          SeatName,
          TicketPrice,
          PassengerInfos,
          showPasStr,
          departTimeStr,
          showDepartDate
        }
        this.setData({
          ticketInfo
        })
      },
      // 判断时间跟发车时间是否大于2小时
      isTimeGapQualified() {
        const { ticketInfo } = this.data;
        const departTimeStr = ticketInfo.departTimeStr.replace(new RegExp("-","gm"),"/");
        const DepartTimeMS = (new Date(departTimeStr)).getTime();
        const curMS = new Date().getTime();
        const gapHours = (DepartTimeMS - curMS ) / (1000 * 60 * 60);
        if( gapHours > 2) {
          return true;
        }
        return false;
      },
      // 获取信用付信息
      // getFastPayInfo() {
      //   if (shared.isCtripApp) {
      //     // 目前只有主版有信用付
      //     setConfigSwitchAsyncPromise(
      //         'train_wx_booking_isopenfastpay',
      //         'isOpenFastPay',
      //     ).then(([res]) => {
      //         this.setData({
      //             canCreditPay: res,
      //         })
      //     })
      //   }
      // },

      // 判断是否支持微信免密支付,只有微信主版支持
      getPreHoldStatus() {
        cwx.payment.getHoldResult({
            bustype: 4,
            auth: cwx.user.auth,
        },
        res => {
            console.log(res)
            if (res.result == 1) {
                this.setData({
                    isAuthPrePay: true,
                })
                console.log('为已授权代扣')
            } else if (res.result == 0) {
                this.setData({
                    isAuthPrePay: false,
                })
                console.log('为未授权代扣')
            } else {
                console.log('获取授权失败')
            }
        },
        )
      },
      // 获取成功率
      getGrabSucRate() {
        const { ticketInfo } = this.data;
        const JLExpiredTime = new Date(ticketInfo.departTimeStr).getTime() - 1000 * 60 * 60 * 2;
        const params = {
          TrainNumbers:ticketInfo.TrainNumber,
          SeatNames:ticketInfo.SeatName,
          GrabType:0,//0:按车次抢，1:按时间段
          AllDepartStation:ticketInfo.DepartStation,
          AllArriveStation:ticketInfo.ArriveStation,
          TimeLine:'',
          TrainTypes:'',//车型(G,D,C,O)
          JLAlternativeDate:ticketInfo.DepartDate,//	备选日期逗号隔开(2016-10-12,2016-...
          JLExpiredTime,//抢票截止时间 yyyyMMddHHmmss
          JLExpiredTimeOffset:120,//	int	抢票截止时间偏移量
          PassengerCount:ticketInfo.PassengerInfos?.length,//	int	乘客人数
          IsReservationOrder:false,//	bool	是否预约票
          StationsMap:[
            {
              DepartStation:ticketInfo.DepartStation,
              ArriveStation:ticketInfo.ArriveStation
            }
          ],
          IsSaleRecommendGrabIns:false,//	bool	是否售卖推荐的安心抢
          IsSupportDoubleTunnel:true,//	bool	用户账户是否支持双通道
          VendorId:0,
        };
        GetJLSuccessRateModel(params,data => {
          const { SuccessRate = 0 } = data;
          const calcParams = {
            selectPackage : {
              PackagePrice:this.data.defaultPackage.PackagePrice
            },
            basicSuccessRate:SuccessRate,
            allPas:this.data.ticketInfo.PassengerInfos
          }
          // 快速抢票成功率
          const defalutJLSuccessRate = calculateSuccessRate(calcParams)
          this.setData({
            jLSuccessRate:SuccessRate,
            defalutJLSuccessRate,
            defalutJLSuccessRateShow: handleGrabRate(defalutJLSuccessRate)
          })
        })
      },
      // 点击banner按钮
      onClickGrabOrder(e) {
        if( !this.isTimeGapQualified() ){
          util.showToast('该车次已停止抢票！');
          return;
        }
        const { packageType, traceType } = e.currentTarget.dataset;
        const {orderInfo} = this.data;
        // 点击埋点
        switch (traceType) {
          case 'banner-kuaisu':
            util.ubtTrace('c_trn_c_10320640941', {bizKey: 'transferGrabClick', clickType:1, orderId:''+orderInfo.OrderId});
            break;
          case 'banner-disu':
            util.ubtTrace('c_trn_c_10320640941', {bizKey: 'transferGrabClick', clickType:0, orderId:''+orderInfo.OrderId});
            break;
          case 'drawer-disu':
            util.ubtTrace('c_trn_c_10320640941', {bizKey: 'transferGrabActionbarClick', clickType:0, orderId:''+orderInfo.OrderId});
            break;
          case 'drawer-kuaisu':
            util.ubtTrace('c_trn_c_10320640941', {bizKey: 'transferGrabActionbarClick', clickType:1, orderId:''+orderInfo.OrderId});
            break;

        };

        let pkg = {};
        if( packageType === 'normal'){
          pkg = this.data.normalPackage;
        }else if( packageType === 'default'){
          pkg = this.data.defaultPackage;
          this.setData({
            jLSuccessRate:+this.data.defalutJLSuccessRate / 100
          })
        }

        this.grabFastCreateOrder(pkg,this.data.orderInfo)
      },


      // 信用付预先提交订单
      // preOrderCreate(outParams = {}, pkg = {}) {
      //   const deferred = util.getDeferred();
      //   const { ticketInfo } = this.data;
      //   const totalPrice = ticketInfo.PassengerInfos.length * (pkg.PackagePrice + ticketInfo.TicketPrice);
      //   PreOrderCreate(outParams, {
      //       isAuthPrePay: this.data.isAuthPrePay,
      //       totalPrice: totalPrice,
      //       title: ticketInfo.DepartStation + ' ⇀ ' + ticketInfo.ArriveStation,
      //   }).then(({
      //       isAuthPrePay,
      //       PreOrderId,
      //   }) => {
      //       if (isAuthPrePay) {
      //         console.log('preOrderCreate',isAuthPrePay)
      //         outParams.params.PreOrderId = PreOrderId;
      //         outParams.params.IsUseFastPay = true;
      //       }
      //       deferred.resolve();
      //   })
      //   return deferred.promise;
      // },

      // 下单接口
      async grabFastCreateOrder(pkg = {},orderInfo,) {
        if (this.isInSubmitAction) {
          console.log('重复提交订单拦截');
          return;
        }
        this.isInSubmitAction = true;
        setTimeout(() => {
            this.isInSubmitAction = false;
        }, 2000);
        const { grabShowInfo, jLSuccessRate } = this.data;
        const {timeOffset = 120} =  grabShowInfo.CtripJLExpiredTimeInfo?.JLExpiredTimeOffsetList[0];
        // const isGrabFastPay = canCreditPay && isAuthPrePay && grabShowInfo.IsUseFastPay;
        const params = {
          OrderNumber:orderInfo.OrderId,
          Channel:'ctripwx',
          JlExpiredTimeOffset:timeOffset,
          IsUseFastPay:false,
          PreOrderId:'',
          VerificationCodeToken:'',
          VerificationCodeRid:'',
          SuccessRate:jLSuccessRate,
          PackageInfo:{
            PackageID:pkg.PackageID,
            PackageCount:orderInfo.TicketInfos[0].PassengerInfos.length,
            GrabBuyPackageID:0,
            GrabBuyPackageFromType:0,
            AppendList:[]
          }
        }
        // if(isGrabFastPay) {
        //   await this.preOrderCreate({params},pkg);
        // }

        TrainGrabFastCreateOrderModel(params, data => {
          if (data.RetCode !== 0) {
            util.showModal({
              m: data.Message || '该车次暂时无法抢票！',
            })
            return
          }
          // if(isGrabFastPay){
          //   goDetail(data.OrderId, '', isGrabFastPay);
          //   return;
          // }

          if(data.OrderAmount === 0){
            util.showModal({
              m: data.Message|| '该车次暂时无法抢票！',
            })
          }else{
            const orderData = {
              OrderId:data.OrderId,
              amount:data.OrderAmount
            }
            pay(orderData, {
              title: this.data.ticketInfo.DepartStation +
                  ' ⇀ ' +
                  this.data.ticketInfo.ArriveStation,
              type: 'grab',
              subscribeVip: false,
              grabWithVip: false,
            })
          }
        },err => {
          util.showModal({
            m: '该车次暂时无法抢票！',
          })
        });
      },

      hideBack() {
        this.setData({
          popType:''
        })
      }
  }
}
