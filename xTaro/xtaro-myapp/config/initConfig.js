const path = require("path");
const fs = require("fs");
const appConfigPath = path.join(__dirname, "../src/app.config.ts")
const appJsonPath = path.join(__dirname, "../app.json")
const taroAppBaseInfo = path.join(__dirname, "../taroAppBaseInfo.js")

function initConfig() {
    let appJSON;
    if (fs.existsSync(appJsonPath)) {
        appJSON = require(appJsonPath);
    } else if (fs.existsSync(appConfigPath)) {
        appJSON = require(appConfigPath);
    } else {
        throw new Error("No Config Found!");
    }
    const pages = appJSON.pages || [];
    const subPackages = appJSON.subPackages || [];
    const chunkInfo = {
        pages,
        subPackages
    };
    return chunkInfo;
}

function combineExtendsConfig() {
    const eConfig = {
        alias: {},
        externals: [],
        babelConfig: {
            plugins: []
        },
        copy: {
            patterns: []
        }
    };
    const files = fs.readdirSync(__dirname);
    files.forEach(function (fileName) {
        const filePath = path.join(__dirname, fileName);
        const stat = fs.statSync(filePath);
        const match = fileName.match(/(\S*)extends\.js/);
        if (!stat.isDirectory() && match) {
            const {alias = {}, externals = [], babelConfig = {}, copy = {}} = require(filePath);
            //externals 无法判断直接添加
            eConfig.externals = [].concat(eConfig.externals, externals);
            //检查alias是否重名
            Object.keys(alias).forEach(function (key) {
                if (eConfig[key]) {
                    //已经添加过
                    throw new Error(`bundle:${match[1]}Alias ${key} Already Exists. `);
                } else {
                    eConfig.alias[key] = alias[key]
                }
            });
            // 读取 babelConfig 里的 plugins 配置，合并
            if (babelConfig && babelConfig.plugins && babelConfig.plugins.length) {
                // todo??? 是否需要判断使用的 plugins 重复的情况？是否需要合并配置？
                eConfig.babelConfig.plugins = [].concat(eConfig.babelConfig.plugins, babelConfig.plugins);
            }
            if (copy && copy.patterns && copy.patterns.length) {
                // 校验 patterns 的路径前缀，from 必须是 src/pages/xxx, to 必须是 ${outputPath}/pages/xxx
                copy.patterns.forEach(function (p) {
                    const { from = "", to = "" } = p;
                    
                    const isValidFrom = from.match(/^src\/pages\/[^\/]+\//);
                    const isValidTo = to.match(new RegExp(`^pages\/[^\/]+\/`))
                    if (!isValidFrom || !isValidTo) {
                        throw new Error(`copy.patterns ${!isValidFrom ? "from:" + from : "to:" + to} is invalid, Please check ${match[1]}extends.js!!!`);
                    }
                })
                eConfig.copy.patterns = [].concat(eConfig.copy.patterns, copy.patterns);
            }
        }
    });
    return eConfig;
}


function getTaroAppBaseInfo() {
  if (!fs.existsSync(taroAppBaseInfo)) {
    return {};
  }
  try {
    return require(taroAppBaseInfo);
  } catch (e) {
    return {};
  }
}

function getOutputInfo () {
    return {
        outputRoot: `dist/${process.env.TARO_ENV}`
    }
}

//todo？此处要提供合并多个taro项目的app.config.js到主taro项目，另外还要提供package.json中 dependancy的合并


module.exports = {...initConfig(), ...combineExtendsConfig(), ...getTaroAppBaseInfo(), ...getOutputInfo()};
