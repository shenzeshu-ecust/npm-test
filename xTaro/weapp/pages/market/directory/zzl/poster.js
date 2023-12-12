import {  CPage, _ } from "../../../../cwx/cwx.js";
var utils = require('../../common/utils.js');
var Picture = require('../mktCommon/picture.js')
CPage({
    pageId: '10650054444',
    data: {
        img:'',
        ctivityId: '',
        openId: '',
        ciphertext: '',
        posterImg: ''
    },
    onLoad(options) {
        this.setData({
            posterImg: options.img,
            activityId: options.activityid,
            openId: options.openid,
            ciphertext: options.ciphertext
        },()=>{
            wx.showLoading({
              title: '图片生成中',
            })
            let path = `/pages/market/directory/zzl/index?innersid=1&activityid=${this.data.activityId}&openid=${this.data.openId}&ciphertext=${this.data.myCiphertext}`;
            utils.generateQrcode(path, '', '携程周周乐', '10650054444', (qrUrl) => {
            this.getPic(qrUrl)
            }) 
        })

        //关闭右上角转发
        wx.hideShareMenu();
    },
    getPic(qrUrl) {
        let pic = new Picture('mycanvas', 375, 612);
        pic.getImgInfo(this.data.posterImg, (data) => {
            pic.drawImg(data.path, { left: 0, top: 0 }, { width: 375, height: 612 })
            pic.getImgInfo(qrUrl, (data) => {
                pic.imgToArc(data.path, { left: 250, top: 498 }, { width: 100, height: 100, radius: 50 })
    
                //绘制
                pic.draw(() => {
                    pic.canvasToImgPath((path) => {
                      this.setData({ img: path });
                    })
                  });
                  wx.hideLoading()
            })
        })
       
    },
    savePic() {
        utils.toSave(this.data.img)
    }
})