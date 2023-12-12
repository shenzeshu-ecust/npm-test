const systeminfo = wx.getSystemInfoSync()
const width = systeminfo.windowWidth
Component({
    behaviors: [],
    properties: {
        noticeContent: String, // 简化的定义方式
        level:Number,//长度级别
        hideNotice: Boolean,
        quickFilterTags: Array,
        hkticket: Boolean
    },
    data: {
        noticeContent: null,
        level:0,
    }, // 私有数据，可用于模板渲染

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            //计算长度下占用屏幕的宽度
            let contentLength = this.getNoticeContentLength()
            let level = parseInt((contentLength + 12) * 12 / width) // 左右padding24px 所以+4
            this.setData({
                noticeContent: this.data.noticeContent,//以40个进行动画匹配，最好在60个字左右
                level:level,
            })
        },
        moved: function () { },
        detached: function () { },
    },

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { }, // 此处attached的声明会被lifetimes字段中的声明覆盖
    ready: function() { },
    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () { },
        hide: function () { },
        resize: function () { },
    },

    methods: {
        toNoticeDetail: function(){
            this.triggerEvent('toNoticeDetailTrigger')
        },
        getNoticeContentLength: function(){
            console.log(this.data.noticeContent,'biaodianNum');
            if (this.data.noticeContent.includes('<font') || this.data.noticeContent.includes('<span')) {
                var re = /[\u4E00-\u9FA5]/g; 	
                var reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g;
                var hanziNum = 0;
                var biaodianNum = 0;
                var value = this.data.noticeContent
                if(value.match(re)!=null){
                    hanziNum = value.match(re).length;
                }
                if(value.match(reg)!=null){
                    biaodianNum =  value.match(reg).length;
                }
                console.log(hanziNum,biaodianNum,'biaodianNum');
                return hanziNum + biaodianNum ;
            }else {
                return this.data.noticeContent.length
            }
        }
    },
})
