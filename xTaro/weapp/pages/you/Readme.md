### 项目信息
- AppID: wx0e6ed4f51db9d078
- request合法域名: https://m.ctrip.com https://mm.ctrip.com
- [pages/you 代码仓库](http://git.dev.sh.ctripcorp.com/tinyapp/weixin-pages-you)


### 代码规范
- IDE请使用 webstorm, sublime, atom. 另使用 sublime, atom 开发前, 请安装 editorconfig 插件
- 文件/文件夹名称均使用首字母小写的驼峰式
- 所有icon资源使用icon font实现
- className使用中划线连接
- js中的字符串使用单引号封装
- wxml中的属性值使用双引号封装
- wxml中的for循环必须设置wx:key
- 使用let或const代替var定义变量. 代码中做到: **no var**!
- 函数定义使用箭头函数, 方法定义使用es6语法. 代码中做到: **no bind, no function, no that/self**!
- 样式中的单位统一使用rpx, 勿使用px. 代码中做到: **no px**!
- 页面代码分成 : 生命周期函数, 事件处理函数, 业务方法  三个函数簇. 禁止在代码中直接调用 生命周期函数 和 事件处理函数. 如果需要复用请把逻辑提炼到业务方法中


### 页面列表
攻略:
    /pages/you/searchcity_v2/
    /pages/you/searchcity/
    /pages/you/poidestination/
    /pages/you/destinationpage/
    /pages/you/webview/
笔记:
    /pages/you/lvpai/detail/
    /pages/you/lvpai/upload/
    /pages/you/lvpai/webview/

直播:
    /pages/you/place/webcast/home


    
### 内嵌h5页面
	"https://m.ctrip.com/webapp/you/livestream/paipai/home.html?isMini=2&isHideHeader=true&isHideNavBar=YES&autoawaken=close&popup=close" => 频道首页
	"https://m.ctrip.com/webapp/you/livestream/paipai/operateTopic.html?isMini=2&ishideheader=yes&isHideNavBar=YES&Id=***" => 运营话题页
	"https://m.ctrip.com/webapp/you/user?isMini=2&autoawaken=close&popup=close&ishideheader=yes&clientAuth=" =>个人主页


### 开发与发布

bundle： master分支可自动构建， 从master分支拉出 dev_s**_** (迭代版本 + 发布日期）
mcd地址：http://mcd.release.ctripcorp.com/mcd/index.html#/nativeBuildBundle?appId=5003&platform=Wechat&version=1.1.52&projectId=540&bundleId=12254


### 开发细节
- 强制修改环境： cwx/ext/global.js,89行 return 处
- 查看埋点，需打开开关：cwx/cpage/config.js  ubtDebug: true  


### 参考文档 && 资料
- [小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [cwx文档](http://conf.ctripcorp.com/pages/viewpage.action?pageId=113380463)
- [webview跳转](http://conf.ctripcorp.com/pages/viewpage.action?pageId=153998999)
- [aid/sid规则](http://conf.ctripcorp.com/pages/viewpage.action?pageId=141300506	)

