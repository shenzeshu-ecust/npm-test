//判断是否展示大卡样式
function isBigCard(card,height=20) {
    // 当标题只有一行，且无特价时，标签改为小卡
    if(height<20 && !card.reducedPrice && !card.discount){
      return false
    }
    if (scoreBigThan45(card)) {
      return true;
    } else {
      if (hasRankInfo(card)) {
        return true;
      }
      if (hasTagInfo(card)) {
        return true;
      }
      return false;
    }
}

function titleLineNum(card) {
  if (isBigCard(card)) {
    return 2;
  }
  // 有特价样式：显示一行标题
  if (card.reducedPrice || card.discount) {
    return 1;
  } else {
  // 无特价样式：显示两行标题
    return 2;
  }
}

//商品价格
function priceText(card, source) {
  if (!card.fromPrice || ! card.fromPrice.price) {
    return '';
  }
  if (card.priceType == 1) {//一口价
    return pointHandler(card.fromPrice.price, source);
  } else if (card.priceType == 2) {//区间价
    //推送商品卡片逻辑 当价格位数大于等于6位时：若有折扣，则不再展示原价，仅展示折后价；若是区间价格，则取最小价格，展示xx起
    if (priceLength(card.fromPrice.price, source) ) {//推送商品卡片
      return pointHandler(card.fromPrice.price, source);
    }
    return pointHandler(card.fromPrice.price, source) + (card.toPrice.price ? '-' +pointHandler(card.toPrice.price, source) : '');
  } else if (card.priceType == 3) {//折扣价
    return pointHandler(card.fromPrice.price, source);
  }
  return ''
}

//商品单位或起
function priceTextSuffix(card, source) {
  if (card.priceType == 1) {//一口价
    return (card.fromPrice.needStart ? '起':'') + (card.nights > 1 ? '/' + card.nights + '晚' : '') + (card.nights == 1 ? '/晚' : '');
  } else if (card.priceType == 2) {//区间价
    //推送商品卡片逻辑 当价格位数大于等于6位时：若有折扣，则不再展示原价，仅展示折后价；若是区间价格，则取最小价格，展示xx起
    if (priceLength(card.fromPrice.price, source)) {//推送商品卡片
      return '起';
    }
  } else if (card.priceType == 3) {//折扣价
    return (card.fromPrice.needStart ? '起':'') + (card.nights > 1 ? '/' + card.nights + '晚' : '') + (card.nights == 1 ? '/晚' : '');
  }
  return '';
}

//商品原价
function originPriceText(card, source='') {
  if (card.priceType == 1) {//一口价
    return '';
  } else if (card.priceType == 2) {//区间价
    return '';
  } else if (card.priceType == 3 && card.toPrice && card.toPrice.price) {//折扣价
    //推送商品卡片逻辑 当价格位数大于等于6位时：若有折扣，则不再展示原价，仅展示折后价；若是区间价格，则取最小价格，展示xx起
    if (priceLength(card.fromPrice.price, source) ) {//推送商品卡片
      return '';
    }
    return pointHandler(card.toPrice.price, source);
  }
  return '';
}

//小数点处理：当价格存在小数时，小数点后最多展示两位。若第二位为0，则只展示一位
function pointHandler(num='', source) {
  //推送卡片才做
  if (source == 'push_shop_card') {
    let newNum = num + '';
    let dotIndex = newNum.indexOf('.');
    let price = newNum;
    if (dotIndex >= 0) {//有小数点
      price = newNum.slice(0, dotIndex+3);
    }
    return parseFloat(price);   
  }
  return num;
}

// 当价格位数大于等于6位时,推送卡片才做
function priceLength(price, source) {
  if (source == 'push_shop_card') {
    let p = price + '';
    if (p.length >= 6) {
      return true;
    }
  }
  return false;
}

//评分是否大于等于4.5
function scoreBigThan45(card) {
  return card && card.commentScore && parseFloat(card.commentScore) >= 4.5;
}

//是否上榜
function hasRankInfo(card) {
  return card && card.rankTag && card.rankTag.length > 0;
}

//评论数是否大于200
function commentNumBigThan200(card) {
  return card && card.commentNum && card.commentNum > 200;
}


//商品是否有亮点信息
function hasTagInfo(card) {
  return card && card.tags && card.tags.length > 0;
}

//售卖状态文案
function saleStatusText(card) {
  if (card.saleStatus == 2) {
    // return '- 待开抢 -'
  }
  if (card.saleStatus == 3) {
    return '- 已抢光 -'
  }
  if (card.saleStatus == 4) {
    return '- 已下架 -'
  }
  return '';
}

//商品是否支持购买，跳转详情
function disableShopCard(card) {
  if (card.saleStatus == 2 || card.saleStatus == 3 || card.saleStatus == 4) {
    return true
  }
  return false;
}

module.exports = {
  isBigCard:isBigCard,
  titleLineNum:titleLineNum,
  priceText:priceText,
  priceTextSuffix:priceTextSuffix,
  originPriceText:originPriceText,

  scoreBigThan45:scoreBigThan45,
  hasRankInfo:hasRankInfo,
  commentNumBigThan200:commentNumBigThan200,
  hasTagInfo:hasTagInfo,
  saleStatusText:saleStatusText,
  disableShopCard:disableShopCard,
}