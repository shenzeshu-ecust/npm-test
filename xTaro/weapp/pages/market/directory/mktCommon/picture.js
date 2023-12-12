
/**
 * 初始化海报图
 * @param {String} canvasid 
 * @param {Number} width [宽]
 * @param {Number} height [高]
 */
var Picture = function (canvasid, width, height) {
  this.canvasId = canvasid
  this.context = wx.createCanvasContext(canvasid);
  console.log(this.context);
  this.context.clearRect(0, 0, width, height)
  //绘制大白底
  this.context.rect(0, 0, width, height)
  //this.context.setFillStyle('White')
  //this.context.fill()
  this.context.draw(true)
};

/**
 * 定位文字
 * @param {String} text[文字内容]
 * @param {Object} opt [文字大小、颜色、对齐方式]
 * @param {Object} pos [文字位置(没单位)]
 */
Picture.prototype.drawText = function (text, opt, pos) {
  opt.size && this.context.setFontSize(opt.size)
  opt.color && this.context.setFillStyle(opt.color)
  opt.align ? this.context.setTextAlign(opt.align) : this.context.setTextAlign('center');
  this.context.fillText(text, pos.left, pos.top )
}
Picture.prototype.newDrawText = function (text, opt, pos) {
  opt.size && this.context.setFontSize(opt.size)
  opt.color && this.context.setFillStyle(opt.color)
  opt.align ? this.context.setTextAlign(opt.align) : this.context.setTextAlign('center');
  if(text.length > 12){
    text = text.substr(0,12) + '...'
  }
  this.context.fillText(text, pos.left, pos.top )
}

Picture.prototype.clearRect = function (width, height) {
  this.context.clearRect(0, 0, width, height)
}

/**
 * 旋转图片
 * @param {String} text[文字内容]
 * @param {Object} opt [文字大小、颜色、对齐方式]
 * @param {Object} pos [文字位置(没单位)]
 */
Picture.prototype.ratateAngle = function (angle, callback) {
  let ratateAngle = (Math.PI / 180) * angle;
  console.log('需要倾斜多少角度1', ratateAngle)
  this.context.rotate(ratateAngle);
  //callback()
}

/**
 * 获取图片信息,主要用于获取图片本地路径
 * @param {String} url[图片网络地址]
 * @param {function} onSuccess [成功回调]
 * @param {function} onError [失败回调]
 */
Picture.prototype.getImgInfo = function (url, onSuccess, onError) {
  var that = this;
  wx.getImageInfo({
    src: url,
    success: function (data) {
      // console.log("获取图片信息成功")
      // console.log(data);
      onSuccess && onSuccess(data);
    },
    fail: function () {
      wx.showToast({ title: '图片小哥跑偏了，再重试下吧', icon: 'none', mask: true })
      console.log("获取图片信息失败");
      onError && onError();
    }
  })
}

/**
 * 定位图片
 * @param {String} path[图片本地路径]
 * @param {Object} position [位置]
 * @param {Object} size [宽高]
 */
Picture.prototype.drawImg = function (path, position, size) {
  this.context.drawImage(path, position.left, position.top, size.width, size.height);
}

/**
 * 图片转成圆形，主要用于B码，头像
 * @param {String} path[图片本地路径]
 * @param {Object} position [位置left|top]
 * @param {Object} measure [图片宽高，裁切的半径width|height|radius]
 */
Picture.prototype.imgToArc = function (path, position, measure) {
  this.context.save()
  //宽高大于半径才能剪裁
  var x = position.left + measure.width / 2;
  var y = position.top + measure.height / 2;
  this.context.arc(x, y, measure.radius, 0, 2 * Math.PI)
  this.context.setFillStyle('#FFFFFF');
  this.context.fill()
  this.context.clip()
  this.context.drawImage(path, position.left, position.top, measure.width, measure.height)
  this.context.restore()
  //this.context.draw(true)
}

/**
 * 绘制图片
 * @param {Function} callback[回调]
 */
Picture.prototype.draw = function (callback) {
  this.context.draw(true, () => {
    callback && callback();
  })
}

/**
 * canvas生成图片临时文件，主要用于将图片保存到相册或上传
 * @param {Object} callback[成功回调]
 */
Picture.prototype.canvasToImgPath = function (callback) {
  let that = this;
  wx.canvasToTempFilePath({
    canvasId: that.canvasId,
    success: function (res) {
      if (res.errMsg === 'canvasToTempFilePath:ok') {
        console.log(res)
        callback && callback(res.tempFilePath)
      }
    },
    fail: function (res) {
      console.log(res)
      wx.hideLoading()
    }
  }, that);
}

/**
 * canvas生成图片临时文件，主要用于将图片保存到相册或上传
 * @param {Object} callback[成功回调]
 */
Picture.prototype.canvasToImgPathJpg = function (callback) {
  let that = this;
  wx.canvasToTempFilePath({
    canvasId: that.canvasId,
    fileType: 'jpg',
    quality: 0.8,
    success: function (res) {
      if (res.errMsg === 'canvasToTempFilePath:ok') {
        console.log(res)
        callback && callback(res.tempFilePath)
      }
    },
    fail: function (res) {
      console.log(res)
      wx.hideLoading()
    }
  }, that);
}

/**
 * canva保存图片(先授权再保存)
 * @param {String} url[图片路径]
 */
Picture.prototype.toSave = function (url) {
  var that = this;
  wx.getSetting({
    success(res) {
      if (res.authSetting['scope.writePhotosAlbum'] == undefined) {
        console.log("undefined");
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            that.savePic(url);
          },
          fail() {
            console.log("未授权");
            console.log(res);
          }
        })
      } else if (res.authSetting['scope.writePhotosAlbum'] == false) {
        console.log("false");
        wx.hideLoading();
        wx.showModal({
          title: "提示",
          content: "相册系统未授权，请重新授权并保存图片",
          success: function (stRes) {
            console.log(stRes);
            if (stRes.confirm) {
              wx.openSetting({
                success(res) {
                  //重新授权
                }
              })
            } else if (stRes.cancel) {
              console.log('用户点击取消');
            }
          }
        })
      } else {
        console.log("true");
        that.savePic(url);
      }
    }
  })
}

Picture.prototype.savePic = function (url) {
  if (wx.saveImageToPhotosAlbum) {
    wx.saveImageToPhotosAlbum({
      filePath: url,
      success: function (res) {
        console.log(res);
        wx.showToast({ title: '海报已保存到手机相册', icon: 'none', mask: true, duration: 3000 });
      },
      fail: function (res) {
        console.log("保存失败");
        console.log(res);
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}

/* 绘制圆角图片 */ 
Picture.prototype.imgfillet = function(url, { left, top }, { width, height }, fillet) {
  //     this.context   图片  起始点X Y   图片宽  高   适配单位  圆角半径
  this.context.beginPath();
  this.context.save();
  left = left / 2;
  top = top / 2;
  width = width / 2;
  height = height / 2;
  fillet = fillet / 2;
  this.context.setLineWidth(1);
  this.context.setStrokeStyle('#ffffff');
  this.context.moveTo(left + fillet, top);
  this.context.lineTo(left + width - fillet, top);
  //this.context.arcTo(left + width , top, left + width , top + fillet, fillet); 
  this.context.lineTo(left + width, top);
  this.context.lineTo(left + width, top + height - fillet);
  this.context.lineTo(left + width, top + height);
  //this.context.arcTo(left + width, top + height, left + width - fillet, top + height, fillet); 
  this.context.lineTo(left + fillet, top + height);
  this.context.arcTo(left, top + height, left, top + height - fillet, fillet);
  this.context.lineTo(left, top + fillet);
  this.context.arcTo(left, top, left + fillet, top, fillet);
  this.context.setStrokeStyle('red')
  this.context.clip()
  this.context.drawImage(url, left, top, width, height);
  this.context.restore();
  this.context.closePath();
}



module.exports = Picture;