// import { login12306Action } from "./service/12306"
import { TrainBookStore } from "./store"
import { notifyStartUpModel } from './model'


let AccountInfo = {
    hasInited : false,//是否初始化过
    accountState : 'NoInit',//NoInit 未初始化过  //Initing 初始化中  //Success 初始化成功 //Fail:初始化失败
    needMessageVerify: false,//需要短信解封
    needFaceVerify: false,//需要人脸解封
}
export function init12306Account(){
    if (AccountInfo.accountState != "NoInit"){
        //只初始化一次
        return
    }
    AccountInfo.accountState = 'Initing'
    let _accountInfo = TrainBookStore.getAttr("bind12306")
    AccountInfo.accountState = _accountInfo?.name ? 'SUCCESS' : 'Fail'
    AccountInfo.account12306 = _accountInfo?.name || ''
    AccountInfo.name = _accountInfo?.name || ''
    AccountInfo.displayName = _accountInfo?.displayName || ''
    if (_accountInfo?.pwd) {
        const {pwd, newAccountInfo} = _accountInfo
        TrainBookStore.setAttr("bind12306", newAccountInfo)
    }

    if (_accountInfo?.name) {
        notifyStartUpModel({UserName: _accountInfo.name, Channel: "WX"}, res => {
            if (!res.RetCode === 1) {
                console.log(`notifyStartUp fail: ${res.RetMessage}`)
            }
        })
    }

    // if (!_accountInfo || !_accountInfo.pwd){
    //     AccountInfo.accountState = 'Fail'
    //     AccountInfo.account12306 = _accountInfo?.name || ''

    //     return
    // }
    // login12306Action({
    //     UserName:_accountInfo.name,
    //     Password:_accountInfo.pwd,
    // }).then(res =>{
    //     //成功
    //     AccountInfo.accountState = 'SUCCESS'
    //     AccountInfo.account12306 = _accountInfo.name
    //     AccountInfo.password12306 = _accountInfo.pwd
    //     AccountInfo.memberStatus = res.MemberStatus || '-1'//会员状态
    //     AccountInfo.realName = res.RealName//真实姓名
    // }).catch(e => {
    //     //0登录成功  ；3正在处理中；4登录失败；5夜间系统维护中，6=用户名或密码错误；7=需短信核验；8=刷脸
    //     if (e.failCode == 6){
    //         //账号密码错误  清掉密码
    //         _accountInfo.pwd = ''
    //     }
    //     AccountInfo.accountState = 'Fail'
    //     AccountInfo.account12306 = _accountInfo?.name || ''
    //     AccountInfo.needMessageVerify = e.failCode == 7
    //     AccountInfo.needFaceVerify = e.failCode == 8
    // })
}

//获取账号初始化后的信息
export function getAccount12306Info(){
    return new Promise((resolve) => {
        const check = ()=>{
            if (AccountInfo.accountState == 'NoInit'){
                init12306Account()
                setTimeout(()=>{
                    check()
                },1000)

                return
            }
            if (AccountInfo.accountState == 'Initing'){
                console.error('InitingInitingInitingInitingIniting')
                setTimeout(()=>{
                    check()
                },500)
            } else {
                resolve(AccountInfo)
            }
        }
        check()
    })
}

export function onLogin12306Success(accountInfo){
    if (accountInfo && accountInfo.userName){
        AccountInfo.accountState = 'SUCCESS'
        AccountInfo.displayName = accountInfo.displayName
        AccountInfo.name = accountInfo.userName
        AccountInfo.pwd = accountInfo.loginPw
    }
}
