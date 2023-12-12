import { cwx } from "../../../../../cwx/cwx";
import util from "../../util";
import { shared } from "../../trainConfig";

const scaleRate = 1.142;
const itemWidth = 140;
const itemMargin = 14;
const designWidth = 375;
const screenWidth = cwx.getSystemInfoSync().screenWidth;
const realItemWidth = parseInt((screenWidth / designWidth) * itemWidth);
const realItemMargin = parseInt((screenWidth / designWidth) * itemMargin);
// 固定数值部分
const midWidth = realItemWidth * scaleRate;
const midMargin = (realItemWidth + realItemMargin * 2 - midWidth) / 2;
const halfItemW = (screenWidth - midMargin * 2 - midWidth) / 2;

Component({
    properties: {
        visible: {
            type: Boolean,
        },
        info: {
            type: Object,
        },
        isPay: {
            type: Boolean,
        },
    },
    data: {
        popData: {}, // 格式化后组件的数据
        carouselList: [],
        offsetX: 0,
        currIdx: 0, // 移动结束后激活的 item
        currX: 0,
        startX: 0, // 拖拽初始位置
    },
    lifetimes: {
        ready() {},
        error(err) {
            console.log("全能抢票浮层报错", err);
        },
    },
    observers: {
        visible: function (_) {
            if (_) {
                const { info, isPay } = this.properties;

                this.initData();

                util.ubtFuxiTrace("228465", {
                    PageId: isPay ? shared.pageIds.list.pageId : "10650037941",
                    TicketPrice: isPay ? info.price : "",
                });
            }
        },
    },
    methods: {
        initData() {
            this.formatData();
            this.initCarousel();
        },
        formatData() {
            const { info } = this.properties;
            const packageDesc = info.PackageDesc.split("|");
            const list = info.ServiceProductList.map((v) => ({
                ...v,
                Desc: v.Desc.split("|"),
                lessDesc: v.Desc.split("|").slice(0, 2),
                expand: v.Desc.split("|").length < 3, // 超过两行隐藏
            }));

            this.setData({
                popData: {
                    ...info,
                    ServiceProductList: list,
                    PackageDesc: packageDesc,
                },
            });
        },
        initCarousel() {
            const { ServiceProductList } = this.data.popData;
            // 不做无缝轮播 重复个 20 遍
            const list = Array.from({ length: 20 }).reduce(
                (arr, v) => [...arr, ...ServiceProductList],
                []
            );
            // 取第 10 组的第一个元素作为起点
            const idx = ServiceProductList.length * 10;
            // 计算首次偏移量
            const _offset =
                (realItemWidth + realItemMargin) * (idx - 1) +
                itemWidth -
                halfItemW;

            this.setData({
                carouselList: list,
                offsetX: _offset,
                currIdx: idx,
                currX: _offset,
            });
        },
        onClickExpand() {
            const { carouselList, currIdx } = this.data;
            const list = carouselList.map((v) => ({
                ...v,
                expand: false,
            }));
            if (list[currIdx]) {
                list[currIdx].expand = true;
            }

            this.setData({
                carouselList: list,
            });
        },
        onDragstart(e) {
            const { changedTouches } = e;
            if (changedTouches.length !== 1) return;

            const { clientX } = changedTouches[0];

            this.setData({ startX: clientX });
        },
        onDragend(e) {
            const { changedTouches } = e;
            if (changedTouches.length !== 1) return;

            const { startX, currIdx, currX } = this.data;
            const { clientX } = changedTouches[0];
            const diff = clientX - startX;
            const landing = [halfItemW, screenWidth - halfItemW]; // 点击事件的落点

            let _idx = currIdx;
            let _currX = currX;

            // 点击事件
            if (Math.abs(diff) < 1) {
                if (clientX <= landing[0]) {
                    _idx = currIdx - 1;
                } else if (clientX >= landing[1]) {
                    _idx = currIdx + 1;
                }
            }

            if (diff > realItemWidth / 8) {
                _idx = currIdx - 1;
            } else if (diff < -realItemWidth / 8) {
                _idx = currIdx + 1;
            }
            _currX =
                (realItemWidth + realItemMargin) * (_idx - 1) +
                itemWidth -
                halfItemW;

            this.setData({
                currIdx: _idx,
                offsetX: _currX,
            });
        },
        hide(e) {
            const type = e.currentTarget.dataset.type;
            const { info, isPay } = this.properties;

            util.ubtFuxiTrace("228466", {
                PageId: isPay ? shared.pageIds.list.pageId : "10650037941",
                TicketPrice: isPay ? info.price : "",
                clickType: type ? 3 : 2,
            });

            this.triggerEvent("hideBackDrop");
        },
        itemHandle(e) {
            const { info, isPay } = this.properties;

            util.ubtFuxiTrace("228466", {
                PageId: isPay ? shared.pageIds.list.pageId : "10650037941",
                TicketPrice: isPay ? info.price : "",
                clickType: 1,
            });

            this.triggerEvent("itemhandle", e.currentTarget.dataset);
        },
    },
});
