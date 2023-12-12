export const ORDER_WAIT_STATUS = [0, 1, 2, 4];

export function isWaitOrderStatus(orderStatus) {
  return ORDER_WAIT_STATUS.includes(orderStatus);
}

export function isWaitSplitOrderStatus(relationOrderInfo) {
  let hasWaitRelationOrder = false;
  relationOrderInfo?.relationOrderInfoList?.forEach((relationOrder) => {
    if (isWaitOrderStatus(relationOrder.orderStatus)) {
      hasWaitRelationOrder = true;
    }
  });

  return (
    isWaitOrderStatus(relationOrderInfo.currentOrderStatus) ||
    hasWaitRelationOrder
  );
}
