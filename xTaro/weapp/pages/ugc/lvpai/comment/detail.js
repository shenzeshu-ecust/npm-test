import { cwx, CPage } from '../../../../cwx/cwx.js';
let date = require('../../common/date.js');

import { pageError, strcharacterDiscodef } from '../../common/base.js';

CPage({
  pageId: '10650014619',
  /**
   * 页面的初始数据
   */
  data: {
    viewIndex: 1,
    imgIndex: 1,
    imgLength: 9,
    singleCommentInfo: null, // 个人点评数据
    commentId: null, //点评Id
    isVoted: false, //点评数据, 是否点赞
    usefulCount: '', // 点赞数
    imgCount: 0, //图片数量
    videoCount: 0, //视频数量

    commentData: null, //点评数据
    commentDataIndex: 0, //swipe显示第几个
    imgInit: true,
    autoplay: false, //分享出去单个控制swiper autoplay
    hideCommentLiked: false,
    wakeUpData: null,
    lookPOI: false,
    testZY: false,
    poiDetail: {
      name: '',
      commentNum: '',
      address: '',
      img: '',
      grade: '',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let { leftHeight, rightHeight } = options;

    this._options = options;
    this.commentData = options.commentData
      ? JSON.parse(decodeURIComponent(options.commentData))
      : [];
    this.commentDataIndex = options.commentIndex
      ? parseInt(options.commentIndex)
      : 0;
    this.SightId = options.SightId ? parseInt(options.SightId) : 0;

    this.BusinessId = options.BusinessId ? parseInt(options.BusinessId) : 0;
    this.BusinessType = options.BusinessType
      ? parseInt(options.BusinessType)
      : 0;
    this.CommentId = options.CommentId ? parseInt(options.CommentId) : 0;
    this.POIId = options.POIId ? parseInt(options.POIId) : 0;

    wx.setNavigationBarTitle({
      title: '点评详情',
    });

    if (leftHeight && rightHeight) {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.setData({
        leftHeight: parseFloat(leftHeight),
        rightHeight: parseFloat(rightHeight),
        backFromComment: true,
      });
    }

    // 从app分享卡片或者app打开
    if (cwx.scene == 1036 || cwx.scene == 1069) {
      this.setData({
        canBackApp: true,
      });
    }

    // iphoneX 适配
    this.systemInfo = cwx.util.systemInfo;
    if ('model' in this.systemInfo) {
      let { model } = this.systemInfo;
      this.setData({
        isIphoneX: model.search('iPhone X') != -1 ? true : false,
      });
    }

    cwx.showLoading({
      title: '加载中',
    });
    //景点进入
    if (this.commentData && this.commentData.length > 0) {
      this.setData(
        {
          commentData: this.commentData,
          commentDataIndex: this.commentDataIndex,
          viewIndex: this.commentDataIndex,
        },
        () => {
          cwx.hideLoading();
          if (cwx.user.auth && cwx.user.isLogin()) {
            //console.log(1,this.data.commentData)
            this.getCommentUsefulList().then(() => {});
          }
        }
      );
    } else {
      //分享或外连接进入
      if (this.CommentId && (this.BusinessId || this.POIId)) {
        this.getCommentInfoAndPoiInfo();
        this.getPoiMessage();
      }
    }
    if (this.data.testZY) {
      this.setData(
        {
          lookPOI: true,
        },
        () => {
          this.getPoiMessage();
        }
      );
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoComponnet = this.selectComponent('#videoComponnet');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(cwx.user.auth);
    console.log('user isLogin', cwx.user.isLogin());
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.title,
      desc: '分享一条点评',
      path: `/pages/gs/comment/detail?BusinessId=${this.BusinessId}&BusinessType=${this.BusinessType}&CommentId=${this.CommentId}&POIId=${this.POIId}&SightId=${this.SightId}`,
    };
  },

  /** 事件处理函数 **/

  //包裹页面
  _swiperViewChange: function (e) {
    console.log(e.detail.current);
    this.setData({
      viewIndex: e.detail.current,
    });
  },

  //图片
  _swiperImageChange: function (e) {
    this.setData({
      imgIndex: e.detail.current + 1,
    });
  },

  _isVoted: function (e) {
    let { isVoted, usefulCount, commentId, commentIndex } =
      e.currentTarget.dataset;
    let _commentData = JSON.parse(JSON.stringify(this.data.commentData));

    console.log(commentIndex, _commentData);

    if (cwx.user.auth && cwx.user.isLogin()) {
      //console.log(1,this.data.commentData)
      this.getCommentUsefulList()
        .then(() => {
          //console.log(2,this.data.commentData)

          this.setCommentUseful(commentId)
            .then(() => {
              _commentData[commentIndex].IsVoted = true;
              _commentData[commentIndex].UsefulCount =
                _commentData[commentIndex].UsefulCount + 1;
              this.setData(
                {
                  commentData: _commentData,
                },
                () => {
                  //console.log(3,this.data.commentData)
                }
              );
            })
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      cwx.user.login({
        callback: function (res) {
          if (res.ReturnCode == '0') {
            this.getCommentUsefulList()
              .then(() => {
                this.setCommentUseful(commentId)
                  .then(() => {
                    _commentData[commentIndex].IsVoted = true;
                    _commentData[commentIndex].UsefulCount =
                      _commentData[commentIndex].UsefulCount + 1;
                    this.setData({
                      commentData: _commentData,
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          }
        },
      });
    }
  },

  // 播放视频
  _playVideo: function (e) {
    let { videoUrl } = e.currentTarget.dataset;
    this.videoComponnet.playVideo(videoUrl);
  },

  //看大图
  _showPreviewImg(e) {
    let { current, imageData } = e.currentTarget.dataset,
      urls = imageData.map((img) => {
        return img.PhotoPath;
      });
    //console.log(urls, current)
    cwx.previewImage({
      current: current,
      urls: urls,
    });
  },
  /** 获取poi**/
  getPoiMessage() {
    const self = this;
    cwx.request({
      url: '/restapi/soa2/13444/json/getcommentinfowithpoi',
      data: {
        BusinessId: this.BusinessId,
        BusinessType: this.BusinessType,
        CommentId: this.CommentId,
        PoiId: this.POIId,
        ChannelType: 7,
        VideoImageWidth: 750,
        VideoImageHeight: 750,
      },
      success: (res) => {
        console.log('getcommentinfowithpoi:', res);
        const poiInfo = res.data.result.poiInfo;
        self.setData({
          poiDetail: {
            name: poiInfo.name,
            commentNum: poiInfo.commentCount,
            address: poiInfo.address,
            img: poiInfo.imageUrl,
            grade: poiInfo.commentScore,
          },
        });
      },
      fail: () => {
        console.log('poi接口请求失败');
      },
    });
  },
  /** 业务方法 **/

  getCommentInfoAndPoiInfo() {
    cwx.showLoading({
      title: '加载中',
    });
    cwx.request({
      url: '/restapi/soa2/10491/json/GetCommentInfoAndPoiInfo',
      data: {
        businessId: this.BusinessId,
        businessType: this.BusinessType,
        commentId: this.CommentId,
        poiId: this.POIId,
        channelType: 1,
        videoImageWidth: 750,
        videoImageHeight: 750,
      },
      success: (res) => {
        console.log('getCommentInfoAndPoiInfo', res);
        if (
          res &&
          res.data &&
          res.data.ResponseStatus &&
          res.data.ResponseStatus.Ack === 'Success' &&
          res.data.SingleCommentInfo
        ) {
          cwx.hideLoading();
          let { canBackApp } = this.data;
          let _singleCommentData = [],
            _tempData = {},
            { SingleCommentInfo, PoiDetailInfo } = res.data,
            {
              UserInfoModel,
              PublishTime,
              Images,
              ShortVideoList,
              UsefulCount,
              Content,
              TotalStar,
            } = SingleCommentInfo,
            _newImages = [];
          Images.forEach((item, i) => {
            if (item.OriImageSrc) {
              _newImages.push({ PhotoPath: item.OriImageSrc });
            }
          });
          _tempData['Content'] = Content ? strcharacterDiscodef(Content) : '';
          _tempData['Images'] = _newImages;
          _tempData['ShortVideoList'] =
            ShortVideoList && ShortVideoList.length > 0 ? ShortVideoList : [];
          _tempData['PublishTime'] = PublishTime
            ? date.formatTime(
                'yyyy-MM-dd',
                parseInt(PublishTime.match(/\d+/gi)[0])
              )
            : '';
          _tempData['TotalStar'] = TotalStar ? TotalStar : 0;
          _tempData['UserNick'] =
            UserInfoModel && UserInfoModel.UserNick
              ? UserInfoModel.UserNick
              : '';
          _tempData['UserImageSrc'] =
            UserInfoModel && UserInfoModel.UserImageSrc
              ? UserInfoModel.UserImageSrc
              : '';
          _tempData['UsefulCount'] = UsefulCount ? UsefulCount : 0;
          _tempData['CommentId'] = this.CommentId;
          _singleCommentData[0] = _tempData;
          console.log('_singleCommentData', _singleCommentData);

          //唤醒统一处理
          if (canBackApp) {
            console.log('从app打开');
            this.setData({
              lookPOI: true,
              wakeUpData: {
                wakeUpIsShow: true,
                canBackApp: true,
                list: [
                  {
                    name: 'home',
                    title: '攻略首页',
                    imgurl:
                      'https://pages.c-ctrip.com/you/wechat/poi_icon_goHome.png',
                    url: '/pages/gs/home/home',
                    callback: '_goHome',
                  },
                  {
                    name: 'goapp',
                    title: '打开APP',
                    imgurl:
                      'http://pages.c-ctrip.com/you/wechat/poi_icon_ctrip.png',
                    url: res.data.AppUrl,
                    callback: '',
                  },
                ],
              },
            });
          } else {
            this.setData({
              lookPOI: true,
              wakeUpData: {
                wakeUpIsShow: true,
                canBackApp: false,
                list: [
                  {
                    name: 'home',
                    title: '攻略首页',
                    imgurl:
                      'https://pages.c-ctrip.com/you/wechat/poi_icon_goHome.png',
                    url: '/pages/gs/home/home',
                    callback: '_goHome',
                  },
                ],
              },
            });
          }
          this.setData(
            {
              commentData: _singleCommentData,
              PoiDetailInfo: PoiDetailInfo,
              autoplay: true,
            },
            () => {
              let _ubtData = {},
                { DistrictId } = this.data.PoiDetailInfo,
                PoiId = this.POIId;
              if (
                this.data.ShortVideoList &&
                this.data.ShortVideoList.length > 0
              ) {
                _ubtData = {
                  actionType: 'browse',
                  actionCode: 'c_miniapps_spotcomment_launch',
                  districtID: DistrictId,
                  POIID: PoiId,
                  isvideo: 1,
                };
              } else {
                _ubtData = {
                  actionType: 'browse',
                  actionCode: 'c_miniapps_spotcomment_launch',
                  districtID: DistrictId,
                  POIID: PoiId,
                };
              }
              this.ubtTrace(102281, _ubtData);
            }
          );
        } else {
          cwx.hideLoading();
          cwx.showModal({
            title: '温馨提示',
            content: '页面获取失败',
            showCancel: false,
            confirmText: '关闭',
            success: (res) => {
              if (res.confirm) {
              }
            },
          });
        }
      },
      fail: () => {
        console.log('点评详情接口请求失败');

        if (!!this._options) {
          let opt = {
            BusinessId: this.BusinessId,
            BusinessType: this.BusinessType,
            CommentId: this.CommentId,
            POIId: this.POIId,
          };
          pageError(this.title, opt);
        } else {
          pageError(this.title);
        }
      },
    });
  },

  getSingleCommentUsefulList() {
    let commentIds = [],
      _commentData = {};
    if (this.CommentId && (this.BusinessId || this.POIId)) {
      commentIds.push(this.CommentId);
      _commentData = JSON.parse(JSON.stringify(this.data.commentData));
      cwx.request({
        url: '/restapi/soa2/10491/json/GetCommentUsefulList',
        data: {
          commentIds: commentIds,
          channelType: 1,
        },
        success: (res) => {
          console.log('单条点赞状态：', res.data);
          if (
            res &&
            res.data &&
            res.data.ResponseStatus &&
            res.data.ResponseStatus.Ack === 'Success'
          ) {
            if (res.data.Body && res.data.Body.length > 0) {
              let IsVoted = res.data.Body[0].IsVoted;
              _commentData[0]['IsVoted'] = IsVoted;
              console.log('单条添加IsVoted后', _commentData);
              this.setData({
                commentData: _commentData,
                hideCommentLiked: false,
              });
            }
          }
        },
      });
    }
  },

  getCommentUsefulList() {
    return new Promise((resolve, reject) => {
      let commentIds = [],
        _commentData = {};
      if (this.data.commentData && this.data.commentData.length > 0) {
        _commentData = JSON.parse(JSON.stringify(this.data.commentData));
        _commentData.forEach((item, i) => {
          if (parseInt(item.CommentId)) {
            commentIds.push(item.CommentId);
          }
        });
        console.log('commentIds', commentIds);
        cwx.request({
          url: '/restapi/soa2/10491/json/GetCommentUsefulList',
          data: {
            commentIds: commentIds,
            channelType: 1,
          },
          success: (res) => {
            console.log('多条点赞状态：', res.data);
            if (
              res &&
              res.data &&
              res.data.ResponseStatus &&
              res.data.ResponseStatus.Ack === 'Success'
            ) {
              if (res.data.Body && res.data.Body.length > 0) {
                _commentData.forEach((item, i) => {
                  item['IsVoted'] = res.data.Body[i].IsVoted;
                });
                console.log('多条添加IsVoted后', _commentData);
                this.setData(
                  {
                    commentData: _commentData,
                    //hideCommentLiked: false
                  },
                  () => {
                    resolve();
                  }
                );
              }
            } else {
              reject('GetCommentUsefulList接口报错');
            }
          },
        });
      }
    });
  },

  setCommentUseful(commentId) {
    // console.log(commentId)
    return new Promise((resolve, reject) => {
      let _data = {
        Arg: {
          CommentId: commentId,
        },
        channelType: 1,
      };
      cwx.request({
        url: '/restapi/soa2/13444/json/SetCommentUseful',
        data: _data,

        success: (res) => {
          if (res) {
            console.log('点赞成功');
            resolve();
          } else {
            reject('SetCommentUseful接口报错');
          }
        },
      });
    });
  },
  goPoiDetail() {
    cwx.navigateTo({
      url: `/pages/gs/sight/newDetail?sightId=${this.SightId}`,
    });
  },
});
