const fs = require('fs-extra')
const path = require('path')
const beautify = require("json-beautify")
const isInPipeline = require("./isInPipeline");
const getMiniAppPath = require("./utils/getMiniAppPath");
const isEqualRoot = require("./utils/isEqualRoot");

export default (ctx, options = {}) => {
  const ctxOptions = ctx.runOpts.options || ctx.runOpts;
  const miniType = ctxOptions.platform;
  console.log("ctxOptions----", ctxOptions);
  if(miniType === "h5"){
    //todo? H5 暂时不处理产物
    return;
  }
  ctx.onBuildFinish(() => {
    const taroConfig = options.taroConfig;
    if (!ctxOptions.blended) return
    console.log('编译结束！')
    const rootPath = process.cwd();

    let {miniappPath, releasePath,} = getMiniAppPath(rootPath, miniType,options.miniAppPath);
    const outputPath = path.resolve(__dirname, `../${ctx.ctx.initialConfig.outputRoot}`)
    const taroBasePath = path.join(miniappPath, 'taroBase')
    let releaseTaroBasePath = path.join(releasePath, "taroBase")
    if (isInPipeline) {
      if (fs.existsSync(releasePath)) {
        fs.removeSync(releasePath)
      }
      fs.mkdirSync(releasePath);
      fs.mkdirSync(releaseTaroBasePath);
    } else {
      releasePath = null;
      if (fs.existsSync(taroBasePath)) {
        fs.removeSync(taroBasePath)
      }
      fs.mkdirSync(taroBasePath);
    }
    const files = fs.readdirSync(outputPath);
    //compatibility taro bug
    const mainPagePath = path.join(outputPath, "pages/mainPage");
    if (fs.existsSync(mainPagePath)) {
      console.log("remove MainPage :", mainPagePath);
      fs.removeSync(mainPagePath)
    }

    // 在 moveRes 里读取 taroConfig 并做处理
    // 读取 copyPatterns, 主动拷贝过来
    const copyPatterns = options && options.taroConfig && options.taroConfig.copy && options.taroConfig.copy.patterns || [];
    copyPatterns.forEach(function (cp) {
      const { from, to } = cp;
      const fromPath = path.join(__dirname, `../${from}`)
      const toPath = path.join(releasePath || miniappPath, to)
      // console.log("--- fromPath:", fromPath)
      // console.log("--- toPath:", toPath)
      
      if (fs.existsSync(fromPath)) {
        fs.copySync(fromPath, toPath)
      } else {
        throw new Error(`${from} is not exist!!!`)
      }
    })

    files.forEach(function (fileName) {
      const filePath = path.join(outputPath, fileName);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if(fileName === "prebundle"){
          const taroBasePrebundlePath = path.join(taroBasePath, fileName);
          if (fs.existsSync(taroBasePrebundlePath)) {
            fs.removeSync(taroBasePrebundlePath)
          }
          fs.mkdirSync(taroBasePrebundlePath);
          fs.copySync(filePath, taroBasePrebundlePath)
        }else{
          if (!isInPipeline) {
            fs.copySync(filePath, path.join(miniappPath, fileName))
          }
          if (releasePath) {
            fs.copySync(filePath, path.join(releasePath, fileName))
          }
        }
      } else {
        if (!isInPipeline) {
          fs.copyFileSync(filePath, path.join(taroBasePath, fileName))
        }
        if (releasePath) {
          // console.log('======', fileName);
          // isInPipeline 为 true 才需要过滤文件
          if(isInPipeline && ['app.wxss', 'project.config.json', 'taro.wxss'].includes(fileName)) {
            // console.log('过滤了：', fileName);
            return;
          }
          fs.copyFileSync(filePath, path.join(releaseTaroBasePath, fileName))
        }
      }
    })
    //todo?做个dev兼容
    if(process.env.NODE_ENV === 'development'){
      const customWrapperPath = path.join(outputPath,"custom-wrapper.js");
      if(!fs.existsSync(customWrapperPath)){
        //将空壳子拷贝过去
        const customWrapperTmpPath = path.join(__dirname,`../plugins/customWrapper/${process.env.TARO_ENV}`);
        fs.copySync(customWrapperTmpPath, path.join(taroBasePath))
      }
    }
    let {pages = [], subPackages = []} = taroConfig;
    //删除pages/mainPage/index 小程序配置文件
    pages = pages.filter(function (item) {
      return item !== "pages/mainPage/index";
    });
    if (pages.length === 1 && pages[0] === "") {
      pages = [];
    }
    taroConfig.pages = pages;
    if (!isInPipeline) {
      //将taroConfig中的pages信息合并到小程序的app.json中
      const appJSONPath = path.join(miniappPath, "app.json");
      let appJSON = require(appJSONPath)
      pages.forEach(function (item) {
        if (appJSON.pages.indexOf(item) === -1) {
          appJSON.pages.push(item); //此处 后面需要删除，不可以直接往pages下塞文件
        }
      });
      subPackages.forEach(function (item) {
        let needAdd = true;
        for (let i = 0, a = appJSON.subPackages; i < a.length; i++) {
          if (isEqualRoot(item.root, a[i].root)) { //如果app.json中有当前root,直接替换
            needAdd = false;
            item.pages.forEach(function (sPage) {
              if (!a[i].pages.includes(sPage)) {
                a[i].pages.push(sPage);
              } else {
                console.log(`Page Already Exist in Main AppJSON,Root:${item.root},Page:${sPage}`);
              }
            });
            // a[i] = item;
            break;
          }
        }
        if (needAdd) {
          appJSON.subPackages.push(item);
        }
      });
      fs.writeFileSync(appJSONPath, beautify(appJSON, null, 2, 100));
    }
    if (releasePath) {
      fs.writeFileSync(path.join(releasePath, "taroBase/app.json"), beautify(taroConfig, null, 2, 100));
    }
    //todo? 建议写死，处理miniapp/app.js 加载taroBase的处理，或者在微信小程序编译时处理
    console.log('拷贝结束！')
  })
}
