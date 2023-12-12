export default function getInsuranceClause(insurance, bizType = 'bus') {
    if (bizType === 'ship') {
        return {
            insuranceNotice: {
                title: '投保须知',
                key: 'insuranceNotice',
                url: insurance.descUrl,
            },
            disclaimer: {
                title: '免责说明',
                key: 'disclaimer',
                url: 'https://pages.c-ctrip.com/bus-resource/SHIP_insurance/insuranceclause/%E5%85%8D%E8%B4%A3%E8%AF%B4%E6%98%8E.html',
            },
            insurancePolicy: {
                title: '保险条款',
                key: 'insurancePolicy',
                url: 'https://pages.c-ctrip.com/bus-resource/SHIP_insurance/insuranceclause/%E4%BF%9D%E9%99%A9%E6%9D%A1%E6%AC%BE.html',
            },
            insuranrantAgreeNote: {
                title: '被保险人同意声明',
                key: 'insuranrantAgreeNote',
                url: 'https://pages.c-ctrip.com/bus-resource/SHIP_insurance/Customer-notification/%E8%A2%AB%E4%BF%9D%E9%99%A9%E4%BA%BA%E5%90%8C%E6%84%8F%E5%A3%B0%E6%98%8E.pdf',
            },
            privacyPolicy: {
                title: '个人信息保护政策',
                key: 'privacyPolicy',
                url: 'https://pages.c-ctrip.com/bus-resource/SHIP_insurance/Customer-notification/%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.pdf',
            },
            userNotification: {
                title: '客户告知书',
                url: 'https://pages.c-ctrip.com/bus-resource/SHIP_insurance/Customer-notification/%E5%AE%A2%E6%88%B7%E5%91%8A%E7%9F%A5%E4%B9%A6.pdf',
                key: 'userNotification',
            },
        };
    }
    var title = insurance.title;
    var isBaseInsurance = title.indexOf('基础') > -1;
    return {
        insuranceNotice: {
            title: '投保须知',
            key: 'insuranceNotice',
            url: insurance.descUrl,
        },
        disclaimer: {
            title: '免责说明',
            key: 'disclaimer',
            url: isBaseInsurance
                ? 'https://pages.c-ctrip.com/bus-images/busapp/%E6%B3%B0%E5%BA%B7.html'
                : 'https://pages.c-ctrip.com/bus-images/busapp/%E5%85%8D%E8%B4%A3%E8%AF%B4%E6%98%8E.html',
        },
        insurancePolicy: {
            title: '保险条款',
            key: 'insurancePolicy',
            url: isBaseInsurance
                ? 'https://pages.c-ctrip.com/bus-images/busapp/%E6%B3%B0%E5%BA%B7%E6%9D%A1%E6%AC%BE.html'
                : 'https://pages.c-ctrip.com/bus-images/busapp/%E4%BC%97%E5%AE%89%E4%BF%9D%E9%99%A9%E6%9D%A1%E6%AC%BE.html',
        },
        insuranrantAgreeNote: {
            title: '被保险人同意声明',
            key: 'insuranrantAgreeNote',
            url: 'https://pages.c-ctrip.com/bus-images/busapp/%E8%A2%AB%E4%BF%9D%E9%99%A9%E4%BA%BA%E5%90%8C%E6%84%8F%E5%A3%B0%E6%98%8E.html',
        },
        privacyPolicy: {
            title: '个人信息保护政策',
            key: 'privacyPolicy',
            url: 'https://pages.c-ctrip.com/bus-images/busapp/%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.html',
        },
        userNotification: {
            title: '客户告知书',
            url: 'https://pages.c-ctrip.com/bus-images/busapp/%E5%AE%A2%E6%88%B7%E5%91%8A%E7%9F%A5%E4%B9%A6.pdf',
            key: 'userNotification',
        },
    };
}
