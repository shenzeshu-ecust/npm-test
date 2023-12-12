import { TComponent } from '../../../../../business/tjbase/index';
import utils from '../../../../../utils/index';
TComponent({
  properties: {
    tipslist: {
      type: Array,
      value: []
    },
    tipslocation: {
      type: Object,
      value: {},
      observer: function (newVal) {
        this._handleTipsLocationInfo(newVal);
      }
    }
  },
  data: {
    systemInfo: utils.systemInfo,
    tipsContainerDomInstance: null,
    tipsContainerDom: null,
    tipsLocationData: {},
    isShowDirectionRelativeTarget: 'right',
    isShowTips: false,
    leftLocationNum: 0,
    topLocationNum: 0,
    arrowLeftLocationNum: 0,
    arrowTopLocationNum: 0
  },
  lifetimes: {
    ready: function () {}
  },
  pageLifetimes: {
    hide: function () {
      var tipsContainerDomInstance = this.data.tipsContainerDomInstance;
      tipsContainerDomInstance && tipsContainerDomInstance.disconnect();
    }
  },
  methods: {
    _handleTipsLocationInfo: function (changeData) {
      var _this = this;
      var _a = this.data,
        systemInfo = _a.systemInfo,
        isShowTips = _a.isShowTips,
        tipslist = _a.tipslist;
      Object.keys(changeData).length && this._handleCalculateTipsContainerInfo().then(function (res) {
        var targetDom = changeData.boundingClientRect;
        var tipsDom = res.observerData.boundingClientRect;
        var isShowRight = systemInfo.windowWidth - targetDom.right > tipsDom.width;
        var isShowLeft = !isShowRight && targetDom.left > tipsDom.width;
        var isShowUp = !isShowRight && !isShowLeft && targetDom.top > tipsDom.height + 5 + 30;
        var isShowDown = !isShowRight && !isShowLeft && !isShowUp;
        var systemWindowWidth = systemInfo.windowWidth;
        var isShowDirectionRelativeTarget = 'right';
        var arrowLeftLocationNum = 0;
        var arrowTopLocationNum = 0;
        var leftLocationNum = targetDom.right + 5;
        var topLocationNum = targetDom.top - tipsDom.height / 2 + 5;
        if (isShowLeft) {
          isShowDirectionRelativeTarget = 'left';
          arrowLeftLocationNum = 0;
          arrowTopLocationNum = 0;
          leftLocationNum = targetDom.left - tipsDom.width - 5;
          topLocationNum = targetDom.top - tipsDom.height / 2 + 5;
        }
        if (isShowUp) {
          isShowDirectionRelativeTarget = 'up';
          arrowLeftLocationNum = targetDom.left - (systemWindowWidth - tipsDom.width) / 2;
          arrowTopLocationNum = tipsDom.height + 5;
          leftLocationNum = (systemWindowWidth - tipsDom.width) / 2;
          topLocationNum = targetDom.top - tipsDom.height - 10;
        }
        if (isShowDown) {
          isShowDirectionRelativeTarget = 'down';
          arrowLeftLocationNum = targetDom.left - (systemWindowWidth - tipsDom.width) / 2;
          arrowTopLocationNum = -5;
          leftLocationNum = (systemWindowWidth - tipsDom.width) / 2;
          topLocationNum = targetDom.bottom + 10;
        }
        _this.setData({
          isShowDirectionRelativeTarget: isShowDirectionRelativeTarget,
          tipsContainerDomInstance: res.observerInstance,
          isShowTips: !isShowTips && tipslist && !!tipslist.length,
          leftLocationNum: leftLocationNum,
          topLocationNum: topLocationNum,
          arrowLeftLocationNum: arrowLeftLocationNum,
          arrowTopLocationNum: arrowTopLocationNum
        });
      }).catch(function (err) {
        console.log(err);
      });
    },
    _handleCalculateTipsContainerInfo: function () {
      var _this = this;
      return new Promise(function (resolve, reject) {
        utils.createIntersectionObserver(_this, '#bubble-tips').then(function (res) {
          resolve(res);
        }).catch(function () {
          reject({
            errMsg: '获取提示框dom信息失败'
          });
        });
      });
    },
    _handleToggleTipsStatus: function () {
      var isShowTips = this.data.isShowTips;
      this.setData({
        isShowTips: !isShowTips,
        leftLocationNum: 0,
        topLocationNum: 0
      });
    },
    _handleForbiddenScroll: function () {
      return false;
    }
  }
});