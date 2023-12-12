// 获取钱包展示对象
export function getWalletDisplayWay(resPayway = {}) {
  try {
    const displayWays = resPayway.displayInfo.ownPayDisplayInfo.displayPayways || []
    const walletWay = displayWays.find(item => item.category === 'CtripWallet') || {}
    if (walletWay.status == 1) return walletWay
    else return null
  } catch (error) {
    console.log(error)
    return null
  }
}

// 获取钱包支付方式
export function getWalletInfo(resPayway = {}) {
  try {
    const displayWays = resPayway.payCatalogInfo.walletInfo.ctripPayInfoList || []
    return displayWays
  } catch (error) {
    console.log(error)
    return null
  }
}

// 比较前后两次选择的支付方式是否一样(顺序不一样也算，因为金额扣除数不一样)
export function isSamePayways(pre, cur) {
  const preStr = pre ? pre.map(i => i.brandId).join(',') : ''
  const curStr = cur ? cur.map(i => i.brandId).join(',') : ''
  if (preStr == curStr) {
    return true
  } else {
    return false
  }
}