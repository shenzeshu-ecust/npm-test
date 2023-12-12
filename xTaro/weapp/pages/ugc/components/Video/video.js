import { cwx } from '../../../../cwx/cwx.js';
/*
  视频播放组件

  用法 在引入页面的json文件下
  "usingComponents": {
    "VideoComponent": "/components/Video/video"
  }
  在相应的wxml中 引入
  <VideoComponent class="videoComponnet" id="videoComponnet" ></VideoComponent>

  在相应的js的生命周期onReady下
  this.videoComponnet = this.selectComponent("#videoComponnet")引入此组件
  在相应的可以播放视频的图片上绑定一个事件 并传递videoUrl
  playVideo:function(e){
    let { videoUrl } = e.currentTarget.dataset;
    this.videoComponnet.playVideo(videoUrl);
  },

 */

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showVideo: {
      type: Boolean,
      value: false,
    },
    showVideoControlsClose: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    videoUrl: '',
  },
  ready: function () {
    this.videoContext = wx.createVideoContext('myDyVideo', this);
  },
  /**
   * 组件的方法列表
   */
  methods: {
    playVideo(videoUrl) {
      this.setData({
        showVideo: true,
        showVideoControlsClose: true,
      });
      this._checkVideo(videoUrl);
    },

    _checkVideo(videoUrl) {
      if (videoUrl) {
        cwx.getNetworkType({
          success: (res) => {
            let { errMsg, networkType } = res;
            console.log(res);
            if (errMsg === 'getNetworkType:ok') {
              if (networkType === 'wifi') {
                console.log(this.videoContext);
                this.videoContext.requestFullScreen();
                this._startPlayVideo(videoUrl);
              } else {
                cwx.showModal({
                  title: '温馨提示',
                  content: '您现在处于非WIFI状态，是否继续播放',
                  cancelText: '关闭',
                  confirmText: '播放',
                  success: (res) => {
                    if (res.confirm) {
                      this.videoContext.requestFullScreen();
                      this._startPlayVideo(videoUrl);
                      console.log('用户处在非wifi环境，任性播放');
                    } else if (res.cancel) {
                      console.log('用户处在非wifi环境，放弃播放');
                      this._closeVideoFullScreen();
                    }
                  },
                });
              }
            } else {
              cwx.showModal({
                title: '温馨提示',
                content: '你的网络异常，请稍后再试',
                showCancel: false,
                confirmText: '关闭',
                success: (res) => {
                  if (res.confirm) {
                    console.log('错误:getNetworkType!=OK, 获取网络状态失败');
                    this._closeVideoFullScreen();
                  }
                },
              });
            }
          },
          fail: (err) => {
            cwx.showModal({
              title: '温馨提示',
              content: '播放失败，请检查你的网络',
              showCancel: false,
              confirmText: '关闭',
              success: (res) => {
                if (res.confirm) {
                  console.log('错误:getNetworkType:fail, 获取网络状态失败');
                  this._closeVideoFullScreen();
                }
              },
            });
          },
        });
      } else {
        cwx.showModal({
          title: '温馨提示',
          content: '播放失败',
          showCancel: false,
          confirmText: '关闭',
          success: (res) => {
            if (res.confirm) {
              console.log('错误:没有视频，无法播放');
              this._closeVideoFullScreen();
            }
          },
        });
      }
    },

    fullScreenChange(e) {
      if (!e.detail.fullScreen) {
        this._closeVideoFullScreen();
      }
    },

    _startPlayVideo(videoUrl) {
      this.setData(
        {
          videoUrl: videoUrl,
        },
        () => {
          console.log(this.videoContext, videoUrl);
          this.videoContext.play();
        }
      );
    },

    // _changePlay(e){
    //   let { fullScreen } = e.detail;
    //   console.log('全屏播放：'+fullScreen)
    //   if(fullScreen){
    //     this.videoContext.play();
    //   }else{
    //     this.setData({
    //       showVideo: false,
    //       showVideoControlsClose: false,
    //     },()=>{
    //       this.videoContext.pause();
    //       this.videoContext.seek(0);
    //     });
    //   }
    // },

    _endedVideo() {
      this.videoContext.pause();
      this.videoContext.seek(0);
      this.setData({
        showVideoControlsClose: true,
      });
    },

    _closeVideoFullScreen() {
      this.videoContext.pause();
      this.videoContext.seek(0);
      this.videoContext.exitFullScreen();
      this.setData({
        showVideo: false,
        showVideoControlsClose: false,
      });
    },

    _waitingVideo() {
      this.setData({
        showVideoControlsClose: true,
      });
    },

    _errorVideo(e) {
      console.log(e);
      cwx.showModal({
        title: '温馨提示',
        content: '播放失败',
        showCancel: false,
        confirmText: '关闭',
        success: (res) => {
          if (res.confirm) {
            console.log('错误:无法播放');
            this._closeVideoFullScreen();
          }
        },
      });
    },
  },
});
