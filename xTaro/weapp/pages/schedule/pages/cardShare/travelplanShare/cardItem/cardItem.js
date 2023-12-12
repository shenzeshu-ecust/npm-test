// {{component}}.js
import { cwx } from '../../../../../../cwx/cwx';
Component({
    /**
     * Component properties
     */
    properties: {
        itemData: {
            type: Object,
            value: null
        }
    },
    /**
     * Component initial data
     */
    data: {
    },

    /**
     * Component methods
     */
    methods: {
        onGoToDetails(e) {
            let targetUrl = e.currentTarget.dataset.detailUrl;
            if (!targetUrl) return;
            
            console.log(targetUrl);
            if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
              // 跳转H5页面
              cwx.component.cwebview({
                data: {
                  url: encodeURIComponent(targetUrl)
                }
              })
            } else {
              targetUrl.trim()
              if(targetUrl[0] != '/') {
                targetUrl = '/' + targetUrl.trim()
              }
              cwx.navigateTo({
                url: targetUrl,
              });
            }
          },
    }
})
