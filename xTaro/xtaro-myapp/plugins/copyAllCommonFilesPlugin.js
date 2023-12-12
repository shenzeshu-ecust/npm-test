const fs = require("fs-extra");
const path = require("path");
const { RawSource } = require("webpack-sources");
const root = path.join(__dirname, "../");
const handlerCommonModule = require("./handlerCommonModule");
const PLUGIN_NAME = "CopyAllCommonFilesPlugin";
const correctionPath = require("./utils/correctionPath");
const getSassImport = require("./getSassImport");

class CopyAllCommonFilesPlugin {
    constructor(options) {
        this.chunkFiles = [];
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
            // afterOptimizeChunks -> optimizeModules，解决 scss 中字体文件路径获取错误问题 & 解决部分文件丢失的问题
            compilation.hooks.optimizeModules.tap(PLUGIN_NAME, modules => {
                modules.map(module => {
                    if (module.resource) {
                        const filePath = correctionPath(path.relative(root, module.resource));
                        if (!this.chunkFiles.includes(filePath)) {
                            this.chunkFiles.push(filePath);
                        }
                        // 支持buildCommonOrigin 复制依赖文件的时候 scss 内部的 @import 文件也能复制过去
                        if (/\.(sa|sc)ss$/.test(filePath)) {
                            const cssList = getSassImport(filePath);
                            if (cssList && cssList.length) {
                                cssList.forEach(cssFile => {
                                    if (!this.chunkFiles.includes(cssFile)) {
                                        this.chunkFiles.push(cssFile);
                                    }
                                });
                            }
                        }
                    }
                });
            });
            compilation.hooks.afterOptimizeAssets.tap(PLUGIN_NAME, asserts => {
                //todo? 此处修改产物，做ast解析，修改模块引用路径，如果有相对路径文件，也要放到上述目录
                // console.log("assert:",asserts);
                console.log(this.options);
                const { entryFile, outputPath } = this.options;
                const rootDir = path.dirname(entryFile);
                const taroBaseDir = path.join(rootDir, "src/taroCwx/base.js");
                const commonModulePath = path.join(outputPath, "common_module_dir");
                // console.log("asserts: ",asserts);
                const outputAssertName = "commonModule.prod.js";
                if (asserts[outputAssertName]) {
                    const realFilePath = path.join(rootDir, "commonModule.js");
                    const commonModuleProdPath = path.join(outputPath, outputAssertName);
                    const newContent = handlerCommonModule(
                        realFilePath,
                        commonModulePath,
                        commonModuleProdPath
                    );
                    asserts[outputAssertName] = new RawSource(newContent);
                }

                if (this.chunkFiles.length) {
                    this.chunkFiles.forEach(function (file) {
                        const realFilePath = path.join(rootDir, file);
                        const outputFilePath = path.join(commonModulePath, file);
                        if (file !== "commonModule.js") {
                            if (fs.existsSync(realFilePath)) {
                                fs.copySync(realFilePath, outputFilePath);
                                const realExtname = path.extname(outputFilePath);
                                if (
                                    realExtname === ".js" ||
                                    realExtname === ".jsx" ||
                                    realExtname === ".ts" ||
                                    realExtname === ".tsx"
                                ) {
                                    const newContent = handlerCommonModule(
                                        outputFilePath,
                                        commonModulePath,
                                        null,
                                        taroBaseDir
                                    );
                                    fs.writeFileSync(outputFilePath, newContent, "utf-8");
                                }
                            } else {
                                // console.error(`${realFilePath} Not Found.`);
                            }
                        } else {
                        }
                    });
                }
            });
        });
    }
}

module.exports = CopyAllCommonFilesPlugin;