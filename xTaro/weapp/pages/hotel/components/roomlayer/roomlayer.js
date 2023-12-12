import constConf from '../../common/C';
import { cwx } from '../../../../cwx/cwx.js';
import commonfunc from '../../common/commonfunc';
import util from '../../common/utils/util';
const pageStatus = {
    imgSwitching: false
};
const HIDDEN_ROOMLAYER_NAV_LIMIT_SCROLL_TOP = 174;
const defaultData = () => {
    return {
        currentImageIndex: 0,
        showGiftDesc: false,
        showMoreFacility: false,
        showHourDescInfo: false,
        suiteImgIndex: { // 套餐图片当前索引，2-食，3-享
            2: {},
            3: {}
        },
        hiddenMoreInfo: { // 套餐特别补充文案隐藏，2-食，3-享
            2: {},
            3: {}
        },
        hiddenMoreMenu: {
            2: {},
            3: {}
        },
        showMoreChilcPolicy: false
    };
};

Component({
    properties: {
        isShown: {
            type: Boolean,
            value: false,
            observer: function () {}
        },
        subRoom: {
            type: Object,
            value: {},
            observer: 'onChangeVipExchange'
        },
        room: {
            type: Object,
            value: {}
        },
        isIphoneX: {
            type: Boolean,
            value: false
        },
        totalDays: {
            type: Number,
            value: 1,
            observer: 'onChangeTotalDays'
        },
        priceId: {
            type: String,
            value: ''
        },
        isQuickApp: {
            type: Boolean,
            value: false
        },
        from: {
            type: String,
            value: ''
        },
        roomLayerExposeObj: {
            type: Object,
            value: {},
            observe: 'refreshExposeNode'
        }
    },
    data: {
        menuBottom: 0,
        ...defaultData()
    },
    attached () {
        // showPriceDetail初始化
        this.onChangeTotalDays();
        this.onChangeChildPolicy();
        this.buildComplicatedBedInfo();
        this.getMenuInfo();
        // 若自定义组件需要发曝光埋点，必须在attatch中初始化监听器，调用cwx.sendUbtExpose.observe(this);
        this.bindObserve();
        this.buildRoomPicture();
    },
    methods: {
        closeRoomLayer (e) {
            this.triggerEvent('hiddenLayer');
            this.setData({
                priceId: '',
                ...defaultData()
            });
        },
        roomImgSwiperChange (e) {
            const current = e.detail.current;
            const { type = '', suitetype, index } = e.currentTarget?.dataset || {};

            // 滑块切换加延迟，避免滑动过快导致组件崩溃
            if (!pageStatus.imgSwitching) {
                pageStatus.imgSwitching = true;
                if (type === 'live') {
                    this.setData({
                        currentImageIndex: current
                    });
                } else {
                    this.setData({
                        [`suiteImgIndex.${suitetype}.${index}`]: current
                    });
                }
                pageStatus.subRoomSwiperTimeOut = setTimeout(() => {
                    pageStatus.imgSwitching = false;
                }, 100);
            }
        },
        toggleGiftDesc (e) {
            this.setData({
                showGiftDesc: !this.data.showGiftDesc
            });
        },
        toggleMoreFacility (e) {
            this.setData({
                showMoreFacility: !this.data.showMoreFacility
            });
        },
        toggleMoreChildPolicy () {
            this.setData({
                showMoreChildPolicy: !this.data.showMoreChildPolicy
            });
        },
        toggleMoreSuite (e) {
            const { index, type } = e.currentTarget?.dataset || {};
            if (!type || index === undefined) return;
            const currentStatus = !!this.data.hiddenMoreInfo[type][index];
            this.setData({
                [`hiddenMoreInfo.${type}.${index}`]: !currentStatus
            });
        },
        toggleMoreMenu (e) {
            const { index, type } = e.currentTarget?.dataset || {};
            if (!type || index === undefined) return;
            this.setData({
                [`hiddenMoreMenu.${type}.${index}`]: !this.data.hiddenMoreMenu[type][index]
            });
        },
        toggleHourDescInfo () {
            this.setData({
                showHourDescInfo: !this.data.showHourDescInfo
            });
        },
        onChangeTotalDays () {
            const { subRoom, from, totalDays } = this.data;
            this.setData({
                showPriceDetail: totalDays > constConf.longRentLimitDay
                    ? false
                    : from === 'detail' || (subRoom?.priceCalcItems?.length),
                fromOrderdetail: from === 'orderdetail'
            });
        },
        noImageTrace () {
            this.triggerEvent('noImageTrace');
        },
        /*
        * 房型浮层 - 自营房点击埋点
        */
        roomSceneLayerClick (e) {
            this.triggerEvent('roomSceneLayerClick', { staticPage: e?.detail?.staticPage });
        },
        onChangeChildPolicy () {
            const room = this.data.room || {};
            const childPolicyInfo = room?.childPolicyDisplayInfo?.subCategoryInfos || [];
            childPolicyInfo.forEach(subCategoryItem => {
                if (subCategoryItem?.tableInfo) {
                    const subCategoryInfo = subCategoryItem.tableInfo;
                    const target = [];
                    let curTitle = subCategoryInfo.tableItems[0]?.tableDetails[0]?.content;
                    let curItems = [];
                    if (curTitle) {
                        subCategoryInfo.tableItems.forEach(tableItem => {
                            const title = tableItem.tableDetails[0]?.content;
                            const detailItems = tableItem.tableDetails.slice(1);
                            const renderDetail = [];
                            detailItems.forEach(detailItem => {
                                // 高亮
                                const highlightCon = detailItem?.highlight;
                                // 低亮
                                const lowlightCon = detailItem?.lowLight;
                                let detailContent = [detailItem?.content];
                                if (highlightCon || lowlightCon) {
                                    const lightRe = new RegExp(`(${highlightCon}|${lowlightCon})`, 'g');
                                    detailContent = detailItem?.content?.split(lightRe);
                                }
                                const contentList = [];
                                detailContent.forEach(contentItem => {
                                    contentItem && contentList.push({
                                        content: contentItem,
                                        highlight: contentItem === highlightCon,
                                        lowlight: contentItem === lowlightCon
                                    });
                                });
                                renderDetail.push(contentList);
                            });
                            if (title === curTitle) { // 合并
                                curItems.push(renderDetail);
                            } else {
                                target.push({
                                    title: curTitle.split('\n'),
                                    items: curItems
                                });
                                curTitle = title;
                                curItems = [renderDetail];
                            }
                        });
                        target.push({
                            title: curTitle.split('\n'),
                            items: curItems
                        });
                    }
                    subCategoryItem.tableInfo.tableItems = target;
                    // 温泉酒店单独给样式
                    const JCP_HOTEL = 'japaneseChildPolicy';
                    const type = subCategoryItem?.type;
                    if (type === JCP_HOTEL) {
                        // 温泉酒店儿童政策表格第一列宽度为18%
                        subCategoryItem.tableInfo.rowWidth = 18;
                    } else {
                        // 普通酒店儿童政策表格三列宽度为33%，两列为50%
                        subCategoryItem.tableInfo.rowWidth = Math.ceil(100 / subCategoryInfo?.headers?.length) || 33;
                    }
                }
            });
            this.setData({
                room
            });
        },
        onChangeVipExchange () {
            const { subRoom } = this.data;
            if (!subRoom) return;
            const { rewardMealInfo = {}, cancelPolicyInfo = {}, isShowReward } = subRoom;

            if (isShowReward) {
                const getExtensionObj = (extension, type) => {
                    if (!extension) return;
                    const result = {};
                    extension.forEach(item => {
                        const key = item[`${type}`];
                        result[`${key}`] = item.value;
                    });
                    return result;
                };

                // 会员享免费兑早餐
                const extensionInfo = rewardMealInfo?.mealDetailModel?.extensionInfos;
                if (extensionInfo) {
                    const {
                        TagIcon: tagIcon,
                        OriginMeal: originMeal,
                        FloatingMealDesc: floatingMealDesc,
                        MealRewardStyleId: styleId,
                        icon
                    } = getExtensionObj(extensionInfo, 'key');
                    const mealExchangeInfo = {
                        tagIcon,
                        styleId,
                        icon
                    };
                    if (originMeal) {
                        mealExchangeInfo.originContent = originMeal.split('|')[1];
                        mealExchangeInfo.originRoom = originMeal.split('|')[0];
                    }
                    if (floatingMealDesc) {
                        mealExchangeInfo.exchangeContent = floatingMealDesc.split('|')[1];
                        mealExchangeInfo.vipExchange = floatingMealDesc.split('|')[0];
                    }
                    subRoom.mealExchangeInfo = mealExchangeInfo;
                }

                // 会员享免费兑取消
                const labelExtension = cancelPolicyInfo?.labelExtensions;
                const cardTitleContent = cancelPolicyInfo?.cardTitle || '';
                const anXinCancel = labelExtension?.find(it => it.type === 'AnXinCancel');
                if (labelExtension && (!anXinCancel || anXinCancel === 'F')) {
                    const {
                        CurrentCancelRewardTitle: originRoom,
                        ConvertibleCancelRewardDesc: exchangeContent,
                        ConvertibleCancelRewardTitle: vipExchange,
                        TagIcon: tagIcon,
                        CancelRewardStyleId: styleId
                    } = getExtensionObj(labelExtension, 'type');
                    const cancelExchangeInfo = {
                        originContent: cardTitleContent,
                        originRoom,
                        exchangeContent,
                        vipExchange,
                        tagIcon,
                        styleId
                    };

                    subRoom.cancelExchangeInfo = cancelExchangeInfo;
                }

                this.setData({
                    subRoom
                });
            }
        },

        handlePreviewImg (e) {
            const { room, subRoom } = this.data;
            const { url: current, type, index } = e.currentTarget.dataset;
            let urls;
            if (type === 'live') {
                urls = room.pictureList;
            } else {
                const packageInfo = subRoom.roomPackageInfo?.packageInfoList || [];
                const curPackageInfo = packageInfo.filter(item => item?.type === type);
                curPackageInfo.forEach(curPackageItem => {
                    urls = curPackageItem?.xItems[index]?.imgs;
                });
            }
            cwx.previewImage({
                urls,
                current
            });
        },
        // 复杂床型
        buildComplicatedBedInfo () {
            const complicatedBedInfo = this.data.room.complicatedBedInfo || {};
            const roomBeds = complicatedBedInfo.roomBedEntity || [];
            if (!roomBeds.length) return;
            let hasBedGroup = false; // 若各卧室|房间均只有一种床型选项，则床型选项列不展示
            roomBeds.forEach(bed => {
                bed.roomName = roomBeds.length > 1 ? bed.roomName : '';
                const bedGroups = bed.bedGroups || [];
                const bedGroupLength = bedGroups.length;
                bedGroupLength > 1 && (hasBedGroup = true);
                bed.bedGroups = bedGroups.map((singleGroup, idx) => {
                    singleGroup.childBedInfos?.forEach(childBed => {
                        childBed.bedWidth = Number(childBed.bedWidth) ? `${childBed.bedWidth}米` : childBed.bedRangeInfo.displayDesc;
                    });
                    return ({
                        subTitle: bedGroupLength > 1 ? `选项${idx + 1}` : '',
                        childBedInfos: singleGroup.childBedInfos
                    });
                });
            });
            complicatedBedInfo.hasBedGroup = hasBedGroup;
            this.setData({
                'room.complicatedBedInfo': complicatedBedInfo
            });
        },
        // 胶囊
        getMenuInfo () {
            try {
                const { bottom = 0, top = 0, height = 0 } = cwx.getMenuButtonBoundingClientRect();
                this.setData({
                    menuBottom: bottom,
                    menuTop: top,
                    menuHeight: height
                });
            } catch (e) {}
        },
        buildRoomPicture () {
            let { pictureList, newPictureList } = this.properties.room;
            if (!pictureList?.length) return;
            if (newPictureList?.length) {
                pictureList = newPictureList.map(picture => {
                    const { urlBody, urlExtend } = picture;
                    const [pictureType, width, height, quality, waterMarkName, waterMarkPosition] = ['C', 1280, 853, 50, 'ht8', 3];
                    return commonfunc.getDynamicImageUrl({
                        urlBody,
                        urlExtend,
                        type: pictureType, // 切图类型
                        width, // 图片宽度
                        height, // 图片宽度
                        quality, // 图片质量
                        waterMarkName, // 水印名
                        waterMarkPosition // 水印位置
                    });
                });
            }
            this.setData({
                'room.pictureList': pictureList
            });
        },
        bindObserve () {
            cwx.sendUbtExpose.observe(this); // 在attached中绑定监听器
        },
        refreshExposeNode () {
            cwx.sendUbtExpose.refreshObserve(this); // 当组件中需要发曝光埋点的目标节点有变化时更新
        },
        onScroll: util.throttle(function (e) {
            const scrollTop = e.detail.scrollTop;
            let showRoomLayerNav;
            if (scrollTop > HIDDEN_ROOMLAYER_NAV_LIMIT_SCROLL_TOP) {
                showRoomLayerNav = true;
            } else {
                showRoomLayerNav = false;
            }
            this.setData({
                showRoomLayerNav
            });
        }, 150, true)
    },
    detached: function () {
        pageStatus.subRoomSwiperTimeOut && clearTimeout(pageStatus.subRoomSwiperTimeOut);
    },
    noop () {}
});
