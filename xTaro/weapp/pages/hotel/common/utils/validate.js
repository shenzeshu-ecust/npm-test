export default {
    isIdCard (idCard) {
        const cardReg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^((1[1-5])|(2[1-3])|(3[1-7])|(4[1-6])|(5[0-4])|(6[1-5])|71|(8[12])|91)\d{4}(((19|20)\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|((19|20)\d{2}(0[13578]|1[02])31)|((19|20)\d{2}02(0[1-9]|1\d|2[0-8]))|((19|20)([13579][26]|[2468][048]|0[48])0229))((\d{4})|\d{3}[Xx])$)$/;
        return cardReg.test(idCard);
    },
    isAlphanumericStr (val) {
        return /^[a-zA-Z\d]+$/.test(val);
    },
    isEmail (val) {
        return /^\w+([-.]\w+)*\@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val);
    },
    isPhone (phoneNum, ccode) {
        const isChinaPhone = ccode === '86';
        return isChinaPhone
            ? /^1\d{10}$/.test(phoneNum)
            : /^\d+$/.test(phoneNum) && (ccode + phoneNum).length <= 18;
    },
    isChinese (val) {
        return /^[\u4E00-\u9FA5\uF900-\uFA2D]+$/.test(val);
    },
    isEnglish (val) {
        return /^[A-Za-z\/\s\-\.]+$/.test(val);
    },
    isEnglishName (val) {
        return /^[A-Za-z\s\-\.]+\/[A-Za-z\s\-\.]+$/.test(val);
    }
};
