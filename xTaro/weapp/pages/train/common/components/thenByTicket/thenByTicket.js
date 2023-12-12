import cDate from '../../../common/cDate';

export function getThenByTicketInfo(thenByTrain, seatName, options = {}) {
  if (!thenByTrain.solutionInfoList?.length) return null;
  // 目前都是默认取第一个 所以下面这行约等于没用
  let solutionInfo = thenByTrain.solutionInfoList.find(
    (v) => v.recommendSeatType === seatName || v.seatType === seatName
  );
  if (seatName !== 'DEFAULT' && !solutionInfo) return null;
  solutionInfo = JSON.parse(
    JSON.stringify(
      seatName === 'DEFAULT' ? thenByTrain.solutionInfoList[0] : solutionInfo
    )
  );
  const { recommendArriveType, recommendDepartType } = solutionInfo;
  const { productUrlConfig } = options;
  // solutionType : 1=补票 2=跨站 后端有时不返回 recommendDepartType： 补/多买几个出发站
  solutionInfo.solutionType =
    solutionInfo.solutionType ||
    (recommendDepartType === 0 && recommendArriveType < 0 ? 1 : 2);

  const {
    originArriveStation,
    originDepartStation,
    originArriveTime,
    originDepartTime,
    originDepartDate,
    originArriveDate,
    originTicketCheck,
    trainNum,
  } = thenByTrain;
  if (recommendArriveType !== 0) {
    solutionInfo.crossType = 'BACK';
    // 为了节省两行代码 提出tagPre变量
    let tagPre =
      recommendArriveType < 0
        ? solutionInfo.actionType === 1
          ? '自动抢'
          : '补票'
        : '多买';
    let titlePre =
      recommendArriveType < 0
        ? solutionInfo.actionType === 1
          ? '抢票'
          : '补票'
        : '多买';
    solutionInfo.tag = `${tagPre}${Math.abs(recommendArriveType)}站`;
    solutionInfo.titleTag = `${titlePre}${Math.abs(recommendArriveType)}站`;
  } else if (recommendDepartType !== 0) {
    solutionInfo.crossType = 'FRONT';
    solutionInfo.tag =
      recommendDepartType < 0
        ? `补票${Math.abs(recommendDepartType)}站`
        : `多买${Math.abs(recommendDepartType)}站`;
  }
  const tipList = getWisePopTip(
    solutionInfo,
    {
      originArriveStation,
      originDepartStation,
    },
    productUrlConfig
  );
  const timeInfo = getWisePopTime(solutionInfo);
  const ticketList = getThenByTicketList(solutionInfo, {
    originArriveStation,
    originDepartStation,
    originArriveTime,
    originDepartTime,
    originDepartDate,
    originArriveDate,
    originTicketCheck,
    trainNum,
  });
  const scmType =
    solutionInfo.crossType === 'FRONT'
      ? 2
      : solutionInfo.solutionType === 1
      ? solutionInfo.actionType === 1
        ? 5
        : 3
      : 4;
  return {
    originInfo: {
      originArriveStation,
      originDepartStation,
      originArriveTime,
      originDepartTime,
      originDepartDate,
      originArriveDate,
      originTicketCheck,
      trainNum,
    },
    ...solutionInfo,
    price:
      solutionInfo.solutionType === 1 && solutionInfo.actionType === 1
        ? +solutionInfo.recommendPrice + +solutionInfo.leftTicketPrice
        : solutionInfo.recommendPrice,
    superTag:
      recommendArriveType < 0 && recommendDepartType === 0
        ? '上车补票'
        : '跨站',
    tipList,
    ticketList,
    scmType,
    hasTakeDays: ticketList.find((v) => v.showDate),
    ...timeInfo,
  };
}
function getWisePopTip(solutionInfo, originInfo, productUrlConfig = {}) {
  const tip_1 = {},
    tip_2 = {};
  const {
    recommendDepartStation,
    recommendArriveStation,
    recommendDepartType,
    crossType,
    solutionType,
    reminderContentList,
  } = solutionInfo;
  const { originArriveStation, originDepartStation } = originInfo;

  tip_1.tip = `购买${recommendDepartStation}-${recommendArriveStation}`;
  if (solutionType === 2 && crossType == 'FRONT') {
    tip_2.tip = `您可持票在<span style='color:#2582f5;font-weight: 500;'>${originDepartStation}</span>上车`;
  } else if (solutionType === 2 && crossType == 'BACK') {
    tip_2.tip = `您可持票在<span style='color:#2582f5;font-weight: 500;'>${originArriveStation}</span>下车`;
  } else {
    tip_2.tip = `上车后需找列车员您补票至<span style='color:#2582f5;font-weight: 500;'>${originArriveStation}</span>，未补票强行越站乘车，您需自行承担全部法律责任 <span style="font-size:24rpx;color: #5678A8;" id="thenByDetail">查看详情<span>`;
    tip_2.tip = `上车必须补票，请遵守铁路政策服从列车员安排！<span style='color:#ff7700;'>利用“买短乘长”恶意逃票属违法行为</span>，情节严重需承担法律责任 <span style="font-size:24rpx;color: #5678A8;" id="thenByDetail">查看详情<span>`;
    // TODO: 跳转详情
    tip_2.url =
      productUrlConfig['wise-bupiao-detail'] ||
      'https://m.ctrip.com/webapp/train/activity/orderservice/InsuranceDetail.aspx?ProductID=5433&terminal=1';
  }
  return reminderContentList || [tip_1, tip_2];
}
function getWisePopTime(solutionInfo) {
  const {
    recommendDepStationDate,
    recommendArrStationDate,
    recommendDepStationTime,
    recommendArrStationTime,
  } = solutionInfo;
  const depDate = new cDate.parse(recommendDepStationDate);
  const dDateTag = depDate.format('n月j日');
  const weekDay = depDate.format('w');
  // const arrDate = new cDate.parse(recommendArrStationDate);
  return {
    depDate,
    dDateTag,
    weekDay,
  };
}

function getThenByTicketList(solutionInfo, originInfo) {
  const {
    recommendDepartStation,
    recommendArriveStation,
    recommendDepStationDate,
    recommendArrStationDate,
    recommendDepStationTime,
    recommendArrStationTime,
    solutionType,
    crossType,
  } = solutionInfo;
  const {
    originArriveStation,
    originDepartStation,
    originArriveTime,
    originDepartTime,
    originArriveDate,
    originDepartDate,
  } = originInfo;
  let ticketList = null;

  // 前跨
  if (solutionType === 2 && crossType == 'FRONT') {
    ticketList = [
      {
        name: recommendDepartStation,
        isReal: false,
        tag: '',
        time: recommendDepStationTime,
      },
      {
        name: originDepartStation,
        isReal: true,
        tag: '上车',
        time: originDepartTime,
      },
      {
        name: originArriveStation,
        isReal: true,
        tag: '下车',
        time: originArriveTime,
        showDate:
          originArriveDate === originDepartDate
            ? null
            : new cDate.parse(originArriveDate).format('n月j日'),
      },
    ];
    // 后跨
  } else if (solutionType === 2 && crossType == 'BACK') {
    ticketList = [
      {
        name: originDepartStation,
        isReal: true,
        tag: '上车',
        time: originDepartTime,
      },
      {
        name: originArriveStation,
        isReal: true,
        tag: '下车',
        time: originArriveTime,
        showDate:
          originArriveDate === originDepartDate
            ? null
            : new cDate.parse(originArriveDate).format('n月j日'),
      },
      {
        name: recommendArriveStation,
        isReal: false,
        tag: '',
        time: recommendArrStationTime,
        showDate:
          recommendArrStationDate === originDepartDate
            ? null
            : new cDate.parse(recommendArrStationDate).format('n月j日'),
      },
    ];
  } else {
    ticketList = [
      {
        name: originDepartStation,
        isReal: true,
        tag: '上车',
        time: originDepartTime,
      },
      {
        name: recommendArriveStation,
        isReal: false,
        tag: '',
        time: recommendArrStationTime,
        showDate:
          recommendArrStationDate === originDepartDate
            ? null
            : new cDate.parse(recommendArrStationDate).format('n月j日'),
      },
      {
        name: originArriveStation,
        isReal: true,
        tag: '下车',
        time: originArriveTime,
        showDate:
          originArriveDate === originDepartDate
            ? null
            : new cDate.parse(originArriveDate).format('n月j日'),
      },
    ];
  }
  return ticketList;
}
