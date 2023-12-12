export default class cardOperationModel {
  /**
   * 构造函数,
   *
   * @method constructor
   * @param {number} optType     0:分享功能   1:跳转h5页面
   * @param {String} name        按钮name
   * @param {String} title       分享的title(only分享使用)
   * @param {String} path        转发路径/订单详情的url
   * @param {String} imageUrl    自定义图片路径(only分享使用)
   * @param {String} actionCode  点击分享时actionCode
   *
   * ```
   */
  constructor(model) {
    this.optType = model.optType;
    this.name = model.name;
    this.title = model.title
    this.path = model.path
    this.imageUrl = model.imageUrl
    this.actionCode = model.actionCode
  }

}