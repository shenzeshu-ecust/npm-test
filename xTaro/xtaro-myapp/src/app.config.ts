//必须使用node端可以运行的语法！！！！
module.exports = {
  pages: [
    "pages/mainPage/index",
  ],
  subPackages: [
    {
      "root": "pages/xtaro-myapp",
      "pages": [
        "index",
        "subPackages/foo/index",
        "subPackages/bar/index"
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
}
