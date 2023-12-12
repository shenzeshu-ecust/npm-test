const guaranteeType = ['ONLINE_GUARANTEE', 'CREDIT_GUARANTEE'];
// todo: 返现模块，与在线付同一层级？

Component({
    properties: {
        enable: {
            type: Boolean,
            value: false,
            observer: 'show'
        },
        priceDetail: {
            type: Object
        },
        userInfo: {
            type: Object
        }
    },
    data: {
        display: false,
        imgSrc: ''
    },
    attached () {
        const { priceDetail, userInfo } = this.properties;
        if (!priceDetail) return;
        const { title, detailList } = priceDetail; // detailList可展示多房，目前只有一个
        const { priceList, pointsInfo, totalInfo, guaranteeInfo } = detailList[0];
        guaranteeInfo?.title && (priceList.unshift(guaranteeInfo));
        this.setData({
            title,
            pointsInfo,
            totalInfo,
            priceList: this.buildPriceList(priceList),
            userInfo: this.buildUserInfo(userInfo)
        });
    },
    methods: {
        close (e) {
            this.triggerEvent('close');
        },
        showExtraInfo (e) {
            const priceList = this.data.priceList || [];
            const { idx, subidx } = e.currentTarget.dataset;
            const targetData = subidx === undefined ? priceList[+idx] : priceList[+idx]?.subList?.[+subidx];
            const { additionalInfo } = targetData;
            this.setData({
                showDialog: true,
                dialogTitle: additionalInfo.innerTitle,
                dialogContent: additionalInfo.innnerContent
            });
        },
        showPointsExtraInfo (e) {
            const { idx } = e.currentTarget.dataset;
            const pointsInfo = this.data.pointsInfo;
            const additionalInfo = idx === undefined ? pointsInfo.additionalInfo : pointsInfo.subList[+idx]?.additionalInfo;
            this.setData({
                showDialog: true,
                dialogTitle: additionalInfo.innerTitle,
                dialogContent: additionalInfo.innnerContent
            });
        },
        buildPriceList (priceList) {
            const handleAdditionalInfo = (info, contentExtra) => {
                if (info.content) {
                    info.innnerContent = info.innerContentList?.map(item => item.title);
                    contentExtra && (info.content += `，${contentExtra}`);
                }
                return info;
            };
            priceList.forEach(item => {
                item.isGuarantee = guaranteeType.includes(item.type);
                item.additionalInfo = handleAdditionalInfo(item.additionalInfo, item.amountDesc);
                item.subList?.forEach(sub => {
                    sub.additionalInfo = handleAdditionalInfo(sub.additionalInfo);
                });
            });
            return priceList;
        },
        buildUserInfo (userInfo = {}) {
            const userLevel = userInfo.baseCtripLevel || 'default';
            const IMG_URL_PATH = 'https://pic.c-ctrip.com/htlpic/rn/rnhotelreservation/';
            const speedPointsInfo = {
                level: userLevel
            };
            switch (userLevel) {
            case '10011': // 白银
                speedPointsInfo.desc = '1.2倍加速';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_silver.png`;
                break;
            case '10003': // 黄金
                speedPointsInfo.desc = '1.5倍加速';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_gold.png`;
                break;
            case '10002': // 铂金
                speedPointsInfo.desc = '1.8倍加速';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_platinum.png`;
                break;
            case '10001': // 钻石
                speedPointsInfo.desc = '2倍加速';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_diamond.png`;
                break;
            case '10010': // 金钻
                speedPointsInfo.desc = '2.5倍加速';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_goldenDiamond.png`;
                break;
            case '10008': // 黑钻
                speedPointsInfo.desc = '3倍加速';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_blackDiamond.png`;
                break;
            default:
                speedPointsInfo.desc = '会员权益';
                speedPointsInfo.iconUrl = `${IMG_URL_PATH}level_icon_normal.png`;
                break;
            }
            return speedPointsInfo;
        },
        closeDialog () {
            this.setData({
                showDialog: false
            });
        },
        noop () {

        }

    }

});
