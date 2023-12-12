/**
 * 首晚房费特殊处理。暂未接入
 * plusType: 1使用加号选择；0使用对勾。
 * unitUseNights：1单位为a晚b间；0单位为b间。
 */
export const MEMBER_POINTS_fIRST_ROOM_CHARGE = 5;
export const MEMBER_POINTS_PART_FREE_FEE = 6;
export const MEMBER_POINTS_FREE_CANCEL = 2;
export const mpConfig = {
    mp1: {
        title: '早餐',
        plusType: 1
    },
    mp2: {
        title: '免费取消',
        plusType: 0,
        unitUseNights: 1
    },
    mp3: {
        title: '延迟退房',
        plusType: 0,
        unitUseNights: 0
    },
    mp4: {
        title: '房型升级',
        plusType: 0,
        unitUseNights: 1
    },
    mp6: {
        title: '房费立减',
        plusType: 0
    },
    mp7: {
        title: '欢迎水果',
        plusType: 0,
        unitUseNights: 0
    },
    mp8: {
        title: '提前入住',
        plusType: 0,
        unitUseNights: 0
    },
    mp999: {
        title: '会员专属通道',
        staticTitle: '本单可享',
        desc: '携程会员优先办理入住'
    }
};
