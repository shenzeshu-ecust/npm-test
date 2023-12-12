export default function getExtendValue(orderInfo) {
  let extendValues = {};
  if (!(orderInfo && orderInfo.ExtendList && orderInfo.ExtendList.length)) {
    return extendValues;
  }
  orderInfo.ExtendList.forEach((item) => {
    if (item.Value) {
      try {
        if (item.Key == 'ticketallowanceactivityalert') {
          //额外处理下金额
          let info = JSON.parse(item.Value);
          let contents = info.content.split('¥');
          info.content = contents[0];
          info.award = contents[1];
          extendValues.ticketallowanceactivityalert = info;
        }
        if (item.Key == 'ETicketGuidUserCheckFace') {
          let info = JSON.parse(item.Value);
          try {
            info.Desc = info.Desc.replace(/&lt;/g, '<');
            info.Desc = info.Desc.replace(/&gt;/g, '>');
          } catch (e) {
            console.log(e);
          }
          extendValues.ETicketGuidUserCheckFace = info;
        } else if (item.Key === 'WXYellowTip' || item.Key === 'PointOrder') {
          extendValues[item.Key] = item.Value;
        } else {
          try {
            // 可能富文本
            extendValues[item.Key] = JSON.parse(item.Value);
          } catch (error) {
            extendValues[item.Key] = item.Value;
          }
        }
      } catch (error) {
        console.error('getExtendvalues', error);
      }
    }
  });

  return extendValues;
}
