/**
 * 城市组件
 * @module component/country
 * @example
 * <view bindtap="tst">
 * 
 * tst:function(){
    cwx.component.areas({
        data: {
            selectedCode: '86'//选中的区域码
        },
        immediateCallback: function(re){
            console.error(re)
        }
    })
}

    这里的re包含了
            {
            "code": 86,
            "cn": "中国",
            "en": "China",
            "py": "ZHONG GUO DA LU",
            "country": "CN",
            "open": 1,
            "countryId": "1",
            "heat": 100
            }
 */
import { cwx, CPage } from '../../cwx.js';

//citylist.js
var originInlandCities = null;
var originInterCities = null;
var selectedCities = null;
var currentCityLength = 0;


var letterArray = [];
var _letter = 'A';
var _next = _letter;
var _countI = 0;
do{
    letterArray.push(_next)
    if(_next == 'Z') break;
    _countI++;
}while((_next = String.fromCharCode(_next.charCodeAt(0)+1)) && _countI < 30)
var letterDict = {};
letterArray.forEach(function(item){
    letterDict[item] = [];
})
var countryCodes = null;
var timerScrollMove = null;
var isScrollMove = false;


CPage({
    pageId: "",
    data: {
        title: '选择国家或者地区',
        toHash: '',
        hotAreas: [
            {
                cn: '中国大陆',
                code: '86'
            },
            {
                cn: '中国香港',
                code: '852'
            },
            {
                cn: '中国澳门',
                code: '853'
            },
            {
                cn: '中国台湾',
                code: '886'
            }
        ]
    },

    _sortData: function(data){
        data && data.forEach(function(item){
            letterDict[item.py.charAt(0).toUpperCase()].push(item)
            
        }.bind(this))
        countryCodes = {
            letterArray: letterArray,
            letterDict: letterDict,
            codesArray: data
        }
        this.setData(countryCodes)
        cwx.setStorageSync('cwx_country_codes', JSON.stringify(countryCodes));
    },
    onLoad: function (options) {
        this.setData(Object.assign({}, this.data, options.data))
        cwx.showToast({
            title: '加载中..',
            icon: 'loading',
            duration: 10000,
            complete: function () {
                //that._showLoading();
            }
        });
        countryCodes = cwx.getStorageSync('cwx_country_codes');
        if(countryCodes == null || countryCodes == ''){
            cwx.request({
                url: '/restapi/soa2/12687/GetCountryCode',
                success: function(res){
                    // console.error(res);
                    this._sortData(res.data.countryInfoList)
                    setTimeout(function(){
                        cwx.hideToast();
                    }, 1000)
                }.bind(this),
                fail: function(res){
                    cwx.showToast({
                        title: '接口请求失败..',
                        icon: 'loading',
                        duration: 300,
                        complete: function () {
                            //that._showLoading();
                            cwx.hideToast();
                        }
                    });
                    countryCodes = {
                        letterArray: letterArray,
                        letterDict: letterDict,
                        codesArray: []
                    }
                    this.setData(countryCodes)
                }.bind(this)
            })
        }else{
            //console.error(countryCodes)
            countryCodes = JSON.parse(countryCodes);
            this.setData(countryCodes)
            setTimeout(function(){
                cwx.hideToast();
            }, 1000)
            
        }
    },
    onReady: function(){
        cwx.setNavigationBarTitle({
            title: this.data.title
        })
    },
    onHashChange: function(e){
        this.setData({
            currentLetterTop: e.currentTarget.offsetTop - 12,
            currentLetter: e.currentTarget.dataset.letter,
            toHash: 'hash_' + e.currentTarget.dataset.letter.toUpperCase()
        })
        isScrollMove = true;
        clearTimeout(timerScrollMove);
        const _THIS = this;
        timerScrollMove = setTimeout(function(){
            isScrollMove = false;
            _THIS.setData({
                currentLetter: ''
            })
        }, 600)
    },
    onHashChangeToHot: function(){
        this.setData({
            toHash: 'hash_hot',
            currentLetter: ''
        })
        isScrollMove = true;
        clearTimeout(timerScrollMove);
        timerScrollMove = setTimeout(function(){
            isScrollMove = false;
        }, 600)
    },
    onHashChangeToBottom: function(){
        this.setData({
            toHash: 'hash_end',
            currentLetter: ''
        })
        isScrollMove = true;
        clearTimeout(timerScrollMove);
        timerScrollMove = setTimeout(function(){
            isScrollMove = false;
        }, 600)
    },
    bindScroll: function(){
        if(!isScrollMove){
            this.setData({
                toHash: '',
                currentLetter: ''
            })
        }
    },
    chooseArea: function(e){
        //console.error(e.currentTarget.dataset.area)
        this.setData({
            selectedCode: e.currentTarget.dataset.area
        })
        var self = this;
        var re = countryCodes.codesArray.find(function(item){return item.code == self.data.selectedCode})
        //console.error(re)
        this.invokeCallback(re);
        this.navigateBack();
    }
})
