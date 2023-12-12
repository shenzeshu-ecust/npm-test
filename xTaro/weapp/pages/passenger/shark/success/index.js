// pages/success/index.js
import { cwx, CPage } from '../../../../cwx/cwx.js';

CPage({
  pageId: "10650016066",
  checkPerformance:true, // 白屏检测标志位
  data: {
    passengers: [],
    isshowAdd:0
  },
  onReady: function () {},
  onLoad: function (options) {
    var temps=[];
    var temp="";
    if (options.data){
      var wList = options.data.items;
      if (wList && wList.length>0) {
        if (wList.length>=10){
          this.setData({ isshowAdd: 1 });
        }else{
          this.setData({ isshowAdd: 0 });
        }

        for (var i = 0; i < wList.length;i++){
          temp = wList[i].cnName + " " + wList[i].enLastName + " " + wList[i].enFirstName;
          if (temp.length>15){
            temp = temp.substr(0,15)+"...";
          }
          temps.push({ name: temp});
        }
        this.setData({ passengers: temps});
      }
    }
  },
  addpassengertap: function (e) {
    //   console.log(JSON.stringify(e));
    this.invokeCallback(this.data.passengers);
    this.navigateBack();
  },
})