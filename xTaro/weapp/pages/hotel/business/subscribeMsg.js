const STATE = {
    ACCEPT: 'accept', // 用户同意订阅
    REJECT: 'reject', // 用户拒绝订阅
    BAN: 'ban' // 已被后台封禁
};

const wxSubscribeMsg = (templateIds = []) => {
    return new Promise((resolve) => {
        wx.requestSubscribeMessage({
            tmplIds: templateIds,
            success (res) {
                // console.log('wxSubscribeMsg-success', res);
                resolve({
                    ...res,
                    success: res.errMsg === 'requestSubscribeMessage:ok',
                    ...STATE
                });
            },
            fail (res) {
                // console.log('wxSubscribeMsg-fail', res);
                resolve(res);
            }
        });
    });
};

export {
    wxSubscribeMsg
};
