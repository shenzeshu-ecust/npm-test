/* 房型浮层 - 特色房模块 */
import { cwx } from '../../../../cwx/cwx.js';
const styleType = {
    HORIZONTAL: 2, // 横向展示
    VERTICAL: 3 // 竖版展示
};

Component({
    /**
   * 组件的属性列表
   */
    properties: {
        roomAtmosphereInfo: {
            type: Object,
            value: {},
            observer: function () {}
        },
        name: {
            type: String,
            value: '',
            observer: function () {}
        },
        subRoom: {
            type: Object,
            value: {},
            observer: function () {}
        }
    },

    /**
   * 组件的初始数据
   */
    data: {},
    /**
   * 生命周期函数，可以为函数，或一个在methods段中定义的方法名
   */
    attached () {
        const { roomAtmosphereInfo } = this.properties;
        const {
            headTitle,
            roomAtmosphereFacilityInfos,
            facilityShowStyle,
            upPicture,
            downPicture,
            color,
            proprietaryTag,
            skipPage
        } = roomAtmosphereInfo;
        let bgColor = '';
        if (color) {
            // 处理背景色 渐变色需要前端手动拼接成css
            const colors = color.split('|');
            bgColor = colors?.length > 1
                ? `background: linear-gradient(to bottom, ${colors[0]} 0%, ${colors[1]} 20%, ${colors[1]} 100%);`
                : `background-color: ${colors[0]};`;
        }
        this.setData({
            headTitle,
            skipPage,
            roomAtmosphereFacilityInfos,
            downPicture,
            upPicture,
            proprietaryTag,
            showVertical: facilityShowStyle === styleType.VERTICAL,
            bgColor
        });
    },
    /**
   * 组件的方法列表
   */
    methods: {
    // 跳转到特色房静态页
        goStaticPage () {
            const { skipPage, headTitle } = this.data;
            if (skipPage) {
                // 发点击埋点
                this.triggerEvent('roomSceneLayerClick', {
                    staticPage: skipPage
                });

                cwx.component.cwebview({
                    data: {
                        url: skipPage,
                        title: headTitle
                    }
                });
            }
        }
    }
});
