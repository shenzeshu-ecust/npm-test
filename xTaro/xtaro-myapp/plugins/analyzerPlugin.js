const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "../");
const defaultBase = require("./analyzer/default.json");
const resultFile = path.join(__dirname, "./analyzer/analyzer.json");
const PLUGIN_NAME = 'MiniSplitChunkPlugin';
const correctionPath = require("./utils/correctionPath");

class AnalyzerPlugin {
  constructor() {
    this.chunFiles = {}
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.afterOptimizeChunks.tap(PLUGIN_NAME, (chunks) => {
        chunks.forEach((chunk) => {
          const modules = Array.from(chunk.modulesIterable);
          modules.map((module) => {
            if (module.resource || module._identifier) {
              const filePath = correctionPath(path.relative(root, module.resource || module._identifier));
              if (!this.chunFiles[chunk.name]) {
                this.chunFiles[chunk.name] = [];
              }
              if (!this.chunFiles[chunk.name].includes(filePath)) {
                this.chunFiles[chunk.name].push(filePath)
              }
            }
          })
        });
      });
    })

    compiler.hooks.afterEmit.tap(PLUGIN_NAME, (compilation) => {
      // console.log(compilation)
      const compareFile = {};
      const notCommonFile = [];
      const defaultKeys = Object.keys(defaultBase);
      const excludeFileArr = ["node_modules/@tarojs", "node_modules/webpack", "node_modules/@babel", "node_modules/react", "node_modules/preact"];
      defaultKeys.forEach((key) => {
        const fileArr = this.chunFiles[key] || [];
        fileArr.forEach((file) => {
          if (!defaultBase[key].includes(file) && file.indexOf("css-loader") === -1) {
            if (!compareFile[key]) {
              compareFile[key] = [];
            }
            compareFile[key].push(file);
            let isNotCommon = true;
            excludeFileArr.forEach((prefix) => {
              if (file.indexOf(prefix) !== -1) {
                isNotCommon = false;
              }
            })
            if (isNotCommon) {
              notCommonFile.push(file);
            }
          }
        })
      })
      const cKeys = Object.keys(compareFile);
      if (cKeys.length) {
        console.error("Files to Base:", compareFile);
        if (notCommonFile.length) {
          console.error("notCommonFile: ", notCommonFile)
          // 添加标记 addToCommon . cross-env IGNOREERROR=addToCommon
          const tips = "Files Add To Common. Please see http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=1881 引用公共模块一节 for more details";
          if (process.env.IGNOREERROR === "addToCommon" || process.env.NODE_ENV === 'development') {
            console.warn(tips);
            return;
          }
          throw Error(tips);
        }
      }

      fs.writeFileSync(resultFile, JSON.stringify(this.chunFiles), "utf-8")
    })

  }
}

module.exports = AnalyzerPlugin;
