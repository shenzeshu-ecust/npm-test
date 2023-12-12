# New NodeJS Starter #

## 开发

	这是一个新应用模板，app.js为入口文件可供参考。由于发布系统发布时会进行健康检查，请确认在发布系统配置的健康检查路由(如：/slbhealthcheck.html)已在应用中支持，否则应用会无法发布成功。

## 配置

    配置文件为app.config.js。必须的配置 `AppID` 和 `Env`,其他动态配置可通过 `qconfig` 获取。注：该配置仅和应用运行相关。

## 生命周期

    可参考app.js 中 `willReady` 部分,将需要全局初始化的组件或其他需要在点火前完成的任务放在点火前完成。

## 发布

   [Nodejs应用发布](http://conf.ctripcorp.com/pages/viewpage.action?pageId=443939681)

## 监控

	为方便应用排障和性能监控，建议可以加入cat/clogging/metric/es等监控模块。

## 文档参考
   [开发传统应用](https://nodejs.fx.ctripcorp.com/docs/tutorial/common/guides/intro)

   [开发部署应用](http://pages.release.ctripcorp.com/fx-front-end/node-vampire-books/deployApp/workflow.html)

   [测试用例规范参考](http://git.dev.sh.ctripcorp.com/fx-front-end/node-ut-demo)

## Command Line ##

- npm run dev
	- run app.js
- npm run test:local;
	- nyc --clean mocha --exit test/*.spec.js --timeout 30000 && nyc report --reporter=html
- npm run test
	- mocha --exit test/*.spec.js --timeout 30000

## Config ##

-  package.json
	-  AppID
	-  Env
	-  config.port


