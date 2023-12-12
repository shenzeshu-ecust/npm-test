import common from '../../common/common.js';
import {cwx} from '../../../../cwx/cwx.js';
import {
    getLiveSquare
} from '../service/webcastRequest.js';
Component({
    /**
    * 组件的属性列表
    */
    properties: {
        headerTop: {
            type: Number,
            value: 0
        },
        windowHeight:{
            type:Number,
            value:0
        },
        liveID:{
            type:Number,
            value:0
        }
    },

  /**
   * 组件的初始数据
   */
    data: {
        showRecommendVideo: false,  //显示面板
        videoList: [],
        videoListTrace: [], //用来记录曝光埋点
        listLoadingState: 0 ,//0=正常，1=加载，2=加载失败，3=加载成功, 4没有更多
        loadResult:{},
        pageInfo: '',
    },

  /**
   * 组件的方法列表
   */
    methods: {
			catchtouchstart:function(){
				this._hideRecommendList();
			},
       catchtouchmove:function(){
				//  this._hideRecommendList();
         return false
       },
        _getVideoList(){
            console.log("getLiveSquare");
            let self = this;
            let param = {
                type: 'channel',
                needGoods: false,
                pageInfo: this.data.pageInfo,
                currentLiveId: this.data.liveID,
                id: 5 //表示更多直播间
            };
            let loadResult = {};
            let listLoadingState = this.data.listLoadingState;
            let videoList = this.data.videoList;
            let nextPageInfo = '';
            let videoListTrace = this.data.videoListTrace;

            if(listLoadingState == 1 ||   (listLoadingState == 4 && videoList && videoList.length > 0)){
                return;
            }
            listLoadingState = 1;
            if(videoList.length <= 0){
                listLoadingState = 0;
            }

            this.setData({
                listLoadingState: listLoadingState
            })
            getLiveSquare(param,function(res){
                if(common.checkResponseAck(res)){
                    console.log("getLiveSquare",res);
                    nextPageInfo = res.data.nextPageInfo || '';
                    let cardList = res.data.cardList || [];
                    let newCardList = [];
                    if(cardList && cardList.length){
                        cardList.map((item,index)=>{
                            if(item.type == "live"){//0 - 正在直播，1 - 直播结束，11 - 生成回放中，12 - 预约直播，13 - 直播取消  6 - 回放已生成
                                let playingStr = '';
                                let playingClass = '';
                                if(item.liveStatus == 0){
                                    if(item.activeStatus && item.activeText){
                                        playingStr = item.activeText;
                                        if(item.activeStatus == 1 || item.activeStatus == 3){ //抽奖
                                            playingClass = 'prize';
                                        } 
                                        // else if(item.activeStatus == 2){
                                        //     playingClass = 'point';
                                        // }
                                    } else {
                                        playingClass = '';
                                        playingStr =  common.formateNum(item.watchCount,1) + '热度';
                                    }
                                } else if(item.liveStatus == 12){
                                    playingStr = self._handldDayStr(item.startTime);
                                } else if(item.liveStatus == 6){
                                    playingStr = '回放已生成';
                                } else  if(item.liveStatus == 11){
                                    playingStr = '回放生成中';
                                } else  if(item.liveStatus == 1){
                                    playingStr = '已结束';
                                }
                                
                                item.playingClass = playingClass;
                                item.playingStr = playingStr;
                                newCardList.push(item);
                            }
                        })
                    }
                    videoList = videoList.concat(newCardList);
                    self.data.videoListTrace = videoListTrace.concat(newCardList);
                    if(self.data.showRecommendVideo && newCardList.length){
                        self._sendListTrace();
                    }
                    console.log("newCardList",newCardList)
                    if(videoList.length <= 0){
                        loadResult = {
                            title: '暂无数据',
                            subtitle:'点击下方刷新按钮重新加载',
                            btnText: '刷新'
                        }
                    }
                    if(nextPageInfo){
                        listLoadingState = 3;
                    } else {
                        listLoadingState = 4;
                    }
                    self.data.pageInfo = nextPageInfo;
                    self.setData({
                        videoList: videoList, 
                        listLoadingState:  listLoadingState,
                        loadResult: loadResult
                    })
                } else {
                    if(videoList == 0){
                        loadResult = {
                            title: '网络不给力',
                            subtitle:'请检查网路设置后再试',
                            btnText: '刷新'
                        }
                        
                    } else {
                        wx.showToast({
                            title: '网络不给力，请检查网路设置后再试',
                            icon: 'none'
                         })
                    }
                    self.setData({
                        listLoadingState: 2,
                        loadResult: loadResult
                    })
                    
                }
            })
        },

        _handldDayStr(data){
            let showStr = '';
            let currentDate = this._getDateStr(data);
            let currentDateStr =  currentDate.split("-");
            let year = currentDateStr[0];
            let month = currentDateStr[1];
            let day = currentDateStr[2];
            let hour = currentDateStr[3];
            let minute = currentDateStr[4];

            let date0 = this._getDateStr('',0);//今天
            let str0=date0.split("-");

            let date1 = this._getDateStr('', 1);//明天
            let str1=date1.split("-");

            let date2 = this._getDateStr('', -1);//昨天
            let str2=date2.split("-");

            let subStr = '开播';
            if(year == str0[0] && month == str0[1] && day == str0[2]){
                showStr = "今日" + subStr;
            } else if(year == str1[0] && month == str1[1] && day == str1[2]){
                showStr = "明日" + subStr;
            } else if(year == str2[0] && month == str2[1] && day == str2[2]){
                showStr = "昨日" + subStr;
            } else {
                showStr = month + "月"+  day + "日" + subStr  ;
            }
            return  showStr ;
        },

        _getDateStr (time, addDayCount) {   //传入特定date 获取年月日, AddDayCount获取当前时间的 今天明天
            let date =  time ? new Date(time) : new Date();
            if(addDayCount != undefined){
                date.setDate(date.getDate() + addDayCount);//获取AddDayCount天后的日期 
            }
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hour = date.getHours();
            let minute = date.getMinutes();
            let sec = date.getSeconds();

            return  year + "-" + month + "-" + day + "-"+ hour + "-" + minute; 
        },

        _showRecommentList(){
            this.setData({
                showRecommendVideo: true
            })
            let myEventDetail = {
                actionCode: 'o_gs_tripshoot_lvpailive_morerooms',
                liveID: this.data.liveID
            } 
            this.triggerEvent('doRecommendListTrace', myEventDetail, {});
            this._sendListTrace();
        },

        _hideRecommendList(){
            this.setData({
                showRecommendVideo: false
            })
        },

        _jumpToNext(e){

            let url = e && e.currentTarget &&  e.currentTarget.dataset && e.currentTarget.dataset.url || '';
            let liveID = e && e.currentTarget &&  e.currentTarget.dataset && e.currentTarget.dataset.liveid || 0;
            let liveStatus = e && e.currentTarget &&  e.currentTarget.dataset && e.currentTarget.dataset.livestatus || 0;
            if(url == ''){
                return
            }

            if(url.indexOf('?') > -1){
                url += '&source=liveroommore&innersource=liveroommore';
            } else {
                url += '?source=liveroommore&innersource=liveroommore';
            }
            let myEventDetail = {
                actionCode: 'o_gs_tripshoot_lvpailive_liverooms_click',
                liveID: liveID,
                liveStatus: liveStatus,
              
            } 
            this.triggerEvent('doRecommendListTrace', myEventDetail, {});
          
            if(url.indexOf('/pages/') > -1 || url.indexOf('cwebview') > -1){
                cwx.redirectTo({
                    url: url
                })
            } else if(url.indexOf('https') > -1){
                let param = {
                    url: encodeURIComponent(url),
                    needLogin: false,
                    isNavigate: true,
                }
                let data = "/pages/you/lvpai/webview/webview?data=" + JSON.stringify(param)
                cwx.redirectTo({
                    url: data
                })
            }
        },

        _scrolltolower(e){
            console.log("_scrolltolower",e)
            this._getVideoList();
        },

        _sendListTrace(){
            let videoListTrace = this.data.videoListTrace;
            console.log("videoListTrace",videoListTrace)
            if(videoListTrace && videoListTrace.length){ //0 - 正在直播，1 - 直播结束，11 - 生成回放中，12 - 预约直播，13 - 直播取消
                videoListTrace.map((item,index)=>{
                    if(!item.isLogged){
                        let myEventDetail = {
                            actionCode: 'o_gs_tripshoot_lvpailive_liverooms_show',
                            liveID: item.liveId,
                            liveStatus: item.liveStatus
                        } 
                        this.triggerEvent('doRecommendListTrace', myEventDetail, {});
                        item.isLogged = true;
                    }
                })
                this.videoListTrace = videoListTrace;
            }

        },
    }
})
