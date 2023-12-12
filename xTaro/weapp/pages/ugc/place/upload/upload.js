import { cwx, CPage } from '../../../../cwx/cwx.js';
cwx.config.init();
CPage({
  pageId: '',
  data: {
    viewClicked: false, //已经点击
    path: '',
    type: '',
    poiId: 0,
    poiType: 0,
    districtId: 0,
    poiName: '',
    topicId: 0,
    topicType: 0,
    topicName: '',
    topicImageUrl: '',
    contentText: '',
    actId: 0, //活动ID
    source: '',
  },

  onLoad: function (options) {
    console.log('options', options);
    this.cacheOptions = options;
    let self = this,
      type = options.type ? options.type : 'uploadImg',
      poiId = options.poiId ? parseInt(options.poiId) : 0,
      poiType = options.poiType ? parseInt(options.poiType) : 0,
      districtId = options.districtId ? parseInt(options.districtId) : 0,
      poiName = options.poiName ? options.poiName : '',
      topicId = options.topicId ? parseInt(options.topicId) : 0,
      topicType = options.topicType ? parseInt(options.topicType) : 0,
      topicName = options.topicName ? options.topicName : '',
      topicImageUrl = options.topicImageUrl ? options.topicImageUrl : '',
      contentText = options.contentText ? options.contentText : '',
      actId = options.actId ? options.actId : 0,
      source = options.source ? options.source : '';

    self.setData({
      type: type,
      poiId: poiId,
      poiType: poiType,
      districtId: districtId,
      poiName: poiName,
      topicId: topicId,
      topicType: topicType,
      topicName: topicName,
      topicImageUrl: topicImageUrl,
      contentText: contentText,
      actId: actId,
      source: source,
    });
  },

  //跳转
  jumpToUploadImg: function () {
    let self = this,
      data = self.data,
      path = '',
      type = data.type,
      poiId = data.poiId,
      poiType = data.poiType,
      districtId = data.districtId,
      poiName = data.poiName,
      topicId = data.topicId,
      topicType = data.topicType,
      topicName = data.topicName,
      topicImageUrl = data.topicImageUrl,
      contentText = data.contentText,
      actId = data.actId,
      source = data.source;

    if (self.data.viewClicked) {
      return;
    }
    self.setData({
      viewClicked: true,
    });
    setTimeout(() => {
      self.setData({
        viewClicked: false,
      });
    }, 1000);

    cwx.user.getToken((token) => {
      path =
        '/pages/upload/upload?fromMini=yes&type=' +
        type +
        '&poiId=' +
        poiId +
        '&poiType=' +
        poiType +
        '&districtId=' +
        districtId +
        '&poiName=' +
        poiName +
        '&topicId=' +
        topicId +
        '&topicType=' +
        topicType +
        '&topicName=' +
        topicName +
        '&topicImageUrl=' +
        topicImageUrl +
        '&contentText=' +
        contentText +
        '&actId=' +
        actId +
        '&source=' +
        source +
        '&groupName=' +
        (this.cacheOptions.groupName || '') +
        '&groupId=' +
        (this.cacheOptions.groupId || '');
      if (token) {
        path += '&__userToken=' + token;
      }
      cwx.cwx_navigateToMiniProgram({
        appId: 'wx5c0ef406698d0e86',
        path: path,
        envVersion: 'release', //develop ,release , trial
        success: function (res) {},
        fail: function (res) {},
      });
    });
  },
});
