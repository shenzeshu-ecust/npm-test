import cwx from '../cwx'

let initsuspiciousWords = false;

function getCheckStr(obj) {
    if (!obj) {
        return "";
    }
    if (typeof obj !== "string") {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            return "";
        }
    }
    return obj;
}

//todo? 此处需要从服务端异步更新关键词
let suspiciousWords = ["APP", "移动端", "客户端", "携程官网", "应用市场"];

function getSuspiciousWords() {
    const STORAGE_KEY = 'cwx_sensitive_words';
    let storageData = cwx.getStorageSync(STORAGE_KEY)
    if(storageData && storageData.length) {
        suspiciousWords = storageData;
    }

    cwx.configService.watch('sensitiveWords', (res) => {
        console.log('MCD 返回的 sensitiveWords: ', res);
        if(res && res.sensitiveWordsArray && res.sensitiveWordsArray.length) {
            suspiciousWords = res.sensitiveWordsArray;
            cwx.setStorage({
                key: STORAGE_KEY,
                data: suspiciousWords
            })
            cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtMetric({
                name: 'wxapp_checkSensitive_mcd_res', //申请生成的Metric KEY
                tag: { "suspiciousWords": JSON.stringify(suspiciousWords) }, //自定义Tag
                value: 1 //number 值只能是数字
            });
        }
    })
}

//可以话术
const checkSuspicious = function (obj) {
    const appReg = /[\u4E00-\u9FA5]\s*(APP$|APP[^a-zA-Z])/i;
    let checkStr = getCheckStr(obj);
    let suspiciousWord;
    suspiciousWords.forEach(function (item) {
        let index = checkStr.indexOf(item);
        let isSuspicious = index !== -1;
        if (item.toUpperCase() === "APP") { //包含APP时 要判断是否在中文话术中
            isSuspicious = appReg.test(checkStr);
            let matchRes = checkStr.match(appReg);
            if(matchRes && matchRes.index) {
                index = matchRes.index;
            }
        }
        if (isSuspicious) {
            if (index < 15) {
                index = 15;
            }
            suspiciousWord = checkStr.slice(index - 15, index + item.length + 15); //记录前后30个字符
        }
    });

    return suspiciousWord;
}
export default function sensitiveWordsWrapper(opts) {
    if(!initsuspiciousWords) {
        initsuspiciousWords = true;
        getSuspiciousWords();
    }
    if (!opts || (!opts.success && !opts.fail && !opts.complete)) {
        return opts
    }
    //todo? 此处需要将错误信息结构跟微信的结构一致
    const errorMessage = {
        errMsg: "response contains suspiciou words:",
        statusCode: -1
    };
    const successCallback = opts["success"];
    opts["success"] = function (res) {
        let suspiciousWord = checkSuspicious(res);
        if (suspiciousWord) {
            //记录可疑的关键词
            //todo?记录埋点，不阻止页面逻辑
            errorMessage.errMsg += ` ${suspiciousWord}`;
            const pages = getCurrentPages();
            let currentPagePath, prePagePath;
            if (pages && pages.length) {
                currentPagePath = pages[pages.length - 1] && pages[pages.length - 1].route || ''
                if (pages.length > 1) {
                    prePagePath = pages[pages.length - 2] && pages[pages.length - 2].route || ''
                }
            }
            console.error(errorMessage.errMsg);
            
			cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtTrace("wxapp_checkSensitive_checkSuspicious_result", {
                "currentPagePath": currentPagePath,
                "prePagePath": prePagePath,
                "requestUrl": opts.url,
                "suspiciousWord": suspiciousWord
			});
        }
        successCallback && successCallback(res);
    }
    return opts;
}
