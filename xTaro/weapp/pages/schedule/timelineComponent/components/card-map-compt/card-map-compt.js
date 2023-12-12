// {{component}}.js
 import { cwx } from '../../../../../cwx/cwx.js';
import { jumpUrl, db09ToGcj02 } from '../../../utils/util.js'
const ubt = cwx.sendUbtByPage;

Component({
    /**
     * Component properties
     */
    properties: {
        address: {
            type: String
          },
        coordinate: {
            type: Object
        },
        mapText: {
          type: String,
        },
        isCanTouch: {
          type: Boolean,
          value: true
        },
        url: {
          type: String,
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
        mapClickTap: function(event) {
          if (!this.data.isCanTouch) return;
            ubt.ubtTrace(102324, {
              actionCode: "c_hotel_card_map_click",
              actionType: 'click'
            });
            if (this.data.url) {
              return jumpUrl(this.data.url);
            }

            let coordinate = this.data.coordinate;
            if (coordinate?.coordinateSystem === 'BD09') {
              coordinate = db09ToGcj02(coordinate.latitude, coordinate.longitude);
            }
            cwx.openLocation({
              latitude: coordinate?.latitude,
              longitude: coordinate?.longitude,
              name: this.data.address,
              address: this.data.address
            })
          }
    }
})
