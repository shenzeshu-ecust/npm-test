import { CPage,cwx} from '../../../../cwx/cwx.js';
CPage({
  pageId: "10650045701",
  data: {
  },
	 onLoad: async function (options) {
        let keys = Object.keys(options);
        let url = '';
        keys.forEach(function (key, index) {
            // console.log('遍历 options, index:', index, 'key:', key, 'value:', options[key]);
            let value = options[key];
            if (Object.prototype.toString.call(value) == '[object Object]') {
                let mirrorVal = {
                    ...value
                };
                try {
                    value = JSON.stringify(mirrorVal); // 处理入参 options 的 属性值为 object
                } catch (error) {
                    value = options[key];
                }
            }
            url = url + (index === 0 ? '?' : '&') + key + '=' + value;
        })
        this.oldUrlParam = '/pages/live/webcast/home' + url;
        let oldUrl = '/pages/you/place/webcast/home' + url
        this.ubtTrace('o_live_wx_error_old_url', {
          "param": url,
          "oldUrl":oldUrl,
          'newUrl':this.oldUrlParam
        });
        console.info("我的链接： " +JSON.stringify(options) )
        console.info("我的链接： " + this.oldUrlParam )
    },

    onReady: function(){
      cwx.redirectTo({
        url: this.oldUrlParam,
      })
    },
})

