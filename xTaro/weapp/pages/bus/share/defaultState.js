import { cwx } from '../index';
const activity = {
    activityId: 2037,
    status: 1,
    title: '再邀请2位好友免费得安心退保障',
    leftTime: 21591,
    assistList: [
        {
            name: '携程用户',
            imageUrl:
                'https://dimg.uat.qa.nt.ctripcorp.com/images/t1/headphoto/164/424/952/04eab99bd26f47acadef4fd3f95b9f37_C_100_100.jpg',
        },
    ],
    maxNum: 2,

    rewardList: [
        {
            title: '携程红包',
            subTitle: '最高可得688元',
            imageUrl:
                'https://pages.c-ctrip.com/bus-images/order-axtrefund/reward-redbag.png',
        },
        {
            title: '携程立减券',
            subTitle: '汽车票专属',
            imageUrl:
                'https://pages.c-ctrip.com/bus-images/order-axtrefund/reward-coupon.png',
        },
    ],
    subscribeList: [
        {
            code: '410382',
            templateId: 'BRzPWkkhV7XeWUULogfYvTo_ai9SsV3oZrJOQ5H0Oi4',
        },
        {
            code: '410383',
            templateId: 'kVWeSJZEoEQr5gbUyeh-gMfDDhivyuH4GiVBCtBBsc0',
        },
    ],
    activityOwner: false,
    activityContent: '长按二维码，{添加福利官}为好友助力',
    imageUrl:
        'https://pages.c-ctrip.com/bus-images/order-axtrefund/share-image.png',
    wechatUrl:
        'https://wework.qpic.cn/wwpic/208690_IhGzq9g6R3iqQLD_1657669082/0',
    activityRule: '',
};

export default activity;

let shareSceneId = [
    1007, 1008, 1010, 1011, 1012, 1013, 1025, 1036, 1045, 1046, 1047, 1048,
    1049, 1058, 1096, 1154,
];
export function changeOwner() {
    let asActivity = { ...activity };

    if (cwx.scene) {
        try {
            let sceneId = parseInt(cwx.scene);
            let index = shareSceneId.indexOf(sceneId);
            if (index == -1) {
                asActivity.activityOwner = true;
            }
        } catch (e) {}
    }

    return asActivity;
}

export function changeEnter() {
    let newActivity = { ...activity };
    newActivity.isIn = true;
    return newActivity;
}
