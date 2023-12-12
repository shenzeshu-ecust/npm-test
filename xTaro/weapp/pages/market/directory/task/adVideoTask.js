/*
* 小程序激励广告
*/
const openAdVideo = (videoAd)=>{
  videoAd.show()
          .then(() => console.log('激励视频 广告显示'))
            .catch(() => {
              videoAd.load()
              .then(() => videoAd.show())
              .catch(err => {
                wx.showToast({
                  title: '暂无广告',
                  icon: 'none'
                })
                console.log('激励视频 广告显示失败', err)
              })
          })
}
export {
  openAdVideo
}