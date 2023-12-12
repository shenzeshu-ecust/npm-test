module.exports = {
    // // 启动文件
    setupFiles: [
      './.test/wx.js'
    ],
    coverageReporters: ["clover", "json-summary", "lcov"],
    moduleNameMapper: {
      ".*cwx": "wx"
    },
    moduleDirectories: [
      ".",
      ".test",
      "node_modules"
    ],
    "testEnvironment": "jsdom",
    // 是否收集测试覆盖率
    collectCoverage: false,
    // 配置 jest-snapshot-plugin 从而在使用 jest 的 snapshot 功能时获得更加适合肉眼阅读的结构
    "snapshotSerializers": ["miniprogram-simulate/jest-snapshot-plugin"]
  }