import { cwx } from "../../../../../cwx/cwx"
import util from '../../util'

export default {
    data: {},
    methods: {
        hideNoticeBackDrop() {
            const newNoticeInfoList = this.data.noticeInfoList.map(item => {
                const res = {...item}
                res.ShowOverflowLine = res.IsOverflowLine
                if (res.IsTransfer) {
                    res.transferTipsList.forEach(tItem=> tItem.ShowOverflowLine = tItem.IsOverflowLine )
                }
                return res
            }) // 初始化展开逻辑
            console.log(newNoticeInfoList,'newNoticeInfoList');
            this.setData({
                showType: '',
                activeIndex: 0,
                scrollView: 'noticeBox0',
                noticeInfoList: newNoticeInfoList
            })
        },
        onClickShowOverflowLine(e) {
            const index = e?.currentTarget?.dataset['cindex'];
            const subindex = e?.currentTarget?.dataset['subindex'] || 0;
            const temp = this.data.noticeInfoList[index] || {}
            if (temp.LeavePolicy || temp.ComePolicy) {
                temp.ShowOverflowLine = false
            } else if (temp.IsTransfer) {
                temp.transferTipsList[subindex].ShowOverflowLine = false
            }

            this.setData({
                noticeInfoList: this.data.noticeInfoList,
            })
            this.setNoticeHeight()
        },
        setNoticeHeight() {
            setTimeout(async () => {
                const noticeDomHeightList = await util.getRectDomHeight('.noticeBox')
                const noticeBoxHeightList = []
                let sum = 0;
                for (let i = 0; i < noticeDomHeightList.length; i++) {
                    sum = sum + noticeDomHeightList[i];
                    noticeBoxHeightList.push(sum)
                }
                this.setData({
                    noticeBoxHeightList,
                })
            }, 1000);
        },
        onClickNoticeTab(e) {
            const index = e?.target?.dataset['index']
            this.setData({
                scrollView: `noticeBox${index}`,
                activeIndex: index
            })
        },
        scrollMoveNotice(e) {
            let { scrollTop } = e.detail
            for (let i = 0; i < this.data.noticeBoxHeightList?.length; i++) {
                if (scrollTop < this.data.noticeBoxHeightList[i] *2 /3) {
                    this.setData({
                        activeIndex: i
                    })
                    return
                }
            }
        },
        jumpMoreUrl() {
            if(this.noticeMoreUrl) {
                this.navigateTo({
                    url: '../webview/webview',
                    data: {
                        url: this.noticeMoreUrl,
                    },
                })
            }
        },
        async toNoticePage() {
            const zhongzhuanTrainInfo = this.data.trainInfo
            if (zhongzhuanTrainInfo) {
                this.setData({
                    hkticket: zhongzhuanTrainInfo.TrainTransferInfos[0].DepartStation.includes('香港') || zhongzhuanTrainInfo.TrainTransferInfos[1].ArriveStation.includes('香港'),
                })
            }

            this.setData({
                showType: 'noticeModalShow'
            })

            util.ubtFuxiTrace(zhongzhuanTrainInfo ? '225061' : '225037', { PageId: this.pageId })
            if (!this.data.firstNoticeDialog) {
                const overflowLineHeightList = await util.calcOverflowStatus('.noticeContentBox')
                const noticeInfoAfterCalcuList = this.data.noticeInfoList
                let i = 0
                noticeInfoAfterCalcuList.forEach((item, index) => {
                    if (item.tipList) {
                        i++;
                        return
                    }
                    if (item.LeavePolicy) {
                        item.IsOverflowLine = this.isOverflowLine(overflowLineHeightList[0][index - i].height)
                        item.ShowOverflowLine = item.IsOverflowLine
                    }
                    if (item.ComePolicy && (!zhongzhuanTrainInfo || index >= i)) {
                        item.IsOverflowLine = this.isOverflowLine(overflowLineHeightList[0][index - i].height)
                        item.ShowOverflowLine = item.IsOverflowLine
                    }
                    if (item.IsTransfer && item.transferTipsList) {
                        item.transferTipsList.forEach((transferTip, tIndex) => {
                            console.log(overflowLineHeightList[0][tIndex + i], tIndex,'tIndex');
                            transferTip.IsOverflowLine = this.isOverflowLine(overflowLineHeightList[0][tIndex + i].height)
                            transferTip.ShowOverflowLine = transferTip.IsOverflowLine
                            i++;
                        })
                    }
                })
                this.setData({
                    noticeInfoList: noticeInfoAfterCalcuList,
                    firstNoticeDialog: true
                })
            }
           this.setNoticeHeight()
        },
    }

}
